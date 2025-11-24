import React, { useEffect, useState } from 'react';
import './Header.css';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

const HeaderLogout = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [showTopHeader, setShowTopHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios.get('http://localhost:8080/api/user/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUserInfo(res.data))
      .catch(() => setUserInfo(null));
  }, []);


  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserInfo(null);
    navigate('/login');
  };

  return (
    <header>
        
      {/* Top Header */}
      <div id="top-header" className={showTopHeader ? 'show' : 'hide'}>
        <div className="container d-flex justify-content-between align-items-center flex-wrap">
          <ul className="list-inline mb-0 d-flex gap-3 contact-info">
            {userInfo && (
              <>
                <li className="list-inline-item"><i className="fa fa-phone me-1"></i> {userInfo.phone}</li>
                <li className="list-inline-item"><i className="fa fa-envelope-o me-1"></i> {userInfo.email}</li>
                <li className="list-inline-item"><i className="fa fa-map-marker me-1"></i> {userInfo.address}</li>
              </>
            )}
          </ul>
          <ul className="list-inline mb-0 d-flex gap-3 account-links">
            {userInfo ? (
              <li className="list-inline-item">
                <button
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={handleLogout}
                  style={{ cursor: 'pointer', color: 'white' }}
                >
                  Logout
                </button>
              </li>
            ) : (
              <li className="list-inline-item">
                <NavLink to="/login">
                  <i className="fa fa-user-o me-1"></i> Sign In
                </NavLink>
              </li>
            )}
          </ul>
        </div>
        <hr />
      </div>

      {/* Logo + Menu */}
      <nav className="navbar navbar-expand-lg main-navbar">
        <div className="container">
          <NavLink className="navbar-brand" to="/">
            <img src="/assets/img/logo.png" alt="TripMate" width="80" />
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >/feedback-logout
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="mainNavbar">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
                  Home
                </NavLink>
              </li>
           <li className="nav-item">
                <NavLink to="/feedback-logout" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
                  Feedback
                </NavLink>
              </li>
           
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default HeaderLogout;
