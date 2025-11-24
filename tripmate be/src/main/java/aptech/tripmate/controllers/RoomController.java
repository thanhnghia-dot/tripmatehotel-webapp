package aptech.tripmate.controllers;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import aptech.tripmate.DTO.*;
import aptech.tripmate.models.Room;
import aptech.tripmate.models.TripRoom;
import aptech.tripmate.models.User;
import aptech.tripmate.repositories.TripRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import aptech.tripmate.enums.RoomStatus;
import aptech.tripmate.repositories.RoomRepository;
import aptech.tripmate.services.RoomService;
import aptech.tripmate.services.UploadFileService;
import aptech.tripmate.untils.PagedData;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/rooms")
@Slf4j
public class RoomController {


    @Autowired
    private RoomService roomService;


    @Autowired
    private UploadFileService uploadFileService;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private TripRoomRepository tripRoomRepository;

    @DeleteMapping("/{roomId}/images/{imageUrl}")
    public ResponseEntity<String> deleteRoomImage(
            @PathVariable Long roomId,
            @PathVariable String imageUrl) {
        try {
            uploadFileService.clearImage(imageUrl);
            return new ResponseEntity<>("Image deleted successfully", HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>("Failed to delete image: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
   
        }
    }
    @PatchMapping("/change-status/{id}")
    public ResponseEntity<Void> changeStatus(
        @PathVariable("id") Long id,
        RoomStatus status )
    {
        try {
            roomService.changeStatus(id, status);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
    }   

   @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Long> createRoom(
            @Valid @RequestPart("request") UpCreRoomReq request,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {
        try {
            log.info("Creating room with name: {}", request.getRoomName());
            Long roomId = roomService.createRoom(request, files);
            return new ResponseEntity<>(roomId, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            log.error("Invalid request data: {}", e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            log.error("Error creating room: {}", e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> updateRoom(
            @PathVariable Long id,
            @RequestPart("request") UpCreRoomReq request,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {
        try {
            log.info("Updating room with ID: {}", id);
            roomService.updateRoom(id, request, files);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            log.error("Invalid request data or room not found: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (RuntimeException e) {
            log.error("Error updating room with ID {}: {}", id, e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        try {
            log.info("Deleting room with ID: {}", id);
            roomService.deleteRoom(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            log.error("Room not found with ID {}: {}", id, e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (RuntimeException e) {
            log.error("Error deleting room with ID {}: {}", id, e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<PagedData<SearchRoomItem>> searchRooms(
            @RequestParam(value = "name", required = false) String name,
            @PageableDefault(size = 4) Pageable pageable) {
        try {
            log.info("Searching rooms with name: {} and pageable: {}", name, pageable);
            PagedData<SearchRoomItem> result = roomService.searchRooms(name, pageable);
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (RuntimeException e) {
            log.error("Error searching rooms: {}", e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/{roomId}/history")
    public List<Map<String, Object>> getRoomHistory(@PathVariable Long roomId) {
        List<TripRoom> tripRooms = tripRoomRepository.findByRoomId(roomId);

        // Chỉ trả về id, checkIn, checkOut
        return tripRooms.stream().map(tr -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", tr.getId());
            map.put("checkIn", tr.getCheckIn());
            map.put("checkOut", tr.getCheckOut());

            return map;
        }).toList();
    }

    @GetMapping("/with-status")
    public ResponseEntity<List<RoomItem>> getRoomsWithStatus(@RequestParam Long hotelId) {
        List<RoomItem> rooms = roomService.getRoomsWithStatusByHotel(hotelId);

        // Tính finalPrice dựa trên discountPercentage nếu có
        rooms.forEach(r -> {
            if (r.getDiscountPercentage() != null && r.getDiscountPercentage() > 0 && r.getPrice() != null) {
                r.setFinalPrice(r.getPrice() * (1 - r.getDiscountPercentage() / 100));
            } else {
                r.setFinalPrice(r.getPrice());
            }
        });

        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<RoomDTO> getRoomById(@PathVariable Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found")); // hoặc custom exception

        return ResponseEntity.ok(new RoomDTO(room));
    }
    @GetMapping("/status-summary")
    public ResponseEntity<Map<String, Long>> getRoomStatusSummary() {
        List<Room> rooms = roomRepository.findAll();

        long available = rooms.stream()
                .filter(r -> r.getRoomStatus() == RoomStatus.AVAILABLE)
                .count();

        long booked = rooms.stream()
                .filter(r -> r.getRoomStatus() == RoomStatus.BOOKED)
                .count();

        Map<String, Long> result = new HashMap<>();
        result.put("available", available);
        result.put("booked", booked);

        return ResponseEntity.ok(result);
    }





}
