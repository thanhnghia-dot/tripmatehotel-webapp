package aptech.tripmate.services;

import aptech.tripmate.DTO.*;
import aptech.tripmate.models.*;
import aptech.tripmate.repositories.*;
import aptech.tripmate.specification.HotelSpecification;
import aptech.tripmate.untils.DuplicateHotelException;
import aptech.tripmate.untils.PagedData;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class HotelServiceImpl implements HotelService {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UploadFileService uploadFileService;
    @Autowired
    private TripRoomRepository tripRoomRepository;
    @Autowired
    private HotelReviewRepository hotelReviewRepository;
    @Autowired
    private AmenityRepository amenityRepository;
    @Autowired
    private RoomRepository roomRepository;

    @Override
    public PagedData<SearchHotelResponseItem> searchHotels(SearchHotelCreteria creteria, Pageable pageable) {
        var hotelSpec = HotelSpecification.searchHotels(creteria);
        var hotelPage = hotelRepository.findAll(hotelSpec, pageable);

        List<SearchHotelResponseItem> items = hotelPage.getContent().stream().map(hotel -> {
            List<RoomItem> roomItems = hotel.getRooms().stream().map(room -> {
                RoomItem item = new RoomItem();
                item.setId(room.getId());
                item.setRoomName(room.getRoomName());
                item.setDescription(room.getDescription());
                item.setPrice(room.getPrice());
                item.setImageUrl(room.getImageUrl());
                item.setCapacity(room.getCapacity());
                item.setStatus(room.getRoomStatus());
                item.setRoomType(room.getRoomType() != null ? room.getRoomType().getTypeName() : null);
                // ✅ THÊM DÒNG NÀY

                return item;
            }).collect(Collectors.toList());

            SearchHotelResponseItem item = new SearchHotelResponseItem();
            item.setId(hotel.getId());
            item.setName(hotel.getName());
            item.setAddress(hotel.getAddress());
            item.setStreetAddress(hotel.getStreetAddress());
            item.setStarRating(hotel.getStarRating());
            item.setRooms(roomItems);
            item.setImageUrl(hotel.getImageUrl());
            item.setDescription(hotel.getDescription());
            item.setAmenityIds(
                    hotel.getAmenities().stream()
                            .map(a -> new AmenityDTO(a.getId(), a.getName()))
                            .collect(Collectors.toList())
            );
            item.setRoomTypes(
                    hotel.getRoomTypes().stream()
                            .map(RoomTypeDTO::new)
                            .collect(Collectors.toList())
            );
            item.setStreetAddress(hotel.getStreetAddress());
            return item;
        }).collect(Collectors.toList());

        return PagedData.<SearchHotelResponseItem>builder()
                .pageNo(hotelPage.getNumber())
                .elementPerPage(hotelPage.getSize())
                .totalElements(hotelPage.getTotalElements())
                .totalPages(hotelPage.getTotalPages())
                .elementList(items)
                .build();
    }


    @Override
    public Long createHotel(HotelCreateRequestDTO dto, MultipartFile file) {
        hotelRepository.findByName(dto.getName()).ifPresent(h -> {
            log.error("Hotel with name '{}' already exists.", dto.getName());
            throw new DuplicateHotelException("Hotel with name '" + dto.getName() + "' already exists.");
        });
        List<Amenity> amenities = dto.getAmenityIds() == null
                ? List.of()
                : dto.getAmenityIds().stream()
                .map(amenityId -> amenityRepository.findById(amenityId)
                        .orElseThrow(() -> new IllegalArgumentException("Amenity not found: " + amenityId)))
                .collect(Collectors.toList());



        try {
            var saved = uploadFileService.storeImage("hotels", file);
            Hotel hotel = hotelRepository.save(Hotel.builder()
                    .name(dto.getName())
                    .address(dto.getAddress())
                    .imageUrl(saved)
                    .imageUrls(dto.getImageUrls())
                    .description(dto.getDescription())
                    .starRating(dto.getStarRating())
                    .commissionPercent(10.0)
                    .amenities(amenities)
                    .streetAddress(dto.getStreetAddress())
                    .build());

            return hotel.getId();
        } catch (IOException e) {
            log.error("Error when saving image for hotel '{}': {}", dto.getName(), e.getMessage());
            throw new RuntimeException("Error when saving image: " + e.getMessage());
        }
    }
    @Override
    public void updateHotel(Long id, HotelCreateRequestDTO dto, MultipartFile file) {
        try {
            Hotel hotel = hotelRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Cannot found Hotel with ID: " + id));

            hotel.setName(dto.getName());
            hotel.setAddress(dto.getAddress());
            hotel.setDescription(dto.getDescription());
            hotel.setStarRating(dto.getStarRating());
            hotel.setCommissionPercent(10.0);
            hotel.setStreetAddress(dto.getStreetAddress());
            // ✅ Chuyển danh sách String sang Set<Amenity> (dựa trên tên)

            List<Amenity> amenities = dto.getAmenityIds() == null
                    ? List.of()
                    : dto.getAmenityIds().stream()
                    .map(amenityId -> amenityRepository.findById(amenityId)
                            .orElseThrow(() -> new IllegalArgumentException("Amenity not found: " + amenityId)))
                    .collect(Collectors.toList());

            hotel.setAmenities(amenities);
            hotel.setImageUrls(dto.getImageUrls());



            hotel.setAmenities(amenities); // ✅ bạn đang thiếu dòng này!

            if (file != null && !file.isEmpty()) {
                if (hotel.getImageUrl() != null) {
                    uploadFileService.clearImage(hotel.getImageUrl());
                }
                String newImageUrl = uploadFileService.storeImage("hotels", file);
                hotel.setImageUrl(newImageUrl);
            }

            hotelRepository.save(hotel);
        } catch (IOException e) {
            throw new RuntimeException("Error when updating hotel image: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error when updating hotel: " + e.getMessage());
        }
    }

    @Override
    public void deleteHotel(Long id) {
        try {
            var tripWithHotel = tripRepository.findByHotelId(id);
            if (tripWithHotel.isPresent()) {
                throw new IllegalStateException("Cannot delete Hotel with Trip ID: " + tripWithHotel.get().getTripId());
            }

            Hotel hotel = hotelRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Cannot found hotel with Id: " + id));

            if (hotel.getImageUrl() != null) {
                uploadFileService.clearImage(hotel.getImageUrl());
            }

            hotelRepository.delete(hotel);
        } catch (IOException e) {
            throw new RuntimeException("Error when delete hotel image: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error when delete hotel image: " + e.getMessage());
        }
    }
    @Override
    public List<HotelRatingComparisonDTO> getRecommendedHotelsByAddress(String address) {
        List<HotelRatingComparisonDTO> hotels = hotelRepository.findTopRatedHotelsByAddress(address);

        for (HotelRatingComparisonDTO dto : hotels) {
            String reason;
            if (dto.getAverageRating() >= 4.5) {
                reason = "🌟 Highly rated by guests — over 4.5 stars!";
            } else if (dto.getReviewCount() > 20) {
                reason = "🔥 Popular choice with over 20 reviews!";
            } else {
                reason = "📍 Recommended based on location";
            }
            dto.setReason(reason);
        }

        return hotels;
    }
    public List<Hotel> findHotelsWithAvailableRooms(LocalDateTime checkIn, LocalDateTime checkOut, String address) {
        // lấy toàn bộ phòng còn trống trong thời gian đó
        List<Room> availableRooms = roomRepository.findAvailableRooms(checkIn, checkOut);

        // lọc hotel dựa trên địa chỉ nếu có
        return availableRooms.stream()
                .map(room -> room.getRoomType().getHotel())
                .filter(hotel -> address == null || hotel.getAddress().toLowerCase().contains(address.toLowerCase()))
                .distinct()
                .toList();
    }


}
