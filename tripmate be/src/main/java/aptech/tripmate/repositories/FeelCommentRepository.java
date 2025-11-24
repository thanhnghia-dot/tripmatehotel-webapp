package aptech.tripmate.repositories;

import aptech.tripmate.models.FeelComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeelCommentRepository extends JpaRepository<FeelComment, Long> {
    long countByUser_UserId(Long userId);
}
