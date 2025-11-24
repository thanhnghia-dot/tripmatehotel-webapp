package aptech.tripmate.repositories;



import aptech.tripmate.models.WeatherData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WeatherDataRepository extends JpaRepository<WeatherData, Long> {

    // Lấy dữ liệu thời tiết theo địa điểm
    List<WeatherData> findByLocationName(String locationName);
    Optional<WeatherData> findByLocationNameAndDate(String locationName, LocalDate date);
    // Lấy dữ liệu thaời tiết trong khoảng thời gian
    List<WeatherData> findByLocationNameAndDateBetween(
            String locationName, LocalDate startDate, LocalDate endDate
    );
}
