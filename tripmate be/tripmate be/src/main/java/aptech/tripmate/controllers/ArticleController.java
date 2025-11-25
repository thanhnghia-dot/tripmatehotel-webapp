package aptech.tripmate.controllers;

import aptech.tripmate.models.Article;
import aptech.tripmate.models.User;
import aptech.tripmate.repositories.UserRepository;
import aptech.tripmate.services.ArticleService;
import aptech.tripmate.services.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import okhttp3.*;
import okhttp3.RequestBody;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/articles")
@CrossOrigin(origins = "http://localhost:3000")
public class ArticleController {

    private final ArticleService articleService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    private final String GEMINI_API_KEY = "AIzaSyBriA-YOs4cdhFQAjZptSiKyuNcsOlOlUs";

    public ArticleController(ArticleService articleService, JwtService jwtService, UserRepository userRepository) {
        this.articleService = articleService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    // ================== LIST ARTICLES ==================
    @GetMapping("/listArticle")
    public ResponseEntity<?> listArticles() {
        return ResponseEntity.ok(articleService.getAllArticlesDTO());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getArticleById(@PathVariable Long id) {
        try {
            Article article = articleService.getArticleById(id);
            if (article == null) return ResponseEntity.status(404).body("❌ Không tìm thấy bài viết");
            return ResponseEntity.ok(article);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ Lỗi khi lấy bài viết: " + e.getMessage());
        }
    }

    // ================== UPLOAD MULTIPLE FILES ==================
    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("files") MultipartFile[] files,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtService.extractUsername(token);
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) return ResponseEntity.status(401).body("Không tìm thấy user");
    
            // Lưu ảnh
            String uploadDir = System.getProperty("user.dir") + "/uploads/articles/";
            File uploadPath = new File(uploadDir);
            if (!uploadPath.exists()) uploadPath.mkdirs();

            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile file : files) {
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                file.transferTo(new File(uploadDir + fileName));
                imageUrls.add("http://localhost:8080/uploads/articles/" + fileName);
            }

            // Tạo article
            Article article = new Article();
            article.setTitle(title);
            article.setDescription(description);
            article.setCreatedAt(LocalDateTime.now());

            // Chuyển List<String> sang JSON để lưu
            ObjectMapper mapper = new ObjectMapper();
            article.setImage(mapper.writeValueAsString(imageUrls));
            article.setUser(userOpt.get());

            Article saved = articleService.createArticle(article);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi khi upload article: " + e.getMessage());
        }
    }

    // ================== GENERATE BLOG PREVIEW ==================
    @PostMapping("/generateBlog/preview")
    public ResponseEntity<?> generateBlogPreview(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("prompt") String prompt,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtService.extractUsername(token);
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) return ResponseEntity.status(401).body("Không tìm thấy user");

            // Lưu tạm ảnh để trả preview
            String uploadDir = System.getProperty("user.dir") + "/uploads/temp/";
            File uploadPath = new File(uploadDir);
            if (!uploadPath.exists()) uploadPath.mkdirs();

            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile file : files) {
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                file.transferTo(new File(uploadDir + fileName));
                imageUrls.add("http://localhost:8080/uploads/temp/" + fileName);
            }

            String blogContent = callAiToGenerateBlog(prompt, files);

            Map<String,Object> result = new HashMap<>();
            result.put("title", "Blog từ AI");
            result.put("content", blogContent);
            result.put("images", imageUrls);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi khi generate preview: " + e.getMessage());
        }
    }

    // ================== SAVE GENERATED BLOG ==================
    @PostMapping("/generateBlog/save")
    public ResponseEntity<?> saveGeneratedBlog(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("images") String imagesJson, // FE gửi JSON string của List<String>
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtService.extractUsername(token);
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) return ResponseEntity.status(401).body("Không tìm thấy user");

            Article article = new Article();
            article.setTitle(title);
            article.setDescription(description);
            article.setCreatedAt(LocalDateTime.now());
            article.setImage(imagesJson);
            article.setUser(userOpt.get());

            Article saved = articleService.createArticle(article);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi khi lưu blog: " + e.getMessage());
        }
    }

    // ================== CALL GEMINI AI ==================
    private String callAiToGenerateBlog(String prompt, MultipartFile[] files) throws Exception {
        OkHttpClient client = new OkHttpClient();

        StringBuilder parts = new StringBuilder();
        parts.append("{\"text\": \"Bạn là blogger du lịch. Viết bài blog từ ảnh và yêu cầu: ")
                .append(prompt).append("\"}");

        for (MultipartFile file : files) {
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            parts.append(",{\"inlineData\": {\"mimeType\": \"")
                    .append(file.getContentType())
                    .append("\", \"data\": \"")
                    .append(base64Image)
                    .append("\"}}");
        }

        String json = "{ \"contents\": [{ \"parts\": [ " + parts + " ] }]}";

        RequestBody body = RequestBody.create(json, MediaType.get("application/json"));
        Request request = new Request.Builder()
                .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY)
                .post(body)
                .build();

        Response response = client.newCall(request).execute();
        String responseBody = response.body().string();

        try {
            JSONObject jsonObj = new JSONObject(responseBody);
            return jsonObj.getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text");
        } catch (Exception e) {
            return responseBody;
        }
    }

    // ================== DELETE ARTICLE ==================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable Long id) {
        try {
            articleService.deleteArticle(id);
            return ResponseEntity.ok("Đã xóa bài viết id: " + id);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Không thể xóa bài viết: " + id);
        }
    }

}
