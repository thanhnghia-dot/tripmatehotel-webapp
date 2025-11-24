// src/main/java/aptech/tripmate/models/safety/SosLog.java
package aptech.tripmate.models.safety;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "sos_logs")
@Data
public class SosLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long tripId;

    private Double latitude;
    private Double longitude;

    @Column(length = 500)
    private String message;

    @Lob
    private String recipients; // lưu list email dạng chuỗi, ví dụ JSON

    private LocalDateTime createdAt = LocalDateTime.now();
}
