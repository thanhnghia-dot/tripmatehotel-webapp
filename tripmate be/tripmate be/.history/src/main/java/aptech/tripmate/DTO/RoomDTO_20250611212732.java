package aptech.tripmate.DTO;

import aptech.tripmate.models.Room;

public class RoomDTO {
    private Long id;
    private String name;
    private int capacity;

    // Constructor mặc định
    public RoomDTO() {}

    // Constructor nhận đối tượng Room
    public RoomDTO(Room room) {
        this.id = room.getId();
        this.name = room.getRoomName();
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
}
