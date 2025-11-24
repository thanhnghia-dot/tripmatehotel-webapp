package aptech.tripmate.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserStatsDTO {
    private long trips;
    private long feels;
    private long comments;
}