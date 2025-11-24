package aptech.tripmate.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import aptech.tripmate.models.FeedbackReply;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackReplyRepository extends JpaRepository<FeedbackReply, Long> {

}
