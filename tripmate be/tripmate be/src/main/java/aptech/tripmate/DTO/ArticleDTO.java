package aptech.tripmate.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleDTO {
    private Long id;
    private String title;
    private String description;
    private String image;
    private LocalDateTime createdAt;
    private String status;
    private String rejectReason;
    private String userName;
    private String userEmail;
}
