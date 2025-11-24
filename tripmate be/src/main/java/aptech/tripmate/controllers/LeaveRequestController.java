package aptech.tripmate.controllers;

import aptech.tripmate.DTO.LeaveRequestDTO;
import aptech.tripmate.DTO.LeaveRequestResponseDTO;
import aptech.tripmate.enums.LeaveRequestStatus;
import aptech.tripmate.services.LeaveRequestService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    // Member gửi yêu cầu rời trip
    @PostMapping("/trips/{tripId}/leave-requests")
    public ResponseEntity<?> createLeaveRequest(@PathVariable Long tripId,
                                                @RequestBody LeaveRequestDTO dto) {
        try {
            LeaveRequestResponseDTO res = leaveRequestService.createLeaveRequest(tripId, dto);
            return ResponseEntity.ok(res);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Server error");
        }
    }

    // Owner lấy danh sách yêu cầu đang pending
    @GetMapping("/trips/{tripId}/leave-requests")
    public ResponseEntity<?> getPendingRequests(@PathVariable Long tripId) {
        try {
            List<LeaveRequestResponseDTO> list = leaveRequestService.getPendingRequestsForTrip(tripId);
            return ResponseEntity.ok(list);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Server error");
        }
    }

    // Owner phê duyệt yêu cầu
    @PostMapping("/leave-requests/{requestId}/approve")
    public ResponseEntity<?> approveRequest(
            @PathVariable Long requestId,
            @RequestBody(required = false) Map<String, String> body) {
        String ownerResponse = body != null ? body.get("ownerResponse") : null;
        try {
            LeaveRequestResponseDTO res = leaveRequestService.respondToRequest(requestId, true, ownerResponse);
            return ResponseEntity.ok(res);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Server error");
        }
    }


    // Owner từ chối yêu cầu
    @PostMapping("/leave-requests/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable Long requestId,
            @RequestBody(required = false) Map<String, String> body) {
        String ownerResponse = body != null ? body.get("ownerResponse") : null;
        try {
            LeaveRequestResponseDTO res = leaveRequestService.respondToRequest(requestId, false, ownerResponse);
            return ResponseEntity.ok(res);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Server error");
        }
    }


    @GetMapping("/trips/{tripId}/leave-requests/status")
    public ResponseEntity<?> getLeaveRequestStatus(@PathVariable Long tripId) {
        try {
            Long currentUserId = leaveRequestService.getCurrentUserId();
            LeaveRequestStatus status = leaveRequestService.getLeaveRequestStatus(tripId, currentUserId);

            return ResponseEntity.ok(Map.of(
                    "status", status != null ? status.name() : null
            ));
        } catch (RuntimeException e) {
            e.printStackTrace(); // In chi tiết ra console
            String msg = e.getMessage() != null ? e.getMessage() : "Unexpected runtime error";
            if (msg.toLowerCase().contains("not authenticated")) {
                return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED)
                        .body(Map.of("message", "Unauthorized", "error", msg));
            }
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN)
                    .body(Map.of("message", "Access denied", "error", msg));
        } catch (Exception e) {
            e.printStackTrace(); // In chi tiết ra console
            String msg = e.getMessage() != null ? e.getMessage() : "Unexpected server error";
            return ResponseEntity.status(500).body(Map.of("message", "Server error", "error", msg));
        }
    }
    // Member xem yêu cầu của chính mình trong trip (bao gồm phản hồi Owner)
    @GetMapping("/trips/{tripId}/leave-requests/my")
    public ResponseEntity<?> getMyLeaveRequests(@PathVariable Long tripId) {
        try {
            List<LeaveRequestResponseDTO> list = leaveRequestService.getMyRequestsForTrip(tripId);
            return ResponseEntity.ok(list);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Server error");
        }
    }
    @DeleteMapping("/trips/{tripId}/leave-requests/my")
    public ResponseEntity<?> deleteMyRequests(@PathVariable Long tripId, @RequestBody List<Long> ids) {
        try {
            leaveRequestService.deleteMyRequests(ids);
            return ResponseEntity.ok("Deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Server error");
        }
    }


}
