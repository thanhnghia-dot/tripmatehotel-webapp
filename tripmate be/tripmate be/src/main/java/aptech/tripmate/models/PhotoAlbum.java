package aptech.tripmate.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name="photoalbum")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class PhotoAlbum {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long albumId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private String name;
    private String description;
    private boolean isPublic;

    private LocalDate createdAt;
    @OneToOne
    @JoinColumn(name = "trip_id", unique = true)
    private Trip trip;
}
