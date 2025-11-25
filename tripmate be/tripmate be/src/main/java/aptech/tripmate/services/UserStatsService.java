package aptech.tripmate.services;

import aptech.tripmate.DTO.UserStatsDTO;
import aptech.tripmate.repositories.FeelCommentRepository;
import aptech.tripmate.repositories.FeelRepository;
import aptech.tripmate.repositories.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserStatsService {

    private final TripRepository tripRepository;
    private final FeelRepository feelRepository;
    private final FeelCommentRepository feelCommentRepository;

    public UserStatsDTO getUserStats(Long userId) {
        long tripCount = tripRepository.countByUser_UserId(userId);
        long feelCount = feelRepository.countByUser_UserId(userId);
        long commentCount = feelCommentRepository.countByUser_UserId(userId);

        return new UserStatsDTO(tripCount, feelCount, commentCount);
    }
}
