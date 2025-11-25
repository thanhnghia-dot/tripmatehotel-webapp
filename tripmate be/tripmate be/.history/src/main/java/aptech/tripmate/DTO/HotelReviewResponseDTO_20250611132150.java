package aptech.tripmate.DTO;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class HotelReviewResponseDTO {
    private Long id;
    private int rating;
    private String comment;
    private String userName; // hoặc userEmail
    private LocalDateTime createdAt;
}
