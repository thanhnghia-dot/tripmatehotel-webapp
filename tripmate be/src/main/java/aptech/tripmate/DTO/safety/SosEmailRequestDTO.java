// src/main/java/aptech/tripmate/DTO/safety/SosEmailRequestDTO.java
package aptech.tripmate.DTO.safety;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SosEmailRequestDTO {
    @NotNull
    private Long userId;     // ai gửi SOS
    @NotNull
    private Long tripId;     // gửi trong trip nào
    @NotNull
    private Double latitude; // vị trí
    @NotNull
    private Double longitude;
    private String message;  // tin nhắn cầu cứu (mặc định nếu để trống)
}
