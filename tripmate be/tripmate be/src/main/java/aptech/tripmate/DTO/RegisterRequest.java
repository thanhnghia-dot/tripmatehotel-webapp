package aptech.tripmate.DTO;

import lombok.Data;

import java.util.List;
@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String phone;
    private String password;
    private String address;
    private String gender;
    private List<String> roles;
    private String otp;

}
