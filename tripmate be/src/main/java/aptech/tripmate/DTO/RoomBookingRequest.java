package aptech.tripmate.DTO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RoomBookingRequest {
    private Long roomId;
    private String name;
    private String email;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
}
