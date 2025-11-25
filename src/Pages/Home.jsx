import React, { useState, useEffect } from 'react';
import './Home.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
const photoList = [
  `${process.env.PUBLIC_URL}/assets/img/b1.jpg`,
  `${process.env.PUBLIC_URL}/assets/img/b2.jpg`,
  `${process.env.PUBLIC_URL}/assets/img/b3.jpg`,
  `${process.env.PUBLIC_URL}/assets/img/b4.jpg`,
];

const defaultImages = [
  `${process.env.PUBLIC_URL}/assets/img/trip1.jpg`,
  `${process.env.PUBLIC_URL}/assets/img/trip2.jpg`,
  `${process.env.PUBLIC_URL}/assets/img/trip3.jpg`,
  `${process.env.PUBLIC_URL}/assets/img/trip4.jpg`,
  `${process.env.PUBLIC_URL}/assets/img/trip5.jpg`,
  `${process.env.PUBLIC_URL}/assets/img/trip6.jpg`,
  `${process.env.PUBLIC_URL}/assets/img/trip7.jpg`,
  `${process.env.PUBLIC_URL}/assets/img/trip8.jpg`,
  `${process.env.PUBLIC_URL}/assets/img/trip9.jpg`,
  `${process.env.PUBLIC_URL}/assets/img/trip10.jpg`,
];
function Home() {
  const [modalSrc, setModalSrc] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [error, setError] = useState(null);
  const [testimonialPage, setTestimonialPage] = useState(0);
  const [testimonialTotalPages, setTestimonialTotalPages] = useState(1);
  const [trips, setTrips] = useState([]);
  const [tripPage, setTripPage] = useState(0);
  const tripsPerPage = 4;
  const [approvedBlogs, setApprovedBlogs] = useState([]);

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
  useEffect(() => {
    // ... các useEffect hiện có

    const fetchApprovedBlogs = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/articles/listArticle");
        const approved = res.data.filter(b => b.status === "APPROVED");
        setApprovedBlogs(approved);
      } catch (err) {
        console.error("❌ Error fetching approved blogs:", err);
      }
    };

    fetchApprovedBlogs();
  }, []);

  const paginatedTrips = trips.slice(tripPage * tripsPerPage, (tripPage + 1) * tripsPerPage);
  const tripTotalPages = Math.ceil(trips.length / tripsPerPage);

  const openModal = (src) => setModalSrc(src);
  const closeModal = () => setModalSrc(null);

  return (
    <div className="home-page" data-aos="fade-up">
      {/* Hero Section */}
      <section className="hero-section section-spacing" data-aos="fade-up">
        <video className="hero-video" autoPlay muted loop>
          <source src={`${process.env.PUBLIC_URL}/assets/videos/v2.mp4`} type="video/mp4" />
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

          {trips.length > 0 ? (
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
              {trips.map((trip) => {
                const imgSrc =
                  trip.imageUrl ||
                  defaultImages[Math.floor(Math.random() * defaultImages.length)];
                return (
                  <SwiperSlide key={trip.id}>
                    <div className="public-trip-card" data-aos="fade-up">
                      <div className="position-relative">
                        <img src={imgSrc} alt="Trip" />
                        <div
                          className="public-trip-overlay"
                          onClick={() =>
                            (window.location.href = `/trips/${trip.id}`)
                          }
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
                        <div className="mt-auto d-flex justify-content-center">
                          <button
                            onClick={() =>
                              (window.location.href = `/trips/${trip.id}`)
                            }
                            className="btn btn-outline-primary btn-sm"
                          >
                            View Details
                          </button>
                        </div>
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

      {/* 3D Coverflow Photo Grid */}

      {/* About */}
      <section className="about-section container section-spacing" data-aos="fade-up">
        <h3 className="text-center mb-4">Why TripMate?</h3>
        <p className="text-center about-text">
          TripMate is your ultimate travel companion that helps you plan amazing journeys with friends and family.
          From organizing trips to capturing memories and managing expenses — we do it all in one place.
        </p>
      </section>

      {/* Approved Blogs Section */}
      <section className="bg-white py-5">
        <div className="container">
          <h3 className="mb-4 fw-bold text-primary" data-aos="fade-right">
            📝 Latest Approved Blogs
          </h3>

          {approvedBlogs.length > 0 ? (
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
              {approvedBlogs.map((blog) => (
                <SwiperSlide key={blog.id}>
                  <div className="card h-100 shadow-lg border-0 rounded-4 overflow-hidden" data-aos="fade-up">
                    <div className="position-relative">
                      <img
                        src={blog.image}
                        className="card-img-top"
                        alt={blog.title}
                        style={{ height: '180px', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h6 className="text-primary text-center mb-2 fw-bold">{blog.title}</h6>
                      <p className="text-muted small mb-2">
                        {blog.description?.slice(0, 80)}...
                      </p>
                      <div className="mt-auto d-flex justify-content-center">
                        <button
                          onClick={() => window.location.href = `/blog/${blog.id}`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          View Blog
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="text-center">📭 No approved blogs found.</p>
          )}
        </div>
      </section>



      {/* Testimonials */}
      {/* Testimonials */}
      <section className="testimonials-section container section-spacing" data-aos="fade-up">
        <h3 className="text-center mb-4">What Our Users Say</h3>
        {error && <p className="text-center text-danger">{error}</p>}

        {testimonials.length > 0 ? (
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={20}
            slidesPerView={3}
            breakpoints={{
              0: { slidesPerView: 1 },
              576: { slidesPerView: 2 },
              992: { slidesPerView: 3 },
            }}
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={testimonial.id}>
                <div
                  className="testimonial-card p-4 shadow-sm rounded bg-light text-center"
                  data-aos={index % 2 === 0 ? "flip-left" : "flip-right"}
                  data-aos-delay={(index + 1) * 100}
                >
                  <i className="fa fa-quote-left fa-2x text-primary mb-3"></i>
                  <p className="testimonial-content">"{testimonial.content}"</p>
                  <h6 className="mt-3 fw-bold testimonial-username">— {testimonial.userName}</h6>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-center">No testimonials found.</p>
        )}
      </section>

    </div>
  );
}

export default Home;
