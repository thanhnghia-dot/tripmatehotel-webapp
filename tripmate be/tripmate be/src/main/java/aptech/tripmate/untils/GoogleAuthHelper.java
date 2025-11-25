package aptech.tripmate.untils;

import com.google.auth.oauth2.GoogleCredentials;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;

public class GoogleAuthHelper {

    public static String getAccessToken() throws IOException {
        GoogleCredentials credentials = GoogleCredentials
                .fromStream(new FileInputStream("D:\\TKHAI\\tripmate-467608-6d8e7dfe1ae6.json"))
                .createScoped(List.of("https://www.googleapis.com/auth/generative-language"));

        credentials.refreshIfExpired();
        return credentials.getAccessToken().getTokenValue();
    }
}
