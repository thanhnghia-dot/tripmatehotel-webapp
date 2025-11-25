package aptech.tripmate.repositories;

import aptech.tripmate.models.Photo;
import aptech.tripmate.models.PhotoAlbum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findByAlbum(PhotoAlbum album);
}
