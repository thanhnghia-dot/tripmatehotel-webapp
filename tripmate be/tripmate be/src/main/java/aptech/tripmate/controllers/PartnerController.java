package aptech.tripmate.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/partner")
public class PartnerController {
    @GetMapping("/only-partner")
    public ResponseEntity<String> onlyPartner() {
        return ResponseEntity.ok("Welcome, Partner!");
    }
}
