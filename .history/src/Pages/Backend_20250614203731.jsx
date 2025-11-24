import React from 'react';
import { Container, Row, Col, Nav } from "react-bootstrap";
import { Link, Outlet } from 'react-router-dom';

function Admin(props) {
    return (
        <div className="d-flex">
        {/* Sidebar */}
        <nav className="bg-dark text-white vh-100 p-3" style={{ minWidth: '200px' }}>
          <h4 className="text-white">Admin Panel</h4>
          <ul className="nav flex-column mt-4">
            <li className="nav-item">
              <Link to="/admin/hotels" className="nav-link text-white">Quản lý khách sạn</Link>
            </li>
            <li className="nav-item">
              <Link to="/admin/reviews" className="nav-link text-white">Quản lý đánh giá</Link>
            </li>
          </ul>
        </nav>

        {/* Main content */}
        <Col xs={10} className="p-4">
          <Outlet /> {/* Phần nội dung sẽ được render ở đây */}
        </Col>
      </div>
    );
}

export default Admin;