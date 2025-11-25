package aptech.tripmate.DTO;

import aptech.tripmate.models.CancelRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CancelRequestDTO {
    private Long id;
    private Long tripRoomId;
    private String tripName;
    private String roomName;
    private String userEmail;
    private List<String> reasons;  // convert CSV -> List
    private String otherReason;
    private String status; // PENDING, APPROVED, REJECTED
    private LocalDateTime requestedAt;
    private String refundId;
   
    public CancelRequestDTO(CancelRequest request) {
        this.id = request.getId();
        this.tripRoomId = request.getTripRoom() != null ? request.getTripRoom().getId() : null;
        this.tripName = request.getTripRoom() != null && request.getTripRoom().getTrip() != null
                ? request.getTripRoom().getTrip().getName() : null;
        this.roomName = request.getTripRoom() != null && request.getTripRoom().getRoom() != null
                ? request.getTripRoom().getRoom().getRoomName() : null;
        this.userEmail = request.getUser() != null ? request.getUser().getEmail() : null;

        // Chuyển CSV thành List
        if (request.getReasons() != null && !request.getReasons().isEmpty()) {
            this.reasons = Arrays.asList(request.getReasons().split(","));
        }
        this.otherReason = request.getOtherReason();
        this.status = request.getStatus();
        this.requestedAt = request.getRequestedAt();
    }

}
