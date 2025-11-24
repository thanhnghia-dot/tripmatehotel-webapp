package aptech.tripmate.services;

import aptech.tripmate.DTO.AssignHotelRequestDTO;
import aptech.tripmate.DTO.HotelDTO;
import aptech.tripmate.DTO.RoomBookingRequest;
import aptech.tripmate.DTO.RoomDTO;
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
import aptech.tripmate.repositories.HotelRepository;
import aptech.tripmate.repositories.RoomRepository;
import aptech.tripmate.repositories.TripMemberRepository;
import aptech.tripmate.repositories.TripRepository;
import aptech.tripmate.repositories.TripRoomRepository;
import aptech.tripmate.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripMemberRepository tripMemberRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final TripRoomRepository tripRoomRepository;

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
        .type(trip.getType())
        .startDate(trip.getStartDate())
        .endDate(trip.getEndDate())
        .isPublic(trip.getIsPublic())
        .totalAmount(trip.getTotalAmount())
        .members(memberDTOs)
        .rooms(roomDTOs)
        .hotel(trip.getHotel() != null ? new HotelDTO(trip.getHotel()) : null)
        .build();
}

    public Trip createTripWithHotel(TripCreateRequestDTO request) {
        // Lấy user
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User user = userRepository.findByEmail(email).orElseThrow();

         Trip trip = Trip.builder()
            .name(request.getName())
            .destination(request.getDestination())
            .type(request.getType())
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .isPublic(request.getIsPublic())
            .totalAmount(request.getTotalAmount())
            .createdAt(LocalDateTime.now())
            .user(user)
            .build();

        Trip savedTrip = tripRepository.save(trip);

        // Lưu người tạo trip là thành viên
        TripMember member = TripMember.builder()
                .trip(savedTrip)
                .email(email)
                .status(MemberStatus.ACCEPTED)
                .user(user)
                .role(MemberRole.OWNER)
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

        trip.setName(request.getName());
        trip.setDestination(request.getDestination());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setIsPublic(request.getIsPublic());
        trip.setType(request.getType());
        trip.setTotalAmount(request.getTotalAmount());

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
