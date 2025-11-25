package aptech.tripmate.controllers;

import aptech.tripmate.DTO.AssignHotelRequestDTO;
import aptech.tripmate.DTO.TripDTO;
import aptech.tripmate.DTO.TripMemberDTO;
import aptech.tripmate.DTO.TripRequestDTO;
import aptech.tripmate.DTO.TripCreateRequestDTO;
import aptech.tripmate.models.Trip;
import aptech.tripmate.services.TripMemberService;
import aptech.tripmate.services.TripService;
import aptech.tripmate.untils.ApiResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    private final TripMemberService tripMemberService;

    // Lấy danh sách chuyến đi của user đang đăng nhập
    @GetMapping
    public ResponseEntity<?> getTrips() {
        try {
            List<Trip> trips = tripService.findTripsForCurrentUser();
            List<TripDTO> tripDTOs = trips.stream()
                    .map(this::toDto)
                    .toList();

            return ResponseEntity.ok(ApiResponse.success(tripDTOs, "Get list of successful trips"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.errorServer(e.getMessage()));
        }
    }

    // Lấy tổng số tiền chuyến đi theo tripId
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
            Trip newTrip = tripService.createTripWithHotel(request);
            TripDTO tripDTO = toDto(newTrip);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(tripDTO, "\n" +
                            "Create a successful trip"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.errorServer("Create failed trip: " + e.getMessage()));
        }
    }

    @PostMapping("/{tripId}/assign-hotel")
    public ResponseEntity<?> assignHotelToTrip(@PathVariable Long tripId, @RequestBody AssignHotelRequestDTO request) {
        tripService.assignHotelAndRoomsToTrip(tripId, request);
        return ResponseEntity.ok("Hotel and rooms assigned successfully");
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<?> getTripDetails(@PathVariable Long tripId) {
        TripDTO dto = tripService.getTripDetails(tripId);
        return ResponseEntity.ok(ApiResponse.success(dto, "Trip details fetched"));
    }


    @PutMapping("/{tripId}")
    public ResponseEntity<?> updateTrip(@PathVariable Long tripId, @RequestBody TripRequestDTO request) {
        try {
            Trip updatedTrip = tripService.updateTrip(tripId, request);
            return ResponseEntity.ok(ApiResponse.success(updatedTrip, "Trip updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.errorServer("Failed to update trip: " + e.getMessage()));
        }
    }

    @PostMapping("/{tripId}/invite")
    public ResponseEntity<String> inviteMember(
            @PathVariable Long tripId,
            @RequestParam String email) {
        tripMemberService.inviteMemberByEmail(tripId, email);
        return ResponseEntity.ok("Invitation sent to " + email);
    }

    @PutMapping("/{tripId}/accept")
    public ResponseEntity<String> acceptInvite(
        @PathVariable Long tripId
    ) {
        tripMemberService.acceptInvitation(tripId);
        return ResponseEntity.ok("Invitation accepted.");
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

    @Data
    public static class ShareChecklistRequest {
        private Long tripId;
        private String email;
    }

    // Hàm chuyển đổi Trip sang TripDTO
    private TripDTO toDto(Trip trip) {
        return TripDTO.builder()
                .id(trip.getTripId())
                .name(trip.getName())
                .type(trip.getType())
                .destination(trip.getDestination())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .totalAmount(trip.getTotalAmount())
                .build();
    }
}
