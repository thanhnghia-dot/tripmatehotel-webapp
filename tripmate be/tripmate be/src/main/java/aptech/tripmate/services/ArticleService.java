package aptech.tripmate.services;

import aptech.tripmate.DTO.ArticleDTO;
import aptech.tripmate.models.Article;
import aptech.tripmate.repositories.ArticleRepository;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;

    public ArticleService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    public List<Article> getAllArticles() {
        return articleRepository.findAll();
    }

    public Article createArticle(Article article) {
        article.setCreatedAt(LocalDateTime.now());
        return articleRepository.save(article);
    }

    public void deleteArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với id: " + id));

        // ✅ Xóa luôn file ảnh nếu tồn tại
        try {
            if (article.getImage() != null && !article.getImage().isEmpty()) {
                String imageUrl = article.getImage();
                String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
                String filePath = System.getProperty("user.dir") + "/uploads/" + fileName;

                File file = new File(filePath);
                if (file.exists()) file.delete();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        articleRepository.deleteById(id);
    }

    public List<Article> findByStatus(Article.ArticleStatus status) {
        return articleRepository.findByStatus(status);
    }

    // ✅ Cập nhật trạng thái bài viết
    public void updateStatus(Long id, Article.ArticleStatus status, String reason) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với id: " + id));

        article.setStatus(status);
        article.setRejectReason(status == Article.ArticleStatus.REJECTED ? reason : null);

        articleRepository.save(article);
    }

    // ✅ Đổi tên hàm cho đồng nhất với Controller
    public Article getArticleById(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với id: " + id));
    }

    public List<ArticleDTO> getAllArticlesDTO() {
        return articleRepository.findAll().stream()
                .map(a -> new ArticleDTO(
                        a.getId(),
                        a.getTitle(),
                        a.getDescription(),
                        a.getImage(),
                        a.getCreatedAt(),
                        a.getStatus().name(),
                        a.getRejectReason(),
                        a.getUser() != null ? a.getUser().getName() : null,
                        a.getUser() != null ? a.getUser().getEmail() : null
                ))
                .toList();
    }
}
