import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function AssignHotelPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8080/api/hotels')
      .then(res => setHotels(res.data))
      .catch(() => setMessage('Failed to load hotels.'));
  }, []);

  const handleHotelSelect = (hotelId) => {
    setSelectedHotelId(hotelId);
    setSelectedRoomIds([]);
    axios.get(`http://localhost:8080/api/hotels/${hotelId}/rooms`)
      .then(res => setRooms(res.data))
      .catch(() => setMessage('Failed to load rooms.'));
  };

  const toggleRoomSelection = (roomId) => {
    setSelectedRoomIds(prev =>
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );
  };

  const handleAssign = async (roomId) => {
    const selectedRoom = rooms.find(r => r.id === roomId);
    const token = localStorage.getItem("token");

    if (!selectedRoom.checkIn || !selectedRoom.checkOut) {
      alert("Vui lòng nhập thời gian check-in và check-out");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8080/api/trips/${tripId}/assign-hotel`,
        {
          hotelId: selectedHotelId,
          roomId: roomId,
          checkIn: selectedRoom.checkIn,
          checkOut: selectedRoom.checkOut
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("✅ Phòng đã được gán thành công!");
      navigate(`/trips/${tripId}`);
    } catch (err) {
      console.error(err);
      alert("❌ Gán phòng thất bại");
    }
  };


  const updateRoomTime = (roomId, field, value) => {
    setRooms(prev =>
      prev.map(r =>
        r.id === roomId ? { ...r, [field]: value } : r
      )
    );
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4 text-danger fw-bold">Assign Hotel to Trip</h2>
      {message && <div className="alert alert-info small">{message}</div>}

      <div className="row mb-4">
        {hotels?.map(hotel => (
          <div className="col-md-4 mb-3" key={hotel.id}>
            <div
              className={`card ${selectedHotelId === hotel.id ? 'border-danger' : ''}`}
              onClick={() => handleHotelSelect(hotel.id)}
              style={{ cursor: 'pointer' }}
            >
              <img src={hotel.imageUrl || '/assets/hotel-placeholder.jpg'} className="card-img-top" alt={hotel.name} />
              <div className="card-body">
                <h5 className="card-title">{hotel.name}</h5>
                <p className="card-text text-muted">Stars: {hotel.starRating}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedHotelId && (
        <>
          <h5 className="text-danger">Select Room(s)</h5>
          <div className="row mb-3">
            {rooms?.map(room => (
              <div key={room.id} className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">{room.name}</h5>
                  <p className="card-text">Capacity: {room.capacity}</p>

                  <label>Check-in</label>
                  <input
                    type="datetime-local"
                    className="form-control mb-2"
                    value={room.checkIn || ''}
                    onChange={(e) =>
                      updateRoomTime(room.id, 'checkIn', e.target.value)
                    }
                  />

                  <label>Check-out</label>
                  <input
                    type="datetime-local"
                    className="form-control mb-2"
                    value={room.checkOut || ''}
                    onChange={(e) =>
                      updateRoomTime(room.id, 'checkOut', e.target.value)
                    }
                  />

                  <button
                    className="btn btn-primary"
                    onClick={() => handleAssign(room.id)}
                  >
                    Assign this room
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label">Check-in</label>
              <input type="datetime-local" className="form-control" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Check-out</label>
              <input type="datetime-local" className="form-control" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
          </div>

          <button className="btn btn-danger" onClick={handleAssign}>Assign Hotel</button>
        </>
      )}
    </div>
  );
}

export default AssignHotelPage;
