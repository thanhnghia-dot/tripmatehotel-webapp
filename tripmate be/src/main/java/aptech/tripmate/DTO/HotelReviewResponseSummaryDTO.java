package aptech.tripmate.DTO;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class HotelReviewResponseSummaryDTO {
  private Double averageRating;
  private List<HotelReviewResponseDTO> reviews;

}
