package aptech.tripmate.repositories;

import aptech.tripmate.models.HotelReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HotelReviewRepository extends JpaRepository<HotelReview, Long> {
    List<HotelReview> findByHotel_Id(Long hotelId);
    List<HotelReview> findByHotel_IdAndUser_Email(Long hotelId, String userEmail);

    @Query("SELECT AVG(r.rating) FROM HotelReview r WHERE r.hotel.id = :hotelId")
    Double findAverageRatingByHotelId(@Param("hotelId") Long hotelId);
}
