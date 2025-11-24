package aptech.tripmate.controllers;

import aptech.tripmate.DTO.*;
import aptech.tripmate.enums.MemberStatus;
import aptech.tripmate.enums.RoomStatus;
import aptech.tripmate.jwt.JwtUtil;
import aptech.tripmate.models.*;
import aptech.tripmate.repositories.*;
import aptech.tripmate.services.TripMemberService;
import aptech.tripmate.services.TripService;
import aptech.tripmate.untils.ApiResponse;
import aptech.tripmate.untils.PagedData;
import aptech.tripmate.repositories.TripRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
@Slf4j
public class TripController {

    private final TripService tripService;
    private final TripMemberService tripMemberService;
    @Autowired
    private TripRepository tripRepository;
    @Autowired
    private TripMemberRepository tripMemberRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private TripRoomRepository tripRoomRepository;
    @Autowired
    private HotelRepository hotelRepository;







    @DeleteMapping("/cancel-all")
    public ResponseEntity<String> cancelAllRooms(
            @RequestParam Long tripId) {
        tripService.cancelAllRoomsInTrip(tripId);
        return ResponseEntity.ok("All room bookings canceled and hotel removed from trip.");
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<DetailTripRes> getDetailTripById(@PathVariable("id") Long id) {
        try {
            var res = tripService.getDetailTrip(id);
            return new ResponseEntity<>(res, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            log.error("Cannot found Trip with ID {}: {}", id, e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/delete/{tripId}")
    public ResponseEntity<?> deleteTrip(
            @PathVariable Long tripId,
            @RequestParam(value = "confirm", defaultValue = "false") boolean confirm,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User is not logged in");
        }

        String email = userDetails.getUsername();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
        boolean isOwner = trip.getOwner() != null &&
                trip.getOwner().getUserId().equals(currentUser.getUserId());

        // Quy tắc xóa
        if (!isAdmin) {
            if (!isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You do not have permission to delete this trip.");
            }
            if (!"Completed".equalsIgnoreCase(trip.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Only completed trips can be deleted.");
            }
        }

        try {
            tripService.deleteTrip(tripId, confirm);
            return ResponseEntity.ok("Trip deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error occurred while deleting trip: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<PagedData<SearchTripItem>> searchTrips(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "creator", required = false) String creator,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(value = "createdFrom", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdFrom,
            @RequestParam(value = "createdTo", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdTo,
            @RequestParam(value = "minMembers", required = false) Long minMembers,
            @RequestParam(value = "maxMembers", required = false) Long maxMembers,
            @RequestParam(value = "status", required = false) String status, // ✅ thêm status
            @PageableDefault(size = 4) Pageable pageable) {
        try {
            log.info("Searching trips with status: {}, name: {}", status, name);
            PagedData<SearchTripItem> result = tripService.searchTrips(
                    name, creator, startDate, endDate, createdFrom, createdTo,
                    minMembers, maxMembers, status, pageable); // ✅ truyền xuống service
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (RuntimeException e) {
            log.error("Error searching trips: {}", e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<?> getTrips(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            String email = (userDetails != null) ? userDetails.getUsername() : null;
            List<Trip> trips;

            if (email != null) {
                // ✅ Lấy trips của user login + trips public
                trips = tripService.findTripsForCurrentUserAndPublic();
            } else {
                // ✅ Chưa login → chỉ lấy trips public
                trips = tripService.findOnlyPublicTrips();
            }

            List<TripDTO> tripDTOs = trips.stream().map(trip -> {
                TripDTO dto = tripService.toDto(trip);

                // ✅ Creator (Owner)
                User owner = trip.getOwner();
                dto.setCreatorId(owner != null ? owner.getUserId() : null);

                // ✅ Role của user hiện tại
                if (email != null) {
                    String roleName = tripMemberService.getRoleNameInTrip(trip.getTripId(), email);
                    dto.setMemberRole(roleName);
                } else {
                    dto.setMemberRole(null);
                }

                return dto;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(tripDTOs, "Get list of trips"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.errorServer(e.getMessage()));
        }
    }
    @GetMapping("/my-trips")
    public ResponseEntity<?> getMyTrips(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.errorClient("User chưa đăng nhập"));
            }

            String email = userDetails.getUsername();
            List<Trip> trips = tripService.findTripsForCurrentUser();

            List<TripDTO> tripDTOs = trips.stream()
                    .map(trip -> {
                        TripDTO dto = tripService.toDto(trip);

                        // ✅ Creator (Owner)
                        User owner = trip.getOwner();
                        dto.setCreatorId(owner != null ? owner.getUserId() : null);

                        // ✅ Role trong trip
                        String roleName = tripMemberService.getRoleNameInTrip(trip.getTripId(), email);
                        dto.setMemberRole(roleName);

                        return dto;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(tripDTOs, "Get trips of logged-in user"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.errorServer(e.getMessage()));
        }
    }


    @GetMapping("/{tripId}/total-amount")
    public ResponseEntity<?> getTotalAmount(@PathVariable Long tripId) {
        try {
            Trip trip = tripService.findById(tripId);
            if (trip == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("The trip does not exist.");
            }

            double totalAmount = trip.getTotalAmount() != null ? trip.getTotalAmount() : 0.0;
            return ResponseEntity.ok(Map.of("totalAmount", totalAmount));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra khi lấy tổng số tiền");
        }
    }


    @PostMapping
    public ResponseEntity<?> createTrip(@RequestBody TripCreateRequestDTO request) {
        try {
            request.setStatus("Planning");
            Trip newTrip = tripService.createTripWithHotel(request);
            TripDTO tripDTO = toDto(newTrip);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(tripDTO, "Create a successful trip"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.errorServer("Create failed trip: " + e.getMessage()));
        }
    }




    @GetMapping("/{tripId}")
    public ResponseEntity<?> getTripDetails(@PathVariable Long tripId) {
        TripDTO dto = tripService.getTripDetails(tripId);
        return ResponseEntity.ok(ApiResponse.success(dto, "Trip details fetched"));
    }

    @GetMapping("/public")
    public ResponseEntity<?> getPublicTrips() {
        try {
            List<Trip> publicTrips = tripService.findOnlyPublicTrips();

            // map sang DTO đơn giản
            List<TripDTO> tripDTOs = publicTrips.stream()
                    .map(trip -> TripDTO.builder()
                            .id(trip.getTripId())
                            .name(trip.getName())
                            .destination(trip.getDestination())
                            .departurePoint(trip.getDeparturePoint())
                            .status(trip.getStatus())
                            .type(trip.getType())
                            .startDate(trip.getStartDate())
                            .endDate(trip.getEndDate())
                            .isPublic(trip.getIsPublic())
                            .totalAmount(trip.getTotalAmount())
                            .build()
                    )
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "message", "Success",
                    "data", tripDTOs
            ));
        } catch (Exception e) {
            e.printStackTrace(); // để debug log
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", 500,
                    "message", "Failed to fetch public trips: " + e.getMessage()
            ));
        }
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<?> updateTrip(@PathVariable Long tripId, @RequestBody TripRequestDTO request) {
        try {
            Trip updatedTrip = tripService.updateTrip(tripId, request);

            // Chuyển sang DTO để tránh lỗi serialize
            TripDTO dto = tripService.toDto(updatedTrip); // hoặc new TripDTO(...)

            return ResponseEntity.ok(ApiResponse.success(dto, "Trip updated successfully"));
        } catch (Exception e) {
            log.error("Failed to update trip {}: {}", tripId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.errorServer("Failed to update trip: " + e.getMessage()));
        }
    }



    @PostMapping("/{tripId}/invite")
    public ResponseEntity<?> inviteMember(
            @PathVariable Long tripId,
            @RequestParam String email) {
        // Lấy trip từ repository
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        // Kiểm tra trạng thái
        if ("Finished".equalsIgnoreCase(trip.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.errorClient("Trip is already completed. Cannot invite more members."));
        }

        // Nếu chưa kết thúc thì cho phép mời
        tripMemberService.inviteMemberByEmail(tripId, email);
        return ResponseEntity.ok(ApiResponse.success(null, "Invitation sent to " + email));
    }

    @PutMapping("/{tripId}/accept")
    public ResponseEntity<?> acceptInvite(@PathVariable Long tripId) {
        try {
            tripMemberService.acceptInvitation(tripId);
            return ResponseEntity.ok(ApiResponse.success(null, "Invitation accepted."));
        } catch (IllegalStateException e) {
            // Trường hợp lỗi nghiệp vụ (ví dụ: đã tham gia chuyến đi)
            return ResponseEntity.status(HttpStatus.CONFLICT) // 409
                    .body(ApiResponse.errorClient(e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.errorClient(e.getMessage()));
        } catch (Exception e) {
            // Lỗi khác
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.errorServer(e.getMessage()));
        }
    }
    @PostMapping("/{tripId}/decline")
    public ResponseEntity<?> declineInvite(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = userDetails.getUsername();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new NoSuchElementException("Trip not found"));

        TripMember member = tripMemberRepository.findByTripAndEmail(trip, email)
                .orElseThrow(() -> new NoSuchElementException("Invitation not found"));

        member.setStatus(MemberStatus.DECLINED);
        tripMemberRepository.save(member);

        return ResponseEntity.ok("Invitation declined");
    }

    @GetMapping("/{tripId}/members")
    public ResponseEntity<List<TripMemberDTO>> getTripMembers(@PathVariable Long tripId) {
        return ResponseEntity.ok(tripMemberService.getTripMembers(tripId));
    }

    @GetMapping("/invited")
    public ResponseEntity<?> getInvitedTrips() {
        try {
            List<TripDTO> invitedTrips = tripService.findInvitedTripsForCurrentUser();
            return ResponseEntity.ok(ApiResponse.success(invitedTrips, "Get the list of successful invitations"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.errorServer(e.getMessage()));
        }
    }

    @PutMapping("/{id}/visibility")
    public ResponseEntity<?> updateTripVisibility(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        boolean isPublic = body.getOrDefault("isPublic", true);

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.errorClient("You need to login"));
        }

        String email = userDetails.getUsername();
        String roleName = tripMemberService.getRoleNameInTrip(id, email);

        if (roleName == null || !"OWNER".equalsIgnoreCase(roleName)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.errorClient("Only OWNER is allowed to change visibility"));
        }

        try {
            tripService.updateVisibility(id, isPublic);
            return ResponseEntity.ok(ApiResponse.success(null, "Visibility updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.errorServer("Failed to update visibility: " + e.getMessage()));
        }
    }

    @PostMapping("{tripId}/mark-finished")
    public ResponseEntity<?> setTripFinished(@PathVariable Long tripId) {
        try {
            tripService.setFinishedTrip(tripId);
            return ResponseEntity.ok("Trip marked as finished");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.errorServer("Failed to mark trip as finished: " + e.getMessage()));
        }
    }
    @PostMapping("/{id}/status")
    public ResponseEntity<?> updateTripStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        trip.setStatus(newStatus);
        tripRepository.save(trip);
        return ResponseEntity.ok().body("Status updated to " + newStatus);
    }
    @GetMapping("/completed")
    public ResponseEntity<?> getCompletedTrips(HttpServletRequest request) {
        String token = jwtUtil.extractTokenFromRequest(request);
        System.out.println("Token: " + token);

        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing token");
        }

        String email = jwtUtil.extractUsername(token);


        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ User with email not found: " + email);
        }

        User user = userOpt.get();
        List<Trip> trips = tripRepository.findByUserUserIdAndIsFinishedTrue(user.getUserId());
        List<TripDTO> result = trips.stream().map(TripDTO::fromEntity).toList();
        return ResponseEntity.ok(result);
    }
    // đặt hotel tripp nghĩa // sửa cái này
    @PostMapping("/{tripId}/assign-hotel")
    public ResponseEntity<?> assignHotel(@PathVariable Long tripId, @RequestBody AssignHotelRequestDTO request, HttpServletRequest httpRequest) {
        // Lấy token từ header của yêu cầu HTTP
        String token = jwtUtil.extractTokenFromRequest(httpRequest);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing token");
        }

        // Lấy email từ token JWT
        String email = jwtUtil.extractUsername(token);
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ User with email not found: " + email);
        }

        // Lấy chuyến đi
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        List<TripRoom> savedTripRooms = new ArrayList<>();

        for (RoomBookingRequest booking : request.getRoomBookings()) {
            Room room = roomRepository.findById(booking.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found"));

            // Kiểm tra phòng đã được đặt trong khoảng thời gian (loại CANCELLED)
            List<TripRoom> bookedRooms = tripRoomRepository
                    .findByRoomAndCheckInBeforeAndCheckOutAfter(room, booking.getCheckOut(), booking.getCheckIn())
                    .stream()
                    .filter(tr -> !"CANCELLED".equalsIgnoreCase(tr.getStatus()))
                    .collect(Collectors.toList());

            if (!bookedRooms.isEmpty()) {
                return ResponseEntity.status(HttpStatus.OK)
                        .body("❌ The room " + room.getRoomName() + " is already booked during the selected dates.");
            }

            // Tạo TripRoom mới
            TripRoom tripRoom = new TripRoom();
            tripRoom.setTrip(trip);
            tripRoom.setRoom(room);
            tripRoom.setCheckIn(booking.getCheckIn());
            tripRoom.setCheckOut(booking.getCheckOut());
            tripRoom.setEmail(email);
            tripRoom.setName(userOpt.get().getName());
            tripRoom.setStatus("Unpaid"); // trạng thái mặc định

// ✅ Tính số đêm
            long nights = 1;
            if (booking.getCheckIn() != null && booking.getCheckOut() != null) {
                nights = ChronoUnit.DAYS.between(booking.getCheckIn().toLocalDate(), booking.getCheckOut().toLocalDate());
                if (nights <= 0) nights = 1;
            }

// ✅ Giá final nếu có
            double priceToUse = (room.getFinalPrice() != null && room.getFinalPrice() > 0)
                    ? room.getFinalPrice()
                    : room.getPrice();

            tripRoom.setPrice((int) (priceToUse * nights)); // ✅ Lưu giá vào DB
            tripRoomRepository.save(tripRoom);
        }

        // Gán hotel nếu có
        if (request.getHotelId() != null) {
            Hotel hotel = hotelRepository.findById(request.getHotelId())
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));
            trip.setHotel(hotel);
            tripRepository.save(trip);
        }

        // Cập nhật tổng tiền chuyến đi chỉ tính các phòng chưa CANCELLED
        List<TripRoom> activeTripRooms = tripRoomRepository.findByTrip(trip)
                .stream()
                .filter(tr -> !"CANCELLED".equalsIgnoreCase(tr.getStatus()))
                .collect(Collectors.toList());

        double totalRoomCost = activeTripRooms.stream()
                .mapToDouble(tr -> {
                    Room room = tr.getRoom();
                    if (room == null) return 0;
                    long nights = 1;
                    if (tr.getCheckIn() != null && tr.getCheckOut() != null) {
                        nights = ChronoUnit.DAYS.between(tr.getCheckIn().toLocalDate(), tr.getCheckOut().toLocalDate());
                        if (nights <= 0) nights = 1;
                    }
                    Double priceToUse = (room.getFinalPrice() != null && room.getFinalPrice() > 0)
                            ? room.getFinalPrice() // ✅ Giá sau giảm
                            : room.getPrice();     // ✅ Nếu chưa có finalPrice thì dùng giá gốc
                    return priceToUse != null ? priceToUse * nights : 0;
                })
                .sum();


        double originalTotalAmount = trip.getTotalAmount() != null ? trip.getTotalAmount() : 0.0;
        double remainingAmount = originalTotalAmount - totalRoomCost;
        if (remainingAmount < 0) remainingAmount = 0;
        trip.setTotalAmount(remainingAmount);
        tripRepository.save(trip);

        return ResponseEntity.ok("✅ Hotel assigned successfully!");
    }

    @Data
    public static class ShareChecklistRequest {
        private Long tripId;
        private String email;
    }

    private TripDTO toDto(Trip trip) {
        return TripDTO.builder()
                .id(trip.getTripId())
                .name(trip.getName())
                .type(trip.getType())
                .departurePoint(trip.getDeparturePoint())
                .status(trip.getStatus())
                .destination(trip.getDestination())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .totalAmount(trip.getTotalAmount())
                .build();
    }
    // tính số lượng member trong trip để đặt khách sạn
    @GetMapping("/{tripId}/member-count")
    public ResponseEntity<Long> getAcceptedMemberCount(@PathVariable Long tripId) {
        long count = tripMemberService.countAcceptedMembers(tripId);
        return ResponseEntity.ok(count);
    }

}
