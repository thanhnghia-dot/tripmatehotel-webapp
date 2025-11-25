package aptech.tripmate.DTO.checklist;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistFinancialSummaryDTO {
    private long totalItems;          // tổng số item
    private long purchasedItems;      // số item đã mua
    private BigDecimal totalSpent;    // tổng tiền đã mua (tất cả item đã PURCHASED)
    private BigDecimal totalPersonal; // tổng tiền chi cá nhân
    private BigDecimal totalFund;     // tổng tiền chi từ quỹ
    private BigDecimal budget;        // tổng ngân sách chuyến đi (trip.totalAmount)
    private BigDecimal remainingBudget; // ngân sách còn lại (budget - totalSpent)
}
