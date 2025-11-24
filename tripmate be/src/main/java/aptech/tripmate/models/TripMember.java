package aptech.tripmate.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import aptech.tripmate.enums.MemberRole;
import aptech.tripmate.enums.MemberStatus;

@Entity
@Table(name = "trip_member")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripMember {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   @Column(name = "member_id")
   private Long id;

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "trip_id", nullable = false)
   private Trip trip;

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "user_id", nullable = true)
   private User user;

   private String email;

   @Enumerated(EnumType.STRING)
   @Column(length = 20)
   private MemberStatus status; // INVITED, ACCEPTED, PENDING , DECLINE

   @Enumerated(EnumType.STRING)
   private MemberRole role; // OWNER, MEMBER

   private LocalDateTime createdAt = LocalDateTime.now();
   @Column(name = "is_active", nullable = false)
   private Boolean isActive = true; // mặc định active
}
