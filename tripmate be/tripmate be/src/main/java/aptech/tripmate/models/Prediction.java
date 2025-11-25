package aptech.tripmate.models;



import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "predictions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Điểm du lịch
    private String location;
    private double averagePrice;
    // Ngày dự đoán
    private LocalDate predictionDate;

    // Dự đoán lượng khách
    private Integer predictedVisitors;

    // Mức độ đông đúc (Low, Medium, High)
    private String crowdLevel;

    // Giá trung bình dự kiến (nếu có dữ liệu)
    private Double predictedPrice;

    // Lý do / nguồn dự đoán
    @Column(length = 1000)
    private String reason;

    // Ngày tạo bản ghi
    private LocalDate createdAt;

    @Column(length = 1000)
    private String suggestion;

    private int visitorCount;


        // Thêm fields thời tiết và xu hướng tìm kiếm
        private String weatherDescription;
        private Double temperature;
        private Integer trendScore;
    }


