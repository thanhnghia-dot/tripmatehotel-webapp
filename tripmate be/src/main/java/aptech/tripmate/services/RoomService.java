package aptech.tripmate.services;

import aptech.tripmate.DTO.*;
import aptech.tripmate.models.Room;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import aptech.tripmate.enums.RoomStatus;
import aptech.tripmate.untils.PagedData;

import java.util.List;
import java.util.stream.Collectors;

public interface RoomService {
    Long createRoom(UpCreRoomReq req, MultipartFile[] file);

    void updateRoom(Long id,  UpCreRoomReq req, MultipartFile[] file);

    void deleteRoom(Long id); 

    PagedData<SearchRoomItem> searchRooms(String name, Pageable pageable);

    void changeStatus(Long id, RoomStatus roomStatus);

    List<RoomItem> getRoomsWithStatusByHotel(Long hotelId);
    Room findById(Long id);
    List<RoomItem> getRoomsWithDiscount(Long hotelId);
}
