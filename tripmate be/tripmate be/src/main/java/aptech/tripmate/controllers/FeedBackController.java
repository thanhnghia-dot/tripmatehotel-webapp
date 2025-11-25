package aptech.tripmate.controllers;

import aptech.tripmate.DTO.FeedBackRequest;
import aptech.tripmate.DTO.ReplyFeedBackDTO;
import aptech.tripmate.enums.ReviewType;
import aptech.tripmate.models.FeedBack;
import aptech.tripmate.models.FeedbackReply;
import aptech.tripmate.models.User;
import aptech.tripmate.repositories.FeedBackRepository;
import aptech.tripmate.repositories.FeedbackReplyRepository;
import aptech.tripmate.repositories.UserRepository;
import aptech.tripmate.services.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedBackController {
    private final FeedBackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final FeedbackReplyRepository feedbackReplyRepository;
    private final MailService mailService;

    // Lấy tất cả feedback
    @GetMapping
    public ResponseEntity<List<FeedBack>> getAllFeedback() {
        return ResponseEntity.ok(feedbackRepository.findAll());
    }

    // Tạo mới feedback

    // Lấy feedback theo type
    @GetMapping("/type/{type}")
    public ResponseEntity<List<FeedBack>> getFeedbackByType(@PathVariable("type") ReviewType type) {
        return ResponseEntity.ok(feedbackRepository.findByType(type));
    }

    // Lấy feedback theo userId
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FeedBack>> getFeedbackByUser(@PathVariable("userId") Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(feedbackRepository.findByUser(user));
    }
    @PostMapping
    public ResponseEntity<?> createFeedback(@RequestBody FeedBackRequest request,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email).orElseThrow();

        FeedBack feedback = new FeedBack();
        feedback.setUser(user);
        feedback.setContent(request.getContent());
        feedback.setType(request.getType());

        feedbackRepository.save(feedback);
        return ResponseEntity.ok("Feedback saved!");
    }
}
