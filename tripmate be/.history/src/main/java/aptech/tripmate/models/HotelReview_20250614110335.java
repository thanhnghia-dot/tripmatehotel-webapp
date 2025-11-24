package aptech.tripmate.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "hotel_review")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private int rating; // 1–5 stars

    private String comment;

    private LocalDateTime createdAt = LocalDateTime.now();
}
