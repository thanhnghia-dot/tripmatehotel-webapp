package aptech.tripmate.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PublicTripDTO {
    private Long tripId;
    private String name;
    private String destination;
    private String departurePoint;
    private String status;
    private String type;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Double totalAmount;
    private String creatorName;

}
