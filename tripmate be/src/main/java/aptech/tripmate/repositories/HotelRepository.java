package aptech.tripmate.repositories;

import aptech.tripmate.DTO.HotelRatingComparisonDTO;
import aptech.tripmate.DTO.HotelReviewRequestDTO;
import aptech.tripmate.models.Hotel;

import java.util.List;
import java.util.Optional;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HotelRepository extends JpaRepository<Hotel, Long>, JpaSpecificationExecutor<Hotel> {

    Optional<Hotel> findByName(String name);
    @Query("SELECT h FROM Hotel h LEFT JOIN FETCH h.roomTypes")
    List<Hotel> findAllWithRoomTypes();
    List<Hotel> findByAddressContainingIgnoreCase(String address);
    @Query("""
    SELECT new aptech.tripmate.DTO.HotelRatingComparisonDTO(
        h.id, h.name, COALESCE(AVG(r.rating), 0), COUNT(r.id)
    )
    FROM Hotel h
    LEFT JOIN HotelReview r ON r.hotel = h
    WHERE LOWER(h.address) LIKE LOWER(CONCAT('%', :address, '%'))
    GROUP BY h.id, h.name
    ORDER BY AVG(r.rating) DESC, COUNT(r.id) DESC
""")
    List<HotelRatingComparisonDTO> findTopRatedHotelsByAddress(String address);
    @Query("SELECT h FROM Hotel h WHERE h.address LIKE %:destination% OR h.streetAddress LIKE %:destination%")
    List<Hotel> findByAddressContaining(@Param("destination") String destination);

}
