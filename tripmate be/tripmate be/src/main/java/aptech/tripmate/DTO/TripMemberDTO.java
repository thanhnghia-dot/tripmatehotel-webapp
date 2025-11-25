package aptech.tripmate.DTO;

import aptech.tripmate.enums.MemberRole;
import aptech.tripmate.enums.MemberStatus;
import aptech.tripmate.models.TripMember;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TripMemberDTO {
    private Long id;
    private String email;
    private String name;
    private MemberStatus status;
    private MemberRole role;
    private Boolean isActive;
    public static TripMemberDTO fromEntity(TripMember member) {
        return TripMemberDTO.builder()
                .id(member.getId())
                .name(member.getUser() != null ? member.getUser().getName() : "Unknown")
                .email(member.getEmail())
                .role(member.getRole()) // ❗ Không dùng .name()
                .status(member.getStatus())   // ❗ Không dùng .name()
                .build();
    }
}
