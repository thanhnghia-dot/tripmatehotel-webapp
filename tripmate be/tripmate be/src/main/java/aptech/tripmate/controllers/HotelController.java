package aptech.tripmate.controllers;

import aptech.tripmate.DTO.*;
import aptech.tripmate.models.Amenity;
import aptech.tripmate.models.Hotel;
import aptech.tripmate.models.Room;
import aptech.tripmate.models.Trip;
import aptech.tripmate.repositories.HotelRepository;
import aptech.tripmate.repositories.HotelReviewRepository;
import aptech.tripmate.repositories.RoomRepository;
import aptech.tripmate.services.HotelService;
import aptech.tripmate.services.TripRoomService;
import aptech.tripmate.services.TripService;
import aptech.tripmate.untils.ApiResponse;
import aptech.tripmate.untils.PagedData;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;



@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private HotelService hotelService;
    @Autowired
    private HotelReviewRepository hotelReviewRepository;
    @Autowired
    private TripRoomService tripRoomService;
    @Autowired
    private TripService tripService;



    @GetMapping("/searchAll")
    public ResponseEntity<ApiResponse<PagedData<SearchHotelResponseItem>>> searchAllHotels(
            SearchHotelCreteria creteria,
            Pageable pageable) {

        // Ghi đè pageable để lấy tất cả
        pageable = Pageable.ofSize(Integer.MAX_VALUE);

        PagedData<SearchHotelResponseItem> result = hotelService.searchHotels(creteria, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Search completed successfully"));
    }


    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PagedData<SearchHotelResponseItem>>> searchHotels(
            SearchHotelCreteria creteria,
            @PageableDefault(size = 4) Pageable pageable) {
        PagedData<SearchHotelResponseItem> result = hotelService.searchHotels(creteria, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Search completed successfully"));

    }


    @PutMapping("/{id}")
    public ResponseEntity<Void> updateHotel(
            @PathVariable Long id,
            @RequestPart("req") HotelCreateRequestDTO req,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        hotelService.updateHotel(id, req, file);
        return ResponseEntity.ok().build();
    }


    @DeleteMapping("{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long id){
        hotelService.deleteHotel(id);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/hotel-stats")
    public ResponseEntity<?> getHotelStats() {
        List<HotelStatsDTO> stats = tripRoomService.getHotelStatistics();
        return ResponseEntity.ok(Map.of("data", stats));
    }

    // 1. Lấy danh sách tất cả khách sạn
    @GetMapping
    public ResponseEntity<List<HotelDTO>> getAllHotels() {
        List<Hotel> hotels = hotelRepository.findAllWithRoomTypes();
        List<HotelDTO> hotelDTOs = hotels.stream()
                .map(hotel -> {
                    List<Amenity> copiedAmenities = new ArrayList<>(hotel.getAmenities());
                    hotel.setAmenities(new ArrayList<>(copiedAmenities)); // gán bản sao để tránh modify khi map
                    return new HotelDTO(hotel);
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(hotelDTOs);
    }



    // 2. Lấy danh sách phòng theo hotelId
    @GetMapping("/{hotelId}/rooms")
    public ResponseEntity<List<RoomDTO>> getRoomsByHotel(@PathVariable Long hotelId) {
        List<Room> rooms = roomRepository.findByHotel_Id(hotelId);

        // Ví dụ: truyền thời gian mặc định (hoặc null nếu bạn handle ở frontend)
        LocalDateTime defaultCheckIn = null;
        LocalDateTime defaultCheckOut = null;

        List<RoomDTO> roomDTOs = rooms.stream()
                .map(room -> new RoomDTO(room, defaultCheckIn, defaultCheckOut))
                .collect(Collectors.toList());

        return ResponseEntity.ok(roomDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getHotelById(@PathVariable Long id) {
        try {
            Hotel hotel = hotelRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));

            List<RoomDTO> roomDTOs = hotel.getRooms().stream()
                    .map(RoomDTO::new)
                    .toList();
            List<RoomTypeDTO> roomTypeDTOs = hotel.getRoomTypes().stream()
                    .map(RoomTypeDTO::new)
                    .toList();
            List<HotelReviewRequestDTO> reviewDTOs = hotelReviewRepository.findByHotel_Id(hotel.getId()).stream()
                    .map(review -> {
                        HotelReviewRequestDTO dto = new HotelReviewRequestDTO();
                        dto.setHotelId(review.getHotel().getId());
                        dto.setRating(review.getRating());
                        dto.setComment(review.getComment());

                        return dto;
                    }).toList();

            HotelDTO hotelDTO = new HotelDTO(hotel, roomDTOs, reviewDTOs, roomTypeDTOs);

            return ResponseEntity.ok(Map.of("data", hotelDTO));
        } catch (Exception e) {
            e.printStackTrace(); // 👈 IN RA LỖI
            return ResponseEntity.status(500).body(Map.of(
                    "error", e.getMessage(),
                    "cause", e.getCause() != null ? e.getCause().toString() : "No cause"
            ));
        }
    }

    @GetMapping("/recommend")
    public ResponseEntity<List<HotelRatingComparisonDTO>> recommend(@RequestParam String address) {
        return ResponseEntity.ok(hotelService.getRecommendedHotelsByAddress(address));
    }


    @PostMapping
    public ResponseEntity<?> createHotel(
            @RequestPart("req") HotelCreateRequestDTO request,
            @RequestPart("file") MultipartFile file,
            @RequestPart("amenityIds") List<Long> amenityIds,
            @RequestPart("imageUrls") List<String> imageUrls
    ) {
        request.setAmenityIds(amenityIds);
        request.setImageUrls(imageUrls);

        Long hotelId = hotelService.createHotel(request, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("hotelId", hotelId));
    }
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableHotels(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkOut,
            @RequestParam(required = false) String address
    ) {
        List<Hotel> hotels = hotelService.findHotelsWithAvailableRooms(checkIn, checkOut, address);
        return ResponseEntity.ok(Map.of("data", hotels));
    }

}
