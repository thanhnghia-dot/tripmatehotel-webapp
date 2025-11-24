package aptech.tripmate.services;

import aptech.tripmate.DTO.*;
import aptech.tripmate.enums.ReviewType;
import aptech.tripmate.models.*;
import aptech.tripmate.repositories.*;
import aptech.tripmate.repositories.TripRepository;
import aptech.tripmate.specification.FeedBackSpecification;
import aptech.tripmate.specification.HotelReviewSpecification;
import aptech.tripmate.untils.PagedData;

import java.io.IOException;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class HotelReviewServiceImpl implements HotelReviewService {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private HotelReviewRepository hotelReviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UploadFileService uploadFileService;

    @Autowired
    private FeedBackRepository feedBackRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private AdminReplyRepository adminReplyRepository;

    @Autowired
    private FeedbackReplyRepository feedbackReplyRepository;
    @Autowired
    private MailService emailService;



    @Override
    public Long replyFeeback(Long feedBackId, ReplyFeedBackCreation req, String email) {

        var feedback = feedBackRepository.findById(feedBackId).orElseThrow(
                () -> new RuntimeException("Feedback not found with id: "+ feedBackId)
        );

        var replyBy = userRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("User cannot found with email: "+ email)
        );

        var saved = feedbackReplyRepository.save(FeedbackReply.builder()
                .feedback(feedback)
                .reply(req.getReply())
                .repliedBy(replyBy.getName())
                .repliedAt(LocalDateTime.now())
                .build());

        return saved.getId();
    }





    @Override
    public DetailReviewResponse getDetailReview(Long id) {

        var review = hotelReviewRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Review cannot found with id: "+id));

        var trip = tripRepository.findByHotelId(review.getHotel().getId()).orElse(null);

        var data = DetailReviewResponse.builder()
                .comment(review.getComment())
                .rating(review.getRating())
                .image(review.getImage())
                .type(review.getType())
                .createdBy(review.getUser().getName())
                .createdAt(review.getCreatedAt())
                .hotel(review.getHotel().getName())
                .hotelImg(review.getHotel().getImageUrl())
                .trip(trip != null ? trip.getName() : "There are no trips associated with this hotel yet.")
                .build();

        return data;
    }

    @Override
    public PagedData<SearchUserFeedBackItem> searchFeedBack(SearchUserFeedBackItemCriteria criteria,
                                                            Pageable pageable) {
        var spec = FeedBackSpecification.searchFeedBack(criteria);
        var page = feedBackRepository.findAll(spec, pageable);

        var items = page.getContent().stream()
                .map(feedback -> SearchUserFeedBackItem.builder()
                        .id(feedback.getId())
                        .userName(feedback.getUser().getName())
                        .content(feedback.getContent())
                        .createdAt(feedback.getCreatedAt())
                        .type(feedback.getType())
                        .build())
                .toList();

        return PagedData.<SearchUserFeedBackItem>builder()
                .pageNo(page.getNumber())
                .elementPerPage(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .elementList(items)
                .build();
    }


    @Override
    public PagedData<SearchHotelReviewItem> searchReview(SearchHotelReviewCriteria criteria, Pageable pageable) {

        var hotelReviewSpec = HotelReviewSpecification.searchHotels(criteria);
        var hotelReviewPage = hotelReviewRepository.findAll(hotelReviewSpec,pageable);

        var items = hotelReviewPage.getContent().stream()
                .map(hotelReview -> SearchHotelReviewItem.builder()
                        .id(hotelReview.getId())
                        .comment(hotelReview.getComment())
                        .rating(hotelReview.getRating())
                        .image(hotelReview.getImage())
                        .type(hotelReview.getType())           // ✅ dòng riêng
                        .createdAt(hotelReview.getCreatedAt())
                        // thêm đi
                        .statusSent(hotelReview.getStatus())

                        .username(hotelReview.getUser() != null ? hotelReview.getUser().getName() : "Valued Guest")
                        .build()
                )
                .toList();


        return PagedData.<SearchHotelReviewItem>builder()
                .pageNo(hotelReviewPage.getNumber())
                .elementPerPage(hotelReviewPage.getSize())
                .totalElements(hotelReviewPage.getTotalElements())
                .totalPages(hotelReviewPage.getTotalPages())
                .elementList(items)
                .build();
    }

    //tao feedback & review moi
    @Override
    public Long createUserFeedBack(UserFeedBackCreationReq dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        FeedBack feedback = FeedBack.builder()
                .user(user)
                .content(dto.getContent())
                .createdAt(LocalDateTime.now())
                .build();

        var saved = feedBackRepository.save(feedback);
        return saved.getId();
    }


    @Override
    public Long createUserReview(UserReviewCreationReq dto, MultipartFile imageFile, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        Hotel hotel = hotelRepository.findById(dto.getHotelId())
                .orElseThrow(() -> new IllegalArgumentException("Hotel not found with ID: " + dto.getHotelId()));

        if (dto.getRating() < 1 || dto.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        String imageUrl = null;
        try {
            if (imageFile != null && !imageFile.isEmpty()) {
                imageUrl = uploadFileService.storeImage("reviews", imageFile);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image", e);
        }

        HotelReview review = HotelReview.builder()
                .hotel(hotel)
                .user(user)
                .type(ReviewType.REVIEW)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .image(imageUrl)
                .createdAt(LocalDateTime.now())
                .serviceRating(dto.getServiceRating())
                .cleanlinessRating(dto.getCleanlinessRating())
                .locationRating(dto.getLocationRating())
                .facilitiesRating(dto.getFacilitiesRating())
                .valueForMoneyRating(dto.getValueForMoneyRating())
                .build();

        var saved = hotelReviewRepository.save(review);
        return saved.getId();
    }



    @Override
    public HotelReview createReview(HotelReviewRequestDTO dto, String userEmail) {
        Hotel hotel = hotelRepository.findById(dto.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        HotelReview review = HotelReview.builder()
                .rating(dto.getRating())
                .comment(dto.getComment())
                .createdAt(LocalDateTime.now())
                .hotel(hotel)
                .user(user)

                .build();

        return hotelReviewRepository.save(review);
    }

    @Override
    public HotelReviewResponseSummaryDTO getReviewDTOsByHotel(Long hotelId) {
        List<HotelReview> reviews = hotelReviewRepository.findByHotel_Id(hotelId);
        List<HotelReviewResponseDTO> hotelReviews = reviews.stream().map(r -> HotelReviewResponseDTO.builder()
                .id(r.getId())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .userName(r.getUser() != null && r.getUser().getName() != null
                        ? r.getUser().getName()
                        : "Valued Guest")
                .image(r.getImage())// hoặc r.getUser().getEmail()
                .build()
        ).toList();

        Double averageRating = hotelReviewRepository.findAverageRatingByHotelId(hotelId);
        if (averageRating == null) averageRating = 0.0;

        HotelReviewResponseSummaryDTO summary = HotelReviewResponseSummaryDTO.builder()
                .averageRating(averageRating)
                .reviews(hotelReviews)
                .build();
        return summary;
    }

    @Override
    public HotelReviewResponseSummaryDTO getReviewDTOsByHotel(Long hotelId, String userEmail) {
        // Lẩy revews của khách sạn theo hotelId và userEmail
        List<HotelReview> reviews = hotelReviewRepository.findByHotel_IdAndUser_Email(hotelId, userEmail);
        List<HotelReviewResponseDTO> hotelReviews = reviews.stream().map(r -> HotelReviewResponseDTO.builder()
                .id(r.getId())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .image(r.getImage())
                .userName(r.getUser().getEmail())

                .build()
        ).toList();
        Double averageRating = hotelReviewRepository.findAverageRatingByHotelId(hotelId);
        if (averageRating == null) averageRating = 0.0;
        HotelReviewResponseSummaryDTO summary = HotelReviewResponseSummaryDTO.builder()
                .averageRating(averageRating)
                .reviews(hotelReviews)
                .build();
        return summary;
    }

    @Override
    public List<HotelReviewStatsDTO> getStats(Long hotelId, String period, LocalDateTime fromDate, LocalDateTime toDate) {
        List<Object[]> results;

        switch (period.toLowerCase()) {
            case "weekly":
                results = hotelReviewRepository.getWeeklyStats(hotelId, fromDate, toDate);
                break;
            case "monthly":
                results = hotelReviewRepository.getMonthlyStats(hotelId, fromDate, toDate);
                break;
            case "yearly":
                results = hotelReviewRepository.getYearlyStats(hotelId, fromDate, toDate);
                break;
            default:
                throw new IllegalArgumentException("Invalid period: " + period);
        }

        return results.stream()
                .map(obj -> new HotelReviewStatsDTO(
                        obj[0].toString(),
                        ((Number) obj[1]).doubleValue(),
                        ((Number) obj[2]).longValue()
                ))
                .toList();
    }

    public List<HotelRatingComparisonDTO> getHotelRatingComparison(LocalDateTime fromDate, LocalDateTime toDate) {
        List<Object[]> results = hotelReviewRepository.getHotelRatingComparison(fromDate, toDate);
        return results.stream()
                .map(obj -> new HotelRatingComparisonDTO(
                        ((Number) obj[0]).longValue(),
                        obj[1].toString(),
                        ((Number) obj[2]).doubleValue(),
                        ((Number) obj[3]).longValue()
                ))
                .toList();

    }

    private HotelReviewStatsDTO mapToDto(Object[] row) {
        HotelReviewStatsDTO dto = new HotelReviewStatsDTO();
        dto.setLabel((String) row[0]);
        dto.setAverageRating(row[1] != null ? ((Number) row[1]).doubleValue() : 0);
        dto.setReviewCount(row[2] != null ? ((Number) row[2]).intValue() : 0);
        return dto;
    }
    @Override
    public ReviewReply replyReview(Long reviewId, HotelReviewReplyRequest request) {
        HotelReview review = hotelReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("❌ Review not found"));

        ReviewReply reply = ReviewReply.builder()
                .review(review)
                .reply(request.getReply())
                .repliedBy(request.getRepliedBy())
                .repliedAt(LocalDateTime.now())
                .statusSent(true) // status_sent ở bảng reply
                .build();

        adminReplyRepository.save(reply);
        // thêm
        // Cập nhật status bên HotelReview
        review.setStatus("REPLIED");
        hotelReviewRepository.save(review);

        // Gửi email
        emailService.sendEmail(
                review.getUser().getEmail(),
                "Thanks for your Review",
                request.getReply()
        );
        return reply;
    }

    @Override
    public HotelReviewOverviewDTO getHotelReviewOverview(Long hotelId) {
        List<HotelReview> reviews = hotelReviewRepository.findByHotel_Id(hotelId);

        if (reviews.isEmpty()) {
            return HotelReviewOverviewDTO.builder()
                    .overallRating(0.0)
                    .totalReviewCount(0)
                    .serviceRating(0.0)
                    .cleanlinessRating(0.0)
                    .locationRating(0.0)
                    .facilitiesRating(0.0)
                    .valueForMoneyRating(0.0)
                    .build();
        }

        double total = 0;
        long count = 0;

        double serviceSum = 0;
        double cleanlinessSum = 0;
        double locationSum = 0;
        double facilitiesSum = 0;
        double valueSum = 0;

        long serviceCount = 0;
        long cleanlinessCount = 0;
        long locationCount = 0;
        long facilitiesCount = 0;
        long valueCount = 0;

        for (HotelReview review : reviews) {
            if (review.getRating() > 0) {
                total += review.getRating();
                count++;
            }

            if (review.getServiceRating() != null && review.getServiceRating() > 0) {
                serviceSum += review.getServiceRating();
                serviceCount++;
            }

            if (review.getCleanlinessRating() != null && review.getCleanlinessRating() > 0) {
                cleanlinessSum += review.getCleanlinessRating();
                cleanlinessCount++;
            }

            if (review.getLocationRating() != null && review.getLocationRating() > 0) {
                locationSum += review.getLocationRating();
                locationCount++;
            }

            if (review.getFacilitiesRating() != null && review.getFacilitiesRating() > 0) {
                facilitiesSum += review.getFacilitiesRating();
                facilitiesCount++;
            }

            if (review.getValueForMoneyRating() != null && review.getValueForMoneyRating() > 0) {
                valueSum += review.getValueForMoneyRating();
                valueCount++;
            }
        }

        return HotelReviewOverviewDTO.builder()
                .overallRating(count > 0 ? total / count : 0)
                .totalReviewCount(reviews.size())
                .serviceRating(serviceCount > 0 ? serviceSum / serviceCount : 0)
                .cleanlinessRating(cleanlinessCount > 0 ? cleanlinessSum / cleanlinessCount : 0)
                .locationRating(locationCount > 0 ? locationSum / locationCount : 0)
                .facilitiesRating(facilitiesCount > 0 ? facilitiesSum / facilitiesCount : 0)
                .valueForMoneyRating(valueCount > 0 ? valueSum / valueCount : 0)
                .build();
    }


}