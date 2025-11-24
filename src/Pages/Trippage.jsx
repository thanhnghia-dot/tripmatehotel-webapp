import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaLock, FaLockOpen } from 'react-icons/fa';
import './Trippages.css';
import { toast } from 'react-toastify';

function TripPage() {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const toggleFavorite = (tripId) => {
    let updatedFavorites;
    if (favorites.includes(tripId)) {
      updatedFavorites = favorites.filter(id => id !== tripId);
    } else {
      updatedFavorites = [...favorites, tripId];
    }
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };
  const getMinDateTime = () => {
    const now = new Date();
    now.setSeconds(0, 0); // xóa giây và milliseconds
    return now.toISOString().slice(0, 16); // lấy 'YYYY-MM-DDTHH:mm'
  };
  const [searchText, setSearchText] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 8; // bạn có thể thay đổi thành 4, 9, v.v.
  //
  const [currentUser, setCurrentUser] = useState(null);
  const [provinces, setProvinces] = useState([]);
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get('https://provinces.open-api.vn/api/p/');
        setProvinces(res.data);
      } catch (err) {
        console.error('❌ Lỗi lấy danh sách tỉnh:', err);
      }
    };

    fetchProvinces();
  }, []);
  //
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get("http://localhost:8080/api/user/me", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setCurrentUser(res.data))
        .catch(() => setCurrentUser(null));
    }
  }, []);
  const [trips, setTrips] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    departurePoint: '',
    destination: '',
    startDate: '',
    endDate: '',
    type: 'Business',
    status: 'Planning',
    // enum uppercase
    type: 'BUSINESS',     // enum uppercase
      amount: '',        // dùng đúng field như DTO
    isPublic: false
  });
  const [showForm, setShowForm] = useState(false);

  const filteredTrips = trips.filter(trip => {
    const query = searchText.toLowerCase();

    // Tìm kiếm theo tên, điểm đi, điểm đến
    const matchesSearch =
      trip.name.toLowerCase().includes(query) ||
      (trip.departurePoint && trip.departurePoint.toLowerCase().includes(query)) ||
      (trip.destination && trip.destination.toLowerCase().includes(query));

    // 👉 Chỉ ẩn trips public nếu user KHÔNG phải thành viên & KHÔNG phải OWNER
    if (trip.isPublic && (!trip.memberRole || trip.memberRole === null)) {
      return false;
    }

    // Kiểm tra chế độ hiển thị filter
    const matchesVisibility =
      filterVisibility === 'all'
        ? true
        : filterVisibility === 'private'
          ? trip.isPublic === false
          : trip.isPublic === true;

    return matchesSearch && matchesVisibility;
  });


  const [formErrors, setFormErrors] = useState({});
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
  const toggleVisibility = async (tripId, currentVisibility, ownerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("❌ Only the trip owner can change visibility!");
        return;
      }

      // Kiểm tra user hiện tại có phải là owner không
      if (!currentUser || currentUser.id !== ownerId) {
        toast.error("❌ Only the trip owner can change visibility!");
        return;
      }

      await axios.put(`http://localhost:8080/api/trips/${tripId}/visibility`, {
        isPublic: !currentVisibility
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTrips(prevTrips =>
        prevTrips.map(trip =>
          trip.id === tripId ? { ...trip, isPublic: !currentVisibility } : trip
        )
      );

      toast.success(!currentVisibility ? "✔️ Trip has been made public." : "🔒 Trip has been made private.");
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
      toast.error('❌ An error occurred while updating the display status!');
    }
  };
  const fetchTrips = () => {
    const token = localStorage.getItem('token');
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {}; // không gửi headers nếu không có token

    axios.get('http://localhost:8080/api/trips', config)
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
  const isBlank = (value) => !value || !value.trim();


  const confirmDelete = () => {
    return new Promise((resolve) => {
      toast.info(
        <div>
          <p>Are you sure you want to delete this trip?</p>
          <button onClick={() => { toast.dismiss(); resolve(true); }} className="mr-2 px-2 py-1 bg-red-500 text-white rounded">Delete</button>
          <button onClick={() => { toast.dismiss(); resolve(false); }} className="px-2 py-1 bg-gray-300 rounded">Cancel</button>
        </div>,
        { autoClose: false, closeOnClick: false, closeButton: false }
      );
    });
  };
  const handleDeleteTrip = async (tripId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("⚠️ You need to login to delete a trip.");
      return;
    }

    const isConfirmed = await confirmDelete();
    if (!isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8080/api/trips/delete/${tripId}?confirm=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      toast.success("✔️ Trip deleted successfully!");
    } catch (err) {
      toast.error("❌ Delete failed trip.");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (isBlank(formData.name)) errors.name = "Trip name is required.";
    if (isBlank(formData.destination)) errors.destination = "Destination is required.";
    if (!formData.startDate) errors.startDate = "Start date is required.";
    if (!formData.endDate) errors.endDate = "End date is required.";
    if (isBlank(formData.departurePoint)) errors.departurePoint = "Departure point is required.";
    if (isBlank(formData.status)) errors.status = "Status is required.";

if (parseFloat(formData.amount) > 1000000000) {
  errors.amount = "Amount cannot exceed 1,000,000,000.";
}

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (start.getTime() >= end.getTime()) {
      errors.date = "Start date must be before end date.";
    }

    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errors.amount = "Valid amount is required.";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setError('');
    setSuccess('');

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/trips', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Kiểm tra trùng thời gian chuyến đi
      const conflictTrips = res.data.data.filter(trip => {
        const existingStart = new Date(trip.startDate);
        const existingEnd = new Date(trip.endDate);
        const newStart = new Date(formData.startDate);
        const newEnd = new Date(formData.endDate);
        return newStart <= existingEnd && newEnd >= existingStart;
      });

      if (conflictTrips.length > 0) {
        toast.warning(`⚠ Warning: Your trip overlaps with ${conflictTrips.length} existing trip(s).`);
        // 👈 Thêm dòng này để chặn không cho tạo
      }

      // Nếu không trùng thì tạo chuyến đi
      const response = await axios.post('http://localhost:8080/api/trips', {
         name: formData.name,
  departurePoint: formData.departurePoint,
  destination: formData.destination,
  startDate: formData.startDate,
  endDate: formData.endDate,
  status: formData.status,
  isPublic: false,
  type: formData.type,
  totalAmount: parseFloat(formData.amount) 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCreatedTripId(response.data.data.id);
      setSuccess('Trip created successfully!');
      setFormData({
  name: '',
  departurePoint: '',
  destination: '',
  startDate: '',
  endDate: '',
  type: 'Business',
  status: 'Planning',
  amount: ''   // ✅ để amount, còn khi gửi thì map sang totalAmount
});

      fetchTrips();
    } catch {
      setError('Failed to create trip.');
    }
  };

  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = trips.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(trips.length / tripsPerPage);

  return (
    <>
      <div className="position-relative overflow-hidden rounded shadow mb-5" style={{ maxHeight: 600 }}>
        <video
          autoPlay
          muted
          loop
          className="w-100"
          style={{ height: 600, objectFit: 'cover', display: 'block' }}
        >
          <source src="/assets/videos/v1.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="position-absolute top-50 start-50 translate-middle text-white text-center px-3" style={{ textShadow: '0 0 8px rgba(0,0,0,0.7)' }}>
          <h1 className="display-4 fw-bold">Plan Your Next Adventure</h1>
          <p className="lead">Create and manage your trips effortlessly with TripMate</p>
        </div>
      </div>
      <div className="text-center my-4">
        <button
          className="btn btn-danger fw-bold px-4 py-2 shadow"
          style={{ transition: 'all 0.3s ease-in-out' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✖' : '＋ Create New Trip'}
        </button>
      </div>


      {showForm && (
        <div className="container" style={{ maxWidth: 480 }}>
          <div className="bg-white rounded shadow p-4 border border-danger mb-5" data-aos="fade-up">
            <h2 className="text-center text-danger fw-bold mb-4">Create New Trip</h2>

            {error && (
              <div className="alert alert-danger d-flex align-items-center fs-6 fw-semibold" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.964 0L.165 13.233c-.457.778.091 1.767.982 1.767h13.707c.89 0 1.438-.99.982-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1-2.002 0 1 1 0 0 1 2.002 0z" />
                </svg>
                {error}
              </div>
            )}

            {success && <div className="alert alert-success py-2 small">{success}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="row mb-2">
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label fw-semibold">Trip Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter trip name"
                    className={`form-control border border-danger ${formErrors.name ? 'is-invalid' : ''}`}
                    autoComplete="off"
                    required
                  />
                  {formErrors.name && <div className="invalid-feedback d-block">{formErrors.name}</div>}
                </div>

                <div className="col-md-6">
                  <label htmlFor="departurePoint" className="form-label fw-semibold">Departure Point</label>
                  <select
                    id="departurePoint"
                    name="departurePoint"
                    value={formData.departurePoint}
                    onChange={handleChange}
                    className={`form-select border border-danger ${formErrors.departurePoint ? 'is-invalid' : ''}`}
                    required
                  >
                    <option value="">-- Select departure point --</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.departurePoint && <div className="invalid-feedback d-block">{formErrors.departurePoint}</div>}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-md-6">
                  <label htmlFor="destination" className="form-label fw-semibold">Destination</label>
                  <select
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className={`form-select border border-danger ${formErrors.destination ? 'is-invalid' : ''}`}
                    required
                  >
                    <option value="">-- Select destination --</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.destination && <div className="invalid-feedback d-block">{formErrors.destination}</div>}
                </div>

                <div className="col-md-6">
                  <label htmlFor="type" className="form-label fw-semibold">Trip Type</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="form-select border border-danger"
                    required
                  >
                    <option value="BUSINESS">Business</option>
                    <option value="LEISURE">Leisure</option>
                  </select>
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-md-6">
                  <label htmlFor="startDate" className="form-label fw-semibold">Start Date</label>
                  <input
                    id="startDate"
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    min={getMinDateTime()}
                    className={`form-control border border-danger ${formErrors.startDate || formErrors.date ? 'is-invalid' : ''}`}
                    required
                  />
                  {formErrors.startDate && <div className="invalid-feedback d-block">{formErrors.startDate}</div>}
                </div>

                <div className="col-md-6">
                  <label htmlFor="endDate" className="form-label fw-semibold">End Date</label>
                  <input
                    id="endDate"
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={getMinDateTime()}
                    className={`form-control border border-danger ${formErrors.endDate || formErrors.date ? 'is-invalid' : ''}`}
                    required
                  />
                  {formErrors.endDate && <div className="invalid-feedback d-block">{formErrors.endDate}</div>}
                  {formErrors.date && <div className="invalid-feedback d-block">{formErrors.date}</div>}
                </div>
              </div>
<div className="mb-3">
  <label htmlFor="amount" className="form-label fw-semibold">Estimated Total Amount ($)</label>
  <input
    id="amount"
    type="number"
    name="amount"
    value={formData.amount}
    onChange={(e) => {
      const value = e.target.value;
      // Giới hạn max 1 tỷ
      if (parseFloat(value) > 1000000000) {
        setFormData(prev => ({ ...prev, amount: '1000000000' }));
      } else {
        setFormData(prev => ({ ...prev, amount: value }));
      }
    }}
    placeholder="Enter estimated budget"
    className={`form-control border border-danger ${formErrors.amount ? 'is-invalid' : ''}`}
    min="0"
    max="1000000000"  // HTML5 max
    step="0.01"
    required
  />
  {formErrors.amount && <div className="invalid-feedback d-block">{formErrors.amount}</div>}
</div>

              <button type="submit" className="btn btn-danger w-100 fw-semibold shadow-sm">
                Create Trip
              </button>

              {/* 
        {createdTripId && (
          <button
            type="button"
            onClick={() => navigate(`/trips/${createdTripId}/assign-hotel`)}
            className="btn btn-outline-primary btn-sm"
          >
            Assign Hotel
          </button>
        )}
        */}
            </form>
          </div>
        </div>
      )}

      <div className="bg-light py-5">
        <div className="container">
          <h3 className="tps-title-main" data-aos="fade-right">Your Trips</h3>
          <div className="tps-search-filter-container">
            <input
              type="text"
              placeholder="Search trips..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="tps-search-input"
            />
            <select
              value={filterVisibility}
              onChange={e => setFilterVisibility(e.target.value)}
              className="tps-filter-select"
            >
              <option value="all">All Trips</option>
              <option value="private">Private Trips</option>
              <option value="public">Public Trips</option>
            </select>
          </div>
          {['Planning', 'Ongoing', 'Completed'].map(status => {
            const tripsByStatus = filteredTrips.filter(t => t.status === status);
            if (tripsByStatus.length === 0) return null;

            // mapping trạng thái sang class tương ứng
            const statusClass = status.toLowerCase();

            return (
              <div key={status} className="mb-5">
                <h4 className={`tps-title-status tp-${statusClass}`} data-aos="fade-right">
                  {status} Trips
                </h4>
                <div className="tps-trip-slider-container position-relative">
                  {/* Nút mũi tên trái */}
                  {tripsByStatus.length > 4 && ( // số lượng tùy bạn, 4 là ví dụ
                    <button
                      className="tps-arrow-btn tp-left"
                      onClick={() => {
                        document.getElementById(`trip-row-${status}`).scrollBy({ left: -300, behavior: 'smooth' });
                      }}
                    >
                      ‹
                    </button>
                  )}
                  <div className="tps-trip-scroll-wrapper">
                    {/* Danh sách trip ngang */}
                    <div
                      id={`trip-row-${status}`}
                      className="d-flex overflow-auto flex-nowrap gap-4"
                      style={{ scrollBehavior: 'smooth', padding: '0 40px 15px 40px' }}
                    >
                      {tripsByStatus.map(trip => {
                        const defaultImages = [
                          "/assets/img/trip1.jpg",
                          "/assets/img/trip2.jpg",
                          "/assets/img/trip3.jpg",
                          "/assets/img/trip4.jpg",
                          "/assets/img/trip5.jpg",
                          "/assets/img/trip6.jpg",
                          "/assets/img/trip7.jpg",
                          "/assets/img/trip8.jpg",
                          "/assets/img/trip9.jpg",
                          "/assets/img/trip10.jpg"
                        ];
                        const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];

                        return (
                          <div
                            key={trip.id}
                            className="flex-shrink-0"
                            style={{ width: '260px' }} // cố định để scroll ngang đẹp hơn
                            data-aos="fade-up"
                            data-aos-delay="100"
                          >
                            {/* --- card giữ nguyên code của bạn --- */}
                           <div
                              className="new-card h-100 shadow-lg border-0 rounded-4 overflow-hidden"
                              style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                              onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-7px)';
                                e.currentTarget.style.boxShadow = '0 16px 28px rgba(0,0,0,0.15)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                              }}
                            >
                              <div className="position-relative">
                                <img
                                  src={trip.imageUrl || randomImage}
                                  className="new-card-img-top"
                                  alt="Trip"
                                  style={{ height: '180px', objectFit: 'cover' }}
                                />
                                <div
                                  className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                                  style={{
                                    background: 'transparent',
                                    color: '#fff',
                                    fontSize: '1.3rem',
                                    fontWeight: 'bold',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                    cursor: 'pointer',
                                    transition: 'background 0.3s ease'
                                  }}
                                  onClick={() => navigate(`/trips/${trip.id}`)}
                                >
                                  {trip.name}
                                </div>
                                {trip.status === "Completed" && trip.memberRole === "OWNER" && (
                                  <button
                                    className={`tps-lock-icon position-absolute top-0 end-0 m-2 btn btn-sm rounded-circle ${trip.isPublic ? 'tps-public' : 'tps-private'}`}
                                    onClick={() => toggleVisibility(trip.id, trip.isPublic)}
                                    title={trip.isPublic ? "Công khai - Click để khóa" : "Riêng tư - Click để mở khóa"}
                                  >
                                    {trip.isPublic ? <FaLockOpen /> : <FaLock />}
                                  </button>
                                )}
                              </div>
                              <div className="new-card-body d-flex flex-column">
                                <h6 className="text-danger text-center mb-2 fw-bold">{trip.name}</h6>
                                <div className="tps-trip-info">
                                  <div><strong>Name:</strong> <span>{trip.name}</span></div>
                                  <div><strong>Departure:</strong> <span>{trip.departurePoint}</span></div> {/* ➕ thêm dòng này */}
                                  <div><strong>Destination:</strong> <span>{trip.destination}</span></div>
                                  <div><strong>Status:</strong>
                                    <span className={`tps-status ${trip.status === 'Planning' ? 'tps-planning' :
                                      trip.status === 'Ongoing' ? 'tps-ongoing' : 'tps-completed'}`}>
                                      {trip.status}
                                    </span>
                                  </div>
                                  <div><strong>Visibility:</strong>
                                    <span className={`tps-visibility ${trip.isPublic ? 'tps-public' : 'tps-private'}`}>
                                      {trip.isPublic ? 'Public' : 'Private'}
                                    </span>
                                  </div>
                                  <div><strong>Budget:</strong> <span>${trip.totalAmount?.toFixed(2) || '0.00'}</span></div>
                                </div>
                                <div className="trip-card-actions">
                                                <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => navigate(`/album/${trip.id}`)}
                        >
                          Add Album
                        </button>
                                  <button
                                    className="trip-btn checklist-btn"
                                    onClick={() => navigate(`/checklist/${trip.id}`)}
                                  >
                                    Checklist
                                  </button>
                                  <div className="action-right">
                                    <button
                                      onClick={() => navigate(`/trips/${trip.id}`)}
                                      className="trip-btn details-btn"
                                    >
                        
                                      Details
                                    </button>
                                    {trip.status === "Completed" && trip.memberRole === "OWNER" && (
                                      <button
                                        onClick={() => handleDeleteTrip(trip.id)}
                                        className="trip-btn delete-btn"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nút mũi tên phải */}
                  
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default TripPage;