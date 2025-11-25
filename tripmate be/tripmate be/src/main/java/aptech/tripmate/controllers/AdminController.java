package aptech.tripmate.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/only-admin")
    public ResponseEntity<String> onlyAdmin() {
        return ResponseEntity.ok("Welcome, Admin!");
    }
}
