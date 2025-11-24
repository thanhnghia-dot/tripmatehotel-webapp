import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./AssignHotel.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaExclamationTriangle } from "react-icons/fa";
function AssignHotelPage({ userId }) {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [recommendedHotels, setRecommendedHotels] = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [acceptedMemberCount, setAcceptedMemberCount] = useState(null);
  const [selectedCheckIn, setSelectedCheckIn] = useState("");
  const [selectedCheckOut, setSelectedCheckOut] = useState("");
  const [tripRooms, setTripRooms] = useState([]);
  const [allTripRooms, setAllTripRooms] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [aiRecommendedRooms, setAIRecommendedRooms] = useState([]);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [selectedNights, setSelectedNights] = useState(1);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [budgetPercent, setBudgetPercent] = useState(40);
  const [sortOption, setSortOption] = useState("price-asc");
  const [showReviewsModal, setShowReviewsModal] = useState(false);
const [selectedHotel, setSelectedHotel] = useState(null);

const [reviews, setReviews] = useState([]);
const [loadingReviews, setLoadingReviews] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const token = localStorage.getItem("token");
  <>{/* Các thành phần khác */}</>;
  const goToHotelDetails = (hotelId) => {
    navigate(`/hotels/${hotelId}`);
  };
  const amenityOptions = [
    { id: 1, name: "Wi-Fi" },
    { id: 2, name: "Swimming Pool" },
    { id: 3, name: "Gym Room" },
    { id: 4, name: "Parking" },
    { id: 5, name: "Room Service" },
    { id: 6, name: "Spa" },
    { id: 7, name: "Restaurant" },
    { id: 8, name: "24/7 Reception" },
    { id: 9, name: "Airport Shuttle" },
    { id: 10, name: "Bar / Lounge" },
    { id: 11, name: "Breakfast Included" },
    { id: 12, name: "Pet Friendly" },
    { id: 13, name: "Non-smoking Rooms" },
    { id: 14, name: "Laundry Service" },
    { id: 15, name: "Concierge" },
    { id: 16, name: "Business Center" },
    { id: 17, name: "Meeting Rooms" },
    { id: 18, name: "Elevator" },
    { id: 19, name: "Air Conditioning" },
    { id: 20, name: "Sauna" },
    { id: 21, name: "Massage Service" },
    { id: 22, name: "Daily Housekeeping" },
    { id: 23, name: "Childcare / Babysitting" },
    { id: 24, name: "Bicycle Rental" },
    { id: 25, name: "Private Beach" },
  ];

  useEffect(() => {
    fetch("http://localhost:8080/api/trip-rooms/all")
      .then((res) => res.json())
      .then((data) => setAllTripRooms(data))
      .catch((err) => console.error(err));
  }, []);
  useEffect(() => {
    const fetchTripRooms = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/trip-rooms?tripId=${tripId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTripRooms(res.data); // data gồm {roomId, checkIn, checkOut}
      } catch (err) {
        console.error("Failed to load trip rooms:", err);
      }
    };
    fetchTripRooms();
    const fetchTripAndHotels = async () => {
      try {
        const tripResponse = await axios.get(
          `http://localhost:8080/api/trips/${tripId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const tripData = tripResponse.data.data;
        setTrip(tripData);
        await fetchRecommendations(tripData.destination);
        const hotelResponse = await axios.get(
          "http://localhost:8080/api/hotels/search",
          {
            params: { address: tripData.destination, size: 50 },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const hotelData = hotelResponse.data.data.elementList;
        if (hotelData.length === 0) {
          setError("No hotels available for this destination");
        } else {
          setHotels(hotelData);
          setError(null);
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to load trip or hotels:", err);
        setError("Failed to load hotels");
        setLoading(false);
      }
    };

    const fetchAcceptedMembers = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/trips/${tripId}/member-count`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Member count response:", res.data);
        // Debug xem dữ liệu API trả về
        setAcceptedMemberCount(res.data);
      } catch (error) {
        console.error("Failed to fetch accepted members count:", error);
      }
    };
    fetchTripAndHotels();
    fetchAcceptedMembers(); // Gọi riêng, không await cũng được vì không phụ thuộc nhau
  }, [token, tripId]);

  const fetchRecommendations = async (address) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/hotels/recommend`,
        {
          params: { address },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRecommendedHotels(res.data);
    } catch (err) {
      console.error("Failed to fetch recommended hotels:", err);
    }
  };
  const handleHotelSelect = async (hotelId) => {
    setSelectedHotelId(hotelId);
    setRooms([]);
    setSelectedTypeId(null);
    setRoomBookings([]);
    try {
      const roomTypeRes = await axios.get(
        `http://localhost:8080/api/rooms-types?hotelId=${hotelId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const hotelRoomTypes = roomTypeRes.data.filter(
        (rt) => rt.hotelId === hotelId
      );
      setRoomTypes(hotelRoomTypes);
    } catch (err) {
      console.error("Error loading room types:", err);
      setRoomTypes([]);
    }
  };
 const handleOpenReviews = async (hotel) => {
  setSelectedHotel(hotel);
  setShowReviewsModal(true);
  setLoadingReviews(true);

  try {
    // API giống HotelDetailsPage
    const res = await axios.get(`http://localhost:8080/api/hotel-reviews/${hotel.hotelId}`);
    
    // Nếu backend trả { reviews: [...] } thì phải lấy res.data.reviews
    setReviews(Array.isArray(res.data.reviews) ? res.data.reviews : res.data);
  } catch (err) {
    console.error("Error loading reviews:", err);
    setReviews([]);
  } finally {
    setLoadingReviews(false);
  }
};

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: rating >= i ? '#facc15' : '#ccc', fontSize: '2rem' }}>★</span>
      );
    }
    return <span>{stars}</span>;
  };
  const getFullUrl = (url) => (url?.startsWith('http') ? url : `http://localhost:8080${url}`);
  const handleRoomToggle = (roomId) => {
  const isAlreadySelected = roomBookings.some((rb) => rb.roomId === roomId);

  if (isAlreadySelected) {
    // Deselect the room => remove from roomBookings
    setRoomBookings(roomBookings.filter((rb) => rb.roomId !== roomId));
  } else {
    // Nếu chưa chọn ngày, fallback dùng trip.startDate và trip.endDate
    const checkIn = selectedCheckIn || trip.startDate;
    const checkOut = selectedCheckOut || trip.endDate;

    // Hàm parse hỗ trợ cả DD/MM/YYYY và YYYY-MM-DD
    const parseDate = (str) => {
      if (str.includes("/")) {
        const [day, month, year] = str.split("/");
        return new Date(year, month - 1, day);
      } else if (str.includes("-")) {
        const [year, month, day] = str.split("-");
        return new Date(year, month - 1, day);
      }
      return new Date(str);
    };

    const checkInDate = parseDate(checkIn);
    const checkOutDate = parseDate(checkOut);
    const tripStartDate = parseDate(trip.startDate);
    const tripEndDate = parseDate(trip.endDate);

    // Kiểm tra hợp lệ
    if (checkInDate >= checkOutDate) {
      toast.error("Check-Out date must be after Check-In date");
      return;
    }

    if (checkInDate < tripStartDate || checkOutDate > tripEndDate) {
      toast.error("Check-In and Check-Out must be within the trip dates");
      return;
    }

    // Kiểm tra trùng phòng
    const isOverlapping = allTripRooms.some((tr) => {
      if (tr.roomId !== roomId) return false;
      const bookedIn = parseDate(tr.checkIn);
      const bookedOut = parseDate(tr.checkOut);
      return bookedIn < checkOutDate && bookedOut > checkInDate;
    });

    if (isOverlapping) {
      toast.error("This room is already booked for the selected dates");
      return;
    }

    // Thêm phòng vào booking
    setRoomBookings([
      ...roomBookings,
      { roomId, checkIn, checkOut },
    ]);
  }
};
  function isRoomAvailable(roomId, checkIn, checkOut) {
    if (!checkIn || !checkOut) return false; // nếu chưa chọn date thì không hiển thị
    const selectedIn = new Date(checkIn);
    const selectedOut = new Date(checkOut);

    if (selectedIn >= selectedOut) return false; // Check-In phải nhỏ hơn Check-Out

    return !allTripRooms.some((tr) => {
      if (tr.roomId !== roomId) return false;

      const bookedIn = new Date(tr.checkIn);
      const bookedOut = new Date(tr.checkOut);

      return bookedIn < selectedOut && bookedOut > selectedIn;
    });
  }

  const handleTypeSelect = async (typeId) => {
    setSelectedTypeId(typeId);
    setRooms([]);
    const type = roomTypes.find((t) => t.id === typeId);
    setSelectedRoomType(type);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/rooms-types/${typeId}/rooms`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = res.data;
      setRooms(data);
      const initialIndices = data.reduce(
        (acc, room) => ({ ...acc, [room.id]: 0 }),
        {}
      );
      setCurrentImageIndices(initialIndices);
      setRoomBookings([]);
    } catch (err) {
      console.error("Error loading rooms by type:", err);
      setRooms([]);
    }
  };
  const handleNextImage = (roomId, imageCount) => {
    setCurrentImageIndices((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] + 1) % imageCount,
    }));
  };
  const handlePrevImage = (roomId, imageCount) => {
    setCurrentImageIndices((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] - 1 + imageCount) % imageCount,
    }));
  };
  useEffect(() => {
  const interval = setInterval(() => {
    setCurrentImageIndices((prev) => {
      const updated = { ...prev };
      rooms.forEach((room) => {
        const count = room.images?.length || 0;
        if (count > 1) {
          updated[room.id] = ((prev[room.id] ?? 0) + 1) % count;
        }
      });
      return updated;
    });
  }, 3000);

  return () => clearInterval(interval);
}, [rooms]);
  const totalCapacity = roomBookings.reduce((total, booking) => {
    const room = rooms.find((r) => r.id === booking.roomId);
    return total + (room?.capacity || 0);
  }, 0);

  // Ví dụ nút book phòng bị disable nếu capacity không đủ
  const canBook =
    selectedHotelId &&
    roomBookings.length > 0 &&
    totalCapacity >= acceptedMemberCount &&
    !Object.values(validationErrors).some(
      (err) => err?.checkIn || err?.checkOut
    );
  useEffect(() => {
    // fetch trip, hotels, tripRooms, etc.
  }, [tripId, token]);

  const handleAssign = async () => {
    if (!token) {
      toast.warning("⚠️ No authentication token found. Please log in.");
      navigate("/login");
      return;
    }

    const hasErrors = Object.values(validationErrors).some(
      (err) => err?.checkIn || err?.checkOut
    );
    if (hasErrors) {
      toast.error("Please fix validation errors before assigning the hotel.");
      return;
    }

    if (roomBookings.some((rb) => !rb.checkIn || !rb.checkOut)) {
      toast.warn(
        "Please provide both check-in and check-out times for all selected rooms."
      );
      return;
    }

    const totalSelectedPrice = roomBookings.reduce((total, rb) => {
      const room = rooms.find((r) => r.id === rb.roomId);
      if (!room) return total;

      const nights = Math.max(
        1,
        Math.ceil(
          (new Date(rb.checkOut) - new Date(rb.checkIn)) / (1000 * 60 * 60 * 24)
        )
      );

      const finalPrice =
        room.discountPercentage && room.discountPercentage > 0
          ? room.price - (room.price * room.discountPercentage) / 100
          : room.price;

      return total + (finalPrice || 0) * nights;
    }, 0);

    const budgetNum = Number(trip?.totalAmount);
    if (!trip || !trip.totalAmount || isNaN(budgetNum)) {
      toast.error("Trip budget is invalid or not loaded yet.");
      return;
    }

    if (totalSelectedPrice > budgetNum * 0.4) {
      showBudgetWarningToast(totalSelectedPrice, budgetNum, tripId, navigate);
      return;
    }

    await assignHotel();
  };
  const assignHotel = async () => {
    try {
      const payload = { hotelId: selectedHotelId, roomBookings };
      const response = await axios.post(
        `http://localhost:8080/api/trips/${tripId}/assign-hotel`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        const message = response.data;
        if (message.startsWith("❌")) toast.error(message);
        else {
          toast.success("✅ Hotel assigned successfully!");
          navigate(`/trips/${tripId}`);
        }
      }
    } catch (err) {
      console.error("Error assigning hotel:", err);
      toast.error(
        `❌ Failed to assign hotel: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };
  const showBudgetWarningToast = (totalPrice, budget, tripId, navigate) => {
    const ToastContent = ({ closeToast }) => (
      <div
        style={{
          padding: "20px",
          maxWidth: "500px",
          width: "95%",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          fontFamily: "Inter, sans-serif",
          overflowWrap: "break-word",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "10px",
          }}
        >
          <FaExclamationTriangle
            style={{ color: "#f59e0b", fontSize: "28px" }}
          />
          <h4
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 600,
              color: "#333",
            }}
          >
            ⚠️ Budget Warning
          </h4>
        </div>

        {/* Message */}
        <p style={{ fontSize: "16px", marginBottom: "15px", color: "#555" }}>
          Total room cost <b>${totalPrice.toLocaleString()}</b> exceeds 40% of
          trip budget <b>${budget.toLocaleString()}</b>.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => {
              closeToast();
              toast.info("✏️ Please adjust room selection.", {
                autoClose: 2500,
              });
            }}
            style={{
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#2563eb")}
          >
            Adjust Rooms
          </button>
          <button
            onClick={() => {
              closeToast();
              navigate(`/trips/${tripId}`);
            }}
            style={{
              backgroundColor: "#10b981",
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#059669")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#10b981")}
          >
            Update Budget
          </button>
        </div>
      </div>
    );

    toast.info(<ToastContent />, {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
    });
  };

  const fetchAIRecommendations = async () => {
    if (!tripId) return;
    try {
      const params = new URLSearchParams();
      params.append("nights", selectedNights);
      selectedAmenities.forEach((id) => params.append("amenityIds", id));

      const res = await axios.get(
        `http://localhost:8080/api/ai/budget/suggest-hotels/${tripId}?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAIRecommendedRooms(res.data ?? []);
    } catch (err) {
      console.error("Failed to fetch AI recommendation:", err);
      setAIRecommendedRooms([]);
    }
  };

  // Auto fetch mỗi khi selectedNights hoặc selectedAmenities thay đổi
  // Auto fetch mỗi khi selectedNights hoặc selectedAmenities thay đổi
  useEffect(() => {
    if (showAIRecommendations) fetchAIRecommendations();
  }, [selectedNights, selectedAmenities, showAIRecommendations]);

  // Convert selectedAmenity IDs -> Names
  const selectedAmenityNames = amenityOptions
    .filter((a) => selectedAmenities.includes(a.id))
    .map((a) => a.name);

  const filteredRooms = aiRecommendedRooms.filter((room) => {
    const totalPrice = (room.pricePerNight || 0) * selectedNights;
    const withinBudget = totalPrice <= (trip?.totalAmount || Infinity) * 0.4;
    const hasAmenities = selectedAmenityNames.every((a) =>
      room.amenities?.includes(a)
    );
    return withinBudget && hasAmenities;
  });
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (sortOption === "price-asc") return a.pricePerNight - b.pricePerNight;
    if (sortOption === "price-desc") return b.pricePerNight - a.pricePerNight;
    if (sortOption === "discount")
      return (b.discountPercentage || 0) - (a.discountPercentage || 0);
    return 0;
  });

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error)
    return (
     <div className="custom-error-container">
  <div className="custom-error-message">{error}</div>
</div>
    );
  return (
    <div className="hotel-reservation-wrapper">
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🏨 Hotel Reservation for Trip #{tripId}
      </h2>
      {/* AI Recommendation Modal */}
      
  {showAIRecommendations && (
  <div className="AI-modal">
    <div className="AI-modal modal-xl modal-dialog-centered">
      <div className="AI-modal-content">
        {/* Header */}
        <div className="AI-modal-header">
          <h5 className="AI-room-title">🤖 AI Recommended Rooms</h5>
          <button
            type="button"
            className="AI-close-btn2"
            onClick={() => setShowAIRecommendations(false)}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="AI-modal-body">
          {/* Budget Info */}
          <div className="total-budget mb-2">
            <span className="fw-bold fs-5 text-secondary">Total Trip Budget:</span>
            <span className="fw-bold fs-4 text-primary ms-2">
              ${trip?.totalAmount?.toLocaleString() || 0}
            </span>
          </div>

          {/* Budget Slider */}
          <div className="mb-4">
            <label className="form-label fw-bold fs-5 text-primary">
              Trip Budget Allocation (%)
            </label>
            <div className="budget-slider d-flex align-items-center gap-3 mt-2">
              <input
                type="range"
                min={5}
                max={100}
                value={budgetPercent}
                onChange={(e) => setBudgetPercent(Number(e.target.value))}
                className="form-range slider-highlight"
              />
              <span className="budget-value">{budgetPercent}%</span>
              <span className="budget-amount">
                ${((trip?.totalAmount || 0) * (budgetPercent / 100)).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Number of Nights */}
          <div className="mb-4">
            <label className="form-label fw-semibold mb-2">Number of Nights:</label>
            <input
              type="number"
              min={1}
              value={selectedNights}
              onChange={(e) =>
                setSelectedNights(e.target.value === "" ? 0 : Number(e.target.value))
              }
              className="nights-input"
              placeholder="Enter nights"
            />
          </div>

          {/* Select Hotel */}
     



          {/* Select Amenities */}
          <div className="mb-4">
            <label className="form-label fw-semibold mb-2">Select Amenities:</label>
            <div className="amenities-container">
              {amenityOptions.map((item) => (
                <label key={item.id} className="amenity-item">
                  <input
                    type="checkbox"
                    value={item.id}
                    checked={selectedAmenities.includes(item.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedAmenities((prev) =>
                        checked ? [...prev, item.id] : prev.filter((id) => id !== item.id)
                      );
                    }}
                  />
                  <span>{item.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter / Sort Rooms */}
          <div className="sort-wrapper mb-4">
            <label className="sort-label">Sort by:</label>
            <select
              className="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Discount</option>
            </select>
          </div>

          {/* Rooms */}
          <div className="row g-4">
            {sortedRooms
              // Filter theo hotel đã chọn
              .filter((room) =>
                selectedHotelId ? room.hotelId === selectedHotelId : true
              )
              // Filter theo budget và amenities
              .filter((room) => {
                const totalPrice = (room.pricePerNight || 0) * selectedNights;
                const withinBudget =
                  totalPrice <= ((trip?.totalAmount || 0) * (budgetPercent / 100));
                const hasAmenities = selectedAmenities.every((a) =>
                  room.amenities?.includes(a)
                );
                return withinBudget && hasAmenities;
              })
              // Sort
              .sort((a, b) => {
                if (sortOption === "price-asc") return a.pricePerNight - b.pricePerNight;
                if (sortOption === "price-desc") return b.pricePerNight - a.pricePerNight;
                if (sortOption === "discount")
                  return (b.discountPercentage || 0) - (a.discountPercentage || 0);
                return 0;
              })
              .map((room, idx) => {
                const images = room.imageUrl ? room.imageUrl.split(",") : [];
                const discountedPrice =
                  room.pricePerNight -
                  (room.pricePerNight * (room.discountPercentage || 0)) / 100;
                const savings = room.pricePerNight - discountedPrice;

                return (
                  <div key={idx} className="col-md-6 col-lg-4">
                    <div className="room-card h-100 d-flex flex-column">
                      {/* Carousel */}
                      <div className="AI-room-carousel">
                        <div className="AI-carousel-inner">
                          {images.length > 0 ? (
                            images.map((img, i) => (
                              <div
                                key={i}
                                className={`carousel-item ${i === 0 ? "active" : ""}`}
                              >
                                <img src={img} alt={room.roomName} />
                              </div>
                            ))
                          ) : (
                            <div className="carousel-item active">
                              <img
                                src="https://via.placeholder.com/300x180?text=No+Image"
                                alt="No Image"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="room-card-body d-flex flex-column">
                        <h5 className="room-title">{room.roomName}</h5>
                        <p className="room-hotel">
                          <span className="hotel-label">🏨 Hotel:</span>{" "}
                          <span className="hotel-name">{room.hotelName}</span>
                        </p>

                        <p className="room-price">
                          {room.discountPercentage && room.discountPercentage > 0 ? (
                            <>
                              <span className="old-price">
                                ${room.pricePerNight.toFixed(2)}
                              </span>
                              <span className="final-price">
                                ${discountedPrice.toFixed(2)}
                              </span>
                              <span className="discount-badge">
                                -{room.discountPercentage}%
                              </span>
                            </>
                          ) : (
                            <span className="final-price">
                              ${room.pricePerNight.toFixed(2)}
                            </span>
                          )}
                        </p>

                        {room.discountPercentage > 0 && (
                          <p className="savings">You save ${savings.toFixed(2)}!</p>
                        )}

                        <p className="total-price">
                          <strong>Total Price:</strong>{" "}
                          ${(discountedPrice * selectedNights).toFixed(2)}
                        </p>

                        <div className="room-amenities">
                          {room.amenities?.length > 0 ? (
                            room.amenities.map((a, i) => (
                              <span key={i} className="amenity-chip">
                                {a}
                              </span>
                            ))
                          ) : (
                            <span className="no-amenities">No amenities listed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  </div>
)}



      {/* Hiển thị recommended hotels ở ngoài button */}

      <div className="container">
        {/* ✅ Đặt recommended hotels trong div */}
      {recommendedHotels.length > 0 && (
  <div className="recommended-hotels-section">
    <h3 className="recommended-hotels-title">Recommended Hotels</h3>

    {recommendedHotels.map((hotel) => (
      <div
        key={hotel.hotelId}
        className="hotel-card-recommend clickable-card"
        onClick={() => handleOpenReviews(hotel)}  // 👈 click để mở modal
      >
    <h5 className="hotel-name-label">
  {hotel.hotelName}
  <span className="hotel-review-hint"> 👆 Click to see reviews</span>
</h5>

        <div className="hotel-rating-info">
          ⭐ {hotel.averageRating.toFixed(1)} · 👁 {hotel.reviewCount} reviews
        </div>
        <div className="hotel-reason">{hotel.reason}</div>
      </div>
    ))}
  </div>
)}

  <button
  className="hotel-assistant-btn mb-3"
  onClick={() => {
    setShowAIRecommendations(true);
    fetchAIRecommendations();
  }}
>
  🤖 Hotel Assistant
</button>
{showReviewsModal && (
  <div className="reviews-modal-wrapper">
    <div className="reviews-modal-dialog">
      <div className="reviews-modal-content">
        {/* Header */}
        <div className="reviews-modal-header">
          <h5 className="reviews-modal-title">
            💬 Hotel Reviews ({reviews.length})
          </h5>

          <button
            className="reviews-modal-close"
            onClick={() => setShowReviewsModal(false)}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="reviews-modal-body">
          {loadingReviews ? (
            <div className="reviews-skeleton-container">
              <div className="reviews-skeleton reviews-skeleton-text"></div>
              <div className="reviews-skeleton reviews-skeleton-text"></div>
              <div className="reviews-skeleton reviews-skeleton-text short"></div>
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-muted">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="reviews-card shadow-sm p-4 mb-4">
               <div className="reviews-card">
  <div className="reviews-card-header">
    <span className="review-user">👤 {review.userName}</span>
    <span className="review-stars">{renderStars(review.rating)}</span>
  </div>
  <p className="review-comment">📝 {review.comment}</p>
  <p className="review-date">📅 {new Date(review.createdAt).toLocaleDateString("en-GB")}</p>
  {review.image && (
    <div className="review-image-wrapper">
      <img src={getFullUrl(review.image)} alt="review uploaded" />
    </div>
  )}
</div> 
              
             
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
)}

      </div>
      <div className="row">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
          >
            <div
              className={`hotel-card ${
                selectedHotelId === hotel.id ? "selected" : ""
              }`}
              onClick={() => handleHotelSelect(hotel.id)}
            >
              {hotel.imageUrl ? (
                <img src={hotel.imageUrl} alt={hotel.name} />
              ) : (
                <div className="no-image">No Image</div>
              )}
              <div className="info">
                <h5>{hotel.name}</h5>
                <p>
                  📍{" "}
                  {hotel.streetAddress
                    ? `${hotel.streetAddress}, ${hotel.address}`
                    : hotel.address}
                </p>

                {hotel.reviewCount !== undefined && (
                  <p className="rating-info">
                    ⭐ {hotel.averageRating} / 5 ({hotel.reviewCount} reviews){" "}
                  </p>
                )}
              </div>
             <button
  className="view-btn mt-2"
  onClick={(e) => {
    e.stopPropagation(); // tránh trigger chọn hotel
    goToHotelDetails(hotel.id);
  }}
>
  View Hotel
</button>
            </div>
          </div>
        ))}
      </div>
      {selectedHotelId && roomTypes.length > 0 && (
        <>
          <h4 className="mt-4">Select Room Type</h4>
          <div className="room-type-wrapper">
            {roomTypes.map((type) => (
              <div
                key={type.id}
                className={`room-type-card ${
                  selectedTypeId === type.id ? "selected" : ""
                }`}
                onClick={() => {
                  handleTypeSelect(type.id);
                  setShowRoomModal(true);
                }}
              >
                <img
                  src={
                    type.imageUrls?.[0] ||
                    "https://via.placeholder.com/300x180?text=No+Image"
                  }
                  alt={type.typeName}
                  className="room-type-img"
                />
                <div className="room-type-info">
                  <h5 className="room-type-title">{type.typeName}</h5>
                  <p className="room-type-desc">
                    {type.rooms?.length || 0} rooms
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

        {showRoomModal && selectedRoomType && (
          <div className="room-modal">
            <div className="room-modal ">
              <div className="room-modal-content">
                <div className="room-modal-header">
                  <h5 className="room-modal-title">
                    {selectedRoomType?.typeName}
                  </h5>
                  <button
                    type="btn"
                    className="room-close"
                    onClick={() => setShowRoomModal(false)}
                  >
                    &times;
                  </button>
                </div>

                <div className="room-modal-body">
                    {selectedRoomType?.description && (
                      <p className="room-type-desc-room">
                        {selectedRoomType.description}
                      </p>
                    )}
                  <p className="member-count">
                    👥 Members in trip:{" "}
                    <strong>{acceptedMemberCount ?? "loading..."}</strong>
                  </p>
                  <p className="member-count">💰 Budget: ${trip.totalAmount}</p>

                  <div className="mb-4 date-filter-container p-3">
                    <label className="form-label filter-label">
                      Filter by Date
                    </label>
                    <div className="d-flex gap-3 flex-wrap">
            <div className="date-time-field">
    <label>Check-In</label>
  <input
    type="date"
    value={selectedCheckIn ? selectedCheckIn.split("T")[0] : ""}
    onChange={(e) => {
      const newDate = e.target.value; // yyyy-MM-dd
      if (!newDate) {
        setSelectedCheckIn("");
        return;
      }

      const newCheckIn = `${newDate}T14:00`;

      // validate: so sánh string yyyy-MM-dd
      if (newDate < trip.startDate.split("T")[0] || newDate > trip.endDate.split("T")[0]) {
        toast.error("Check-In phải nằm trong thời gian của trip");
        return;
      }

      if (selectedCheckOut && newCheckIn >= selectedCheckOut) {
        toast.error("Check-In phải nhỏ hơn Check-Out");
        setSelectedCheckIn("");
        return;
      }

      setSelectedCheckIn(newCheckIn);
    }}
    min={trip.startDate.split("T")[0]}   // 👈 dùng trực tiếp từ DB
    max={trip.endDate.split("T")[0]}     // 👈 dùng trực tiếp từ DB
  />

  </div>

  <div className="date-time-field">
    <label>Check-Out</label>
    <input
    type="date"
    value={selectedCheckOut ? selectedCheckOut.split("T")[0] : ""}
    onChange={(e) => {
      const newDate = e.target.value;
      if (!newDate) {
        setSelectedCheckOut("");
        return;
      }

      const newCheckOut = `${newDate}T12:00`;

      if (newDate < trip.startDate.split("T")[0] || newDate > trip.endDate.split("T")[0]) {
        toast.error("Check-Out phải nằm trong thời gian của trip");
        return;
      }

      if (selectedCheckIn && newCheckOut <= selectedCheckIn) {
        toast.error("Check-Out phải lớn hơn Check-In");
        setSelectedCheckOut("");
        return;
      }

      setSelectedCheckOut(newCheckOut);
    }}
    min={trip.startDate.split("T")[0]}
    max={trip.endDate.split("T")[0]}
  />
  </div>
                    </div>
                  </div>
                  {rooms.filter((r) => r.roomStatus === "AVAILABLE").length >
                    0 && (
                    <>
                      <h4 className="available-rooms-title mt-4">
                        Available Rooms
                      </h4>
                      <div className="available-rooms-wrapper row">
                        {rooms
                          .filter((room) => room.roomStatus === "AVAILABLE")
                          .map((room) => {
                            const images = room.imageUrl
                              ? room.imageUrl.split(",")
                              : [];
                            const currentImageIndex =
                              currentImageIndices[room.id] || 0;
                            const hasSelectedDates =
                              selectedCheckIn && selectedCheckOut;

                            const availableNow = hasSelectedDates
                              ? isRoomAvailable(
                                  room.id,
                                  selectedCheckIn,
                                  selectedCheckOut
                                )
                              : true;

                            const isSelected = roomBookings.some(
                              (rb) => rb.roomId === room.id
                            );

                            // Tính tổng capacity đã chọn
                            const totalSelectedCapacity = roomBookings.reduce(
                              (total, rb) => {
                                const r = rooms.find((r) => r.id === rb.roomId);
                                return total + (r?.capacity || 0);
                              },
                              0
                            );

                            // Số thành viên còn cần phòng
                            const remainingMembers = Math.max(
                              0,
                              acceptedMemberCount - totalSelectedCapacity
                            );

                            // Checkbox disable nếu:
                            // 1. chưa chọn ngày
                            // 2. phòng không available
                            // 3. total capacity >= acceptedMemberCount
                            const disableCheckbox =
    !availableNow || // vẫn disable nếu phòng không còn
    (totalSelectedCapacity >= acceptedMemberCount && !isSelected);


                            return (
                         <div key={room.id} className="rm-col">
  <div
    className={`rm-card ${isSelected ? "rm-card-selected" : "rm-card-default"} ${!hasSelectedDates ? "rm-card-disabled" : ""}`}
  >
    <div className="rm-image-wrapper">
      {images.length > 0 ? (
        <img
          src={images[currentImageIndex]}
          alt={room.roomName}
          className="rm-card-img"
        />
      ) : (
        <div className="rm-img-placeholder">No Image</div>
      )}

      {images.length > 1 && (
        <>
          <button
            className="rm-carousel-btn rm-left-btn"
            onClick={() => handlePrevImage(room.id, images.length)}
          >
            ‹
          </button>
          <button
            className="rm-carousel-btn rm-right-btn"
            onClick={() => handleNextImage(room.id, images.length)}
          >
            ›
          </button>
          <div className="rm-carousel-dots">
            {images.map((_, index) => (
              <span
                key={index}
                className={`rm-dot ${index === currentImageIndex ? "rm-dot-active" : ""}`}
                onClick={() => setCurrentImageIndex(index)}
              ></span>
            ))}
          </div>
        </>
      )}
    </div>

    <div className="rm-body">
      <div className="rm-checkbox-wrapper">
        <input
          type="checkbox"
          className="rm-checkbox"
          checked={isSelected}
          disabled={disableCheckbox}
          onChange={() => handleRoomToggle(room.id)}
          id={`rm-check-${room.id}`}
        />
        <label className="rm-checkbox-label" htmlFor={`rm-check-${room.id}`}>
          {room.roomName}
        </label>
      </div>

      <p className="rm-desc">{room.description || "No description available"}</p>

      <p className="rm-info">
        <strong>Capacity:</strong> {room.capacity} people
        {room.capacity < remainingMembers && !isSelected && (
          <span className="rm-members-left">
            ⚠️ Only {room.capacity} people, still not enough for all
          </span>
        )}
      </p>

      <p className="rm-info">
        <strong>Beds:</strong> {room.numberOfBeds ?? "N/A"}
      </p>

      <p className="rm-info">
        <strong>Status:</strong>{" "}
        <span className={`rm-status-badge ${
          hasSelectedDates ? (availableNow ? "rm-available" : "rm-unavailable") : "rm-pending"
        }`}>
          {hasSelectedDates ? (availableNow ? "✔️ Available" : "❌ Unavailable") : "⏳ Select dates to check"}
        </span>
      </p>

      {remainingMembers > 0 && (
        <p className="rm-members-left">Members left to assign: {remainingMembers}</p>
      )}

      <p className="rm-price">
        {room.discountPercentage > 0 ? (
          <>
            <span className="rm-old-price">${room.price.toFixed(2)}</span>
            <span className="rm-final-price">
              ${(room.price - (room.price * room.discountPercentage) / 100).toFixed(2)}
            </span>
            <span className="rm-discount-badge">-{room.discountPercentage}%</span>
          </>
        ) : (
          <span className="rm-final-price">${room.price.toFixed(2)}</span>
        )}
      </p>

      {isSelected && hasSelectedDates && (
        <div className="rm-checkin-wrapper">
          <label className="rm-label">Check-in:</label>
          <input type="datetime-local" className="rm-input" value={selectedCheckIn} readOnly />
          <label className="rm-label">Check-out:</label>
          <input type="datetime-local" className="rm-input" value={selectedCheckOut} readOnly />
        </div>
      )}
    </div>
  </div>
</div>

                            );
                          })}
                      </div>
                    </>
                  )}

                  {rooms.filter((r) => r.roomStatus === "BOOKED").length > 0 && (
                    <>
                      <h4 className="maintenance-title mt-5 text-danger fw-bold">
                        Maintenance Rooms
                      </h4>
                      <div className="maintenance-rooms-wrapper row">
                        {rooms
                          .filter((room) => room.roomStatus === "BOOKED")
                          .map((room) => (
                            <div key={room.id} className="col-md-6 col-lg-4 mb-4">
                              <div className="maintenance-room-card border-danger shadow-sm">
                                <div className="maintenance-room-inner">
                                  {room.imageUrl ? (
                                    <img
                                      src={room.imageUrl.split(",")[0]}
                                      alt={room.roomName}
                                      className="maintenance-room-img rounded-top"
                                    />
                                  ) : (
                                    <div className="maintenance-room-img-placeholder">
                                      No Image
                                    </div>
                                  )}
                                  <div className="card-body d-flex flex-column">
                                    <h5 className="maintenance-room-name fw-bold fs-5">
                                      {room.roomName}
                                    </h5>
                                    <p className="mb-1">
                                      <strong>Capacity:</strong> {room.capacity}{" "}
                                      people
                                    </p>
                                    <p className="mb-1">
                                      <strong>Status:</strong>{" "}
                                      <span className="text-danger">
                                        Maintenance
                                      </span>
                                    </p>

                                    <div className="alert alert-danger text-center mt-auto">
                                      ❌ Room is under maintenance, please choose
                                      another room
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                  <div className="confirm-container">
                    <button
                      className="btn-confirm"
                      onClick={handleAssign}
                      disabled={
                        !selectedHotelId ||
                        !canBook ||
                        roomBookings.length === 0 ||
                        Object.values(validationErrors).some(
                          (err) => err?.checkIn || err?.checkOut
                        )
                      }
                    >
                      ✅ Confirm Booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
export default AssignHotelPage;
