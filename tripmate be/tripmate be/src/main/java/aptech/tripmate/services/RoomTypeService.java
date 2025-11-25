package aptech.tripmate.services;

import aptech.tripmate.DTO.RoomTypeDTO;
import aptech.tripmate.models.RoomType;
import aptech.tripmate.repositories.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoomTypeService{
private final RoomTypeRepository roomTypeRepository;

    public RoomTypeDTO getRoomTypeDetails(Long id) {
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RoomType not found"));

        // Dùng constructor đã có sẵn trong DTO
        return new RoomTypeDTO(roomType);
    }
}
