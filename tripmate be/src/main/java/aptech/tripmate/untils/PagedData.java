package aptech.tripmate.untils;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class PagedData<T> {

    private int pageNo;
    private int elementPerPage;
    private Long totalElements;
    private int totalPages;
    private List<T> elementList;


}

