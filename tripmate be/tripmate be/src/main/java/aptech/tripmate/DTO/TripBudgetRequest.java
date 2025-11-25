package aptech.tripmate.DTO;

import lombok.Data;

@Data
public class TripBudgetRequest {
    private String destination;
    private int days;
    private double totalBudget;
}
