package aptech.tripmate.DTO;

import aptech.tripmate.models.Room;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RoomDTO {
    private Long id;
    private String name;
    private int capacity;
    private int numberOfBeds;
    private String imageUrl;
    private double price;
    private Double finalPrice; // ✅ Giá sau giảm
    private Double discountPercentage; // ✅ Phần trăm giảm giá
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    @Size(max = 255)
    private String description;
    private String roomStatus;

    // ✅ Constructor có checkIn và checkOut
    public RoomDTO(Room room, LocalDateTime checkIn, LocalDateTime checkOut) {
        this.id = room.getId();
        this.name = room.getRoomName();
        this.capacity = room.getCapacity();
        this.numberOfBeds = room.getNumberOfBeds();
        this.imageUrl = room.getImageUrl();
        this.price = room.getPrice();
        this.finalPrice = calculateFinalPrice(room); // ✅ Tính finalPrice
        this.discountPercentage = room.getDiscountPercentage(); // ✅ Lấy discount
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.description = room.getDescription();
        this.roomStatus = room.getRoomStatus().name();
    }

    // ✅ Constructor không có checkIn/checkOut
    public RoomDTO(Room room) {
        this.id = room.getId();
        this.name = room.getRoomName();
        this.capacity = room.getCapacity();
        this.numberOfBeds = room.getNumberOfBeds();
        this.imageUrl = room.getImageUrl();
        this.price = room.getPrice();
        this.finalPrice = calculateFinalPrice(room); // ✅ Tính finalPrice
        this.discountPercentage = room.getDiscountPercentage();
        this.description = room.getDescription();
        this.checkIn = null;
        this.checkOut = null;
        this.roomStatus = room.getRoomStatus().name();
    }

    // ✅ Tính giá sau giảm
    private Double calculateFinalPrice(Room room) {
        if (room.getDiscountPercentage() != null && room.getDiscountPercentage() > 0) {
            return room.getPrice() - (room.getPrice() * room.getDiscountPercentage() / 100);
        }
        return room.getPrice(); // Nếu không giảm giá → giữ nguyên price
    }
}
