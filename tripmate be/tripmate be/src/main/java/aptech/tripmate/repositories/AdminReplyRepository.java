package aptech.tripmate.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import aptech.tripmate.models.ReviewReply;

public interface AdminReplyRepository extends JpaRepository<ReviewReply, Long>{

}
