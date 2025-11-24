package aptech.tripmate.controllers;

import aptech.tripmate.DTO.CancelRequestDTO;
import aptech.tripmate.enums.RoomStatus;
import aptech.tripmate.models.*;
import aptech.tripmate.repositories.*;
import aptech.tripmate.services.CancelRequestService;
import aptech.tripmate.services.PayPalService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cancel-requests")
@RequiredArgsConstructor
public class CancelRequestController {

    private final CancelRequestService cancelRequestService;
    private final TripRoomRepository tripRoomRepository;
    private final RoomPaymentRepository roomPaymentRepository;
    private final TripRepository tripRepository;
    private final CancelRequestRepository cancelRequestRepository;
    private final JavaMailSenderImpl mailSender;
    private final PayPalService payPalService;
    private final RoomRepository roomRepository;


    @PostMapping("/{id}/approve")
    @Transactional
    public ResponseEntity<?> approveCancel(@PathVariable Long id) {
        try {
            CancelRequest cancelRequest = cancelRequestRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Cancel request not found"));

            TripRoom tr = cancelRequest.getTripRoom();
            if (tr == null) throw new RuntimeException("TripRoom not found");

            RoomPayment payment = roomPaymentRepository.findByTripRoomId(tr.getId())
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            // 1️⃣ Cập nhật trạng thái CancelRequest
            cancelRequest.setStatus("APPROVED");
            cancelRequestRepository.save(cancelRequest);

            // 2️⃣ Refund payment
            if (payment.getPaypalCaptureId() != null) {
                try {
                    String refundId = payPalService.refund(payment.getPaypalCaptureId(), payment.getAmount());
                    payment.setPaypalRefundId(refundId);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            payment.setStatus("REFUNDED");
            // gỡ reference
            roomPaymentRepository.save(payment);

            // 3️⃣ Đặt TripRoom status = CANCELLED
            tr.setStatus("CANCELLED");
            tripRoomRepository.save(tr);

            // 4️⃣ Đặt Room trở lại AVAILABLE
            if (tr.getRoom() != null) {
                Room room = tr.getRoom();
                room.setRoomStatus(RoomStatus.AVAILABLE);
                roomRepository.save(room);
            }

            // 5️⃣ Cập nhật tổng tiền Trip
            Trip trip = tr.getTrip();
            double updatedTotalAmount = 0.0;
            if (trip != null) {
                List<TripRoom> remainingRooms = tripRoomRepository.findByTrip(trip)
                        .stream()
                        .filter(r -> !"CANCELLED".equalsIgnoreCase(r.getStatus()))
                        .collect(Collectors.toList());

                double totalRoomCost = remainingRooms.stream()
                        .mapToDouble(r -> {
                            Room room = r.getRoom();
                            if (room == null) return 0;
                            long nights = 1;
                            if (r.getCheckIn() != null && r.getCheckOut() != null) {
                                nights = ChronoUnit.DAYS.between(r.getCheckIn().toLocalDate(), r.getCheckOut().toLocalDate());
                                if (nights <= 0) nights = 1;
                            }
                            return room.getPrice() != null ? room.getPrice() * nights : 0;
                        })
                        .sum();

                updatedTotalAmount = trip.getInitialTotalAmount() - totalRoomCost;
                trip.setTotalAmount(updatedTotalAmount);
                tripRepository.save(trip);
            }

            // 6️⃣ Gửi email thông báo
            if (tr.getEmail() != null && !tr.getEmail().isEmpty()) {
                sendCancelApprovalEmail(tr, updatedTotalAmount);
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Cancel request approved, TripRoom marked CANCELLED, payment REFUNDED",
                    "tripRoomId", tr.getId(),
                    "paymentId", payment.getId(),
                    "tripTotalAmount", updatedTotalAmount
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", e.getClass().getSimpleName(),
                            "message", e.getMessage()
                    ));
        }
    }

    private void sendCancelApprovalEmail(TripRoom tr, double refundedAmount) {
        if (tr.getEmail() == null || tr.getEmail().isEmpty()) return;

        String guestName = tr.getName();
        String roomName = tr.getRoom() != null ? tr.getRoom().getRoomName() : "N/A";

        String mailContent = "<div style='font-family: Arial, sans-serif; font-size: 16px; color: #1f2937; background-color: #f3f4f6; padding: 24px;'>"
                + "<div style='max-width:650px; background-color:#fff; border-radius:10px; margin:auto; box-shadow:0 4px 12px rgba(0,0,0,0.08); padding:32px;'>"
                + "<h2 style='text-align:center; color:#2563eb;'>Cancel Request Approved</h2>"
                + "<p>Hello <strong>" + guestName + "</strong>,</p>"
                + "<p>We have successfully approved your request to cancel the booking for room <strong>" + roomName + "</strong>.</p>"
                + "<div style='margin-top:24px; background-color:#fefce8; padding:20px; border-left:4px solid #f59e0b; border-radius:8px;'>"
                + "<p style='color:#78350f; font-weight:bold;'>✅ Cancellation Confirmed</p>"
                + "<p style='color:#78350f;'>Your booking for <strong>" + roomName + "</strong> has been cancelled. "
                + "The refund of <strong>$" + String.format("%,.0f", refundedAmount) + "</strong> will be processed within 2–3 business days.</p>"
                + "</div>"
                + "<p>If you have any questions, contact <a href='mailto:support@tripmate.com' style='color:#2563eb;'>support@tripmate.com</a>.</p>"
                + "<p style='text-align:center; font-size:13px; color:#6b7280;'>Thank you for choosing TripMate.<br/>© 2025 TripMate.</p>"
                + "</div></div>";

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(tr.getEmail());
            helper.setSubject("[TripMate] Cancel Request Approved - " + roomName);
            helper.setText(mailContent, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @PostMapping("/{id}/reject")
    public ResponseEntity<String> reject(@PathVariable Long id) {
        try {
            cancelRequestService.rejectCancelRequest(id);
            return ResponseEntity.ok("Cancel request rejected.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("")
    public ResponseEntity<List<CancelRequestDTO>> getAll(@RequestParam(required = false) String status) {
        List<CancelRequestDTO> requests = status != null ?
                cancelRequestService.getCancelRequestsByStatus(status) :
                cancelRequestService.getAllCancelRequests();
        return ResponseEntity.ok(requests);
    }
}
