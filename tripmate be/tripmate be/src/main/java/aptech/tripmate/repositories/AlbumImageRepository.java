package aptech.tripmate.repositories;

import aptech.tripmate.models.AlbumImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AlbumImageRepository extends JpaRepository<AlbumImage, Long> {
    List<AlbumImage> findByTrip_TripId(Long tripId); // ✅ ĐÚNG
    @Query("SELECT a FROM AlbumImage a WHERE a.trip.tripId = :tripId AND LOWER(a.name) = LOWER(:albumName)")
    List<AlbumImage> findByTripIdAndAlbumNameIgnoreCase(@Param("tripId") Long tripId, @Param("albumName") String albumName);


}
