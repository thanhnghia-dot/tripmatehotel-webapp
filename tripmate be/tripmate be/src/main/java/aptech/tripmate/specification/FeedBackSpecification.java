package aptech.tripmate.specification;




import aptech.tripmate.DTO.SearchUserFeedBackItemCriteria;
import aptech.tripmate.models.FeedBack;
import aptech.tripmate.models.User;
import io.micrometer.common.util.StringUtils;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.experimental.UtilityClass;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;


@UtilityClass
public class FeedBackSpecification {
    public static Specification<FeedBack> searchFeedBack(
            SearchUserFeedBackItemCriteria request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

                  Join<Object, Object> userJoin = root.join(FeedBack.Fields.user, JoinType.LEFT);

                      if (StringUtils.isNotBlank(request.getUserName())) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(userJoin.get(User.Fields.name)),
                        "%" + request.getUserName().toLowerCase() + "%"));
            }
         

            if (StringUtils.isNotBlank(request.getContent())) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get(FeedBack.Fields.content)),
                        "%" + request.getContent().toLowerCase() + "%"));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
    
}
