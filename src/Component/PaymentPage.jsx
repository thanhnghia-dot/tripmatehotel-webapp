import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PayPalCheckout from "./PayPalCheckout";
import axios from "axios";
import { toast } from "react-toastify";
import "./PaymentPage.css"; // Thêm CSS mới

function PaymentPage({ token }) {
  const navigate = useNavigate();
  const location = useLocation();

  let bookings = location.state?.bookings || location.state?.booking;
  if (bookings && !Array.isArray(bookings)) {
    bookings = [bookings];
  }

  const [rooms, setRooms] = useState([]);
  const [totalAmount, setTotalAmount] = useState("0.00");
const calculateOriginalPrice = (room, booking) => {
  if (!room || !booking?.checkIn || !booking?.checkOut) return 0;
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  if (isNaN(checkIn) || isNaN(checkOut)) return 0;

  const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
  return (room.price || 0) * nights;
};

const calculateBookingPrice = (room, booking) => {
  if (!room || !booking?.checkIn || !booking?.checkOut) return 0;
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  if (isNaN(checkIn) || isNaN(checkOut)) return 0;

  const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
  
  // ✅ Ưu tiên finalPrice nếu có, fallback về price
  const basePrice = room.finalPrice && room.finalPrice > 0 ? room.finalPrice : room.price;

  return (basePrice || 0) * nights;
};

  useEffect(() => {
    if (!bookings || bookings.length === 0) return;

    const fetchRooms = async () => {
      try {
        const fetchedRooms = await Promise.all(
          bookings.map(async (bk) => {
            if (bk.room) return bk.room;
            const res = await axios.get(`http://localhost:8080/api/rooms/${bk.roomId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
          })
        );
        setRooms(fetchedRooms);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin phòng:", error);
        toast.error("Lỗi khi lấy thông tin phòng.");
      }
    };

    fetchRooms();
  }, [bookings, token]);

  useEffect(() => {
    if (!rooms.length || !bookings) {
      setTotalAmount("0.00");
      return;
    }
    let total = 0;
    for (let i = 0; i < bookings.length; i++) {
      total += calculateBookingPrice(rooms[i], bookings[i]);
    }
    setTotalAmount(total.toFixed(2));
  }, [rooms, bookings]);

  if (!bookings || bookings.length === 0) {
    return <div className="payment-container">No booking data for payment.</div>;
  }

  const price = parseFloat(totalAmount);

  const handleSuccess = async ({ orderId }) => {
  if (!price || price <= 0) {
    toast.error("Invalid payment amount.");
    return;
  }

  try {
    for (let i = 0; i < bookings.length; i++) {
      const bk = bookings[i];
      const roomPrice = calculateBookingPrice(rooms[i], bk);

      if (!bk.tripRoomId) {
        toast.error(`Missing tripRoomId for room ${bk.roomName || bk.roomId}`);
        return;
      }

      const payload = {
        price: roomPrice,
        currency: "USD",
        tripRoomId: bk.tripRoomId,
        paypalCaptureId: orderId,
        description: `Deposit payment for room ${bk.roomName || bk.roomId}`,
        email: bk.email || bk.userEmail,
      };

      await axios.post(
        "http://localhost:8080/api/room-payments/deposit",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    // ✅ Hiển thị thông báo thành công
   

    // ✅ Redirect sau 500ms (toast kịp hiển thị)
   setTimeout(() => {
  if (bookings[0].tripId) {
   navigate(`/trips/${bookings[0].tripId}`, { state: { paymentSuccess: true } });
  } else {
    navigate("/", { state: { paymentSuccess: true } });
  }
}, 500);
  } catch (error) {
    console.error("Payment failed:", error);
    toast.error("❌ Payment failed.");
  }
};
  return (
    <div className="payment-container">
      <h2 className="payment-title">💳 Secure Payment</h2>

      <div className="booking-list">
        {bookings.map((bk, idx) => (
          <div key={idx} className="booking-item">
            <div className="booking-info">
              <i className="fa fa-bed"></i>
              <span>{bk.roomName || bk.roomId}</span>
            </div>
       <div className="booking-price">
  {rooms[idx] && rooms[idx].discountPercentage && rooms[idx].discountPercentage > 0 ? (
    <div className="price-container">
      <span className="original-price">
        {calculateOriginalPrice(rooms[idx], bk).toFixed(2)} USD
      </span>
      <span className="discounted-price">
        {calculateBookingPrice(rooms[idx], bk).toFixed(2)} USD
      </span>
      <span className="discount-badge">-{rooms[idx].discountPercentage}%</span>
    </div>
  ) : (
    <span className="normal-price">
      {calculateBookingPrice(rooms[idx], bk).toFixed(2)} USD
    </span>
  )}
</div>

          </div>
        ))}
      </div>

      <div className="total-section">
        <i className="fa fa-money-bill-wave"></i>
        <strong>Total: {price.toLocaleString()} USD</strong>
      </div>

      <input
        className="deposit-input"
        type="number"
        min="0"
        disabled
        step="0.01"
        value={totalAmount}
        onChange={(e) => setTotalAmount(e.target.value)}
      />

      {price > 0 && (
        <div className="paypal-wrapper">
          <PayPalCheckout amount={price.toFixed(2)} onSuccess={handleSuccess} />
        </div>
      )}

      <button className="go-back-btn" onClick={() => navigate(-1)}>
        <i className="fa fa-arrow-left"></i> Go Back
      </button>
    </div>
  );
}

export default PaymentPage;
