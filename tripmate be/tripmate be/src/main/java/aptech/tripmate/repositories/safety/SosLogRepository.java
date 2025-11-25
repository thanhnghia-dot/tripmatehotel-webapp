// src/main/java/aptech/tripmate/repositories/safety/SosLogRepository.java
package aptech.tripmate.repositories.safety;

import aptech.tripmate.models.safety.SosLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SosLogRepository extends JpaRepository<SosLog, Long> {
    List<SosLog> findByTripId(Long tripId);
    List<SosLog> findByUserId(Long userId);
}
