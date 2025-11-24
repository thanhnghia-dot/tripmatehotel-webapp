import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';

function TripPage() {
  const [trips, setTrips] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    type: 'du_lich',
    amount: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdTripId, setCreatedTripId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement('link');
    link.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";
    link.rel = "stylesheet";
    link.id = "bootstrap-css-trip-page";
    document.head.appendChild(link);

    return () => {
      const elem = document.getElementById('bootstrap-css-trip-page');
      if (elem) document.head.removeChild(elem);
    };
  }, []);

  const fetchTrips = () => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:8080/api/trips', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setTrips(res.data.data))
      .catch(() => setError('Failed to load trips.'));
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    AOS.init({ duration: 700, once: true });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, destination, startDate, endDate, type, amount } = formData;
    if (!name || !destination || !startDate || !endDate || !amount) {
      setError('Please fill in all required fields.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must not be after end date.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const createdTripResponse = await axios.post('http://localhost:8080/api/trips', {
        name,
        destination,
        startDate,
        endDate,
        isPublic: true,
        type,
        totalAmount: parseFloat(amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCreatedTripId(createdTripResponse.data.data.id);

      setSuccess('Trip created successfully!');
      setFormData({ name: '', destination: '', startDate: '', endDate: '', type: 'du_lich', amount: '' });
      fetchTrips();
    } catch {
      setError('Failed to create trip.');
    }
  };

  return (
    <>
      {/* Video Header */}
      <div className="position-relative overflow-hidden rounded shadow mb-5" style={{ maxHeight: 500 }}>
        <video
          autoPlay
          muted
          loop
          className="w-100"
          style={{ height: 500, objectFit: 'cover', display: 'block' }}
        >
          <source src="/assets/videos/v1.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="position-absolute top-50 start-50 translate-middle text-white text-center px-3" style={{ textShadow: '0 0 8px rgba(0,0,0,0.7)' }}>
          <h1 className="display-4 fw-bold">Plan Your Next Adventure</h1>
          <p className="lead">Create and manage your trips effortlessly with TripMate</p>
        </div>
      </div>

      {/* Create Trip Form */}
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="bg-white rounded shadow p-4 border border-danger mb-5" data-aos="fade-up">
          <h2 className="text-center text-danger fw-bold mb-4">Create New Trip</h2>

          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          {success && <div className="alert alert-success py-2 small">{success}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Trip name"
              className="form-control border border-danger mb-3"
              required
              autoComplete="off"
            />

            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="Destination"
              className="form-control border border-danger mb-3"
              required
              autoComplete="off"
            />

            <div className="row g-3 mb-3">
              <div className="col">
                <label htmlFor="startDate" className="form-label small fw-semibold">Start Date</label>
                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="form-control border border-danger"
                  required
                />
              </div>
              <div className="col">
                <label htmlFor="endDate" className="form-label small fw-semibold">End Date</label>
                <input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="form-control border border-danger"
                  required
                />
              </div>
            </div>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="form-select border border-danger mb-3"
              aria-label="Trip type"
            >
              <option value="du_lich">Leisure</option>
              <option value="cong_tac">Business</option>
            </select>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Estimated total amount ($)"
              className="form-control border border-danger mb-4"
              min="0"
              step="0.01"
              required
              aria-label="Estimated total amount"
            />

            <button type="submit" className="btn btn-danger w-100 fw-semibold shadow-sm">
              Create Trip
            </button>
          </form>
        </div>
      </div>

      {/* Trip List */}
      <div className="bg-light py-5">
        <div className="container">
          <h3 className="mb-4 fw-bold text-danger" data-aos="fade-right">Your Trips</h3>
          <div className="row g-4">
            {Array.isArray(trips) && trips.length > 0 ? (
              trips.map(trip => (
                <div
                  key={trip.id}
                  className="col-12 col-sm-6 col-md-4 col-lg-3"
                  data-aos="fade-up"
                  data-aos-delay="100"
                >
                  <div
                    className="card h-100 shadow-sm rounded-3 border border-danger"
                    style={{ cursor: 'pointer', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 12px 20px rgba(220, 53, 69, 0.5)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div className="card-body d-flex flex-column justify-content-between">
                      <div>
                        <h5
                          className="card-title text-danger fw-bold"
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(`/trips/${trip.id}`)}
                          onKeyDown={e => { if (e.key === 'Enter') navigate(`/trips/${trip.id}`); }}
                        >
                          {trip.name}
                        </h5>
                        <h6 className="card-subtitle mb-2 text-muted fst-italic">{trip.destination}</h6>
                        <p className="card-text small text-secondary mb-0" style={{ lineHeight: 1.3 }}>
                          <strong>Start:</strong> {trip.startDate}<br />
                          <strong>End:</strong> {trip.endDate}<br />
                          <strong>Type:</strong> {trip.type === 'du_lich' ? 'Leisure' : 'Business'}<br />
                          <strong>Budget:</strong> ${trip.totalAmount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="d-flex justify-content-between mt-3">
                        <button
                          type="button"
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => navigate(`/checklist/${trip.id}`)}
                        >
                          View Checklist
                        </button>
                        <button
                          onClick={() => navigate(`/trips/${trip.id}`)}
                          className="btn btn-danger btn-sm"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted fst-italic">No trips found. Create one to get started!</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default TripPage;
