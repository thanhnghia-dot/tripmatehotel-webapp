package aptech.tripmate.DTO;

import lombok.*;

@Data
@AllArgsConstructor
public class ReviewStatsDTO {
    private String period; // e.g. "2025-01", "2025-W02"
    private double averageRating;
    private long totalReviews;
}
