package aptech.tripmate.DTO;

import aptech.tripmate.models.Amenity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AmenityDTO {
    private Long id;
    private String name;

    public AmenityDTO(Amenity amenity) {

        this.id = amenity.getId();
        this.name = amenity.getName();
    }
}
