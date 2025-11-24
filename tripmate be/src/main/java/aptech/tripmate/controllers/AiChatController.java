package aptech.tripmate.controllers;

import aptech.tripmate.services.AiChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class AiChatController {

    private final AiChatService aiChatService;

    public AiChatController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/suggest")
    public ResponseEntity<List<String>> getSuggestions(@RequestBody Map<String, String> payload) {
        String userMessage = payload.get("message");
        String suggestionsText = aiChatService.getSuggestion(userMessage);

        // tách thành list
        List<String> suggestions = Arrays.asList(suggestionsText.split("\\r?\\n"));

        return ResponseEntity.ok(suggestions);
    }
}
