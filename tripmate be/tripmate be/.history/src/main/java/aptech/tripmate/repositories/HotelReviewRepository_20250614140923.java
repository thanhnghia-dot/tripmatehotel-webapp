package aptech.tripmate.repositories;

import aptech.tripmate.models.HotelReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HotelReviewRepository extends JpaRepository<HotelReview, Long> {
    List<HotelReview> findByHotel_Id(Long hotelId);

    @Query("SELECT AVG(r.rating) FROM HotelReview r WHERE r.hotel.id = :hotelId")
    Double findAverageRatingByHotelId(@Param("hotelId") Long hotelId);

    @Query("SELECT r FROM HotelReview r WHERE r.user.email = :userEmail")
    List<HotelReview> findByHotelIdAndUserEmail(@Param("hotelId") Long hotelId, @Param("userEmail") String userEmail);
}
