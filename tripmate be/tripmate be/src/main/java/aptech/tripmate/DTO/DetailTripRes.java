package aptech.tripmate.DTO;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DetailTripRes {

    public String name;
    public String type;
    private String departurePoint;
    private String destination;
    private String status;
    public LocalDateTime startDate;
    public LocalDateTime endDate;
    public Boolean isFinished;
    public Boolean isPublic;
    public Double totalAmount;
    public LocalDateTime createdAt;
    public String hotel;
    private String hotelImg;
    private String roomName;
    public List<String> roomImgs;
    public String createdByUser;
    private Integer memberCount;        
    private List<String> memberNames;   

}
