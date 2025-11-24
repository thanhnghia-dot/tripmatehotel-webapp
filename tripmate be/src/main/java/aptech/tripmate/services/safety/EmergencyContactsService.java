// src/main/java/aptech/tripmate/services/safety/EmergencyContactsService.java
package aptech.tripmate.services.safety;

import aptech.tripmate.DTO.safety.EmergencyContactsDTO;
import aptech.tripmate.models.safety.EmergencyContacts;
import aptech.tripmate.repositories.safety.EmergencyContactsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmergencyContactsService {
    private final EmergencyContactsRepository repo;

    public List<EmergencyContactsDTO> getContactsByCountry(String country) {
        EmergencyContacts ec = repo.findByCountry(country)
                .orElseThrow(() -> new RuntimeException("No contacts found for country: " + country));

        return Arrays.asList(
                new EmergencyContactsDTO("POLICE", ec.getPolice()),
                new EmergencyContactsDTO("FIRE", ec.getFire()),
                new EmergencyContactsDTO("MEDICAL", ec.getMedical())
        );
    }
}
