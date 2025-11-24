package aptech.tripmate.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HotelPerformanceDTO {
    private Long hotelId;
    private String hotelName;
    private double revenue;
    private int bookings;
    private double avgRating;

    private String suggestion;
}
