package aptech.tripmate.controllers;

import aptech.tripmate.DTO.CreateRoomPaymentRequest;
import aptech.tripmate.DTO.MultipleRoomDepositRequest;
import aptech.tripmate.DTO.PaidRoomInfoDTO;
import aptech.tripmate.DTO.TripRoomDTO;
import aptech.tripmate.models.*;
import aptech.tripmate.repositories.RoomPaymentRepository;
import aptech.tripmate.repositories.TripRoomRepository;
import aptech.tripmate.services.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/room-payments")
@RequiredArgsConstructor
public class RoomPaymentController {

    private final RoomPaymentService roomPaymentService;

    private final TripRoomService tripRoomService;
    private final RoomPaymentServiceImpl roomPaymentServiceImpl;
    private final TripRoomRepository tripRoomRepository;
    private final RoomPaymentRepository roomPaymentRepository;
    private final PayPalService payPalService;

    @PostMapping("/deposit")
    public ResponseEntity<?> createDepositPayment(@RequestBody CreateRoomPaymentRequest request) {
        if (request.getTripRoomId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("tripRoomId cannot be null");
        }

        TripRoom tripRoom = tripRoomService.findById(request.getTripRoomId());
        if (tripRoom == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("TripRoom not found");
        }

        Room room = tripRoom.getRoom();
        if (room == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Room not found in TripRoom");
        }

        if (roomPaymentService.isTripRoomFullyPaid(request.getTripRoomId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("TripRoom already paid or has an active payment.");
        }

        double price = room.getFinalPrice() != null ? room.getFinalPrice() : room.getPrice();

        RoomPayment payment = RoomPayment.builder()
                .room(room)
                .price(price)
                .currency(request.getCurrency())
                .status("paid")
                .description(request.getDescription())
                .paypalCaptureId(request.getPaypalCaptureId())
                .tripRoom(tripRoom)
                .createdAt(LocalDate.now())
                .build();


        RoomPayment saved = roomPaymentService.save(payment);

        // Cập nhật trạng thái TripRoom
        tripRoom.setStatus("paid");
        tripRoomRepository.save(tripRoom);

        // ✅ Gửi email xác nhận đặt phòng
        try {
            Hotel hotel = room.getHotel();
            List<TripRoom> tripRooms = List.of(tripRoom);


            String email = (request.getEmail() != null && !request.getEmail().isEmpty())
                    ? request.getEmail()
                    : tripRoom.getEmail();

            if (email != null && !email.isEmpty()) {
                tripRoomService.sendEmailForHotel(email, hotel, tripRooms);
            } else {
                System.err.println("⚠ Không có email để gửi thông báo thanh toán.");
            }
        } catch (Exception e) {
            e.printStackTrace();

        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/paid-rooms")
    public ResponseEntity<List<PaidRoomInfoDTO>> getPaidRoomsByTrip(@RequestParam Long tripId) {
        List<PaidRoomInfoDTO> paidRooms = roomPaymentServiceImpl.getPaidRoomInfoByTripId(tripId);
        return ResponseEntity.ok(paidRooms);
    }
    // thêm
    @PostMapping("/deposit/multiple")
    public ResponseEntity<?> payDepositMultipleRooms(@RequestBody MultipleRoomDepositRequest request) {
        try {
            if (request.getTripRoomIds() == null || request.getPaypalCaptureIds() == null
                    || request.getTripRoomIds().size() != request.getPaypalCaptureIds().size()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Danh sách phòng và captureId phải cùng kích thước");
            }

            // Lấy danh sách TripRoom từ DB
            List<TripRoom> tripRooms = tripRoomRepository.findAllById(request.getTripRoomIds());
            if (tripRooms.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Không tìm thấy phòng nào");
            }

            // Tính tổng tiền từ DB (ưu tiên finalPrice nếu có)
            double totalPriceFromDb = 0;
            for (TripRoom tripRoom : tripRooms) {
                Room room = tripRoom.getRoom();
                double priceToUse = (room.getFinalPrice() != null && room.getFinalPrice() > 0)
                        ? room.getFinalPrice()
                        : room.getPrice();
                totalPriceFromDb += priceToUse;
            }

            // Gọi service thanh toán với giá thực tế
            roomPaymentServiceImpl.payDepositMultipleRooms(
                    request.getTripRoomIds(),
                    request.getPaypalCaptureIds(),
                    BigDecimal.valueOf(totalPriceFromDb), // chuyển double -> BigDecimal
// giá tính lại từ DB
                    request.getCurrency(),
                    request.getDescription()
            );

            // --- Gửi email ---
            Hotel hotel = tripRooms.get(0).getRoom().getHotel();
            String email = tripRooms.get(0).getEmail();
            tripRoomService.sendEmailForHotel(email, hotel, tripRooms);

            return ResponseEntity.ok("Thanh toán thành công cho nhiều phòng và đã gửi email");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi thanh toán: " + e.getMessage());
        }
    }


    @PostMapping("/{tripRoomId}/refund")
    public ResponseEntity<?> refundPayment(@PathVariable Long tripRoomId) {
        // 1. Lấy TripRoom
        TripRoom tr = tripRoomRepository.findById(tripRoomId)
                .orElseThrow(() -> new RuntimeException("TripRoom not found"));

        // 2. Lấy payment
        RoomPayment p = roomPaymentRepository.findByTripRoomId(tripRoomId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // 3. Gọi refundCapture (trả về String từ PayPal)
        String refundResponse = payPalService.refundCapture(
                p.getPaypalCaptureId(),
                payPalService.getAccessToken(),
                p.getPrice() == null ? "0.0" : String.format("%.2f", p.getPrice()), // dùng price
                p.getCurrency()
        );

        // 4. Check nếu PayPal trả về null hoặc rỗng => fail
        if (refundResponse == null || refundResponse.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Refund failed from PayPal");
        }

        // 5. Cập nhật status payment
        p.setStatus("refunded");
        roomPaymentRepository.save(p);

        return ResponseEntity.ok("Refund successful. PayPal response: " + refundResponse);
    }
    @GetMapping("/all")
    public ResponseEntity<?> getAllPayments() {
        List<RoomPayment> payments = roomPaymentRepository.findAll();

        List<Map<String, Object>> result = payments.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();

            // TripRoom
            TripRoom tr = p.getTripRoom();

            // Trip
            Trip trip = (tr != null) ? tr.getTrip() : null;

            // Room
            Room room = p.getRoom();

            map.put("paymentId", p.getId());
            map.put("tripRoomId", tr != null ? tr.getId() : null);
            map.put("guestName", tr != null ? tr.getName() : "");
            map.put("tripName", trip != null ? trip.getName() : "");
            map.put("roomName", room != null ? room.getRoomName() : "");
            map.put("status", p.getStatus()); // pending, paid, refunded
            map.put("price", p.getPrice());
            map.put("currency", p.getCurrency());
            map.put("description", p.getDescription());
            map.put("createdAt", p.getCreatedAt());
            map.put("paypalCaptureId", p.getPaypalCaptureId());
            map.put("paypalRefundId", p.getPaypalRefundId());

            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

}
