package aptech.tripmate.DTO.checklist;

import aptech.tripmate.enums.checklist.DeliveryMethod;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistItemDTO {
    private Long itemId;
    private String name;
    private int quantity;
    private BigDecimal price;
    private Boolean checked;          // giữ nullable cho FE
    private boolean suggestedByAi;

    private String assignedToName;
    private String assignedToEmail;

    private boolean useFund;
    private DeliveryMethod deliveryMethod;
    private String deliveryLocation;

    private String createdByEmail;
    private Long tripCreatorId;
}
