package aptech.tripmate.repositories;

import aptech.tripmate.models.Feel;
import aptech.tripmate.models.FeelLike;
import aptech.tripmate.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeelLikeRepository extends JpaRepository<FeelLike, Long> {
    boolean existsByUserAndFeel(User user, Feel feel);
    long countByFeel(Feel feel);
    void deleteByUserAndFeel(User user, Feel feel);
}
