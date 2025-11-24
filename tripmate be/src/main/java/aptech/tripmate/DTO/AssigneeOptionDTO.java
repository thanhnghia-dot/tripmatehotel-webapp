// AssigneeOptionDTO.java
package aptech.tripmate.DTO;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AssigneeOptionDTO {
    private Long userId;
    private String fullName;
    private boolean owner; // true nếu là creator
}
