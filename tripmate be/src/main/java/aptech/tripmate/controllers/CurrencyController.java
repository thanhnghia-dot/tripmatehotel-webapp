package aptech.tripmate.controllers;

import aptech.tripmate.services.CurrencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/currency")
public class CurrencyController {

    @Autowired
    private CurrencyService currencyService;

    @GetMapping("/convert-usd")
    public ResponseEntity<?> convertFromUsd(
            @RequestParam double amount,
            @RequestParam String to) {
        double converted = currencyService.convertFromUSD(amount, to);
        return ResponseEntity.ok(Map.of(
                "from", "USD",
                "to", to.toUpperCase(),
                "originalAmount", amount,
                "convertedAmount", converted
        ));
    }
}

