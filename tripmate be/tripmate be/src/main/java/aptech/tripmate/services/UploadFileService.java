package aptech.tripmate.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class UploadFileService {

    @Value("${upload.folder}")
    private String uploadFolder;

    public static final String rootUrl = "http://localhost:8080";

    public String storeImage(String subFolder, MultipartFile file) throws IOException {
        String exactFolderPath = uploadFolder + File.separator + subFolder;
        File directory = new File(exactFolderPath);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Tạo tên file mới để tránh trùng
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path destination = Paths.get(exactFolderPath + File.separator + fileName);
        Files.copy(file.getInputStream(), destination);

        // Trả về URL public để frontend hiển thị
        return rootUrl + "/uploads/" + subFolder + "/" + fileName;
    }

    public void deleteImage(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        Files.deleteIfExists(path);
    }

    public void clearImage(String fileUrl) throws IOException {
        if (fileUrl == null || fileUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("URL file cannot be empty");
        }
        
        String relativePath = fileUrl.replace(rootUrl + "/uploads/", "");
        String fullPath = uploadFolder + File.separator + relativePath;

        Path path = Paths.get(fullPath);
        Files.deleteIfExists(path);
    }
}
