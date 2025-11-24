// src/main/java/aptech/tripmate/services/safety/GeoService.java
package aptech.tripmate.services.safety;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Locale;
import java.util.Map;

@Service
public class GeoService {

    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

    public String getCountryCode(double lat, double lon) {
        String url = UriComponentsBuilder.fromHttpUrl(NOMINATIM_URL)
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("format", "json")
                .build().toUriString();

        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null || !response.containsKey("address")) {
            throw new RuntimeException("Could not resolve country from coordinates");
        }

        Map<String, Object> address = (Map<String, Object>) response.get("address");
        String code = (String) address.get("country_code");
        if (code == null) {
            throw new RuntimeException("No country code in response");
        }

        return code.toUpperCase(Locale.ROOT);
    }
}
