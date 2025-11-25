package aptech.tripmate.DTO;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class PaidRoomInfoDTO {
    private Long roomId;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    public PaidRoomInfoDTO(Long roomId, LocalDateTime checkIn, LocalDateTime checkOut) {
        this.roomId = roomId;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
    }
}
