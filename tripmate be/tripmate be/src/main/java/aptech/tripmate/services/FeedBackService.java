package aptech.tripmate.services;

import aptech.tripmate.DTO.FeedBackReplyRequest;
import aptech.tripmate.models.FeedBack;
import aptech.tripmate.models.FeedbackReply;
import aptech.tripmate.repositories.FeedBackRepository;
import aptech.tripmate.repositories.FeedbackReplyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
@Service
@RequiredArgsConstructor
public class FeedBackService {

    private final FeedBackRepository feedBackRepository;
    private final FeedbackReplyRepository feedbackReplyRepository;
    private final MailService emailService;

    public FeedbackReply replyFeedback(Long feedbackId, FeedBackReplyRequest request) {
        FeedBack feedback = feedBackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        FeedbackReply reply = FeedbackReply.builder()
                .feedback(feedback)
                .reply(request.getReply())
                .repliedBy(request.getRepliedBy())
                .repliedAt(LocalDateTime.now())
                .build();

        feedbackReplyRepository.save(reply);

        // Gửi email đến người dùng feedback
        emailService.sendEmail(
                feedback.getUser().getEmail(),
                "Thanks for your feedback",
                request.getReply()
        );

        return reply;
    }
}
