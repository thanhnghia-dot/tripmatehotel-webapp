package aptech.tripmate.DTO;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class AssignHotelRequestDTO {
    private Long hotelId;
    private List<Long> roomIds;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
}
