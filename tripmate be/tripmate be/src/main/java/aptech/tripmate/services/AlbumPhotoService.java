package aptech.tripmate.services;

import aptech.tripmate.models.AlbumPhoto;
import aptech.tripmate.repositories.AlbumPhotoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlbumPhotoService {

    private final AlbumPhotoRepository repository;

    public AlbumPhotoService(AlbumPhotoRepository repository) {
        this.repository = repository;
    }

    public AlbumPhoto savePhoto(AlbumPhoto photo) {
        return repository.save(photo);
    }

    public List<AlbumPhoto> getPhotosByTrip(Long tripId) {
        return repository.findByTrip_TripId(tripId); // ✅ sửa đúng tên
    }
}
