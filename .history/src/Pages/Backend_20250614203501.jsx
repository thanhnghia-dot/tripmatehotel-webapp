import React from 'react';
import { Link, Routes } from 'react-router-dom';

function Admin(props) {
    return (
        <div className="d-flex">
        {/* Sidebar */}
        <nav className="bg-dark text-white vh-100 p-3" style={{ minWidth: '200px' }}>
          <h4 className="text-white">Admin Panel</h4>
          <ul className="nav flex-column mt-4">
            <li className="nav-item">
              <Link to="/hotels" className="nav-link text-white">Quản lý khách sạn</Link>
            </li>
            <li className="nav-item">
              <Link to="/reviews" className="nav-link text-white">Quản lý đánh giá</Link>
            </li>
          </ul>
        </nav>

        {/* Content Area */}
        <div className="flex-grow-1 p-4">
          <div>Hello</div>
        </div>
      </div>
    );
}

export default Admin;