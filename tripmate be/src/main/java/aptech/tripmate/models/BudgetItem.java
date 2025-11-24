package aptech.tripmate.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "budget_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BudgetItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long budgetId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "trip_id")
    @JsonIgnoreProperties({"budgetItems", "user", "checklistItems", "tripMembers"})
    private Trip trip;

    private String type;
    private Double estimated;
    private Double actual; // Tổng 4 loại bên dưới

    @Column
    private Double food;

    @Column
    private Double transport;

    @Column
    private Double hotel;

    @Column
    private Double other;
    @Column
    private Double sightseeing;

    @Column
    private Double entertainment;

    @Column
    private Double shopping;

    private String note;
    @Column
    private String foodNote;

    @Column
    private String transportNote;

    @Column
    private String hotelNote;

    @Column
    private String sightseeingNote;

    @Column
    private String entertainmentNote;

    @Column
    private String shoppingNote;

    @Column
    private String otherNote;
    @Column
    private Double actualFood;

    @Column
    private Double actualTransport;

    @Column
    private Double actualHotel;

    @Column
    private Double actualSightseeing;

    @Column
    private Double actualEntertainment;

    @Column
    private Double actualShopping;

    @Column
    private Double actualOther;

    private LocalDate createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDate.now();
    }
    public void calculateActualTotal() {
        this.actual =
                (actualFood != null ? actualFood : 0.0)
                        + (actualTransport != null ? actualTransport : 0.0)
                        + (actualHotel != null ? actualHotel : 0.0)
                        + (actualSightseeing != null ? actualSightseeing : 0.0)
                        + (actualEntertainment != null ? actualEntertainment : 0.0)
                        + (actualShopping != null ? actualShopping : 0.0)
                        + (actualOther != null ? actualOther : 0.0);
    }
}

