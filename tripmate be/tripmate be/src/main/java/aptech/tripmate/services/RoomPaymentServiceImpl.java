package aptech.tripmate.services;

import aptech.tripmate.DTO.DepositRequest;
import aptech.tripmate.DTO.PaidRoomInfoDTO;
import aptech.tripmate.models.RoomPayment;
import aptech.tripmate.models.TripRoom;
import aptech.tripmate.repositories.RoomPaymentRepository;
import aptech.tripmate.repositories.TripRoomRepository;
import aptech.tripmate.services.RoomPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomPaymentServiceImpl implements RoomPaymentService {

    private final RoomPaymentRepository roomPaymentRepository;
    private final TripRoomRepository tripRoomRepository;

    @Override
    public RoomPayment save(RoomPayment roomPayment) {
        return roomPaymentRepository.save(roomPayment);
    }

    @Override
    public boolean isTripRoomFullyPaid(Long tripRoomId) {
        return roomPaymentRepository.existsByTripRoomIdAndStatus(tripRoomId, "paid");
    }
    public List<PaidRoomInfoDTO> getPaidRoomInfoByTripId(Long tripId) {
        return roomPaymentRepository.findPaidRoomInfoByTripId(tripId);
    }
    @Transactional
    public void payDepositMultipleRooms(List<Long> tripRoomIds, List<String> paypalCaptureIds, BigDecimal totalPrice, String currency, String description) {
        if (tripRoomIds == null || tripRoomIds.isEmpty()) {
            throw new IllegalArgumentException("Danh sách phòng không được để trống");
        }

        if (paypalCaptureIds == null || paypalCaptureIds.size() != tripRoomIds.size()) {
            throw new IllegalArgumentException("Danh sách captureId không hợp lệ");
        }

        // Kiểm tra tất cả tripRoomId có tồn tại
        List<TripRoom> tripRooms = tripRoomRepository.findAllById(tripRoomIds);

        if (tripRooms.size() != tripRoomIds.size()) {
            throw new IllegalArgumentException("Một số phòng không tồn tại");
        }

        // Chia đều số tiền cho các phòng
        BigDecimal perRoomAmount = totalPrice.divide(new BigDecimal(tripRoomIds.size()), 2, RoundingMode.HALF_UP);

        // Tạo bản ghi thanh toán cho từng phòng
        for (int i = 0; i < tripRooms.size(); i++) {
            TripRoom tripRoom = tripRooms.get(i);
            String captureId = paypalCaptureIds.get(i);

            RoomPayment payment = new RoomPayment();
            payment.setTripRoom(tripRoom);

            payment.setCurrency(currency);
            payment.setDescription(description);
            payment.setStatus("paid");  // giả sử thanh toán thành công luôn
            payment.setPaypalCaptureId(captureId); // thêm captureId

            roomPaymentRepository.save(payment);

            // Cập nhật trạng thái TripRoom đã thanh toán
            tripRoom.setStatus("paid");
            tripRoomRepository.save(tripRoom);
        }
    }
    @Override
    public RoomPayment recordDeposit(DepositRequest req) {
        TripRoom tripRoom = TripRoom.builder()
                .id(req.getTripRoomId()) // set id cho TripRoom
                .build();

        RoomPayment p = RoomPayment.builder()
                .tripRoom(tripRoom)                  // gán object TripRoom
                .price(req.getPrice() == null ? 0.0 : req.getPrice().doubleValue()) // dùng price
                .currency(req.getCurrency())
                .paypalCaptureId(req.getPaypalCaptureId())
                .status("PAID")
                .description(req.getDescription())
                .build();

        return roomPaymentRepository.save(p);
    }

    @Override
    public Optional<RoomPayment> getLatestPaidByTripRoom(Long tripRoomId) {
        List<RoomPayment> list = roomPaymentRepository.findByTripRoomIdAndStatus(tripRoomId, "PAID");
        return list.stream().max(Comparator.comparing(RoomPayment::getCreatedAt));
    }

    @Override
    public List<RoomPayment> getAllPaidByTripRoom(Long tripRoomId) {
        return roomPaymentRepository.findByTripRoomIdAndStatus(tripRoomId, "PAID");
    }

    @Override
    public void markRefunded(RoomPayment p, String refundId) {
        p.setStatus("REFUNDED");
        p.setPaypalRefundId(refundId);
        roomPaymentRepository.save(p);
    }

}

