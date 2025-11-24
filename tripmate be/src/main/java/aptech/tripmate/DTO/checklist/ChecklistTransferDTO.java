package aptech.tripmate.DTO.checklist;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistTransferDTO {
    private Long newAssigneeUserId; // id của B (người nhận mới)
    private Long fromUserId;        // id của A (người chuyển, optional - có thể null, BE sẽ lấy từ token)
}
