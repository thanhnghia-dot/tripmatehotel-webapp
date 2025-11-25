package aptech.tripmate.services;

import aptech.tripmate.untils.GoogleAuthHelper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.io.IOException;
import java.time.LocalDate;

@Service
public class GeminiService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class Prediction {
        private int visitorCount;
        private double averagePrice;
        private int trendScore;

        public Prediction(int visitorCount, double averagePrice, int trendScore) {
            this.visitorCount = visitorCount;
            this.averagePrice = averagePrice;
            this.trendScore = trendScore;
        }

        public int getVisitorCount() { return visitorCount; }
        public double getAveragePrice() { return averagePrice; }
        public int getTrendScore() { return trendScore; }
    }

    public Prediction predict(String location, LocalDate date, String season, String weather) throws IOException {
        String prompt = String.format(
                "Dự đoán lượng khách du lịch, giá trung bình và điểm xu hướng cho địa điểm %s vào ngày %s. " +
                        "Mùa: %s, Thời tiết: %s. " +
                        "Trả về JSON với các trường: visitorCount, averagePrice, trendScore.",
                location, date, season, weather
        );

        String accessToken = GoogleAuthHelper.getAccessToken();
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        String body = String.format("""
                {
                  "contents": [{"parts": [{"text": "%s"}]}]
                }
                """, prompt.replace("\"", "\\\""));

        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode textNode = root.at("/candidates/0/content/0/parts/0/text");
            if (!textNode.isMissingNode()) {
                JsonNode dataNode = objectMapper.readTree(textNode.asText());
                int visitorCount = dataNode.path("visitorCount").asInt();
                double averagePrice = dataNode.path("averagePrice").asDouble();
                int trendScore = dataNode.path("trendScore").asInt();
                return new Prediction(visitorCount, averagePrice, trendScore);
            }
        }
        return null;
    }
}
