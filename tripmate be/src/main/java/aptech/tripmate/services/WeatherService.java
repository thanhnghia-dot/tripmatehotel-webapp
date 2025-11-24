package aptech.tripmate.services;

import aptech.tripmate.models.WeatherData;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDate;

@Service
public class WeatherService {

    @Value("${weather.api.key:}")
    private String apiKey;

    public WeatherData fetchWeather(String location, LocalDate date) {
        if (apiKey == null || apiKey.isBlank()) {
            return fallbackWeather(location, date, "No API key configured");
        }

        try {
            String q = java.net.URLEncoder.encode(location, java.nio.charset.StandardCharsets.UTF_8);
            String urlStr = String.format(
                    "https://api.openweathermap.org/data/2.5/weather?q=%s&units=metric&appid=%s",
                    q, apiKey
            );
            HttpURLConnection con = (HttpURLConnection) new URL(urlStr).openConnection();
            con.setRequestMethod("GET");

            if (con.getResponseCode() != 200) {
                throw new RuntimeException("Weather API returned code " + con.getResponseCode());
            }

            try (BufferedReader br = new BufferedReader(new InputStreamReader(con.getInputStream()))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) sb.append(line);

                JSONObject json = new JSONObject(sb.toString());
                double temp = json.getJSONObject("main").getDouble("temp");
                String cond = json.getJSONArray("weather").getJSONObject(0).getString("description");
                double rain = json.has("rain") ? json.getJSONObject("rain").optDouble("1h", 0.0) : 0.0;

                WeatherData wd = new WeatherData();
                wd.setLocationName(location);
                wd.setDate(date);
                wd.setTemperature(temp);
                wd.setRainfall(rain);
                wd.setWeatherCondition(cond);
                wd.setWeatherDescription(cond);
                return wd;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return fallbackWeather(location, date, "Error: " + e.getMessage());
        }
    }

    private WeatherData fallbackWeather(String location, LocalDate date, String reason) {
        System.err.println("[WeatherService] Fallback weather for " + location + ": " + reason);
        WeatherData wd = new WeatherData();
        wd.setLocationName(location);
        wd.setDate(date);
        wd.setTemperature(25 + Math.random() * 10); // 25–35°C
        wd.setRainfall(0.0);
        wd.setWeatherCondition("Clear");
        wd.setWeatherDescription("demo fallback");
        return wd;
    }
}
