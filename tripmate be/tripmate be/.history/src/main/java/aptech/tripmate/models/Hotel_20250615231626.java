package aptech.tripmate.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hotel")
@Data // Cung cấp getter, setter, toString, equals, hashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder // Bắt buộc để dùng Hotel.builder()
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String address;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private int starRating;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("hotel") // ngăn vòng lặp khi Hotel gọi lại Room
    private List<Room> rooms;

    private String imageUrl;
    private Double pricePerNight;
    private String description;
    private String description2;
    private String description3;
    private String description4;
    private String description5;
    private String description6;
    private String description7;
    private String description8;
    private String description9;
    private String description10;
    private String description11;
    private String description12;
}
