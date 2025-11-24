package aptech.tripmate.services;

import aptech.tripmate.DTO.HotelReviewRequestDTO;
import aptech.tripmate.DTO.HotelReviewResponseDTO;
import aptech.tripmate.DTO.HotelReviewResponseSummaryDTO;
import aptech.tripmate.models.HotelReview;

public interface HotelReviewService {
    HotelReview createReview(HotelReviewRequestDTO dto, String userEmail);
    HotelReviewResponseSummaryDTO getReviewDTOsByHotel(Long hotelId);
}
