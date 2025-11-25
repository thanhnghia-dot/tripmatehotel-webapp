// src/main/java/aptech/tripmate/DTO/safety/WeatherDTO.java
package aptech.tripmate.DTO.safety;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WeatherDTO {
    private double temp;
    private int humidity;
    private String condition;
    private String description;
}
