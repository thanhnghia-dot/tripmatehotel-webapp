package aptech.tripmate.repositories;

import aptech.tripmate.models.Hotel;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HotelRepository extends JpaRepository<Hotel, Long> {
  @Query(value = """
    SELECT 
        DATE_FORMAT(created_at, :format) AS label,
        AVG(rating) AS averageRating,
        COUNT(id) AS reviewCount
    FROM hotel_reviews
    WHERE hotel_id = :hotelId
    AND created_at BETWEEN :fromDate AND :toDate
    GROUP BY DATE_FORMAT(created_at, :format)
    ORDER BY label
""", nativeQuery = true)
List<Object[]> getHotelReviewStats(
    @Param("hotelId") Long hotelId,
    @Param("fromDate") LocalDateTime fromDate,
    @Param("toDate") LocalDateTime toDate,
    @Param("format") String format
);

}
