package aptech.tripmate.repositories;

import aptech.tripmate.DTO.PaidRoomInfoDTO;
import aptech.tripmate.models.RoomPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RoomPaymentRepository extends JpaRepository<RoomPayment, Long> {
    boolean existsByRoomIdAndStatus(Long roomId, String status);

    @Query("""
        SELECT CASE WHEN COUNT(rp) > 0 THEN true ELSE false END
        FROM RoomPayment rp
        WHERE rp.tripRoom.room.id = :roomId
          AND rp.status = 'paid'
          AND (
              (:newCheckIn BETWEEN rp.tripRoom.checkIn AND rp.tripRoom.checkOut)
              OR (:newCheckOut BETWEEN rp.tripRoom.checkIn AND rp.tripRoom.checkOut)
              OR (rp.tripRoom.checkIn BETWEEN :newCheckIn AND :newCheckOut)
          )
    """)
    boolean existsOverlappingPaidBooking(
            @Param("roomId") Long roomId,
            @Param("newCheckIn") LocalDateTime newCheckIn,
            @Param("newCheckOut") LocalDateTime newCheckOut
    );

    @Query("SELECT rp.room.id FROM RoomPayment rp, TripRoom tr WHERE tr.room.id = rp.room.id AND tr.trip.id = :tripId AND rp.status = 'paid'")
    List<Long> findPaidRoomIdsByTripId(@Param("tripId") Long tripId);
    @Query("""
        SELECT new aptech.tripmate.DTO.PaidRoomInfoDTO(
            rp.room.id, 
            rp.tripRoom.checkIn, 
            rp.tripRoom.checkOut
        )
        FROM RoomPayment rp
        WHERE rp.tripRoom.trip.id = :tripId
          AND rp.status = 'paid'
    """)
    List<PaidRoomInfoDTO> findPaidRoomInfoByTripId(@Param("tripId") Long tripId);
    boolean existsByTripRoomIdAndStatus(Long tripRoomId, String status);
    boolean existsByTripRoomId(Long tripRoomId);
    Optional<RoomPayment> findByTripRoomId(Long tripRoomId);
    List<RoomPayment> findByTripRoomIdAndStatus(Long tripRoomId, String status);
    Optional<RoomPayment> findFirstByTripRoomIdAndStatusOrderByCreatedAtDesc(Long tripRoomId, String status);
    Optional<RoomPayment> findTopByTripRoom_IdOrderByCreatedAtDesc(Long tripRoomId);

}
