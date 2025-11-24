package aptech.tripmate.DTO;

import lombok.Data;

@Data
public class ChecklistItemResponseDTO {
    private Long itemId;
    private String name;
    private boolean isChecked;
    private boolean suggestedByAi;
    private Long assignedToId;
    private String assignedToName;
}
