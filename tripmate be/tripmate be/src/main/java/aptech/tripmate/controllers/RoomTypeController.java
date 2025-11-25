package aptech.tripmate.controllers;

import aptech.tripmate.DTO.RoomDTO;
import aptech.tripmate.DTO.RoomTypeDTO;
import aptech.tripmate.DTO.UpCreRoomTypeReq;
import aptech.tripmate.jwt.JwtUtil;
import aptech.tripmate.models.Hotel;
import aptech.tripmate.models.Room;
import aptech.tripmate.models.RoomType;
import aptech.tripmate.repositories.HotelRepository;
import aptech.tripmate.repositories.RoomRepository;
import aptech.tripmate.repositories.RoomTypeRepository;
import aptech.tripmate.services.RoomTypeService;
import aptech.tripmate.services.UploadFileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rooms-types")
public class RoomTypeController {
    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private HotelRepository hotelRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UploadFileService uploadFileService;
    @Autowired
    private RoomTypeService roomTypeService;


    @GetMapping("/by-hotel")
    public List<RoomType> getRoomTypesByHotel(@RequestParam Long hotelId) {
        return roomTypeRepository.findByHotelId(hotelId);
    }

    // ✅ Lấy danh sách Room theo RoomTypeId
    @GetMapping("/{roomTypeId}/rooms")
    public List<Room> getRoomsByRoomType(@PathVariable @Valid Long roomTypeId) {
        return roomRepository.findByRoomTypeId(roomTypeId);
    }
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Long> createRoomType(
            @RequestPart("request") UpCreRoomTypeReq request,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {

        try {
            Hotel hotel = hotelRepository.findById(request.getHotelId())
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));

            RoomType roomType = new RoomType();
            roomType.setTypeName(request.getTypeName());
            roomType.setDescription(request.getDescription());
            roomType.setHotel(hotel);

            // ✅ Upload ảnh dùng storeImage của bạn
            if (files != null && files.length > 0) {
                List<String> imageUrls = new ArrayList<>();
                for (MultipartFile file : files) {
                    String url = uploadFileService.storeImage("roomtypes", file); // giống RoomController
                    imageUrls.add(url);
                }
                roomType.setImageUrls(imageUrls);
            }

            RoomType saved = roomTypeRepository.save(roomType);
            return new ResponseEntity<>(saved.getId(), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("")
    public ResponseEntity<?> getAllRoomTypes() {
        List<RoomType> entities = roomTypeRepository.findAll();
        List<RoomTypeDTO> dtos = entities.stream()
                .map(RoomTypeDTO::new) // ✅ dùng constructor RoomTypeDTO(RoomType roomType)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateRoomType(
            @PathVariable Long id,
            @RequestPart("request") UpCreRoomTypeReq request,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {

        try {
            RoomType roomType = roomTypeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("RoomType not found"));

            Hotel hotel = hotelRepository.findById(request.getHotelId())
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));

            roomType.setTypeName(request.getTypeName());
            roomType.setDescription(request.getDescription());
            roomType.setHotel(hotel);

            if (files != null && files.length > 0) {
                List<String> imageUrls = new ArrayList<>();
                for (MultipartFile file : files) {
                    String url = uploadFileService.storeImage("roomtypes", file);
                    imageUrls.add(url);
                }
                roomType.setImageUrls(imageUrls);
            }

            RoomType updated = roomTypeRepository.save(roomType);
            return ResponseEntity.ok(updated.getId());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getRoomType(@PathVariable Long id) {
        RoomTypeDTO dto = roomTypeService.getRoomTypeDetails(id);
        return ResponseEntity.ok(dto);
    }


}
