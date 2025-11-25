package aptech.tripmate.DTO;

import java.time.LocalDateTime;

import aptech.tripmate.enums.ReviewType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetailReviewResponse {

    private String comment;
    private int rating;
    private String image;
    private ReviewType type;
    private String createdBy;
    private LocalDateTime createdAt;
    private String hotel;
    private String hotelImg;
    private String trip;
    
}
