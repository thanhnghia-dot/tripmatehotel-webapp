package aptech.tripmate.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "hidden_messages")
@Getter
@Setter
public class HiddenMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail; // Ai ẩn
    private Long messageId;   // Ẩn tin nhắn nào
}