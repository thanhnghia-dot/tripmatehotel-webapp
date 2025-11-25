package aptech.tripmate.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Entity
@Data
@Table(name = "amenity")
@NoArgsConstructor
@AllArgsConstructor
public class Amenity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // Optional: nếu bạn muốn biết Amenity này thuộc những Hotel nào
    @ManyToMany(mappedBy = "amenities", fetch = FetchType.EAGER)
    @JsonIgnore // để tránh loop khi serialize
    private List<Hotel> hotels;

    public Amenity(Long id, String name) {
        this.id = id;
        this.name = name;
    }
}
