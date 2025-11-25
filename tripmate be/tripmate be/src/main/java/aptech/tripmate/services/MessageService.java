package aptech.tripmate.services;

import aptech.tripmate.DTO.MessageDTO;

import java.util.List;

public interface MessageService {
    List<MessageDTO> getMessagesByTripId(Long tripId);
    MessageDTO sendMessage(Long tripId, String content, String senderEmail);
    MessageDTO pinMessage(Long tripId, Long messageId, boolean pinned, String userEmail);
    String deleteMessage(Long tripId, Long messageId, String userEmail);
}
