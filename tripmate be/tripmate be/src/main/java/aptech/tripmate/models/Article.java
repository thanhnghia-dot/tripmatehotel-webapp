        package aptech.tripmate.models;

        import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
        import jakarta.persistence.*;
        import jakarta.validation.constraints.NotNull;
        import jakarta.validation.constraints.PastOrPresent;
        import lombok.AllArgsConstructor;
        import lombok.Data;
        import lombok.NoArgsConstructor;

        import java.time.LocalDateTime;
        import java.util.List;

        @Entity
        @Table(name = "articles")
        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public class Article {

            public enum ArticleStatus {
                PENDING, APPROVED, REJECTED
            }

            @Id
            @GeneratedValue(strategy = GenerationType.IDENTITY)
            private Long id;

            @NotNull(message = "Title is required")
            private String title;

            @Lob
            @Column(columnDefinition = "TEXT")
            @NotNull(message = "Description is required")
            private String description;

            // 🔹 Ảnh đại diện (dùng hiển thị trong Admin list)
            @Lob
            @Column(columnDefinition = "TEXT")
            private String image;

            @PastOrPresent
            private LocalDateTime createdAt;

            @ManyToOne(fetch = FetchType.LAZY)
            @JoinColumn(name = "user_id")
            @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
            private User user;

            @Enumerated(EnumType.STRING)
            @NotNull
            private ArticleStatus status = ArticleStatus.PENDING;

            private String rejectReason;

            // 🔹 Danh sách ảnh chi tiết (chỉ load khi click vào)
            @ElementCollection
            @CollectionTable(name = "article_images", joinColumns = @JoinColumn(name = "article_id"))
            @Column(name = "image_url", columnDefinition = "TEXT")
            private List<String> images;
        }
