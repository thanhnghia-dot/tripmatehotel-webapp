import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';
 // hoặc dùng context / Redux nếu bạn có

const Footer = () => {
    const [showSignInModal, setShowSignInModal] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);
const handleProtectedClick = (e, path) => {
  if (!isLoggedIn) {
    e.preventDefault(); // ngăn chuyển trang
    setShowSignInModal(true);
  }
};

  return (
    <footer id="footer">
      {/* Top Footer */}
      <div className="section">
        <div className="container">
          <div className="row">
            {/* About TripMate */}
            <div className="col-md-3 col-xs-6" data-aos="fade-up" data-aos-delay="100">
              <div className="footer">
                <h3 className="footer-title">About TripMate</h3>
                <p>TripMate helps you plan, organize, and share amazing trips with your friends and family.</p>
                <ul className="footer-links">
                  <li><a href="#"><i className="fa fa-map-marker"></i> 
275 Nguyen Van Dau, Binh Loi Trung Ward, HCMC; 62 Street 36, Van Phuc Urban Area, Hiep Binh Ward, HCMC</a></li>
                  <li><a href="#"><i className="fa fa-phone"></i> 0833 999 810 (HN) - 0834 999 810 (HCM)</a></li>
                  <li><a href="#"><i className="fa fa-envelope-o"></i> hkhai6102@gmail.com</a></li>
                </ul>
              </div>
            </div>

            {/* Features (cái cũ Categories) */}
            <div className="col-md-3 col-xs-6" data-aos="fade-up" data-aos-delay="200">
              <div className="footer">
                <h3 className="footer-title">Features</h3>
              <ul className="footer-links">
  <li><Link to={isLoggedIn ? "/TripPage" : "#"} onClick={(e) => handleProtectedClick(e, "/TripPage")}>My Trip</Link></li>
  <li><Link to={isLoggedIn ? "/album" : "#"} onClick={(e) => handleProtectedClick(e, "/album")}>Album</Link></li>
  <li><Link to={isLoggedIn ? "/hotel" : "#"} onClick={(e) => handleProtectedClick(e, "/hotel")}>Hotel</Link></li>
  <li><Link to={isLoggedIn ? "/budget" : "#"} onClick={(e) => handleProtectedClick(e, "/budget")}>Budget</Link></li>
  <li><Link to={isLoggedIn ? "/Article" : "#"} onClick={(e) => handleProtectedClick(e, "/Article")}>Article</Link></li>
  <li><Link to={isLoggedIn ? "/feedback" : "#"} onClick={(e) => handleProtectedClick(e, "/feedback")}>Feedback</Link></li>
</ul>
 {showSignInModal && (
        <div className="modal-overlay" onClick={() => setShowSignInModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h5 className="mb-3">🔐 Sign In Required</h5>
            <p>You must sign in to use all features of TripMate.</p>
            <Link to="/login" className="btn btn-primary mt-2">Go to Sign In</Link>
            <button onClick={() => setShowSignInModal(false)} className="btn btn-link text-danger mt-2">Close</button>
          </div>
        </div>
      )}
              </div>
            </div>

            {/* Support (thay bằng câu mô tả) */}
            <div className="col-md-3 col-xs-6" data-aos="fade-up" data-aos-delay="300">
              <div className="footer">
                <h3 className="footer-title">Support</h3>
                <p>Need help? Our support team is here to assist you with any questions or issues.</p>
                <p>Contact us anytime and we'll make sure your trip planning goes smoothly!</p>
              </div>
            </div>

            {/* Account (thay bằng câu mô tả) */}
            <div className="col-md-3 col-xs-6" data-aos="fade-up" data-aos-delay="400">
              <div className="footer">
                <h3 className="footer-title">Account</h3>
                <p>Manage your profile, track your trips, and customize your experience with TripMate.</p>
                <p>Sign in to start planning your next adventure!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
 <div className="row">
            <div className="col-md-12 text-center">
          
              <span className="copyright">
                © {new Date().getFullYear()} TripMate. All rights reserved | Made with <i className="fa fa-heart-o" aria-hidden="true"></i> by Your Team
              </span>
            </div>
          </div>
      {/* Bottom Footer */}
     
    </footer>
  );
}

export default Footer;
