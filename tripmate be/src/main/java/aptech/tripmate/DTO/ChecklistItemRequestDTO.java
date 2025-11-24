package aptech.tripmate.DTO;

import lombok.Data;

@Data
public class ChecklistItemRequestDTO {
    private String name;
    private boolean isChecked;
    private boolean suggestedByAi;
    private Long assignedToId; // chỉ nhận ID thay vì object
}
