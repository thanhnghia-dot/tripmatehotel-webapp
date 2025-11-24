package aptech.tripmate.DTO;

import aptech.tripmate.enums.RoomStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomItem {

    public Long id;
    public String roomName;
    @Size(max = 255)
    public String description;
    public Double price;
    public String imageUrl;
    public int capacity;
    public RoomStatus status;
    private String roomType;
    private Double finalPrice;        // giá sau giảm
    private Double discountPercentage;

}
