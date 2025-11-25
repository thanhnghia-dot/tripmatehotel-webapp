package aptech.tripmate.controllers;

import aptech.tripmate.models.BudgetItem;
import aptech.tripmate.models.Trip;
import aptech.tripmate.repositories.BudgetItemRepository;
import aptech.tripmate.repositories.TripRepository;
import aptech.tripmate.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminDashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private BudgetItemRepository budgetItemRepository;

    // ✅ Tổng số người dùng
    @GetMapping("/total-users")
    public Long getTotalUsers() {
        return userRepository.count();
    }

    // ✅ Thống kê số chuyến đi theo tháng
    @GetMapping("/trips-by-month")
    public Map<String, Long> getTripsByMonth() {
        List<Trip> trips = tripRepository.findAll();
        return trips.stream()
                .filter(t -> t.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        t -> formatMonthYear(t.getCreatedAt()),
                        Collectors.counting()
                ));
    }

    // ✅ Thống kê tổng chi phí từ Trip.totalAmount theo tháng
    @GetMapping("/total-budget-by-month")
    public Map<String, Double> getBudgetByMonth() {
        List<Trip> trips = tripRepository.findAll();

        Map<String, Double> result = trips.stream()
                .filter(t -> t.getCreatedAt() != null && t.getTotalAmount() != null)
                .collect(Collectors.groupingBy(
                        t -> formatMonthYear(t.getCreatedAt()),
                        Collectors.summingDouble(Trip::getTotalAmount)
                ));

        System.out.println("💸 Budget by month: " + result);

        return result;
    }

    // Helper: Định dạng tháng + năm (VD: "JUNE 2025")
    private String formatMonthYear(java.time.temporal.Temporal dateTime) {
        if (dateTime instanceof java.time.LocalDate) {
            java.time.LocalDate date = (java.time.LocalDate) dateTime;
            return date.getMonth().toString() + " " + date.getYear();
        } else if (dateTime instanceof java.time.LocalDateTime) {
            java.time.LocalDateTime date = (java.time.LocalDateTime) dateTime;
            return date.getMonth().toString() + " " + date.getYear();
        }
        return "UNKNOWN";
    }
}
