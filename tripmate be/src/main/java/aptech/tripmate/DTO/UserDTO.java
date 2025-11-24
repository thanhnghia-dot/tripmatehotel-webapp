package aptech.tripmate.DTO;

import aptech.tripmate.models.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder // ✅ THÊM DÒNG NÀY
public class UserDTO {
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String gender;
    private String role;
    private boolean locked;

    public static UserDTO fromEntity(User user) {
        return UserDTO.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .gender(user.getGender())
                .role(user.getRole())
                .locked(user.isLocked())
                .build();
    }
}

