package aptech.tripmate.controllers;

import aptech.tripmate.DTO.BudgetItemRequest;
import aptech.tripmate.DTO.BudgetItemResponse;
import aptech.tripmate.DTO.WeatherInput;
import aptech.tripmate.models.BudgetItem;
import aptech.tripmate.models.Trip;
import aptech.tripmate.repositories.BudgetItemRepository;
import aptech.tripmate.repositories.TripRepository;
import aptech.tripmate.services.BudgetItemService;
import aptech.tripmate.services.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/trips")
public class BudgetItemController {
    @Autowired
    private TripRepository tripRepository;
    @Autowired
    private BudgetItemService budgetItemService;
    @Autowired
    private MailService mailService;
    @Autowired
    private BudgetItemRepository budgetItemRepository;
    // USER: Add budget item to a trip
    @PostMapping("/{tripId}/budgets")
    @PreAuthorize("hasRole('USER')")
    public BudgetItemResponse addBudgetItem(@PathVariable Long tripId, @RequestBody BudgetItemRequest request) {
        BudgetItem saved = budgetItemService.addBudgetItem(tripId, request);
        return toDTO(saved);
    }

    // USER: Get all budget items for a trip
    @GetMapping("/{tripId}/budgets")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<BudgetItemResponse>> getBudgetItems(
            @PathVariable Long tripId,
            Authentication authentication) {

        String email = authentication.getName(); // chính là email lấy từ JWT

        if (!budgetItemService.isUserInTrip(tripId, email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<BudgetItem> items = budgetItemService.getBudgetItemsByTrip(tripId);
        List<BudgetItemResponse> result = items.stream().map(this::toDTO).toList();
        return ResponseEntity.ok(result);
    }


    // USER: Update a budget item
    @PutMapping("/{tripId}/budgets/{budgetId}")
    @PreAuthorize("hasRole('USER')")
    public BudgetItemResponse updateBudgetItem(
            @PathVariable Long tripId,
            @PathVariable Long budgetId,
            @RequestBody BudgetItemRequest request) {

        BudgetItem updated = budgetItemService.updateBudgetItem(budgetId, request);
        return toDTO(updated);
    }


    // USER: Delete a budget item
    @DeleteMapping("/budgets/{budgetId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteBudgetItem(@PathVariable Long budgetId) {
        budgetItemService.deleteBudgetItem(budgetId);
        return ResponseEntity.ok().build();
    }

    // ADMIN: Get all budget items for a trip
    @GetMapping("/admin/budgets")
    @PreAuthorize("hasRole('ADMIN')")
    public List<BudgetItemResponse> getAllBudgetItemsForAdmin() {
        List<BudgetItem> items = budgetItemService.getAllBudgetItems(); // <-- Thêm hàm này
        return items.stream().map(this::toDTO).toList();
    }
    // USER hoặc ADMIN gửi cảnh báo khi vượt ngân sách
    @PostMapping("/{tripId}/budgets/warn-overbudget")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<String> sendOverBudgetWarning(@PathVariable Long tripId) {
        budgetItemService.sendOverBudgetWarning(tripId); // Gọi service trung gian
        return ResponseEntity.ok("Warning sent successfully");
    }

    @PostMapping("/suggestion")
    public ResponseEntity<?> suggestBudget(@RequestBody WeatherInput input) {
        String condition = input.getCondition().toLowerCase();
        double temp = input.getTemp();
        double rainChance = input.getRainChance();

        Map<String, String> suggestion = new HashMap<>();

        if (condition.contains("rain") || rainChance > 50) {
            suggestion.put("Outdoor activities", "Reduce budget due to potential rain");
            suggestion.put("Indoor activities", "Increase budget for indoor entertainment");
            suggestion.put("Transportation", "Set aside extra funds for travel");
        } else if (temp < 20) {
            suggestion.put("Food & Drink", "Increase budget for hot meals / indoor dining");
            suggestion.put("Accommodation", "Increase budget for warm hotels");
        } else {
            suggestion.put("Outdoor activities", "Increase budget to explore destinations");
            suggestion.put("Transportation", "Stable cost, no need to increase");
        }

        return ResponseEntity.ok(suggestion);
    }
    @PostMapping("/{tripId}/budgets/ai-replace")
    public ResponseEntity<?> applyAISuggestionsToExistingItems(
            @PathVariable Long tripId,
            @RequestBody List<BudgetItem> aiItems
    ) {
        try {
            for (BudgetItem aiItem : aiItems) {
                Optional<BudgetItem> existingOpt = budgetItemRepository
                        .findByTrip_TripIdAndType(tripId, aiItem.getType());

                BudgetItem target;
                if (existingOpt.isPresent()) {
                    target = existingOpt.get();
                } else {
                    target = new BudgetItem();
                    target.setTrip(tripRepository.findById(tripId).orElseThrow());
                    target.setType(aiItem.getType());
                }

                // Gán Estimated từ AI
                // Gán Estimated từ AI
                target.setEstimated(aiItem.getEstimated());

// ✅ Lấy note gợi ý thật thay vì AI Suggested
                target.setFood(aiItem.getFood());
                target.setFoodNote(aiItem.getFoodNote());

                target.setTransport(aiItem.getTransport());
                target.setTransportNote(aiItem.getTransportNote());

                target.setHotel(aiItem.getHotel());
                target.setHotelNote(aiItem.getHotelNote());

                target.setSightseeing(aiItem.getSightseeing());
                target.setSightseeingNote(aiItem.getSightseeingNote());

                target.setEntertainment(aiItem.getEntertainment());
                target.setEntertainmentNote(aiItem.getEntertainmentNote());

                target.setShopping(aiItem.getShopping());
                target.setShoppingNote(aiItem.getShoppingNote());

                target.setOther(aiItem.getOther());
                target.setOtherNote(aiItem.getOtherNote());


                // ✅ Cộng actual từ 7 loại chi phí
                double actual =
                        getSafe(aiItem.getFood()) +
                                getSafe(aiItem.getTransport()) +
                                getSafe(aiItem.getHotel()) +
                                getSafe(aiItem.getSightseeing()) +
                                getSafe(aiItem.getEntertainment()) +
                                getSafe(aiItem.getShopping()) +
                                getSafe(aiItem.getOther());

                target.setActual(actual);

                budgetItemRepository.save(target);
            }

            return ResponseEntity.ok("✅ AI suggestions applied.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Error: " + e.getMessage());
        }
    }




    // Helper để tránh null
    private double getSafe(Double value) {
        return value != null ? value : 0.0;
    }

    @GetMapping("/{tripId}/budgets/daily-summary")
    public ResponseEntity<?> getDailyBudgetSummary(@PathVariable Long tripId) {
        List<BudgetItem> items = budgetItemRepository.findByTrip_TripId(tripId);

        List<Map<String, Object>> result = new ArrayList<>();
        for (BudgetItem item : items) {
            Map<String, Object> map = new HashMap<>();
            map.put("type", item.getType()); // Day 1, Day 2, ...
            map.put("food", item.getFood());
            map.put("transport", item.getTransport());
            map.put("hotel", item.getHotel());
            map.put("sightseeing", item.getSightseeing());
            map.put("entertainment", item.getEntertainment());
            map.put("shopping", item.getShopping());
            map.put("other", item.getOther());
            map.put("estimated", item.getEstimated());
            map.put("actual", item.getActual());
            map.put("note", item.getNote());
            map.put("foodNote", item.getFoodNote());
            map.put("transportNote", item.getTransportNote());
            map.put("hotelNote", item.getHotelNote());
            map.put("sightseeingNote", item.getSightseeingNote());
            map.put("entertainmentNote", item.getEntertainmentNote());
            map.put("shoppingNote", item.getShoppingNote());
            map.put("otherNote", item.getOtherNote());
            map.put("createdAt", item.getCreatedAt());
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    private BudgetItemResponse toDTO(BudgetItem item) {
        return new BudgetItemResponse(
                item.getBudgetId(),
                item.getType(),
                item.getEstimated(),
                item.getActual(),
                item.getFood(),
                item.getTransport(),
                item.getHotel(),
                item.getOther(),
                item.getSightseeing(),
                item.getEntertainment(),
                item.getShopping(),
                item.getNote(),
                item.getCreatedAt(),
                item.getTrip().getName(),
                item.getTrip().getUser().getEmail(),
                item.getTrip().getTripId(),
                item.getFoodNote(),
                item.getTransportNote(),
                item.getHotelNote(),
                item.getSightseeingNote(),
                item.getEntertainmentNote(),
                item.getShoppingNote(),
                item.getOtherNote(),
                item.getActualFood(),           // thêm đây
                item.getActualTransport(),
                item.getActualHotel(),
                item.getActualSightseeing(),
                item.getActualEntertainment(),
                item.getActualShopping(),
                item.getActualOther()
        );
    }

}
