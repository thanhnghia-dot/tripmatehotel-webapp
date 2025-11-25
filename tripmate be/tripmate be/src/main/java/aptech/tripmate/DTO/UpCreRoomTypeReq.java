package aptech.tripmate.DTO;

import com.github.andrewoma.dexx.collection.List;
import lombok.Data;

@Data
public class UpCreRoomTypeReq {
    private String typeName;
    private String description;
    public List<String> imageUrl;
    private Long hotelId;
}
