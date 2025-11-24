package aptech.tripmate.models.checklist;

import aptech.tripmate.enums.checklist.ChecklistStatus;
import aptech.tripmate.enums.checklist.CostSource;
import aptech.tripmate.models.Trip;
import aptech.tripmate.models.User;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "checklist_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class ChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    // Giữ nguyên scalar FK để không phải đổi service/repo
    @Column(name = "trip_id", nullable = false)
    private Long tripId;

    // Quan hệ ManyToOne với Trip
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({
            "checklistItems",
            "payments",
            "budgetItems",
            "tripMembers",
            "hotel",
            "tripRooms"
    })
    private Trip trip;

    @Column(name = "item_name", nullable = false, length = 255)
    private String itemName;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    // Người phụ trách hiện tại
    @Column(name = "assignee_user_id")
    private Long assigneeUserId;

    // ✅ NEW: lưu thông tin người đã transfer (A → B)
    @Column(name = "transferred_from_user_id")
    private Long transferredFromUserId;

    @Column(name = "price", precision = 19, scale = 2)
    private BigDecimal price;

    @Column(name = "deadline")
    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ChecklistStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "cost_source", length = 50)
    private CostSource costSource;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;



    private boolean isChecked = false;

    private boolean suggestedByAi = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;
}
