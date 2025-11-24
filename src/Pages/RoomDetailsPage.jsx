import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation} from 'react-router-dom';
import axios from 'axios';
import './RoomDetailsPage.css';

const RoomDetailsPage = () => {
  const location = useLocation();
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
const limit = 250;
  const navigate = useNavigate(); 

  const getFullUrl = (url) => (url?.startsWith('http') ? url : `http://localhost:8080${url}`);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/rooms/${roomId}`);
        setRoom(res.data);
        const images = res.data.imageUrl?.split(',')?.map(url => url.trim()) || [];
        setSelectedImage(images[0]);
      } catch (err) {
        setError('Room not found');
      }
    };
    fetchRoom();
  }, [roomId]);

  if (error) return <div className="error-message">{error}</div>;
  if (!room) return <div className="loading-message">Loading...</div>;

  const images = room.imageUrl?.split(',')?.map(url => url.trim()) || [];

  return (
    <div className="room-details-page">
    <div className="room-details-container container my-5">
      <div className="row g-4 shadow-lg p-4 rounded-4 bg-white">
        
        {/* Left: Image thumbnails + main image */}
        <div className="col-md-6">
          <div className="main-image mb-3 rounded overflow-hidden shadow-sm position-relative">
            <img
              src={getFullUrl(selectedImage)}
              alt="Selected"
              className="w-100 h-100 image-main"
              style={{ objectFit: 'cover', height: '400px', transition: 'transform 0.3s' }}
            />
          </div>
          <div className="d-flex flex-wrap gap-2 justify-content-start thumbnails-container">
            {images.map((img, index) => (
              <img
                key={index}
                src={getFullUrl(img)}
                alt={`thumb-${index}`}
                className={`thumbnail-img rounded border ${selectedImage === img ? 'active border-primary shadow' : ''}`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Right: Room Details */}
        <div className="col-md-6 d-flex flex-column justify-content-between">
          <div>
            <h2 className="room-detail-titles fw-bold mb-3">{room.name}</h2>

            <div className="price-status d-flex align-items-center mb-3 gap-3">
       <div className="room-price-wrapper">
  {room.price ? (
    <>
      {room.discountPercentage && room.discountPercentage > 0 ? (
        <>
          <span className="room-price-original">
            ${room.price.toFixed(2)}
          </span>
          <span className="room-price-final">
            ${(room.price * (1 - room.discountPercentage / 100)).toFixed(2)}
          </span>
          <span className="room-discount-badge">
            -{room.discountPercentage}%
          </span>
        </>
      ) : (
        <span className="room-price-final">
          ${room.price.toFixed(2)}
        </span>
      )}
    </>
  ) : (
    <span className="room-price-na">Price not available</span>
  )}
</div>



              <span className={`room-status badge ${room.roomStatus === 'AVAILABLE' ? 'badge-available bg-success' : 'badge-unavailable bg-danger'}`}>
                {room.roomStatus}
              </span>
            </div>

            <ul className="room-info-list list-unstyled mb-4">
              <li>🛏️ <strong>Beds:</strong> {room.numberOfBeds ?? 'N/A'}</li>
              <li>👨‍👩‍👧‍👦 <strong>Capacity:</strong> {room.capacity ?? 'N/A'} người</li>
              <li>📝 <strong>Description:</strong> {room.description || 'Không có mô tả'}</li>
            </ul>
          </div>

          <div className="actions mt-3">
            <button
  className="book-btn"
  onClick={() => navigate('/TripPage')}
>
  🚀 Book Now
</button>

           <div className="contact-buttons d-flex gap-3 flex-wrap">
  <a 
    href="tel:0123456789" 
    className="contact-btn call-btn flex-grow-1"
  >
    📞 Call Now
  </a>
  <button
    onClick={() => navigate(-1)}
    className="contact-btn back-btn flex-grow-1"
    type="button"
  >
    ← Back
  </button>
</div>

          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default RoomDetailsPage;
