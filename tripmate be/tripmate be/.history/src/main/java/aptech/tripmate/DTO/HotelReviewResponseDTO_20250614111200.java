package aptech.tripmate.DTO;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class HotelReviewResponseDTO {
    private Double averageRating;
    private List<HotelReviewListResponseDTO> reviews;
}

@Data
@Builder
class HotelReviewListResponseDTO {
    private Long id;
    private int rating;
    private String comment;
    private String userName; // hoặc userEmail
    private LocalDateTime createdAt;
}