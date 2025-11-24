package aptech.tripmate.DTO;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchHotelResponseItem {
    public Long id;
    public String name;
    public String address;
    public LocalDateTime checkIn;
    public LocalDateTime checkOut;
    public int starRating;
    public List<RoomItem> rooms;   
    public String imageUrl;
    public String description;
    public String roomType;
    private List<AmenityDTO> amenityIds;
    private List<RoomTypeDTO> roomTypes;
    private String streetAddress;
}
