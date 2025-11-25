package aptech.tripmate.repositories;

import aptech.tripmate.models.CancelRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CancelRequestRepository extends JpaRepository<CancelRequest, Long> {
    List<CancelRequest> findByStatus(String status);
}
