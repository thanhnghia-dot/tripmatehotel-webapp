package aptech.tripmate.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonParser.NumberType;

import aptech.tripmate.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "room")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomName;
    @Column(columnDefinition = "TEXT")
    private String description;
    private Double price;
    @Lob
    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    private String imageUrl;
    private int numberOfBeds;
    private int capacity;
    @ElementCollection
    private List<String> imageUrls;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    @JsonIgnore // ✅ Chặn vòng lặp Room → Hotel → Trip → Room
    private Hotel hotel;

    @Enumerated(EnumType.STRING)
    private RoomStatus roomStatus;
    @ManyToOne
    @JoinColumn(name = "room_type_id")
    @JsonIgnoreProperties({"hotel", "rooms", "hibernateLazyInitializer", "handler"})
    private RoomType roomType;
    @Column(name = "is_paid")
    private Boolean isPaid = false;
    @Column(name = "discount_percentage")
    private Double discountPercentage;
    @Column(name = "final_price")
    private Double finalPrice;
}
