package aptech.tripmate.DTO;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor

public class BudgetItemResponse {
    private Long budgetId;
    private String type;
    private Double estimated;
    private Double actual;

    private Double food;
    private Double transport;
    private Double hotel;
    private Double other;
    private Double sightseeing;
    private Double entertainment;
    private Double shopping;
    private String note;
    private LocalDate createdAt;
    private String tripName;
    private String userEmail;
    private Long tripId;
    private String foodNote;
    private String transportNote;
    private String hotelNote;
    private String sightseeingNote;
    private String entertainmentNote;
    private String shoppingNote;
    private String otherNote;
    private Double actualFood;
    private Double actualTransport;
    private Double actualHotel;
    private Double actualSightseeing;
    private Double actualEntertainment;
    private Double actualShopping;
    private Double actualOther;
}