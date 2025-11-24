import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./RoomManagermentPage.css";
import { useSearchParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch, FaPlus } from "react-icons/fa";
const RoomManagermentPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [searchParams] = useSearchParams();
  const preselectedHotelId = searchParams.get("hotelId");
  const [pageNo, setPageNo] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchCriteria, setSearchCriteria] = useState({ roomName: "" });
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const location = useLocation();
  const [roomTypes, setRoomTypes] = useState([]);
  const params = new URLSearchParams(location.search);
  const preselectedRoomTypeId = params.get("roomTypeId");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedRoomImages, setSelectedRoomImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

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
  const roomTypeIdFromUrl = searchParams.get("roomTypeId");
  const [newRoom, setNewRoom] = useState({
    id: null,
    roomName: "",
    description: "",
    price: "",
    capacity: "",
    imageUrls: [],
    numberOfBeds: "",
    hotelId: "",
    roomTypeId: "",
    previewImages: [],
    existingImageUrls: [],
    discountPercentage: "",
  });
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState(null);
  const handleViewHistory = async (roomId) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/rooms/${roomId}/history`
      );
      setHistoryData(res.data);
      setShowHistory(true);
    } catch (err) {
      toast.error("❌Can not load room history");
    }
  };
  const fetchRooms = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/rooms/search",
        {
          params: { name: searchCriteria.roomName, page: pageNo, size: 6 },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setRooms(response.data.elementList || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      setError(
        "Failed to fetch rooms: " +
          (error.response?.data?.message || error.message)
      );
      if (error.response?.status === 403) navigate("/403");
      else if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else navigate("/");
    }
  };
  const fetchRoomTypes = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/rooms-types");
      setRoomTypes(response.data || []);
    } catch (error) {
      console.error("Error fetching room types:", error);
      setError("Failed to fetch room types");
    }
  };
  useEffect(() => {
    if (preselectedRoomTypeId && roomTypes.length > 0) {
      const selectedRoomType = roomTypes.find(
        (r) => r.id === Number(preselectedRoomTypeId)
      );
      if (selectedRoomType) {
        setNewRoom((prev) => ({
          ...prev,
          roomTypeId: selectedRoomType.id,
          hotelId: selectedRoomType.hotelId,
        }));
        setIsAddMode(true);
      }
    }
  }, [preselectedRoomTypeId, roomTypes]);

  const fetchHotels = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/hotels/search",
        {
          params: { page: 0, size: 100 },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setHotels(response.data.data.elementList || []);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setError("Failed to fetch hotels");
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchHotels();
    fetchRoomTypes();
  }, [pageNo, searchCriteria]);
  useEffect(() => {
    if (preselectedHotelId) {
      setNewRoom((prev) => ({
        ...prev,
        hotelId: preselectedHotelId,
        roomTypeId: roomTypeIdFromUrl,
      }));
    }
  }, [preselectedHotelId]);
  useEffect(() => {
    if (preselectedRoomTypeId && roomTypes.length > 0) {
      const selectedRoomType = roomTypes.find(
        (r) => r.id === Number(preselectedRoomTypeId)
      );
      if (selectedRoomType) {
        setNewRoom((prev) => ({
          ...prev,
          roomTypeId: selectedRoomType.id,
          hotelId: selectedRoomType.hotelId,
        }));
        setIsAddMode(true);
      }
    }
  }, [preselectedRoomTypeId, roomTypes]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPageNo(0);
    fetchRooms();
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (
        !newRoom.roomName.trim() ||
        !newRoom.description.trim() ||
        !newRoom.price ||
        !newRoom.capacity ||
        !newRoom.hotelId
      ) {
        setError("All fields are required");
        return;
      }

      if (parseFloat(newRoom.price) <= 0) {
        setError("Price must be greater than 0");
        return;
      }

      const cap = parseInt(newRoom.capacity);
      if (cap < 1 || cap > 5) {
        setError("Capacity must be between 1 and 5");
        return;
      }

      if (newRoom.imageUrls.length === 0) {
        setError("At least one image is required");
        return;
      }
      const numBeds = parseInt(newRoom.numberOfBeds);
      if (numBeds < 1 || numBeds > 5) {
        setError("Number of beds must be between 1 and 5");
        return;
      }
      const roomData = {
        roomName: newRoom.roomName,
        description: newRoom.description,
        price: newRoom.price,
        capacity: newRoom.capacity,
        numberOfBeds: newRoom.numberOfBeds,
        hotelId: newRoom.hotelId,
        roomTypeId: newRoom.roomTypeId,
         discountPercentage: newRoom.discountPercentage,
      };

      const formData = new FormData();
      formData.append(
        "request",
        new Blob([JSON.stringify(roomData)], { type: "application/json" })
      );
      Array.from(newRoom.imageUrls).forEach((file) =>
        formData.append("files", file)
      );

      const response = await axios.post(
        "http://localhost:8080/api/rooms",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        setIsAddMode(false);
        setNewRoom({
          id: null,
          roomName: "",
          description: "",
          price: "",
          capacity: "",
          imageUrls: [],
          numberOfBeds: "",
          hotelId: rooms.hotelId,
          roomTypeId: rooms.roomTypeId,
          previewImages: [],
          existingImageUrls: [],
        });
        fetchRooms();
        toast.success("Room created successfully!");
      }
      navigate("/partner/roommanager");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add room");
    }
  };
  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { roomName, description, price, capacity, hotelId, id, imageUrls } =
        newRoom;

      if (
        !roomName.trim() ||
        !description.trim() ||
        !price ||
        !capacity ||
        !hotelId
      ) {
        setError("All fields are required");
        return;
      }

      if (!id) {
        setError("Invalid room ID");
        return;
      }

      if (parseFloat(price) <= 0) {
        setError("Price must be greater than 0");
        return;
      }

      const cap = parseInt(capacity);
      if (cap < 1 || cap > 5) {
        setError("Capacity must be between 1 and 5");
        return;
      }

      const roomData = {
        roomName,
        description,
        price,
        capacity,
        hotelId,
        roomTypeId: newRoom.roomTypeId,
        numberOfBeds: newRoom.numberOfBeds,
        discountPercentage: newRoom.discountPercentage,
      };

      const formData = new FormData();
      formData.append(
        "request",
        new Blob([JSON.stringify(roomData)], { type: "application/json" })
      );
      const newImages = imageUrls.filter((img) => img instanceof File);
      if (newImages.length === 0) {
        setError("Please add at least one new image.");
        return;
      }
      newImages.forEach((file) => {
        formData.append("files", file);
      });

      const response = await axios.put(
        `http://localhost:8080/api/rooms/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setIsEditMode(false);
        setNewRoom({
          id: null,
          roomName: "",
          description: "",
          price: "",
          capacity: "",
          numberOfBeds: "",
          imageUrls: [],
          hotelId: "",
          roomTypeId: "",
          previewImages: [],
          existingImageUrls: [],
        });
        fetchRooms();
        toast.success("Room updated successfully!");
      }
      navigate("/partner/roommanager");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update room");
    }
  };
  const handleChangeStatus = async (id, status) => {
    try {
      const response = await axios.patch(
        `http://localhost:8080/api/rooms/change-status/${id}`,
        null,
        {
          params: { status },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (response.status === 200) {
        fetchRooms();
        toast.success(`Room status changed to ${status} successfully!`);
      }
    } catch (error) {
      toast.error(
        "Failed to change room status: " +
          (error.response?.data?.message || "Unknown error")
      );
    }
  };

  const handleBack = () => {
    setIsAddMode(false);
    setIsEditMode(false);
    navigate("/partner/roommanager");
    setNewRoom({
      id: null,
      roomName: "",
      description: "",
      price: "",
      capacity: "",
      numberOfBeds: 1,
      imageUrls: [],
      hotelId: "",
      roomTypeId: newRoom.roomTypeId,
      previewImages: [],
      existingImageUrls: [],
    });
    setError(null);
  };

  if (isAddMode) {
    return (
      <div className="add-room-container">
        <h1 className="add-room-title">Add New Room</h1>

        {error && <p className="add-room-error">{error}</p>}

        <form
          onSubmit={handleAddRoom}
          encType="multipart/form-data"
          className="add-room-form"
        >
          <div className="add-room-grid">
            {/* Room Name */}
            <div className="add-room-field">
              <label className="add-room-label">Room Name</label>
              <input
                type="text"
                placeholder="Enter room name"
                className="add-room-input"
                value={newRoom.roomName}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, roomName: e.target.value })
                }
                required
              />
            </div>
<div className="add-room-field">
  <label className="add-room-label">Discount (%)</label>
  <input
  type="number"
  min="0"
  max="100"
  placeholder="Enter discount"
  className="add-room-input"
  value={newRoom.discountPercentage}
  onChange={(e) =>
    setNewRoom({ ...newRoom, discountPercentage: e.target.value })
  }
/>

</div>
            {/* Description */}
            <div className="add-room-field">
              <label className="add-room-label">Description</label>
              <textarea
                placeholder="Enter description"
                className="add-room-textarea"
                value={newRoom.description}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, description: e.target.value })
                }
                required
                rows={6}
              />
            </div>

            {/* Price */}
            <div className="add-room-field">
              <label className="add-room-label">Price ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter price"
                className="add-room-input"
                value={newRoom.price}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, price: e.target.value })
                }
                required
                min="0.01"
              />
            </div>

            {/* Capacity */}
            <div className="add-room-field">
              <label className="add-room-label">Capacity</label>
              <input
                type="number"
                placeholder="Enter capacity"
                className="add-room-input"
                value={newRoom.capacity}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, capacity: e.target.value })
                }
                required
                min="1"
              />
            </div>

            {/* Beds */}
            <div className="add-room-field">
              <label className="add-room-label">Number of Beds</label>
              <input
                type="number"
                min="1"
                max="5"
                placeholder="Enter number of beds (1-5)"
                className="add-room-input"
                value={newRoom.numberOfBeds}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, numberOfBeds: e.target.value })
                }
                required
              />
            </div>

            {/* Hotel */}
            <div className="add-room-field">
              <label className="add-room-label">Hotel</label>
              <select
                className="add-room-select"
                value={newRoom.hotelId}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, hotelId: e.target.value })
                }
                required
              >
                <option value="">Select a hotel</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Type */}
            <div className="add-room-field">
              <label className="add-room-label">Room Type</label>
              <select
                className="add-room-select"
                value={newRoom.roomTypeId}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, roomTypeId: e.target.value })
                }
                required
                disabled={!newRoom.hotelId}
              >
                <option value="">Select a room type</option>
                {roomTypes
                  .filter((type) => type.hotelId === Number(newRoom.hotelId))
                  .map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.typeName}
                    </option>
                  ))}
              </select>
            </div>

            {/* Image Preview */}
            <div className="add-room-field">
              <label className="add-room-label">Images</label>
              <div className="add-room-image-preview">
                {newRoom.previewImages?.map((image, i) => (
                  <div
                    key={i}
                    className="add-room-image-item"
                    title="New Image"
                  >
                    <img
                      src={
                        image instanceof File
                          ? URL.createObjectURL(image)
                          : image
                      }
                      alt={`New-${i}`}
                      className="add-room-preview-img"
                    />
                    <span className="add-room-image-tag">New</span>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => {
                        const updatedPreviews = [...newRoom.previewImages];
                        updatedPreviews.splice(i, 1);
                        setNewRoom({
                          ...newRoom,
                          previewImages: updatedPreviews,
                          imageUrls: updatedPreviews,
                        });
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="add-room-input"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  if (files.length > 0) {
                    setNewRoom((prev) => ({
                      ...prev,
                      imageUrls: [...prev.imageUrls, ...files],
                      previewImages: [...prev.previewImages, ...files],
                    }));
                  }
                }}
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="add-room-btn-group">
            <button
              type="button"
              onClick={handleBack}
              className="add-room-back-btn"
            >
              Back
            </button>
            <button type="submit" className="add-room-save-btn">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <div className="edit-room-container">
        <h1 className="edit-room-title">Edit Room</h1>

        {error && <p className="edit-room-error">{error}</p>}

        <form
          onSubmit={handleUpdateRoom}
          encType="multipart/form-data"
          className="edit-room-form"
        >
          <div className="edit-room-grid">
            {/* Room Name */}
            <div className="edit-room-field">
              <label className="edit-room-label">Room Name</label>
              <input
                type="text"
                placeholder="Enter room name"
                className="edit-room-input"
                value={newRoom.roomName}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, roomName: e.target.value })
                }
                required
              />
            </div>

            {/* Description */}
            <div className="edit-room-field">
              <label className="edit-room-label">Description</label>
              <textarea
                placeholder="Enter description"
                className="edit-room-textarea"
                value={newRoom.description}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, description: e.target.value })
                }
                required
                rows={6}
              />
            </div>
<div className="edit-room-field">
  <label className="edit-room-label">Discount (%)</label>
 <input
  type="number"
  min="0"
  max="100"
  placeholder="Enter discount"
  className="edit-room-input"
  value={newRoom.discountPercentage}
  onChange={(e) =>
    setNewRoom({ ...newRoom, discountPercentage: e.target.value })
  }
/>
</div>
            {/* Price */}
            <div className="edit-room-field">
              <label className="edit-room-label">Price ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter price"
                className="edit-room-input"
                value={newRoom.price}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, price: e.target.value })
                }
                required
                min="1"
              />
            </div>

            {/* Capacity */}
            <div className="edit-room-field">
              <label className="edit-room-label">Capacity</label>
              <input
                type="number"
                placeholder="Enter capacity"
                className="edit-room-input"
                value={newRoom.capacity}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, capacity: e.target.value })
                }
                required
                min="1"
              />
            </div>

            {/* Beds */}
            <div className="edit-room-field">
              <label className="edit-room-label">Number of Beds</label>
              <input
                type="number"
                min="1"
                max="5"
                placeholder="Enter number of beds (1-5)"
                className="edit-room-input"
                value={newRoom.numberOfBeds}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, numberOfBeds: e.target.value })
                }
                required
              />
            </div>

            {/* Hotel */}
            <div className="edit-room-field">
              <label className="edit-room-label">Hotel</label>
              <select
                className="edit-room-select"
                value={newRoom.hotelId}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, hotelId: e.target.value })
                }
                required
                disabled
              >
                <option value="">Select a hotel</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Type */}
            <div className="edit-room-field">
              <label className="edit-room-label">Room Type</label>
              <select
                className="edit-room-select"
                value={newRoom.roomTypeId}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, roomTypeId: e.target.value })
                }
                required
              >
                <option value="">Select a room type</option>
                {roomTypes
                  .filter((type) => type.hotelId === Number(newRoom.hotelId))
                  .map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.typeName}
                    </option>
                  ))}
              </select>
            </div>

            {/* Image Preview */}
            <div className="edit-room-field">
              <label className="edit-room-label">Images</label>
              <div className="edit-room-image-preview">
                {/* Existing Images */}
                {newRoom.existingImageUrls?.map((url, i) => (
                  <div
                    key={`exist-${i}`}
                    className="edit-room-image-item"
                    title="Old Image"
                  >
                    <img
                      src={url}
                      alt={`Old-${i}`}
                      className="edit-room-preview-img"
                    />
                    <span className="edit-room-image-tag">Old</span>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => {
                        const updated = [...newRoom.existingImageUrls];
                        updated.splice(i, 1);
                        setNewRoom({ ...newRoom, existingImageUrls: updated });
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {/* New Images */}
                {newRoom.previewImages?.map((image, i) => (
                  <div
                    key={`new-${i}`}
                    className="edit-room-image-item"
                    title="New Image"
                  >
                    <img
                      src={
                        image instanceof File
                          ? URL.createObjectURL(image)
                          : image
                      }
                      alt={`New-${i}`}
                      className="edit-room-preview-img"
                    />
                    <span className="edit-room-image-tag">New</span>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => {
                        const updatedPreviews = [...newRoom.previewImages];
                        updatedPreviews.splice(i, 1);
                        setNewRoom({
                          ...newRoom,
                          previewImages: updatedPreviews,
                          imageUrls: updatedPreviews,
                        });
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="edit-room-input"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  if (files.length > 0) {
                    setNewRoom((prev) => ({
                      ...prev,
                      imageUrls: [...prev.imageUrls, ...files],
                      previewImages: [...prev.previewImages, ...files],
                    }));
                  }
                }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="edit-room-btn-group">
            <button
              type="button"
              onClick={handleBack}
              className="edit-room-back-btn"
            >
              Back
            </button>
            <button type="submit" className="edit-room-save-btn">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rm-container">
      <h1 className="rm-title">Room Management</h1>
      {error && <p className="rm-error-message">{error}</p>}

      {/* Search Bar */}
      <div className="rm-search-bar">
        <input
          type="text"
          placeholder="Search by room name"
          className="rm-search-input"
          value={searchCriteria.roomName}
          onChange={(e) =>
            setSearchCriteria({ ...searchCriteria, roomName: e.target.value })
          }
        />
        <button onClick={handleSearch} className="rm-search-btn">
          <FaSearch size={16} /> Search
        </button>
        <button onClick={() => setIsAddMode(true)} className="rm-add-btn">
          <FaPlus size={16} /> Add Room
        </button>
      </div>

      {/* Table */}
      <div className="rm-table-wrapper">
        <table className="rm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Room Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Capacity</th>
              <th>Beds</th>
              <th>Hotel</th>
              <th>Type</th>
              <th>Discount</th>
              <th>Final Price</th>
              <th>Status</th>
              <th>Image</th>
              <th>Actions</th>
              
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.id}</td>
                <td>{room.roomName}</td>
                <td className="rm-description">
                  {room.description && room.description.length > 50
                    ? room.description.substring(0, 50) + "..."
                    : room.description}
                </td>

                <td>${room.price}</td>
                <td>{room.capacity}</td>
                <td>{room.numberOfBeds}</td>
                <td>{room.hotelName}</td>
                <td>{room.roomType}</td>
                <td>
  {room.discountPercentage ? `${room.discountPercentage}%` : "0%"}
</td>
  <td className="fw-bold text-success">${room.finalPrice.toFixed(2)}</td>
                <td>
                  <span
                    className={`rm-status-badge ${
                      room.roomStatus === "AVAILABLE"
                        ? "available"
                        : "maintenance"
                    }`}
                    onClick={() =>
                      handleChangeStatus(
                        room.id,
                        room.roomStatus === "AVAILABLE" ? "BOOKED" : "AVAILABLE"
                      )
                    }
                  >
                    {room.roomStatus === "AVAILABLE"
                      ? "Available"
                      : "Maintenance"}
                  </span>
                </td>
                <td>
                  {room.imageUrl && room.imageUrl.length > 0 && (
                    <img
                      src={room.imageUrl[0]} // chỉ 1 ảnh
                      alt={room.roomName}
                      className="rm-preview-image"
                    />
                  )}
                </td>
                <td className="rm-action-cell">
                  <div className="rm-action-buttons">
                    <button
                      className="rm-edit-btn"
                      onClick={() => {
                        setIsEditMode(true);
                        setNewRoom({
                          id: room.id,
                          roomName: room.roomName,
                          description: room.description,
                          price: room.price,
                          capacity: room.capacity,
                          numberOfBeds: room.numberOfBeds,
                          imageUrls: [],
                          hotelId: room.hotelId,
                          existingImageUrls: room.imageUrl || [],
                          previewImages: [],
                        });
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="rm-history-btn"
                      onClick={() => handleViewHistory(room.id)}
                    >
                      📜 History
                    </button>
                    <button
                      className="rm-view-btn"
                      onClick={() => {
                        setSelectedRoom(room);
                        setSelectedRoomImages(room.imageUrl || []);
                        setShowImageModal(true);
                      }}
                    >
                      👁 View
                    </button>
                  </div>
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

      {/* History Modal */}
      {showHistory && (
        <div className="rm-history-modal">
          <div className="rm-history-box">
            <button
              className="rm-history-close"
              onClick={() => setShowHistory(false)}
            >
              X
            </button>
            <h2>Room Booking History</h2>
            <table>
              <thead>
                <tr>
                  <th>Check In</th>
                  <th>Check Out</th>
                </tr>
              </thead>
              <tbody>
                {historyData.length > 0 ? (
                  historyData.map((b) => (
                    <tr key={b.id}>
                      <td>{new Date(b.checkIn).toLocaleString()}</td>
                      <td>{new Date(b.checkOut).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">No bookings</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedRoom && (
        <div className="rm-image-modal">
          <div className="rm-image-modal-content">
            <button
              className="rm-image-close"
              onClick={() => setShowImageModal(false)}
            >
              ✖
            </button>

            <div className="rm-modal-header">
              <h2 className="rm-modal-title">{selectedRoom.roomName}</h2>
              <span
                className={`rm-status-badge ${
                  selectedRoom.roomStatus === "AVAILABLE"
                    ? "available"
                    : "maintenance"
                }`}
              >
                {selectedRoom.roomStatus === "AVAILABLE"
                  ? "Available"
                  : "Maintenance"}
              </span>
            </div>

            <div className="rm-modal-body">
              {/* Left: Info */}
              <div className="rm-modal-info">
                <p className="rm-modal-description">
                  {selectedRoom.description}
                </p>
                <h3>Room Details</h3>
                <ul className="rm-detail-list">
                  <li>
                    <strong>Price:</strong> ${selectedRoom.price}
                  </li>
                  <li>
                    <strong>Capacity:</strong> {selectedRoom.capacity} people
                  </li>
                  <li>
                    <strong>Beds:</strong> {selectedRoom.numberOfBeds}
                  </li>
                  <li>
                    <strong>Hotel:</strong> {selectedRoom.hotelName}
                  </li>
                  <li>
                    <strong>Room Type:</strong> {selectedRoom.roomType}
                  </li>
                </ul>
              </div>

              {/* Right: Images */}
              <div className="rm-image-gallery">
                {selectedRoom.imageUrl && selectedRoom.imageUrl.length > 0 ? (
                  selectedRoom.imageUrl.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`${selectedRoom.roomName} - ${index}`}
                      className="rm-full-image"
                    />
                  ))
                ) : (
                  <p>No images available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default RoomManagermentPage;
