package aptech.tripmate.services;

import aptech.tripmate.DTO.HotelReviewRequestDTO;
import aptech.tripmate.DTO.HotelReviewResponseSummaryDTO;
import aptech.tripmate.models.HotelReview;

import java.util.List;

public interface HotelReviewService {
    HotelReview createReview(HotelReviewRequestDTO dto, String userEmail);
    HotelReviewResponseSummaryDTO getReviewDTOsByHotel(Long hotelId);
    List<HotelReview> getMyReviewsByHotel(Long hotelId, String userEmail);
}
