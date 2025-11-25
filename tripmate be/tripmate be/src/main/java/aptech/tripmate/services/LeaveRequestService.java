package aptech.tripmate.services;

import aptech.tripmate.DTO.LeaveRequestDTO;
import aptech.tripmate.DTO.LeaveRequestResponseDTO;
import aptech.tripmate.enums.LeaveRequestStatus;
import aptech.tripmate.enums.MemberStatus;
import aptech.tripmate.models.*;
import aptech.tripmate.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    // format createdAt as ISO or any format frontend expects
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_INSTANT;
    private final TripMemberRepository tripMemberRepository;
    private final MessageRepository messageRepository;

    @Transactional
    public LeaveRequestResponseDTO createLeaveRequest(Long tripId, LeaveRequestDTO dto) {
        Long userId = getCurrentUserId();

        if (leaveRequestRepository.existsByTripTripIdAndUserUserIdAndStatus(tripId, userId, LeaveRequestStatus.PENDING)) {
            throw new IllegalStateException("You already have a pending leave request for this trip.");
        }

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        // ❌ Chặn khi trip đã hoàn thành
        if ("COMPLETED".equalsIgnoreCase(trip.getStatus())) {
            throw new IllegalStateException("Trip completed. You cannot create a leave request.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LeaveRequest lr = new LeaveRequest();
        lr.setTrip(trip);
        lr.setUser(user);
        lr.setReason(dto.getReason());
        lr.setOtherReason(dto.getOtherReason());
        lr.setStatus(LeaveRequestStatus.PENDING);

        LeaveRequest saved = leaveRequestRepository.save(lr);

        return mapToDto(saved);
    }

    public List<LeaveRequestResponseDTO> getPendingRequestsForTrip(Long tripId) {
        // ensure trip exists (optional)
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        List<LeaveRequest> list = leaveRequestRepository.findByTripTripIdAndStatus(tripId, LeaveRequestStatus.PENDING);
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public LeaveRequestResponseDTO respondToRequest(Long requestId, boolean approved, String ownerResponse) {
        LeaveRequest req = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        Trip trip = req.getTrip();

        // ❌ Chặn khi trip đã hoàn thành
        if ("COMPLETED".equalsIgnoreCase(trip.getStatus())) {
            throw new IllegalStateException("Trip completed. Cannot respond to leave requests.");
        }
        Long currentUserId = getCurrentUserId();

        if (trip.getOwner() == null || !trip.getOwner().getUserId().equals(currentUserId)) {
            throw new SecurityException("Only trip owner can respond to leave requests");
        }

        // Nếu không nhập gì → dùng mặc định
        if (ownerResponse == null || ownerResponse.trim().isEmpty()) {
            ownerResponse = approved
                    ? "Your request to leave the group has been accepted."
                    : "Your request to leave the group has been denied.";
        }
        req.setOwnerResponse(ownerResponse);

        if (approved) {
            req.setStatus(LeaveRequestStatus.APPROVED);
            TripMember member = tripMemberRepository.findByTripTripIdAndUserUserId(
                            trip.getTripId(), req.getUser().getUserId())
                    .orElseThrow(() -> new RuntimeException("Trip member not found"));
            member.setStatus(MemberStatus.INACTIVE);
            tripMemberRepository.save(member);
        } else {
            req.setStatus(LeaveRequestStatus.REJECTED);
        }

        leaveRequestRepository.save(req);
        return mapToDto(req);
    }



    // helper - convert entity -> response DTO
    private LeaveRequestResponseDTO mapToDto(LeaveRequest r) {
        LeaveRequestResponseDTO dto = new LeaveRequestResponseDTO();
        dto.setId(r.getId());
        dto.setTripId(r.getTrip() != null ? r.getTrip().getTripId() : null);
        dto.setUserId(r.getUser() != null ? r.getUser().getUserId() : null);
        dto.setUserName(r.getUser() != null ? (r.getUser().getName() != null ? r.getUser().getName() : r.getUser().getName()) : null);
        dto.setUserEmail(r.getUser() != null ? r.getUser().getEmail() : null);
        dto.setReason(r.getReason());
        dto.setOtherReason(r.getOtherReason());
        dto.setStatus(r.getStatus());
        dto.setCreatedAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
        dto.setOwnerResponse(r.getOwnerResponse());
        return dto;
    }

    // Get current user id from SecurityContext
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }

        Object principal = authentication.getPrincipal();
        String usernameOrEmail;
        if (principal instanceof UserDetails) {
            usernameOrEmail = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            usernameOrEmail = (String) principal;
            if ("anonymousUser".equals(usernameOrEmail)) {
                throw new RuntimeException("User not authenticated");
            }
        } else {
            throw new RuntimeException("Unsupported principal type");
        }

        // ASSUMPTION: usernameOrEmail is email. If your system uses username, adjust accordingly.
        User user = userRepository.findByEmail(usernameOrEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        return user.getUserId();
    }
    public LeaveRequestStatus getLeaveRequestStatus(Long tripId, Long userId) {
        TripMember member = tripMemberRepository.findByTripTripIdAndUserUserId(tripId, userId)
                .orElse(null);

        if (member == null) {
            // Không phải thành viên, coi như không có trạng thái
            return LeaveRequestStatus.REJECTED;
        }

        if (MemberStatus.INACTIVE.equals(member.getStatus())) {
            // đã rời trip
            return LeaveRequestStatus.APPROVED;
        }

        LeaveRequest req = leaveRequestRepository
                .findTopByTripTripIdAndUserUserIdOrderByCreatedAtDesc(tripId, userId)
                .orElse(null);

        if (req == null || req.getStatus() == null) {
            // chưa từng gửi yêu cầu, coi như không có trạng thái
            return LeaveRequestStatus.REJECTED;
        }

        return req.getStatus();
    }

    public List<LeaveRequestResponseDTO> getMyRequestsForTrip(Long tripId) {
        Long userId = getCurrentUserId();
        List<LeaveRequest> list = leaveRequestRepository
                .findByTripTripIdAndUserUserIdOrderByCreatedAtDesc(tripId, userId);
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }
    @Transactional
    public void deleteMyRequests(List<Long> requestIds) {
        Long currentUserId = getCurrentUserId();

        // Lọc các request thuộc về user hiện tại
        List<LeaveRequest> list = leaveRequestRepository.findAllById(requestIds)
                .stream()
                .filter(r -> r.getUser() != null && r.getUser().getUserId().equals(currentUserId))
                .toList();

        if (list.isEmpty()) {
            throw new RuntimeException("No matching requests found for this user.");
        }

        for (LeaveRequest r : list) {
            Trip trip = r.getTrip();
            if (trip != null && "COMPLETED".equalsIgnoreCase(trip.getStatus())) {
                throw new IllegalStateException("Trip completed. Cannot delete leave requests.");
            }
        }
        leaveRequestRepository.deleteAll(list);
    }
}
