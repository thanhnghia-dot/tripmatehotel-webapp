package aptech.tripmate.repositories;

import aptech.tripmate.enums.ReviewType;
import aptech.tripmate.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import aptech.tripmate.models.FeedBack;

import java.util.List;

public interface FeedBackRepository extends JpaRepository<FeedBack, Long>, JpaSpecificationExecutor<FeedBack>{
    List<FeedBack> findByUser(User user);
    List<FeedBack> findByType(ReviewType type);
}
