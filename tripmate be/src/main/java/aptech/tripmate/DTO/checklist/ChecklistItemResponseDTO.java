package aptech.tripmate.DTO.checklist;

import aptech.tripmate.enums.checklist.ChecklistStatus;
import aptech.tripmate.enums.checklist.CostSource;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistItemResponseDTO {
    private Long itemId;
    private Long tripId;
    private String itemName;
    private Integer quantity;

    private Long assigneeUserId;
    private String assigneeName;     // FE hiển thị tên

    private BigDecimal price;
    private LocalDate deadline;
    private ChecklistStatus status;
    private CostSource costSource;

    // ✅ NEW: thông tin transfer
    private Long transferredFromUserId;   // id người đã chuyển
    private String transferredFromName;   // tên người đã chuyển
}
