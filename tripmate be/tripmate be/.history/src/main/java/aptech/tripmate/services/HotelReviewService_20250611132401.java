package aptech.tripmate.services;

import aptech.tripmate.DTO.HotelReviewRequestDTO;
import aptech.tripmate.DTO.HotelReviewResponseDTO;
import aptech.tripmate.models.HotelReview;

import java.util.List;

public interface HotelReviewService {
    HotelReview createReview(HotelReviewRequestDTO dto, String userEmail);
    List<HotelReviewResponseDTO> getReviewDTOsByHotel(Long hotelId);
}
