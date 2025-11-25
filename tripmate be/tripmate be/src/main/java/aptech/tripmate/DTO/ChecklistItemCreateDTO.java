package aptech.tripmate.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChecklistItemCreateDTO {
    private Long tripId;            
    private Long assignedToUserId;   
    private String name;             
    private boolean isChecked;       
    private boolean suggestedByAi;   
}

