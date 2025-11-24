package aptech.tripmate.services;

import aptech.tripmate.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import aptech.tripmate.models.BudgetItem;
import aptech.tripmate.models.Trip;
import aptech.tripmate.DTO.BudgetItemRequest;
import aptech.tripmate.DTO.BudgetItemResponse;
import aptech.tripmate.repositories.BudgetItemRepository;
import aptech.tripmate.repositories.TripRepository;
import java.util.List;

@Service
public class BudgetItemService {

    private final BudgetItemRepository budgetItemRepository;
    private final TripRepository tripRepository;
    private final MailService mailService;

    @Autowired
    public BudgetItemService(BudgetItemRepository repo, TripRepository tripRepo, MailService mailService) {
        this.budgetItemRepository = repo;
        this.tripRepository = tripRepo;
        this.mailService = mailService;
    }

    public void sendOverBudgetWarning(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        List<BudgetItem> items = budgetItemRepository.findByTrip_TripId(tripId);

        double estimatedTotal = items.stream().mapToDouble(BudgetItem::getEstimated).sum();
        double actualTotal = items.stream().mapToDouble(BudgetItem::getActual).sum();
        double remaining = estimatedTotal - actualTotal;

        if (actualTotal > estimatedTotal) {
            for (User user : trip.getMembers()) {
                mailService.sendOverBudgetWarningEmail(
                        user.getEmail(),
                        user.getName(),
                        trip.getName(),
                        estimatedTotal,
                        actualTotal,
                        remaining,
                        tripId
                );
            }
        }
    }


    public BudgetItem addBudgetItem(Long tripId, BudgetItemRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        // Lấy estimated từng loại
        double food = request.getFood() == null ? 0.0 : request.getFood();
        double transport = request.getTransport() == null ? 0.0 : request.getTransport();
        double hotel = request.getHotel() == null ? 0.0 : request.getHotel();
        double sightseeing = request.getSightseeing() == null ? 0.0 : request.getSightseeing();
        double entertainment = request.getEntertainment() == null ? 0.0 : request.getEntertainment();
        double shopping = request.getShopping() == null ? 0.0 : request.getShopping();
        double other = request.getOther() == null ? 0.0 : request.getOther();

        // **Thêm lấy actual từng loại từ request**
        double actualFood = request.getActualFood() == null ? 0.0 : request.getActualFood();
        double actualTransport = request.getActualTransport() == null ? 0.0 : request.getActualTransport();
        double actualHotel = request.getActualHotel() == null ? 0.0 : request.getActualHotel();
        double actualSightseeing = request.getActualSightseeing() == null ? 0.0 : request.getActualSightseeing();
        double actualEntertainment = request.getActualEntertainment() == null ? 0.0 : request.getActualEntertainment();
        double actualShopping = request.getActualShopping() == null ? 0.0 : request.getActualShopping();
        double actualOther = request.getActualOther() == null ? 0.0 : request.getActualOther();

        BudgetItem item = new BudgetItem();
        item.setTrip(trip);
        item.setType(request.getType());
        item.setEstimated(request.getEstimated());
        item.setFood(food);
        item.setTransport(transport);
        item.setHotel(hotel);
        item.setSightseeing(sightseeing);
        item.setEntertainment(entertainment);
        item.setShopping(shopping);
        item.setOther(other);

        // **Set actual chi tiết lên item**
        item.setActualFood(actualFood);
        item.setActualTransport(actualTransport);
        item.setActualHotel(actualHotel);
        item.setActualSightseeing(actualSightseeing);
        item.setActualEntertainment(actualEntertainment);
        item.setActualShopping(actualShopping);
        item.setActualOther(actualOther);



        item.setNote(request.getNote());

        return budgetItemRepository.save(item);
    }



    public List<BudgetItem> getBudgetItemsByTrip(Long tripId) {
        return budgetItemRepository.findByTrip_TripId(tripId);
    }
    public List<BudgetItem> getAllBudgetItems() {
        return budgetItemRepository.findAll();
    }
    public BudgetItem updateBudgetItem(Long budgetId, BudgetItemRequest request) {
        BudgetItem item = budgetItemRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("BudgetItem not found"));

        Trip trip = item.getTrip();

        // ✅ Estimated values
        double food = request.getFood() == null ? 0.0 : request.getFood();
        double transport = request.getTransport() == null ? 0.0 : request.getTransport();
        double hotel = request.getHotel() == null ? 0.0 : request.getHotel();
        double sightseeing = request.getSightseeing() == null ? 0.0 : request.getSightseeing();
        double entertainment = request.getEntertainment() == null ? 0.0 : request.getEntertainment();
        double shopping = request.getShopping() == null ? 0.0 : request.getShopping();
        double other = request.getOther() == null ? 0.0 : request.getOther();

        // ✅ Actual values
        double actualFood = request.getActualFood() == null ? 0.0 : request.getActualFood();
        double actualTransport = request.getActualTransport() == null ? 0.0 : request.getActualTransport();
        double actualHotel = request.getActualHotel() == null ? 0.0 : request.getActualHotel();
        double actualSightseeing = request.getActualSightseeing() == null ? 0.0 : request.getActualSightseeing();
        double actualEntertainment = request.getActualEntertainment() == null ? 0.0 : request.getActualEntertainment();
        double actualShopping = request.getActualShopping() == null ? 0.0 : request.getActualShopping();
        double actualOther = request.getActualOther() == null ? 0.0 : request.getActualOther();

        // ✅ Tính tổng actual
        double updatedActual = food + transport + hotel +
                sightseeing + entertainment +
                shopping + other;

        // ✅ Check không vượt tripTotal
        double existingActualTotal = budgetItemRepository.findByTrip_TripId(trip.getTripId())
                .stream()
                .filter(b -> !b.getBudgetId().equals(budgetId))
                .mapToDouble(b -> b.getActual() == null ? 0.0 : b.getActual())
                .sum();

        double tripTotal = trip.getTotalAmount() == null ? 0.0 : trip.getTotalAmount();
        if (existingActualTotal + updatedActual > tripTotal) {
            throw new IllegalArgumentException("Actual total cost after update exceeds total trip budget (" + tripTotal + ")");
        }

        // ✅ Set estimated
        item.setType(request.getType());
        item.setEstimated(request.getEstimated());
        item.setFood(food);
        item.setTransport(transport);
        item.setHotel(hotel);
        item.setSightseeing(sightseeing);
        item.setEntertainment(entertainment);
        item.setShopping(shopping);
        item.setOther(other);

        // ✅ Set actual chi tiết
        item.setActualFood(actualFood);
        item.setActualTransport(actualTransport);
        item.setActualHotel(actualHotel);
        item.setActualSightseeing(actualSightseeing);
        item.setActualEntertainment(actualEntertainment);
        item.setActualShopping(actualShopping);
        item.setActualOther(actualOther);

        // ✅ Tổng actual
        item.setActual(updatedActual);

        // ✅ Notes
        item.setNote(request.getNote());
        item.setFoodNote(request.getFoodNote());
        item.setTransportNote(request.getTransportNote());
        item.setHotelNote(request.getHotelNote());
        item.setSightseeingNote(request.getSightseeingNote());
        item.setEntertainmentNote(request.getEntertainmentNote());
        item.setShoppingNote(request.getShoppingNote());
        item.setOtherNote(request.getOtherNote());

        return budgetItemRepository.save(item);
    }



    public boolean isUserInTrip(Long tripId, String email) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return false;

        return trip.getMembers().stream()
                .anyMatch(member -> member.getEmail().equals(email)); // So sánh email
    }




    public void deleteBudgetItem(Long budgetId) {
        budgetItemRepository.deleteById(budgetId);
    }

    public BudgetItem save(BudgetItem item) {
        return budgetItemRepository.save(item);
    }
}
