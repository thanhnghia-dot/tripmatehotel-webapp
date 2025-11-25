package aptech.tripmate.DTO;

import aptech.tripmate.models.Room;

public class RoomDTO {
    private Long id;
    private String roomName;
    private int roomCapacity;

    // Constructor mặc định
    public RoomDTO() {}

    // Constructor nhận đối tượng Room
    public RoomDTO(Room room) {
        this.id = room.getId();
        this.roomName = room.getRoomName();
        this.roomCapacity = room.getRoomCapacity();
    }

    // Getter và Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String name) {
        this.roomName = name;
    }

    public int getRoomCapacity() {
        return roomCapacity;
    }

    public void setRoomCapacity(int capacity) {
        this.roomCapacity = capacity;
    }
}
