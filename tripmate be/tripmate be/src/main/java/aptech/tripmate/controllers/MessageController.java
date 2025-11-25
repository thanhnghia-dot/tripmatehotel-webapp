package aptech.tripmate.controllers;

import aptech.tripmate.DTO.MessageDTO;
import aptech.tripmate.services.MessageService;
import aptech.tripmate.services.MessageServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;



    @GetMapping
    public ResponseEntity<List<MessageDTO>> getMessages(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails user
    ) {
        List<MessageDTO> messages;

        if (user != null) {
            // Gọi method helper lọc hidden messages theo user
            messages = ((MessageServiceImpl) messageService)
                    .getMessagesByTripId(tripId, user.getUsername());
        } else {
            // Nếu user null, trả về tất cả message
            messages = messageService.getMessagesByTripId(tripId);
        }

        return ResponseEntity.ok(messages);
    }


    @PostMapping
    public ResponseEntity<MessageDTO> sendMessage(
            @PathVariable Long tripId,
            @RequestParam String content,
            @AuthenticationPrincipal UserDetails user
    ) {
        // Gửi tin nhắn
        MessageDTO sent = messageService.sendMessage(tripId, content, user.getUsername());
        return ResponseEntity.ok(sent);
    }
    // 📌 Ghim / Bỏ ghim tin nhắn
    @PostMapping("/{messageId}/pin")
    public ResponseEntity<MessageDTO> pinMessage(
            @PathVariable Long tripId,
            @PathVariable Long messageId,
            @RequestParam boolean pinned,
            @AuthenticationPrincipal UserDetails user
    ) {
        MessageDTO updated = messageService.pinMessage(tripId, messageId, pinned, user.getUsername());
        return ResponseEntity.ok(updated);
    }

    // 🗑 Xóa tin nhắn
    @DeleteMapping("/{messageId}")
    public ResponseEntity<?> deleteMessage(
            @PathVariable Long tripId,
            @PathVariable Long messageId,
            @AuthenticationPrincipal UserDetails user
    ) {
        String result = messageService.deleteMessage(tripId, messageId, user.getUsername());
        return ResponseEntity.ok(result);
    }
}