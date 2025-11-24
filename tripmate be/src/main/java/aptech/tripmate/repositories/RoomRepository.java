package aptech.tripmate.repositories;

import aptech.tripmate.models.Room;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomRepository extends JpaRepository<Room, Long>, JpaSpecificationExecutor<Room> {
  List<Room> findByHotel_Id(Long hotelId);
  List<Room> findByHotelId(Long hotelId);
  Page<Room> findByRoomNameContainingIgnoreCase(String name, Pageable pageable);
  List<Room> findByRoomTypeId(Long roomTypeId);
  @Query("""
        SELECT r FROM Room r
        WHERE r.id NOT IN (
            SELECT tr.room.id FROM TripRoom tr
            WHERE (tr.checkIn <= :checkOut AND tr.checkOut >= :checkIn)
        )
    """)
  List<Room> findAvailableRooms(
          @Param("checkIn") LocalDateTime checkIn,
          @Param("checkOut") LocalDateTime checkOut
  );

}
