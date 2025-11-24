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
    private String reason;
    public HotelRatingComparisonDTO(Long hotelId, String hotelName, double averageRating, long reviewCount) {
        this.hotelId = hotelId;
        this.hotelName = hotelName;
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
    }

}
