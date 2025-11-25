package aptech.tripmate.services;

import aptech.tripmate.models.SearchTrendData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDate;
import java.util.Random;
import java.util.Scanner;

@Service
public class TrendService {

    @Value("${trend.api.url:}")
    private String apiUrl;

    @Value("${trend.api.key:}")
    private String apiKey;

    private final Random random = new Random();

    public SearchTrendData fetchTrend(String location, LocalDate date) {
        if (apiUrl == null || apiUrl.isBlank() || apiKey == null || apiKey.isBlank()) {
            return fallbackTrend(location, date, "No API key or API URL configured");
        }

        try {
            String q = java.net.URLEncoder.encode(location, java.nio.charset.StandardCharsets.UTF_8);
            String urlStr = String.format("%s?query=%s&date=%s&key=%s", apiUrl, q, date, apiKey);

            HttpURLConnection con = (HttpURLConnection) new URL(urlStr).openConnection();
            con.setRequestMethod("GET");

            if (con.getResponseCode() != 200) {
                throw new RuntimeException("Trend API returned code " + con.getResponseCode());
            }

            try (Scanner sc = new Scanner(con.getInputStream())) {
                StringBuilder sb = new StringBuilder();
                while (sc.hasNext()) sb.append(sc.nextLine());

                // Giả sử API trả về JSON: {"trendScore":85,"source":"google-trends"}
                org.json.JSONObject json = new org.json.JSONObject(sb.toString());

                SearchTrendData s = new SearchTrendData();
                s.setLocationName(location);
                s.setDate(date);
                s.setTrendScore(json.getInt("trendScore"));
                s.setSource(json.getString("source"));
                return s;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return fallbackTrend(location, date, "Error: " + e.getMessage());
        }
    }

    private SearchTrendData fallbackTrend(String location, LocalDate date, String reason) {
        System.err.println("[TrendService] Fallback trend for " + location + ": " + reason);
        SearchTrendData s = new SearchTrendData();
        s.setLocationName(location);
        s.setDate(date);
        s.setTrendScore(40 + random.nextInt(61)); // 40–100
        s.setSource("fallback-generated");
        return s;
    }
}
