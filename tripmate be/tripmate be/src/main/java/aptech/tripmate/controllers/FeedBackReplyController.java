package aptech.tripmate.controllers;

import aptech.tripmate.DTO.FeedBackReplyRequest;
import aptech.tripmate.models.FeedbackReply;
import aptech.tripmate.services.FeedBackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback") // Đây là prefix
@RequiredArgsConstructor
public class FeedBackReplyController {
    private final FeedBackService feedbackService;

    @PostMapping("/{feedbackId}/reply")
    public ResponseEntity<?> replyFeedback(
            @PathVariable Long feedbackId,
            @RequestBody FeedBackReplyRequest request
    ) {
        FeedbackReply reply = feedbackService.replyFeedback(feedbackId, request);
        return ResponseEntity.ok(reply);
    }
}
