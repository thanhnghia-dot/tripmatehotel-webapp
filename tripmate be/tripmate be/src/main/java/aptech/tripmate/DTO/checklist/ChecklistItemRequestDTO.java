package aptech.tripmate.DTO.checklist;

import aptech.tripmate.enums.checklist.DeliveryMethod;
import lombok.*;

import java.math.BigDecimal;

/**
 * DTO cập nhật (partial). Trường nào null thì bỏ qua, giữ nguyên DB.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistItemRequestDTO {
    private String name;
    private Integer quantity;
    private BigDecimal price;
    private Boolean useFund;
    private DeliveryMethod deliveryMethod;
    private String deliveryLocation;

    private Boolean checked;
    private Boolean suggestedByAi;

    private Long assignedToId; // đổi người nhận (nếu null thì không đổi)
}
