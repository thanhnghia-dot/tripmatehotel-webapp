package aptech.tripmate.services;

import aptech.tripmate.configs.PayPalConfig;
import com.paypal.payments.RefundRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PayPalService {

    private final PayPalConfig payPalConfig;
    private final RestTemplate restTemplate = new RestTemplate();

    // Lấy access token từ PayPal
    public String getAccessToken() {
        System.out.println("DEBUG: PayPal Base URL = " + payPalConfig.getBaseUrl());
        System.out.println("DEBUG: PayPal Client ID = " + payPalConfig.getClientId());
        System.out.println("DEBUG: PayPal Client Secret = " + payPalConfig.getClientSecret());

        String auth = payPalConfig.getClientId() + ":" + payPalConfig.getClientSecret();
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<String> entity = new HttpEntity<>("grant_type=client_credentials", headers);

        String url = payPalConfig.getBaseUrl() + "/v1/oauth2/token";
        System.out.println("DEBUG: getAccessToken URL = " + url);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                Map.class
        );

        System.out.println("DEBUG: Access token response = " + response.getBody());

        return (String) response.getBody().get("access_token");
    }

    public String refundCapture(String captureId, String accessToken, String amount, String currency) {
        String url = payPalConfig.getBaseUrl() + "/v2/payments/captures/" + captureId + "/refund";
        System.out.println("DEBUG: Refund URL = " + url);
        System.out.println("DEBUG: Refund access token = " + accessToken);
        System.out.println("DEBUG: Refund amount = " + amount + " " + currency);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "amount", Map.of(
                        "value", amount,
                        "currency_code", currency
                )
        );

        System.out.println("DEBUG: Refund request body = " + body);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                Map.class
        );

        System.out.println("DEBUG: Refund response = " + response.getBody());

        if (response.getStatusCode() != HttpStatus.CREATED && response.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("PayPal refund failed: " + response.getBody());
        }

        return response.getBody() != null ? response.getBody().toString() : null;
    }
    public String refund(String captureId, BigDecimal amount) {
        try {
            // Tạo refund request
            RefundRequest refundRequest = new RefundRequest();



            // Gọi PayPal API để refund (tuỳ SDK bạn dùng)
            // Ví dụ giả lập:
            String refundId = "REFUND_" + captureId; // giả lập refundId
            return refundId;

        } catch (Exception e) {
            throw new RuntimeException("PayPal refund failed: " + e.getMessage());
        }
    }
    public String captureOrder(String orderId) {
        String url = "https://api-m.sandbox.paypal.com/v2/checkout/orders/" + orderId + "/capture";
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(getAccessToken());
        headers.set("Content-Type", "application/json");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

        // Lấy captureId từ response
        if (response != null && response.containsKey("purchase_units")) {
            List<Map<String, Object>> units = (List<Map<String, Object>>) response.get("purchase_units");
            if (!units.isEmpty()) {
                Map<String, Object> payments = (Map<String, Object>) units.get(0).get("payments");
                if (payments != null && payments.containsKey("captures")) {
                    List<Map<String, Object>> captures = (List<Map<String, Object>>) payments.get("captures");
                    if (!captures.isEmpty()) {
                        return (String) captures.get(0).get("id");
                    }
                }
            }
        }

        return null;
    }

}
