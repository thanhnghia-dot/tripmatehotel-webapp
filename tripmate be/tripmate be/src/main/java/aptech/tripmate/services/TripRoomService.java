package aptech.tripmate.services;

import aptech.tripmate.DTO.CancelRequestDTO;
import aptech.tripmate.DTO.HotelStatsDTO;
import aptech.tripmate.models.*;
import aptech.tripmate.repositories.CancelRequestRepository;
import aptech.tripmate.repositories.RoomRepository;
import aptech.tripmate.repositories.TripRepository;
import aptech.tripmate.repositories.TripRoomRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripRoomService {

    private final JavaMailSender mailSender;
    private final TripRoomRepository tripRoomRepository;
    private final TripRepository tripRepository;
    private final RoomRepository roomRepository;
    private final CancelRequestRepository cancelRequestRepository;
    private final MailService mailService;

    public TripRoom findById(Long id) {
        return tripRoomRepository.findById(id).orElse(null);
    }
    public void sendBookingConfirmationEmail(Long tripRoomId) {
        // Lấy booking theo ID
        TripRoom tripRoom = tripRoomRepository.findById(tripRoomId)
                .orElseThrow(() -> new RuntimeException("❌ TripRoom not found: " + tripRoomId));

        // Nếu đã gửi email thì báo lỗi
        if (Boolean.TRUE.equals(tripRoom.getEmailSent())) {
            throw new RuntimeException("Email already sent for this booking");
        }

        // Lấy hotel từ phòng
        Hotel hotel = tripRoom.getRoom().getRoomType().getHotel();

        // Gửi email chỉ cho booking này
        sendEmailForHotel(tripRoom.getEmail(), hotel, List.of(tripRoom));

        // Đánh dấu đã gửi email
        tripRoom.setEmailSent(true);
        tripRoomRepository.save(tripRoom);
    }

    public Double getTotalRevenue() {
        List<TripRoom> bookings = tripRoomRepository.findAll();

        return bookings.stream().mapToDouble(tr -> {
            if (tr.getCheckIn() == null || tr.getCheckOut() == null || tr.getRoom() == null)
                return 0;

            long days = ChronoUnit.DAYS.between(
                    tr.getCheckIn().toLocalDate(),
                    tr.getCheckOut().toLocalDate()
            );
            if (days <= 0) days = 1;

            double priceToUse = (tr.getRoom().getFinalPrice() != null && tr.getRoom().getFinalPrice() > 0)
                    ? tr.getRoom().getFinalPrice()
                    : tr.getRoom().getPrice();
            return days * priceToUse;
        }).sum();
    }

    public void sendEmailForHotel(String email, Hotel hotel, List<TripRoom> tripRooms) {
        String guestName = tripRooms.get(0).getName(); // Tên người dùng giống nhau cho tất cả các phòng
        String roomName = tripRooms.get(0).getRoom().getRoomName();
        StringBuilder roomDetails = new StringBuilder();
        for (TripRoom tripRoom : tripRooms) {
            Room room = tripRoom.getRoom();
            RoomType roomType = room.getRoomType();
            String paypalCaptureId = "N/A";
            if (tripRoom.getPayments() != null && !tripRoom.getPayments().isEmpty()) {
                paypalCaptureId = tripRoom.getPayments().get(0).getPaypalCaptureId();
            }
            // ✅ Tính số đêm
            long nights = 0;
            if (tripRoom.getCheckIn() != null && tripRoom.getCheckOut() != null) {
                nights = ChronoUnit.DAYS.between(
                        tripRoom.getCheckIn().toLocalDate(),
                        tripRoom.getCheckOut().toLocalDate()
                );
                if (nights <= 0) nights = 1;
            }

            double pricePerNight = (room.getFinalPrice() != null && room.getFinalPrice() > 0)
                    ? room.getFinalPrice()
                    : room.getPrice();

            double totalPrice = pricePerNight * nights;


            roomDetails.append("<div style='margin-top:16px;'>")
                    .append("<p><strong>Booking Reference (Transaction ID):</strong> ").append(paypalCaptureId).append("</p>")

                    .append("</div>")
                    .append("<p><strong>Room Name:</strong> ").append(room.getRoomName()).append("</p>")
                    .append("<p><strong>Room Type:</strong> ").append(roomType.getTypeName()).append("</p>")
                    .append("<p><strong>Description:</strong> ").append(roomType.getDescription()).append("</p>")
                    .append("<p><strong>Price:</strong> ").append(String.format("%,.0f", pricePerNight)).append(" USD / night</p>")
                    .append("<p><strong>Number of Nights:</strong> ").append(nights).append("</p>")
                    .append("<p><strong>Total Price:</strong> <span style='color:#16a34a; font-weight:bold;'>")
                    .append(String.format("%,.0f", totalPrice)).append(" USD</span></p>")
                    .append("<p><strong>Capacity:</strong> ").append(room.getCapacity()).append(" guests</p>")
                    .append("<p><strong>Number of Beds:</strong> ").append(room.getNumberOfBeds()).append("</p>")
                    .append("<p><strong>Check-in:</strong> ").append(tripRoom.getCheckIn()).append("</p>")
                    .append("<p><strong>Check-out:</strong> ").append(tripRoom.getCheckOut()).append("</p>")
                    .append("<hr/>")
                    .append("</div>");
        }
        String mailContent =
                "<div style='font-family: Arial, sans-serif; font-size: 16px; color: #1f2937; background-color: #f3f4f6; padding: 24px;'>"
                        + "<div style='max-width: 650px; background-color: #ffffff; border-radius: 10px; margin: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 32px;'>"

                        // Tiêu đề
                        + "<h2 style='text-align: center; color: #2563eb; margin-bottom: 8px;'>Booking Confirmation</h2>"
                        + "<p style='text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 32px;'>Your payment has been successfully processed</p>"

                        // Chào khách
                        + "<p>Hello <strong>" + guestName + "</strong>,</p>"
                        + "<p>Thank you for booking with <strong>TripMate</strong>. We have received your payment for the room <strong>" + roomName + "</strong>. Below are your booking details at <strong>" + hotel.getName() + "</strong>:</p>"

                        + "<hr style='margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;'/>"

                        // Hotel info
                        + "<h3 style='color: #111827; margin-bottom: 8px;'>🏨 Hotel Information</h3>"
                        + "<p><strong>Hotel Name:</strong> " + hotel.getName() + "</p>"
                        + "<p><strong>Address:</strong> " + hotel.getAddress() + "</p>"
                        + "<p><strong>Star Rating:</strong> " + hotel.getStarRating() + " ⭐</p>"

                        // Room info
                        + "<h3 style='margin-top: 24px; color: #111827; margin-bottom: 8px;'>🛏️ Room(s) Information</h3>"
                        + roomDetails

                        // Cảm ơn + khung xanh
                        + "<div style='margin-top: 32px; background-color: #ecfdf5; padding: 20px; border-left: 4px solid #10b981; border-radius: 8px;'>"
                        + "<p style='color: #065f46; font-weight: bold; margin-bottom: 4px;'>✅ Payment Confirmed</p>"
                        + "<p style='color: #065f46;'>Thank you for your payment for <strong>" + roomName + "</strong>! We look forward to welcoming you and wish you a pleasant stay.</p>"
                        + "</div>"
                        + "<p style='color: #856404;'>If a room becomes available before 2:00 PM, we will call you at your provided contact number.</p>"
                        // Contact info
                        + "<p style='margin-top: 24px;'>If you have any questions, feel free to reach out at "
                        + "<a href='mailto:support@tripmate.com' style='color: #2563eb; text-decoration: none;'>support@tripmate.com</a>.</p>"

                        // Footer
                        + "<p style='margin-top: 40px; text-align: center; font-size: 13px; color: #6b7280;'>© 2025 TripMate. All rights reserved.</p>"
                        + "</div></div>";



        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("[TripMate] Booking Confirmation - " + hotel.getName());
            helper.setText(mailContent, true);

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("❌ Failed to send email.");
        }
    }

    public List<HotelStatsDTO> getHotelStatistics() {
        List<TripRoom> tripRooms = tripRoomRepository.findAll();

        // Filter out tripRooms with null room or roomType or hotel
        Map<Hotel, List<TripRoom>> roomsByHotel = tripRooms.stream()
                .filter(tr -> tr.getRoom() != null
                        && tr.getRoom().getRoomType() != null
                        && tr.getRoom().getRoomType().getHotel() != null)
                .collect(Collectors.groupingBy(tr -> tr.getRoom().getRoomType().getHotel()));

        return roomsByHotel.entrySet().stream().map(entry -> {
            Hotel hotel = entry.getKey();
            List<TripRoom> rooms = entry.getValue().stream()
                    .filter(tr -> !"CANCELLED".equalsIgnoreCase(tr.getStatus()))
                    .toList();


            int bookings = rooms.size();

            double revenue = rooms.stream().mapToDouble(tr -> {
                if (tr.getCheckIn() == null || tr.getCheckOut() == null || tr.getRoom() == null)
                    return 0;

                long days = ChronoUnit.DAYS.between(
                        tr.getCheckIn().toLocalDate(),
                        tr.getCheckOut().toLocalDate()
                );
                if (days <= 0) days = 1;

                double priceToUse = (tr.getRoom().getFinalPrice() != null && tr.getRoom().getFinalPrice() > 0)
                        ? tr.getRoom().getFinalPrice()
                        : tr.getRoom().getPrice();
                return days * priceToUse;
            }).sum();

            Double avgRating = hotel.getReviews().isEmpty()
                    ? null
                    : hotel.getReviews().stream()
                    .mapToInt(r -> r.getRating())
                    .average()
                    .orElse(0.0);

            String suggestion = "Stable performance";

// Kiểm tra điều kiện cơ bản về rating, bookings, revenue
            if (avgRating == null || avgRating < 3.5) {
                suggestion = "Improve room images and cleanliness";
            } else if (avgRating >= 4.5 && bookings > 20 && revenue > 15000) {
                suggestion = "Outstanding performance! Consider loyalty programs";
            } else if (avgRating >= 4.5 && bookings > 20) {
                suggestion = "Excellent! Keep up the great work";
            } else if (avgRating >= 4.2 && revenue > 12000) {
                suggestion = "Maintain quality, explore upselling options";
            } else if (avgRating >= 4 && revenue < 5000) {
                suggestion = "Focus on marketing to increase bookings";
            } else if (avgRating >= 4 && bookings < 10) {
                suggestion = "Great reviews! Promote to reach more guests";
            } else if (avgRating >= 3.5 && bookings < 5) {
                suggestion = "Increase promotional activities and offers";
            } else if (bookings >= 10 && revenue > 10000 && avgRating < 4) {
                suggestion = "High demand – prioritize guest satisfaction";
            } else if (revenue > 10000 && avgRating >= 4.3) {
                suggestion = "Consider slight price increase";
            } else if (revenue < 3000 && bookings < 5) {
                suggestion = "Revise pricing strategy and improve online presence";
            } else if (revenue >= 5000 && avgRating < 4) {
                suggestion = "Invest in service quality to boost reviews";
            } else if (bookings > 30 && avgRating >= 4.5) {
                suggestion = "Consider room expansion or package deals";
            } else if (bookings > 15 && avgRating < 4.0) {
                suggestion = "Guests are booking, but experience may need improvement";
            }

// --- Mới thêm: gợi ý giảm giá cho dịp lễ hoặc ít lượt đặt phòng ---
            LocalDate now = LocalDate.now();
            MonthDay currentMonthDay = MonthDay.from(now);

// Giả sử giảm giá cho các dịp lễ: 1/1, 30/4, 2/9, 25/12
            List<MonthDay> holidays = List.of(
                    MonthDay.of(1, 1),
                    MonthDay.of(4, 30),
                    MonthDay.of(9, 2),
                    MonthDay.of(12, 25)
            );

            if (bookings < 5) {
                suggestion += " Consider discount promotions to attract more guests.";
            }

            if (holidays.contains(currentMonthDay)) {
                suggestion += " Holiday season! Offering special discounts could boost bookings.";
            }

            return new HotelStatsDTO(
                    hotel.getId(),
                    hotel.getName(),
                    revenue,
                    bookings,
                    avgRating,
                    suggestion
            );
        }).toList();
    }


    public void sendPaymentReminderEmail(Long tripRoomId) {
        TripRoom tripRoom = tripRoomRepository.findById(tripRoomId)
                .orElseThrow(() -> new RuntimeException("TripRoom not found"));

        if ("paid".equalsIgnoreCase(tripRoom.getStatus())) {
            throw new RuntimeException("Booking already paid");
        }

        if (tripRoom.getEmail() == null || tripRoom.getEmail().isEmpty()) {
            throw new RuntimeException("No email to send reminder");
        }

        // nếu đã gửi reminder -> không gửi nữa
        if (tripRoom.getReminderSentAt() != null) {
            throw new RuntimeException("Reminder already sent");
        }

        // lưu thời gian reminder và cập nhật status
        tripRoom.setReminderSentAt(LocalDateTime.now()); // phải lưu
        tripRoom.setStatus("REMINDER_SENT");             // Lưu chữ hoa thống nhất
        tripRoomRepository.save(tripRoom);

        // gửi email
        Hotel hotel = tripRoom.getRoom() != null ? tripRoom.getRoom().getHotel() : null;
        String guestName = tripRoom.getName() != null ? tripRoom.getName() : "Guest";
        String hotelName = hotel != null ? hotel.getName() : "our hotel";
        String hotelAddress = hotel != null ? hotel.getAddress() : "";
        String roomName = tripRoom.getRoom() != null ? tripRoom.getRoom().getRoomName() : "";
        String checkInDate = tripRoom.getCheckIn() != null ? tripRoom.getCheckIn().toLocalDate().toString() : "";
        String checkOutDate = tripRoom.getCheckOut() != null ? tripRoom.getCheckOut().toLocalDate().toString() : "";

        String mailContent =
                "<div style='font-family: Arial, sans-serif; font-size: 16px; color: #1f2937; background-color: #f3f4f6; padding: 24px;'>"
                        + "<div style='max-width: 650px; background-color: #ffffff; border-radius: 10px; margin: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 32px;'>"
                        + "<h2 style='text-align: center; color: #ef4444; margin-bottom: 8px;'>Payment Reminder</h2>"
                        + "<p>Hello <strong>" + guestName + "</strong>,</p>"
                        + "<p>This is a friendly reminder that your booking at <strong>" + hotelName + "</strong> for room <strong>" + roomName + "</strong> "
                        + "with check-in date on <strong>" + checkInDate + "</strong> has not been paid yet.</p>"
                        + "<p>If you do not complete the payment within 30 minutes, we will automatically cancel your room. "
                        + "If you still want this room, please place a new booking.</p>"
                        + "<hr style='margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;'/>"
                        + "<h3 style='color: #111827; margin-bottom: 8px;'>🏨 Hotel Information</h3>"
                        + "<p><strong>Hotel Name:</strong> " + hotelName + "</p>"
                        + "<p><strong>Address:</strong> " + hotelAddress + "</p>"
                        + "<h3 style='margin-top: 24px; color: #111827; margin-bottom: 8px;'>🛏️ Room Information</h3>"
                        + "<p><strong>Room Name:</strong> " + roomName + "</p>"
                        + "<p><strong>Check-in:</strong> " + checkInDate + "</p>"
                        + "<p><strong>Check-out:</strong> " + checkOutDate + "</p>"
                        + "<div style='margin-top: 32px; background-color: #fee2e2; padding: 20px; border-left: 4px solid #dc2626; border-radius: 8px;'>"
                        + "<p style='color: #991b1b; font-weight: bold; margin-bottom: 4px;'>⚠️ Payment Pending</p>"
                        + "<p style='color: #991b1b;'>Please make your payment promptly to avoid cancellation of your booking.</p>"
                        + "</div>"
                        + "<p style='margin-top: 24px;'>If you have any questions, feel free to contact us at "
                        + "<a href='mailto:support@tripmate.com' style='color: #ef4444; text-decoration: none;'>support@tripmate.com</a>.</p>"
                        + "<p style='margin-top: 40px; text-align: center; font-size: 13px; color: #6b7280;'>© 2025 TripMate. All rights reserved.</p>"
                        + "</div></div>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(tripRoom.getEmail());
            helper.setSubject("Reminder: Please complete payment for your booking");
            helper.setText(mailContent, true); // true = HTML
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
    public void cancelBooking(Long tripRoomId) {
        TripRoom tripRoom = tripRoomRepository.findById(tripRoomId)
                .orElseThrow(() -> new RuntimeException("TripRoom not found"));

        if ("paid".equalsIgnoreCase(tripRoom.getStatus())) {
            throw new RuntimeException("Booking already paid, cannot cancel");
        }

        if ("cancelled".equalsIgnoreCase(tripRoom.getStatus())) {
            throw new RuntimeException("Booking already cancelled");
        }

        tripRoom.setStatus("CANCELLED"); // Viết hoa cho đồng bộ
        tripRoomRepository.save(tripRoom);




        // Build email content
        Hotel hotel = tripRoom.getRoom() != null ? tripRoom.getRoom().getHotel() : null;
        String guestName = tripRoom.getName() != null ? tripRoom.getName() : "Guest";
        String hotelName = hotel != null ? hotel.getName() : "our hotel";
        String hotelAddress = hotel != null ? hotel.getAddress() : "";
        String roomName = tripRoom.getRoom() != null ? tripRoom.getRoom().getRoomName() : "";
        String checkInDate = tripRoom.getCheckIn() != null ? tripRoom.getCheckIn().toLocalDate().toString() : "";
        String checkOutDate = tripRoom.getCheckOut() != null ? tripRoom.getCheckOut().toLocalDate().toString() : "";

        String mailContent =
                "<div style='font-family: Arial, sans-serif; font-size: 16px; color: #1f2937; background-color: #f3f4f6; padding: 24px;'>"
                        + "<div style='max-width: 650px; background-color: #ffffff; border-radius: 10px; margin: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 32px;'>"
                        + "<h2 style='text-align: center; color: #dc2626; margin-bottom: 8px;'>Booking Cancelled</h2>"
                        + "<p>Hello <strong>" + guestName + "</strong>,</p>"
                        + "<p>We regret to inform you that your booking at <strong>" + hotelName + "</strong> for room <strong>" + roomName + "</strong> "
                        + "with check-in date on <strong>" + checkInDate + "</strong> has been <span style='color:#dc2626;font-weight:bold;'>CANCELLED</span>.</p>"
                        + "<p>If you still wish to stay with us, please make a new booking via our website.</p>"
                        + "<hr style='margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;'/>"
                        + "<h3 style='color: #111827; margin-bottom: 8px;'>🏨 Hotel Information</h3>"
                        + "<p><strong>Hotel Name:</strong> " + hotelName + "</p>"
                        + "<p><strong>Address:</strong> " + hotelAddress + "</p>"
                        + "<h3 style='margin-top: 24px; color: #111827; margin-bottom: 8px;'>🛏️ Room Information</h3>"
                        + "<p><strong>Room Name:</strong> " + roomName + "</p>"
                        + "<p><strong>Check-in:</strong> " + checkInDate + "</p>"
                        + "<p><strong>Check-out:</strong> " + checkOutDate + "</p>"
                        + "<div style='margin-top: 32px; background-color: #fee2e2; padding: 20px; border-left: 4px solid #dc2626; border-radius: 8px;'>"
                        + "<p style='color: #991b1b; font-weight: bold; margin-bottom: 4px;'>❌ Booking Cancelled</p>"
                        + "<p style='color: #991b1b;'>Your booking has been cancelled due to unpaid status or manual cancellation.</p>"
                        + "</div>"
                        + "<p style='margin-top: 24px;'>If you have any questions, feel free to contact us at "
                        + "<a href='mailto:support@tripmate.com' style='color: #ef4444; text-decoration: none;'>support@tripmate.com</a>.</p>"
                        + "<p style='margin-top: 40px; text-align: center; font-size: 13px; color: #6b7280;'>© 2025 TripMate. All rights reserved.</p>"
                        + "</div></div>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(tripRoom.getEmail());
            helper.setSubject("Booking Cancelled - " + hotelName);
            helper.setText(mailContent, true); // true = HTML
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send cancel email: " + e.getMessage());
        }
    }
    @Transactional
    public void requestCancel(Long tripRoomId, String joinedReasons, String otherReason) {
        TripRoom tripRoom = tripRoomRepository.findById(tripRoomId)
                .orElseThrow(() -> new RuntimeException("TripRoom not found"));

        CancelRequest cancelRequest = new CancelRequest();
        cancelRequest.setTripRoom(tripRoom);
        cancelRequest.setUser(null); // nếu chưa có login thì để null
        cancelRequest.setReasons(joinedReasons);
        cancelRequest.setOtherReason(otherReason);
        cancelRequest.setStatus("PENDING");
        cancelRequest.setRequestedAt(LocalDateTime.now());

        cancelRequestRepository.save(cancelRequest);
    }
    public boolean isRoomAvailable(Long roomId, LocalDateTime desiredCheckIn, LocalDateTime desiredCheckOut) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        List<TripRoom> bookedRooms = tripRoomRepository.findByRoomAndCheckInBeforeAndCheckOutAfter(
                        room, desiredCheckOut, desiredCheckIn)
                .stream()
                .filter(tr -> !"CANCELLED".equalsIgnoreCase(tr.getStatus()))
                .collect(Collectors.toList());

        return bookedRooms.isEmpty();
    }

}
