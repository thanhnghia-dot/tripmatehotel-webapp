// HotelCreateRequestDTO.java
package aptech.tripmate.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class HotelCreateRequestDTO {

    @NotBlank
    private String name;

    @NotBlank
    private String address;

    private Integer starRating;
    private List<String> imageUrls = new ArrayList<>();
    private String description;
    private List<Long> amenityIds = new ArrayList<>(); // khởi tạo mặc định

    private List<Long> roomTypeIds = new ArrayList<>();
    private String streetAddress;
}
