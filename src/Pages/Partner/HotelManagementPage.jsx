import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./HotelManagermentPage.css";
import { ToastContainer, toast } from "react-toastify";
import { FaSearch, FaPlus } from "react-icons/fa";
const HotelManagermentPage = () => {
  const navigate = useNavigate();
  const [hotelList, setHotelList] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotels, setHotels] = useState([]);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const preselectedHotelId = params.get("hotelId");
  const [pageNo, setPageNo] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hotelStats, setHotelStats] = useState([]);
  const [modalData, setModalData] = useState({
    open: false,
    title: "",
    items: [],
  });
  const [searchCriteria, setSearchCriteria] = useState({
    name: "",
    address: "",
  });
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState([]);
  const [roomTypesByHotel, setRoomTypesByHotel] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  <>
    {/* Các thành phần khác */}
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

  </>;
  const [newHotel, setNewHotel] = useState({
    id: null,
    name: "",
    streetAddress: "",
    address: "",
    starRating: "",
    description: "",

    image: null,
  });
  const amenityOptions = [
    { id: 1, name: "Wi-Fi" },
    { id: 2, name: "Swimming Pool" },
    { id: 3, name: "Gym" },
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
  const openModalFullHotel = (hotel) => {
    setModalData({
      isOpen: true,
      hotel: hotel, // truyền toàn bộ object hotel
    });
  };
  const toggleAmenity = (id) => {
    setSelectedAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  
  const [error, setError] = useState(null);
  const fetchRoomTypesForHotels = async (hotelList) => {
    const updated = {};

    for (const hotel of hotelList) {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/rooms-types/by-hotel",
          {
            params: { hotelId: hotel.id },
          }
        );
        updated[hotel.id] = response.data;
      } catch (err) {
        console.error(
          "❌ Failed to fetch room types for hotel:",
          hotel.id,
          err
        );
        updated[hotel.id] = [];
      }
    }

    setRoomTypesByHotel(updated);
  };
const fetchHotels = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8080/api/hotels/search",
      {
        params: { ...searchCriteria, page: pageNo, size: 6 },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    const hotelList = response.data.data.elementList;

    const hotelsWithUI = hotelList.map((h) => ({
      ...h,
      uiAddress: ` ,${h.address}`,
    }));

    setHotels(hotelsWithUI);
    setTotalPages(response.data.data.totalPages);

    await fetchRoomTypesForHotels(hotelsWithUI);

    // 👇 gọi stats sau khi có hotels
    await fetchHotelStats();
  } catch (error) {
    if (error.response?.status === 403) {
      navigate("/403");
    } else {
      navigate("/");
    }
  }
};

const fetchHotelStats = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8080/api/hotels/hotel-stats",
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    setHotelStats(response.data.data);
  } catch (err) {
    console.error("Failed to fetch hotel stats:", err);
  }
};


  useEffect(() => {
    fetchHotels();
  }, [pageNo, searchCriteria]);
useEffect(() => {
  const fetchHotelStats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/hotels/hotel-stats",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setHotelStats(response.data.data); // gán vào state hotelStats
    } catch (err) {
      console.error("Failed to fetch hotel stats:", err);
    }
  };

  fetchHotelStats();
}, []);

  useEffect(() => {
    if (hotelList.length > 0 && preselectedHotelId) {
      setSelectedHotel(preselectedHotelId);
    }
  }, [hotelList, preselectedHotelId]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPageNo(0);
    fetchHotels();
  };
  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get("https://provinces.open-api.vn/api/p/");
        setProvinces(res.data);
      } catch (err) {
        console.error("❌ Lỗi lấy danh sách tỉnh:", err);
      }
    };

    fetchProvinces();
  }, []);

  const handleAddHotel = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (!newHotel.name.trim() || !newHotel.address.trim()) {
        setError("Name and Address are required");
        return;
      }
      if (!newHotel.image) {
        setError("You must upload an image");
        return;
      }
      const hotelData = {
        name: newHotel.name,
        address: newHotel.address,
        starRating: parseInt(newHotel.starRating),
        description: newHotel.description,
        streetAddress: newHotel.streetAddress,
      };

      const formData = new FormData();
      formData.append(
        "req",
        new Blob([JSON.stringify(hotelData)], { type: "application/json" })
      );

      // 👇 Hình ảnh đại diện
      formData.append("file", newHotel.image);

      // 👇 Danh sách tiện ích (amenityIds) — dạng JSON Blob
      formData.append(
        "amenityIds",
        new Blob([JSON.stringify(selectedAmenityIds)], {
          type: "application/json",
        })
      );

      // 👇 Các imageUrls nếu có
      formData.append(
        "imageUrls",
        new Blob([JSON.stringify(imageUrls)], { type: "application/json" })
      );

      const response = await axios.post(
        "http://localhost:8080/api/hotels",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            // ❌ KHÔNG thêm 'Content-Type', Axios tự set
          },
        }
      );

      if (response.status === 201) {
        const newHotelId = response.data.hotelId;

        const hotelToShow = {
          ...newHotel,
          id: newHotelId,
          uiAddress: `${newHotel.streetAddress}, ${newHotel.address}`, // 👈 gộp lại
        };
        setHotels((prev) => [hotelToShow, ...prev]);
     
        setIsAddMode(false);
        setNewHotel({
          id: null,
          name: "",
          streetAddress: "",
          address: "",
          starRating: "",
          description: "",
          image: null,
        });
        fetchHotels();
        toast.success("Hotel created successfully!");
      }
    } catch (error) {
      console.error(
        "Error adding hotel:",
        error.response?.data || error.message
      );
      setError(error.response?.data?.message || "Failed to add hotel");
    }
  };

  const handleUpdateHotel = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (!newHotel.name.trim() || !newHotel.address.trim()) {
        setError("Name and Address are required");
        return;
      }
      if (!newHotel.id) {
        setError("Invalid hotel ID");
        return;
      }

      const hotelData = {
        name: newHotel.name,
        address: newHotel.address,
        starRating: parseInt(newHotel.starRating),
        description: newHotel.description,
        streetAddress: newHotel.streetAddress,
        amenityIds: selectedAmenityIds,
      };

      const formData = new FormData();
      formData.append(
        "req",
        new Blob([JSON.stringify(hotelData)], { type: "application/json" })
      );
      if (newHotel.image) {
        formData.append("file", newHotel.image);
      }

      const response = await axios.put(
        `http://localhost:8080/api/hotels/${newHotel.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        const oldHotel = hotels.find((h) => h.id === newHotel.id);

        const updatedHotel = {
          ...newHotel,
          streetAddress:
            newHotel.streetAddress || oldHotel?.streetAddress || "",
          uiAddress: `${
            newHotel.streetAddress || oldHotel?.streetAddress || ""
          }, ${newHotel.address}`,
          imagePreview: newHotel.image
            ? URL.createObjectURL(newHotel.image)
            : oldHotel?.imagePreview,
        };

        setHotels((prev) =>
          prev.map((h) => (h.id === updatedHotel.id ? updatedHotel : h))
        );

      if (response.status === 200) {
  setIsEditMode(false);
  await fetchHotels(); // cập nhật danh sách mới từ backend
  toast.success("Hotel updated successfully!");
}
      }
    } catch (error) {
      console.error(
        "Error updating hotel:",
        error.response?.data || error.message
      );
      setError(error.response?.data?.message || "Failed to update hotel");
    }
  };

  if (isAddMode) {
    return (
      <div className="an-container">
        <h1 className="an-title">Add New Hotel</h1>
        {error && <p className="an-error">{error}</p>}
        <form
          onSubmit={handleAddHotel}
          encType="multipart/form-data"
          className="an-form"
        >
          <div className="an-grid">
            <div className="an-field">
              <label className="an-label">Hotel Name</label>
              <input
                type="text"
                placeholder="Hotel Name"
                className="an-input"
                value={newHotel.name}
                onChange={(e) =>
                  setNewHotel({ ...newHotel, name: e.target.value })
                }
                required
              />
            </div>

            <div className="an-field">
              <label className="an-label">Street Address</label>
              <input
                type="text"
                className="an-input"
                value={newHotel.streetAddress}
                onChange={(e) =>
                  setNewHotel({ ...newHotel, streetAddress: e.target.value })
                }
              />
            </div>

            <div className="an-field">
              <label className="an-label">City</label>
              <select
                className="an-select"
                value={newHotel.address}
                onChange={(e) =>
                  setNewHotel({ ...newHotel, address: e.target.value })
                }
                required
              >
                <option value="">-- Select City --</option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.name}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="ed-field">
              <label className="ed-label">Star Rating</label>
              <select
                className="ed-input"
                value={newHotel.starRating}
                onChange={(e) =>
                  setNewHotel({
                    ...newHotel,
                    starRating: parseInt(e.target.value),
                  })
                }
                required
              >
                <option value="">Select</option>
                {[1, 2, 3, 4, 5].map((star) => (
                  <option key={star} value={star}>
                    {star} {"⭐".repeat(star)}
                  </option>
                ))}
              </select>
            </div>
            <div className="an-field">
              <label className="an-label">Description</label>
              <textarea
                className="an-textarea"
                rows="3"
                placeholder="Hotel description"
                value={newHotel.description}
                onChange={(e) =>
                  setNewHotel({ ...newHotel, description: e.target.value })
                }
                required
              />
            </div>

            <div className="an-field">
              <label className="an-label">Amenities</label>
              <div className="an-amenities">
                {chunkArray(amenityOptions, 5).map((group, colIndex) => (
                  <div key={colIndex} className="an-amenity-column">
                    {group.map((item) => (
                      <label key={item.id} className="an-amenity-item">
                        <input
                          type="checkbox"
                          value={item.id}
                          checked={selectedAmenityIds.includes(item.id)}
                          onChange={() => toggleAmenity(item.id)}
                        />
                        <span>{item.name}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="an-field">
              <label className="an-label">Image</label>
              <input
                type="file"
                accept="image/*"
                className="an-input"
                onChange={(e) =>
                  setNewHotel({ ...newHotel, image: e.target.files[0] })
                }
                required
              />
            </div>
          </div>

          <div className="an-buttons">
            <button
              type="button"
              onClick={() => setIsAddMode(false)}
              className="an-back-btn"
            >
              Back
            </button>
            <button type="submit" className="an-save-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <div className="ed-container">
        <h1 className="ed-title">Edit Hotel</h1>
        {error && <p className="ed-error">{error}</p>}

        <form
          onSubmit={handleUpdateHotel}
          encType="multipart/form-data"
          className="ed-form"
        >
          <div className="ed-grid">
            {/* Hotel Name */}
            <div className="ed-field">
              <label className="ed-label">Hotel Name</label>
              <input
                type="text"
                placeholder="Hotel Name"
                className="ed-input"
                value={newHotel.name}
                onChange={(e) =>
                  setNewHotel({ ...newHotel, name: e.target.value })
                }
                required
                disabled
              />
            </div>

            {/* City */}
          <div className="ed-field">
  <label className="ed-label">City</label>
  <select
    className="ed-input"
    value={newHotel.address || ""}
    onChange={(e) =>
      setNewHotel({ ...newHotel, address: e.target.value })
    }
  >
    <option value="">-- Select City --</option>
    {provinces.map((province) => (
      <option key={province.code} value={province.name}>
        {province.name}
      </option>
    ))}
  </select>
</div>


            {/* Street Address */}
        <div className="ed-field">
  <label className="ed-label">Street Address</label>
  <input
    type="text"
    className="ed-input"
    value={newHotel.streetAddress || ""} // hiển thị giá trị từ DB
    disabled
  />
</div>

            {/* Image */}
            <div className="ed-field">
              <label className="ed-label">Image</label>
              <input
                type="file"
                accept="image/*"
                className="ed-input"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setNewHotel({ ...newHotel, image: file });

                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setPreviewImage(reader.result);
                    reader.readAsDataURL(file);
                  }
                }}
              />

              {previewImage && (
                <img
                  src={previewImage}
                  alt="Hotel Preview"
                  className="ed-preview-image"
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div className="ed-field">
            <label className="ed-label">Description</label>
            <textarea
              className="ed-textarea"
              rows="3"
              placeholder="Hotel description"
              value={newHotel.description || ""}
              onChange={(e) =>
                setNewHotel({ ...newHotel, description: e.target.value })
              }
            />
          </div>

          {/* Amenities */}
          <div className="ed-field">
            <label className="ed-label">Amenities</label>
            <div className="ed-amenities">
              {chunkArray(amenityOptions, 5).map((group, colIndex) => (
                <div key={colIndex} className="ed-amenity-column">
                  {group.map((item) => (
                    <label key={item.id} className="ed-amenity-item">
                      <input
                        type="checkbox"
                        value={item.id}
                        checked={selectedAmenityIds.includes(item.id)}
                        onChange={() => toggleAmenity(item.id)}
                      />
                      <span>{item.name}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Star Rating */}
          <div className="ed-field">
            <label className="ed-label">Star Rating</label>
            <select
              className="ed-input"
              value={newHotel.starRating}
              onChange={(e) =>
                setNewHotel({
                  ...newHotel,
                  starRating: parseInt(e.target.value),
                })
              }
              required
            >
              <option value="">Select</option>
              {[1, 2, 3, 4, 5].map((star) => (
                <option key={star} value={star}>
                  {star} {"⭐".repeat(star)}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="ed-buttons">
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className="ed-back-btn"
            >
              Back
            </button>
            <button type="submit" className="ed-save-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rm-container">
      <h1 className="rm-title">Hotel Management</h1>
      {error && <p className="rm-error-message">{error}</p>}

      {/* Search Bar */}
      <div className="rm-search-bar">
        <input
          type="text"
          placeholder="Search by name"
          className="rm-search-input"
          value={searchCriteria.name}
          onChange={(e) =>
            setSearchCriteria({ ...searchCriteria, name: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Search by address"
          className="rm-search-input"
          value={searchCriteria.address}
          onChange={(e) =>
            setSearchCriteria({ ...searchCriteria, address: e.target.value })
          }
        />
        <button onClick={handleSearch} className="rm-search-btn">
          <FaSearch size={16} /> Search
        </button>
        <button onClick={() => setIsAddMode(true)} className="rm-add-btn">
          <FaPlus size={16} /> Add Hotel
        </button>
      </div>

      {/* Table */}
      <div className="rm-table-wrapper">
        <table className="rm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Address</th>
              <th>Description</th>
              <th>Amenities</th>
              <th>Star</th>
              <th>Room Types</th>
              <th>Rooms</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((hotel) => (
              <tr key={hotel.id}>
                <td>{hotel.id}</td>
                <td>{hotel.name}</td>
                <td>
                  {hotel.streetAddress
                    ? `${hotel.streetAddress}, ${hotel.address}`
                    : hotel.address}
                </td>
                <td className="rm-description">
                  {hotel.description && hotel.description.length > 50
                    ? hotel.description.substring(0, 50) + "..."
                    : hotel.description}
                </td>
                <td>
                  {hotel.amenityIds && hotel.amenityIds.length > 0
                    ? hotel.amenityIds
                        .slice(0, 2)
                        .map((a) => a.name)
                        .join(", ")
                    : "No amenities"}
                </td>
                <td>
                  {hotel.starRating ? "⭐".repeat(hotel.starRating) : "N/A"}
                </td>
                <td>
                  {hotel.roomTypes && hotel.roomTypes.length > 0
                    ? hotel.roomTypes
                        .slice(0, 2)
                        .map((rt) => rt.typeName)
                        .join(", ")
                    : "No Room Types"}
                </td>
                <td>
                  {hotel.rooms && hotel.rooms.length > 0
                    ? hotel.rooms
                        .slice(0, 2)
                        .map((r) => r.roomName)
                        .join(", ")
                    : "No rooms"}
                </td>
                <td>
                  {hotel.imageUrl && (
                    <img
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      className="rm-preview-image"
                    />
                  )}
                </td>
                <td className="rm-action-cell">
                  <button
                    className="rm-view-btn"
                    onClick={() => openModalFullHotel(hotel)}
                  >
                    👁 View
                  </button>
                  <button
                    className="rm-edit-btn"
                    onClick={() => {
                      setIsEditMode(true);
                      setNewHotel({
                        id: hotel.id,
                        name: hotel.name,
                        address: hotel.address,
                         streetAddress: hotel.streetAddress || "", 
                          starRating: hotel.starRating || "",
                            description: hotel.description || "",
                        image: null,
                      });
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="rm-add-btn"
                    onClick={() =>
                      navigate(`/rooms-types/add?hotelId=${hotel.id}`)
                    }
                  >
                    ➕ Add RoomType
                  </button>
                  <button
  className="rm-stats-btn"
  onClick={() => {
    const stat = hotelStats.find((s) => s.hotelId === hotel.id); // giả sử DTO có hotelId
    if (stat && stat.suggestion) {
      toast.info(
        `Suggestion for "${hotel.name}": ${stat.suggestion}`,
        { position: "top-right", autoClose: 5000 }
      );
    } else {
      toast.info(`No suggestion available for "${hotel.name}"`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }}
>
  💡 Suggestion
</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="rm-pagination">
        <button
          onClick={() => setPageNo((prev) => Math.max(prev - 1, 0))}
          disabled={pageNo === 0}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setPageNo(index)}
            className={pageNo === index ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() =>
            setPageNo((prev) => Math.min(prev + 1, totalPages - 1))
          }
          disabled={pageNo >= totalPages - 1}
        >
          Next
        </button>
      </div>
      {/* Modal */}
      {modalData.isOpen && modalData.hotel && (
        <div className="rm-image-modal">
          <div className="rm-image-modal-content">
            <button
              className="rm-image-close"
              onClick={() => setModalData({ isOpen: false })}
            >
              ✖
            </button>
            <h2 className="rm-modal-title">{modalData.hotel.name}</h2>
            <p>
              <strong>Address:</strong>{" "}
              {modalData.hotel.streetAddress
                ? `${modalData.hotel.streetAddress}, ${modalData.hotel.address}`
                : modalData.hotel.address}
            </p>
            <p>
              <strong>Description:</strong> {modalData.hotel.description}
            </p>
            <p>
              <strong>Amenities:</strong>{" "}
              {modalData.hotel.amenityIds?.map((a) => a.name).join(", ") ||
                "No amenities"}
            </p>
            <p>
              <strong>Room Types:</strong>{" "}
              {modalData.hotel.roomTypes?.map((rt) => rt.typeName).join(", ") ||
                "No Room Types"}
            </p>
            <p>
              <strong>Rooms:</strong>{" "}
              {modalData.hotel.rooms?.map((r) => r.roomName).join(", ") ||
                "No rooms"}
            </p>
            <p>
              <strong>Star Rating:</strong>{" "}
              {modalData.hotel.starRating
                ? "⭐".repeat(modalData.hotel.starRating)
                : "N/A"}
            </p>
            {modalData.hotel.imageUrl && (
              <img
                src={modalData.hotel.imageUrl}
                alt={modalData.hotel.name}
                className="rm-full-image"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default HotelManagermentPage;
