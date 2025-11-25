package aptech.tripmate.services;

import aptech.tripmate.DTO.TripMemberDTO;
import aptech.tripmate.enums.LeaveRequestStatus;
import aptech.tripmate.enums.MemberRole;
import aptech.tripmate.enums.MemberStatus;
import aptech.tripmate.models.LeaveRequest;
import aptech.tripmate.models.Trip;
import aptech.tripmate.models.TripMember;
import aptech.tripmate.models.User;
import aptech.tripmate.repositories.LeaveRequestRepository;
import aptech.tripmate.repositories.TripMemberRepository;
import aptech.tripmate.repositories.TripRepository;
import aptech.tripmate.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripMemberService {

    private final TripMemberRepository tripMemberRepository;
    private final TripRepository tripRepository;
    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    private final LeaveRequestRepository leaveRequestRepository;

    @Transactional
    public void inviteMemberByEmail(Long tripId, String email) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        // Nếu trip đã hoàn thành, không cho mời thêm
        if ("COMPLETED".equalsIgnoreCase(trip.getStatus())) {
            throw new IllegalStateException("Trip completed. Cannot invite more members.");
        }

        User user = userRepository.findByEmail(email).orElse(null);

        // Tìm thành viên trong trip theo trip và user hoặc email
        Optional<TripMember> memberOpt = user != null
                ? tripMemberRepository.findByTripTripIdAndUserUserId(tripId, user.getUserId())
                : tripMemberRepository.findByTripAndEmail(trip, email);

        if (memberOpt.isPresent()) {
            TripMember member = memberOpt.get();

            // Nếu trạng thái inactive, set lại thành invited
            if (member.getStatus() == MemberStatus.INACTIVE) {
                member.setStatus(MemberStatus.INVITED);
                tripMemberRepository.save(member);
            }

            // Xóa các leave request cũ (đã approved hoặc đang pending)
            if (user != null) {
                List<LeaveRequest> oldRequests = leaveRequestRepository.findByTripTripIdAndUserUserIdAndStatusIn(
                        tripId, user.getUserId(),
                        List.of(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING)
                );
                leaveRequestRepository.deleteAll(oldRequests);
            }
        } else {
            // Tạo mới thành viên
            TripMember newMember = TripMember.builder()
                    .trip(trip)
                    .user(user)
                    .email(email)
                    .status(MemberStatus.INVITED)
                    .role(MemberRole.MEMBER)
                    .isActive(true) // 👈 Thêm dòng này
                    .build();

            tripMemberRepository.save(newMember);
        }

        // Gửi mail mời như cũ
        sendInvitationEmail(email, trip);
    }

    private void sendInvitationEmail(String email, Trip trip) {
        String acceptUrl = "http://localhost:3000/trips/" + trip.getTripId() + "/accept";

        String mailContent = "<div style='font-family: Arial, sans-serif; font-size: 16px; color: #333;'>"
                + "<p>Hello,</p>"
                + "<p>You have been invited to join the trip <strong style='color: #d9534f;'>\"" + trip.getName() + "\"</strong>.</p>"
                + "<p>Please click the link below to view or join this trip:</p>"
                + "<p style='margin-top: 20px;'><a href=\"" + acceptUrl + "\" "
                + "style='display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; "
                + "border-radius: 5px; font-weight: bold;'>Click to View or Join the Trip</a></p>"
                + "<br>"
                + "<p>If the button above doesn’t work, please copy and paste the link below into your browser:</p>"
                + "<p><a href=\"" + acceptUrl + "\" style='color: #007bff;'>" + acceptUrl + "</a></p>"
                + "<br>"
                + "<p>Best regards,<br/>TripMate Team</p>"
                + "</div>";



        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("You're invited to join a trip: " + trip.getName());
            helper.setText(mailContent, true); // true = HTML

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("Email sending failed.");
        }
    }

    public long countAcceptedMembers(Long tripId) {
        return tripMemberRepository.countByTrip_TripIdAndStatus(tripId, MemberStatus.ACCEPTED);
    }

    public void assignUserToTripMembers(User user) {
        List<TripMember> membersToUpdate = tripMemberRepository.findByEmailAndUserIsNull(user.getEmail());

        if (membersToUpdate.isEmpty()) {
            return;
        }

        for (TripMember member : membersToUpdate) {
            member.setUser(user);
        }

        tripMemberRepository.saveAll(membersToUpdate);
    }

    public void acceptInvitation(Long tripId) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;

        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User does not exist: " + email));

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new NoSuchElementException("Trip not found"));

        if ("COMPLETED".equalsIgnoreCase(trip.getStatus())) {
            throw new IllegalStateException("Trip completed. Cannot accept invitation.");
        }

        // ✅ Kiểm tra: Chỉ cho phép email được mời mới được accept
        TripMember member = tripMemberRepository.findByTripAndEmail(trip, email)
                .orElseThrow(() -> new NoSuchElementException("You are not invited to this trip."));

        if (member.getStatus() == MemberStatus.ACCEPTED) {
            throw new IllegalStateException("You are in.");
        }

        member.setUser(user);
        member.setStatus(MemberStatus.ACCEPTED);
        tripMemberRepository.save(member);
    }


    public List<TripMemberDTO> getTripMembers(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new NoSuchElementException("Trip not found"));

        return tripMemberRepository.findByTrip(trip).stream()
                .filter(member -> member.getStatus() != MemberStatus.INACTIVE) // 👈 lọc bỏ
                .map(member -> TripMemberDTO.builder()
                        .id(member.getId())
                        .email(member.getEmail())
                        .name(member.getUser() != null ? member.getUser().getName() : "Unknown")
                        .status(member.getStatus())
                        .role(member.getRole())
                        .build())
                .collect(Collectors.toList());
    }
    public void declineInvitation(Long tripId, String email) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        TripMember member = tripMemberRepository.findByTripAndEmail(trip, email)
                .orElseThrow(() -> new IllegalStateException("You are not invited on this trip."));

        if ("COMPLETED".equalsIgnoreCase(trip.getStatus())) {
            throw new IllegalStateException("Trip completed. Cannot decline invitation.");
        }
        if (member.getStatus() == MemberStatus.ACCEPTED) {
            throw new IllegalStateException("You have already joined this trip.");
        }

        member.setStatus(MemberStatus.DECLINED); // 👈 chuyển trạng thái
        tripMemberRepository.save(member);
    }
    // Trả MemberRole nếu tìm được
    public Optional<MemberRole> findRoleByTripIdAndEmail(Long tripId, String email) {
        return tripMemberRepository.findByTrip_TripIdAndEmail(tripId, email)
                .map(TripMember::getRole);
    }

    // Trả tên role (OWNER/MEMBER) hoặc null nếu không phải member
    public String getRoleNameInTrip(Long tripId, String email) {
        return findRoleByTripIdAndEmail(tripId, email)
                .map(MemberRole::name)
                .orElse(null);
    }
}
