package aptech.tripmate.controllers;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class ForecastEmailController {

    @Autowired
    private JavaMailSender mailSender;

    // Temporarily save the confirmed email
    private final Set<String> confirmedEmails = new HashSet<>();

    // Send forecast email
    @PostMapping("/send-forecast")
    public ResponseEntity<?> sendForecastEmail(@RequestBody Map<String, Object> payload) {
        try {
            String to = (String) payload.get("to");
            Map<String, List<Map<String, Object>>> predictions =
                    (Map<String, List<Map<String, Object>>>) payload.get("predictions");

            String subject = "Attraction forecast from Tripmate";
            String htmlContent = buildForecastHtml(predictions, to);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);

            return ResponseEntity.ok(Collections.singletonMap("message", "Email sent successfully!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Collections.singletonMap("message", "Sending email failed!"));
        }
    }

    // Build email HTML + confirmation link
    private String buildForecastHtml(Map<String, List<Map<String, Object>>> predictions, String toEmail) {
        StringBuilder sb = new StringBuilder();
        sb.append("<h2>Tourist destination forecast</h2>");

// Forecast table
        sb.append("<table border='1' cellpadding='6' cellspacing='0' style='border-collapse:collapse;width:100%;font-family:Arial;'>");
        sb.append("<tr style='background-color:#0ea5a4;color:white;'><th>Location</th><th>Date</th><th>Amount of visitors</th><th>Temperature (°C)</th></tr>");
        for (Map.Entry<String, List<Map<String, Object>>> entry : predictions.entrySet()) {
            String loc = entry.getKey();
            for (Map<String, Object> p : entry.getValue()) {
                sb.append("<tr>")
                        .append("<td>").append(loc).append("</td>")
                        .append("<td>").append(p.get("predictionDate")).append("</td>")
                        .append("<td>").append(p.get("predictedVisitors")).append("</td>")
                        .append("<td>").append(p.get("temperature")).append("</td>")
                        .append("</tr>");
            }
        }
        sb.append("</table>");

// Total number of visitors
        sb.append("<h3>Total number of visitors for each location</h3><ul>");
        predictions.forEach((loc, list) -> {
            int total = list.stream()
                    .mapToInt(p -> ((Number) p.getOrDefault("predictedVisitors", 0)).intValue())
                    .sum();
            sb.append("<li>").append(loc).append(": ").append(total).append("</li>");
        });
        sb.append("</ul>");


// JS call confirm API
        sb.append("<script>")
                .append("function confirmEmail() {")
                .append(" fetch('http://localhost:8080/api/confirm?email=").append(toEmail).append("')")
                .append(" .then(res => res.json())")
                .append(" .then(data => alert(data.message))")
                .append(" .catch(err => alert('Confirmation failed!'));")
                .append("}")
                .append("</script>");

// Footer
        sb.append("<p>This is an automated email from Tripmate. Have a nice trip!</p>");

        return sb.toString();
    }

// // Receive validation API (for JSON)
// @GetMapping("/confirm")
// public ResponseEntity<Map<String, Object>> confirmEmail(@RequestParam String email) {
// Map<String, Object> res = new HashMap<>();
// if (email == null || email.isEmpty()) {
// res.put("status", "error");
// res.put("message", "Invalid email!");
// return ResponseEntity.badRequest().body(res);
// }
// confirmedEmails.add(email);
// System.out.println("Confirmed email: " + email);
// res.put("status", "success");
// res.put("message", "Email " + email + " has been confirmed.");
// res.put("email", email);
// return ResponseEntity.ok(res);
// }
//
// // Optional: check status
// @GetMapping("/confirmed-emails")
// public ResponseEntity<Set<String>> getConfirmedEmails() {
// return ResponseEntity.ok(confirmedEmails);
// }
}