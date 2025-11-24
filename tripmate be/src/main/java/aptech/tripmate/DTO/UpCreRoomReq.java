package aptech.tripmate.DTO;

import com.github.andrewoma.dexx.collection.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpCreRoomReq {

    public String roomName;
    public String description;
    public Double price;
    public List<String> imageUrl;
    public int capacity;
    public Long hotelId;
    private Long roomTypeId;
    private int numberOfBeds;
    private Double discountPercentage;
}
