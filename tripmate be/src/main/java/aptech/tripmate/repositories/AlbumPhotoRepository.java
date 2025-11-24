package aptech.tripmate.repositories;

import aptech.tripmate.models.AlbumPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlbumPhotoRepository extends JpaRepository<AlbumPhoto, Long> {
    // ✅ Hợp lệ - dùng đúng naming convention
    List<AlbumPhoto> findByTrip_TripId(Long tripId);
}
