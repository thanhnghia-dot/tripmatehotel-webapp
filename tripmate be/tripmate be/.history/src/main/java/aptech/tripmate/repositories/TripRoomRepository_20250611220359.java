package aptech.tripmate.repositories;

import aptech.tripmate.models.TripRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TripRoomRepository extends JpaRepository<TripRoom, Long> {
    List<TripRoom> findByTrip_TripId(Long tripId); // tìm danh sách room theo trip
    
    @Query("""
      SELECT tr FROM TripRoom tr 
      WHERE tr.room.id = :roomId
      AND (
          (:checkIn BETWEEN tr.checkIn AND tr.checkOut)
          OR (:checkOut BETWEEN tr.checkIn AND tr.checkOut)
          OR (tr.checkIn BETWEEN :checkIn AND :checkOut)
          OR (tr.checkOut BETWEEN :checkIn AND :checkOut)
          )
      """)
    List<TripRoom> findConflictingBookings(@Param("roomId") Long roomId,
                                          @Param("checkIn") LocalDateTime checkIn,
                                          @Param("checkOut") LocalDateTime checkOut);
}
