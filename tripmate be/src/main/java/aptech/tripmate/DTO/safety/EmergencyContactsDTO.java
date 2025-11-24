// src/main/java/aptech/tripmate/DTO/safety/EmergencyContactsDTO.java
package aptech.tripmate.DTO.safety;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EmergencyContactsDTO {
    private String type;
    private String number;
}
