// TripDetails.jsx

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import './TripDetails.css';
import '../Pages/Home.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    type: 'du_lich',
    isPublic: true,
    totalAmount: ''
  });

  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

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
          type: trip.type || 'du_lich',
          isPublic: trip.isPublic ?? true,
          totalAmount: trip.totalAmount ?? ''
        });
        setMembers(trip.members || []);
        setLoading(false);
      })
      .catch(() => {
        setFetchError("Trip not found.");
        setLoading(false);
      });
  }, [id]);

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
      alert("Please enter an email.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8080/api/trips/${id}/invite`, null, {
        params: { email },
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`✅ Invitation sent to ${email}`);
      setEmail('');

      const res = await axios.get(`http://localhost:8080/api/trips/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(res.data.data.members || []);
    } catch (err) {
      console.error(err);
      alert('❌ Failed to send invitation.');
    }
  };

  const handleMarkFinishTrip = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`http://localhost:8080/api/trips/${id}/mark-finished`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Trip marked as finished!');
      navigate(`/trips/${id}`);
    } catch (err) {
      console.error(err);
      alert('❌ Failed to mark trip as finished.');
    }
  };

  if (loading) return <p className="center">Loading...</p>;
  if (fetchError) return <p className="center error">{fetchError}</p>;

  return (
    <div className="trip-container">
      <h1 className="trip-title">Trip Details</h1>

      <div className="trip-grid" data-aos="fade-up">

        <div><strong>Trip Name:</strong> {trip.name}</div>
        <div><strong>Destination:</strong> {trip.destination}</div>
        <div><strong>Trip Type:</strong> {trip.type}</div>
        <div><strong>Start Date:</strong> {trip.startDate}</div>
        <div><strong>End Date:</strong> {trip.endDate}</div>
        <div><strong>Visibility:</strong> {trip.isPublic ? "Public" : "Private"}</div>
        <div><strong>Total Cost:</strong> {trip.totalAmount ?? 0} VND</div>
        <div><strong>Created At:</strong> {trip.createdAt ? new Date(trip.createdAt).toLocaleString() : "N/A"}</div>
        <div><strong>Trip status:</strong> {trip.isFinished ? 'Finish' : 'In Progress'}</div>
      </div>

      {!trip.hotel && <button className="btn btn-primary mt-3" onClick={() => navigate(`/trips/${id}/assign-hotel`)}>Assign Hotel</button>}

      {!trip.isFinished && <button className="btn btn-primary mt-3" onClick={handleMarkFinishTrip}>Mark finish trip</button>}

      {trip.hotel && (
        <div className="trip-grid" data-aos="fade-up" style={{ marginTop: 24 }}>
          <div><strong>Hotel:</strong> {trip.hotel.name}</div>
          <div><strong>Address:</strong> {trip.hotel.address}</div>
        </div>
      )}

      {trip.isFinished && (
        <div style={{ marginTop: 24 }}>
          <h3>Đánh giá Khách Sạn</h3>
          <div className="form-group">
            <label>Chọn số sao:</label>
            <select
              className="form-control"
              value={review.rating}
              onChange={(e) => setReview(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
            >
              <option value={0}>-- Chọn --</option>
              {[1, 2, 3, 4, 5].map(star => (
                <option key={star} value={star}>{star} sao</option>
              ))}
            </select>
          </div>

          <div className="form-group mt-2">
            <label>Bình luận:</label>
            <textarea
              className="form-control"
              rows="3"
              value={review.comment}
              onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
            />
          </div>

          <button
            className="btn btn-success mt-2"
            onClick={async () => {
              setSubmittingReview(true);
              try {
                const token = localStorage.getItem("token");
                await axios.post(`http://localhost:8080/api/hotel-reviews`, {...review, hotelId: trip.hotel.id}, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                alert('✅ Gửi đánh giá thành công!');
                setReview({ rating: 0, comment: '' });

              } catch (err) {
                alert('❌ Lỗi khi gửi đánh giá.');
                console.error(err);
              } finally {
                setSubmittingReview(false);
              }
            }}
            disabled={submittingReview || review.rating === 0 || !review.comment.trim()}
          >
            {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      )}

      {/* ROOM + HOTEL Info */}
      {trip.rooms && trip.rooms.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h3>Hotel & Room Information</h3>
          <table className="table table-bordered mt-2">
            <thead className="thead-dark">
              <tr>
                <th>Hotel</th>
                <th>Room</th>
                <th>Capacity</th>
                <th>Check-in</th>
                <th>Check-out</th>
              </tr>
            </thead>
            <tbody>
              {trip.rooms.map((room, index) => (
                <tr key={index}>
                  <td>{room.hotelName}</td>
                  <td>{room.roomName}</td>
                  <td>{room.capacity}</td>
                  <td>{room.checkIn ? new Date(room.checkIn).toLocaleString() : 'N/A'}</td>
                  <td>{room.checkOut ? new Date(room.checkOut).toLocaleString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} data-aos="fade-right">

        <div style={{ display: 'flex', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
          {/* LEFT: Trip Edit Form */}
          <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#007bff', fontWeight: 'bold', marginBottom: 24 }}>
              Edit Trip #{id}
            </h2>

            {formError && <div className="alert alert-danger">{formError}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" placeholder="Trip Name" />
              {errors.name && <div className="text-danger">{errors.name}</div>}

              <input type="text" name="destination" value={formData.destination} onChange={handleChange} className="form-control" placeholder="Destination" />
              {errors.destination && <div className="text-danger">{errors.destination}</div>}

              <select name="type" value={formData.type} onChange={handleChange} className="form-control">
                <option value="du_lich">Leisure</option>
                <option value="cong_tac">Business</option>
              </select>

              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="form-control" />
              {errors.startDate && <div className="text-danger">{errors.startDate}</div>}

              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="form-control" />
              {errors.endDate && <div className="text-danger">{errors.endDate}</div>}

              <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} className="form-control" placeholder="Total Amount" />
              {errors.totalAmount && <div className="text-danger">{errors.totalAmount}</div>}

              <label>
                <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} /> Public Trip
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>Back</button>
              </div>
            </form>
          </div>

          {/* RIGHT: Members */}
          <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} data-aos="fade-left">

            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Trip Members</h3>
            <div style={{ marginBottom: 20 }}>
              <input
                type="email"
                placeholder="Enter email to invite"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
              />
              <button onClick={handleInvite} className="btn btn-info mt-2" style={{ width: '100%' }}>✉️ Invite Member</button>
            </div>

            {members.length === 0 ? (
              <p style={{ color: '#888' }}>No members in this trip yet.</p>
            ) : (
              <ul className="list-group">
                {members.map(member => (
                  <li key={member.id || member.email} className="list-group-item">
                    <div><strong>{member.name || 'Unknown'}</strong> ({member.email})</div>
                    <div style={{ fontSize: 13 }}>Role: <strong>{member.role}</strong> | Status: {member.status}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TripDetails;
