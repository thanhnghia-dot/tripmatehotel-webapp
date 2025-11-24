package aptech.tripmate.DTO;

import aptech.tripmate.models.Hotel;
import lombok.Data;

@Data
public class HotelDTO {
    private Long id;
    private String name;
    private String address;

    public HotelDTO(Hotel hotel) {
        this.id = hotel.getId();
        this.name = hotel.getName();
        this.address = hotel.getAddress();
    }
}
