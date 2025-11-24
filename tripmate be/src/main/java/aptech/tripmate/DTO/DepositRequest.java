package aptech.tripmate.DTO;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DepositRequest {
    private Long tripRoomId;
    private BigDecimal price;
    private String currency; // "USD"
    private String paypalCaptureId;
    private String description;
}
