package aptech.tripmate.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TripRequestDTO {
    private String name;
    private String departurePoint;
    private String destination;
    private String status;

    private LocalDateTime startDate;

    private LocalDateTime endDate;
    private Boolean isPublic;
    private String type;
    private Double totalAmount;
}
