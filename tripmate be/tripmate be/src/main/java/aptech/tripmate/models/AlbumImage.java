package aptech.tripmate.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "albumiamges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AlbumImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String url;

    @Column(name = "created_at")
    private LocalDateTime createdAt;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "albumPhotos", "tripRooms", "budgetItems", "checklistItems", "payments", "tripMembers", "hotel"})
    private Trip trip;


}
