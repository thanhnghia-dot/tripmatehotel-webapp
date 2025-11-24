package aptech.tripmate.DTO;

import lombok.Data;

@Data
public class CreatePaymentRequest {
    private Long tripId;
    private Long userId;

    private Double amount;
    private String currency;
    private String description;
}
