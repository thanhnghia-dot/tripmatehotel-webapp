package aptech.tripmate.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class HotelReviewStatsDTO {
    private String label;
    private double averageRating;
    private long reviewCount;
}
