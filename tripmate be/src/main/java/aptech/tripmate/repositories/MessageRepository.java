package aptech.tripmate.repositories;

import aptech.tripmate.models.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByTripIdOrderByCreatedAtAsc(Long tripId);
    void deleteByTripId(Long tripId); // Xóa toàn bộ tin nhắn theo tripId
    Optional<Message> findByIdAndTripId(Long id, Long tripId);
}