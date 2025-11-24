import React, { useState, useEffect } from 'react';
import './Home.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import HeaderLogout from '../Component/HeaderLogout';
import Footer from '../Component/Footer';
import './HomeLogout.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
const photoList = [
  "/assets/img/b1.jpg",
  "/assets/img/b2.jpg",
  "/assets/img/b3.jpg",
  "/assets/img/b4.jpg",
];

const defaultImages = [
  "/assets/img/trip1.jpg", "/assets/img/trip2.jpg", "/assets/img/trip3.jpg",
  "/assets/img/trip4.jpg", "/assets/img/trip5.jpg", "/assets/img/trip6.jpg",
  "/assets/img/trip7.jpg", "/assets/img/trip8.jpg", "/assets/img/trip9.jpg",
  "/assets/img/trip10.jpg"
];


function HomeLogout() {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [modalSrc, setModalSrc] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [error, setError] = useState(null);
  const [testimonialPage, setTestimonialPage] = useState(0);
  const [testimonialTotalPages, setTestimonialTotalPages] = useState(1);
  const [trips, setTrips] = useState([]);
  const [tripPage, setTripPage] = useState(0);
  const tripsPerPage = 4;
useEffect(() => {
  AOS.init({ duration: 800, once: true });

  const token = localStorage.getItem('token');
  if (!token) {
    setShowSignInModal(true); // Hiện modal nếu chưa đăng nhập
  }

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/hotel-reviews/feedback-all', {
        params: { page: testimonialPage, size: 6 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setTestimonials(response.data.data.elementList);
      setTestimonialTotalPages(response.data.data.totalPages);
    } catch (error) {
      setError('Failed to load testimonials: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  fetchTestimonials();
}, [testimonialPage]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    const fetchTestimonials = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/hotel-reviews/feedback-all', {
          params: { page: testimonialPage, size: 6 },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTestimonials(response.data.data.elementList);
        setTestimonialTotalPages(response.data.data.totalPages);
      } catch (error) {
        setError('Failed to load testimonials: ' + (error.response?.data?.message || 'Unknown error'));
      }
    };

    fetchTestimonials();
  }, [testimonialPage]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:8080/api/trips/public', {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    })
    .then(res => {
      if (res.data.status === 200) setTrips(res.data.data);
    })
    .catch(err => console.error('❌ Error fetching public trips:', err));
  }, []);

  const paginatedTrips = trips.slice(tripPage * tripsPerPage, (tripPage + 1) * tripsPerPage);
  const tripTotalPages = Math.ceil(trips.length / tripsPerPage);

  const openModal = (src) => setModalSrc(src);
  const closeModal = () => setModalSrc(null);

  return (
    <>
     <HeaderLogout />
    <div className="home-page" data-aos="fade-up">
      {/* Hero Section */}
      <section className="hero-section section-spacing" data-aos="fade-up">
        <video className="hero-video" autoPlay muted loop>
          <source src="/assets/videos/v2.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay">
          <h1>Welcome to TripMate</h1>
          <p>Plan, share and enjoy your journeys together.</p>
          <Link to="/TripPage" className="hero-button">Start Your Trip</Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section container section-spacing">
        <div className="row text-center" data-aos="fade-up">
          <h2 className="mb-4">What You Can Do</h2>
          {[
            { icon: "map", title: "Create Trips", desc: "Plan your destinations and timelines." },
            { icon: "list", title: "Checklist", desc: "Prepare everything with shared lists." },
            { icon: "camera", title: "Photo Album", desc: "Keep memories with trip photo albums." },
            { icon: "money", title: "Budget Tracker", desc: "Track your spending and split bills easily." },
          ].map((item, index) => (
            <div key={index} className="col-md-3" data-aos="zoom-in" data-aos-delay={(index + 1) * 100}>
              <i className={`fa fa-${item.icon} fa-3x mb-2`}></i>
              <h5>{item.title}</h5>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Public Trips Section */}
      <section className="public-trips-section">
          <div className="container">
            <h3 data-aos="fade-right">🌍 Public Trips</h3>

            {paginatedTrips.length > 0 ? (
              <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={20}
                slidesPerView={4}
                breakpoints={{
                  0: { slidesPerView: 1 },
                  576: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  992: { slidesPerView: 4 },
                }}
              >
                {paginatedTrips.map((trip) => {
                  const imgSrc =
                    trip.imageUrl ||
                    defaultImages[Math.floor(Math.random() * defaultImages.length)];
                  return (
                    <SwiperSlide key={trip.tripId}>
                      <div className="public-trip-card" data-aos="fade-up">
                        <div className="position-relative">
                          <img src={imgSrc} alt="Trip" />
                          <div
                            className="public-trip-overlay"                           
                          >
                            {trip.name}
                          </div>
                        </div>
                        <div className="card-body d-flex flex-column">
                          <h6>{trip.destination}</h6>
                          <p>
                            <strong>From:</strong> {trip.departurePoint}
                            <br />
                            <strong>To:</strong> {trip.destination}
                            <br />
                            <strong>Start:</strong> {trip.startDate}
                            <br />
                            <strong>End:</strong> {trip.endDate}
                            <br />
                            <strong>Status:</strong>{" "}
                            <span
                              className={
                                trip.status === "Planning"
                                  ? "text-warning"
                                  : trip.status === "Ongoing"
                                    ? "text-primary"
                                    : "text-success"
                              }
                            >
                              {trip.status}
                            </span>
                            <br />
                            <strong>Type:</strong>{" "}
                            {trip.type === "du_lich" ? "Leisure" : "Business"}
                            <br />
                            <strong>Budget:</strong> $
                            {trip.totalAmount?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            ) : (
              <p className="text-center">No public trips found.</p>
            )}
          </div>
        </section>

      {/* Remaining sections (Photo grid, About, Destinations, Testimonials) stay unchanged */}

      {/* Photo Grid */}
    {/* 3D Coverflow Photo Grid */}
<section className="container section-spacing" data-aos="fade-up">
  <h3 className="text-center mb-4">Explore Experiences</h3>
  <Swiper
    effect={'coverflow'}
    grabCursor={true}
    centeredSlides={true}
    slidesPerView={'auto'}
    loop={true}
    navigation={true}
    pagination={{ clickable: true }}
    coverflowEffect={{
      rotate: 50,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    }}
    modules={[EffectCoverflow, Navigation, Pagination]}
    className="coverflow-swiper"
  >
    {photoList.map((src, index) => (
      <SwiperSlide
        key={index}
        style={{ width: '300px' }}
        onClick={() => openModal(src)}
      >
        <img
          src={src}
          alt={`Trip ${index + 1}`}
          className="img-fluid rounded shadow-sm"
        />
      </SwiperSlide>
    ))}
  </Swiper>

  {/* Modal when image is clicked */}
  {modalSrc && (
    <div className="modal-overlay" onClick={closeModal} data-aos="fade-in">
      <img src={modalSrc} alt="Large" className="modal-image" />
    </div>
  )}
</section>

      {/* About */}
      <section className="about-section container section-spacing" data-aos="fade-up">
        <h3 className="text-center mb-4">Why TripMate?</h3>
        <p className="text-center about-text">
          TripMate is your ultimate travel companion that helps you plan amazing journeys with friends and family.
          From organizing trips to capturing memories and managing expenses — we do it all in one place.
        </p>
      </section>

      {/* Destinations */}
      <section className="destinations-section container section-spacing">
        <h3 className="text-center mb-4" data-aos="fade-up">Popular Destinations</h3>
        <div className="row text-center">
          {["paris", "tokyo", "newyork", "london"].map((city, index) => (
            <div className="col-md-3 mb-4" data-aos="zoom-in" data-aos-delay={`${(index + 1) * 100}`} key={city}>
              <div className="destination-card shadow-sm">
                <img src={`/assets/img/${city}.jpg`} className="img-fluid rounded" alt={city} />
                <h5 className="mt-2">{city.charAt(0).toUpperCase() + city.slice(1).replace("newyork", "New York, USA").replace("tokyo", "Tokyo, Japan").replace("paris", "Paris, France").replace("london", "London, UK")}</h5>
                <p>{city === "paris" ? "The city of lights, romance, and rich history." : city === "tokyo" ? "Where tradition meets technology and innovation." : city === "newyork" ? "The city that never sleeps — full of energy and culture." : "Historic charm with modern vibrance."}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section container section-spacing" data-aos="fade-up">
        <h3 className="text-center mb-4">What Our Users Say</h3>
        {error && <p className="text-center text-danger">{error}</p>}
        <div className="row text-center">
          {testimonials.map((testimonial, index) => (
            <div className="col-md-4 mb-3" key={testimonial.id} data-aos={index % 2 === 0 ? "flip-left" : "flip-right"} data-aos-delay={(index + 1) * 100}>
              <div className="testimonial-card p-4 shadow-sm rounded bg-light">
                <i className="fa fa-quote-left fa-2x text-primary mb-3"></i>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <h6 className="mt-3 fw-bold testimonial-username">— {testimonial.userName}</h6>
              </div>
            </div>
          ))}
        </div>
        <div className="pagination mt-4">
          <button onClick={() => setTestimonialPage((prev) => Math.max(prev - 1, 0))} disabled={testimonialPage === 0} className="pagination-btn">Previous</button>
          <div className="pagination-numbers">
            {Array.from({ length: testimonialTotalPages }, (_, index) => (
              <button key={index} onClick={() => setTestimonialPage(index)} className={`pagination-number ${testimonialPage === index ? 'active' : ''}`}>{index + 1}</button>
            ))}
          </div>
          <button onClick={() => setTestimonialPage((prev) => Math.min(prev + 1, testimonialTotalPages - 1))} disabled={testimonialPage >= testimonialTotalPages - 1} className="pagination-btn">Next</button>
        </div>
      </section>
    </div>
   {showSignInModal && (
  <div className="sign-in-modal-overlay" onClick={() => setShowSignInModal(false)}>
    <div className="sign-in-modal-content" onClick={(e) => e.stopPropagation()}>
      <h5 className="sign-in-modal-title">🔐 Sign In Required</h5>
      <p className="sign-in-modal-text">You must sign in to use all features of TripMate.</p>
      <Link to="/login" className="sign-in-modal-btn primary-btn">Go to Sign In</Link>
<button onClick={() => setShowSignInModal(false)} className="modal-close-btn">
  <span className="close-icon">×</span> Close
</button>
    </div>
  </div>
)}

     <Footer />
     </>
  );
}

export default HomeLogout;
