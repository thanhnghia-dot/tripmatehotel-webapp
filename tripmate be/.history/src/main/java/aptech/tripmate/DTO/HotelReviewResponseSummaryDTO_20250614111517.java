package aptech.tripmate.DTO;

import java.util.List;

@Data
@AllArgsConstructor
public class HotelReviewResponseSummaryDTO {
  private Double averageRating;
  private List<HotelReviewResponseDTO> reviews;
}
