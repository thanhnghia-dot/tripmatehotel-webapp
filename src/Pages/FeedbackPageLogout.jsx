import React, { useState, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUser, FaEnvelope, FaCommentDots } from 'react-icons/fa';
import HeaderLogout from '../Component/HeaderLogout';
import Footer from '../Component/Footer';
const fullWidthMapStyle = {
  width: '100vw',
  height: '400px',
  position: 'relative',
  left: '50%',
  right: '50%',
  marginLeft: '-50vw',
  marginRight: '-50vw',
};

function FeedbackPageLogout() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
  });

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const { feedback } = formData;

    if (!feedback) {
      setError('Please enter your feedback.');
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to submit feedback.");
      return;
    }

    try {
      const dataToSend = {
        content: feedback,
        type: "FEEDBACK"
      };

      await axios.post('http://localhost:8080/api/feedback', dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Thank you for your feedback!');
      setFormData({ name: '', email: '', feedback: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
      console.error("Feedback error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
      <>
     <HeaderLogout />
      <div className="position-relative overflow-hidden rounded shadow mb-5" style={{ maxHeight: 600 }}>
        <video
          autoPlay
          muted
          loop
          className="w-100"
          style={{ height: 500, objectFit: 'cover', display: 'block' }}
        >
          <source src="/assets/videos/v3.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="container my-5" style={{ maxWidth: 600 }}>
        <h2 className="text-center mb-4 text-danger" data-aos="fade-down">
          Feedback & Location
        </h2>

        <div
          className="p-4 bg-white rounded-4 shadow-sm border border-danger"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <h4 className="mb-3 text-danger fw-bold">Send us your feedback</h4>

          {error && <div className="alert alert-danger small">{error}</div>}
          {success && <div className="alert alert-success small">{success}</div>}

          <form onSubmit={handleSubmit} noValidate className="mt-3">
            <div className="form-floating mb-3">
              <input
                type="text"
                id="name"
                name="name"
                className="form-control border border-danger rounded-3"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
              <label htmlFor="name"><FaUser className="me-2 text-danger" />Name</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="email"
                id="email"
                name="email"
                className="form-control border border-danger rounded-3"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email"
                required
              />
              <label htmlFor="email"><FaEnvelope className="me-2 text-danger" />Email</label>
            </div>

            <div className="mb-3">
              <label htmlFor="feedback" className="form-label fw-semibold text-danger">
                <FaCommentDots className="me-2" />Feedback *
              </label>
              <textarea
                id="feedback"
                name="feedback"
                rows="4"
                className="form-control border border-danger rounded-3"
                value={formData.feedback}
                onChange={handleChange}
                placeholder="Write your feedback here..."
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-danger w-100 rounded-pill fw-semibold py-2"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default FeedbackPageLogout;
