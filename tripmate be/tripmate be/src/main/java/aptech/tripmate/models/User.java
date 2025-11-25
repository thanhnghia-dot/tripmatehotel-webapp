package aptech.tripmate.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldNameConstants;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldNameConstants

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @NotBlank
    private String name;

    @Email
    @NotBlank
    @Column(unique = true)
    private String email;

    @NotBlank
    @Column(unique = true)
    private String phone;
    private String avatar;
    @NotBlank
    private String password;

    @NotBlank
    private String address;

    @NotBlank
    private String gender;

    private String role;
    private LocalDate createdAt;

    @OneToMany(mappedBy = "user")
    @JsonIgnore // ⛔ Không trả trips khi serialize JSON
    private List<Trip> trips;

    @OneToMany(mappedBy = "user")
    @JsonIgnore // ⛔ Không trả payments khi serialize JSON
    private List<Payment> payments;

    @OneToMany(mappedBy = "user")
    @JsonIgnore // ⛔ Không trả articles khi serialize JSON
    private List<Article> articles;

    private boolean locked = false;

    @Column
    private LocalDateTime lockedAt;
}

