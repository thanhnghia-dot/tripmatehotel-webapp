// src/main/java/aptech/tripmate/controllers/safety/SosRealtimeController.java
package aptech.tripmate.controllers.safety;

import aptech.tripmate.DTO.safety.SosLogResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@RestController
@RequestMapping("/api/safety/sos")
@RequiredArgsConstructor
public class SosRealtimeController {

    // Bộ phát sự kiện SOS
    private final Sinks.Many<SosLogResponseDTO> sink = Sinks.many().multicast().onBackpressureBuffer();

    // Client (FE) sẽ kết nối tới endpoint này để nghe realtime
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<SosLogResponseDTO> streamSOS() {
        return sink.asFlux();
    }

    // Service sẽ gọi hàm này để broadcast SOS event
    public void broadcast(SosLogResponseDTO sosEvent) {
        sink.tryEmitNext(sosEvent);
    }
}
