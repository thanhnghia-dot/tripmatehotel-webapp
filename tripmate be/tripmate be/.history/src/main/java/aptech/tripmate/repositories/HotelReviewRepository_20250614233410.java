package aptech.tripmate.repositories;

import aptech.tripmate.models.HotelReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface HotelReviewRepository extends JpaRepository<HotelReview, Long> {
    List<HotelReview> findByHotel_Id(Long hotelId);
    List<HotelReview> findByHotel_IdAndUser_Email(Long hotelId, String userEmail);

    @Query("SELECT AVG(r.rating) FROM HotelReview r WHERE r.hotel.id = :hotelId")
    Double findAverageRatingByHotelId(@Param("hotelId") Long hotelId);

   @Query(value = """
        SELECT CONCAT(YEAR(created_at), '-W', LPAD(WEEK(created_at, 1), 2, '0')) AS label,
               AVG(rating) AS averageRating,
               COUNT(id) AS reviewCount
        FROM hotel_review
        WHERE hotel_id = :hotelId
          AND created_at BETWEEN :fromDate AND :toDate
        GROUP BY YEAR(created_at), WEEK(created_at, 1)
        ORDER BY YEAR(created_at), WEEK(created_at, 1)
    """, nativeQuery = true)
    List<Object[]> getWeeklyStats(@Param("hotelId") Long hotelId,
                                  @Param("fromDate") LocalDateTime fromDate,
                                  @Param("toDate") LocalDateTime toDate);

    @Query(value = """
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS label,
               AVG(rating) AS averageRating,
               COUNT(id) AS reviewCount
        FROM hotel_review
        WHERE hotel_id = :hotelId
          AND created_at BETWEEN :fromDate AND :toDate
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY label
    """, nativeQuery = true)
    List<Object[]> getMonthlyStats(@Param("hotelId") Long hotelId,
                                   @Param("fromDate") LocalDateTime fromDate,
                                   @Param("toDate") LocalDateTime toDate);

    @Query(value = """
        SELECT YEAR(created_at) AS label,
               AVG(rating) AS averageRating,
               COUNT(id) AS reviewCount
        FROM hotel_review
        WHERE hotel_id = :hotelId
          AND created_at BETWEEN :fromDate AND :toDate
        GROUP BY YEAR(created_at)
        ORDER BY label
    """, nativeQuery = true)
    List<Object[]> getYearlyStats(@Param("hotelId") Long hotelId,
                                  @Param("fromDate") LocalDateTime fromDate,
                                  @Param("toDate") LocalDateTime toDate);

