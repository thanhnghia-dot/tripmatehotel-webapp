package aptech.tripmate.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;


@Entity
@Table(name = "historical_visitor_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoricalVisitorData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên địa điểm
    @Column(nullable = false)
    private String locationName;

    // Ngày ghi nhận
    @Column(nullable = false)
    private LocalDate date;

    // Số lượng khách đã ghi nhận
    @Column(nullable = false)
    private Integer visitorCount;

    // Mùa / thời điểm (để AI học xu hướng)
    private String season;

    // Ghi chú (nếu cần)
    private String note;

    @Column(name = "average_price", nullable = false)
    private Double averagePrice;
}
