package aptech.tripmate.controllers;

import aptech.tripmate.models.PhotoAlbum;
import aptech.tripmate.models.Trip;
import aptech.tripmate.models.User;
import aptech.tripmate.repositories.PhotoAlbumRepository;
import aptech.tripmate.repositories.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/albums")
@RequiredArgsConstructor
public class PhotoAlbumController {

    private final PhotoAlbumRepository albumRepo;
    private final UserRepository userRepo;

    @GetMapping("/by-trip/{tripId}")
    public ResponseEntity<PhotoAlbum> getAlbumByTripId(@PathVariable Long tripId) {
        PhotoAlbum album = albumRepo.findByTrip_TripId(tripId);
        return ResponseEntity.ok(album);
    }


    @PostMapping("/create-for-trip/{tripId}")
    public ResponseEntity<PhotoAlbum> createAlbumForTrip(@PathVariable Long tripId, Authentication auth) {
        String email = auth.getName();
        User user = userRepo.findByEmail(email).orElseThrow();

        // Nếu đã có album cho trip này thì trả về lỗi
        if (albumRepo.existsByTrip_TripId(tripId)) {
            return ResponseEntity.badRequest().body(null);
        }

        Trip trip = new Trip();
        trip.setTripId(tripId); // Hoặc lấy từ tripRepository nếu cần đầy đủ object

        PhotoAlbum album = new PhotoAlbum();
        album.setUser(user);
        album.setTrip(trip);
        album.setName("Album for Trip " + tripId);
        album.setDescription("Ảnh cho chuyến đi #" + tripId);
        album.setPublic(false);
        album.setCreatedAt(LocalDate.now());

        return ResponseEntity.ok(albumRepo.save(album));
    }


    @Data
    public static class AlbumRequest {
        private String name;
        private String description;
        private boolean isPublic;
    }
}

