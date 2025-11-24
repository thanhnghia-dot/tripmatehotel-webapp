package aptech.tripmate.controllers;

import aptech.tripmate.DTO.HotelReviewRequestDTO;
import aptech.tripmate.DTO.HotelReviewResponseDTO;
import aptech.tripmate.DTO.HotelReviewResponseSummaryDTO;
import aptech.tripmate.DTO.HotelReviewStatsDTO;
import aptech.tripmate.models.HotelReview;
import aptech.tripmate.services.HotelReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    public ResponseEntity<HotelReviewResponseSummaryDTO> getMyReviewsByHotel(@PathVariable Long hotelId) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return ResponseEntity.ok(hotelReviewService.getReviewDTOsByHotel(hotelId, email));
    }

    @GetMapping("/{hotelId}/statistics")
    public ResponseEntity<?> getHotelReviewStats(
            @PathVariable Long hotelId,
            @RequestParam(defaultValue = "monthly") String period,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        try {
            List<HotelReviewStatsDTO> stats = hotelReviewService.getReviewStatistics(hotelId, period, fromDate, toDate);
            Map<String, Object> response = new HashMap<>();
            response.put("status", 200);
            response.put("message", "Hotel review statistics fetched successfully");
            response.put("data", stats);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "message", "Failed to fetch statistics",
                "error", e.getMessage()
            ));
        }
    }
}
