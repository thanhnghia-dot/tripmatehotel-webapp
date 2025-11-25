package aptech.tripmate.services;

import aptech.tripmate.models.HistoricalVisitorData;
import aptech.tripmate.models.Prediction;
import aptech.tripmate.models.SearchTrendData;
import aptech.tripmate.models.WeatherData;
import aptech.tripmate.repositories.HistoricalVisitorDataRepository;
import aptech.tripmate.repositories.SearchTrendDataRepository;
import aptech.tripmate.repositories.WeatherDataRepository;
import aptech.tripmate.untils.GoogleAuthHelper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;

@Service
public class PredictionAIService {

    private final HistoricalVisitorDataRepository historicalRepo;
    private final WeatherDataRepository weatherRepo;
    private final SearchTrendDataRepository searchRepo;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    private static final String WEATHER_KEY = "54d9b22f244a4708d509f8c0ab5ce717"; // key mới

    public PredictionAIService(HistoricalVisitorDataRepository historicalRepo,
                               WeatherDataRepository weatherRepo,
                               SearchTrendDataRepository searchRepo) {
        this.historicalRepo = historicalRepo;
        this.weatherRepo = weatherRepo;
        this.searchRepo = searchRepo;
    }

    public Prediction predict(String location, LocalDate targetDate) {
        List<HistoricalVisitorData> history = historicalRepo.findTop7ByLocationNameOrderByDateDesc(location);

        WeatherData weather = weatherRepo.findByLocationNameAndDate(location, targetDate)
                .orElseGet(() -> {
                    WeatherData wd = fetchWeatherFromAPI(location, targetDate);
                    weatherRepo.save(wd);
                    return wd;
                });

        SearchTrendData trend = searchRepo.findByLocationNameAndDate(location, targetDate)
                .orElseGet(() -> {
                    SearchTrendData t = fetchTrendFake(location, targetDate);
                    searchRepo.save(t);
                    return t;
                });

        String prompt = buildGeminiPrompt(location, targetDate, history, weather, trend);
        String aiResponse = callGeminiAPI(prompt);

        return parseAIResponse(aiResponse, location, targetDate);
    }

    public String generateDetailedOpinion(String location, LocalDate date) {
        Prediction prediction = predict(location, date);

        StringBuilder opinion = new StringBuilder();
        opinion.append("Dự báo cho ").append(location).append(" ngày ").append(date).append(":\n");
        opinion.append("- Thời tiết: ").append(prediction.getWeatherDescription()).append("\n");
        opinion.append("- Mức độ đông: ").append(prediction.getCrowdLevel()).append("\n");
        opinion.append("- Gợi ý: ").append(prediction.getSuggestion()).append("\n");
        opinion.append("Chúc bạn có chuyến đi vui vẻ!");
        return opinion.toString();
    }

    private String buildGeminiPrompt(String location, LocalDate date,
                                     List<HistoricalVisitorData> history,
                                     WeatherData weather,
                                     SearchTrendData trend) {
        StringBuilder sb = new StringBuilder();
        sb.append("Bạn là chuyên gia dự báo lượng khách du lịch tại Việt Nam.\n");
        sb.append("Dự đoán số lượng khách đến ").append(location).append(" vào ngày ").append(date).append(".\n");

        if (!history.isEmpty()) {
            sb.append("Dữ liệu lịch sử 7 ngày gần nhất:\n");
            for (HistoricalVisitorData h : history) {
                sb.append(h.getDate()).append(": ").append(h.getVisitorCount()).append(" khách\n");
            }
        }

        sb.append("Thời tiết dự kiến: ").append(weather.getWeatherDescription())
                .append(", Nhiệt độ: ").append(weather.getTemperature()).append("°C\n");
        sb.append("Trend tìm kiếm: ").append(trend.getTrendScore()).append("/100\n");

        sb.append("Trả về JSON: {\"predictedVisitors\": <số khách>, \"weatherDescription\": \"<text>\", \"trendScore\": <score>, \"suggestion\": \"<text>\"}");
        return sb.toString();
    }

    private String callGeminiAPI(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(GoogleAuthHelper.getAccessToken());

            String body = String.format("""
                    {
                      "contents": [{"parts":[{"text": "%s"}]}]
                    }
                    """, prompt.replace("\"", "\\\""));

            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(GEMINI_URL, entity, String.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("[GeminiAPI] Lỗi khi gọi API: " + e.getMessage(), e);
        }
    }

    private Prediction parseAIResponse(String aiJson, String location, LocalDate date) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(aiJson);

            if (!root.has("predictedVisitors") || !root.has("weatherDescription") || !root.has("trendScore") || !root.has("suggestion")) {
                throw new RuntimeException("Gemini API trả về dữ liệu không đầy đủ: " + aiJson);
            }

            Prediction p = new Prediction();
            p.setLocation(location);
            p.setPredictionDate(date);
            p.setReason("Dựa trên dữ liệu lịch sử, thời tiết và xu hướng tìm kiếm.");

            p.setPredictedVisitors(root.get("predictedVisitors").asInt());
            p.setWeatherDescription(root.get("weatherDescription").asText());
            p.setTrendScore(root.get("trendScore").asInt());
            p.setSuggestion(root.get("suggestion").asText());

            int visitors = p.getPredictedVisitors();
            if (visitors < 500) p.setCrowdLevel("Thấp");
            else if (visitors > 1500) p.setCrowdLevel("Cao");
            else p.setCrowdLevel("Trung bình");

            return p;

        } catch (Exception e) {
            throw new RuntimeException("[ParseAIResponse] Lỗi parse JSON hoặc dữ liệu không hợp lệ: " + e.getMessage(), e);
        }
    }

    private SearchTrendData fetchTrendFake(String location, LocalDate date) {
        SearchTrendData t = new SearchTrendData();
        t.setLocationName(location);
        t.setDate(date);
        t.setTrendScore(50);
        return t;
    }

    private WeatherData fetchWeatherFromAPI(String location, LocalDate date) {
        try {
            // 1. Lấy lat/lon từ Geocoding API
            String geoUrl = String.format(
                    "http://api.openweathermap.org/geo/1.0/direct?q=%s&limit=1&appid=%s",
                    location, WEATHER_KEY);
            ResponseEntity<String> geoResp = restTemplate.getForEntity(geoUrl, String.class);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode geoNode = mapper.readTree(geoResp.getBody());

            if (geoNode.isEmpty()) {
                throw new RuntimeException("Không tìm thấy tọa độ cho location: " + location);
            }

            double lat = geoNode.get(0).get("lat").asDouble();
            double lon = geoNode.get(0).get("lon").asDouble();

            // 2. Lấy dự báo thời tiết 5 ngày/3h
            String weatherUrl = String.format(
                    "https://api.openweathermap.org/data/2.5/forecast?lat=%f&lon=%f&appid=%s&units=metric",
                    lat, lon, WEATHER_KEY);
            ResponseEntity<String> weatherResp = restTemplate.getForEntity(weatherUrl, String.class);
            JsonNode weatherNode = mapper.readTree(weatherResp.getBody());

            WeatherData w = new WeatherData();
            w.setLocationName(location);
            w.setDate(date);

            boolean found = false;
            for (JsonNode item : weatherNode.get("list")) {
                String dtTxt = item.get("dt_txt").asText().split(" ")[0];
                if (dtTxt.equals(date.toString())) {
                    double temp = item.get("main").get("temp").asDouble();
                    String desc = item.get("weather").get(0).get("description").asText();
                    w.setTemperature(temp);
                    w.setWeatherDescription(desc);
                    found = true;
                    break;
                }
            }

            if (!found) {
                throw new RuntimeException("Không tìm thấy dự báo thời tiết cho ngày: " + date);
            }

            return w;

        } catch (Exception e) {
            throw new RuntimeException("[fetchWeatherFromAPI] Lỗi khi lấy weather: " + e.getMessage(), e);
        }
    }
}
