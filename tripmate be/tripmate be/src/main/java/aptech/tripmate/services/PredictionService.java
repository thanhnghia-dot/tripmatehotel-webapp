package aptech.tripmate.services;

import aptech.tripmate.models.HistoricalVisitorData;
import aptech.tripmate.models.Prediction;
import aptech.tripmate.models.SearchTrendData;
import aptech.tripmate.models.WeatherData;
import aptech.tripmate.repositories.HistoricalVisitorDataRepository;
import aptech.tripmate.repositories.PredictionRepository;
import aptech.tripmate.repositories.SearchTrendDataRepository;
import aptech.tripmate.repositories.WeatherDataRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class PredictionService {

    private final HistoricalVisitorDataRepository historicalRepo;
    private final WeatherDataRepository weatherRepo;
    private final SearchTrendDataRepository searchRepo;
    private final PredictionRepository predictionRepo;
    private final WeatherService weatherService;
    private final TrendService trendService;

    public PredictionService(HistoricalVisitorDataRepository historicalRepo,
                             WeatherDataRepository weatherRepo,
                             SearchTrendDataRepository searchRepo,
                             PredictionRepository predictionRepo,
                             WeatherService weatherService,
                             TrendService trendService) {
        this.historicalRepo = historicalRepo;
        this.weatherRepo = weatherRepo;
        this.searchRepo = searchRepo;
        this.predictionRepo = predictionRepo;
        this.weatherService = weatherService;
        this.trendService = trendService;
    }

    public Prediction predict(String location, LocalDate targetDate) {
        // Nếu đã có prediction trong DB thì trả luôn
        return predictionRepo.findByLocationAndPredictionDate(location, targetDate)
                .orElseGet(() -> generatePrediction(location, targetDate));
    }

    public List<Prediction> getPredictions(String location, LocalDate startDate, LocalDate endDate) {
        List<Prediction> predictions = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            predictions.add(predict(location, date));
        }
        return predictions;
    }

    private Prediction generatePrediction(String location, LocalDate targetDate) {
        // Lấy dữ liệu lịch sử max 30 ngày
        List<HistoricalVisitorData> history = historicalRepo.findTop30ByLocationNameOrderByDateDesc(location);
        double avgVisitors = history.stream()
                .mapToDouble(HistoricalVisitorData::getVisitorCount)
                .average().orElse(1000); // default 1000 nếu ko có dữ liệu

        // Lấy weather
        WeatherData weather = weatherRepo.findByLocationNameAndDate(location, targetDate)
                .orElseGet(() -> {
                    WeatherData wd = weatherService.fetchWeather(location, targetDate);
                    weatherRepo.save(wd);
                    return wd;
                });

        // Lấy trend
        SearchTrendData trend = searchRepo.findByLocationNameAndDate(location, targetDate)
                .orElseGet(() -> {
                    SearchTrendData t = trendService.fetchTrend(location, targetDate);
                    searchRepo.save(t);
                    return t;
                });

        // Tính predictedVisitors dựa trên avg * weatherFactor * trendFactor
        double weatherFactor = calculateWeatherFactor(weather);
        double trendFactor = 1.0 + (trend.getTrendScore() / 100.0);
        int predictedVisitors = (int) Math.round(avgVisitors * weatherFactor * trendFactor);

        // Xác định crowdLevel
        String crowdLevel = classifyCrowdLevel(predictedVisitors, avgVisitors);

        // Gợi ý
        String suggestion = generateSuggestion(location, targetDate, weather, trend, predictedVisitors, crowdLevel);

        // Tạo prediction object
        Prediction prediction = Prediction.builder()
                .location(location)
                .predictionDate(targetDate)
                .predictedVisitors(predictedVisitors)
                .crowdLevel(crowdLevel)
                .weatherDescription(weather.getWeatherDescription())
                .temperature(weather.getTemperature())
                .trendScore(trend.getTrendScore())
                .reason("Dựa trên lịch sử, thời tiết và xu hướng tìm kiếm")
                .suggestion(suggestion)
                .createdAt(LocalDate.now())
                .build();

        predictionRepo.save(prediction);
        log.info("✅ Prediction saved: {}", prediction);
        return prediction;
    }

    private double calculateWeatherFactor(WeatherData weather) {
        if (weather.getWeatherDescription() == null) return 1.0;
        String desc = weather.getWeatherDescription().toLowerCase();
        if (desc.contains("rain") || desc.contains("mưa")) return 0.8;
        if (desc.contains("storm") || desc.contains("bão")) return 0.6;
        return 1.0;
    }

    private String classifyCrowdLevel(int predictedVisitors, double avg) {
        if (predictedVisitors < avg * 0.7) return "Thấp";
        if (predictedVisitors > avg * 1.2) return "Cao";
        return "Trung bình";
    }

    private String generateSuggestion(String location, LocalDate date, WeatherData weather,
                                      SearchTrendData trend, int predictedVisitors, String crowdLevel) {
        return String.format("Ngày %s tại %s dự kiến %d khách, mức độ đông %s. Thời tiết %s, hãy lên kế hoạch phù hợp.",
                date, location, predictedVisitors, crowdLevel, weather.getWeatherDescription());
    }
}
