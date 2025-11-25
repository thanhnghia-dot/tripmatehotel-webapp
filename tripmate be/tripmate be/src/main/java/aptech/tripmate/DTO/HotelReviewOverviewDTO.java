package aptech.tripmate.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class HotelReviewOverviewDTO {
    private double overallRating;           // Tổng điểm trung bình
    private long totalReviewCount;          // Tổng số đánh giá

    private double serviceRating;           // Ví dụ điểm Service
    private double cleanlinessRating;       // Điểm sạch sẽ
    private double locationRating;          // ...
    private double facilitiesRating;
    private double valueForMoneyRating;
}
