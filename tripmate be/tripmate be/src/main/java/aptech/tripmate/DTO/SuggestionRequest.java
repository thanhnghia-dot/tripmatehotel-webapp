package aptech.tripmate.DTO;


public class SuggestionRequest {
    private String trip;
    private int days;
    private long budget;

    // Getters & Setters
    public String getTrip() { return trip; }
    public void setTrip(String trip) { this.trip = trip; }

    public int getDays() { return days; }
    public void setDays(int days) { this.days = days; }

    public long getBudget() { return budget; }
    public void setBudget(long budget) { this.budget = budget; }
}