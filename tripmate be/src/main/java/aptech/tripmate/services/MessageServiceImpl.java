package aptech.tripmate.services;

import aptech.tripmate.DTO.MessageDTO;
import aptech.tripmate.models.HiddenMessage;
import aptech.tripmate.models.Message;
import aptech.tripmate.repositories.HiddenMessageRepository;
import aptech.tripmate.repositories.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageRepository messageRepo;

    @Autowired
    private HiddenMessageRepository hiddenMessageRepo; // repo để lưu tin nhắn đã ẩn

    @Override
    public List<MessageDTO> getMessagesByTripId(Long tripId) {
        // method này override interface (bắt buộc)
        return messageRepo.findByTripIdOrderByCreatedAtAsc(tripId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // 👉 method helper: không override, thêm filter theo userEmail
    public List<MessageDTO> getMessagesByTripId(Long tripId, String userEmail) {
        List<Long> hiddenIds = hiddenMessageRepo.findByUserEmail(userEmail)
                .stream()
                .map(HiddenMessage::getMessageId)
                .collect(Collectors.toList());

        return messageRepo.findByTripIdOrderByCreatedAtAsc(tripId)
                .stream()
                .filter(m -> !hiddenIds.contains(m.getId())) // loại bỏ tin nhắn đã ẩn với user này
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MessageDTO sendMessage(Long tripId, String content, String senderEmail) {
        Message msg = new Message();
        msg.setTripId(tripId);
        msg.setContent(content);
        msg.setSenderEmail(senderEmail);
        msg.setCreatedAt(LocalDateTime.now());

        Message saved = messageRepo.save(msg);
        return toDTO(saved);
    }

    @Override
    public MessageDTO pinMessage(Long tripId, Long messageId, boolean pinned, String userEmail) {
        Message message = messageRepo.findByIdAndTripId(messageId, tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));

        // ❌ Không cho ghim tin nhắn đã bị thu hồi
        if (message.isRecalled()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot pin a recalled message");
        }

        message.setPinned(pinned);
        Message saved = messageRepo.save(message);
        return toDTO(saved);
    }

    @Override
    public String deleteMessage(Long tripId, Long messageId, String userEmail) {
        Message message = messageRepo.findByIdAndTripId(messageId, tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));

        if (message.getSenderEmail().equals(userEmail)) {
            // 👉 Nếu đã thu hồi rồi thì không thể thu hồi lại nữa
            if (message.isRecalled()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message already recalled");
            }
            message.setRecalled(true);
            message.setContent("Tin nhắn đã bị thu hồi");
            messageRepo.save(message);
            return "Message recalled successfully";
        } else {
            // 👉 Chỉ ẩn ở phía user này
            if (!hiddenMessageRepo.existsByUserEmailAndMessageId(userEmail, messageId)) {
                HiddenMessage hidden = new HiddenMessage();
                hidden.setMessageId(messageId);
                hidden.setUserEmail(userEmail);
                hiddenMessageRepo.save(hidden);
            }
            return "Message hidden for user " + userEmail;
        }
    }

    private MessageDTO toDTO(Message msg) {
        MessageDTO dto = new MessageDTO();
        dto.setId(msg.getId());
        dto.setTripId(msg.getTripId());
        dto.setSenderEmail(msg.getSenderEmail());
        dto.setContent(msg.getContent());
        dto.setCreatedAt(msg.getCreatedAt());

        dto.setPinned(msg.isPinned());
        dto.setDeleted(msg.isDeleted());
        dto.setRecalled(msg.isRecalled());
        return dto;
    }
}
