package aptech.tripmate.models;

import aptech.tripmate.enums.MemberRole;
import aptech.tripmate.models.checklist.ChecklistItem;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trip")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tripId;

    private String name;
    private String destination;
    @Column(name = "departure_point")
    private String departurePoint;

    @Column(name = "status")
    private String status = "planning";
    private String type;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isPublic;
    private Double totalAmount;
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "trips", "password"})
    private User user;

    @OneToMany(mappedBy = "trip")
    @JsonIgnoreProperties("trip")
    private List<Payment> payments;

    @OneToMany(mappedBy = "trip")
    @JsonIgnoreProperties("trip")
    private List<BudgetItem> budgetItems;

    @OneToMany(mappedBy = "trip")
    @JsonIgnoreProperties("trip")
    private List<ChecklistItem> checklistItems;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // ✅ tránh lặp Trip → TripMember → Trip
    private List<TripMember> tripMembers = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    @JsonIgnoreProperties({"rooms"}) // ✅ chỉ giữ thông tin khách sạn, bỏ ngược về Trip
    private Hotel hotel;
    // thêm này vào
    @Column(name = "initial_total_amount")
    private Double initialTotalAmount;
    // thêm này vào
    @OneToMany(mappedBy = "trip",cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnoreProperties("trip")
    private List<TripRoom> tripRooms;
    public List<User> getMembers() {
        return tripMembers.stream()
                .map(TripMember::getUser)
                .toList();
    }
    // thêm vào
    @Column(name = "is_finished")
    private Boolean isFinished = false;
    private LocalDateTime finishedAt;
    public User getOwner() {
        if (tripMembers != null) {
            return tripMembers.stream()
                    .filter(m -> m.getRole() == MemberRole.OWNER)
                    .map(TripMember::getUser)
                    .findFirst()
                    .orElse(null);
        }
        return null;
    }
}
