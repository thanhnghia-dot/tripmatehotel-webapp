package aptech.tripmate.controllers;

import aptech.tripmate.DTO.AlbumImageDTO;
import aptech.tripmate.models.AlbumImage;
import aptech.tripmate.models.Trip;
import aptech.tripmate.repositories.AlbumImageRepository;
import aptech.tripmate.repositories.TripRepository;
import aptech.tripmate.services.MailService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/albums")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminAlbumController {

    private final AlbumImageRepository albumRepo;
    private final TripRepository tripRepo;
    private final MailService mailService;
    private final AlbumImageRepository albumImageRepository;

    @Value("${upload.path}")
    private String uploadDir;

    public AdminAlbumController(AlbumImageRepository albumRepo, TripRepository tripRepo, MailService mailService, AlbumImageRepository albumImageRepository) {
        this.albumRepo = albumRepo;
        this.tripRepo = tripRepo;
        this.mailService = mailService;
        this.albumImageRepository = albumImageRepository;
    }

    @GetMapping("/all")
    public ResponseEntity<List<AlbumImageDTO>> getAllAlbumImagesForAdmin() {
        List<AlbumImage> images = albumRepo.findAll();
        List<AlbumImageDTO> dtos = images.stream()
                .map(this::convertToDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/by-trip/{tripId}")
    public ResponseEntity<?> getAlbumsByTrip(@PathVariable Long tripId) {
        List<AlbumImage> images = albumImageRepository.findByTrip_TripId(tripId);
        List<AlbumImageDTO> result = new ArrayList<>();

        for (AlbumImage img : images) {
            if (img.getTrip() == null || img.getTrip().getUser() == null) {
                System.out.println("⚠️ Data error: trip/user null at imageId = " + img.getId());
                continue;
            }
            result.add(convertToDTO(img));
        }

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAlbumImage(
            @PathVariable Long id,
            @RequestParam(required = false) String reason
    ) {
        AlbumImage image = albumRepo.findById(id).orElse(null);
        if (image == null) {
            return ResponseEntity.notFound().build();
        }

        String email = null;
        String userName = null;
        String tripName = null;
        String imageName = image.getName();

        if (image.getTrip() != null && image.getTrip().getUser() != null) {
            email = image.getTrip().getUser().getEmail();
            userName = image.getTrip().getUser().getName();
            tripName = image.getTrip().getName();
        }

        albumRepo.delete(image);

        if (email != null) {
            try {
                mailService.sendImageDeletedEmail(
                        email,
                        userName,
                        tripName,
                        imageName,
                        reason == null ? "No reason provided" : reason
                );
            } catch (MessagingException e) {
                System.err.println("❌ Email sending error: " + e.getMessage());
            }
        }

        return ResponseEntity.ok("✅ Image has been deleted and email sent.");
    }

    @DeleteMapping("/delete-album")
    public ResponseEntity<?> deleteAlbum(
            @RequestParam String albumName,
            @RequestParam Long tripId,
            @RequestParam(required = false) String reason
    ) {
        albumName = albumName.trim();
        System.out.println("📛 Received request to delete album: '" + albumName + "', tripId: " + tripId);

        List<AlbumImage> images = albumRepo.findByTripIdAndAlbumNameIgnoreCase(tripId, albumName);
        if (images.isEmpty()) {
            System.out.println("⚠️ No album found with name '" + albumName + "' and tripId = " + tripId);
            return ResponseEntity.badRequest().body("Album not found");
        }

        AlbumImage firstImage = images.get(0);
        String email = null;
        String userName = null;
        String tripName = null;

        if (firstImage.getTrip() != null && firstImage.getTrip().getUser() != null) {
            email = firstImage.getTrip().getUser().getEmail();
            userName = firstImage.getTrip().getUser().getName();
            tripName = firstImage.getTrip().getName();
        }

        albumRepo.deleteAll(images);
        albumRepo.flush();

        if (email != null) {
            try {
                mailService.sendAlbumDeletedEmail(
                        email,
                        userName,
                        tripName,
                        albumName,
                        reason == null ? "No reason provided" : reason.trim()
                );
            } catch (MessagingException e) {
                System.err.println("❌ Error sending email when deleting album: " + e.getMessage());
            }
        } else {
            System.out.println("⚠️ User email not found, cannot send notification.");
        }

        return ResponseEntity.ok("✅ Album has been deleted and email sent.");
    }

    @PostMapping("/{tripId}/upload")
    public ResponseEntity<?> uploadImage(
            @PathVariable Long tripId,
            @RequestParam("image") MultipartFile file,
            @RequestParam("name") String name
    ) {
        if (file.isEmpty() || name.isEmpty()) {
            return ResponseEntity.badRequest().body("Missing file or image name");
        }

        Trip trip = tripRepo.findById(tripId).orElse(null);
        if (trip == null) {
            return ResponseEntity.badRequest().body("Trip not found");
        }

        try {
            File tripFolder = new File(uploadDir + "/trip-" + tripId);
            if (!tripFolder.exists()) tripFolder.mkdirs();

            String uniqueName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            File destFile = new File(tripFolder, uniqueName);
            file.transferTo(destFile);

            String imageUrl = "/uploads/trip-" + tripId + "/" + uniqueName;

            AlbumImage image = new AlbumImage();
            image.setName(name);
            image.setTrip(trip);
            image.setUrl(imageUrl);
            image.setCreatedAt(LocalDateTime.now());

            albumRepo.save(image);

            return ResponseEntity.ok("✅ Image uploaded successfully");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("❌ Error saving file");
        }
    }

    private AlbumImageDTO convertToDTO(AlbumImage image) {
        AlbumImageDTO dto = new AlbumImageDTO();
        dto.setId(image.getId());
        dto.setName(image.getName());
        dto.setUrl(image.getUrl());
        dto.setCreatedAt(image.getCreatedAt());

        Trip trip = image.getTrip();
        if (trip != null) {
            dto.setTripId(trip.getTripId());
            dto.setTripName(trip.getName());
            if (trip.getUser() != null) {
                dto.setUserEmail(trip.getUser().getEmail());
            }
        }

        return dto;
    }
}
