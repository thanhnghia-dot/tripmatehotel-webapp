// src/main/java/aptech/tripmate/services/safety/SosRealtimeService.java
package aptech.tripmate.services.safety;

import aptech.tripmate.models.safety.SosLog;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SosRealtimeService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcast log SOS cho tất cả client đang subscribe /topic/sos
     */
    public void broadcast(SosLog log) {
        messagingTemplate.convertAndSend("/topic/sos", log);
    }
}
