package aptech.tripmate.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SearchHotelReviewCriteria {

    private String createdBy;
    private String comment;
    private LocalDateTime createdAt;
    
}
