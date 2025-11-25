package aptech.tripmate.models;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "room_payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    private Double price;
    private String currency;
    private String status;    // pending, paid, failed,...
    private String description;
    private LocalDate createdAt;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "trip_room_id")
    private TripRoom tripRoom;
    private BigDecimal amount;
    private String paypalCaptureId; // lưu để refund
    private String paypalRefundId;
}
