package aptech.tripmate.DTO;

import lombok.Data;

import java.util.List;

@Data
public class AssignHotelRequestDTO {
    private Long hotelId;
    private List<RoomBookingRequest> roomBookings;
}
