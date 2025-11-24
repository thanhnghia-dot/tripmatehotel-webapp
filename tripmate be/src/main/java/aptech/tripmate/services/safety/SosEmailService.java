// src/main/java/aptech/tripmate/services/safety/SosEmailService.java
package aptech.tripmate.services.safety;

import aptech.tripmate.DTO.safety.SosEmailRequestDTO;
import aptech.tripmate.DTO.safety.SosLogResponseDTO;
import aptech.tripmate.models.Trip;
import aptech.tripmate.models.TripMember;
import aptech.tripmate.models.User;
import aptech.tripmate.models.safety.SosLog;
import aptech.tripmate.repositories.TripMemberRepository;
import aptech.tripmate.repositories.UserRepository;
import aptech.tripmate.repositories.safety.SosLogRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SosEmailService {

    private final JavaMailSender mailSender;
    private final TripMemberRepository tripMemberRepo;
    private final UserRepository userRepo;
    private final SosLogRepository sosLogRepo;
    private final SosRealtimeService sosRealtimeService; // ✅ broadcast cho web

    public void send(SosEmailRequestDTO req) {
        // ✅ Lấy thông tin người gửi
        User sender = userRepo.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        // ✅ Lấy danh sách email tất cả thành viên trong trip
        List<TripMember> tripMembers = tripMemberRepo.findByTrip_TripId(req.getTripId());
        List<String> recipients = tripMembers.stream()
                .map(TripMember::getUser)
                .map(User::getEmail)
                .collect(Collectors.toList());

        if (!recipients.contains(sender.getEmail())) {
            recipients.add(sender.getEmail());
        }

        // ✅ Lấy tên trip (nếu có)
        Trip trip = tripMembers.isEmpty() ? null : tripMembers.get(0).getTrip();
        String tripName = (trip != null && trip.getName() != null)
                ? trip.getName()
                : ("#" + req.getTripId());

        // ✅ Nội dung email
        String mapsUrl = "https://maps.google.com/?q=" + req.getLatitude() + "," + req.getLongitude();
        String subject = "🚨 SOS Alert from " + sender.getName();
        String now = ZonedDateTime.now().format(DateTimeFormatter.RFC_1123_DATE_TIME);
        String note = (req.getMessage() != null && !req.getMessage().isBlank())
                ? req.getMessage()
                : "🚨 SOS! I need urgent help!";

        String html = """
            <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5">
              <h2 style="color:#c0392b;margin:0 0 8px">SOS Alert</h2>
              <p><b>%s</b> just triggered an SOS in trip <b>%s</b>.</p>
              <p><b>Time:</b> %s</p>
              <p><b>Location:</b> <a href="%s">%s</a></p>
              <p><b>Note:</b> %s</p>
            </div>
            """.formatted(sender.getName(), tripName, now, mapsUrl, mapsUrl, note);

        try {
            // ✅ Gửi email
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    mime, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());
            helper.setSubject(subject);
            helper.setTo(recipients.toArray(new String[0]));
            helper.setText(html, true);
            mailSender.send(mime);

            // ✅ Lưu log
            SosLog log = new SosLog();
            log.setUserId(req.getUserId());
            log.setTripId(req.getTripId());
            log.setLatitude(req.getLatitude());
            log.setLongitude(req.getLongitude());
            log.setMessage(note);
            log.setRecipients(String.join(",", recipients));
            sosLogRepo.save(log);

            // ✅ Broadcast realtime SOS event (cho web client online)
            SosLogResponseDTO dto = new SosLogResponseDTO(
                    sender.getName(),
                    "Trip " + tripName,
                    note,
                    mapsUrl,
                    now
            );
            sosRealtimeService.broadcast(log);
            // Hoặc dùng dto nếu FE muốn gọn nhẹ:
            // sosRealtimeService.broadcast(dto);

        } catch (Exception e) {
            throw new RuntimeException("Failed to process SOS", e);
        }
    }
}
