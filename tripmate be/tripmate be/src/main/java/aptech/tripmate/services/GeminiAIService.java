package aptech.tripmate.services;

import aptech.tripmate.models.BudgetItem;
import aptech.tripmate.models.Hotel;
import aptech.tripmate.models.Room;
import aptech.tripmate.models.Trip;
import aptech.tripmate.repositories.BudgetItemRepository;
import aptech.tripmate.repositories.TripRepository;
import aptech.tripmate.untils.GoogleAuthHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class GeminiAIService {
    @Autowired
    private BudgetItemRepository budgetItemRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private TripRepository tripRepository;

    public String suggestFromTripData(Long tripId) throws IOException {
        // Lấy trip
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        // Tính số ngày (inclusive)
        LocalDate startDate = trip.getStartDate().toLocalDate();
        LocalDate endDate = trip.getEndDate().toLocalDate();
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        if (days < 1) days = 1;

        // Lấy totalBudget & maxPerDay
        double totalBudget = trip.getTotalAmount() != null ? trip.getTotalAmount() : 0.0;
        double maxPerDay = totalBudget > 0 ? totalBudget / days : 0.0;

        // Lấy budget items hiện có trong DB
        List<BudgetItem> items = budgetItemRepository.findByTrip_TripId(tripId);

        // Map type đã tồn tại (ví dụ: "Day 1", "Day 2")
        Set<String> existingTypes = new HashSet<>();
        for (BudgetItem item : items) {
            if (item.getType() != null && item.getType().startsWith("Day")) {
                existingTypes.add(item.getType().trim());
            }
        }

        // Chuẩn bị dữ liệu input cho AI
        StringBuilder inputData = new StringBuilder("Here is the budget status per day:\n");

        for (int day = 1; day <= days; day++) {
            String type = "Day " + day;

            if (existingTypes.contains(type)) {
                // Nếu ngày đã tồn tại trong DB
                inputData.append(type).append(": Đã tồn tại trong DB, không gợi ý lại.\n\n");
            } else {
                // Nếu chưa có → tạo dữ liệu trống để AI gợi ý
                inputData.append(String.format("""
%s:
Estimated: $0.00

🍽️ Food & Dining: $0.00 - Note: 
🚗 Transport: $0.00 - Note: 
🏨 Hotel: $0.00 - Note: 
🗺️ Sightseeing: $0.00 - Note: 
🎭 Entertainment: $0.00 - Note: 
🛍️ Shopping: $0.00 - Note: 
📦 Other: $0.00 - Note: 

""", type));
            }
        }

        // Prompt AI — chỉ gợi ý cho ngày trống
        String prompt = inputData + String.format("""
👉 Please analyze only the days that are empty (with $0.00) and suggest budgets for them.
Do NOT suggest again for the days marked as 'Already exists in DB'.

Rules:
1. Use the same categories (Food & Dining, Transport, Hotel, Sightseeing, Entertainment, Shopping, Other, Total).
2. Each day's "Total" should be around $%.2f (but may vary slightly).
3. The sum of all "Total" must not exceed $%.2f.
4. Add a short friendly advice for each category.

⚠️ Output STRICTLY in this format (no extra symbols, no dashes, no extra text outside this format):

Day X:
Food & Dining: $<amount>
→ Advice: <text>
Transport: $<amount>
→ Advice: <text>
Hotel: $<amount>
→ Advice: <text>
Sightseeing: $<amount>
→ Advice: <text>
Entertainment: $<amount>
→ Advice: <text>
Shopping: $<amount>
→ Advice: <text>
Other: $<amount>
→ Advice: <text>
Total: $<amount>

""", maxPerDay, totalBudget);

        return callGeminiAPI(prompt);
    }

    private String callGeminiAPI(String prompt) throws IOException {
        String accessToken = GoogleAuthHelper.getAccessToken();
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        String body = String.format("""
        {
          "contents": [
            {
              "parts": [
                {
                  "text": "%s"
                }
              ]
            }
          ]
        }
        """, prompt.replace("\"", "\\\""));

        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        return response.getBody();
    }


    public String suggestHotelsFromTrip(Long tripId) throws IOException {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        double totalBudget = trip.getTotalAmount() != null ? trip.getTotalAmount() : 0.0;

        Hotel hotel = trip.getHotel();
        if (hotel == null) {
            return "[]"; // hoặc báo lỗi
        }

        List<Room> suitableRooms = hotel.getRooms().stream()
                .filter(r -> r.getFinalPrice() != null && r.getFinalPrice() <= totalBudget)
                .toList();

        List<Map<String, Object>> suggestions = new ArrayList<>();
        for (Room room : suitableRooms) {
            Map<String, Object> map = new HashMap<>();
            map.put("hotelName", hotel.getName());
            map.put("roomName", room.getRoomName());
            map.put("pricePerNight", room.getFinalPrice());
            map.put("imageUrl", room.getImageUrl());
            suggestions.add(map);
        }

        ObjectMapper mapper = new ObjectMapper();
        return mapper.writeValueAsString(suggestions);
    }
}
