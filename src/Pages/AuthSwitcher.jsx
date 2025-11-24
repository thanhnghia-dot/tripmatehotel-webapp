import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AuthSwitcher.css';
import Login from './Login';
import Register from './Register';

const AuthSwitcher = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    setIsRegistering(location.pathname === '/register');
  }, [location.pathname]);

  return (
    <div className={`switch-container ${isRegistering ? 'register-mode' : ''}`}>
      <div className="switch-form">
        <div className="form-panel login-panel">
          <Login />
        </div>
        <div className="form-panel register-panel">
          <Register />
        </div>
      </div>

      <div className="switch-overlay">
        {isRegistering ? (
          <div className="overlay-panel left-overlay">
            <button onClick={() => navigate('/login')}>Sign In</button>
          </div>
        ) : (
          <div className="overlay-panel right-overlay">
            <button onClick={() => navigate('/register')}>Register</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthSwitcher;
