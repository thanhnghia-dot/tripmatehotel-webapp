package aptech.tripmate.DTO;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserReviewCreationReq{

    private Long hotelId;
    private int rating;
    private String comment;
    private Double serviceRating;
    private Double cleanlinessRating;
    private Double locationRating;
    private Double facilitiesRating;
    private Double valueForMoneyRating;

}