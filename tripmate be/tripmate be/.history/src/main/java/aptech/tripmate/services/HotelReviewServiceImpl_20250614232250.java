package aptech.tripmate.services;

import aptech.tripmate.DTO.HotelReviewRequestDTO;
import aptech.tripmate.DTO.HotelReviewResponseDTO;
import aptech.tripmate.DTO.HotelReviewResponseSummaryDTO;
import aptech.tripmate.DTO.HotelReviewStatsDTO;
import aptech.tripmate.models.*;
import aptech.tripmate.repositories.HotelRepository;
import aptech.tripmate.repositories.HotelReviewRepository;
import aptech.tripmate.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
            .userName(r.getUser().getEmail()) // hoặc r.getUser().getEmail()
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
            .userName(r.getUser().getEmail()) // hoặc r.getUser().getEmail()
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
    public List<HotelReviewStatsDTO> getHotelStats(Long hotelId, String period, LocalDateTime fromDate, LocalDateTime toDate) {
        List<Object[]> rawStats;

        switch (period.toLowerCase()) {
            case "weekly":
                rawStats = hotelReviewRepository.getStatsByWeek(hotelId, fromDate, toDate);
                break;
            case "monthly":
                rawStats = hotelReviewRepository.getStatsByMonth(hotelId, fromDate, toDate);
                break;
            case "yearly":
                rawStats = hotelReviewRepository.getStatsByYear(hotelId, fromDate, toDate);
                break;
            default:
                throw new IllegalArgumentException("Invalid period type. Must be one of: weekly, monthly, yearly.");
        }

        return rawStats.stream().map(this::mapToDto).toList();
    }

    private HotelReviewStatsDTO mapToDto(Object[] row) {
        HotelReviewStatsDTO dto = new HotelReviewStatsDTO();
        dto.setLabel((String) row[0]);
        dto.setAverageRating(row[1] != null ? ((Number) row[1]).doubleValue() : 0);
        dto.setReviewCount(row[2] != null ? ((Number) row[2]).intValue() : 0);
        return dto;
    }

}
