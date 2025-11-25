package aptech.tripmate.DTO;

import lombok.Data;

@Data
public class ChecklistItemDTO {
    private Long itemId;
    private String name;
    private boolean isChecked;
    private boolean suggestedByAi;
    private String assignedToName;
    private String assignedToEmail;
}
