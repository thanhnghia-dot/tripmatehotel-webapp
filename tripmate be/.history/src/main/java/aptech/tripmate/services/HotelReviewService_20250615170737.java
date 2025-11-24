package aptech.tripmate.services;

import java.time.LocalDateTime;
import java.util.List;

import aptech.tripmate.DTO.HotelRatingComparisonDTO;
import aptech.tripmate.DTO.HotelReviewRequestDTO;
import aptech.tripmate.DTO.HotelReviewResponseSummaryDTO;
import aptech.tripmate.DTO.HotelReviewStatsDTO;
import aptech.tripmate.models.HotelReview;

public interface HotelReviewService {
    HotelReview createReview(HotelReviewRequestDTO dto, String userEmail);
    HotelReviewResponseSummaryDTO getReviewDTOsByHotel(Long hotelId);
    HotelReviewResponseSummaryDTO getReviewDTOsByHotel(Long hotelId, String userEmail);
    List<HotelReviewStatsDTO> getStats(Long hotelId, String period, LocalDateTime fromDate, LocalDateTime toDate);
    List<HotelRatingComparisonDTO> getHotelRatingComparison(LocalDateTime fromDate, LocalDateTime toDate);
}
