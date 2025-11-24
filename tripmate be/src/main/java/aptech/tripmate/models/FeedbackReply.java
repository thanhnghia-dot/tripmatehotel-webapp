package aptech.tripmate.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import aptech.tripmate.enums.ReviewType;

@Entity
@Table(name = "feedback_reply")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FeedbackReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "feedback_id", nullable = false)
    private FeedBack feedback;

    @Column(name = "reply", columnDefinition = "TEXT", nullable = false)
    private String reply;

    @Column(name = "replied_by", nullable = false)
    private String repliedBy;

    @Column(name = "replied_at", nullable = false)
    private LocalDateTime repliedAt = LocalDateTime.now();
}
