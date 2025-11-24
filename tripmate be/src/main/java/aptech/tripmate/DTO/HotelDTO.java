package aptech.tripmate.DTO;

import aptech.tripmate.models.Amenity;
import aptech.tripmate.models.Hotel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelDTO {
    private Long id;
    private String name;
    private String address;
    private String imageUrl;
    private List<String> imageUrls;
    private int starRating;
    private String description;
    private List<RoomTypeDTO> roomsType;
    private List<RoomDTO> rooms;
    private List<HotelReviewRequestDTO> reviews;
    private List<AmenityDTO> amenityIds;
    private String streetAddress;
    public HotelDTO(Hotel hotel) {
        this.id = hotel.getId();
        this.name = hotel.getName();
        this.address = hotel.getAddress();
        this.imageUrl = hotel.getImageUrl();
        if (hotel.getImageUrl() != null && !hotel.getImageUrl().isEmpty()) {
            this.imageUrls = List.of(hotel.getImageUrl().split(","));
        } else {
            this.imageUrls = List.of();
        }
        this.starRating = hotel.getStarRating();
        this.description = hotel.getDescription();
        this.streetAddress = hotel.getStreetAddress();
        if (hotel.getRoomTypes() != null) {
            this.roomsType = hotel.getRoomTypes().stream()
                    .map(RoomTypeDTO::new) // cần constructor RoomTypeDTO(RoomType rt)
                    .collect(Collectors.toList());
        }
        this.amenityIds = hotel.getAmenities() != null
                ? new ArrayList<>(hotel.getAmenities()).stream().map(AmenityDTO::new).toList()
                : List.of();


    }

    public HotelDTO(Hotel hotel, List<RoomDTO> rooms, List<HotelReviewRequestDTO> reviews,List<RoomTypeDTO> roomsType) {
        this(hotel);
        this.rooms = rooms;
        this.reviews = reviews;
        this.roomsType = roomsType;

    }
}
