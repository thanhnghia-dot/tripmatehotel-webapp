package aptech.tripmate.DTO.checklist;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChecklistItemCreateDTO {
    private Long tripId;
    private String itemName;
    private Integer quantity;
    // Must be TripMember OR trip creator (even if not in TripMember)
    private Long assigneeUserId;
}
