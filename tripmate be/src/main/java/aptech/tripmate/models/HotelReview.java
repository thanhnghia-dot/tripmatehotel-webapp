package aptech.tripmate.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import aptech.tripmate.enums.ReviewType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldNameConstants;

import java.lang.reflect.Type;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "hotel_review")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldNameConstants
public class HotelReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "hotel_id", nullable = true)
    @JsonIgnoreProperties("rooms") // ✅ không load lại toàn bộ khách sạn
    private Hotel hotel;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "trips"})
    private User user;


    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ReviewType type;
    private String imageUrl;
    @Column(name = "rating", nullable = true)
    private int rating;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;
    @Column(name = "service_rating")
    private Double serviceRating;

    @Column(name = "location_rating")
    private Double locationRating;

    @Column(name = "cleanliness_rating")
    private Double cleanlinessRating;

    @Column(name = "facilities_rating")
    private Double facilitiesRating;

    @Column(name = "value_for_money_rating")
    private Double valueForMoneyRating;
    @Column(name = "image", nullable = true)
    private String image;

   @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    private Boolean statusSent;
    @OneToMany(mappedBy = "hotelReview", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ReviewReply> replies;
    private String status;


}
