package aptech.tripmate.DTO;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateRoomPaymentRequest {
    private Long roomId;
    private Double price;     // 50% deposit
    private String currency;
    private Long tripRoomId;
    private String description;
    private String email;
    private String name;
    private Long tripId;
    private String paypalCaptureId;
}
