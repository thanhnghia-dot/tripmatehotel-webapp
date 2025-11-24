package aptech.tripmate.repositories;

import aptech.tripmate.enums.LeaveRequestStatus;
import aptech.tripmate.models.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    boolean existsByTripTripIdAndUserUserIdAndStatus(Long tripId, Long userId, LeaveRequestStatus status);
    List<LeaveRequest> findByTripTripIdAndStatus(Long tripId, LeaveRequestStatus status);
    Optional<LeaveRequest> findById(Long id);
    Optional<LeaveRequest> findTopByTripTripIdAndUserUserIdOrderByCreatedAtDesc(Long tripId, Long userId);
    List<LeaveRequest> findByTripTripIdAndUserUserIdAndStatusIn(Long tripId, Long userId, List<LeaveRequestStatus> statuses);
    List<LeaveRequest> findByTripTripIdAndUserUserIdOrderByCreatedAtDesc(Long tripId, Long userId);

}
