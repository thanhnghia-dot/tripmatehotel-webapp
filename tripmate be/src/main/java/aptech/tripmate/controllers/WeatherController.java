package aptech.tripmate.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    @Value("${weather.api.key}")
    private String apiKey;

    @GetMapping("/forecast")
    public ResponseEntity<?> getForecast(@RequestParam String city, @RequestParam String date) {
        String url = "http://api.weatherapi.com/v1/forecast.json?key=" + apiKey
                + "&q=" + URLEncoder.encode(city, StandardCharsets.UTF_8)
                + "&dt=" + date;

        RestTemplate restTemplate = new RestTemplate();
        try {
            String result = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi gọi API thời tiết.");
        }
    }
}
