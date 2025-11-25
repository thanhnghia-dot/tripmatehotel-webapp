package aptech.tripmate.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TripDTO {
    private Long id;
    private String name;
    private String type;
    private String destination;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Double totalAmount;
    private Boolean isPublic;
    private List<TripMemberDTO> members;

    private HotelDTO hotel;
    private List<TripRoomDTO> rooms;
    private Boolean isFinished;
    private LocalDateTime finishedAd;
}
