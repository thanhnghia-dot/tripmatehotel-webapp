package aptech.tripmate.DTO;

import java.time.LocalDateTime;

import aptech.tripmate.models.Room;
import lombok.Data;

@Data
public class RoomDTO {
    private Long id;
    private String name;
    private int capacity;
    private String imageUrl;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private Double pricePerNight;
    private Double discount;
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

    public RoomDTO(Room room, LocalDateTime checkIn, LocalDateTime checkOut) {
        this.id = room.getId();
        this.name = room.getRoomName();
        this.capacity = room.getCapacity();
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.imageUrl = room.getImageUrl();
        this.pricePerNight = room.getPricePerNight();
        this.discount = room.getDiscount();
        this.description = room.getDescription();
        this.description2 = room.getDescription2();
        this.description3 = room.getDescription3();
        this.description4 = room.getDescription4();
        this.description5 = room.getDescription5();
        this.description6 = room.getDescription6();
        this.description7 = room.getDescription7();
        this.description8 = room.getDescription8();
        this.description9 = room.getDescription9();
        this.description10 = room.getDescription10();
        this.description11 = room.getDescription11();
        this.description12 = room.getDescription12();
    }
}