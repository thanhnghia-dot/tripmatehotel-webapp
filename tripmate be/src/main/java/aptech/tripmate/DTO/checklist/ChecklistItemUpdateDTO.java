package aptech.tripmate.DTO.checklist;

import aptech.tripmate.enums.checklist.ChecklistStatus;
import aptech.tripmate.enums.checklist.CostSource;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChecklistItemUpdateDTO {
    private BigDecimal price;       // nullable
    private LocalDate deadline;     // nullable
    private ChecklistStatus status; // PENDING | PURCHASED | TRANSFERRED
    private CostSource costSource;  // PERSONAL | FUND
}
