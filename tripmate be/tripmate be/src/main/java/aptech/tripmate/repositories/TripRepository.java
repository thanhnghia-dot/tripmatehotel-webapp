package aptech.tripmate.repositories;

import aptech.tripmate.models.Trip;
import aptech.tripmate.models.TripMember;
import aptech.tripmate.models.TripRoom;
import aptech.tripmate.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    //private vs puclic
    List<Trip> findByIsPublicTrue();
    // Tìm danh sách chuyến đi theo user
    List<Trip> findByUser(User user);
    // chưa có thì thêm
    List<Trip> findByUserUserIdAndIsFinishedTrue(Long userId);
    List<Trip> findByUserEmail(String email);

    // Tìm chuyến đi theo hotelId
    Optional<Trip> findByHotelId(Long hotelId);
    Page<Trip> findByStatus(String status, Pageable pageable);
    // Lấy thông tin chuyến đi (kèm user & hotel)
    @Query("SELECT t FROM Trip t " +
            "LEFT JOIN FETCH t.user " +
            "LEFT JOIN FETCH t.hotel " +
            "WHERE t.tripId = :tripId")
    Optional<Trip> findTripBasicInfo(@Param("tripId") Long tripId);

    // Lấy danh sách phòng của chuyến đi
    @Query("SELECT tr FROM TripRoom tr " +
            "JOIN FETCH tr.room " +
            "WHERE tr.trip.tripId = :tripId")
    List<TripRoom> findTripRoomsByTripId(@Param("tripId") Long tripId);

    // Lấy danh sách thành viên của chuyến đi
    @Query("SELECT tm FROM TripMember tm " +
            "JOIN FETCH tm.user " +
            "WHERE tm.trip.tripId = :tripId")
    List<TripMember> findTripMembersByTripId(@Param("tripId") Long tripId);

    // Search cơ bản theo tên, creator, ngày và trạng thái
    @Query("SELECT t FROM Trip t " +
            "WHERE (:name IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (:creator IS NULL OR LOWER(t.user.name) LIKE LOWER(CONCAT('%', :creator, '%'))) " +
            "AND (:startDate IS NULL OR t.startDate >= :startDate) " +
            "AND (:endDate IS NULL OR t.endDate <= :endDate) " +
            "AND (:isFinished IS NULL OR t.isFinished = :isFinished)")
    Page<Trip> findBySearchCriteria(
            @Param("name") String name,
            @Param("creator") String creator,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("isFinished") Boolean isFinished,
            Pageable pageable);

    // Bộ lọc nâng cao theo ngày tạo, số thành viên,...
    @Query("SELECT t FROM Trip t " +
            "WHERE (:createdFrom IS NULL OR t.createdAt >= :createdFrom) " +
            "AND (:createdTo IS NULL OR t.createdAt <= :createdTo) " +
            "AND (:minMembers IS NULL OR (SELECT COUNT(tm) FROM TripMember tm WHERE tm.trip = t) >= :minMembers) " +
            "AND (:maxMembers IS NULL OR (SELECT COUNT(tm) FROM TripMember tm WHERE tm.trip = t) <= :maxMembers) " +
            "AND (:isFinished IS NULL OR t.isFinished = :isFinished)")
    Page<Trip> findByFilterCriteria(
            @Param("createdFrom") LocalDateTime createdFrom,
            @Param("createdTo") LocalDateTime createdTo,
            @Param("minMembers") Long minMembers,
            @Param("maxMembers") Long maxMembers,
            @Param("isFinished") Boolean isFinished,
            Pageable pageable);

    long countByUser_UserId(Long userUserId);
}
