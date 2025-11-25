package aptech.tripmate.DTO;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class MultipleRoomDepositRequest {
    private List<Long> tripRoomIds;
    private BigDecimal totalPrice;
    private String currency;
    private String description;
    private List<String> paypalCaptureIds;
    // getters + setters
}
