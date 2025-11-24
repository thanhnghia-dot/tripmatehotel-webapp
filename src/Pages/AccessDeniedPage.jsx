// src/Pages/AccessDeniedPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function AccessDeniedPage() {
  return (
    <div style={{ textAlign: 'center', padding: '80px' }}>
      <h1 style={{ fontSize: '3rem', color: '#dc3545' }}> Forbidden</h1>
      <p style={{ fontSize: '1.2rem' }}>You do not have permission to access this page.</p>
      <Link to="/home" style={{ color: '#007bff', textDecoration: 'underline' }}>
        Return to Home Page
      </Link>
    </div>
  );
}

export default AccessDeniedPage;
