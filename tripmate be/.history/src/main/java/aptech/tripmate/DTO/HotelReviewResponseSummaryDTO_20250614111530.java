package aptech.tripmate.DTO;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class HotelReviewResponseSummaryDTO {
  private Double averageRating;
  private List<HotelReviewResponseDTO> reviews;
}
