package aptech.tripmate.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    // Gửi email văn bản thường
    public void sendChecklistEmail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        mailSender.send(message);
    }

    public void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true); // true = HTML

        mailSender.send(message);
    }

    public void sendEmail(String to, String subject, String body) {
        sendChecklistEmail(to, subject, body);
    }

    public void sendLockNotificationEmail(String toEmail, int days) {
        String subject = "Your TripMate Account Has Been Locked";
        String content = """
            Dear user,

            Your TripMate account has been locked for %d days due to administrative action.

            If you believe this was done in error, please contact our support team.

            Thank you,
            TripMate Team
            """.formatted(days);

        sendChecklistEmail(toEmail, subject, content);
    }

    public void sendOverBudgetWarningEmail(String toEmail, String userName, String tripName, double estimated, double actual, double remaining) {
        String subject = "⚠️ TripMate Budget Warning for Trip: " + tripName;
        String content = """
            Dear %s,

            Your trip "%s" has exceeded the budget limit.

            ▪ Estimated: %.2f
            ▪ Actual: %.2f
            ▪ Remaining: %.2f

            Please review your trip expenses.

            Regards,
            TripMate Team
            """.formatted(userName, tripName, estimated, actual, remaining);

        sendChecklistEmail(toEmail, subject, content);
    }

    public void sendRefundEmail(String toEmail, String roomName, double amount) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(toEmail);
            helper.setSubject("Refund Confirmation");
            helper.setText(
                    "Your payment for room " + roomName +
                            " has been refunded. Amount: " + amount,
                    false
            );

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send refund email", e);
        }
    }

    public void sendLockNotificationEmail(String toEmail, int days, String reason) {
        String subject = "Your TripMate Account Has Been Locked";
        String content = """
            Dear user,

            Your TripMate account has been locked for %d day(s) due to the following reason:

            %s

            If you believe this was done in error, please contact our support team.

            Thank you,
            TripMate Team
        """.formatted(days, reason);

        sendChecklistEmail(toEmail, subject, content);
    }

    public void sendOverBudgetWarningEmail(String toEmail, String userName, String tripName, double estimated, double actual, double remaining, Long tripId) {
        String subject = "⚠️ TripMate Budget Warning for Trip: " + tripName;
        String content = """
            Dear %s,

            Your trip "%s" has exceeded the budget limit.

            ▪ Estimated: %.2f
            ▪ Actual: %.2f
            ▪ Remaining: %.2f

            Please review your trip expenses.

            Regards,
            TripMate Team
        """.formatted(userName, tripName, estimated, actual, remaining);

        sendChecklistEmail(toEmail, subject, content);
    }

    // ✅ HTML đẹp hơn từ đây
    public void sendArticleApprovedEmail(String to, String userName, String articleTitle, String link)
            throws MessagingException {
        String subject = "✅ Your article has been approved!";
        String html = """
<div style="max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px;font-family:Arial,sans-serif;line-height:1.6;color:#333;">
    <h2 style="color:#28a745;text-align:center;">✅ Your article has been approved!</h2>
    <p>Hello <b>%s</b>,</p>
    <p>Your article <b>"%s"</b> has been approved and posted successfully.</p>
    <p style="text-align:center;">
        <a href="%s" style="display:inline-block;padding:12px 20px;background:#28a745;color:#fff;text-decoration:none;border-radius:6px;">
            👉 View Article
        </a>
    </p>
    <p style="margin-top:20px;">Thank you for contributing to <b>TripMate</b>!</p>
</div>
""".formatted(userName, articleTitle, link);

        sendHtmlEmail(to, subject, html);
    }

    public void sendArticleRejectedEmail(String to, String userName, String articleTitle, String reason)
            throws MessagingException {
        String subject = "❌ Your article has been rejected";
        String html = """
<div style="max-width:600px;margin:auto;padding:20px;border:1px solid #f5c2c7;border-radius:8px;font-family:Arial,sans-serif;line-height:1.6;color:#333;background:#f8d7da;">
    <h2 style="color:#dc3545;text-align:center;">❌ Your article has been rejected!</h2>
    <p>Hello <b>%s</b>,</p>
    <p>Your article <b>"%s"</b> has been rejected.</p>
    <p><b>Reason:</b> %s</p>
    <p>Please edit and resubmit for review.</p>
</div>
""".formatted(userName, articleTitle, reason);

        sendHtmlEmail(to, subject, html);
    }

    public void sendArticleDeletedEmail(String to, String userName, String articleTitle, String reason)
            throws MessagingException {
        String subject = "🚫 Your post has been deleted";
        String html = """
<div style="max-width:600px;margin:auto;padding:20px;border:1px solid #f5c2c7;border-radius:8px;font-family:Arial,sans-serif;line-height:1.6;color:#333;background:#f8d7da;">
    <h2 style="color:#dc3545;text-align:center;">🚫 Your post has been deleted</h2>
    <p>Hello <b>%s</b>,</p>
    <p>Your post <b>"%s"</b> has been deleted by the administrator.</p>
    <p><b>Reason for deletion:</b> %s</p>
    <p style="text-align:center;">
        <a href="http://localhost:3000/blog"
           style="display:inline-block;padding:12px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:6px;">
            👉 See More Posts
        </a>
    </p>
    <p>If you have any questions, please contact us.</p>
</div>
""".formatted(userName, articleTitle, reason);

        sendHtmlEmail(to, subject, html);
    }

    public void sendAlbumDeletedEmail(String to, String userName, String tripName, String albumName, String reason)
            throws MessagingException {
        String subject = "🚫 Your trip album has been deleted";
        String html = """
<div style="max-width:600px;margin:auto;padding:20px;border:1px solid #f5c2c7;border-radius:8px;font-family:Arial,sans-serif;line-height:1.6;color:#333;background:#f8d7da;">
    <h2 style="color:#dc3545;text-align:center;">🚫 Album Deleted</h2>
    <p>Hello <b>%s</b>,</p>
    <p>The album <b>"%s"</b> in your trip <b>"%s"</b> has been deleted by an administrator.</p>
    <p><b>Reason:</b> %s</p>
    <p>If you have any questions, please contact support.</p>
</div>
""".formatted(userName, albumName, tripName, reason != null ? reason : "No reason");

        sendHtmlEmail(to, subject, html);
    }

    public void sendImageDeletedEmail(String to, String userName, String tripName, String imageName, String reason)
            throws MessagingException {
        String subject = "🗑 Photos from your trip have been deleted";
        String html = """
<div style="max-width:600px;margin:auto;padding:20px;border:1px solid #f5c2c7;border-radius:8px;font-family:Arial,sans-serif;line-height:1.6;color:#333;background:#fff3cd;">
    <h2 style="color:#dc3545;text-align:center;">🗑 Image has been deleted</h2>
    <p>Hello <b>%s</b>,</p>
    <p>The image <b>"%s"</b> from your trip <b>"%s"</b> has been deleted by an administrator.</p>
    <p><b>Reason for deletion:</b> %s</p>
    <p>If you have any questions, please contact support.</p>
</div>
""".formatted(userName, imageName, tripName, reason != null ? reason : "No reason");

        sendHtmlEmail(to, subject, html);
    }

    public void sendFeelVideoDeletedEmail(String to, String userName, String caption, String reason)
            throws MessagingException {
        String subject = "🚫 Your emotional video has been deleted";
        String html = """
<div style="max-width:600px;margin:auto;padding:20px;border:1px solid #f5c2c7;border-radius:8px;font-family:Arial,sans-serif;line-height:1.6;color:#333;background:#f8d7da;">
    <h2 style="color:#dc3545;text-align:center;">🚫 Your emotional video has been deleted</h2>
    <p>Hello <b>%s</b>,</p>
    <p>Your video with the description <b>"%s"</b> has been deleted by the administrator.</p>
    <p><b>Reason for deletion:</b> %s</p>
    <p style="text-align:center;">
        <a href="http://localhost:3000/feel"
           style="display:inline-block;padding:12px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:6px;">
            👉 Watch More Videos
        </a>
    </p>
    <p>If you have any questions, please contact us.</p>
</div>
""".formatted(userName, caption, reason);

        sendHtmlEmail(to, subject, html);
    }

}
