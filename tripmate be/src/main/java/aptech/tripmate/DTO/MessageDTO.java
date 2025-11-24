package aptech.tripmate.DTO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageDTO {
    private Long id;
    private Long tripId;
    private String senderEmail;
    private String content;
    private String senderName;
    private String recipientEmail; // null = broadcast
    private boolean pinned;
    private boolean deleted;
    private boolean recalled;
    private LocalDateTime createdAt;
}
