package aptech.tripmate.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "feel")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String caption;
    private String videoUrl;
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;


    @OneToMany(mappedBy = "feel", cascade = CascadeType.ALL)
    private List<FeelComment> comments;

    @OneToMany(mappedBy = "feel", cascade = CascadeType.ALL)
    private List<FeelLike> likes;
}

