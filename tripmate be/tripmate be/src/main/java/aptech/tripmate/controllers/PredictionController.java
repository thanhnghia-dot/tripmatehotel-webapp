package aptech.tripmate.controllers;

import aptech.tripmate.models.Prediction;
import aptech.tripmate.repositories.SearchTrendDataRepository;
import aptech.tripmate.repositories.WeatherDataRepository;
import aptech.tripmate.services.PredictionAIService;
import aptech.tripmate.services.PredictionService;
import aptech.tripmate.services.TrendService;
import aptech.tripmate.services.WeatherService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/predictions")
@CrossOrigin(origins = "http://localhost:3000")
public class PredictionController {

    private final PredictionService predictionService;
    private final PredictionAIService predictionAIService;
    private final WeatherService weatherService;
    private final TrendService trendService;
    private final WeatherDataRepository weatherRepo;
    private final SearchTrendDataRepository trendRepo;

    public PredictionController(PredictionService predictionService,
                                PredictionAIService predictionAIService,
                                WeatherService weatherService,
                                TrendService trendService,
                                WeatherDataRepository weatherRepo,
                                SearchTrendDataRepository trendRepo) {
        this.predictionService = predictionService;
        this.predictionAIService = predictionAIService;
        this.weatherService = weatherService;
        this.trendService = trendService;
        this.weatherRepo = weatherRepo;
        this.trendRepo = trendRepo;
    }

    // --- Đảm bảo dữ liệu thời tiết và trend có sẵn trong DB ---
    private void ensureWeatherAndTrend(String location, LocalDate date) {
        weatherRepo.findByLocationNameAndDate(location, date)
                .orElseGet(() -> weatherRepo.save(weatherService.fetchWeather(location, date)));

        trendRepo.findByLocationNameAndDate(location, date)
                .orElseGet(() -> trendRepo.save(trendService.fetchTrend(location, date)));
    }

    // --- Dự báo cho 1 khoảng ngày + gợi ý ---
    @GetMapping("/forecast")
    public Map<String, Object> getForecastAndSuggestions(
            @RequestParam String location,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        // Đảm bảo dữ liệu weather/trend
        LocalDate dateCursor = start;
        while (!dateCursor.isAfter(end)) {
            ensureWeatherAndTrend(location, dateCursor);
            dateCursor = dateCursor.plusDays(1);
        }

        List<Prediction> predictions = predictionService.getPredictions(location, start, end);

        List<Prediction> suggestions = predictions.stream()
                .sorted(Comparator.comparingInt(Prediction::getPredictedVisitors))
                .limit(3)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("forecast", predictions);
        response.put("suggestions", suggestions);

        return response;
    }

    // --- Dự đoán đơn ngày (chỉ AI) ---
    @GetMapping("/predict")
    public Prediction predictOnly(@RequestParam String location, @RequestParam String date) {
        LocalDate targetDate = LocalDate.parse(date);

        ensureWeatherAndTrend(location, targetDate);

        return predictionAIService.predict(location, targetDate);
    }

    // --- Lưu dự đoán vào DB ---
    @PostMapping("/predict")
    public Prediction predictAndSave(@RequestParam String location, @RequestParam String date) {
        LocalDate targetDate = LocalDate.parse(date);
        return predictionService.predict(location, targetDate);
    }

    // --- Lấy danh sách dự đoán theo khoảng ngày ---
    @GetMapping
    public List<Prediction> getPredictions(@RequestParam String location,
                                           @RequestParam String startDate,
                                           @RequestParam String endDate) {
        return predictionService.getPredictions(location, LocalDate.parse(startDate), LocalDate.parse(endDate));
    }

    // --- Dự đoán hiện tại (theo AI) ---
    @GetMapping("/predict-now")
    public Prediction predictNow(@RequestParam String location, @RequestParam String targetDate) {
        LocalDate date = LocalDate.parse(targetDate);
        return predictionService.predict(location, date);
    }

    // --- Lấy các ngày có ít khách / giá thấp ---
    @GetMapping("/suggestions")
    public Map<String, Object> getSuggestions(@RequestParam String location,
                                              @RequestParam String startDate,
                                              @RequestParam String endDate) {

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        LocalDate dateCursor = start;
        while (!dateCursor.isAfter(end)) {
            ensureWeatherAndTrend(location, dateCursor);
            dateCursor = dateCursor.plusDays(1);
        }

        List<Prediction> predictions = predictionService.getPredictions(location, start, end);

        List<String> lowCrowdDays = predictions.stream()
                .sorted(Comparator.comparingInt(Prediction::getPredictedVisitors))
                .limit(3)
                .map(p -> p.getPredictionDate().toString())
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("lowCrowdDays", lowCrowdDays);
        return result;
    }


    // --- AI tạo ý kiến chi tiết ---
    @GetMapping("/ai-opinion")
    public Map<String, String> getAiOpinion(@RequestParam String location, @RequestParam String date) {
        LocalDate targetDate = LocalDate.parse(date);
        String opinion = predictionAIService.generateDetailedOpinion(location, targetDate);
        return Collections.singletonMap("aiOpinion", opinion);
    }
}
