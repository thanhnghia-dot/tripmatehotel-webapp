package aptech.tripmate.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class CurrencyService {
    private final RestTemplate restTemplate = new RestTemplate();

    public double convertFromUSD(double amount, String toCurrency) {
        String url = "https://api.exchangerate-api.com/v4/latest/USD";
        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        Map<String, Object> body = response.getBody();
        if (body == null || !body.containsKey("rates")) {
            throw new RuntimeException("\n" +
                    "Could not get rate");
        }

        Map<String, Double> rates = (Map<String, Double>) body.get("rates");
        Double rate = rates.get(toCurrency.toUpperCase());
        if (rate == null) {
            throw new RuntimeException("\n" +
                    "No currency support: " + toCurrency);
        }

        return amount * rate;
    }
}
