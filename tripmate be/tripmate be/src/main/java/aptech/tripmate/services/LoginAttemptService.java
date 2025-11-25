package aptech.tripmate.services;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private final int MAX_ATTEMPT = 3;
    private final long LOCK_TIME_SECONDS = 30;

    private final Map<String, Integer> attemptsCache = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> lockTimeCache = new ConcurrentHashMap<>();

    public void loginFailed(String email) {
        int attempts = attemptsCache.getOrDefault(email, 0);
        attempts++;
        attemptsCache.put(email, attempts);

        if (attempts >= MAX_ATTEMPT) {
            lockTimeCache.put(email, LocalDateTime.now());
        }
    }

    public void loginSucceeded(String email) {
        attemptsCache.remove(email);
        lockTimeCache.remove(email);
    }

    public boolean isBlocked(String email) {
        if (!lockTimeCache.containsKey(email)) return false;

        LocalDateTime lockTime = lockTimeCache.get(email);
        if (lockTime.plusSeconds(LOCK_TIME_SECONDS).isBefore(LocalDateTime.now())) {
            lockTimeCache.remove(email);
            attemptsCache.remove(email);
            return false;
        }

        return true;
    }

    public int getRemainingAttempts(String email) {
        return MAX_ATTEMPT - attemptsCache.getOrDefault(email, 0);
    }

    public long getRemainingLockTime(String email) {
        LocalDateTime lockTime = lockTimeCache.get(email);
        if (lockTime == null) return 0;
        long secondsPassed = java.time.Duration.between(lockTime, LocalDateTime.now()).getSeconds();
        return Math.max(0, LOCK_TIME_SECONDS - secondsPassed);
    }
}
