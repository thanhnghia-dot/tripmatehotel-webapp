package aptech.tripmate.DTO.checklist;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChecklistMemberSummaryDTO {
    private Long userId;
    private String fullName;  // dùng resolveName(userId) => User.getName()
    private Long itemCount;
}
