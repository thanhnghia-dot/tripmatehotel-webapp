import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import TripDetailsIncline from '../Component/TripDetailsIncline';

const AcceptInvitePage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Check login
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:8080/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsAuthenticated(true);
        setCurrentUser(res.data);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  // Fetch trip + check invitation
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const token = localStorage.getItem('token');

      axios.get(`http://localhost:8080/api/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => {
        setTrip(res.data.data);
      }).catch(() => setTrip(null));

      axios.get(`http://localhost:8080/api/trips/${tripId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => {
        const invited = res.data.some(member => member.email === currentUser.email);
        if (!invited) {
          alert("Bạn không được mời vào chuyến đi này.");
          navigate("/");
        }
      }).catch(() => {
        alert("Không thể kiểm tra lời mời.");
        navigate("/");
      });
    }
  }, [isAuthenticated, currentUser, tripId]);

  const handleAccept = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/trips/${tripId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("🎉 Bạn đã tham gia chuyến đi!");
      navigate("/trippage");
    } catch (err) {
      if (err.response?.status === 409) {
        alert("Bạn đã tham gia chuyến đi này rồi.");
      } else {
        alert("Không thể chấp nhận lời mời.");
      }
    }
  };
  const handleDecline = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.post(`http://localhost:8080/api/trips/${tripId}/decline`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    alert("You declined the invitation.");
    navigate("/trippage"); 
  } catch (err) {
    console.error("Decline Error:", err.response?.data || err.message);
alert("Failed to decline invitation");
  }
};


  

  if (loading) return <div className="loading">Cheking Login...</div>;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  return (
    <div style={styles.page}>
      <div className="invite-card">
        <h2>📨 Invitation To Join A Trip</h2>
        {trip ? <TripDetailsIncline trip={trip} /> : <p>Not Found Trip Information.</p>}

        <h2 style={styles.title}>📨 Do You Wanna Join Our Trip?</h2>
        <div style={styles.buttonGroup}>
          <button style={styles.acceptBtn} onClick={handleAccept}> Accept</button>
          <button style={styles.declineBtn} onClick={handleDecline}>Decline</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    background: '#f2f8ff',
    minHeight: '100vh',
    padding: '4rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGroup: {
    marginTop: '3rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
  },
  acceptBtn: {
    backgroundColor: '#2ecc71',
    color: '#fff',
    padding: '1rem 2.5rem',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    transition: 'background 0.3s',
  },
  declineBtn: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    padding: '1rem 2.5rem',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    transition: 'background 0.3s',
  },
  title: {
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: '#2c3e50',
  marginBottom: '2rem',
  textAlign: 'center',
}
};


export default AcceptInvitePage;