package aptech.tripmate.repositories;

import aptech.tripmate.models.HiddenMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HiddenMessageRepository extends JpaRepository<HiddenMessage, Long> {
    List<HiddenMessage> findByUserEmail(String userEmail);
    boolean existsByUserEmailAndMessageId(String userEmail, Long messageId);
}
