package aptech.tripmate.DTO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HotelReviewRequestDTO {
    private Long userId;
    private Long hotelId;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;


}
