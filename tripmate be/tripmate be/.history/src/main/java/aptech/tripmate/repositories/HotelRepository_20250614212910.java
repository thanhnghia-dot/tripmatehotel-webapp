package aptech.tripmate.repositories;

import aptech.tripmate.models.Hotel;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HotelRepository extends JpaRepository<Hotel, Long> {
  @Query("""
        SELECT 
            FUNCTION(:groupFunction, r.createdAt) AS label,
            AVG(r.rating) AS averageRating,
            COUNT(r.id) AS reviewCount
        FROM HotelReview r
        WHERE r.hotel.id = :hotelId
        AND r.createdAt BETWEEN :fromDate AND :toDate
        GROUP BY FUNCTION(:groupFunction, r.createdAt)
        ORDER BY label
    """)
    List<Object[]> getStatisticsByPeriod(
        @Param("hotelId") Long hotelId,
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate,
        @Param("groupFunction") String groupFunction
    );
}
