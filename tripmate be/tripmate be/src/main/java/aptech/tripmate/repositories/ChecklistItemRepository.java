package aptech.tripmate.repositories;

import aptech.tripmate.models.Trip;
import aptech.tripmate.models.checklist.ChecklistItem;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {

    List<ChecklistItem> findByTrip(Trip trip);

    List<ChecklistItem> findByTrip_TripId(Long tripId);

    List<ChecklistItem> findByTripIdOrderByCreatedAtDesc(Long tripId);

    List<ChecklistItem> findByTripIdAndAssigneeUserIdOrderByCreatedAtDesc(Long tripId, Long assigneeUserId);

    @Query("""
                SELECT ci.assigneeUserId, COUNT(ci.itemId)
                FROM ChecklistItem ci
                WHERE ci.tripId = :tripId AND ci.assigneeUserId IS NOT NULL
                GROUP BY ci.assigneeUserId
                ORDER BY COUNT(ci.itemId) DESC
            """)
    List<Object[]> aggregateMemberCounts(@Param("tripId") Long tripId);

    @Query("""
                SELECT COALESCE(SUM(ci.price), 0)
                FROM ChecklistItem ci
                WHERE ci.tripId = :tripId
                  AND ci.status = aptech.tripmate.enums.checklist.ChecklistStatus.PURCHASED
            """)
    BigDecimal sumTotalSpent(@Param("tripId") Long tripId);

    @Query("""
                SELECT COALESCE(SUM(ci.price), 0)
                FROM ChecklistItem ci
                WHERE ci.tripId = :tripId
                  AND ci.status = aptech.tripmate.enums.checklist.ChecklistStatus.PURCHASED
                  AND ci.costSource = aptech.tripmate.enums.checklist.CostSource.PERSONAL
            """)
    BigDecimal sumTotalPersonal(@Param("tripId") Long tripId);

    @Query("""
                SELECT COALESCE(SUM(ci.price), 0)
                FROM ChecklistItem ci
                WHERE ci.tripId = :tripId
                  AND ci.status = aptech.tripmate.enums.checklist.ChecklistStatus.PURCHASED
                  AND ci.costSource = aptech.tripmate.enums.checklist.CostSource.FUND
            """)
    BigDecimal sumTotalFund(@Param("tripId") Long tripId);
    @Query("""
    SELECT ci.assigneeUserId,
           COUNT(ci.itemId),
           SUM(CASE WHEN ci.status = aptech.tripmate.enums.checklist.ChecklistStatus.PURCHASED THEN 1 ELSE 0 END),
           COALESCE(SUM(CASE WHEN ci.status = aptech.tripmate.enums.checklist.ChecklistStatus.PURCHASED THEN ci.price ELSE 0 END),0)
    FROM ChecklistItem ci
    WHERE ci.tripId = :tripId AND ci.assigneeUserId IS NOT NULL
    GROUP BY ci.assigneeUserId
""")
    List<Object[]> aggregateMemberSummary(@Param("tripId") Long tripId);

    long countByTripId(Long tripId);
}