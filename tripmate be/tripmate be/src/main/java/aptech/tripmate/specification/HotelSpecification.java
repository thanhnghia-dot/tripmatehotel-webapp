package aptech.tripmate.specification;



import aptech.tripmate.DTO.SearchHotelCreteria;
import aptech.tripmate.models.Hotel;
import io.micrometer.common.util.StringUtils;
import jakarta.persistence.criteria.Predicate;
import lombok.experimental.UtilityClass;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;


@UtilityClass
public class HotelSpecification {
    public static Specification<Hotel> searchHotels(
            SearchHotelCreteria request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.isNotBlank(request.getName())) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get(Hotel.Fields.name)),
                        "%" + request.getName().toLowerCase() + "%"));
            }

            if (StringUtils.isNotBlank(request.getAddress())) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get(Hotel.Fields.address)),
                        "%" + request.getAddress().toLowerCase() + "%"));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
    
}
