package aptech.tripmate.controllers;


import aptech.tripmate.DTO.CancelRequestDTO;
import aptech.tripmate.DTO.TripRoomDTO;
import aptech.tripmate.enums.RoomStatus;
import aptech.tripmate.models.*;
import aptech.tripmate.repositories.RoomPaymentRepository;
import aptech.tripmate.repositories.RoomRepository;
import aptech.tripmate.repositories.TripRepository;
import aptech.tripmate.repositories.TripRoomRepository;

import aptech.tripmate.services.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/trip-rooms")
@RequiredArgsConstructor
public class TripRoomController {
    @Autowired
    private JavaMailSender mailSender;
    private final TripRoomRepository tripRoomRepository;
    private final RoomRepository roomRepository;
    @Autowired
    private TripRoomService tripRoomService;
    @Autowired
    private RoomPaymentServiceImpl roomPaymentServiceImpl;
    @Autowired
    private RoomPaymentService roomPaymentService;
    @Autowired
    private TripRepository tripRepository;
    @Autowired
    private PaymentService paymentService;
    @Autowired
    private MailService mailService;
    @Autowired
    private RoomPaymentRepository roomPaymentRepository;
    @Autowired
    private PayPalService payPalService;


// ...

    @GetMapping("")
    public ResponseEntity<List<TripRoomDTO>> getTripRoomsByTripId(@RequestParam Long tripId) {
        List<TripRoomDTO> result = tripRoomRepository.findByTrip_TripId(tripId).stream()
                .filter(tr -> !"CANCELLED".equalsIgnoreCase(tr.getStatus())).map(tr -> {
                    Room room = tr.getRoom();
                    Hotel hotel = room != null ? room.getHotel() : null;

                    // Tính số đêm
                    long nights = 0;
                    if (tr.getCheckIn() != null && tr.getCheckOut() != null) {
                        nights = ChronoUnit.DAYS.between(tr.getCheckIn().toLocalDate(), tr.getCheckOut().toLocalDate());
                        if (nights <= 0) nights = 1;
                    }

                    double pricePerNight = 0;
                    if (room != null) {
                        pricePerNight = room.getDiscountPercentage() != null && room.getDiscountPercentage() > 0
                                ? room.getPrice() - (room.getPrice() * room.getDiscountPercentage() / 100)
                                : room.getPrice();
                    }

                    double totalPrice = pricePerNight * nights;

                    double commissionPercent = hotel != null ? hotel.getCommissionPercent() : 10.0;

                    double commissionAmount = totalPrice * commissionPercent / 100.0;

                    return TripRoomDTO.builder()
                            .id(tr.getId())
                            .name(tr.getName())
                            .tripId(tr.getTrip() != null ? tr.getTrip().getTripId() : null)
                            .email(tr.getEmail())
                            .capacity(room != null ? room.getCapacity() : 0)
                            .checkIn(tr.getCheckIn())
                            .checkOut(tr.getCheckOut())
                            .roomId(room != null ? room.getId() : null)
                            .roomName(room != null ? room.getRoomName() : null)
                            .roomStatus(room != null ? room.getRoomStatus().name() : null)
                            .hotelName(hotel != null ? hotel.getName() : null)
                            .price(totalPrice)
                            .commissionPercent(commissionPercent)
                            .commissionAmount(commissionAmount)
                            .numberOfBeds(room != null ? room.getNumberOfBeds() : 0)
                            .emailSent(tr.getEmailSent())
                            // thêm
                            .status(tr.getStatus())
                            .build();
                }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }





    @PostMapping("/{id}/send-confirmation")
    public ResponseEntity<String> sendConfirmationEmail(@PathVariable Long id) {
        try {
            tripRoomService.sendBookingConfirmationEmail(id);
            return ResponseEntity.ok("✅ Booking confirmation email sent.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("❌ Failed to send email: " + e.getMessage());
        }
    }

    @GetMapping("/total-booking-revenue")
    public ResponseEntity<Double> getTotalBookingRevenue() {
        Double total = tripRoomService.getTotalRevenue();
        return ResponseEntity.ok(total != null ? total : 0.0);
    }

    @GetMapping("/total-bookings")
    public ResponseEntity<Long> getTotalBookings() {
        long count = tripRoomRepository.count();
        return ResponseEntity.ok(count);
    }

    // thêm
    @GetMapping("/all")
    public ResponseEntity<List<TripRoomDTO>> getAllTripRooms() {
        List<TripRoomDTO> result = tripRoomRepository.findAll().stream()
                .filter(tr -> !"CANCELLED".equalsIgnoreCase(tr.getStatus()))
                .map(tr -> {
                    Room room = tr.getRoom();
                    Hotel hotel = room != null ? room.getHotel() : null;

                    long nights = 0;
                    if (tr.getCheckIn() != null && tr.getCheckOut() != null) {
                        nights = ChronoUnit.DAYS.between(tr.getCheckIn().toLocalDate(), tr.getCheckOut().toLocalDate());
                        if (nights <= 0) nights = 1;
                    }

                    double pricePerNight = 0;
                    if (room != null) {
                        pricePerNight = room.getDiscountPercentage() != null && room.getDiscountPercentage() > 0
                                ? room.getPrice() - (room.getPrice() * room.getDiscountPercentage() / 100)
                                : room.getPrice();
                    }

                    double totalPrice = pricePerNight * nights;

                    double commissionPercent = hotel != null ? hotel.getCommissionPercent() : 10.0;

                    double commissionAmount = totalPrice * commissionPercent / 100.0;

                    return TripRoomDTO.builder()
                            .id(tr.getId())
                            .name(tr.getName())
                            .tripId(tr.getTrip() != null ? tr.getTrip().getTripId() : null)
                            .email(tr.getEmail())
                            .capacity(room != null ? room.getCapacity() : 0)
                            .checkIn(tr.getCheckIn())
                            .checkOut(tr.getCheckOut())
                            .roomId(room != null ? room.getId() : null)
                            .roomName(room != null ? room.getRoomName() : null)
                            .roomStatus(room != null ? room.getRoomStatus().name() : null)
                            .hotelName(hotel != null ? hotel.getName() : null)
                            .price(totalPrice)
                            .commissionPercent(commissionPercent)
                            .commissionAmount(commissionAmount)
                            .emailSent(tr.getEmailSent())

                            // thêm
                            .status(tr.getStatus())
                            .reminderSentAt(tr.getReminderSentAt())
                            .build();
                }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/send-payment-reminder")
    public ResponseEntity<String> sendPaymentReminder(@PathVariable Long id) {
        try {
            tripRoomService.sendPaymentReminderEmail(id);
            return ResponseEntity.ok("✅ Payment reminder email sent.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("❌ Failed to send reminder email: " + e.getMessage());
        }
    }
    @PostMapping("/{id}/cancel")
    public ResponseEntity<String> cancelTripRoom(@PathVariable Long id) {
        try {
            TripRoom tripRoom = tripRoomRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("TripRoom not found"));

            // chỉ xóa nếu status = REMINDER_SENT
            if (!"REMINDER_SENT".equalsIgnoreCase(tripRoom.getStatus())) {
                throw new RuntimeException("❌ Booking cannot be cancelled. Status: " + tripRoom.getStatus());
            }

            // phải có reminderSentAt
            if (tripRoom.getReminderSentAt() == null) {
                throw new RuntimeException("❌ Missing reminderSentAt, cannot cancel.");
            }

            // check đã qua 30 phút chưa
            if (tripRoom.getReminderSentAt().plusMinutes(30).isAfter(LocalDateTime.now())) {
                throw new RuntimeException("⏳ Must wait 30 minutes after reminder before cancelling.");
            }

            // gửi email hủy
            tripRoomService.cancelBooking(tripRoom.getId());
            tripRoom.setStatus("CANCELLED");
            tripRoomRepository.save(tripRoom);
            Trip trip = tripRoom.getTrip();
            if (trip != null) {
                // xóa TripRoom
                tripRoomRepository.delete(tripRoom);

                // Tính lại tổng tiền dựa trên các phòng còn lại
                List<TripRoom> remainingRooms = tripRoomRepository.findByTrip(trip);
                double totalRoomCost = remainingRooms.stream()
                        .mapToDouble(tr -> {
                            Room room = tr.getRoom();
                            if (room == null) return 0;
                            long nights = 1;
                            if (tr.getCheckIn() != null && tr.getCheckOut() != null) {
                                nights = ChronoUnit.DAYS.between(tr.getCheckIn().toLocalDate(), tr.getCheckOut().toLocalDate());
                                if (nights <= 0) nights = 1;
                            }
                            return room.getPrice() != null ? room.getPrice() * nights : 0;
                        })
                        .sum();

                // cập nhật tổng tiền trip
                trip.setTotalAmount(trip.getInitialTotalAmount() - totalRoomCost);
                tripRepository.save(trip);
            } else {
                // Nếu không có trip thì chỉ xóa phòng
                tripRoomRepository.delete(tripRoom);
            }

            // xóa record khỏi DB
            tripRoomRepository.deleteById(id);

            return ResponseEntity.ok("✅ Trip room deleted and cancellation email sent.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("❌ Failed to cancel trip room: " + e.getMessage());
        }
    }
    @PostMapping("/{tripRoomId}/request-cancel")
    public ResponseEntity<?> requestCancelBooking(
            @PathVariable Long tripRoomId,
            @RequestBody CancelRequestDTO cancelRequest) {

        try {
            // ghép list reasons thành chuỗi CSV
            String joinedReasons = cancelRequest.getReasons() != null
                    ? String.join(",", cancelRequest.getReasons())
                    : "";

            // service xử lý (chỉ cần tripRoomId + reasons)
            tripRoomService.requestCancel(tripRoomId, joinedReasons, cancelRequest.getOtherReason());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cancel request submitted successfully");
            response.put("tripRoomId", tripRoomId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to submit cancel request");
            error.put("details", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("{id}")
    public ResponseEntity<?>  deleteTripRoom(@PathVariable Long id) {
        TripRoom tripRoom = tripRoomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TripRoom not found"));

        Trip trip = tripRoom.getTrip();

        // Xóa phòng
        tripRoomRepository.delete(tripRoom);

        // Tính lại tổng tiền dựa trên các phòng còn lại
        List<TripRoom> remainingRooms = tripRoomRepository.findByTrip(trip);
        double totalRoomCost = remainingRooms.stream()
                .mapToDouble(tr -> {
                    Room room = tr.getRoom();
                    if (room == null) return 0;
                    long nights = 1;
                    if (tr.getCheckIn() != null && tr.getCheckOut() != null) {
                        nights = ChronoUnit.DAYS.between(tr.getCheckIn().toLocalDate(), tr.getCheckOut().toLocalDate());
                        if (nights <= 0) nights = 1;
                    }
                    return room.getPrice() != null ? room.getPrice() * nights : 0;
                })
                .sum();

        trip.setTotalAmount(trip.getInitialTotalAmount() - totalRoomCost);

        tripRepository.save(trip);

        return ResponseEntity.ok(Map.of(
                "message", "Booking canceled successfully",
                "tripTotalAmount", trip.getTotalAmount()
        ));
    }





}






