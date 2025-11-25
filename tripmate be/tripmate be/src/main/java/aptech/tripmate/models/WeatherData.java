package aptech.tripmate.models;



import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "weather_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeatherData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên địa điểm
    @Column(nullable = false)
    private String locationName;

    // Ngày dự báo / ghi nhậna
    @Column(nullable = false)
    private LocalDate date;

    // Nhiệt độ trung bình
    private Double temperature;

    // Lượng mưa (mm)
    private Double rainfall;

    // Điều kiện thời tiết (nắng, mưa, mây, bão, ...)
    private String weatherCondition;

    // Độ ẩm (%)
    private Double humidity;

    // Tốc độ gió (km/h)
    private Double windSpeed;

    private String weatherDescription;
}

