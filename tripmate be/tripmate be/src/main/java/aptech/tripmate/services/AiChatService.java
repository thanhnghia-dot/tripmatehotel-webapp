package aptech.tripmate.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AiChatService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    private final String API_URL = "https://openrouter.ai/api/v1/chat/completions";
    private final RestTemplate restTemplate = new RestTemplate();

    // Cache lưu suggestion theo userMessage
    private final Map<String, CachedResult> cache = new ConcurrentHashMap<>();
    private final long CACHE_TTL = 60_000; // cache 60 giây

    public String getSuggestion(String userMessage) {
        try {
            long now = System.currentTimeMillis();

            // 1️⃣ Kiểm tra cache
            if (cache.containsKey(userMessage)) {
                CachedResult cached = cache.get(userMessage);
                if (now - cached.timestamp < CACHE_TTL) {
                    return cached.result; // trả về cache luôn
                }
            }

            // 2️⃣ Chuẩn bị request body
            Map<String, Object> body = new HashMap<>();
            body.put("model", "deepseek/deepseek-r1:free"); // free model
            body.put("messages", List.of(
                    Map.of("role", "system", "content",
                            "You are close friends in a conversation, suggest 3 short, natural, human-like responses (use emojis, everyday words). " +
                                    "No need to number 1. 2. 3., just return each response, one on each line."),
                    Map.of("role", "user", "content", userMessage)
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            // 3️⃣ Gọi API
            ResponseEntity<Map> response = restTemplate.exchange(
                    API_URL, HttpMethod.POST, request, Map.class
            );

            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null) return "No response";

            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            if (choices == null || choices.isEmpty()) return "No suggestion";

            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            String result = (String) message.get("content");

            // 4️⃣ Lưu vào cache
            cache.put(userMessage, new CachedResult(result, now));

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    // class nhỏ để lưu cache
    private static class CachedResult {
        String result;
        long timestamp;

        CachedResult(String result, long timestamp) {
            this.result = result;
            this.timestamp = timestamp;
        }
    }
}
