package aptech.tripmate.DTO;

import lombok.Data;

import java.util.List;
@Data
public class AiRecommendRequestDTO {
    private Long tripId;
    private List<Long> availableRooms;
}
