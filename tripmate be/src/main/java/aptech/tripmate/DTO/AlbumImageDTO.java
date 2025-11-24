package aptech.tripmate.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlbumImageDTO {
    private Long id;
    private String name;
    private String url;
    private LocalDateTime createdAt;
    private Long tripId;
    private String tripName;
    private String userEmail;
}

