package aptech.tripmate.DTO;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class TripRoomDTO {
    private Long roomId;
    private String roomName;
    private int capacity;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private String hotelName;
}
