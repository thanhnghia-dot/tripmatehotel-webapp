// // Hau

// package aptech.tripmate.services;

// import aptech.tripmate.DTO.ChecklistItemCreateDTO;
// import aptech.tripmate.DTO.ChecklistItemDTO;
// import aptech.tripmate.DTO.ChecklistItemRequestDTO;
// import aptech.tripmate.DTO.ChecklistItemResponseDTO;
// import aptech.tripmate.models.ChecklistItem;
// import aptech.tripmate.models.Trip;
// import aptech.tripmate.models.User;
// import aptech.tripmate.repositories.ChecklistItemRepository;
// import aptech.tripmate.repositories.TripRepository;
// import aptech.tripmate.repositories.UserRepository;
// import lombok.RequiredArgsConstructor;
// import org.springframework.stereotype.Service;

// import java.util.List;
// import java.util.NoSuchElementException;
// import java.util.Optional;
// import java.util.stream.Collectors;

// @Service
// @RequiredArgsConstructor
// public class ChecklistItemService {

//     private final ChecklistItemRepository checklistItemRepository;
//     private final TripRepository tripRepository;
//     private final UserRepository userRepository;
//     private final ChecklistItemRepository checklistRepository;
//     private final MailService mailService;


//     public ChecklistItemDTO toggleChecked(Long itemId) {
//         ChecklistItem item = checklistItemRepository.findById(itemId)
//                 .orElseThrow(() -> new NoSuchElementException("Checklist item not found"));

//         item.setChecked(!item.isChecked());
//         ChecklistItem updated = checklistItemRepository.save(item);
//         return toDTO(updated);
//     }

//     public List<ChecklistItemDTO> getChecklistDTOsByTripId(Long tripId) {
//         Optional<Trip> tripOptional = tripRepository.findById(tripId);
//         if (tripOptional.isEmpty()) return List.of();

//         List<ChecklistItem> items = checklistItemRepository.findByTrip(tripOptional.get());

//         return items.stream()
//                 .map(item -> {
//                     ChecklistItemDTO dto = new ChecklistItemDTO();
//                     dto.setItemId(item.getItemId());
//                     dto.setName(item.getName());
//                     dto.setChecked(item.isChecked());
//                     dto.setSuggestedByAi(item.isSuggestedByAi());
//                     if (item.getAssignedTo() != null) {
//                         dto.setAssignedToName(item.getAssignedTo().getName());
//                         dto.setAssignedToEmail(item.getAssignedTo().getEmail());
//                     }
//                     return dto;
//                 })
//                 .collect(Collectors.toList());
//     }

//     public void sendChecklistByEmail(Long tripId, String email) {
//         Trip trip = tripRepository.findById(tripId)
//                 .orElseThrow(() -> new RuntimeException("Trip not found"));

//         List<ChecklistItem> checklistItems = checklistItemRepository.findByTrip_TripId(tripId);

//         String subject = "Checklist chuyến đi: " + trip.getName();

//         StringBuilder content = new StringBuilder();
//         content.append("\uD83D\uDCCB Checklist chuẩn bị chuyến đi: ").append(trip.getName()).append(":\n\n");

//         for (ChecklistItem item : checklistItems) {
//             content.append("- ").append(item.getName());
//             if (Boolean.TRUE.equals(item.isChecked())) {
//                 content.append(" ✅");
//             }
//             content.append("\n");
//         }

//         mailService.sendChecklistEmail(email, subject, content.toString());
//     }

//     public Long addItem(ChecklistItemCreateDTO dto) {
//     Trip trip = tripRepository.findById(dto.getTripId())
//         .orElseThrow(() -> new NoSuchElementException("Trip not found with ID: " + dto.getTripId()));

//     ChecklistItem item = new ChecklistItem();
//     item.setTrip(trip);
//     item.setName(dto.getName());
//     item.setChecked(dto.isChecked());
//     item.setSuggestedByAi(dto.isSuggestedByAi());
//     if (dto.getAssignedToUserId() != null) {
//         User user = userRepository.findById(dto.getAssignedToUserId())
//             .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + dto.getAssignedToUserId()));
//         item.setAssignedTo(user);
//     }

//      var items = checklistItemRepository.save(item);
//      return items.getItemId();
//     }


//     public ChecklistItemDTO updateItemDTO(Long itemId, ChecklistItemDTO dto) {
//         ChecklistItem item = checklistItemRepository.findById(itemId)
//             .orElseThrow(() -> new NoSuchElementException("Checklist item not found"));

//         item.setName(dto.getName());
//         item.setChecked(dto.isChecked());
//         item.setSuggestedByAi(dto.isSuggestedByAi());

//         if (dto.getAssignedToEmail() != null) {
//             User user = userRepository.findByEmail(dto.getAssignedToEmail())
//                 .orElseThrow(() -> new NoSuchElementException("Assigned user not found"));
//             item.setAssignedTo(user);
//         } else {
//             item.setAssignedTo(null);
//         }

//         ChecklistItem updated = checklistItemRepository.save(item);
//         return toDTO(updated);
//     }


//     public void deleteItem(Long itemId) {
//         checklistRepository.deleteById(itemId);
//     }

//     public ChecklistItemDTO toDTO(ChecklistItem item) {
//         ChecklistItemDTO dto = new ChecklistItemDTO();
//         dto.setItemId(item.getItemId());
//         dto.setName(item.getName());
//         dto.setChecked(item.isChecked());
//         dto.setSuggestedByAi(item.isSuggestedByAi());

//         if (item.getAssignedTo() != null) {
//             dto.setAssignedToName(item.getAssignedTo().getEmail());
//         }
//         return dto;
//     }


// }    

