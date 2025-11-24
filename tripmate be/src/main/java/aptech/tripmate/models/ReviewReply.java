package aptech.tripmate.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "review_reply")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "review_id", nullable = false)
    private HotelReview review;

    @Column(name = "reply", columnDefinition = "TEXT", nullable = false)
    private String reply;

    @Column(name = "replied_by", nullable = false)
    private String repliedBy; //name user co role admin 

    @Column(name = "replied_at", nullable = false)
    private LocalDateTime repliedAt = LocalDateTime.now();
    //thêm
    @Column(name = "status_sent")
    private Boolean statusSent;
    // thêm
    @ManyToOne
    @JoinColumn(name = "hotel_review_id")
    private HotelReview hotelReview;
}