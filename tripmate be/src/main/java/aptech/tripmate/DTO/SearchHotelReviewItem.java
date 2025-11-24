package aptech.tripmate.DTO;


import aptech.tripmate.enums.ReviewType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SearchHotelReviewItem {
    private Long id;
    private String comment;
    private int rating;
    private String image;
    private ReviewType type;
    private LocalDateTime createdAt;
    private String username;
    // thêm
    private String statusSent;
    private String reply;

}
