package aptech.tripmate.repositories;

import aptech.tripmate.models.BudgetItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetItemRepository extends JpaRepository<BudgetItem, Long> {
    List<BudgetItem> findByTrip_TripId(Long tripId);
    Optional<BudgetItem> findByTrip_TripIdAndType(Long tripId, String type);

    Optional<BudgetItem> findByTrip_TripIdAndTypeAndNote(Long tripId, String type, String note);
}
