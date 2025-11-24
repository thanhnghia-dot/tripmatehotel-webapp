package aptech.tripmate.controllers;

import aptech.tripmate.DTO.HotelReviewRequestDTO;
import aptech.tripmate.DTO.HotelReviewResponseDTO;
import aptech.tripmate.DTO.HotelReviewResponseSummaryDTO;
import aptech.tripmate.models.HotelReview;
import aptech.tripmate.services.HotelReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotel-reviews")
public class HotelReviewController {

    @Autowired
    private HotelReviewService hotelReviewService;

    @PostMapping
    public ResponseEntity<HotelReview> createReview(@RequestBody HotelReviewRequestDTO dto) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        HotelReview review = hotelReviewService.createReview(dto, email);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/{hotelId}")
    public ResponseEntity<HotelReviewResponseSummaryDTO> getReviewDTOs(@PathVariable Long hotelId) {
        return ResponseEntity.ok(hotelReviewService.getReviewDTOsByHotel(hotelId));
    }

    @GetMapping("/{hotelId}/my-reviews")
    public ResponseEntity<HotelReviewResponseDTO> getMyReviewsByHotel(@PathVariable Long hotelId) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        HotelReviewResponseDTO reviews = hotelReviewService.getMyReviewsByHotel(hotelId, email);
        return ResponseEntity.ok(reviews);
    }

}
