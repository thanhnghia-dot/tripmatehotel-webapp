// src/main/java/aptech/tripmate/repositories/safety/EmergencyContactsRepository.java
package aptech.tripmate.repositories.safety;

import aptech.tripmate.models.safety.EmergencyContacts;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmergencyContactsRepository extends JpaRepository<EmergencyContacts, Long> {
    Optional<EmergencyContacts> findByCountry(String country);
}
