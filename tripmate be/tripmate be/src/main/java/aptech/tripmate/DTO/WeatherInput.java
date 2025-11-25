package aptech.tripmate.DTO;

import lombok.Data;

@Data
public class WeatherInput {
    private String condition;
    private double temp;
    private double rainChance;
}
