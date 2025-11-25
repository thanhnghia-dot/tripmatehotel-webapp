package aptech.tripmate.services;

import java.time.LocalDateTime;
import java.util.List;

import aptech.tripmate.DTO.*;
import aptech.tripmate.models.ReviewReply;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import aptech.tripmate.models.HotelReview;
import aptech.tripmate.untils.PagedData;

public interface HotelReviewService {
    HotelReview createReview(HotelReviewRequestDTO dto, String userEmail);
    HotelReviewResponseSummaryDTO getReviewDTOsByHotel(Long hotelId);
    HotelReviewResponseSummaryDTO getReviewDTOsByHotel(Long hotelId, String userEmail);
    List<HotelReviewStatsDTO> getStats(Long hotelId, String period, LocalDateTime fromDate, LocalDateTime toDate);
    List<HotelRatingComparisonDTO> getHotelRatingComparison(LocalDateTime fromDate, LocalDateTime toDate);

    //new
    Long createUserReview(UserReviewCreationReq req, MultipartFile imageFile, String email);
    Long createUserFeedBack(UserFeedBackCreationReq req, String email);
    PagedData<SearchHotelReviewItem> searchReview(SearchHotelReviewCriteria criteria, Pageable pageable);
    PagedData<SearchUserFeedBackItem> searchFeedBack(SearchUserFeedBackItemCriteria criteria, Pageable pageable);
    DetailReviewResponse getDetailReview(final Long id);
    ReviewReply replyReview(Long reviewId, HotelReviewReplyRequest request);
    Long replyFeeback(final Long feedBackId, ReplyFeedBackCreation req, String email);
    HotelReviewOverviewDTO getHotelReviewOverview(Long hotelId);

}
