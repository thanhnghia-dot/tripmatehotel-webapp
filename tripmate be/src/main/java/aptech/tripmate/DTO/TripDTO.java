package aptech.tripmate.DTO;

import aptech.tripmate.models.Trip;
import aptech.tripmate.models.TripMember;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TripDTO {
    private Long id;
    private Long tripId;
    private String name;
    private String type;
    private String departurePoint;
    private String destination;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Double totalAmount;
    private Boolean isPublic;
    private List<TripMemberDTO> members;

    private HotelDTO hotel;
    private List<TripRoomDTO> rooms;
    private Boolean isFinished;
    private LocalDateTime finishedAd;
    private String ownerName;
    private LocalDateTime createdAt;
    public static TripDTO fromTripMember(TripMember member) {
        Trip trip = member.getTrip();

        return TripDTO.builder()
                .tripId(trip.getTripId())
                .name(trip.getName())
                .destination(trip.getDestination())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .totalAmount(trip.getTotalAmount())
                .status(member.getStatus().name()) // 👈 Lấy status từ TripMember
                .build();
    }
    public static TripDTO fromEntity(Trip trip) {
        return TripDTO.builder()
                .tripId(trip.getTripId())
                .name(trip.getName())
                .destination(trip.getDestination())
                .departurePoint(trip.getDeparturePoint())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .status(trip.getStatus())
                .totalAmount(trip.getTotalAmount())
                .isFinished(trip.getIsFinished())
                .createdAt(trip.getCreatedAt())
                .build();
    }
    private String memberRole; // "OWNER" hoặc "MEMBER" hoặc null
    private Long creatorId; // nếu bạn muốn frontend biết ai là creator

}
