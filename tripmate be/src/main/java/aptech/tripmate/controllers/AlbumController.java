package aptech.tripmate.controllers;

import aptech.tripmate.DTO.AlbumImageDTO;
import aptech.tripmate.models.AlbumImage;
import aptech.tripmate.models.Trip;
import aptech.tripmate.repositories.AlbumImageRepository;
import aptech.tripmate.repositories.TripRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/albums")
@CrossOrigin(origins = "http://localhost:3000")
public class AlbumController {

    private final AlbumImageRepository albumRepo;
    private final TripRepository tripRepo;

    @Value("${upload.folder:uploads}")
    private String uploadFolder;

    public AlbumController(AlbumImageRepository albumRepo, TripRepository tripRepo) {
        this.albumRepo = albumRepo;
        this.tripRepo = tripRepo;
    }

    // 📌 Lấy toàn bộ ảnh của tất cả trip
    @GetMapping
    public ResponseEntity<List<AlbumImageDTO>> getAllAlbums() {
        List<AlbumImageDTO> dtos = albumRepo.findAll().stream().map(this::toDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<List<AlbumImageDTO>> getAlbum(@PathVariable Long tripId) {
        List<AlbumImageDTO> dtos = albumRepo.findByTrip_TripId(tripId).stream().map(this::toDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    private AlbumImageDTO toDTO(AlbumImage image) {
        AlbumImageDTO dto = new AlbumImageDTO();
        dto.setId(image.getId());
        dto.setName(image.getName());
        dto.setUrl(image.getUrl());
        dto.setCreatedAt(image.getCreatedAt());
        dto.setTripId(image.getTrip() != null ? image.getTrip().getTripId() : null);
        return dto;
    }


    // 📌 Upload nhiều ảnh + tên riêng
    @PostMapping("/{tripId}/upload")
    public ResponseEntity<?> uploadImages(
            @PathVariable Long tripId,
            @RequestParam("images") MultipartFile[] files,
            @RequestParam("name") String name,
            @RequestParam("date") String date // ⬅️ Thêm ngày
    ) {
        try {
            Trip trip = tripRepo.findById(tripId)
                    .orElseThrow(() -> new RuntimeException("Trip not found"));

            String basePath = System.getProperty("user.dir");
            String folderPath = basePath + File.separator + uploadFolder + File.separator + "trip-" + tripId;
            File folder = new File(folderPath);
            if (!folder.exists()) folder.mkdirs();

            // ⬅️ Parse ngày chọn từ frontend
            LocalDateTime createdAt;
            try {
                createdAt = LocalDate.parse(date).atStartOfDay();
            } catch (Exception e) {
                createdAt = LocalDateTime.now();
            }

            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                String filename = System.currentTimeMillis() + "-" + file.getOriginalFilename();
                File dest = new File(folder, filename);
                file.transferTo(dest);

                String fileUrl = "/uploads/trip-" + tripId + "/" + filename;

                AlbumImage image = new AlbumImage();
                image.setTrip(trip);
                image.setName(name);
                image.setUrl(fileUrl);
                image.setCreatedAt(createdAt); // ⬅️ Lưu ngày đã chọn

                albumRepo.save(image);
            }

            return ResponseEntity.ok("Images uploaded successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlbum(@PathVariable Long id) {
        albumRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
