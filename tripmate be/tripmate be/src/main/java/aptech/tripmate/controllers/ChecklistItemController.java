// package aptech.tripmate.controllers;

// import aptech.tripmate.DTO.ChecklistItemCreateDTO;
// import aptech.tripmate.DTO.ChecklistItemDTO;
// import aptech.tripmate.DTO.ChecklistItemRequestDTO;
// import aptech.tripmate.models.ChecklistItem;
// import aptech.tripmate.services.ChecklistItemService;
// import lombok.Data;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;

// @RestController
// @RequestMapping("/api/checklists")
// @RequiredArgsConstructor
// public class ChecklistItemController {

//     private final ChecklistItemService checklistItemService;

//     @PatchMapping("/{itemId}/toggle-checked")
//     public ResponseEntity<ChecklistItemDTO> toggleChecklistItemChecked(@PathVariable Long itemId) {
//         try {
//             ChecklistItemDTO updated = checklistItemService.toggleChecked(itemId);
//             return ResponseEntity.ok(updated);
//         } catch (Exception e) {
//             e.printStackTrace();
//             return ResponseEntity.status(500).body(null);
//         }
//     }

//     @PostMapping
//     public ResponseEntity<Long> createChecklistItem(@RequestBody ChecklistItemCreateDTO dto) {
//         try {
//             Long itemId = checklistItemService.addItem(dto);
//             return ResponseEntity.ok(itemId);
//         } catch (Exception e) {

//             e.printStackTrace();
//             return ResponseEntity.status(500).body(null);
//         }
//     }

//     @GetMapping("/trip/{tripId}")
//     public ResponseEntity<List<ChecklistItemDTO>> getChecklistForTrip(@PathVariable Long tripId) {
//         List<ChecklistItemDTO> items = checklistItemService.getChecklistDTOsByTripId(tripId);
//         return ResponseEntity.ok(items);
//     }

//     @PutMapping("/{itemId}")
//     public ResponseEntity<ChecklistItemDTO> updateChecklistItem(@PathVariable Long itemId,
//             @RequestBody ChecklistItemDTO dto) {
//         ChecklistItemDTO updated = checklistItemService.updateItemDTO(itemId, dto);
//         return ResponseEntity.ok(updated);
//     }

//     @DeleteMapping("/{itemId}")
//     public ResponseEntity<Void> deleteChecklistItem(@PathVariable Long itemId) {
//         checklistItemService.deleteItem(itemId);
//         return ResponseEntity.noContent().build();
//     }

//     @PostMapping("/share")
//     public ResponseEntity<String> shareChecklist(@RequestBody ShareChecklistRequest request) {
//         checklistItemService.sendChecklistByEmail(request.getTripId(), request.getEmail());
//         return ResponseEntity.ok("Checklist sent successfully");
//     }

//     @Data
//     public static class ShareChecklistRequest {
//         private Long tripId;
//         private String email;
//     }
// }
