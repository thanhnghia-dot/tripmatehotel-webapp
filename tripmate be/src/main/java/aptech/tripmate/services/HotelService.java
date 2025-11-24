package aptech.tripmate.services;

import aptech.tripmate.DTO.*;
import aptech.tripmate.models.Hotel;
import aptech.tripmate.untils.PagedData;

import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

public interface HotelService {
    Long createHotel(HotelCreateRequestDTO hotel,MultipartFile file);

    void updateHotel(Long id, HotelCreateRequestDTO req, MultipartFile file);

    void deleteHotel(Long id);

    PagedData<SearchHotelResponseItem> searchHotels(SearchHotelCreteria creteria, Pageable pageable);
    List<HotelRatingComparisonDTO> getRecommendedHotelsByAddress(String address);
    List<Hotel> findHotelsWithAvailableRooms(LocalDateTime checkIn, LocalDateTime checkOut, String address);


}
