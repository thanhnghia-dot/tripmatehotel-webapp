package aptech.tripmate.repositories;

import aptech.tripmate.models.Feel;
import aptech.tripmate.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeelRepository extends JpaRepository<Feel, Long> {
    List<Feel> findAllByOrderByCreatedAtDesc();
    List<Feel> findByUserOrderByCreatedAtDesc(User user);
    List<Feel> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
    long countByUser_UserId(Long userId);



}