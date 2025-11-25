package aptech.tripmate.controllers;

import aptech.tripmate.DTO.SuggestionRequest;
import aptech.tripmate.models.Amenity;
import aptech.tripmate.models.Hotel;
import aptech.tripmate.models.Room;
import aptech.tripmate.models.Trip;
import aptech.tripmate.repositories.BudgetItemRepository;

import aptech.tripmate.repositories.HotelRepository;
import aptech.tripmate.repositories.TripRepository;
import aptech.tripmate.services.GeminiAIService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai/budget")
public class GeminiAIController {

    private final GeminiAIService aiService;
    private final GeminiAIService geminiAIService;
    private final ObjectMapper objectMapper;
    private final TripRepository tripRepository;
    private final HotelRepository hotelRepository;


    public GeminiAIController(GeminiAIService aiService, GeminiAIService geminiAIService, ObjectMapper objectMapper, TripRepository tripRepository, HotelRepository hotelRepository) {
        this.aiService = aiService;
        this.geminiAIService = geminiAIService;
        this.objectMapper = objectMapper;

        this.tripRepository = tripRepository;
        this.hotelRepository = hotelRepository;
    }


    @GetMapping("/suggest-from-trip/{tripId}")
    public ResponseEntity<?> suggestFromTrip(@PathVariable Long tripId) {
        try {
            String response = geminiAIService.suggestFromTripData(tripId);
            return ResponseEntity.ok(new ObjectMapper().readTree(response));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("AI Suggestion Error: " + e.getMessage());
        }
    }
    @GetMapping("/suggest-hotels/{tripId}")
    public ResponseEntity<?> suggestHotels(
            @PathVariable Long tripId,
            @RequestParam int nights,                      // số đêm user chọn
            @RequestParam(required = false) List<Long> amenityIds // ids amenities user chọn
    ) {
        try {
            Trip trip = tripRepository.findById(tripId)
                    .orElseThrow(() -> new RuntimeException("Trip not found"));

            double maxBudget = trip.getTotalAmount() * 0.4; // 40% của tổng budget trip

            List<Hotel> allHotels = hotelRepository.findAll();
            List<Map<String, Object>> suitableRooms = new ArrayList<>();

            for (Hotel hotel : allHotels) {

                // Lọc khách sạn theo amenities
                if (amenityIds != null && !amenityIds.isEmpty()) {
                    List<Long> hotelAmenityIds = hotel.getAmenities().stream()
                            .map(Amenity::getId)
                            .collect(Collectors.toList());
                    if (!hotelAmenityIds.containsAll(amenityIds)) continue;
                }

                // Lọc phòng theo budget
                for (Room r : hotel.getRooms()) {
                    if (r.getFinalPrice() == null) continue;

                    double totalPrice = r.getFinalPrice() * nights;
                    if (totalPrice > maxBudget) continue; // quá budget

                    Map<String, Object> roomMap = new HashMap<>();
                    roomMap.put("roomId", r.getId());
                    roomMap.put("roomName", r.getRoomName());
                    roomMap.put("pricePerNight", r.getFinalPrice());
                    roomMap.put("totalPrice", totalPrice);
                    roomMap.put("imageUrl", r.getImageUrl());
                    roomMap.put("amenities", hotel.getAmenities().stream().map(Amenity::getName).collect(Collectors.toList()));
                    roomMap.put("hotelName", hotel.getName());
                    roomMap.put("hotelId", hotel.getId());

                    suitableRooms.add(roomMap);
                }
            }

            return ResponseEntity.ok(suitableRooms);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching AI suggested hotels: " + e.getMessage());
        }
    }





}
