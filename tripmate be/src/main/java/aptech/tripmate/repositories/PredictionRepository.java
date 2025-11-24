package aptech.tripmate.repositories;


import aptech.tripmate.models.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    List<Prediction> findByLocationAndPredictionDateBetween(String location, LocalDate start, LocalDate end);

    Optional<Prediction> findByLocationAndPredictionDate(String location, LocalDate predictionDate);
}
