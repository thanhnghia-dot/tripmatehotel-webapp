package aptech.tripmate.repositories;

import aptech.tripmate.models.PhotoAlbum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhotoAlbumRepository extends JpaRepository<PhotoAlbum, Long> {
    List<PhotoAlbum> findByUserEmail(String email);
    boolean existsByTrip_TripId(Long tripId);
    PhotoAlbum findByTrip_TripId(Long tripId);

}
