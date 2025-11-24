package aptech.tripmate.models;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "photo")
@NoArgsConstructor
@Data
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long photoId;

    private String url;

    @ManyToOne
    @JoinColumn(name = "album_id", nullable = false)
    private PhotoAlbum album;

    private String description;
}