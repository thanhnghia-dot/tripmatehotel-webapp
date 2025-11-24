package aptech.tripmate.DTO;

import aptech.tripmate.enums.ReviewType;
import lombok.Data;

@Data
public class FeedBackRequest {
    private Long userId;
    private String content;
    private ReviewType type;

}
