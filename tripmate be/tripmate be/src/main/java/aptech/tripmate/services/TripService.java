package aptech.tripmate.services;

import aptech.tripmate.DTO.AssignHotelRequestDTO;
import aptech.tripmate.DTO.DetailTripRes;
import aptech.tripmate.DTO.HotelDTO;
import aptech.tripmate.DTO.RoomBookingRequest;
import aptech.tripmate.DTO.SearchTripItem;
import aptech.tripmate.DTO.TripDTO;
import aptech.tripmate.DTO.TripMemberDTO;
import aptech.tripmate.DTO.TripRequestDTO;
import aptech.tripmate.DTO.TripRoomDTO;
import aptech.tripmate.DTO.TripCreateRequestDTO;
import aptech.tripmate.enums.MemberRole;
import aptech.tripmate.enums.MemberStatus;
import aptech.tripmate.models.Hotel;
import aptech.tripmate.models.Room;
import aptech.tripmate.models.Trip;
import aptech.tripmate.models.TripMember;
import aptech.tripmate.models.TripRoom;
import aptech.tripmate.models.User;
import aptech.tripmate.repositories.*;
import aptech.tripmate.untils.PagedData;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripMemberRepository tripMemberRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final TripRoomRepository tripRoomRepository;
    private final MessageRepository messageRepository; // ✅ thêm


    //cancel room
    public void cancelRoomBooking(Long tripId, Long roomId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        TripRoom tripRoom = tripRoomRepository.findByTripAndRoom(trip, room)
                .orElseThrow(() -> new RuntimeException("Room is not booked in this trip"));

        tripRoomRepository.delete(tripRoom);

        if (tripRoomRepository.findAllByTrip(trip).isEmpty()) {
            trip.setHotel(null);
            tripRepository.save(trip);
        }
    }

    public void cancelAllRoomsInTrip(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        List<TripRoom> tripRooms = tripRoomRepository.findAllByTrip(trip);
        if (tripRooms.isEmpty()) {
            throw new RuntimeException("No rooms to cancel in this trip.");
        }

        tripRoomRepository.deleteAll(tripRooms);

        trip.setHotel(null);
        tripRepository.save(trip);
    }
    public void updateVisibility(Long id, boolean isPublic) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        trip.setIsPublic(isPublic); // hoặc trip.setIsPublic(...)
        tripRepository.save(trip);
    }
    public List<Trip> findOnlyPublicTrips() {
        return tripRepository.findByIsPublicTrue();
    }

    public List<Trip> findTripsForCurrentUserAndPublic() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;

        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();

        List<Trip> ownedTrips = tripRepository.findByUser(user);
        List<TripMember> acceptedMemberships = tripMemberRepository.findByUserAndStatus(user, MemberStatus.ACCEPTED);
        List<Trip> acceptedTrips = acceptedMemberships.stream().map(TripMember::getTrip).toList();
        List<Trip> publicTrips = tripRepository.findByIsPublicTrue();

        Set<Trip> allTrips = new HashSet<>();
        allTrips.addAll(ownedTrips);
        allTrips.addAll(acceptedTrips);
        allTrips.addAll(publicTrips);

        return new ArrayList<>(allTrips);
    }
    public PagedData<SearchTripItem> searchTrips(
            String name,
            String creator,
            LocalDateTime startDate,
            LocalDateTime endDate,
            LocalDateTime createdFrom,
            LocalDateTime createdTo,
            Long minMembers,
            Long maxMembers,
            String status, // ✅ nhận status
            Pageable pageable) {
        try {
            Page<Trip> tripPage;

            if (status != null && !status.isEmpty()) {
                // ✅ lọc theo status
                tripPage = tripRepository.findByStatus(status, pageable);
            } else if (name != null || creator != null || startDate != null || endDate != null) {
                tripPage = tripRepository.findBySearchCriteria(name, creator, startDate, endDate, null, pageable);
            } else {
                tripPage = tripRepository.findByFilterCriteria(createdFrom, createdTo, minMembers, maxMembers, null, pageable);
            }

            List<SearchTripItem> items = tripPage.getContent().stream()
                    .map(trip -> SearchTripItem.builder()
                            .id(trip.getTripId())
                            .name(trip.getName())
                            .type(trip.getType())
                            .startDate(trip.getStartDate())
                            .endDate(trip.getEndDate())
                            .status(trip.getStatus())     // ✅ hiển thị Planning / Ongoing / Completed
                            .isFinished(trip.getIsFinished())
                            .isPublic(trip.getIsPublic())
                            .build())
                    .collect(Collectors.toList());

            return PagedData.<SearchTripItem>builder()
                    .pageNo(tripPage.getNumber())
                    .elementPerPage(tripPage.getSize())
                    .totalElements(tripPage.getTotalElements())
                    .totalPages(tripPage.getTotalPages())
                    .elementList(items)
                    .build();
        } catch (Exception e) {
            log.error("Error searching trips: {}", e.getMessage());
            throw new RuntimeException("Failed to search trips", e);
        }
    }

    @Transactional(readOnly = true)
    public DetailTripRes getDetailTrip (Long tripId) {
        try {
            Trip trip = tripRepository.findTripBasicInfo(tripId)
                    .orElseThrow(() -> new IllegalArgumentException("Trip not found with ID: " + tripId));

            // Manually fetch tripRooms and tripMembers
            List<TripRoom> tripRooms = tripRepository.findTripRoomsByTripId(tripId);
            List<TripMember> tripMembers = tripRepository.findTripMembersByTripId(tripId);

            // Attach them manually (if needed)
            trip.setTripRooms(tripRooms);
            trip.setTripMembers(tripMembers);

            String roomName = null;
            List<String> roomImgs = new ArrayList<>();

            if (tripRooms != null && !tripRooms.isEmpty()) {
                TripRoom tripRoom = tripRooms.get(0);
                if (tripRoom.getRoom() != null) {
                    roomName = tripRoom.getRoom().getRoomName();
                    String imageUrl = tripRoom.getRoom().getImageUrl();
                    if (imageUrl != null && !imageUrl.isEmpty()) {
                        roomImgs = Arrays.asList(imageUrl.split(","));
                    }
                }
            }

            List<String> memberNames = tripMembers.stream()
                    .map(tm -> tm.getUser() != null ? tm.getUser().getName() : null)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            return DetailTripRes.builder()
                    .name(trip.getName())
                    .type(trip.getType())
                    .startDate(trip.getStartDate())
                    .departurePoint(trip.getDeparturePoint())
                    .status(trip.getStatus())
                    .endDate(trip.getEndDate())
                    .isFinished(trip.getIsFinished())
                    .isPublic(trip.getIsPublic())
                    .totalAmount(trip.getTotalAmount())
                    .createdAt(trip.getCreatedAt())
                    .hotel(trip.getHotel() != null ? trip.getHotel().getName() : null)
                    .hotelImg(trip.getHotel() != null ? trip.getHotel().getImageUrl() : null)
                    .roomName(roomName)
                    .roomImgs(roomImgs)
                    .createdByUser(trip.getUser() != null ? trip.getUser().getName() : null)
                    .memberCount(memberNames.size())
                    .memberNames(memberNames)
                    .build();

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get trip details", e);
        }
    }


    @Transactional
    public void deleteTrip(Long tripId, boolean confirm) {
        if (!confirm) {
            throw new IllegalArgumentException("Delete unconfirmed trips for ID: " + tripId);
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại: " + email));

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with ID: " + tripId));

        // ✅ Nếu không phải ADMIN thì phải là OWNER
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            TripMember tripMember = tripMemberRepository
                    .findByTripTripIdAndUserUserId(tripId, user.getUserId())
                    .orElseThrow(() -> new RuntimeException("Bạn không tham gia chuyến đi này."));

            if (tripMember.getRole() != MemberRole.OWNER) {
                throw new RuntimeException("❌ Chỉ OWNER mới được phép xoá chuyến đi này.");
            }
        }

        try {
            tripRoomRepository.deleteAll(tripRoomRepository.findAllByTrip(trip));
            tripMemberRepository.deleteAll(tripMemberRepository.findByTrip(trip));
            messageRepository.deleteByTripId(tripId);
            tripRepository.delete(trip);

            log.info("Deleted trip with ID: {}", tripId);
        } catch (Exception e) {
            log.error("Error while deleting trip with ID {}: {}", tripId, e.getMessage());
            throw new RuntimeException("Unable to delete trip", e);
        }
    }

    public List<Trip> findTripsForCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;

        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();

        // Lấy trip do chính user tạo
        List<Trip> ownedTrips = tripRepository.findByUser(user);

        // Lấy trip mà user đã được mời và đã accept
        List<TripMember> acceptedMemberships = tripMemberRepository.findByUserAndStatus(user, MemberStatus.ACCEPTED);

        List<Trip> acceptedTrips = acceptedMemberships.stream()
                .map(TripMember::getTrip)
                .toList();

        // Gộp lại và loại bỏ trùng lặp nếu cần
        Set<Trip> allTrips = new HashSet<>();
        allTrips.addAll(ownedTrips);
        if(!acceptedMemberships.isEmpty()) {
            allTrips.addAll(acceptedTrips);
        }

        return new ArrayList<>(allTrips);
    }

    public Trip findById(Long id){
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;

        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại: " + email));

        Optional<Trip> tripOptional = tripRepository.findById(id);
        return tripOptional.orElse(null);
    }

    public TripDTO getTripDetails(Long id){
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;

        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại: " + email));

        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Trip not found"));

        List<TripMember> members = tripMemberRepository.findByTrip(trip);
        List<TripMemberDTO> memberDTOs = members.stream()
                .filter(member -> member.getStatus() != MemberStatus.INACTIVE) // ✅ lọc bỏ
                .map(member -> TripMemberDTO.builder()
                        .id(member.getId())
                        .email(member.getEmail())
                        .role(member.getRole())
                        .name(member.getUser() != null ? member.getUser().getName() : "Unknown")
                        .status(member.getStatus())
                        .build())
                .collect(Collectors.toList());

        List<TripRoom> tripRooms = tripRoomRepository.findByTrip_TripId(trip.getTripId());
        List<TripRoomDTO> roomDTOs = tripRooms.stream()
                .map(tr -> TripRoomDTO.builder()
                        .roomId(tr.getRoom().getId())
                        .roomName(tr.getRoom().getRoomName())
                        .capacity(tr.getRoom().getCapacity())
                        .hotelName(tr.getRoom().getHotel().getName())
                        .checkIn(tr.getCheckIn())
                        .checkOut(tr.getCheckOut())
                        .build())
                .collect(Collectors.toList());

        return TripDTO.builder()
                .id(trip.getTripId())
                .name(trip.getName())
                .destination(trip.getDestination())
                .departurePoint(trip.getDeparturePoint())
                .status(trip.getStatus())
                .type(trip.getType())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .isPublic(trip.getIsPublic())
                .totalAmount(trip.getTotalAmount())
                .isFinished(trip.getIsFinished() == null ? false : trip.getIsFinished())
                .members(memberDTOs)
                .rooms(roomDTOs)
                .hotel(trip.getHotel() != null ? new HotelDTO(trip.getHotel()) : null)
                .build();
    }
    @Transactional
    public Trip createTripWithHotel(TripCreateRequestDTO request) {
        // Lấy user hiện tại
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;

        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại: " + email));
// Validate ngày
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }

// Tuỳ chọn: không cho trip trong quá khứ
        if (request.getStartDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Start date cannot be in the past.");
        }
        Trip trip = Trip.builder()
                .name(request.getName())
                .destination(request.getDestination())
                .departurePoint(request.getDeparturePoint())
                .status(request.getStatus())
                .type(request.getType())
                .startDate(request.getStartDate())
                .initialTotalAmount(request.getTotalAmount())
                .endDate(request.getEndDate())
                .isPublic(request.getIsPublic())
                .totalAmount(request.getTotalAmount())
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();

        Trip savedTrip = tripRepository.save(trip);

        // Lưu người tạo trip là thành viên (OWNER)
        TripMember member = TripMember.builder()
                .trip(savedTrip)
                .email(email)
                .status(MemberStatus.ACCEPTED)
                .user(user)
                .role(MemberRole.OWNER)
                .isActive(true) // ✅ thêm để tránh lỗi constraint
                .build();
        tripMemberRepository.save(member);

        return savedTrip;
    }


    public void assignHotelAndRoomsToTrip(Long tripId, AssignHotelRequestDTO request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        // ✅ Lấy Hotel từ hotelId và gán vào Trip
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        trip.setHotel(hotel);  // Gán hotel cho trip
        tripRepository.save(trip); // ✅ Lưu lại Trip với hotel mới

        for (RoomBookingRequest booking : request.getRoomBookings()) {
            Room room = roomRepository.findById(booking.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found"));

            if (booking.getCheckIn().isBefore(trip.getStartDate()) ||
                    booking.getCheckOut().isAfter(trip.getEndDate())) {
                throw new IllegalArgumentException("Room booking time must be within trip duration.");
            }
            // Check for conflict logic here (if needed)

            TripRoom tripRoom = new TripRoom();
            tripRoom.setTrip(trip);
            tripRoom.setRoom(room);
            tripRoom.setCheckIn(booking.getCheckIn());
            tripRoom.setCheckOut(booking.getCheckOut());

            tripRoomRepository.save(tripRoom);
        }
    }

    public Trip updateTrip(Long tripId, TripRequestDTO request) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;

        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại: " + email));

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new NoSuchElementException("Trip not found"));

        if ("COMPLETED".equalsIgnoreCase(trip.getStatus())) {
            throw new IllegalStateException("Cannot edit completed trips!");
        }
// Validate ngày
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }

// Tuỳ chọn: không cho update trip thành ngày trong quá khứ
        if (request.getStartDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Start date cannot be in the past.");
        }
        trip.setName(request.getName());
        trip.setDestination(request.getDestination());
        trip.setDeparturePoint(request.getDeparturePoint());
        trip.setType(request.getType());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setTotalAmount(request.getTotalAmount());
        trip.setIsPublic(request.getIsPublic());
        trip.setStatus(request.getStatus());

        return tripRepository.save(trip);

    }

    public List<TripDTO> findInvitedTripsForCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;

        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }
        List<TripMember> members = tripMemberRepository.findInvitedTripsByEmail(email);
        return members.stream()
                .map(TripMember::getTrip)
                .filter(Objects::nonNull)
                .distinct()
                .sorted(Comparator.comparing(Trip::getCreatedAt).reversed())
                .map(this::toDto) // Chuyển sang TripDTO
                .toList();
    }

    public TripDTO toDto(Trip trip) {
        return TripDTO.builder()
                .id(trip.getTripId())
                .name(trip.getName())
                .destination(trip.getDestination())
                .departurePoint(trip.getDeparturePoint())
                .status(trip.getStatus())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .type(trip.getType())
                .isPublic(trip.getIsPublic())
                .totalAmount(trip.getTotalAmount())
                .build();
    }

    public void setFinishedTrip(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new NoSuchElementException("Trip not found"));

        trip.setIsFinished(true);
        trip.setFinishedAt(LocalDateTime.now());
        tripRepository.save(trip);
    }
}
