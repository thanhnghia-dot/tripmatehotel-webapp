package aptech.tripmate.DTO;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RoomRequest {
    private String roomName;
    @Size(max = 255)
    private String description;
    private Double price;
    private String imageUrl;
    private Long hotelId;
    private Long roomTypeId;
}
