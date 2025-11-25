package aptech.tripmate.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class CancelRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private TripRoom tripRoom;

    @ManyToOne
    private User user;  // người yêu cầu hủy

    @Column(length = 500)
    private String reasons; // lưu dạng CSV "Change of plan,Found cheaper hotel"

    @Column(length = 500)
    private String otherReason;

    private String status = "PENDING"; // PENDING / APPROVED / REJECTED

    private LocalDateTime requestedAt = LocalDateTime.now();
}
