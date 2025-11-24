import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import AOS from "aos";
import "aos/dist/aos.css";
import "./HotelPage.css";

function HotelPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [availableAddresses, setAvailableAddresses] = useState([]);
  const [selectedStars, setSelectedStars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const elementPerPage = 7;

  const amenityIcons = {
    "Wi-Fi": "bi-wifi",
    "Swimming Pool": "bi-water",
    Gym: "bi-dumbbell",
    Parking: "bi-car-front",
    "Room Service": "bi-bell",
    Spa: "bi-heart-pulse",
    Restaurant: "bi-cup-straw",
    "24/7 Reception": "bi-clock-history",
    "Airport Shuttle": "bi-bus-front",
    "Bar / Lounge": "bi-cup",
    "Breakfast Included": "bi-egg-fried",
    "Pet Friendly": "bi-paw",
    "Non-smoking Rooms": "bi-slash-circle",
    "Laundry Service": "bi-droplet",
    Concierge: "bi-person-vcard",
    "Business Center": "bi-building",
    "Meeting Rooms": "bi-people",
    Elevator: "bi-box-arrow-up",
    "Air Conditioning": "bi-wind",
    Sauna: "bi-fire",
    "Massage Service": "bi-emoji-smile",
    "Daily Housekeeping": "bi-broom",
    "Childcare / Babysitting": "bi-bag-heart",
    "Bicycle Rental": "bi-bicycle",
    "Private Beach": "bi-sunset",
  };

  // debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // fetch hotels when page or address changes
  useEffect(() => {
    AOS.init({ duration: 600 });
    fetchHotels();
  }, [pageNo, selectedAddress]);

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:8080/api/hotels/searchAll", {
   params: {
  pageNo: pageNo,
  elementPerPage: elementPerPage,
  address: selectedAddress || undefined,
},

      });

      const { elementList, totalPages } = res.data.data;

      const hotelsWithReviews = await Promise.all(
        elementList.map(async (hotel) => {
          try {
            const reviewRes = await axios.get(
              `http://localhost:8080/api/hotel-reviews/${hotel.id}`
            );
            hotel.reviewOverview = {
              overallRating: reviewRes.data?.averageRating || 0,
              totalReviewCount: reviewRes.data?.reviews?.length || 0,
            };
          } catch (e) {
            hotel.reviewOverview = { overallRating: 0, totalReviewCount: 0 };
          }
          return hotel;
        })
      );

      setHotels(hotelsWithReviews);
      setTotalPages(totalPages);

      const uniqueAddresses = [...new Set(elementList.map((h) => h.address))];
      setAvailableAddresses(uniqueAddresses);
    } catch (err) {
      console.error("Failed to load hotels:", err);
      setError("Unable to load hotel data.");
    } finally {
      setLoading(false);
    }
  };

  const getMaxPrice = (rooms) => {
    if (!rooms || rooms.length === 0) return 0;
    return Math.max(...rooms.map((r) => r.price || 0));
  };

  const getRoomStats = (hotel) => {
    const availableRooms = hotel.rooms.filter((r) => r.status === "AVAILABLE").length;
    const bookedRooms = hotel.rooms.filter((r) => r.status === "BOOKED").length;
    return { availableRooms, bookedRooms, totalRooms: hotel.rooms.length };
  };

  const toggleStar = (star) => {
    setSelectedStars((prev) =>
      prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]
    );
  };

  const filteredHotels = hotels.filter((hotel) => {
    const matchAddress = selectedAddress ? hotel.address === selectedAddress : true;
    const matchStars = selectedStars.length > 0 ? selectedStars.includes(hotel.starRating) : true;
    const matchSearch = debouncedSearch ? hotel.name.toLowerCase().includes(debouncedSearch.toLowerCase()) : true;
    return matchAddress && matchStars && matchSearch;
  });

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    const priceA = getMaxPrice(a.rooms);
    const priceB = getMaxPrice(b.rooms);
    if (sortOrder === "asc") return priceA - priceB;
    if (sortOrder === "desc") return priceB - priceA;
    return 0;
  });

  return (
  <div className="hotel-header container py-5">
  <div className="hotel-header-content text-center" data-aos="fade-down">
    <h1 className="hotel-title">
      <i className="bi bi-building me-2"></i> Explore Top Hotels
    </h1>
    <p className="hotel-subtitle">
      Find your perfect stay — quality hotels with real comfort
    </p>
  </div>

      <div className="filter-box bg-white p-3 shadow-sm rounded-4 d-flex flex-wrap align-items-center gap-3 mb-4">
        <div className="address-select-container">
          <select
            className="form-select custom-select"
            value={selectedAddress}
            onChange={(e) => {
              setSelectedAddress(e.target.value);
              setPageNo(0);
            }}
          >
            <option value="">🌆 All Locations</option>
            {availableAddresses.map((addr, idx) => (
              <option key={idx} value={addr}>
                {addr}
              </option>
            ))}
          </select>
        </div>

        <div className="search-input-container">
          <input
            type="text"
            className="form-control search-input"
            placeholder="🔍 Search hotel name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ minWidth: "180px" }}>
          <select
            className="form-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="">🔽 Sort by Price</option>
            <option value="asc">⬆️ Low to High</option>
            <option value="desc">🔽 High to Low</option>
          </select>
        </div>

   <div className="hotel-star-filter d-flex align-items-center gap-3 flex-wrap">
  {[5, 4, 3, 2, 1].map((star) => (
    <div key={star} className="star-filter-option mb-0">
      <input
        className="star-checkbox"
        type="checkbox"
        id={`star-${star}`}
        checked={selectedStars.includes(star)}
        onChange={() => toggleStar(star)}
      />
      <label className="star-label fw-semibold" htmlFor={`star-${star}`}>
        ⭐ {star}
      </label>
    </div>
  ))}
</div>

      </div>

      {loading && <div className="text-center py-5">Loading hotels...</div>}
      {error && (
        <div className="text-center my-4 px-4 py-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded shadow">
          ⚠️ {error}
        </div>
      )}

      {sortedHotels.length === 0 && !loading && (
        <div className="text-center py-5 text-muted">
          No hotels found for current filter/search
        </div>
      )}

      {sortedHotels
  .slice(pageNo * elementPerPage, (pageNo + 1) * elementPerPage)
  .map((hotel, index) => {
    const maxPrice = getMaxPrice(hotel.rooms);
    const { availableRooms, bookedRooms, totalRooms } = getRoomStats(hotel);
    return (
      <div
        key={hotel.id || index}
        className="hotel-list-item"
        data-aos="fade-up"
      >
         <div className="hotel-thumbnail me-4">
      <img
        src={hotel.imageUrl || "https://via.placeholder.com/450x200?text=No+Image"}
        alt={hotel.name}
        className="hotel-img"
      />
    </div>

        <div className="hotel-info flex-grow-1">
         <h5 className="hotel-title">{hotel.name}</h5>
          <p className="text-muted mb-1">
            <i className="bi bi-geo-alt-fill me-1 text-secondary"></i>
            {hotel.streetAddress ? `${hotel.streetAddress}, ${hotel.address}` : hotel.address}
          </p>
          <p className="text-warning fw-semibold mb-1">⭐ {hotel.starRating}-star</p>
        
          <div className="d-flex flex-wrap gap-2 mt-2 text-secondary">
            {hotel.amenityIds?.length > 0 ? (
              hotel.amenityIds.map((amenity) => (
                <span
                  key={amenity.id}
                  className="badge bg-light text-dark border"
                  title={amenity.name}
                >
                  <i className={`bi ${amenityIcons[amenity.name] || "bi-building"} me-1`}></i>
                  {amenity.name}
                </span>
              ))
            ) : (
              <span className="text-muted fst-italic">No amenities listed</span>
            )}
          </div>
       <p className="hotel-room-highlight mt-4">
  Total: <span className="total">{totalRooms}</span> • 
  Available: <span className="available">{availableRooms}</span>
</p>

        </div>
        <div className="text-end" style={{ minWidth: "160px" }}>
          <div className="hotel-rating-box">
            <div className="rating-label">Excellent</div>
            <div className="rating-score">{hotel.reviewOverview.overallRating.toFixed(1)}</div>
            <div className="rating-count">{hotel.reviewOverview.totalReviewCount.toLocaleString()} reviews</div>
          </div>
          {maxPrice > 0 ? (
            <>
              <p className="price-highlight">
                {maxPrice.toLocaleString()} USD
                <span className="price-per-night"> / night</span>
              </p>
              <p className="text-muted fst-italic fs-5">Average price per night</p>
            </>
          ) : (
            <p className="text-muted fst-italic">No room price</p>
          )}
         <a href={`/hotels/${hotel.id}`} className="view-hotel-link mt-2">
  <i className="bi bi-box-arrow-up-right"></i> View Hotel
</a>


        </div>
      </div>
    );
  })}
{/* Pagination Controls */}
{sortedHotels.length > 0 && (
  <div className="hotel-pagination-container">
    <button
      className="hotel-pagination-btn"
      disabled={pageNo === 0}
      onClick={() => setPageNo((prev) => Math.max(prev - 1, 0))}
    >
      ⬅ Previous
    </button>

    {Array.from({ length: Math.ceil(sortedHotels.length / elementPerPage) }, (_, index) => (
      <button
        key={index}
        className={`hotel-pagination-page ${pageNo === index ? "active" : ""}`}
        onClick={() => setPageNo(index)}
      >
        {index + 1}
      </button>
    ))}

    <button
      className="hotel-pagination-btn"
      disabled={pageNo === Math.ceil(sortedHotels.length / elementPerPage) - 1}
      onClick={() =>
        setPageNo((prev) =>
          Math.min(prev + 1, Math.ceil(sortedHotels.length / elementPerPage) - 1)
        )
      }
    >
      Next ➡
    </button>
  </div>
)}


    </div>
  );
}

export default HotelPage;
