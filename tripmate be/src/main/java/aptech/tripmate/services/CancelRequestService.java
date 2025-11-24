package aptech.tripmate.services;

import aptech.tripmate.DTO.CancelRequestDTO;
import aptech.tripmate.models.CancelRequest;
import aptech.tripmate.models.RoomPayment;
import aptech.tripmate.models.TripRoom;
import aptech.tripmate.repositories.CancelRequestRepository;
import aptech.tripmate.repositories.RoomPaymentRepository;
import aptech.tripmate.repositories.RoomRepository;
import aptech.tripmate.repositories.TripRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CancelRequestService {

    private final CancelRequestRepository cancelRequestRepository;
    private final TripRoomRepository tripRoomRepository;
    private final RoomPaymentRepository roomPaymentRepository;
    private final PayPalService payPalService;
    private final RoomRepository roomRepository;

    @Transactional
    public RoomPayment approveCancelRequest(Long cancelRequestId) {
        CancelRequest req = cancelRequestRepository.findById(cancelRequestId)
                .orElseThrow(() -> new RuntimeException("CancelRequest not found"));

        TripRoom tr = req.getTripRoom();
        if (tr == null) throw new RuntimeException("TripRoom not found");

        RoomPayment payment = roomPaymentRepository
                .findTopByTripRoom_IdOrderByCreatedAtDesc(tr.getId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));


        req.setStatus("APPROVED");

        cancelRequestRepository.save(req);

        return payment;
    }


    @Transactional
    public void rejectCancelRequest(Long cancelRequestId) {
        CancelRequest request = cancelRequestRepository.findById(cancelRequestId)
                .orElseThrow(() -> new RuntimeException("CancelRequest not found"));

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new RuntimeException("Request already processed");
        }

        request.setStatus("REJECTED");
        cancelRequestRepository.save(request);
    }

    public List<CancelRequestDTO> getAllCancelRequests() {
        return cancelRequestRepository.findAll()


                .stream()
                .map(CancelRequestDTO::new)
                .collect(Collectors.toList());
    }

    public List<CancelRequestDTO> getCancelRequestsByStatus(String status) {
        return cancelRequestRepository.findByStatus(status)
                .stream()
                .map(CancelRequestDTO::new)
                .collect(Collectors.toList());
    }
}
