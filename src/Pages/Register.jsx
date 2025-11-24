import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import './Auth.css';
import AddressAutocomplete from './AddressAutocomplete';

function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'Male',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required.';
    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid.';
else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
  newErrors.email = 'Email must be a valid @gmail.com address.';
}

    if (!formData.password) newErrors.password = 'Password is required.';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain both letters and numbers.';
    }

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';
    else if (!/^\d{9,15}$/.test(formData.phone)) newErrors.phone = 'Phone number is invalid.';

    if (!formData.gender) newErrors.gender = 'Please select gender.';
    if (!formData.address.trim()) newErrors.address = 'Address is required.';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'radio') {
      setFormData(prev => ({ ...prev, gender: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getErrorMessage = (error) => {
    const errData = error?.response?.data;
    if (!errData) return 'Error sending request.';
    if (typeof errData === 'string') return errData;
    if (typeof errData === 'object') {
      return errData.message || JSON.stringify(errData, null, 2);
    }
    return 'Unknown error.';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true); // Start spinner
    try {
      const response = await axios.get('http://localhost:8080/api/user/send-otp', {
        params: { email: formData.email, phone: formData.phone },
      });
      setMessage(response.data);
      setStep(2);
    } catch (err) {
      setMessage(getErrorMessage(err));
      console.error(err);
    } finally {
      setLoading(false); // Stop spinner
    }
  };

  const handleConfirmOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!otp.trim()) {
      setMessage('OTP is required.');
      return;
    }
    try {
      const res = await axios.post('http://localhost:8080/api/user/confirm', {
        ...formData,
        otp,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      setMessage('🎉 ' + res.data);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(getErrorMessage(err));
      console.error(err);
    }
  };

  return (
    <motion.div
      className="login-card"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <h2 className="login-title">REGISTER</h2>

      {step === 1 && (
        <form className="auth-form" onSubmit={handleRegister} noValidate>
          <div className="input-row">
            <div className="input-group half-width">
              <input
                type="text"
                name="name"
                placeholder="Full Name *"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'input-error' : ''}
                required
              />
              {!errors.name && <small className="helper-text">Enter your full name.</small>}
              {errors.name && <small className="error-message">{errors.name}</small>}
            </div>

            <div className="input-group half-width">
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'input-error' : ''}
                required
              />
              {!errors.email && <small className="helper-text">Ex: name@example.com</small>}
              {errors.email && <small className="error-message">{errors.email}</small>}
            </div>
          </div>

          <div className="input-row">
            <div className="input-group half-width">
              <input
                type="password"
                name="password"
                placeholder="Password *"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
                required
              />
              {!errors.password && <small className="helper-text">Min 6 chars, with letters & numbers.</small>}
              {errors.password && <small className="error-message">{errors.password}</small>}
            </div>

            <div className="input-group half-width">
              <input
                type="text"
                name="phone"
                placeholder="Phone number *"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'input-error' : ''}
                required
              />
              {!errors.phone && <small className="helper-text">9–15 digits, no spaces</small>}
              {errors.phone && <small className="error-message">{errors.phone}</small>}
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '5px', textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <label style={{ fontWeight: 200, color: '#8B001A', marginBottom: '1px', display: 'block' }}>Gender *</label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={formData.gender === 'Male'}
                  onChange={handleChange}
                />{' '}
                Male
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={formData.gender === 'Female'}
                  onChange={handleChange}
                />{' '}
                Female
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Other"
                  checked={formData.gender === 'Other'}
                  onChange={handleChange}
                />{' '}
                Other
              </label>
            </div>
            {errors.gender && <small className="error-message">{errors.gender}</small>}
          </div>

   <div className="input-group">
  <AddressAutocomplete
    value={formData.address}
    onChange={(val) => setFormData((prev) => ({ ...prev, address: val }))}
    error={errors.address}
  />
</div>



          {loading ? (
            <div className="spinner"></div>
          ) : (
            <button type="submit" className="login-button">Register</button>
          )}
        </form>
      )}

      {step === 2 && (
        <form className="auth-form" onSubmit={handleConfirmOtp}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" className="login-button">Confirm OTP</button>
        </form>
      )}

      {message && (
        <pre className="message" style={{ whiteSpace: 'pre-wrap' }}>
          {typeof message === 'object' ? JSON.stringify(message, null, 2) : message}
        </pre>
      )}
    </motion.div>
  );
}

export default Register;
