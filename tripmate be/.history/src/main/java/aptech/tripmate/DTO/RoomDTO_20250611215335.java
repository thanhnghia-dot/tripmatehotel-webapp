package aptech.tripmate.DTO;

import java.time.LocalDateTime;

import aptech.tripmate.models.Room;
import lombok.Data;

public class RoomDTO {
    private Long id;
    private String name;
    private int capacity;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;


    // Constructor mặc định
    public RoomDTO() {}

    // Constructor nhận đối tượng Room
    public RoomDTO(Room room, LocalDateTime checkIn, LocalDateTime checkOut) {
        this.id = room.getId();
        this.name = room.getRoomName();
        this.capacity = room.getCapacity();
        this.checkIn = checkIn;
        this.checkOut = checkOut;
    }

    // Getter và Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }
    public LocalDateTime getCheckIn() {
        return checkIn;
    }
    public void setCheckIn(LocalDateTime checkIn) {
        this.checkIn = checkIn;
    }
    public LocalDateTime getCheckOut() {
        return checkOut;
    }
    public void setCheckOut(LocalDateTime checkOut) {
        this.checkOut = checkOut;
    }
}
