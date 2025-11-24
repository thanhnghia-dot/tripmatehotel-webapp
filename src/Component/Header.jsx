import React, { useEffect, useState } from 'react';
import './Header.css';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [showTopHeader, setShowTopHeader] = useState(true);
  const navigate = useNavigate();
const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 50) {
      setIsScrolled(true);
      setShowTopHeader(false); // ẩn top header
    } else {
      setIsScrolled(false);
      setShowTopHeader(true); // hiện lại top header
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  // Hàm load thông tin user
  const fetchUserInfo = async () => {
    const token = localStorage.getItem('token');
    if (!token) return setUserInfo(null);

    try {
      const res = await axios.get('http://localhost:8080/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserInfo(res.data);
    } catch (err) {
      console.error(err);
      setUserInfo(null);
    }
  };

  // Gọi khi component mount
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Gọi lại khi token thay đổi (sau login)
  useEffect(() => {
    const handleStorageChange = () => fetchUserInfo();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
               <li className="top-info-item">
  <i className="fa fa-phone"></i> {userInfo.phone}
</li>

<li className="top-info-item">
  <i className="fa fa-envelope-o"></i> {userInfo.email}
</li>

<li className="top-info-item">
  <i className="fa fa-map-marker"></i> {userInfo.address}
</li>

              </>
            )}
          </ul>
          <ul className="list-inline mb-0 d-flex gap-3 account-links">
            <li className="list-inline-item"><NavLink to="/AlbumByTrip">Album</NavLink></li>
        {userInfo ? (
  <li className="account-item">
    <button className="logout-btn" onClick={handleLogout}>
      LogOut
    </button>
  </li>
) : (
  <li className="account-item">
    <NavLink to="/login" className="sign-in-link">
      <i className="fa fa-user-o me-1"></i> Sign In
    </NavLink>
  </li>
)}

<li className="account-item">
  <NavLink to="/editprofile" className="profile-link">
    My Profile
  </NavLink>
</li>

    <li className="list-inline-item">
  <NavLink
    to="/editprofile"
    className={({ isActive }) =>
      `px-3 py-1 rounded-lg font-medium transition-all
       ${isActive ? 'bg-white text-black shadow-md' : 'text-white hover:bg-white/15'}`
    }
  >
    <i className="fa fa-user-circle me-1"></i> My Profile
  </NavLink>
</li>


          </ul>
        </div>
        <hr />
      </div>

      {/* Menu */}
   <nav className={`navbar navbar-expand-lg main-navbar ${isScrolled ? "scrolled" : ""}`}>

        <div className="container">
        <NavLink className="navbar-brand logo-highlight" to="/">
  <img src="/assets/img/logo.png" alt="TripMate" width="90" />
</NavLink>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="mainNavbar">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to="/home" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/trippage" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
                  My Trip
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/hotel" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
                  Hotel
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/budget" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
                  Budget
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/Blog" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  Blog
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/feel" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  Feels
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/prediction" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  PredictionAI
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/feedback" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
                  Feedback
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/safety" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  Safety
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
