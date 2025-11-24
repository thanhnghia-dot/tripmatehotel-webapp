package aptech.tripmate.DTO;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PaidRoomBookingDTO {
    private Long bookingId;
    private Long roomId;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private String status;
    private Double price;
    private Long tripId;  // thêm trường tripId

    public PaidRoomBookingDTO(Long bookingId, Long roomId, LocalDateTime checkIn, LocalDateTime checkOut, String status, Double price, Long tripId) {
        this.bookingId = bookingId;
        this.roomId = roomId;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.status = status;
        this.price = price;
        this.tripId = tripId;
    }
}
