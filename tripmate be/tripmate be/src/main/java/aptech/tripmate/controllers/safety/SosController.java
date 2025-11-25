// src/main/java/aptech/tripmate/controllers/safety/SosController.java
package aptech.tripmate.controllers.safety;

import aptech.tripmate.DTO.safety.SosEmailRequestDTO;
import aptech.tripmate.DTO.safety.SosLogResponseDTO;
import aptech.tripmate.models.User;
import aptech.tripmate.models.Trip;
import aptech.tripmate.models.safety.SosLog;
import aptech.tripmate.repositories.TripRepository;
import aptech.tripmate.repositories.UserRepository;
import aptech.tripmate.repositories.safety.SosLogRepository;
import aptech.tripmate.services.safety.SosEmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/safety/sos")
@RequiredArgsConstructor
public class SosController {

    private final SosEmailService sosEmailService;
    private final SosLogRepository sosLogRepository;
    private final UserRepository userRepository;
    private final TripRepository tripRepository;

    // ✅ Gửi SOS
    @PostMapping("/email")
    public ResponseEntity<?> sendSOS(@RequestBody SosEmailRequestDTO request) {
        try {
            sosEmailService.send(request);
            return ResponseEntity.ok("✅ SOS email sent successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("❌ Failed to send SOS email.");
        }
    }

    // ✅ Lấy log theo trip
    @GetMapping("/logs/trip/{tripId}")
    public List<SosLogResponseDTO> getLogsByTrip(@PathVariable Long tripId) {
        return sosLogRepository.findByTripId(tripId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ✅ Lấy log theo user
    @GetMapping("/logs/user/{userId}")
    public List<SosLogResponseDTO> getLogsByUser(@PathVariable Long userId) {
        return sosLogRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ✅ Hàm map Entity → DTO
    private SosLogResponseDTO mapToDTO(SosLog log) {
        User sender = userRepository.findById(log.getUserId()).orElse(null);
        Trip trip = tripRepository.findById(log.getTripId()).orElse(null);

        String senderName = sender != null ? sender.getName() : "Unknown User";
        String tripName = trip != null ? trip.getName() : "Unknown Trip"; // ✅ sửa lại ở đây
        String locationUrl = "https://maps.google.com/?q=" + log.getLatitude() + "," + log.getLongitude();
        String sentAt = log.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

        return new SosLogResponseDTO(senderName, tripName, log.getMessage(), locationUrl, sentAt);
    }

}
