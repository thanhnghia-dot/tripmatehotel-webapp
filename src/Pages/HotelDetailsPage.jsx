import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './HotelDetailsPage.css';
import { toast } from 'react-toastify';
import { MdClose } from "react-icons/md";
function HotelDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [reviews, setReviews] = useState([]);
   const [expanded, setExpanded] = useState(false);
  const limit = 150;
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [review, setReview] = useState({
    rating: 0,
    comment: '',
    serviceRating: 0,
    cleanlinessRating: 0,
    locationRating: 0,
    facilitiesRating: 0,
    valueForMoneyRating: 0,
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [image, setImage] = useState(null);
  const [reviewOverview, setReviewOverview] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const forbiddenWords = ['đm', 'dm', 'cmm', 'cc', 'cl', 'ngu', 'địt', 'mẹ', 'fuck', 'shit'];

  const amenityIcons = {
    "Wi-Fi": "bi-wifi",
    "Swimming Pool": "bi-water",
    "Gym": "bi-dumbbell",
    "Parking": "bi-car-front",
    "Room Service": "bi-bell",
    "Spa": "bi-heart-pulse",
    "Restaurant": "bi-cup-straw",
    "24/7 Reception": "bi-clock-history",
    "Airport Shuttle": "bi-bus-front",
    "Bar / Lounge": "bi-cup",
    "Breakfast Included": "bi-egg-fried",
    "Pet Friendly": "bi-paw",
    "Non-smoking Rooms": "bi-slash-circle",
    "Laundry Service": "bi-droplet",
    "Concierge": "bi-person-vcard",
    "Business Center": "bi-building",
    "Meeting Rooms": "bi-people",
    "Elevator": "bi-box-arrow-up",
    "Air Conditioning": "bi-wind",
    "Sauna": "bi-fire",
    "Massage Service": "bi-emoji-smile",
    "Daily Housekeeping": "bi-broom",
    "Childcare / Babysitting": "bi-bag-heart",
    "Bicycle Rental": "bi-bicycle",
    "Private Beach": "bi-sunset"
  };

  const getFullUrl = (url) => (url?.startsWith('http') ? url : `http://localhost:8080${url}`);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/hotels/${id}`);
        setHotel(res.data.data);
      } catch (err) {
        console.error('Error fetching hotel details:', err);
        setError('Failed to load hotel details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviewOverview = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/hotel-reviews/${id}/overview`);
        setReviewOverview(res.data);
      } catch (err) {
        console.error('Error fetching review overview:', err);
      }
    };

    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const res = await axios.get(`http://localhost:8080/api/hotel-reviews/${id}`);
        setAverageRating(res.data.averageRating);
        setReviews(Array.isArray(res.data.reviews) ? res.data.reviews : []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchHotel();
    fetchReviews();
    fetchReviewOverview();
  }, [id]);
const shouldTruncate = hotel?.description && hotel.description.length > limit;
const displayedText = hotel?.description
  ? (expanded || !shouldTruncate ? hotel.description : hotel.description.slice(0, limit) + '...')
  : 'No description available.';
  const containsForbiddenWords = (text) => {
    return forbiddenWords.some((word) => text.toLowerCase().includes(word));
  };

  const handleReviewSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('❗ You need to log in to submit a review');
      return;
    }

    if (!hotel?.id) {
      toast.error('❌ Hotel not loaded');
      return;
    }

    if (!review.rating || !review.comment.trim()) {
      toast.error('❗ Please fill in all required review fields');
      return;
    }

    if (containsForbiddenWords(review.comment)) {
      toast.error('❌ Your comment contains inappropriate language');
      return;
    }

    setSubmittingReview(true);
    try {
      const formData = new FormData();
      const reviewData = {
        hotelId: hotel.id,
        rating: review.rating,
        comment: review.comment,
        serviceRating: review.serviceRating,
        cleanlinessRating: review.cleanlinessRating,
        locationRating: review.locationRating,
        facilitiesRating: review.facilitiesRating,
        valueForMoneyRating: review.valueForMoneyRating,
      };

      formData.append(
        'req',
        new Blob([JSON.stringify(reviewData)], { type: 'application/json' })
      );

      if (image) {
        formData.append('image', image);
      }

      await axios.post('http://localhost:8080/api/hotel-reviews/create', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('✅ Your review has been submitted!');
      setReview({
        rating: 0,
        comment: '',
        serviceRating: 0,
        cleanlinessRating: 0,
        locationRating: 0,
        facilitiesRating: 0,
        valueForMoneyRating: 0,
      });
      setImage(null);

      const res = await axios.get(`http://localhost:8080/api/hotel-reviews/${id}`);
      setAverageRating(res.data.averageRating);
      setReviews(Array.isArray(res.data.reviews) ? res.data.reviews : []);
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error('❌ Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: rating >= i ? '#facc15' : '#ccc', fontSize: '1.2rem' }}>★</span>
      );
    }
    return <span>{stars}</span>;
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    arrows: false,
    autoplaySpeed: 3000,
    pauseOnHover: true,
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (error) return <div className="alert alert-danger text-center mt-4">{error}</div>;
  if (!hotel) return null;

  const averageRoomPrice = hotel.roomsType?.reduce((acc, type) => {
    const roomPrices = type.rooms.map(r => r.price);
    return acc.concat(roomPrices);
  }, []).reduce((a, b) => a + b, 0) / (hotel.roomsType?.reduce((a, type) => a + type.rooms.length, 0) || 1);

  return (
    <div className="container my-5" style={{ fontSize: '18px', maxWidth: '1200px' }}>
      <Link to="/hotel" className="btn-back-to-list">
        <i className="bi bi-arrow-left me-2"></i>
        Back to Hotel List
      </Link>

      <h2 className="text-dark fw-bold mb-2" style={{ fontSize: '36px' }}>{hotel.name}</h2>
      <p className="text-muted mb-3">
        ⭐ {averageRating.toFixed(1)} ({reviews.length} reviews)
      </p>
      <p><strong>💲 Average Price:</strong> ${averageRoomPrice.toFixed(2)}</p>
{hotel.imageUrl && (
  <div className="hotel-main-image-wrapper">
    <img
      src={getFullUrl(hotel.imageUrl)}
      alt={hotel.name}
      className="hotel-main-image-center"
    />
  </div>
)}

      <div className="mb-5">
        <p><strong>📍 Address:</strong> {hotel.streetAddress ? `${hotel.streetAddress}, ${hotel.address}` : hotel.address}</p>

        <p><strong>⭐ Stars:</strong> {'⭐'.repeat(hotel.starRating)}</p>
  <p className="hotel-description">
  <strong>📝 Description:</strong> {displayedText}
  {shouldTruncate && (
    <button
      className="btn-view-more"
      onClick={() => setExpanded(!expanded)}
    >
      {expanded ? '...' : 'View More'}
    </button>
  )}
</p>


    {Array.isArray(hotel.amenityIds) && hotel.amenityIds.length > 0 && (
  <>
<p className="hotel-section-title">
  🏷 Amenities
</p>

<div className="hotel-amenities">
  {hotel.amenityIds.map((amenity) => (
    <span
      key={amenity.id}
      className="hotel-amenity"
    >
      <i className={`bi ${amenityIcons[amenity.name] || "bi-building"}`}></i>
      <span>{amenity.name}</span>
    </span>
  ))}
</div>

  </>
)}

      </div>

      {/* Room Type Cards */}
      <div className="row g-4 mb-5">
        {Array.isArray(hotel.roomsType) && hotel.roomsType.map((type) => (
          <div key={type.id} className="col-md-6 col-lg-4">
            <div
              className="room-type-card"
              onClick={() => setSelectedTypeId(type.id)}
            >
              <img src={type.imageUrls?.[0]} alt={type.typeName} />
              <div className="room-type-info">
                <div className="room-type-title">{type.typeName}</div>
                <div className="room-type-desc">{Array.isArray(type.rooms) ? type.rooms.length : 0} ROOMS</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rooms under selected RoomType */}
      {selectedTypeId && (() => {
        const selectedRoomType = hotel.roomsType.find(rt => rt.id === selectedTypeId);
        return (
          <>
            <h4 className="text-primary fw-semibold mb-3" style={{ fontSize: '24px' }}>
              🛏 Rooms in {selectedRoomType?.typeName}
            </h4>

            <div className="row g-4 mb-5">
              {Array.isArray(selectedRoomType?.rooms) ? selectedRoomType.rooms.map((room, index) => {
                const images = room.imageUrl?.split(',').map(url => url.trim()) || [];
                return (
                  <div key={room.id || index} className="col-md-6 col-lg-4">
                    <div
                      className="room-type-card"
                      onClick={() => navigate(`/rooms/${room.id}`)}
                    >
                      <div className="room-image-wrapper">
                        {images.length > 0 ? (
                          <Slider {...sliderSettings}>
                            {images.map((img, i) => (
                              <div key={i}>
                                <img
                                  src={getFullUrl(img)}
                                  className="w-100"
                                  style={{ height: '250px', objectFit: 'cover', borderRadius: '8px' }}
                                  alt={`room-${i}`}
                                />
                              </div>
                            ))}
                          </Slider>
                        ) : (
                          <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '250px' }}>
                            <span className="text-muted">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="room-type-info1">
                        <div className="room-type-title">{room.name}</div>
                        <div className="room-type-desc">${room.price}</div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <p>No rooms available</p>
              )}
            </div>
          </>
        );
      })()}

      {reviewOverview && (
        <div className="card shadow-sm p-4 mb-4">
          <h4 className="text-primary fw-semibold mb-3">⭐ Review Overview</h4>
          <p><strong>Overall Rating:</strong> {reviewOverview.overallRating.toFixed(1)} ({reviewOverview.totalReviewCount} reviews)</p>

          <div className="mb-2"><strong>Service:</strong> {renderStars(reviewOverview.serviceRating)}</div>
          <div className="mb-2"><strong>Cleanliness:</strong> {renderStars(reviewOverview.cleanlinessRating)}</div>
          <div className="mb-2"><strong>Location:</strong> {renderStars(reviewOverview.locationRating)}</div>
          <div className="mb-2"><strong>Facilities:</strong> {renderStars(reviewOverview.facilitiesRating)}</div>
          <div className="mb-2"><strong>Value for Money:</strong> {renderStars(reviewOverview.valueForMoneyRating)}</div>
        </div>
      )}

      {/* Guest Reviews */}
      <h4 className="text-primary fw-semibold mb-3">💬 Guest Reviews ({reviews.length})</h4>
      {loadingReviews ? (
        <div className="skeleton-container">
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text short"></div>
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-muted">No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="card shadow-sm p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="text-dark fw-bold">👤 {review.userName}</div>
              <div>{renderStars(review.rating)}</div>
            </div>
            <p><strong>📝 Review:</strong> {review.comment}</p>
            <p className="text-muted mb-2"><strong>📅</strong> {new Date(review.createdAt).toLocaleDateString('en-GB')}</p>
            {review.image && (
              <div className="review-img">
                <img src={getFullUrl(review.image)} alt="review uploaded" />
              </div>
            )}
          </div>
        ))
      )}
<div className="text-center my-4">
  {!showReviewForm && (
    <button
      className="btn-write-review"
      onClick={() => setShowReviewForm(true)}
    >
      ✍ Write a Review
    </button>
  )}
</div>

      {/* Submit Review */}
{showReviewForm && (
  <div className="review-modal-overlay">
    <div className="review-modal-content">
 <button
  className="review-modal-close"
  onClick={() => setShowReviewForm(false)}
>
  <MdClose size={28} color="#333" />
</button>


      <h5 className="mb-4">📝 Submit Your Review</h5>

      {/* Overall Rating */}
      <div className="mb-3 d-flex align-items-center">
        <label className="me-2 fw-semibold">Overall Rating:</label>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => setReview({ ...review, rating: star })}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            style={{
              cursor: 'pointer',
              color: (hoverRating || review.rating) >= star ? '#facc15' : '#ccc',
              fontSize: '28px',
              marginRight: '5px'
            }}
          >
            ★
          </span>
        ))}
      </div>

      {/* Ratings chi tiết */}
      {[{ label: 'Service', field: 'serviceRating' }, { label: 'Cleanliness', field: 'cleanlinessRating' }, { label: 'Location', field: 'locationRating' }, { label: 'Facilities', field: 'facilitiesRating' }, { label: 'Value for Money', field: 'valueForMoneyRating' }].map(({ label, field }) => (
        <div className="mb-3 d-flex align-items-center" key={field}>
          <label className="me-2 fw-semibold" style={{ width: '140px' }}>{label}:</label>
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              onClick={() => setReview({ ...review, [field]: star })}
              style={{
                cursor: 'pointer',
                color: review[field] >= star ? '#facc15' : '#ccc',
                fontSize: '22px',
                marginRight: '5px'
              }}
            >
              ★
            </span>
          ))}
        </div>
      ))}

      <textarea
        className="form-control mb-3"
        placeholder="Write your review..."
        rows={4}
        value={review.comment}
        onChange={(e) => setReview({ ...review, comment: e.target.value })}
      />

      <input
        className="form-control mb-3"
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <div className="d-flex gap-3">
        <button className="btn btn-success flex-grow-1" onClick={handleReviewSubmit} disabled={submittingReview}>
          {submittingReview ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
}

export default HotelDetailsPage;
