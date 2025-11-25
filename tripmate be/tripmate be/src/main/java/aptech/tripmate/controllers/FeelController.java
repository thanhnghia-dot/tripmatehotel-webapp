package aptech.tripmate.controllers;


import aptech.tripmate.models.*;
import aptech.tripmate.repositories.*;
import aptech.tripmate.services.MailService;
import org.springframework.core.io.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feels")
@RequiredArgsConstructor
public class FeelController {

    private final FeelRepository feelRepo;
    private final FeelCommentRepository commentRepo;
    private final FeelLikeRepository likeRepo;
    private final UserRepository userRepo;
    private final TripRepository tripRepo;
    private final MailService mailService;

    @PostMapping(value = "/upload",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createFeel(@RequestParam("caption") String caption,
                                        @RequestParam("video") MultipartFile video,
                                        @RequestParam("userId") Long userId,
                                        @RequestParam(value = "tripId", required = false) Long tripId) {
        try {
            System.out.println("Caption: " + caption);
            System.out.println("Video: " + video.getOriginalFilename());
            System.out.println("UserId: " + userId);
            System.out.println("TripId: " + tripId);

            String videoUrl = saveVideoToLocal(video);

            User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            Trip trip = tripId != null ? tripRepo.findById(tripId).orElse(null) : null;

            Feel feel = Feel.builder()
                    .caption(caption)
                    .videoUrl(videoUrl)
                    .user(user)
                    .createdAt(LocalDateTime.now())
                    .build();

            return ResponseEntity.ok(feelRepo.save(feel));
        } catch (Exception e) {
            e.printStackTrace(); // Hiển thị lỗi trong console
            return ResponseEntity.status(500).body("Error uploading Feel: " + e.getMessage());
        }
    }


    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAllFeels() {
        List<Feel> feels = feelRepo.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok().body(feels);
    }
    @PostMapping("/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable Long id, @RequestParam Long userId) {
        User user = userRepo.findById(userId).orElseThrow();
        Feel feel = feelRepo.findById(id).orElseThrow();

        if (likeRepo.existsByUserAndFeel(user, feel)) {
            likeRepo.deleteByUserAndFeel(user, feel);
            return ResponseEntity.ok("Unliked");
        } else {
            likeRepo.save(new FeelLike(null, user, feel, LocalDateTime.now()));
            return ResponseEntity.ok("Liked");
        }
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<?> commentFeel(@PathVariable Long id, @RequestParam Long userId, @RequestParam String content) {
        User user = userRepo.findById(userId).orElseThrow();
        Feel feel = feelRepo.findById(id).orElseThrow();

        FeelComment comment = new FeelComment(null, content, LocalDateTime.now(), user, feel);
        return ResponseEntity.ok(commentRepo.save(comment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeel(@PathVariable Long id) {
        feelRepo.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }

    private String saveVideoToLocal(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("Video file is empty or null");
        }

        String uploadDir = System.getProperty("user.dir") + "/uploads/videos/";
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            boolean created = dir.mkdirs();
            if (!created) {
                throw new IOException("Không thể tạo thư mục uploads/videos");
            }
        }

        // Normalize file name để tránh ký tự lạ gây lỗi
        String originalName = file.getOriginalFilename();
        String safeName = originalName != null ? originalName.replaceAll("[^a-zA-Z0-9\\.\\-_]", "_") : "video.mp4";

        String fileName = UUID.randomUUID() + "_" + safeName;
        File destination = new File(dir, fileName);

        try {
            file.transferTo(destination);
        } catch (IOException ex) {
            ex.printStackTrace();
            throw new IOException("Lỗi khi ghi file video: " + ex.getMessage());
        }

        return "/uploads/videos/" + fileName;
    }
    @GetMapping("/my")
    public ResponseEntity<?> getMyFeels(@RequestParam Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<Feel> feels = feelRepo.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(feels);
    }
    // FeelController.java

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllFeelsForAdmin() {
        List<Feel> feels = feelRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Map<String, Object>> response = feels.stream().map(feel -> {
            Map<String, Object> f = new HashMap<>();
            f.put("id", feel.getId());
            f.put("caption", feel.getCaption());
            f.put("videoUrl", feel.getVideoUrl());
            f.put("likeCount", feel.getLikes().size()); // assuming Feel has Set<Like>
            f.put("createdAt", feel.getCreatedAt());
            Map<String, Object> user = new HashMap<>();
            user.put("name", feel.getUser().getName());
            user.put("email", feel.getUser().getEmail());
            f.put("user", user);
            return f;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }



    @DeleteMapping("/admin/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFeelByAdmin(@PathVariable Long id,
                                               @RequestParam String reason) {
        Feel feel = feelRepo.findById(id).orElse(null);
        if (feel == null) return ResponseEntity.notFound().build();

        String userEmail = feel.getUser().getEmail();
        String userName = feel.getUser().getName(); // 👈 lấy tên
        String caption = feel.getCaption();

        feelRepo.delete(feel);

        try {
            mailService.sendFeelVideoDeletedEmail(userEmail, userName, caption, reason);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("\n" +
                            "Delete video but error sending email: " + e.getMessage());
        }

        return ResponseEntity.ok("\n" +
                "Deleted video and emailed.");
    }

    @GetMapping("/video/{filename:.+}")
    public ResponseEntity<Resource> serveVideo(@PathVariable String filename) {
        try {
            Path videoPath = Paths.get(System.getProperty("user.dir") + "/uploads/videos/").resolve(filename).normalize();
            Resource resource = new UrlResource(videoPath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("video/mp4"))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

}

