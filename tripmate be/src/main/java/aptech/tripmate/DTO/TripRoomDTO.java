package aptech.tripmate.DTO;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TripRoomDTO {
    private Long id;
    private Long tripId;
    private String name;
    private String email;
    private Long roomId;
    private String roomName;
    private String roomStatus;
    private int capacity;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private String hotelName;
    private double price;              // ✅ tổng tiền user trả
    private double commissionPercent;  // ✅ phần trăm admin
    private double commissionAmount;
    private Boolean emailSent;
    private boolean isPaid;
    private String status;
    private LocalDateTime reminderSentAt;
    private int numberOfBeds;
}
