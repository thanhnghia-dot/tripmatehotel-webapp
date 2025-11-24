package aptech.tripmate.controllers;

import aptech.tripmate.DTO.CreatePaymentRequest;
import aptech.tripmate.models.Payment;
import aptech.tripmate.models.Room;
import aptech.tripmate.models.Trip;
import aptech.tripmate.models.User;
import aptech.tripmate.repositories.RoomRepository;
import aptech.tripmate.services.PaymentService;
import aptech.tripmate.services.RoomService;
import aptech.tripmate.services.TripService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final TripService tripService;
    private final RoomService roomService;
    private final RoomRepository roomRepository;

    public PaymentController(PaymentService paymentService, TripService tripService, RoomService roomService, RoomRepository roomRepository) {
        this.paymentService = paymentService;
        this.tripService = tripService;
        this.roomService = roomService;
        this.roomRepository = roomRepository;
    }


    @GetMapping("/{tripId}/total-amount")
    public ResponseEntity<Double> getTotalAmount(@PathVariable Long tripId) {
        Trip trip = tripService.findById(tripId);
        if (trip == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(trip.getTotalAmount());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Payment payment = paymentService.findById(id);
            payment.setStatus(status);
            paymentService.save(payment);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }





}
