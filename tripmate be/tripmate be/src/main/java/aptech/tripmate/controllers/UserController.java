package aptech.tripmate.controllers;

import aptech.tripmate.DTO.LoginRequest;
import aptech.tripmate.DTO.RegisterRequest;
import aptech.tripmate.DTO.ResetPasswordRequest;
import aptech.tripmate.DTO.UserDTO;
import aptech.tripmate.DTO.UserMeDTO;
import aptech.tripmate.jwt.JwtUtil;
import aptech.tripmate.models.User;
import aptech.tripmate.repositories.UserRepository;
import aptech.tripmate.services.LoginAttemptService;
import aptech.tripmate.services.MailService;
import aptech.tripmate.services.OtpService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.Console;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// ... các import giữ nguyên
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final LoginAttemptService loginAttemptService;
    private final MailService mailService;

    private boolean isValidPassword(String password) {
        return password.length() >= 6 &&
                password.matches(".*[A-Za-z].*") &&
                password.matches(".*\\d.*");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        if (email == null) {
            return ResponseEntity.status(401).body("Invalid token");
        }
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }
        User user = userOpt.get();

        UserMeDTO dto = new UserMeDTO(
                user.getUserId(),
                user.getEmail(),
                user.getName(),
                user.getPhone(),
                user.getGender(),
                user.getAddress()
        );

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/role-user")
    public ResponseEntity<?> getAllUsersWithUserRole() {
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().toUpperCase().contains("USER"))
                .toList();

        List<UserDTO> dtos = users.stream()
                .map(UserDTO::fromEntity)
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestParam String email, @RequestParam String phone) {
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists.");
        }
        if (userRepository.findByPhone(phone.trim()).isPresent()) {
            return ResponseEntity.badRequest().body("Phone already exists.");
        }
        otpService.generateOtp(email);
        return ResponseEntity.ok("OTP sent to " + email);
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmOtp(@RequestBody RegisterRequest req) {
        if (req.getName().isBlank() || req.getEmail().isBlank() || req.getPassword().isBlank()
                || req.getPhone().isBlank() || req.getGender().isBlank() || req.getAddress().isBlank()) {
            return ResponseEntity.badRequest().body("Do not leave information blank.");
        }

        if (!isValidPassword(req.getPassword())) {
            return ResponseEntity.badRequest()
                    .body("Password must be at least 6 characters and contain both letters and numbers.");
        }

        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists.");
        }

        if (!otpService.validateOtp(req.getEmail(), req.getOtp())) {
            return ResponseEntity.badRequest().body("OTP is incorrect or expired.");
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .password(passwordEncoder.encode(req.getPassword()))
                .gender(req.getGender())
                .address(req.getAddress())
                .role(String.join(",", req.getRoles() != null ? req.getRoles() : List.of("USER")))
                .createdAt(LocalDate.now())
                .build();

        userRepository.save(user);
        otpService.clearOtp(req.getEmail());

        return ResponseEntity.ok("Registered successfully!");
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest req) {
        if (req.getName().isBlank() || req.getEmail().isBlank() || req.getPassword().isBlank()
                || req.getPhone().isBlank() || req.getGender().isBlank() || req.getAddress().isBlank()) {
            return ResponseEntity.badRequest().body("Do not leave information blank.");
        }

        if (!isValidPassword(req.getPassword())) {
            return ResponseEntity.badRequest()
                    .body("Password must be at least 6 characters and contain both letters and numbers.");
        }

        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists.");
        }

        String trimmedPhone = req.getPhone().trim();
        if (userRepository.findByPhone(trimmedPhone).isPresent()) {
            return ResponseEntity.badRequest().body("Phone already exists.");
        }

        if (!otpService.validateOtp(req.getEmail(), req.getOtp())) {
            return ResponseEntity.badRequest().body("OTP is incorrect or expired.");
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .password(passwordEncoder.encode(req.getPassword()))
                .gender(req.getGender())
                .address(req.getAddress())
                .role(String.join(",", req.getRoles() != null ? req.getRoles() : List.of("USER")))
                .createdAt(LocalDate.now())
                .build();

        userRepository.save(user);
        otpService.clearOtp(req.getEmail());

        return ResponseEntity.ok("Registered successfully!");
    }

    @PostMapping("/me/upload-avatar")
    public ResponseEntity<?> uploadAvatar(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized: Missing token"));
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        try {
            String uploadDir = "uploads/";
            Files.createDirectories(Paths.get(uploadDir));

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir + fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            User user = userOpt.get();
            user.setAvatar("/uploads/" + fileName); // DB lưu path tương đối
            userRepository.save(user);

            // build full URL trả về FE
            String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
            String fullUrl = baseUrl + user.getAvatar();

            return ResponseEntity.ok(Map.of(
                    "message", "Avatar uploaded successfully",
                    "url", fullUrl
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to upload avatar");
        }
    }


    @PatchMapping("/me/update")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> updates) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized: Missing token"));
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();

        // Cập nhật các field nếu có trong request
        if (updates.containsKey("name"))
            user.setName(updates.get("name"));
        if (updates.containsKey("address"))
            user.setAddress(updates.get("address"));
        if (updates.containsKey("gender"))
            user.setGender(updates.get("gender"));
        if (updates.containsKey("phone"))
            user.setPhone(updates.get("phone"));
        if (updates.containsKey("avatar"))
            user.setAvatar(updates.get("avatar")); // 🆕 update avatar

        userRepository.save(user);

        return ResponseEntity.ok("Profile updated successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        String email = loginRequest.getEmail();

        if (loginAttemptService.isBlocked(email)) {
            long waitTime = loginAttemptService.getRemainingLockTime(email);
            return ResponseEntity.status(429).body("Too many failed attempts. Try again in " + waitTime + " seconds.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            Optional<User> optionalUser = userRepository.findByEmail(userDetails.getUsername());

            if (optionalUser.isEmpty()) {
                return ResponseEntity.badRequest().body("Email not found.");
            }
            if (optionalUser.isEmpty()) {
                return ResponseEntity.badRequest().body("Email not found.");
            }

            User user = optionalUser.get();
            if (user.isLocked()) {
                LocalDateTime lockedAt = user.getLockedAt();
                if (lockedAt != null && lockedAt.plusDays(30).isAfter(LocalDateTime.now())) {
                    return ResponseEntity.status(403).body("Your account is locked until " + lockedAt.plusDays(30));
                } else {
                    // hết hạn khoá -> mở khoá tự động
                    user.setLocked(false);
                    user.setLockedAt(null);
                    userRepository.save(user);
                }
            }

            loginAttemptService.loginSucceeded(email);

            String role = userDetails.getAuthorities().stream().findFirst().get().getAuthority();
            String token = jwtUtil.generateToken(userDetails.getUsername(), role);

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "email", userDetails.getUsername(),
                    "role", role,
                    "userId", user.getUserId()));

        } catch (Exception e) {
            loginAttemptService.loginFailed(email);
            int remaining = loginAttemptService.getRemainingAttempts(email);
            return ResponseEntity.status(401).body("Invalid email or password. Remaining attempts: " + remaining);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ResetPasswordRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty())
            return ResponseEntity.badRequest().body("Email does not exist.");
        otpService.generateOtp(request.getEmail());
        return ResponseEntity.ok("OTP sent to " + request.getEmail());
    }

    @GetMapping("/send-reset-otp")
    public ResponseEntity<?> sendResetOtp(@RequestParam String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty())
            return ResponseEntity.badRequest().body("Email not found.");
        otpService.generateOtp(email);
        return ResponseEntity.ok("OTP sent to " + email);
    }

    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        String newPassword = payload.get("newPassword");

        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty())
            return ResponseEntity.badRequest().body("Email not found.");

        if (!isValidPassword(newPassword)) {
            return ResponseEntity.badRequest()
                    .body("Password must be at least 6 characters and contain both letters and numbers.");
        }

        if (!otpService.validateOtp(email, otp)) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP.");
        }

        user.get().setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user.get());
        otpService.clearOtp(email);
        return ResponseEntity.ok("Password reset successful.");
    }



    // ✅ Admin - Danh sách có phân trang
    @GetMapping("/admin/users")
    public ResponseEntity<?> getAllUsersPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(keyword, keyword,
                pageable);
        return ResponseEntity.ok(users);
    }

    // ✅ Admin - Trả về toàn bộ danh sách (không phân trang)
    @GetMapping("/admin/all-users")
    public ResponseEntity<?> getAllUsersWithoutPagination() {
        List<UserDTO> userDtos = userRepository.findAll().stream()
                .map(u -> new UserDTO(
                        u.getUserId(),
                        u.getName(),
                        u.getEmail(),
                        u.getPhone(),
                        u.getAddress(),
                        u.getGender(),
                        u.getRole(),
                        u.isLocked()))
                .toList();
        return ResponseEntity.ok(userDtos);
    }

    @PatchMapping("/admin/users/{id}/lock")
    public ResponseEntity<?> toggleLockUser(@PathVariable Long id,
                                            @RequestBody(required = false) Map<String, String> body) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        User user = userOpt.get();
        boolean isNowLocked = !user.isLocked();
        user.setLocked(isNowLocked);
        user.setLockedAt(isNowLocked ? LocalDateTime.now() : null);

        userRepository.save(user);

        if (isNowLocked) {
            String reason = body != null ? body.getOrDefault("reason", "No reason provided") : "No reason provided";
            mailService.sendLockNotificationEmail(user.getEmail(), 30, reason);
        }

        return ResponseEntity.ok("User " + (isNowLocked ? "locked" : "unlocked") + " successfully");
    }

    @PatchMapping("/admin/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        String newRole = body.get("role");
        User user = userOpt.get();
        user.setRole(newRole);
        userRepository.save(user);
        return ResponseEntity.ok("Role updated to: " + newRole);
    }

    @GetMapping("/admin/export")
    public ResponseEntity<?> exportUsers(@RequestParam(defaultValue = "ALL") String role) {
        List<User> users;
        if ("ALL".equalsIgnoreCase(role)) {
            users = userRepository.findAll();
        } else {
            users = userRepository.findAll().stream()
                    .filter(u -> u.getRole().equalsIgnoreCase(role))
                    .toList();
        }

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Users");
            Row header = sheet.createRow(0);
            String[] headers = { "ID", "Name", "Email", "Phone", "Address", "Gender", "Role", "Status" };
            for (int i = 0; i < headers.length; i++) {
                header.createCell(i).setCellValue(headers[i]);
            }

            for (int i = 0; i < users.size(); i++) {
                User u = users.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(u.getUserId());
                row.createCell(1).setCellValue(u.getName());
                row.createCell(2).setCellValue(u.getEmail());
                row.createCell(3).setCellValue(u.getPhone());
                row.createCell(4).setCellValue(u.getAddress());
                row.createCell(5).setCellValue(u.getGender());
                row.createCell(6).setCellValue(u.getRole());
                row.createCell(7).setCellValue(u.isLocked() ? "Locked" : "Active");
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            byte[] fileBytes = out.toByteArray();

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=users.xlsx")
                    .body(fileBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to export users");
        }
    }

}