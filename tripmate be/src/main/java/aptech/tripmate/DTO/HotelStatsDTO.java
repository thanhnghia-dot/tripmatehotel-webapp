package aptech.tripmate.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class HotelStatsDTO {
    private Long hotelId;
    private String hotelName;
    private double revenue;
    private long bookings;
    private double avgRating;
    private String suggestion;
}
