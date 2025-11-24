import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import './Partner.css'; // bạn có thể tách riêng file này
import HoverNavLink from './HoverNavLink';
import { FaHotel, FaBed, FaClipboardList, FaChartPie, FaStar, FaSignOutAlt, FaRegWindowClose } from 'react-icons/fa';
import { FaChartBar } from 'react-icons/fa';
function Partner() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
const [sidebarOpen, setSidebarOpen] = useState(false);
const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  useEffect(() => {
    axios.get('http://localhost:8080/api/partner/only-partner', {
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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header */}
     <header className="bg-success text-white d-flex justify-content-between align-items-center px-4 py-3 shadow-sm sticky-top" style={{ zIndex: 1000 }}>
  <h2 className="fw-bold text-uppercase mb-0" style={{ letterSpacing: '1px' , color: 'white'}}>
    TripMate Partner
  </h2>
  <div className="d-flex align-items-center gap-3">
    <span className="fw-semibold me-4">👋 Welcome, {user?.username || "Partner"}</span>
    <button className="btn btn-light btn-sm d-flex align-items-center gap-1" onClick={handleLogout} style={{ fontSize: '13px' }}>
      <FaSignOutAlt /> Logout
    </button>
  </div>
</header>


      {/* Body */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <aside className="partner-sidebar bg-white border-end p-4" style={{ width: '240px' }}>
          <h6 className="text-uppercase fw-bold text-success mb-4">Partner Panel</h6>
          <ul className="nav flex-column gap-2">
            <li>
              <HoverNavLink to="/partner/dashboard"><FaChartPie /> Dashboard</HoverNavLink>
            </li>
           <li>
  <HoverNavLink to="/partner/hotel-stats">
    <FaChartBar /> Hotel Statistics
  </HoverNavLink>
</li>
            <li>
              <HoverNavLink to="/partner/hotelmanager"><FaHotel /> Hotels</HoverNavLink>
            </li>
            <li>
              <HoverNavLink to="/partner/roomtypes"><FaBed /> Room Types</HoverNavLink>
            </li>
            <li>
              <HoverNavLink to="/partner/roommanager"><FaBed /> Rooms</HoverNavLink>
            </li>
            <li>
              <HoverNavLink to="/partner/usermanager"><FaClipboardList /> Reservation List</HoverNavLink>
            </li>
            <li>
              <HoverNavLink to="/partner/reviewmanager1"><FaStar /> Review List</HoverNavLink>
            </li>
            <li>
              <HoverNavLink to="/partner/requestcancel"><FaRegWindowClose /> Request Cancellation</HoverNavLink>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-grow-1 p-4 bg-light overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Partner;
