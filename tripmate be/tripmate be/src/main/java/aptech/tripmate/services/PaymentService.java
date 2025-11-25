package aptech.tripmate.services;

import aptech.tripmate.models.Payment;
import aptech.tripmate.repositories.PaymentRepository;
import aptech.tripmate.repositories.TripRepository;
import aptech.tripmate.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @Autowired
    public PaymentService(PaymentRepository paymentRepository,
                          TripRepository tripRepository,
                          UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }



    public Payment save(Payment payment) {
        return paymentRepository.save(payment);
    }

    public void updateStatus(Long id, String status) {
        Payment payment = paymentRepository.findById(id).orElseThrow(() -> new RuntimeException("Payment not found"));
        payment.setStatus(status);
        paymentRepository.save(payment);
    }

    public Payment findById(Long id) {
        return paymentRepository.findById(id).orElseThrow(() -> new RuntimeException("Payment not found"));
    }
}
