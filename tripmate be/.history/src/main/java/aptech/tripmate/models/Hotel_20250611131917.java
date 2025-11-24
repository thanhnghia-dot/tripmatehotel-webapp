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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("hotel") // ngăn vòng lặp khi Hotel gọi lại Room
    private List<Room> rooms;
}
