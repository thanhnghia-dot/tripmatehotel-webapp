package aptech.tripmate.services;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import aptech.tripmate.DTO.RoomItem;
import aptech.tripmate.models.RoomType;
import aptech.tripmate.repositories.RoomTypeRepository;
import aptech.tripmate.repositories.TripRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import aptech.tripmate.DTO.SearchRoomItem;
import aptech.tripmate.DTO.UpCreRoomReq;
import aptech.tripmate.enums.RoomStatus;
import aptech.tripmate.models.Hotel;
import aptech.tripmate.models.Room;
import aptech.tripmate.repositories.HotelRepository;
import aptech.tripmate.repositories.RoomRepository;
import aptech.tripmate.untils.PagedData;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class RoomServiceImpl implements RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private UploadFileService uploadFileService;

    private static final String IMAGE_SUBFOLDER = "rooms";
    @Autowired
    private TripRoomRepository tripRoomRepository;
    @Autowired
    private RoomTypeRepository roomTypeRepository;
    @Override
    public Room findById(Long id) {
        return roomRepository.findById(id).orElse(null);
    }
    @Override
    public Long createRoom(UpCreRoomReq req, MultipartFile[] files) {
        try {
            // Validate request
            if (req == null || req.getRoomName() == null || req.getHotelId() == null) {
                throw new IllegalArgumentException("Invalid room data");
            }

            // Fetch Hotel entity
            var hotel = hotelRepository.findById(req.getHotelId())
                    .orElseThrow(() -> new RuntimeException("Hotel not found with ID: " + req.getHotelId()));
            RoomType roomType = roomTypeRepository.findById(req.getRoomTypeId())
                    .orElseThrow(() -> new RuntimeException("RoomType not found with ID: " + req.getRoomTypeId()));
            // Handle multiple image uploads
            List<String> imageUrls = new ArrayList<>();
            if (files != null && files.length > 0) {
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        String imageUrl = uploadFileService.storeImage(IMAGE_SUBFOLDER, file);
                        imageUrls.add(imageUrl);
                    }
                }
            }
            double finalPrice = req.getPrice() != null ? req.getPrice() : 0;
            if (req.getDiscountPercentage() != null && req.getDiscountPercentage() > 0) {
                finalPrice = finalPrice * (1 - req.getDiscountPercentage() / 100);
            }
            // Create Room entity
            Room room = Room.builder()
                    .roomName(req.getRoomName())
                    .description(req.getDescription())
                    .price(req.getPrice())
                    .imageUrl(String.join(",", imageUrls))
                    .numberOfBeds(req.getNumberOfBeds())
                    .discountPercentage(req.getDiscountPercentage())
                    .finalPrice(finalPrice)
                    .capacity(req.getCapacity())
                    .hotel(hotel)
                    .roomType(roomType)
                    .roomStatus(RoomStatus.AVAILABLE)
                    .build();

            // Save to database
            room = roomRepository.save(room);
            log.info("Created room with ID: {}", room.getId());
            return room.getId();
        } catch (IOException e) {
            log.error("Error uploading images for room creation: {}", e.getMessage());
            throw new RuntimeException("Failed to upload images", e);
        } catch (Exception e) {
            log.error("Error creating room: {}", e.getMessage());
            throw new RuntimeException("Failed to create room", e);
        }
    }

    @Override
    public void updateRoom(Long id, UpCreRoomReq req, MultipartFile[] files) {
        try {
            // Find existing room
            Room room = roomRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Room not found with ID: " + id));

            // Handle hotel update
            Hotel hotel = room.getHotel();
            if (req.getHotelId() != null) {
                hotel = hotelRepository.findById(req.getHotelId())
                        .orElseThrow(() -> new RuntimeException("Hotel not found with ID: " + req.getHotelId()));
            }
            RoomType roomType = null;
            if (req.getRoomTypeId() != null) {
                roomType = roomTypeRepository.findById(req.getRoomTypeId())
                        .orElseThrow(() -> new RuntimeException("RoomType not found with ID: " + req.getRoomTypeId()));
                room.setRoomType(roomType);
            }

            // Handle image updates
            List<String> imageUrls = new ArrayList<>();
            if (files != null && files.length > 0) {
                // Delete old images if they exist
                if (room.getImageUrl() != null && !room.getImageUrl().isEmpty()) {
                    String[] oldUrls = room.getImageUrl().split(",");
                    for (String url : oldUrls) {
                        try {
                            // Only attempt to delete valid local URLs
                            if (url.startsWith(UploadFileService.rootUrl + "/uploads/")) {
                                uploadFileService.clearImage(url);
                            } else {
                                log.warn("Skipping deletion of invalid or external URL: {}", url);
                            }
                        } catch (IOException e) {
                            log.warn("Failed to delete old image: {}", url, e);
                        }
                    }
                }

                // Upload new images
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        String imageUrl = uploadFileService.storeImage(IMAGE_SUBFOLDER, file);
                        imageUrls.add(imageUrl);
                    }
                }
            } else {
                // Keep existing images if no new files are provided
                if (room.getImageUrl() != null && !room.getImageUrl().isEmpty()) {
                    imageUrls = Arrays.stream(room.getImageUrl().split(","))
                            .filter(url -> url.startsWith(UploadFileService.rootUrl + "/uploads/"))
                            .collect(Collectors.toList());
                }
            }

            // Update room fields
            // Cập nhật các trường trước
            room.setRoomName(req.getRoomName() != null ? req.getRoomName() : room.getRoomName());
            room.setDescription(req.getDescription() != null ? req.getDescription() : room.getDescription());
            room.setPrice(req.getPrice() != null ? req.getPrice() : room.getPrice());
            room.setImageUrl(String.join(",", imageUrls));
            room.setCapacity(req.getCapacity() != 0 ? req.getCapacity() : room.getCapacity());
            room.setNumberOfBeds(req.getNumberOfBeds() > 0 ? req.getNumberOfBeds() : room.getNumberOfBeds());
            room.setHotel(hotel);
            room.setDiscountPercentage(
                    req.getDiscountPercentage() != null ? req.getDiscountPercentage() : room.getDiscountPercentage()
            );
            room.setRoomType(roomType);

// ✅ Tính lại finalPrice với giá trị mới
            double basePrice = room.getPrice() != null ? room.getPrice() : 0;
            Double discount = room.getDiscountPercentage() != null ? room.getDiscountPercentage() : 0;
            double finalPrice = basePrice;
            if (discount > 0) {
                finalPrice = basePrice * (1 - discount / 100);
            }
            room.setFinalPrice(finalPrice);

            // Save updated room
            roomRepository.save(room);
            log.info("Updated room with ID: {}", id);
        } catch (IOException e) {
            log.error("Error uploading images for room update: {}", e.getMessage());
            throw new RuntimeException("Failed to upload images", e);
        } catch (Exception e) {
            log.error("Error updating room with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to update room", e);
        }
    }

    @Override
    public void deleteRoom(Long id) {
        try {
            Room room = roomRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Room not found with ID: " + id));

            if (room.getImageUrl() != null && !room.getImageUrl().isEmpty()) {
                String[] imageUrls = room.getImageUrl().split(",");
                for (String url : imageUrls) {
                    try {
                        uploadFileService.clearImage(url);
                    } catch (IOException e) {
                        log.warn("Failed to delete image: {}", url);
                    }
                }
            }

            roomRepository.deleteById(id);
            log.info("Deleted room with ID: {}", id);
        } catch (Exception e) {
            log.error("Error deleting room with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to delete room", e);
        }
    }

    @Override
public PagedData<SearchRoomItem> searchRooms(String name, Pageable pageable) {
    try {
        // Search rooms by name (case-insensitive, partial match)
        Page<Room> roomPage;
        if (name != null && !name.trim().isEmpty()) {
            roomPage = roomRepository.findByRoomNameContainingIgnoreCase(name, pageable);
        } else {
            roomPage = roomRepository.findAll(pageable);
        }

        // Map Room entities to SearchRoomItem DTOs
        List<SearchRoomItem> items = roomPage.getContent().stream()
                .map(room -> {
                    double finalPrice = room.getPrice() != null ? room.getPrice() : 0;
                    if (room.getDiscountPercentage() != null && room.getDiscountPercentage() > 0) {
                        finalPrice = finalPrice * (1 - room.getDiscountPercentage() / 100);
                    }
                    return SearchRoomItem.builder()
                            .id(room.getId())
                            .roomName(room.getRoomName())
                            .description(room.getDescription())
                            .price(room.getPrice())
                            .discountPercentage(room.getDiscountPercentage()) // map vào
                            .finalPrice(finalPrice)                           // map vào
                            .imageUrl(room.getImageUrl() != null ? List.of(room.getImageUrl().split(",")) : List.of())
                            .capacity(room.getCapacity())
                            .numberOfBeds(room.getNumberOfBeds())
                            .hotelId(room.getHotel() != null ? room.getHotel().getId() : null)
                            .hotelName(room.getHotel() != null ? room.getHotel().getName() : null)
                            .roomType(room.getRoomType() != null ? room.getRoomType().getTypeName() : null)
                            .roomStatus(room.getRoomStatus().name())
                            .build();
                }).toList();


        // Return paged data
        return PagedData.<SearchRoomItem>builder()
                .pageNo(roomPage.getNumber())
                .elementPerPage(roomPage.getSize())
                .totalElements(roomPage.getTotalElements())
                .totalPages(roomPage.getTotalPages())
                .elementList(items)
                .build();
    } catch (Exception e) {
        log.error("Error searching rooms: {}", e.getMessage());
        throw new RuntimeException("Failed to search rooms", e);
    }
}

    @Override
    public void changeStatus(Long id, RoomStatus roomStatus) {
        var room = roomRepository.findById(id).orElseThrow(
            ()-> new RuntimeException("Room not found")
        );
        room.setRoomStatus(roomStatus);

        roomRepository.save(room);
    }
    @Override
    public List<RoomItem> getRoomsWithStatusByHotel(Long hotelId) {
        List<Room> rooms = roomRepository.findByHotelId(hotelId); // <-- phải gọi đúng
        return rooms.stream().map(room -> {
            RoomItem item = new RoomItem();
            item.setId(room.getId());
            item.setRoomName(room.getRoomName()); // <-- đảm bảo gọi đúng
            item.setCapacity(room.getCapacity());
            item.setPrice(room.getPrice());
            item.setImageUrl(room.getImageUrl());
            item.setStatus(room.getRoomStatus()); // <-- không hardcode ở đây!
            return item;
        }).toList();
    }
    @Override
    public List<RoomItem> getRoomsWithDiscount(Long hotelId) {
        List<Room> rooms = roomRepository.findByHotelId(hotelId);
        return rooms.stream().map(room -> {
            RoomItem item = new RoomItem();
            item.setId(room.getId());
            item.setRoomName(room.getRoomName());
            item.setCapacity(room.getCapacity());
            item.setPrice(room.getPrice());
            item.setDiscountPercentage(room.getDiscountPercentage());
            // Tính giá sau giảm
            double finalPrice = room.getPrice() != null ? room.getPrice() : 0;
            if (room.getDiscountPercentage() != null && room.getDiscountPercentage() > 0) {
                finalPrice = finalPrice * (1 - room.getDiscountPercentage() / 100);
            }
            item.setFinalPrice(finalPrice);
            item.setImageUrl(room.getImageUrl());
            item.setStatus(room.getRoomStatus());
            return item;
        }).toList();
    }
}

