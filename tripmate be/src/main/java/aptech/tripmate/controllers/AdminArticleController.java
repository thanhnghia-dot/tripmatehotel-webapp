package aptech.tripmate.controllers;

import aptech.tripmate.models.Article;
import aptech.tripmate.models.User;
import aptech.tripmate.services.ArticleService;
import aptech.tripmate.services.MailService;
import jakarta.mail.MessagingException;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/articles")
@RequiredArgsConstructor
public class AdminArticleController {

    private final ArticleService articleService;
    private final MailService mailService;

    @GetMapping
    public ResponseEntity<?> getArticles(@RequestParam(defaultValue = "PENDING") Article.ArticleStatus status) {
        try {
            return ResponseEntity.ok(articleService.findByStatus(status));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Error getting list of articles",
                    "details", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveArticle(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Article article = articleService.getArticleById(id); // ✅ dùng đúng tên hàm
            if (article == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Post not found", "id", id));            }

            // ✅ Cập nhật trạng thái
            articleService.updateStatus(id, Article.ArticleStatus.APPROVED, null);
            response.put("message", "✅ Article has been approved");
            response.put("id", id);

            // ✅ Gửi email
            User user = article.getUser();
            if (user != null && user.getEmail() != null) {
                String link = "http://localhost:3000/blog/" + article.getId();
                try {
                    mailService.sendArticleApprovedEmail(
                            user.getEmail(),
                            user.getName(),
                            article.getTitle(),
                            link
                    );
                    response.put("email", "📩Email has been sent to " + user.getEmail());
                } catch (MessagingException e) {
                    response.put("emailError", "⚠ Email could not be sent: " + e.getMessage());
                }
            }
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Error while browsing the article",
                    "details", e.getMessage()
            ));
        }
    }


    // ✅ API Xoá bài kèm lý do
    @PutMapping("/{id}/delete")
    public ResponseEntity<?> deleteArticleWithReason(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String reason = body.get("reason");
        Article article = articleService.getArticleById(id);

        if (article == null) {
            return ResponseEntity.status(404).body(Map.of("error", "No posts found"));
        }

        // ✅ Gửi email trước khi xóa
        try {
            if (article.getUser() != null && article.getUser().getEmail() != null) {
                mailService.sendArticleDeletedEmail(
                        article.getUser().getEmail(),
                        article.getUser().getName(),
                        article.getTitle(),
                        reason
                );
            }
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "message", "🗑 Post deleted but email not sent",
                    "emailError", e.getMessage()
            ));
        }

        // ✅ Xóa bài viết
        articleService.deleteArticle(id);

        return ResponseEntity.ok(Map.of(
                "message", "🗑 Post deleted and email sent successfully",
                "email", article.getUser() != null ? article.getUser().getEmail() : null
        ));
    }




    @Data
    public static class RejectRequest {
        private String reason;
    }
}
