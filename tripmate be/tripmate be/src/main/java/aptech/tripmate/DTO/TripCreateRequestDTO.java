package aptech.tripmate.DTO;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class TripCreateRequestDTO {
    private String name;
    private String destination;
    private String departurePoint; // ✅ phải có dòng này
    private String status;
    private String type;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isPublic;
    private Double totalAmount;
}
