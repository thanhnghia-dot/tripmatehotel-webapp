package aptech.tripmate.controllers;

import aptech.tripmate.DTO.RoomDTO;
import aptech.tripmate.models.Hotel;
import aptech.tripmate.models.Room;
import aptech.tripmate.repositories.HotelRepository;
import aptech.tripmate.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    // 1. Lấy danh sách tất cả khách sạn
    @GetMapping
    public ResponseEntity<List<Hotel>> getAllHotels() {
        List<Hotel> hotels = hotelRepository.findAll();
        return ResponseEntity.ok(hotels);
    }

    // 2. Lấy danh sách phòng theo hotelId
   @GetMapping("/{hotelId}/rooms")
    public ResponseEntity<List<RoomDTO>> getRoomsByHotel(@PathVariable Long hotelId) {
        List<Room> rooms = roomRepository.findByHotel_Id(hotelId);
        List<RoomDTO> roomDTOs = rooms.stream()
            .map(RoomDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(roomDTOs);
    }

    // 3. (Tuỳ chọn) Thêm khách sạn mới — nếu bạn muốn nhập từ form riêng
    @PostMapping
    public ResponseEntity<Hotel> createHotel(@RequestBody Hotel hotel) {
        Hotel savedHotel = hotelRepository.save(hotel);
        return ResponseEntity.ok(savedHotel);
    }

}
