package aptech.tripmate.DTO;

import aptech.tripmate.models.RoomType;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
public class RoomTypeDTO {
    private Long id;
    private String typeName;
    private String description;
    private List<String> imageUrls;
    private List<RoomDTO> rooms;
    private String hotelName;
    private Long hotelId;
    public RoomTypeDTO(RoomType roomType) {
        this.id = roomType.getId();
        this.typeName = roomType.getTypeName();
        this.description = roomType.getDescription();
        this.imageUrls = roomType.getImageUrls();

        this.rooms = roomType.getRooms() != null
                ? roomType.getRooms().stream().map(RoomDTO::new).collect(Collectors.toList())
                : null;

        this.hotelName = roomType.getHotel() != null
                ? roomType.getHotel().getName()
                : null;
        this.hotelId = roomType.getHotel() != null ? roomType.getHotel().getId() : null;
    }
}
