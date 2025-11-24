package aptech.tripmate.DTO;

import lombok.Data;

import java.util.List;

@Data
public class RoomHistoryDTO {
    private Long roomId;
    private String roomName;
    private List<String> images;
    private List<BookingDTO> bookings;
}
