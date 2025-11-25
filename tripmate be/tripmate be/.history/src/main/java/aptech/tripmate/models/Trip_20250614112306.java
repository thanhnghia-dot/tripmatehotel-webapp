package aptech.tripmate.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
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
    private String type;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isPublic;
    private Double totalAmount;
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")  // Cột khóa ngoại trong bảng trip
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "trips", "password"}) // tránh user lặp lại trip
    private User user;

    @OneToMany(mappedBy = "trip")
    @JsonIgnoreProperties("trips")
    private List<Payment> payments;

    @OneToMany(mappedBy = "trip")
    private List<BudgetItem> budgetItems;

    @OneToMany(mappedBy = "trip")
    @JsonIgnoreProperties("trip") // để tránh ChecklistItem gọi ngược lại Trip
    private List<ChecklistItem> checklistItems;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // nếu không muốn bị lặp khi trả JSON
    private List<TripMember> tripMembers = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    @JsonIgnoreProperties("rooms") // Tránh vòng lặp khi JSON
    private Hotel hotel;

    @OneToMany(mappedBy = "trip")
    private List<TripRoom> tripRooms;

    private Boolean isFinished;
    private LocalDateTime finishedAt;
}
