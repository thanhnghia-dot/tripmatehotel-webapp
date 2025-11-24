package aptech.tripmate.DTO;

import java.time.LocalDateTime;

import aptech.tripmate.models.Room;
import lombok.Data;

@Data
public class RoomDTO {
    private Long id;
    private String name;
    private int capacity;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;

    public RoomDTO(Room room, LocalDateTime checkIn, LocalDateTime checkOut) {
        this.id = room.getId();
        this.name = room.getRoomName();
        this.capacity = room.getCapacity();
        this.checkIn = checkIn;
        this.checkOut = checkOut;
    }
}