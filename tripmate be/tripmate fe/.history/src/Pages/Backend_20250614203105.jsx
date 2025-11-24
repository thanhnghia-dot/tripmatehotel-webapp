import React from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import { Outlet, NavLink } from "react-router-dom";

function Admin() {
  return (
    <Container fluid>
      <Row>
        {/* Sidebar */}
        <Col xs={2} className="bg-light vh-100 p-3">
          <h5 className="mb-4">Quản trị</h5>
          <Nav defaultActiveKey="/admin/hotels" className="flex-column">
            <Nav.Link as={NavLink} to="/admin/hotels">Quản lý khách sạn</Nav.Link>
            <Nav.Link as={NavLink} to="/admin/reviews">Quản lý đánh giá</Nav.Link>
          </Nav>
        </Col>

        {/* Main content */}
        <Col xs={10} className="p-4">
          <Outlet /> {/* Phần nội dung sẽ được render ở đây */}
        </Col>
      </Row>
    </Container>
  );
}

export default Admin;
