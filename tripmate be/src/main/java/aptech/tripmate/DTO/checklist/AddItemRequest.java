package aptech.tripmate.DTO.checklist;

import lombok.Data;

@Data
public class AddItemRequest {
    private Long tripId;
    private String name;
    private int quantity;
    private Long assigneeId;
}
