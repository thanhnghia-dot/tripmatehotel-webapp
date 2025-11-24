package aptech.tripmate.models;

import aptech.tripmate.enums.LeaveRequestStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "leave_requests")
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // liên kết tới trip
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    @JsonIgnoreProperties({"members", "owner"}) // tránh vòng lặp JSON
    private Trip trip;

    // liên kết tới user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "trips", "roles"})
    private User user;

    // Lý do rời nhóm (nếu chọn từ danh sách có sẵn)
    private String reason;

    // Lý do khác (nếu chọn "Other")
    private String otherReason;

    // Phản hồi của OWNER
    private String ownerResponse;

    @Enumerated(EnumType.STRING)
    private LeaveRequestStatus status = LeaveRequestStatus.PENDING;

    private Instant createdAt = Instant.now();
}
