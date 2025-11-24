package aptech.tripmate.services;

import aptech.tripmate.models.HistoricalVisitorData;
import aptech.tripmate.repositories.HistoricalVisitorDataRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class HistoricalVisitorDataService {

    private final HistoricalVisitorDataRepository repository;

    public HistoricalVisitorDataService(HistoricalVisitorDataRepository repository) {
        this.repository = repository;
    }

    public HistoricalVisitorData saveData(HistoricalVisitorData data) {
        return repository.save(data);
    }

    public List<HistoricalVisitorData> getDataByLocation(String locationName) {
        return repository.findByLocationName(locationName);
    }

    public List<HistoricalVisitorData> getDataByLocationAndDateRange(
            String locationName, LocalDate start, LocalDate end) {
        return repository.findByLocationNameAndDateBetween(locationName, start, end);
    }
}
