package aptech.tripmate.DTO.checklist;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistMemberDTO {
    private Long assigneeId;
    private String assigneeName;
    private long itemCount;
}
