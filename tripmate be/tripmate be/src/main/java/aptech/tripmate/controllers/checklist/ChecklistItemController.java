//  VUONG HUU THANG - TAC GIA

package aptech.tripmate.controllers.checklist;

import aptech.tripmate.DTO.AssigneeOptionDTO;
import aptech.tripmate.DTO.checklist.*;
import aptech.tripmate.services.checklist.ChecklistItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklist-items")
@RequiredArgsConstructor
public class ChecklistItemController {

    private final ChecklistItemService checklistItemService;

    // ✅ Add Item
    @PostMapping
    public ResponseEntity<ChecklistItemResponseDTO> addItem(@RequestBody ChecklistItemCreateDTO dto) {
        return ResponseEntity.ok(checklistItemService.addItem(dto));
    }

    // ✅ Get all items by trip
    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<ChecklistItemResponseDTO>> listByTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(checklistItemService.listByTrip(tripId));
    }

    // ✅ Get items by trip & assignee
    @GetMapping("/trip/{tripId}/assignee/{userId}")
    public ResponseEntity<List<ChecklistItemResponseDTO>> listByTripAndAssignee(
            @PathVariable Long tripId,
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(checklistItemService.listByTripAndAssignee(tripId, userId));
    }

    // ✅ Assignee dropdown (TripMember, gồm cả creator)
    @GetMapping("/trip/{tripId}/assignees")
    public ResponseEntity<List<AssigneeOptionDTO>> assignees(@PathVariable Long tripId) {
        return ResponseEntity.ok(checklistItemService.assigneeOptions(tripId));
    }

    // ✅ Update item
    @PutMapping("/{itemId}")
    public ResponseEntity<ChecklistItemResponseDTO> updateItem(
            @PathVariable Long itemId,
            @RequestBody ChecklistItemUpdateDTO dto
    ) {
        return ResponseEntity.ok(checklistItemService.updateItem(itemId, dto));
    }

    // ✅ Member Table
    @GetMapping("/trip/{tripId}/members")
    public ResponseEntity<List<ChecklistMemberSummaryDTO>> memberTable(@PathVariable Long tripId) {
        return ResponseEntity.ok(checklistItemService.memberTable(tripId));
    }

    // ✅ Member Summary
    @GetMapping("/trip/{tripId}/members/summary")
    public ResponseEntity<List<MemberSummaryDTO>> memberSummary(@PathVariable Long tripId) {
        return ResponseEntity.ok(checklistItemService.memberSummary(tripId));
    }

    // ✅ Summary
    @GetMapping("/trip/{tripId}/summary")
    public ResponseEntity<ChecklistFinancialSummaryDTO> summary(@PathVariable Long tripId) {
        return ResponseEntity.ok(checklistItemService.summary(tripId));
    }

    // ✅ Transfer item
    @PutMapping("/{itemId}/transfer")
    public ResponseEntity<ChecklistItemResponseDTO> transferItem(
            @PathVariable Long itemId,
            @RequestBody ChecklistTransferDTO dto
    ) {
        return ResponseEntity.ok(
                checklistItemService.transferItem(itemId, dto.getNewAssigneeUserId())
        );
    }
}
