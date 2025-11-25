//  VUONG HUU THANG - TAC GIA

package aptech.tripmate.services.checklist;

import aptech.tripmate.DTO.AssigneeOptionDTO;
import aptech.tripmate.DTO.checklist.*;
import aptech.tripmate.enums.checklist.ChecklistStatus;
import aptech.tripmate.models.*;
import aptech.tripmate.models.checklist.ChecklistItem;
import aptech.tripmate.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class ChecklistItemService {

    private final ChecklistItemRepository checklistItemRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripMemberRepository tripMemberRepository;

    /* ===================== Helpers ===================== */

    private static String readString(Object o, String... getters) {
        for (String g : getters) {
            try {
                Method m = o.getClass().getMethod(g);
                Object v = m.invoke(o);
                if (v != null) return v.toString();
            } catch (Exception ignored) {}
        }
        return null;
    }

    private static Integer readInteger(Object o, String... getters) {
        for (String g : getters) {
            try {
                Method m = o.getClass().getMethod(g);
                Object v = m.invoke(o);
                if (v instanceof Number n) return n.intValue();
            } catch (Exception ignored) {}
        }
        return null;
    }

    private static Long readLong(Object o, String... getters) {
        for (String g : getters) {
            try {
                Method m = o.getClass().getMethod(g);
                Object v = m.invoke(o);
                if (v instanceof Number n) return n.longValue();
            } catch (Exception ignored) {}
        }
        return null;
    }

    private Long currentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = (principal instanceof UserDetails)
                ? ((UserDetails) principal).getUsername()
                : String.valueOf(principal);
        return userRepository.findByEmail(email)
                .map(User::getUserId)
                .orElse(null);
    }

    @SuppressWarnings("unchecked")
    private List<ChecklistItem> repoListByTrip(Long tripId) {
        try {
            Method m = checklistItemRepository.getClass()
                    .getMethod("findByTrip_TripIdOrderByCreatedAtDesc", Long.class);
            return (List<ChecklistItem>) m.invoke(checklistItemRepository, tripId);
        } catch (Exception ignored) {}
        try {
            Method m = checklistItemRepository.getClass()
                    .getMethod("findByTripIdOrderByCreatedAtDesc", Long.class);
            return (List<ChecklistItem>) m.invoke(checklistItemRepository, tripId);
        } catch (Exception ignored) {}
        return new ArrayList<>();
    }

    @SuppressWarnings("unchecked")
    private List<ChecklistItem> repoListByTripAndAssignee(Long tripId, Long assigneeUserId) {
        try {
            Method m = checklistItemRepository.getClass()
                    .getMethod("findByTrip_TripIdAndAssigneeUserIdOrderByCreatedAtDesc", Long.class, Long.class);
            return (List<ChecklistItem>) m.invoke(checklistItemRepository, tripId, assigneeUserId);
        } catch (Exception ignored) {}
        try {
            Method m = checklistItemRepository.getClass()
                    .getMethod("findByTripIdAndAssigneeUserIdOrderByCreatedAtDesc", Long.class, Long.class);
            return (List<ChecklistItem>) m.invoke(checklistItemRepository, tripId, assigneeUserId);
        } catch (Exception ignored) {}
        return new ArrayList<>();
    }

    private long repoCountByTrip(Long tripId) {
        try {
            Method m = checklistItemRepository.getClass()
                    .getMethod("countByTrip_TripId", Long.class);
            Object v = m.invoke(checklistItemRepository, tripId);
            if (v instanceof Number n) return n.longValue();
        } catch (Exception ignored) {}
        try {
            Method m = checklistItemRepository.getClass()
                    .getMethod("countByTripId", Long.class);
            Object v = m.invoke(checklistItemRepository, tripId);
            if (v instanceof Number n) return n.longValue();
        } catch (Exception ignored) {}
        return 0L;
    }

    private String resolveName(Long userId) {
        if (userId == null) return null;
        return userRepository.findById(userId)
                .map(User::getName)
                .orElse("Unknown");
    }

    private void ensureTripActive(Trip trip) {
        if (trip.getEndDate() != null && trip.getEndDate().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Trip has already ended. Action not allowed.");
        }
        if (Boolean.TRUE.equals(trip.getIsFinished())) {
            throw new IllegalStateException("Trip is marked as finished. Action not allowed.");
        }
    }

    /* ========== 0) Assignee options cho dropdown ========== */
    @Transactional(readOnly = true)
    public List<AssigneeOptionDTO> assigneeOptions(Long tripId) {
        var members = tripMemberRepository.findByTrip_TripId(tripId);
        List<AssigneeOptionDTO> out = new ArrayList<>();
        for (TripMember tm : members) {
            if (tm.getUser() == null) continue;
            Long uid = tm.getUser().getUserId();
            String name = tm.getUser().getName();
            boolean owner = tm.getTrip() != null
                    && tm.getTrip().getUser() != null
                    && tm.getTrip().getUser().getUserId().equals(uid);
            out.add(AssigneeOptionDTO.builder()
                    .userId(uid)
                    .fullName(name)
                    .owner(owner)
                    .build());
        }
        out.sort((a, b) -> Boolean.compare(!a.isOwner(), !b.isOwner()));
        return out;
    }

    /* ========== 1) Add Item ========== */
    public ChecklistItemResponseDTO addItem(ChecklistItemCreateDTO dto) {
        Long tripId = readLong(dto, "getTripId");
        if (tripId == null) throw new IllegalArgumentException("tripId is required");

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        ensureTripActive(trip);

        String itemName = readString(dto, "getItemName", "getItenName", "getName");
        if (itemName == null || itemName.isBlank()) {
            throw new IllegalArgumentException("itemName is required");
        }

        Integer quantity = readInteger(dto, "getQuantity", "getQty");
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("quantity must be > 0");
        }

        Long assigneeUserId = readLong(dto, "getAssigneeUserId", "getAssigneeMemberId", "getAssigneeId");

        ChecklistItem item = ChecklistItem.builder()
                .tripId(tripId)
                .trip(trip)
                .itemName(itemName.trim())
                .quantity(quantity)
                .assigneeUserId(assigneeUserId)
                .status(ChecklistStatus.PENDING)
                .build();

        return toDTO(checklistItemRepository.save(item));
    }

    /* ========== 2) List Item ========== */
    @Transactional(readOnly = true)
    public List<ChecklistItemResponseDTO> listByTrip(Long tripId) {
        return repoListByTrip(tripId).stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<ChecklistItemResponseDTO> listByTripAndAssignee(Long tripId, Long assigneeUserId) {
        return repoListByTripAndAssignee(tripId, assigneeUserId).stream().map(this::toDTO).toList();
    }

    /* ========== 3) Update (price, status, deadline, costSource) ========== */
    public ChecklistItemResponseDTO updateItem(Long itemId, ChecklistItemUpdateDTO dto) {
        ChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        Trip trip = item.getTrip();
        ensureTripActive(trip);

        Long me = currentUserId();
        if (!Objects.equals(item.getAssigneeUserId(), me)) {
            throw new AccessDeniedException("You cannot edit this item.");
        }

        if (dto.getPrice() != null) {
            item.setPrice(dto.getPrice());
        }

        if (dto.getDeadline() != null) {
            item.setDeadline(dto.getDeadline());
        }

        if (dto.getStatus() != null) {
            item.setStatus(dto.getStatus());
            if (dto.getStatus() == ChecklistStatus.PURCHASED) {
                item.setTransferredFromUserId(null);

                // ✅ Trừ tiền trực tiếp vào trip.totalAmount
                if (dto.getPrice() != null) {
                    BigDecimal currentBudget = trip.getTotalAmount() != null
                            ? BigDecimal.valueOf(trip.getTotalAmount())
                            : BigDecimal.ZERO;
                    BigDecimal newBudget = currentBudget.subtract(dto.getPrice());
                    trip.setTotalAmount(newBudget.doubleValue());
                    tripRepository.save(trip);
                }
            }
        }

        if (dto.getCostSource() != null) {
            item.setCostSource(dto.getCostSource());
        }

        return toDTO(checklistItemRepository.save(item));
    }

    /* ========== 4) Member Table ========== */
    @Transactional(readOnly = true)
    public List<ChecklistMemberSummaryDTO> memberTable(Long tripId) {
        List<Object[]> rows;
        try {
            Method m = checklistItemRepository.getClass()
                    .getMethod("aggregateMemberCounts", Long.class);
            rows = (List<Object[]>) m.invoke(checklistItemRepository, tripId);
        } catch (Exception e) {
            rows = List.of();
        }

        List<ChecklistMemberSummaryDTO> out = new ArrayList<>();
        for (Object[] r : rows) {
            Long userId = r[0] == null ? null : ((Number) r[0]).longValue();
            long cnt = r[1] == null ? 0L : ((Number) r[1]).longValue();
            out.add(ChecklistMemberSummaryDTO.builder()
                    .userId(userId)
                    .fullName(resolveName(userId))
                    .itemCount(cnt)
                    .build());
        }
        return out;
    }

    /* ========== 5) Summary ========== */
    @Transactional(readOnly = true)
    public ChecklistFinancialSummaryDTO summary(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        BigDecimal spent = safeSum("sumTotalSpent", tripId);
        BigDecimal personal = safeSum("sumTotalPersonal", tripId);
        BigDecimal fund = safeSum("sumTotalFund", tripId);
        long totalItems = repoCountByTrip(tripId);

        long purchasedItems = checklistItemRepository.findAll().stream()
                .filter(i -> Objects.equals(i.getTripId(), tripId))
                .filter(i -> i.getStatus() != null && i.getStatus().name().equals("PURCHASED"))
                .count();

        BigDecimal budget = trip.getTotalAmount() != null
                ? BigDecimal.valueOf(trip.getTotalAmount())
                : BigDecimal.ZERO;

        return ChecklistFinancialSummaryDTO.builder()
                .totalItems(totalItems)
                .purchasedItems(purchasedItems)
                .totalSpent(spent)
                .totalPersonal(personal)
                .totalFund(fund)
                .budget(budget)
                .remainingBudget(budget.subtract(spent != null ? spent : BigDecimal.ZERO))
                .build();
    }

    private BigDecimal safeSum(String method, Long tripId) {
        try {
            Method m = checklistItemRepository.getClass().getMethod(method, Long.class);
            Object v = m.invoke(checklistItemRepository, tripId);
            return v instanceof BigDecimal bd ? bd : BigDecimal.ZERO;
        } catch (Exception ignored) {
            return BigDecimal.ZERO;
        }
    }

    /* ========== Mapper ========== */
    private ChecklistItemResponseDTO toDTO(ChecklistItem e) {
        return ChecklistItemResponseDTO.builder()
                .itemId(e.getItemId())
                .tripId(e.getTripId() != null ? e.getTripId()
                        : (e.getTrip() != null ? e.getTrip().getTripId() : null))
                .itemName(e.getItemName())
                .quantity(e.getQuantity())
                .assigneeUserId(e.getAssigneeUserId())
                .assigneeName(resolveName(e.getAssigneeUserId()))
                .price(e.getPrice())
                .deadline(e.getDeadline())
                .status(e.getStatus())
                .costSource(e.getCostSource())
                .transferredFromUserId(e.getTransferredFromUserId())
                .transferredFromName(resolveName(e.getTransferredFromUserId()))
                .build();
    }

    /* ========== 6) Transfer Item ========== */
    public ChecklistItemResponseDTO transferItem(Long itemId, Long newAssigneeId) {
        ChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        Trip trip = item.getTrip();
        ensureTripActive(trip);

        Long me = currentUserId();
        if (!Objects.equals(item.getAssigneeUserId(), me)) {
            throw new AccessDeniedException("You cannot transfer this item.");
        }

        item.setTransferredFromUserId(me);
        item.setAssigneeUserId(newAssigneeId);
        item.setStatus(ChecklistStatus.TRANSFERRED);

        return toDTO(checklistItemRepository.save(item));
    }

    @Transactional(readOnly = true)
    public List<MemberSummaryDTO> memberSummary(Long tripId) {
        List<Object[]> rows;
        try {
            rows = checklistItemRepository.aggregateMemberSummary(tripId);
        } catch (Exception e) {
            rows = List.of();
        }

        List<MemberSummaryDTO> out = new ArrayList<>();
        for (Object[] r : rows) {
            Long userId = r[0] == null ? null : ((Number) r[0]).longValue();
            long itemCount = r[1] == null ? 0L : ((Number) r[1]).longValue();
            long purchasedCount = r[2] == null ? 0L : ((Number) r[2]).longValue();
            BigDecimal spent = r[3] == null ? BigDecimal.ZERO : (BigDecimal) r[3];

            out.add(MemberSummaryDTO.builder()
                    .userId(userId)
                    .fullName(resolveName(userId))
                    .itemCount(itemCount)
                    .purchasedCount(purchasedCount)
                    .spent(spent)
                    .build());
        }
        return out;
    }

}
