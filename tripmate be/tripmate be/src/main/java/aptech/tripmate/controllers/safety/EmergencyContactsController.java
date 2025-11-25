// src/main/java/aptech/tripmate/controllers/safety/EmergencyContactsController.java
package aptech.tripmate.controllers.safety;

import aptech.tripmate.DTO.safety.EmergencyContactsDTO;
import aptech.tripmate.services.safety.EmergencyContactsService;
import aptech.tripmate.services.safety.GeoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/safety/emergency")
@RequiredArgsConstructor
public class EmergencyContactsController {

    private final EmergencyContactsService service;
    private final GeoService geoService;

    @GetMapping
    public List<EmergencyContactsDTO> getByCountry(@RequestParam String country) {
        return service.getContactsByCountry(country.toUpperCase());
    }

    @GetMapping("/by-coords")
    public List<EmergencyContactsDTO> getByCoords(
            @RequestParam double lat,
            @RequestParam double lon
    ) {
        String country = geoService.getCountryCode(lat, lon);
        return service.getContactsByCountry(country);
    }
}
