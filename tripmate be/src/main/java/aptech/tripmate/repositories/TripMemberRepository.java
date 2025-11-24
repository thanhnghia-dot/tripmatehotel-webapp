package aptech.tripmate.repositories;

import aptech.tripmate.models.TripMember;
import aptech.tripmate.models.User;
import aptech.tripmate.enums.MemberStatus;
import aptech.tripmate.models.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface TripMemberRepository extends JpaRepository<TripMember, Long> {
    List<TripMember> findByTrip(Trip trip);
    List<TripMember> findByTrip_TripId(Long tripId);
    List<TripMember> findByEmail(String email);
    Optional<TripMember> findByTripAndEmail(Trip trip, String email);

    @Query("SELECT tm FROM TripMember tm WHERE tm.email = :email AND tm.status = 'PENDING'")
    List<TripMember> findInvitedTripsByEmail(@Param("email") String email);

    List<TripMember> findByEmailAndUserIsNull(String email);

    List<TripMember> findByUserAndStatus(User user, MemberStatus status);
    Optional<TripMember> findByTrip_TripIdAndEmail(Long tripId, String email);
    @Modifying
    @Transactional
    @Query("DELETE FROM TripMember tm WHERE tm.trip.tripId = :tripId AND tm.user.userId = :userId")
    void deleteByTripTripIdAndUserUserId(@Param("tripId") Long tripId, @Param("userId") Long userId);
    Optional<TripMember> findByTripTripIdAndUserUserId(Long tripId, Long userId);
    long countByTrip_TripIdAndStatus(Long tripId, MemberStatus status);
}
