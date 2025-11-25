package aptech.tripmate.services;

import aptech.tripmate.DTO.HotelReviewRequestDTO;
import aptech.tripmate.DTO.HotelReviewResponseDTO;
import aptech.tripmate.DTO.HotelReviewResponseSummaryDTO;
import aptech.tripmate.models.*;
import aptech.tripmate.repositories.HotelRepository;
import aptech.tripmate.repositories.HotelReviewRepository;
import aptech.tripmate.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HotelReviewServiceImpl implements HotelReviewService {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private HotelReviewRepository hotelReviewRepository;

    @Autowired
    private UserRepository userRepository;

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
            .userName(r.getUser().getName()) // hoặc r.getUser().getEmail()
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
}
