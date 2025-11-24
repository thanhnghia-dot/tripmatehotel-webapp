import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './Auth.css';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
      newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 3) newErrors.password = 'Password must be at least 3 characters';
    return newErrors;
  };

  const getErrorMessage = (error) => {
    const errData = error.response?.data;
    if (!errData) return error.message || 'Unknown error occurred';
    if (typeof errData === 'string') {
      const msg = errData.toLowerCase();
      if (msg.includes('email') && msg.includes('not found')) return 'Email not found';
      if (msg.includes('password') && msg.includes('invalid')) return 'Invalid password';
      return errData;
    }
    if (typeof errData === 'object') return errData.message || JSON.stringify(errData);
    return 'Unknown error occurred';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const response = await axios.post('http://localhost:8080/api/user/login', { email, password });

const { token, role, userId } = response.data;
localStorage.setItem('token', token);
localStorage.setItem('userId', userId);
localStorage.setItem('role', role);


      if (response.data.role === 'ROLE_ADMIN') {
      navigate('/backend');
    } else if (response.data.role === 'ROLE_PARTNER') {
      navigate('/partner/dashboard');
    } else if (response.data.role === 'ROLE_USER') {
  navigate('/home');
} else {
  navigate(from || '/home'); // fallback
}
    } catch (error) {
      setErrors({ form: getErrorMessage(error) });
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name } = decoded;

      const res = await axios.post('http://localhost:8080/api/user/google-login', {
        email,
        name,
      });

   const { token, userId, role } = res.data;

    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('role', role);

      if (res.data.role === 'ROLE_ADMIN') {
        navigate('/backend');
      } else {
        navigate('/home');
      }
      
    } catch (err) {
      setErrors({ form: 'Google login failed' });
    }
  };

  return (
    <motion.div
      className="login-card"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <h2 className="login-title">Sign In</h2>
      <form className="auth-form" onSubmit={handleLogin} noValidate>
        <div className="input-group">
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Password *"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? 'input-error' : ''}
          />
          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>

        <button type="submit" className="login-button">Sign In</button>
        {errors.form && <p className="error-message">{errors.form}</p>}
      </form>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setErrors({ form: 'Google login failed' })}
        />
      </div>

      <div className="login-footer">
        <button onClick={() => navigate('/')} className="link-button">Home</button>
        <button onClick={() => navigate('/forgot-password')} className="link-button">Forgot Password?</button>
  
      </div>
    </motion.div>
  );
}

export default Login;
