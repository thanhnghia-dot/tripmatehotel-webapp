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
    axios.get(`http://localhost:8080/api/hotel/${hotelId}/rooms`)
      .then(res => setRooms(res.data.data))
      .catch(() => setMessage('Failed to load rooms.'));
  };

  const toggleRoomSelection = (roomId) => {
    setSelectedRoomIds(prev =>
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );
  };

  const handleAssign = () => {
    if (!selectedHotelId || selectedRoomIds.length === 0 || !checkIn || !checkOut) {
      setMessage('Please select hotel, room(s), check-in, and check-out times.');
      return;
    }

    const token = localStorage.getItem('token');
    axios.post(`http://localhost:8080/api/trips/${tripId}/assign-hotel`, {
      hotelId: selectedHotelId,
      roomIds: selectedRoomIds,
      checkIn,
      checkOut
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setMessage('Hotel and rooms assigned successfully!');
      setTimeout(() => navigate(`/trips/${tripId}`), 1500);
    })
    .catch(err => {
      setMessage(err.response?.data?.message || 'Failed to assign hotel.');
    });
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
              <div className="col-md-3 mb-3" key={room.id}>
                <div className={`card h-100 ${selectedRoomIds.includes(room.id) ? 'border-success' : ''}`}
                     onClick={() => toggleRoomSelection(room.id)}
                     style={{ cursor: 'pointer' }}>
                  <img src={room.imageUrl || '/assets/room-placeholder.jpg'} className="card-img-top" alt={room.name} />
                  <div className="card-body">
                    <h6 className="card-title">{room.name}</h6>
                    <p className="card-text small">Price: ${room.pricePerNight}</p>
                  </div>
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
