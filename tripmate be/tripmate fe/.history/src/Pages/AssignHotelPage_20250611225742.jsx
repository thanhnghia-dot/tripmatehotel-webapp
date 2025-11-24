import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function AssignHotel() {
  const { id: tripId } = useParams(); // tripId từ URL
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);

  const token = localStorage.getItem("token");

  // Load danh sách hotel
  useEffect(() => {
    axios.get('http://localhost:8080/api/hotels', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setHotels(res.data))
      .catch(err => console.error("Failed to load hotels:", err));
  }, [token]);

  // Khi chọn hotel, fetch danh sách room
  const handleHotelSelect = (hotelId) => {
    axios.get(`http://localhost:8080/api/hotels/${hotelId}/rooms`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setRooms(res.data);
        setRoomBookings([]); // reset chọn phòng
      })
      .catch(err => console.error("Failed to load rooms:", err));
  };

  // Khi chọn phòng → thêm vào danh sách booking
  const handleRoomToggle = (roomId) => {
    const exists = roomBookings.find(rb => rb.roomId === roomId);
    if (exists) {
      setRoomBookings(roomBookings.filter(rb => rb.roomId !== roomId));
    } else {
      setRoomBookings([...roomBookings, {
        roomId,
        checkIn: "",
        checkOut: ""
      }]);
    }
  };

  // Thay đổi checkIn/checkOut
  const handleTimeChange = (index, field, value) => {
    const updated = [...roomBookings];
    updated[index][field] = value;
    setRoomBookings(updated);
  };

  // Gửi request assign hotel
  const handleAssign = async () => {
    try {
      const payload = {
        hotelId: selectedHotelId,
        roomBookings
      };

      await axios.post(`http://localhost:8080/api/trips/${tripId}/assign-hotel`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("✅ Hotel assigned successfully!");
      navigate(`/trip/${tripId}`);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to assign hotel.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Assign Hotel to Trip #{tripId}</h2>

      {/* Hotel List */}
      <div className="mb-3">
        <label>Select Hotel:</label>
        <select className="form-control" onChange={(e) => handleHotelSelect(e.target.value)} defaultValue="">
          <option value="" disabled>-- Select Hotel --</option>
          {hotels.map(hotel => (
            <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
          ))}
        </select>
      </div>

      {/* Room List */}
      {rooms.length > 0 && (
        <div>
          <h4>Available Rooms</h4>
          {rooms.map(room => {
            const isSelected = roomBookings.some(rb => rb.roomId === room.id);
            const bookingIndex = roomBookings.findIndex(rb => rb.roomId === room.id);
            return (
              <div key={room.id} className="card mb-2 p-3">
                <label>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleRoomToggle(room.id)}
                  />
                  <strong> Room:</strong> {room.name} | Capacity: {room.capacity}
                </label>
                {isSelected && (
                  <div className="mt-2">
                    <label>Check-in:</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={roomBookings[bookingIndex]?.checkIn || ''}
                      onChange={(e) => handleTimeChange(bookingIndex, "checkIn", e.target.value)}
                    />
                    <label>Check-out:</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={roomBookings[bookingIndex]?.checkOut || ''}
                      onChange={(e) => handleTimeChange(bookingIndex, "checkOut", e.target.value)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submit */}
      <button className="btn btn-primary mt-3" onClick={handleAssign} disabled={!selectedHotelId || roomBookings.length === 0}>
        ✅ Assign Hotel
      </button>
    </div>
  );
}

export default AssignHotel;
