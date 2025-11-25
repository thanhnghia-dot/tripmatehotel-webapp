package aptech.tripmate.controllers;

import aptech.tripmate.DTO.*;
import aptech.tripmate.models.HotelReview;
import aptech.tripmate.models.ReviewReply;
import aptech.tripmate.repositories.HotelReviewRepository;
import aptech.tripmate.services.HotelReviewService;
import aptech.tripmate.services.HotelReviewServiceImpl;
import aptech.tripmate.untils.ApiResponse;
import aptech.tripmate.untils.PagedData;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;



import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;




@RestController
@RequestMapping("/api/hotel-reviews")
public class HotelReviewController {

    @Autowired
    private HotelReviewService hotelReviewService;
    @Autowired
    private HotelReviewRepository hotelReviewRepository;
    @Autowired
    private HotelReviewServiceImpl hotelReviewServiceImpl;

    @PostMapping("/feedback/{id}/reply")
    public ResponseEntity<ApiResponse<Long>> replyFeedBack(
            @PathVariable Long id   ,
            @RequestBody ReplyFeedBackCreation req,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Long replyId = hotelReviewService.replyFeeback(id, req, email);

        return ResponseEntity.ok(ApiResponse.created(replyId, "Reply created successfully"));
    }




    @GetMapping("detail/{id}")
    public ResponseEntity<ApiResponse<DetailReviewResponse>> getDetailReviewHotel(@PathVariable Long id ) {
        var res = hotelReviewService.getDetailReview(id);
        return ResponseEntity.ok(ApiResponse.success(res, "Get detail review successfully"));
    }


    @GetMapping("/all")
    public ResponseEntity<ApiResponse<PagedData<SearchHotelReviewItem>>> getAllReviewHotel(
            SearchHotelReviewCriteria criteria,
            @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC ) Pageable pageable
    ) {
        PagedData<SearchHotelReviewItem> result = hotelReviewService.searchReview(criteria, pageable);

        return ResponseEntity.ok(ApiResponse.success(result, "Search completed successfully"));
    }

    @GetMapping("/feedback-all")
    public ResponseEntity<ApiResponse<PagedData<SearchUserFeedBackItem>>> getAllReviewHotel(
            SearchUserFeedBackItemCriteria criteria,
            @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC ) Pageable pageable
    ) {
        PagedData<SearchUserFeedBackItem> result = hotelReviewService.searchFeedBack(criteria, pageable);

        return ResponseEntity.ok(ApiResponse.success(result, "Search completed successfully"));
    }

    @PostMapping("/create")
    public ResponseEntity<Long> createReview(
            @RequestPart("req") @Valid UserReviewCreationReq req,
            @RequestPart(value = "image", required = false) MultipartFile imageFile
    ) {
        String email = getCurrentUserEmail();
        Long id = hotelReviewService.createUserReview(req, imageFile, email);
        return ResponseEntity.ok(id);
    }



    @PostMapping("/feedback")
    public ResponseEntity<Long> createFeedback(@RequestBody UserFeedBackCreationReq req) {

        String email = getCurrentUserEmail();
        Long id = hotelReviewService.createUserFeedBack(req, email);
        return ResponseEntity.ok(id);
    }

    public String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }


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
            @RequestParam String period,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        // Chuyển từ LocalDate → LocalDateTime để dùng trong Service
        LocalDateTime start = fromDate.atStartOfDay();
        LocalDateTime end = toDate.atTime(23, 59, 59);

        List<HotelReviewStatsDTO> stats = hotelReviewService.getStats(hotelId, period, start, end);
        return ResponseEntity.ok(Map.of(
                "status", 200,
                "message", "Hotel review statistics fetched successfully",
                "data", stats
        ));
    }

    @GetMapping("/statistics/compare")
    public ResponseEntity<List<HotelRatingComparisonDTO>> compareHotelRatings(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        // Chuyển sang LocalDateTime để dùng truy vấn
        LocalDateTime fromDateTime = fromDate.atStartOfDay();
        LocalDateTime toDateTime = toDate.atTime(LocalTime.MAX);

        return ResponseEntity.ok(hotelReviewService.getHotelRatingComparison(fromDateTime, toDateTime));
    }
    @GetMapping("/hotel-reviews/{hotelId}")
    public ResponseEntity<List<HotelReviewResponseDTO>> getReviews(@PathVariable Long hotelId) {
        List<HotelReview> reviews = hotelReviewRepository.findByHotel_Id(hotelId);
        List<HotelReviewResponseDTO> response = reviews.stream()
                .map(review -> HotelReviewResponseDTO.builder()
                        .id(review.getId())
                        .comment(review.getComment())
                        .rating(review.getRating())
                        .userName(review.getUser().getEmail())
                        .statusSent(review.getStatusSent())
                        .image(review.getImage())
                        .createdAt(review.getCreatedAt())
                        .build()
                )
                .toList();

        return ResponseEntity.ok(response);
    }
    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<?> replyToReview(
            @PathVariable Long reviewId,
            @RequestBody HotelReviewReplyRequest request
    ) {
        try {
            ReviewReply reply = hotelReviewService.replyReview(reviewId, request);
            return ResponseEntity.ok(reply);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("❌ Failed to reply: " + e.getMessage());
        }
    }



    @GetMapping("/{id}/overview")
    public ResponseEntity<HotelReviewOverviewDTO> getHotelReviewOverview(@PathVariable Long id) {
        return ResponseEntity.ok(hotelReviewService.getHotelReviewOverview(id));
    }

}
