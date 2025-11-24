package aptech.tripmate.DTO;

import java.time.LocalDateTime;

import aptech.tripmate.enums.ReviewType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SearchUserFeedBackItem {
    
    private Long id;
    private String userName;
    private String content;
    private ReviewType type;
    private LocalDateTime createdAt;
    
}
