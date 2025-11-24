package aptech.tripmate.repositories;


import aptech.tripmate.models.SearchTrendData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SearchTrendDataRepository extends JpaRepository<SearchTrendData, Long> {

    List<SearchTrendData> findByLocationName(String locationName);

    Optional<SearchTrendData> findByLocationNameAndDate(String location, LocalDate date);


    List<SearchTrendData> findByLocationNameAndDateBetween(
            String locationName, LocalDate startDate, LocalDate endDate
    );
}
