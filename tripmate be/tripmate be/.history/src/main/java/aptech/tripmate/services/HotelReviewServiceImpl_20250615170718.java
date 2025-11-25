package aptech.tripmate.services;

import aptech.tripmate.DTO.HotelRatingComparisonDTO;
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

}
