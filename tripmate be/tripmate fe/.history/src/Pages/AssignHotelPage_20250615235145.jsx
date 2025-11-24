import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function AssignHotel() {
  const { tripId } = useParams(); // tripId từ URL
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
    setSelectedHotelId(hotelId);
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
      navigate(`/trips/${tripId}`);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to assign hotel.");
    }
  };


  console.log('selectedHotelId: ', selectedHotelId);
  console.log('roomBookings: ', roomBookings);


  return (
    <div className="container mt-4">
      <h2>Assign Hotel to Trip #{tripId}</h2>

      {/* Hotel List */}
      <h4>Available Hotels</h4>
      <div className="row">
        {hotels.map(hotel => (
          <div
            key={hotel.id}
            className="col-md-4 mb-4"
          >
            <div
              className={`card h-100 ${selectedHotelId === hotel.id ? 'border-primary shadow' : ''}`}
              onClick={() => handleHotelSelect(hotel.id)}
              style={{ cursor: 'pointer' }}
            >
              {hotel.imageUrl && (
                <img
                  src={hotel.imageUrl}
                  className="card-img-top"
                  alt={`Image of ${hotel.name}`}
                  style={{ height: '180px', objectFit: 'cover' }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{hotel.name}</h5>
                <p className="card-text">
                  <strong>Address:</strong> {hotel.address}<br />
                  <strong>Stars:</strong> {"⭐".repeat(hotel.starRating)}
                </p>
                {selectedHotelId === hotel.id && (
                  <div className="badge bg-primary text-white">Selected</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* Room List */}
      {rooms.length > 0 && (
        <div>
          <h4>Available Rooms</h4>
          <div className="row">
            {rooms.map(room => {
              const isSelected = roomBookings.some(rb => rb.roomId === room.id);
              const bookingIndex = roomBookings.findIndex(rb => rb.roomId === room.id);
              return (
                <div key={room.id} className="col-md-6 mb-3">
                  <div className={`card h-100 ${isSelected ? 'border-success shadow' : ''}`}>
                    {room.imageUrl && (
                      <img
                        src={room.imageUrl}
                        alt={`Room ${room.name}`}
                        className="card-img-top"
                        style={{ height: '160px', objectFit: 'cover' }}
                      />
                    )}
                    <div className="card-body">
                      <label style={{ cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRoomToggle(room.id)}
                          style={{ marginRight: '8px' }}
                        />
                        <strong>{room.name}</strong> (Capacity: {room.capacity})
                        {/* Price: room.pricePerNight & discount percent: room.discount : thiết kê phải đẹp và nổi bật, giá tiền phải là màu đỏ, to và rõ, có hiệu ứng gạch ngang nếu có discount */}
                        <div className="mt-2"></div>
                          <span className="text-danger" style={{ fontSize: '1.2em' }}>
                           
                           {room.discount > 0 && (
                              <span className="text-decoration-line-through me-2" style={{ color: '#6c757d' }}>
                            ${room.pricePerNight?.toFixed(2)}
                              </span>
                            )}
                            {room.discount > 0 && (
                              <span className="text-danger ms-2" style={{ color: '#6c757d' }}>
                                ${(room.pricePerNight * (1 - room.discount / 100))?.toFixed(2)}
                              </span>
                            )}
                          </span>
                     
                        {room.description2 && <p className="mt-2" style={{fontSize: 16, fontWeight: 400}}>- {room.description2}</p>}
                        {room.description3 && <p className="mt-2">-{room.description3}</p>}
                        {room.description4 && <p className="mt-2">-{room.description4}</p>}
                        {room.description5 && <p className="mt-2">-{room.description5}</p>}
                        {room.description6 && <p className="mt-2">-{room.description6}</p>}
                        {room.description7 && <p className="mt-2">-{room.description7}</p>}
                        {room.description8 && <p className="mt-2">-{room.description8}</p>}
                        {room.description9 && <p className="mt-2">-{room.description9}</p>}
                        {room.description10 && <p className="mt-2">-{room.description10}</p>}
                        {room.description11 && <p className="mt-2">-{room.description11}</p>}
                        {room.description12 && <p className="mt-2">-{room.description12}</p>}
                      </label>

                      {isSelected && (
                        <div className="mt-3">
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
                  </div>
                </div>
              );
            })}
          </div>
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
