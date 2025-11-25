package aptech.tripmate.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class BookingDTO {
    private Long id;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
}
