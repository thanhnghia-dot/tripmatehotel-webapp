package aptech.tripmate.controllers;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    // 🔑 Thay bằng API Key thật của bạn
    private final String GEMINI_API_KEY = "AIzaSyAnU89Fgi339AXuWehFxbcWVA-mrGALdB0";

    @PostMapping("/generate-blog")
    public ResponseEntity<?> generateBlog(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("prompt") String prompt,
            @RequestParam(value = "lang", defaultValue = "vi") String lang) {
        try {
            // 1) prompt cơ bản theo ngôn ngữ
            String blogPrompt;
            if ("en".equals(lang)) {
                blogPrompt =
                        "You are a creative travel blogger. Based on the uploaded photos and the user prompt, " +
                                "write a full blog post with:\n" +
                                "- Title (<= 15 words)\n" +
                                "- Introduction paragraph\n" +
                                "- Body: several paragraphs describing the photos and story (>= 400 words total)\n" +
                                "- Conclusion paragraph\n" +
                                "- 5 relevant hashtags (space separated)\n\n" +
                                "Return only plain text in EXACT format:\n" +
                                "Title: <...>\n\nIntroduction: <...>\n\nBody: <...>\n\nConclusion: <...>\n\nHashtags: <#... #...>";
            } else {
                blogPrompt =
                        "Bạn là một blogger du lịch sáng tạo. Dựa trên các ảnh được tải lên và yêu cầu người dùng, " +
                                "hãy viết một bài blog hoàn chỉnh với:\n" +
                                "- Tiêu đề (<= 15 từ)\n" +
                                "- Mở đầu: đoạn giới thiệu hấp dẫn\n" +
                                "- Thân bài: nhiều đoạn văn mô tả chi tiết ảnh và câu chuyện (tối thiểu 400 từ)\n" +
                                "- Kết luận\n" +
                                "- 5 hashtag liên quan, cách nhau bằng khoảng trắng\n\n" +
                                "Trả về đúng định dạng plain text:\n" +
                                "Tiêu đề: <...>\n\nMở đầu: <...>\n\nThân bài: <...>\n\nKết luận: <...>\n\nHashtags: <#... #...>";
            }

            // 2) Build JSON
            JSONArray parts = new JSONArray();
            // text
            parts.put(new JSONObject().put("text", blogPrompt + "\n\nNgười dùng yêu cầu thêm: " + prompt));
            // ảnh
            for (MultipartFile file : files) {
                String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
                JSONObject inlineData = new JSONObject()
                        .put("mimeType", file.getContentType())
                        .put("data", base64Image);
                parts.put(new JSONObject().put("inlineData", inlineData));
            }

            JSONObject content = new JSONObject().put("parts", parts);
            JSONObject requestJson = new JSONObject().put("contents", new JSONArray().put(content));

            // 3) Gửi request với timeout
            OkHttpClient client = new OkHttpClient.Builder()
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .writeTimeout(60, TimeUnit.SECONDS)
                    .readTimeout(60, TimeUnit.SECONDS)
                    .build();

            RequestBody body = RequestBody.create(
                    requestJson.toString(),
                    MediaType.parse("application/json")
            );
            Request request = new Request.Builder()
                    .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY)
                    .post(body)
                    .build();

            Response response = null;
            String responseBody = null;

            // Retry tối đa 3 lần nếu lỗi timeout hoặc 503
            for (int i = 0; i < 3; i++) {
                try {
                    response = client.newCall(request).execute();
                    responseBody = response.body().string();
                    if (response.isSuccessful()) break; // thành công thì thoát vòng lặp
                    if (response.code() == 503) {
                        Thread.sleep(3000); // chờ 3s rồi thử lại
                    } else {
                        break; // lỗi khác thì thoát
                    }
                } catch (java.net.SocketTimeoutException e) {
                    Thread.sleep(3000); // chờ 3s rồi thử lại
                }
            }

            if (responseBody == null) {
                return ResponseEntity.status(500).body("AI Blog Error:No response received from Gemini");
            }

            System.out.println("🔹 Blog AI raw: " + responseBody);

            // 4) lấy text trả về
            String aiText;
            try {
                JSONObject jsonObj = new JSONObject(responseBody);
                aiText = jsonObj
                        .getJSONArray("candidates").getJSONObject(0)
                        .getJSONObject("content").getJSONArray("parts")
                        .getJSONObject(0).getString("text");
            } catch (Exception ex) {
                aiText = responseBody;
            }

            return ResponseEntity.ok(aiText.trim());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("AI Blog Error: " + e.getMessage());
        }
    }
}
