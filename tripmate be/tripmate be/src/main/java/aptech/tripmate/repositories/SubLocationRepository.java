package aptech.tripmate.repositories;

import aptech.tripmate.models.SubLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubLocationRepository extends JpaRepository<SubLocation, Long> {

    long countByLocationName(String locationName);

    List<SubLocation> findByLocationName(String locationName);
}
