package aptech.tripmate.configs;

import aptech.tripmate.models.HistoricalVisitorData;
import aptech.tripmate.models.SearchTrendData;
import aptech.tripmate.models.WeatherData;
import aptech.tripmate.repositories.HistoricalVisitorDataRepository;
import aptech.tripmate.repositories.SearchTrendDataRepository;
import aptech.tripmate.repositories.WeatherDataRepository;
import aptech.tripmate.services.GeminiService;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer {

    @Autowired
    private HistoricalVisitorDataRepository visitorRepo;
    @Autowired
    private WeatherDataRepository weatherRepo;
    @Autowired
    private SearchTrendDataRepository trendRepo;
    @Autowired
    private GeminiService geminiService;

    private static final String[] LOCATIONS = {
            "Hà Nội", "Đà Nẵng", "Sapa", "Cà Mau", "Phú Quốc"
    };

    @PostConstruct
    @Transactional
    public void init() {
        LocalDate today = LocalDate.now();

        for (String location : LOCATIONS) {
            if (visitorRepo.findByLocationName(location).isEmpty()) {

                for (int i = 7; i >= 1; i--) {
                    LocalDate date = today.minusDays(i);

                    // Lấy dữ liệu thời tiết
                    WeatherData weather = fetchWeather(location, date);
                    if (weatherRepo.findByLocationNameAndDate(location, date).isEmpty()) {
                        weatherRepo.save(weather);
                    }

                    // Dự đoán AI
                    String season = getSeason(date);
                    try {
                        GeminiService.Prediction prediction = geminiService.predict(location, date, season, weather.getWeatherDescription());

                        // Lưu HistoricalVisitorData
                        visitorRepo.save(HistoricalVisitorData.builder()
                                .locationName(location)
                                .date(date)
                                .visitorCount(prediction.getVisitorCount())
                                .averagePrice(prediction.getAveragePrice())
                                .season(season)
                                .note("Dự đoán bởi AI")
                                .build()
                        );

                        trendRepo.save(SearchTrendData.builder()
                                .locationName(location)
                                .date(date)
                                .trendScore(prediction.getTrendScore())
                                .source("GeminiAI")
                                .build()
                        );
                    } catch (Exception e) {
                        System.err.println("[GeminiAI] Không dự đoán được cho " + location + " ngày " + date);
                    }
                }
            }
        }
    }

    private WeatherData fetchWeather(String location, LocalDate date) {
        // TODO: Gọi OpenWeather API để lấy dữ liệu thực, hoặc fallback ra giá trị mặc định
        return WeatherData.builder()
                .locationName(location)
                .date(date)
                .temperature(25.0)
                .weatherDescription("Sunny")
                .build();
    }

    private String getSeason(LocalDate date) {
        int m = date.getMonthValue();
        if (m >= 3 && m <= 5) return "Spring";
        if (m >= 6 && m <= 8) return "Summer";
        if (m >= 9 && m <= 11) return "Autumn";
        return "Winter";
    }
}
