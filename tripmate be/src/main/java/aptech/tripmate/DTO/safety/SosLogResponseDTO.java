// src/main/java/aptech/tripmate/DTO/safety/SosLogResponseDTO.java
package aptech.tripmate.DTO.safety;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SosLogResponseDTO {
    private String senderName;   // tên người gửi
    private String tripName;     // tên chuyến đi
    private String message;      // nội dung SOS
    private String locationUrl;  // link Google Maps
    private String sentAt;       // thời gian gửi
}
