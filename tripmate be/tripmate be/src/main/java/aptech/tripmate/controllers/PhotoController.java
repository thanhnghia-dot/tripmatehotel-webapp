package aptech.tripmate.controllers;

import aptech.tripmate.models.Photo;
import aptech.tripmate.models.PhotoAlbum;
import aptech.tripmate.repositories.PhotoAlbumRepository;
import aptech.tripmate.repositories.PhotoRepository;
import aptech.tripmate.services.UploadFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final UploadFileService uploadFileService;
    private final PhotoRepository photoRepo;
    private final PhotoAlbumRepository albumRepo;

    // Upload 1 ảnh vào album
    @PostMapping("/upload/{albumId}")
    public ResponseEntity<Photo> uploadPhoto(
            @PathVariable Long albumId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String description) throws IOException {

        PhotoAlbum album = albumRepo.findById(albumId).orElseThrow();

        // Lưu file vào folder: uploads/albumId/
        String url = uploadFileService.storeImage(albumId.toString(), file);

        Photo photo = new Photo();
        photo.setAlbum(album);
        photo.setUrl(url);
        photo.setDescription(description);

        photoRepo.save(photo);

        return ResponseEntity.ok(photo);
    }

    // Lấy danh sách ảnh trong album
    @GetMapping("/album/{albumId}")
    public ResponseEntity<List<Photo>> getPhotosByAlbum(@PathVariable Long albumId) {
        PhotoAlbum album = albumRepo.findById(albumId).orElseThrow();
        List<Photo> photos = photoRepo.findByAlbum(album);
        return ResponseEntity.ok(photos);
    }
}
