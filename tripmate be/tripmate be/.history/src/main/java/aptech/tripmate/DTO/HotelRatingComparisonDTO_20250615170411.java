package aptech.tripmate.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class HotelRatingComparisonDTO {
    private Long hotelId;
    private String hotelName;
    private double averageRating;
    private long reviewCount;
}
