package aptech.tripmate.specification;



import aptech.tripmate.DTO.SearchHotelReviewCriteria;
import aptech.tripmate.models.HotelReview;
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
public class HotelReviewSpecification {
    public static Specification<HotelReview> searchHotels(
            SearchHotelReviewCriteria request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

                  Join<Object, Object> userJoin = root.join(HotelReview.Fields.user, JoinType.LEFT);

                      if (StringUtils.isNotBlank(request.getCreatedBy())) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(userJoin.get(User.Fields.name)),
                        "%" + request.getCreatedBy().toLowerCase() + "%"));
            }
         

            if (StringUtils.isNotBlank(request.getComment())) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get(HotelReview.Fields.comment)),
                        "%" + request.getComment().toLowerCase() + "%"));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
    
}
