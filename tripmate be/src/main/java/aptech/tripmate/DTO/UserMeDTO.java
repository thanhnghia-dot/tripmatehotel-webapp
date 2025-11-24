package aptech.tripmate.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserMeDTO {
    private Long userId;
    private String email;
    private String name;
    private String phone;
    private String gender;
    private String address;
}
