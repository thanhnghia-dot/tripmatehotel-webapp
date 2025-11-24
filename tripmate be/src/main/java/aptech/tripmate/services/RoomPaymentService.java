package aptech.tripmate.services;

import aptech.tripmate.DTO.DepositRequest;
import aptech.tripmate.models.RoomPayment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RoomPaymentService {
    RoomPayment save(RoomPayment roomPayment);
    boolean isTripRoomFullyPaid(Long tripRoomId);
    RoomPayment recordDeposit(DepositRequest req);
    Optional<RoomPayment> getLatestPaidByTripRoom(Long tripRoomId);
    List<RoomPayment> getAllPaidByTripRoom(Long tripRoomId);
    void markRefunded(RoomPayment p, String refundId);
}
