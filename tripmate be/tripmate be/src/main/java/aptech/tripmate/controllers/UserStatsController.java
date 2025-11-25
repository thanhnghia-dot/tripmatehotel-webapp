package aptech.tripmate.controllers;

import aptech.tripmate.DTO.UserStatsDTO;
import aptech.tripmate.models.User;

import aptech.tripmate.repositories.UserRepository;
import aptech.tripmate.services.UserStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/me")
@RequiredArgsConstructor
public class UserStatsController {

    private final UserStatsService userStatsService;
    private final UserRepository userRepository;
    @GetMapping("/stats")
    public UserStatsDTO getMyStats(@AuthenticationPrincipal org.springframework.security.core.userdetails.User userDetails) {
        String email = userDetails.getUsername(); // hoặc username tùy bạn lưu gì trong token
        Long userId = userRepository.findByEmail(email).get().getUserId();
        return userStatsService.getUserStats(userId);
    }

}
