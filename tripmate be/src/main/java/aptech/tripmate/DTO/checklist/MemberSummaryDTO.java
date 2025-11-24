package aptech.tripmate.DTO.checklist;

import lombok.AllArgsConstructor;
import lombok.Builder;   // ✅ thêm import này
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder   // ✅ thêm annotation này
public class MemberSummaryDTO {
    private Long userId;
    private String fullName;
    private Long itemCount;
    private Long purchasedCount;
    private BigDecimal spent;
}
