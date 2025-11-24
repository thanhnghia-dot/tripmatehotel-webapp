package aptech.tripmate.DTO;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class HotelRequest {
    private String name;
    private String address;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private Long tripId;
    private List<RoomRequest> rooms;
}
