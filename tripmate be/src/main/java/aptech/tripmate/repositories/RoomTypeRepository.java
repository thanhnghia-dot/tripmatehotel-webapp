package aptech.tripmate.repositories;

import aptech.tripmate.models.Room;
import aptech.tripmate.models.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {
    List<RoomType> findByHotelId(Long hotelId);
}



