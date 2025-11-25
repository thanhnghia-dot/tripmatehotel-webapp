package aptech.tripmate.DTO;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SearchRoomItem {
    public Long id;
    public String roomName;
    public String description;
    public Double price;
    public List<String> imageUrl;
    public int capacity;
    private int numberOfBeds;
    public Long hotelId;
    public String hotelName;
    public String roomStatus;
    public String roomType;
    private Double discountPercentage; // thêm
    private Double finalPrice;
}
