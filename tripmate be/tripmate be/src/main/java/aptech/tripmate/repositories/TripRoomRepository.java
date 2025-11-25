package aptech.tripmate.repositories;

import aptech.tripmate.models.Room;
import aptech.tripmate.models.Trip;
import aptech.tripmate.models.TripRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TripRoomRepository extends JpaRepository<TripRoom, Long> {
    List<TripRoom> findByTrip_TripId(Long tripId); // tìm danh sách room theo trip
    List<TripRoom> findByRoomId(Long roomId);
    List<TripRoom> findByEmail(String email);
    List<TripRoom> findByTrip(Trip trip);

    @Query("SELECT SUM(tr.price) FROM TripRoom tr WHERE tr.hotel.id = :hotelId")
    Double sumPriceByHotelId(@Param("hotelId") Long hotelId);

    int countByHotelId(Long hotelId);
    @Query("SELECT SUM(DATEDIFF(tr.checkOut, tr.checkIn) * r.price) " +
            "FROM TripRoom tr JOIN tr.room r")
    Double getTotalBookingRevenue();
    @Query("SELECT tr.room.id FROM TripRoom tr WHERE tr.trip.id = :tripId")
    List<Long> findRoomIdsByTripId(@Param("tripId") Long tripId);
    @Query("SELECT COUNT(tr) > 0 FROM TripRoom tr WHERE tr.room.id = :roomId AND tr.trip.endDate >= CURRENT_DATE")
    boolean existsByRoomIdAndActiveTrip(@Param("roomId") Long roomId);
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

    Optional<TripRoom> findByTripAndRoom(Trip trip, Room room);
    List<TripRoom> findAllByTrip(Trip trip);

    boolean existsByRoomAndCheckInBeforeAndCheckOutAfter(Room room, LocalDateTime checkOut, LocalDateTime checkIn);
    List<TripRoom> findByRoomAndCheckInBeforeAndCheckOutAfter(Room room, LocalDateTime checkOut, LocalDateTime checkIn);

}
