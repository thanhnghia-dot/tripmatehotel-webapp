package aptech.tripmate.DTO;

import aptech.tripmate.models.Hotel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelDTO {
    private Long id;
    private String name;
    private String address;
    private String imageUrl;
    private int starRating;
    private String description;
    private String description2;
    private String description3;
    private String description4;
    private String description5;
    private String description6;
    private String description7;
    private String description8;
    private String description9;
    private String description10;
    private String description11;
    private String description12;

    public HotelDTO(Hotel hotel) {
        this.id = hotel.getId();
        this.name = hotel.getName();
        this.address = hotel.getAddress();
        this.imageUrl = hotel.getImageUrl();
        this.starRating = hotel.getStarRating();
        this.description = hotel.getDescription();
        this.description2 = hotel.getDescription2();
        this.description3 = hotel.getDescription3();
        this.description4 = hotel.getDescription4();
        this.description5 = hotel.getDescription5();
        this.description6 = hotel.getDescription6();
        this.description7 = hotel.getDescription7();
        this.description8 = hotel.getDescription8();
        this.description9 = hotel.getDescription9();
        this.description10 = hotel.getDescription10();
        this.description11 = hotel.getDescription11();
        this.description12 = hotel.getDescription12();
    }
}
