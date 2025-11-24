import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import './Admin.css';
import HoverNavLink from './HoverNavLink';

function Backend() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8080/api/admin/only-admin', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }).catch((error) => {
      if (error.response?.status === 403) {
        navigate('/403');
      } else {
        navigate('/');
      }
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* 🔼 Header ngang */}
   <div className="w-100 bg-green text-white shadow-sm px-4 py-2 d-flex justify-content-between align-items-center sticky-top" style={{ zIndex: 1000 }}>

        <div className="d-flex align-items-center gap-2">
<span
  style={{
    fontFamily: "'Montserrat', sans-serif", // hoặc Bebas Neue, Playfair Display tùy chọn
    fontSize: '25px',
    fontWeight: 'bold',
    color: '#dc3545', // Bootstrap màu đỏ
    letterSpacing: '1px',
    textTransform: 'uppercase'
  }}
>
  TripMate Admin
</span>



        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted">Welcome, Admin</span>
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Sidebar + Main content */}
      <div className="d-flex flex-grow-1">
        {/* ⬅ Sidebar */}
        <div className="sidebar d-flex flex-column align-items-center p-3 px-0">
          <div className="logo-container pt-2 pb-1">
            <NavLink className="navbar-brand" to="/">
             
            </NavLink>
          </div>

         
          <ul className="nav flex-column w-100 nav-menu space-y-2">
            {/* Admin Panel */}
            <li className="text-lg font-extrabold text-green-700 uppercase px-2 tracking-wide">
              Admin Panel
            </li>
            <li className="nav-item">
              <HoverNavLink to="/backend">Dashboard</HoverNavLink>
            </li>
            <li className="nav-item">
              <HoverNavLink to="/backend/usermanager">Users</HoverNavLink>
            </li>

            {/* Trip Management */}
            <li className="text-lg font-extrabold text-green-700 uppercase px-2 tracking-wide">
              Trip Management
            </li>
            <li className="nav-item">
              <HoverNavLink to="/backend/tripmanager">Trips</HoverNavLink>
            </li>
            {/* <li className="nav-item">
              <HoverNavLink to="/backend/hotelmanager">Hotels</HoverNavLink>
            </li> */}
            <li className="nav-item">
              <HoverNavLink to="/backend/budgetmanager">Budgets</HoverNavLink>
            </li>

            {/* Content Moderation */}
            <li className="text-lg font-extrabold text-green-700 uppercase px-2 tracking-wide">
              Content Moderation
            </li>
            <li className="nav-item">
                        <HoverNavLink to="/backend/adminAlbumScreen">Albums</HoverNavLink>
                      </li>
                      <li className="nav-item">
                        <HoverNavLink to="/backend/adminArticle">Blog</HoverNavLink>
                      </li>
                {/* <li className="nav-item">
              <HoverNavLink to="/backend/roommanager">Rooms</HoverNavLink>
            </li> */}
            {/* <li className="nav-item">
              <HoverNavLink to="/backend/reviewmanager">Reviews</HoverNavLink>
            </li> */}
            <li className="nav-item">
              <HoverNavLink to="/backend/Feel">Feel</HoverNavLink>
            </li>
            <li className="nav-item">
              <HoverNavLink to="/backend/reviewmanager">Feedback</HoverNavLink>
            </li>
          </ul>
        </div>

        {/* Main content */}
        <div className="flex-grow-1 p-4 bg-light">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Backend;
