import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function ForgotPassword() {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  // Error riêng từng input
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const navigate = useNavigate();

  const extractErrorMessage = (err) => {
    const data = err.response?.data;
    if (typeof data === 'string') return data;
    if (typeof data === 'object' && data.message) return data.message;
    return 'Unknown error occurred';
  };

  const handleSendOtp = async () => {
    setEmailError('');
    setMessage('');
    if (!email.trim()) {
      setEmailError('Email cannot be empty');
      return;
    }
    try {
      const res = await axios.get(`http://localhost:8080/api/user/send-reset-otp?email=${email}`);
      setMessage(res.data);
      setStep(2);
    } catch (err) {
      setEmailError(extractErrorMessage(err));
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setOtpError('');
    setPasswordError('');
    setMessage('');

    let hasError = false;

    if (!otp.trim()) {
      setOtpError('OTP cannot be empty');
      hasError = true;
    }
    if (!newPassword.trim()) {
      setPasswordError('Password cannot be empty');
      hasError = true;
    }

    if (hasError) return;

    try {
      await axios.post('http://localhost:8080/api/user/reset-password', {
        email,
        otp,
        newPassword,
      });
      alert('Password reset successful!');
      navigate('/login');
    } catch (err) {
      // Giả sử server trả lỗi liên quan tới OTP hoặc password
      const errorMsg = extractErrorMessage(err);
      if (errorMsg.toLowerCase().includes('otp')) {
        setOtpError(errorMsg);
      } else {
        setPasswordError(errorMsg);
      }
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="login-card1" data-aos="fade-up">
        <h2>Forgot Password</h2>

        {step === 1 && (
          <>
            <div className="input-group">
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && <p className="error-message">{emailError}</p>}
              {message && <p className="success-message">{message}</p>}
            </div>
            <button onClick={handleSendOtp}>Send OTP</button>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              {otpError && <p className="error-message">{otpError}</p>}
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {passwordError && <p className="error-message">{passwordError}</p>}
              {message && <p className="success-message">{message}</p>}
            </div>
            <button type="submit">Reset Password</button>
          </form>
        )}

        <button onClick={() => navigate('/login')} className="link-button">
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
