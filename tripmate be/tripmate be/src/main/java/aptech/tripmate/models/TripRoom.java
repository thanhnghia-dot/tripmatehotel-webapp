package aptech.tripmate.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "trip_room")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank
    private String name;

    @Email
    @NotBlank
    @Column(unique = true)
    private String email;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    @JsonIgnore // ✅ tránh lặp vô hạn TripRoom → Trip
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    @JsonIgnoreProperties({"hotel", "hibernateLazyInitializer", "handler"})
    private Room room;

    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private int price;
    @ManyToOne
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;
    @Column(name = "email_sent")
    private Boolean emailSent;
    private String status;
    @Column(name = "reminder_sent_at")
    private LocalDateTime reminderSentAt;
    @OneToMany(mappedBy = "tripRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomPayment> payments;
    @OneToMany(mappedBy = "tripRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CancelRequest> cancelRequests;
    private Double amount;

}
