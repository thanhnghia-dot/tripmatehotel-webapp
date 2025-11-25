package aptech.tripmate.controllers;

import aptech.tripmate.repositories.HotelRepository;
import aptech.tripmate.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/partner")
@CrossOrigin(origins = "http://localhost:3000")
public class PartnerDashboardController {
    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    // ✅ Tổng số khách sạn
    @GetMapping("/total-hotels")
    public Long getTotalHotels() {
        return hotelRepository.count();
    }


    @GetMapping("/total-rooms")
    public Long getTotalRooms() {
        return roomRepository.count();
    }



}
