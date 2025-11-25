package aptech.tripmate.models;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "search_trend_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchTrendData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên địa điểm
    @Column(nullable = false)
    private String locationName;

    // Ngày ghi nhận xu hướng
    @Column(nullable = false)
    private LocalDate date;

    // Điểm xu hướng (0 - 100)
    @Column(nullable = false)
    private Integer trendScore;

    // Nguồn dữ liệu (Google Trends, Facebook, TikTok, ...)
    private String source;
}
