package aptech.tripmate.DTO;

import aptech.tripmate.enums.LeaveRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaveRequestResponseDTO {
    private Long id;
    private Long tripId;
    private Long userId;
    private String userName;
    private String userEmail;
    private String reason;
    private String otherReason;
    private LeaveRequestStatus status;
    private String createdAt;
    private String ownerResponse;
}
