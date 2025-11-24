package aptech.tripmate.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class OtpService {
    private final MailService mailService;

    // Lưu email -> OtpInfo (gồm code và expiryTime)
    private final Map<String, OtpInfo> otpStore = new ConcurrentHashMap<>();

    public void generateOtp(String email) {
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        // ✅ OTP sống trong 3 phút
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(3);
        otpStore.put(email, new OtpInfo(otp, expiryTime));

        String subject = "🔐 TripMate - OTP Verification Code";

        String content = String.format("""
        Dear User,

        You have requested to verify your email address on TripMate.

        👉 Your One-Time Password (OTP) is: %s

        This code will expire in 3 minutes, so please use it to complete your verification as soon as possible.

        If you did not request this OTP, please ignore this message.

        Best regards,
        TripMate Team
        """, otp);

        mailService.sendChecklistEmail(email, subject, content);
    }

    public boolean validateOtp(String email, String otp) {
        OtpInfo otpInfo = otpStore.get(email);
        if (otpInfo == null) return false;

        // ❌ Nếu hết hạn thì xóa luôn và trả false
        if (LocalDateTime.now().isAfter(otpInfo.expiryTime)) {
            otpStore.remove(email);
            return false;
        }

        return otpInfo.code.equals(otp);
    }

    public void clearOtp(String email) {
        otpStore.remove(email);
    }

    // class con để lưu OTP và thời gian hết hạn
    private static class OtpInfo {
        private final String code;
        private final LocalDateTime expiryTime;

        public OtpInfo(String code, LocalDateTime expiryTime) {
            this.code = code;
            this.expiryTime = expiryTime;
        }
    }
}
