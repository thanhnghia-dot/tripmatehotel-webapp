package aptech.tripmate.repositories;

import aptech.tripmate.models.HistoricalVisitorData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface HistoricalVisitorDataRepository extends JpaRepository<HistoricalVisitorData, Long> {

    List<HistoricalVisitorData> findByLocationName(String locationName);

    List<HistoricalVisitorData> findTop30ByLocationNameOrderByDateDesc(String locationName);

    List<HistoricalVisitorData> findByLocationNameAndDateBetween(
            String locationName, LocalDate startDate, LocalDate endDate
    );

    List<HistoricalVisitorData> findTop7ByLocationNameOrderByDateDesc(String locationName);
}
