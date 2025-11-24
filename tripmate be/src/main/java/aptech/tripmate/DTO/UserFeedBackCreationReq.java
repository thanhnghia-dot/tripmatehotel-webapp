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
public class UserFeedBackCreationReq {
    private String content;
    
}
