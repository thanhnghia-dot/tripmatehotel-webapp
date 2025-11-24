package aptech.tripmate.controllers;

import aptech.tripmate.DTO.HotelReviewRequestDTO;
import aptech.tripmate.DTO.HotelReviewResponseDTO;
import aptech.tripmate.DTO.HotelReviewResponseSummaryDTO;
import aptech.tripmate.DTO.ReviewStatsDTO;
import aptech.tripmate.models.HotelReview;
import aptech.tripmate.services.HotelReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
    public ResponseEntity<HotelReviewResponseSummaryDTO> getMyReviewsByHotel(@PathVariable Long hotelId) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return ResponseEntity.ok(hotelReviewService.getReviewDTOsByHotel(hotelId, email));
    }

    @GetMapping("/{hotelId}/statistics")
    public ResponseEntity<?> getHotelReviewStatistics(
    @PathVariable Long hotelId,
    @RequestParam(defaultValue = "month") String range,
    @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate fromDate,
    @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate toDate) {

    // Nếu không truyền thì mặc định lấy 6 tháng gần nhất
    if (fromDate == null || toDate == null) {
        toDate = LocalDate.now();
        fromDate = switch (range) {
            case "week" -> toDate.minusWeeks(12);
            case "year" -> toDate.minusYears(3);
            default -> toDate.minusMonths(6);
        };
    }

    List<ReviewStatsDTO> stats = hotelReviewService.getStatistics(hotelId, fromDate, toDate, range);

    return ResponseEntity.ok(Map.of(
        "hotelId", hotelId,
        "range", range,
        "fromDate", fromDate,
        "toDate", toDate,
        "data", stats
    ));
}
}
