import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import './TripDetails.css';
import queryString from "query-string";
import AOS from 'aos';
import { toast, ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import { 
  FaClipboardList, 
  FaWalking, 
  FaFlagCheckered, 
  FaPlane, 
  FaMapMarkerAlt, 
  FaInfoCircle, 
  FaFlag, 
  FaCalendarAlt, 
  FaEye, 
  FaMoneyBill 
} from "react-icons/fa";
function TripDetails() {
  const { id } = useParams();
  const currentTripId = Number(id);
  const location = useLocation();
  const [provinces, setProvinces] = useState([]);
  const navigate = useNavigate();
 const [selectedRoomIds, setSelectedRoomIds] = React.useState([]);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const query = queryString.parse(location.search);
  const [message, setMessage] = useState('');
    const [showUnpaidWarning, setShowUnpaidWarning] = useState(false);
  const [formError, setFormError] = useState('');
const [cancelReason, setCancelReason] = useState('');
const [selectedCancelReasons, setSelectedCancelReasons] = useState([]);
const [showCancelModal, setShowCancelModal] = useState(false);
const [selectedTripRoomToCancel, setSelectedTripRoomToCancel] = useState(null);
  const [hotelReviews, setHotelReviews] = useState([]);
   const [paidRooms, setPaidRooms] = React.useState([]);
     const [leaveRequestStatus, setLeaveRequestStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    departurePoint: '',
    startDate: '',
    endDate: '',
    type: 'du_lich',
    status: '',
    isPublic: true,
    totalAmount: ''
  });
  const commonCancelReasons = [
  "Change of plans",
  "Found better price",
  "Trip postponed",
  "Personal reasons",
];
  const [memberSummary, setMemberSummary] = useState([]); // ✅ NEW
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [tripRooms, setTripRooms] = useState([]);
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", { 
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric" 
  });
};

useEffect(() => {
  if (query.paymentSuccess === "true") {
    toast.success("✅ Payment successful!");
    // Xóa query param để không hiển thị lại
    navigate(location.pathname, { replace: true });
  }
}, [query, location.pathname, navigate]);

// checklist detail //
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!id) return;
    axios.get(`http://localhost:8080/api/checklist-items/trip/${id}/members/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setMemberSummary(res.data || []))
      .catch(() => console.error("Failed to load member summary"));
  }, [id]);

  // checklist detail //
  useEffect(() => {
    if (query.paymentSuccess === "true") {
      toast.success("✅ Payment successful!");
      // Xóa query param để không hiển thị lại
      navigate(location.pathname, { replace: true });
    }
  }, [query, location.pathname, navigate]);

// Hàm format tiền
const formatMoney = (amount) => {
  if (!amount) return "0";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
};

// provinces (fake data hoặc import từ file utils/provinces)
useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get("https://provinces.open-api.vn/api/p/");
        setProvinces(res.data);
      } catch (err) {
        console.error("❌ Lỗi lấy danh sách tỉnh:", err);
      }
    };
    fetchProvinces();
  }, []);
// Nếu trip chưa load thì gán mặc định 0
const totalSpent = memberSummary.reduce((sum, m) => sum + (m.spent || 0), 0);
const remainingCost = (trip?.totalAmount || 0) - totalSpent;

// Hàm helper cho stepper
const getStepClass = (currentStatus, step) => {
  const statusOrder = ["PLANNING", "ONGOING", "COMPLETED"];
  const currentIndex = statusOrder.indexOf(currentStatus?.toUpperCase());
  const stepIndex = statusOrder.indexOf(step);

  if (stepIndex < currentIndex) return "step completed";
  if (stepIndex === currentIndex) return "step active";
  return "step";
};
useEffect(() => {
    const token = localStorage.getItem("token");
    if (!currentTripId) return;

    axios.get(`http://localhost:8080/api/trip-rooms`, {
      params: { tripId: currentTripId },
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setTripRooms(res.data);
    })
    .catch(err => {
      console.error("Failed to load trip rooms", err);
      toast.error("Lỗi khi tải danh sách phòng chuyến đi");
    });
  }, [currentTripId]);
  
  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    const token = localStorage.getItem("token");

    axios.get(`http://localhost:8080/api/trips/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        const trip = res.data.data;
        setTrip(trip);
        setFormData({
          name: trip.name || '',
          destination: trip.destination || '',
          startDate: trip.startDate || '',
          endDate: trip.endDate || '',
          type: trip.type || 'business',
          isPublic: trip.isPublic ?? true,
          totalAmount: trip.totalAmount ?? '',
          departurePoint: trip.departurePoint || '',
          status: trip.status || '',
        });
        setMembers(trip.members || []);
        setLoading(false);
      })
      .catch(() => {
        setFetchError("Trip not found.");
        setLoading(false);
      });
  }, [id]);

useEffect(() => {
  if (!id) return; // id chính là tripId

  const token = localStorage.getItem("token");

  axios.get(`http://localhost:8080/api/room-payments/paid-rooms`, {
    params: { tripId: id },
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    setPaidRooms(res.data); // res.data là mảng các roomId đã thanh toán, ví dụ: [5]
  })
  .catch(err => {
    console.error(err);
    toast.error("Lỗi khi tải danh sách phòng đã thanh toán");
  });
}, [id]);



  useEffect(() => {
    const token = localStorage.getItem("token");
    if (trip && trip.hotel && trip.hotel?.id) {
      axios.get(`http://localhost:8080/api/hotel-reviews/${trip.hotel.id}/my-reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setHotelReviews(res.data.reviews || []);
        })
        .catch(err => console.error("Failed to fetch hotel reviews", err));
    }
  }, [trip]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Trip name is required.';
    if (!formData.destination.trim()) newErrors.destination = 'Destination is required.';
    if (!formData.startDate) newErrors.startDate = 'Start date is required.';
    if (!formData.endDate) newErrors.endDate = 'End date is required.';
    if (!formData.totalAmount || parseFloat(formData.totalAmount) < 0) {
      newErrors.totalAmount = 'Total amount must be a positive number.';
    }
    if (formData.startDate && formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.startDate = 'Start date must be before or equal to end date.';
      newErrors.endDate = 'End date must be after or equal to start date.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setFormError('');

    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/trips/${id}`, {
        ...formData,
        totalAmount: parseFloat(formData.totalAmount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('✅ Trip updated successfully!');
    } catch (err) {
      setFormError('❌ Failed to update trip.');
      console.error(err);
    }
  };

 const handleInvite = async () => {
  if (!email.trim()) {
    alert("⚠️ Vui lòng nhập email.");
    return;
  }

  try {
    const token = localStorage.getItem('token');

    await axios.post(`http://localhost:8080/api/trips/${id}/invite`, null, {
      params: { email },
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success(`✅ Đã gửi lời mời tới ${email}`);
    setEmail('');

    // Load lại danh sách thành viên
    const res = await axios.get(`http://localhost:8080/api/trips/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMembers(res.data.data.members || []);
  } catch (err) {
    console.error(err);

    if (err.response?.status === 409) {
      toast.success(`⚠️ ${err.response.data}`); // Hiển thị: Email này đã được mời vào chuyến đi rồi.
    } else {
      toast.error('❌ Gửi lời mời thất bại.');
    }
  }
};

const handleMarkFinishTrip = async () => {
  const token = localStorage.getItem('token');

  if (!id) {
    toast.warn('⚠️ Trip ID không hợp lệ!');
    return;
  }

  try {
    await axios.post(`http://localhost:8080/api/trips/${id}/mark-finished`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success('✅ Trip marked as finished!');
    navigate(`/trips/${id}`);
  } catch (err) {
    console.error("❌ Error marking trip as finished:", err);
    toast.error('❌ Failed to mark trip as finished.');
  }
};

const handleUpdateStatus = async (newStatus) => {
  const token = localStorage.getItem("token");

  try {
    await axios.post(`http://localhost:8080/api/trips/${id}/status`, 
      { status: newStatus }, // gửi dưới dạng JSON body
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    toast.success(`Trip status updated to ${newStatus}`);
    setTrip({ ...trip, status: newStatus });
  } catch (error) {
    console.error(error);
    toast.error("Failed to update trip status");
  }
};
  if (loading) return <p className="center">Loading...</p>;
  if (fetchError) return <p className="center error">{fetchError}</p>;
  return (
    <div className="container trip-container my-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="steps-container position-relative d-flex justify-content-between align-items-center mt-5">
        <div className={`step text-center ${getStepClass(trip.status, 'Planning')}`}>
          <div className="circle mx-auto"><FaClipboardList /></div>
          <div className="label">Planning</div>
        </div>

        <div className="connector" />

        <div className={`step text-center ${getStepClass(trip.status, 'Ongoing')}`}>
          <div className="circle mx-auto"><FaWalking /></div>
          <div className="label">Ongoing</div>
        </div>

        <div className="connector" />

        <div className={`step text-center ${getStepClass(trip.status, 'Completed')}`}>
          <div className="circle mx-auto"><FaFlagCheckered /></div>
          <div className="label">Completed</div>
        </div>
      </div>


      <h1 className="trip-title text-center mb-4">{trip.name}</h1>
      <div className="row g-3 align-items-stretch" data-aos="fade-up" data-aos-delay="10">
        {/* Departure Point */}
        <div className="col-sm-12 col-md-6" data-aos="fade-right">
          <div className="trip-info-box p-3 shadow-sm rounded bg-white d-flex align-items-center gap-3">
            <FaPlane className="text-danger fs-4" />
            <div>
              <strong>Departure Point:</strong><br />
              {trip.departurePoint || 'N/A'}
            </div>
          </div>
        </div>

        {/* Destination */}
        <div className="col-sm-12 col-md-6" data-aos="fade-left">
          <div className="trip-info-box p-3 shadow-sm rounded bg-white d-flex align-items-center gap-3">
            <FaMapMarkerAlt className="text-primary fs-4" />
            <div>
              <strong>Destination:</strong><br />
              {trip.destination || 'N/A'}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="col-sm-12 col-md-6" data-aos="fade-right">
          <div className="trip-info-box p-3 shadow-sm rounded bg-white">
            <div className="d-flex align-items-center gap-3 mb-2">
              <FaInfoCircle className="text-warning fs-4" />
              <div>
                <strong>Status:</strong><br />
                {trip.status || 'N/A'}
              </div>
            </div>


          </div>
        </div>

        {/* Trip Type */}
        <div className="col-sm-12 col-md-6" data-aos="fade-left">
          <div className="trip-info-box p-3 shadow-sm rounded bg-white d-flex align-items-center gap-3">
            <FaFlag className="text-success fs-4" />
            <div>
              <strong>Trip Type:</strong><br />
              {trip.type || 'N/A'}
            </div>
          </div>
        </div>

        {/* Start Date */}
        <div className="col-sm-12 col-md-6" data-aos="fade-right">
          <div className="trip-info-box p-3 shadow-sm rounded bg-white d-flex align-items-center gap-3">
            <FaCalendarAlt className="text-info fs-4" />
            <div>
              <strong>Start Date:</strong><br />
              {trip.startDate ? formatDate(trip.startDate) : 'N/A'}
            </div>
          </div>
        </div>

        {/* End Date */}
        <div className="col-sm-12 col-md-6" data-aos="fade-left">
          <div className="trip-info-box p-3 shadow-sm rounded bg-white d-flex align-items-center gap-3">
            <FaCalendarAlt className="text-info fs-4" />
            <div>
              <strong>End Date:</strong><br />
              {trip.endDate ? formatDate(trip.endDate) : 'N/A'}
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="col-sm-12 col-md-6" data-aos="fade-up">
          <div className="trip-info-box p-3 shadow-sm rounded bg-white d-flex align-items-center gap-3">
            <FaEye className="text-dark fs-4" />
            <div>
              <strong>Visibility:</strong><br />
              {trip.isPublic ? "Public" : "Private"}
            </div>
          </div>
        </div>

        {/* Total Cost */}
       <div className="col-sm-12 col-md-6" data-aos="fade-up">

  <div className="trip-info-box p-3 shadow-sm rounded bg-white d-flex align-items-center gap-3">
    <FaMoneyBill className="text-success fs-4" />
    <div>
      <strong>Total Cost:</strong><br />
      {formatMoney(remainingCost)}
    </div>
  </div>

</div>

      </div>
      


      {/* Action Buttons */}
   <div className="action-buttons-horizontal mt-4">
        {/* Book/Assign Hotel */}
   <div className="book-room-container">
  {paidRooms.length < tripRooms.length ? (
    <>
      <div className="unpaid-warning-box">
        <span className="warning-icon">⚠️</span>
        <p className="unpaid-warning-text">
          {tripRooms.length - paidRooms.length} room(s) not paid yet.  
          You must complete payment before booking more.
        </p>
      </div>
      <button
        className="btn-uniform btn-danger-custom"
        disabled
      >
        🏨 {trip.hotel ? "Book More Rooms" : "Choose Accommodation"}
      </button>
    </>
  ) : (
    <button
      className="btn-uniform btn-danger-custom"
      onClick={() => navigate(`/trips/${id}/assign-hotel`)}
    >
      🏨 {trip.hotel ? "Book More Rooms" : "Choose Accommodation"}
    </button>
  )}
</div>





        {/* Start Trip */}
        {!trip.isFinished && trip.status === "Planning" && (
          <button
            className="btn-uniform btn-primary-custom"
            onClick={() => handleUpdateStatus("Ongoing")}
          >
            🚀 Start Trip
          </button>
        )}

        {/* Pay Deposit */}
        {!trip.isFinished && trip.status === "Ongoing" && tripRooms.length > 0 && (
          <>
            {paidRooms.length < tripRooms.length && (
              <>
                <div className="text-danger mb-2">
                  ⚠️ {tripRooms.length - paidRooms.length} room(s) not paid yet. Finish trip disabled.
                </div>
                <button
                  className="btn-uniform btn-warning-custom"
                  onClick={() => {
                    const unpaidRooms = tripRooms.filter(
                      tr => !paidRooms.some(pr => pr.roomId === tr.roomId)
                    );
                    navigate(`/payment/${unpaidRooms[0].roomId}`, {
                      state: {
                        bookings: unpaidRooms.map(room => ({ ...room, tripRoomId: room.id })),
                        tripId: trip.id
                      }
                    });
                  }}
                >
                  💰 Pay Deposit
                </button>
              </>
            )}
          </>
        )}

        {/* Finish Trip */}
        {!trip.isFinished && trip.status === "Ongoing" && (
          <button
            className="btn-uniform btn-success-custom"
            onClick={async () => {
              const allPaid = tripRooms.every(tr =>
                paidRooms.some(pr => pr.roomId === tr.roomId)
              );

              if (!allPaid) {
                toast.error("❌ Cannot finish trip: some rooms are unpaid.");
                return;
              }

              await handleMarkFinishTrip();
              await handleUpdateStatus("Completed");

              setTrip(prev => ({ ...prev, isFinished: true, status: "Completed" }));
            }}
            disabled={paidRooms.length < tripRooms.length}
          >
            ✅ Mark as Finished
          </button>
        )}

        {/* Manage Members */}
        {trip.status !== "Completed" && (
          <button
            className="btn-uniform btn-outline-custom"
            onClick={() => navigate(`/trips/${id}/members`)}
          >
            👥 Manage Members
          </button>
        )}
      </div>

<div className="trip-hotel-info" data-aos="fade-up">
  <h4 className="hotel-title">🏨 Hotel Info</h4>
  {trip?.hotel ? (
    <div className="hotel-grid">
      <div><strong>Name:</strong> {trip.hotel.name}</div>
     
      <div><strong>Address:</strong> {trip.hotel.address}</div>

    </div>
  ) : (
    <p className="hotel-cancel-message">❌ No hotel assigned for this trip.</p>
  )}
</div>


{/* ✅ Checklist Detail Section */}
      <div className="checklist-detail mt-5">
        <h4 className="text-primary mb-3">📝 Checklist Detail</h4>
        <div className="overflow-x-auto">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>Member</th>
                <th>Status</th>
                <th>Total Spent</th>
                
              </tr>
            </thead>
            <tbody>
              {memberSummary.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-muted">No checklist data</td>
                </tr>
              ) : (
                memberSummary.map((m) => (
                  <tr key={m.userId}>
                    <td>{m.fullName}</td>
                    <td>{m.purchasedCount} / {m.itemCount} Bought</td>
                    <td>${m.spent}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


  
   {/* ✅ Hotel & Room info chỉ hiển thị nếu trip chưa kết thúc */}
      {/* ... bên trong return, ở phần hiển thị danh sách phòng */}
    {tripRooms.length > 0 && (
  <div className="hotel-room-wrapper container mt-5">
  <h3 className="hotel-room-header mb-4">🏨 Hotel & Room Information</h3>

    <div className="row g-4">
      {tripRooms.map((tripRoom, index) => {
        const isPaid = paidRooms.some(
          paid =>
            Number(paid.roomId) === Number(tripRoom.roomId) &&
            new Date(paid.checkIn).getTime() === new Date(tripRoom.checkIn).getTime() &&
            new Date(paid.checkOut).getTime() === new Date(tripRoom.checkOut).getTime()
        );
        const isSelected = selectedRoomIds.includes(tripRoom.id);

        return (
          <div key={tripRoom.id || index} className="col-md-6 col-lg-4">
            <div className={`triproom-card card shadow-sm border-0 rounded-4 h-100 position-relative ${isPaid ? 'paid-card' : ''}`}>
              <span className={`badge-status ${isPaid ? 'badge-paid' : 'badge-unpaid'}`}>
                {isPaid ? 'Paid ✅' : 'Unpaid ⚠️'}
              </span>

              <div className="hotelcard-body ">
                <h4 className="room-title mb-1">{tripRoom.roomName}</h4>
                <p className="hotel-name">{tripRoom.hotelName}</p>
                <p className="room-price mb-3">{tripRoom.price ? `$${tripRoom.price.toLocaleString()}` : 'N/A'}</p>

                <div className="room-details mb-3">
                  <p><strong>Beds:</strong> {tripRoom.numberOfBeds}</p>
                  <p><strong>Capacity:</strong> {tripRoom.capacity} guests</p>
                  <p><strong>Check-in:</strong> {tripRoom.checkIn ? new Date(tripRoom.checkIn).toLocaleString() : 'N/A'}</p>
                  <p><strong>Check-out:</strong> {tripRoom.checkOut ? new Date(tripRoom.checkOut).toLocaleString() : 'N/A'}</p>
                </div>

                {/* Các nút chỉ hiển thị nếu trip chưa kết thúc */}
                  {!trip.isFinished ? (
            <>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`selectRoom-${tripRoom.id}`}
                  checked={isSelected}
                  disabled={isPaid}
                  onChange={() => {
                    if (isSelected) {
                      setSelectedRoomIds(prev => prev.filter(id => id !== tripRoom.id));
                    } else {
                      setSelectedRoomIds(prev => [...prev, tripRoom.id]);
                    }
                  }}
                />
                <label className="form-check-label fw-bold" htmlFor={`selectRoom-${tripRoom.id}`}>
                  Select this room
                </label>
              </div>

              <button
                className="cancel-booking-btn"
                onClick={async () => {
                  const token = localStorage.getItem("token");
                  if (isPaid) {
                    setSelectedTripRoomToCancel(tripRoom);
                    setShowCancelModal(true);
                  } else {
                    try {
                      const res = await axios.delete(
                        `http://localhost:8080/api/trip-rooms/${tripRoom.id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      toast.success("Booking canceled successfully.");
                      setTripRooms(prev => prev.filter(tr => tr.id !== tripRoom.id));
                      if (res.data.tripTotalAmount !== undefined) {
                        setTrip(prevTrip => ({ ...prevTrip, totalAmount: res.data.tripTotalAmount }));
                      }
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed to cancel booking.");
                    }
                  }
                }}
              >
                ❌ Cancel Booking
              </button>
            </>
          ) : (
            // Khi trip kết thúc: chỉ hiển thị thông tin, thêm message nếu muốn
            <div className="finished-room-message text-success fw-bold mt-2">
              This trip has ended. No actions available.
            </div>
          )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
     {trip?.isFinished && trip?.hotel?.id && (
  <div className="review-card-container">
    {hotelReviews.length === 0 ? (
      <div className="review-card review-card-pending">
        <h5 className="review-title">✅ This trip has ended!</h5>
        <p className="review-subtitle">We'd love to hear your thoughts about this hotel.</p>
        <button
          className="review-btn review-btn-primary"
          onClick={() => navigate(`/hotels/${trip.hotel.id}`)}
        >
          ✍️ Review this Hotel
        </button>
      </div>
    ) : (
      <div className="review-card review-card-completed">
        <h5 className="review-title">📝 You've already reviewed this hotel.</h5>
        <p className="review-subtitle">You can view or edit your previous review.</p>
        <button
          className="review-btn review-btn-secondary"
          onClick={() => navigate(`/hotels/${trip.hotel.id}`)}
        >
          📄 View Your Review
        </button>
      </div>
    )}
  </div>
)}

   
      {showCancelModal && (
  <div className="cancel-modal-overlay">
    <div className="cancel-modal-content">
      <h4 className="cancel-modal-title">Reason for Canceling Booking</h4>

      <p className="cancel-modal-note">
        Please select the reasons for canceling your booking. If you have already paid, 
        your refund request will be processed after admin approval.
      </p>

      <div className="cancel-modal-checkboxes">
        {commonCancelReasons.map(reason => (
          <label key={reason} className="custom-checkbox">
            <input
              type="checkbox"
              checked={selectedCancelReasons.includes(reason)}
              onChange={() => {
                setSelectedCancelReasons(prev =>
                  prev.includes(reason)
                    ? prev.filter(r => r !== reason)
                    : [...prev, reason]
                );
              }}
            />
            <span className="checkmark"></span>
            {reason}
          </label>
        ))}
      </div>

      <textarea
        className="cancel-modal-textarea"
        value={cancelReason}
        onChange={(e) => setCancelReason(e.target.value)}
        placeholder="Other reason (optional)"
      />

      {/* Hiển thị tóm tắt lý do */}
      {(selectedCancelReasons.length > 0 || cancelReason) && (
        <div className="cancel-modal-summary">
          <h5>Selected Reasons:</h5>
          <ul>
            {selectedCancelReasons.map(reason => (
              <li key={reason}>{reason}</li>
            ))}
            {cancelReason && <li>{cancelReason}</li>}
          </ul>
        </div>
      )}

      <div className="cancel-modal-buttons">
        <button
          className="btn btn-danger"
          onClick={async () => {
            try {
              const token = localStorage.getItem('token');
              await axios.post(
                `http://localhost:8080/api/trip-rooms/${selectedTripRoomToCancel.id}/request-cancel`,
                { reasons: [...selectedCancelReasons, cancelReason].filter(r => r) },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              toast.success('Cancel request sent to admin for approval. Refund will be processed if applicable.');
              setShowCancelModal(false);
              setSelectedCancelReasons([]);
              setCancelReason('');
            } catch (err) {
              console.error(err);
              toast.error('Failed to send cancel request.');
            }
          }}
        >
          Send Request
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setShowCancelModal(false);
            setSelectedCancelReasons([]);
            setCancelReason('');
          }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

   
   {!trip.isFinished && selectedRoomIds.length > 0 && (
      <div className="trip-payment-wrapper">
        <button
          className="trip-pay-btn"
          onClick={() => {
            const selectedRooms = tripRooms.filter(room => selectedRoomIds.includes(room.id));
            navigate(`/payment/${selectedRooms[0].roomId}`, {
              state: { bookings: selectedRooms.map(room => ({ ...room, tripRoomId: room.id })), tripId: trip.id }
            });
          }}
        >
          Pay Deposit for {selectedRoomIds.length} Selected Room{selectedRoomIds.length > 1 ? 's' : ''}
        </button>
      </div>
    )}
   
   
     </div>
   )}
   
   {leaveRequestStatus !== 'PENDING' && trip.status !== "Completed" && (
        <div style={{ flex: 1, borderRadius: 12, padding: 32 }} data-aos="fade-right">
          <div style={{ display: 'flex', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
            <div
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                borderRadius: 12,
                padding: 32,
                boxShadow: '0 4px 16px rgba(166, 0, 0, 0.1)',
                maxWidth: 600,
                margin: '0 auto',
              }}
            >
              <h2
                style={{
                  textAlign: 'center',
                  color: '#810009ff',
                  fontWeight: 'bold',
                  marginBottom: 24,
                }}
              >
                ✏️ Edit Trip
              </h2>

              {formError && <div className="alert alert-danger">{formError}</div>}
              {message && <div className="alert alert-success">{message}</div>}

              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Trip Name */}
                <div>
                  <label className="form-label fw-semibold">Trip Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" disabled={leaveRequestStatus === 'PENDING'} />
                  {errors.name && <div className="text-danger">{errors.name}</div>}
                </div>

                {/* Destination */}
                <div>
                  <label htmlFor="departurePoint" className="form-label fw-semibold">Departure Point</label>
                  <select
                    id="departurePoint"
                    name="departurePoint"
                    value={formData.departurePoint}
                    onChange={handleChange}
                    className={`form-select ${errors.departurePoint ? 'is-invalid' : ''}`}
                    disabled={leaveRequestStatus === 'PENDING'}
                    required
                  >
                    <option value="">-- Select departure point --</option>
                    {provinces.map(province => (
                      <option key={province.code} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {errors.departurePoint && <div className="invalid-feedback">{errors.departurePoint}</div>}
                </div>

                <div>
                  <label htmlFor="destination" className="form-label fw-semibold">Destination</label>
                  <select
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className={`form-select ${errors.destination ? 'is-invalid' : ''}`}
disabled={leaveRequestStatus === 'PENDING'}
                    required
                  >
                    <option value="">-- Select destination --</option>
                    {provinces.map(province => (
                      <option key={province.code} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {errors.destination && <div className="invalid-feedback">{errors.destination}</div>}
                </div>
                {/* Trip Type */}
                <div>
                  <label className="form-label fw-semibold" disabled={leaveRequestStatus === 'PENDING'}>Trip Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="form-select">
                    <option value="Leisure">Leisure</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="form-label fw-semibold">Start Date</label>
                  <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} className="form-control" disabled={leaveRequestStatus === 'PENDING'} />
                  {errors.startDate && <div className="text-danger">{errors.startDate}</div>}
                </div>

                {/* End Date */}
                <div>
                  <label className="form-label fw-semibold">End Date</label>
                  <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} className="form-control" disabled={leaveRequestStatus === 'PENDING'} />
                  {errors.endDate && <div className="text-danger">{errors.endDate}</div>}
                </div>

                {/* Total Amount */}
                <div>
                  <label className="form-label fw-semibold">Total Budget</label>
                  <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} className="form-control" disabled={leaveRequestStatus === 'PENDING'} />
                  {errors.totalAmount && <div className="text-danger">{errors.totalAmount}</div>}
                </div>

                {/* Is Public */}

                {/* Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-uniform"
                    disabled={leaveRequestStatus === 'PENDING'}
                  >
                    💾 Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-uniform"
                    disabled={leaveRequestStatus === 'PENDING'}
                    onClick={() => navigate('/')}
                  >
🔙 Back
                  </button>
                </div>
              </form>
            </div>
            {/* RIGHT: Members */}
            <div className="trip-members">
              <h2 className="trip-members__title">👥 Trip Members</h2>
              {members.length === 0 ? (
                <p className="text-muted text-center">No members yet.</p>
              ) : (
                <ul className="trip-members__list">
                  {members.map((member) => (
                    <li key={member.id} className="trip-members__item">
                      <span
                        className="trip-members__status-dot"
                        style={{ backgroundColor: member.status === "ACTIVE" ? "green" : "gray" }}
                      />
                      <span
                        className={`trip-members__name ${member.status === "ACTIVE" ? "trip-members__name--active" : ""}`}
                      >
                        {member.name}
                      </span>
                      <span className="trip-members__role">({member.role})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

  );
}

export default TripDetails; 