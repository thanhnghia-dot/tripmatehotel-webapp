import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RoomManagermentPage.css';

const RoomManagermentPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [pageNo, setPageNo] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchCriteria, setSearchCriteria] = useState({ roomName: '' });
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newRoom, setNewRoom] = useState({
    id: null,
    roomName: '',
    description: '',
    price: '',
    capacity: '',
    imageUrls: [],
    hotelId: '',
    previewImages: [],
    existingImageUrls: [],
  });
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/rooms/search', {
        params: { name: searchCriteria.roomName, page: pageNo, size: 4 },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setRooms(response.data.elementList || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      setError('Failed to fetch rooms: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 403) navigate('/403');
      else if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else navigate('/');
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/hotels/search', {
        params: { page: 0, size: 100 },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setHotels(response.data.data.elementList || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setError('Failed to fetch hotels');
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchHotels();
  }, [pageNo, searchCriteria]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPageNo(0);
    fetchRooms();
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (!newRoom.roomName.trim() || !newRoom.description.trim() || !newRoom.price || !newRoom.capacity || !newRoom.hotelId) {
        setError('All fields are required');
        return;
      }
      if (newRoom.imageUrls.length === 0) {
        setError('At least one image is required');
        return;
      }

      const roomData = {
        roomName: newRoom.roomName,
        description: newRoom.description,
        price: newRoom.price,
        capacity: newRoom.capacity,
        hotelId: newRoom.hotelId,
      };
      const formData = new FormData();
      formData.append('request', new Blob([JSON.stringify(roomData)], { type: 'application/json' }));
      Array.from(newRoom.imageUrls).forEach((file) => formData.append('files', file));

      const response = await axios.post('http://localhost:8080/api/rooms', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setIsAddMode(false);
        setNewRoom({
          id: null,
          roomName: '',
          description: '',
          price: '',
          capacity: '',
          imageUrls: [],
          hotelId: '',
          previewImages: [],
          existingImageUrls: [],
        });
        fetchRooms();
        alert('Room created successfully!');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add room');
    }
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (!newRoom.roomName.trim() || !newRoom.description.trim() || !newRoom.price || !newRoom.capacity || !newRoom.hotelId) {
        setError('All fields are required');
        return;
      }
      if (!newRoom.id) {
        setError('Invalid room ID');
        return;
      }

      const roomData = {
        roomName: newRoom.roomName,
        description: newRoom.description,
        price: newRoom.price,
        capacity: newRoom.capacity,
        hotelId: newRoom.hotelId,
      };
      const formData = new FormData();
      formData.append('request', new Blob([JSON.stringify(roomData)], { type: 'application/json' }));
      if (newRoom.imageUrls.length > 0) {
        Array.from(newRoom.imageUrls).forEach((file) => formData.append('files', file));
      }

      const response = await axios.put(`http://localhost:8080/api/rooms/${newRoom.id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setIsEditMode(false);
        setNewRoom({
          id: null,
          roomName: '',
          description: '',
          price: '',
          capacity: '',
          imageUrls: [],
          hotelId: '',
          previewImages: [],
          existingImageUrls: [],
        });
        fetchRooms();
        alert('Room updated successfully!');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update room');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await axios.delete(`http://localhost:8080/api/rooms/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        fetchRooms();
        alert('Room deleted successfully!');
      } catch (error) {
        if (error.response?.status === 500 && error.response?.data?.message.includes('Error when delete room image')) {
          alert('Cannot delete room because it is associated with existing trips.');
        } else {
          alert('Failed to delete room: ' + (error.response?.data?.message || 'Unknown error'));
        }
      }
    }
  };

  const handleChangeStatus = async (id, status) => {
    try {
      const response = await axios.patch(`http://localhost:8080/api/rooms/change-status/${id}`, null, {
        params: { status },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.status === 200) {
        fetchRooms();
        alert(`Room status changed to ${status} successfully!`);
      }
    } catch (error) {
      alert('Failed to change room status: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleBack = () => {
    setIsAddMode(false);
    setIsEditMode(false);
    setNewRoom({
      id: null,
      roomName: '',
      description: '',
      price: '',
      capacity: '',
      imageUrls: [],
      hotelId: '',
      previewImages: [],
      existingImageUrls: [],
    });
    setError(null);
  };

  if (isAddMode) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Add New Room</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleAddRoom} encType="multipart/form-data" className="add-form">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-base font-large text-gray-700">Room Name</label>
              <input
                type="text"
                placeholder="Enter room name"
                className="form-input"
                value={newRoom.roomName}
                onChange={(e) => setNewRoom({ ...newRoom, roomName: e.target.value })}
                required
              />
            </div>
           <div>
              <label className="block text-base font-medium text-gray-700">Description</label>
              <textarea
                placeholder="Enter description"
                className="room-form-input"
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                required
                rows={4} 
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700">Price</label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter price"
                className="form-input"
                value={newRoom.price}
                onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700">Capacity</label>
              <input
                type="number"
                placeholder="Enter capacity"
                className="form-input"
                value={newRoom.capacity}
                onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700">Hotel</label>
              <select
                className="form-input"
                value={newRoom.hotelId}
                onChange={(e) => setNewRoom({ ...newRoom, hotelId: e.target.value })}
                required
              >
                <option value="">Select a hotel</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700">Images</label>
              <div className="image-preview-container">
                {newRoom.previewImages.length > 0 && (
                  <div className="image-preview-row">
                    {newRoom.previewImages.map((image, index) => (
                      <div key={`new-${index}`} className="preview-image-wrapper">
                        <img
                          src={image instanceof File ? URL.createObjectURL(image) : image}
                          alt={`New-${index}`}
                          className="preview-image"
                        />
                        <span className="image-label">New</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="form-input"
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
          <div className="button-group mt-6 flex justify-end gap-4">
            <button type="button" onClick={handleBack} className="back-btn">Back</button>
            <button type="submit" className="save-btn">Save</button>
          </div>
        </form>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Room</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleUpdateRoom} encType="multipart/form-data" className="add-form">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-base font-medium text-gray-700">Room Name</label>
              <input
                type="text"
                placeholder="Enter room name"
                className="form-input"
                value={newRoom.roomName}
                onChange={(e) => setNewRoom({ ...newRoom, roomName: e.target.value })}
                required
              />
            </div>
         <div>
          <label className="block text-base font-medium text-gray-700">Description</label>
          <textarea
            placeholder="Enter description"
            className="room-form-input"
            value={newRoom.description}
            onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
            required
            rows={4} // số dòng hiển thị mặc định
          />
        </div>

            <div>
              <label className="block text-base font-medium text-gray-700">Price</label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter price"
                className="form-input"
                value={newRoom.price}
                onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700">Capacity</label>
              <input
                type="number"
                placeholder="Enter capacity"
                className="form-input"
                value={newRoom.capacity}
                onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700">Hotel</label>
              <select
                className="form-input"
                value={newRoom.hotelId}
                onChange={(e) => setNewRoom({ ...newRoom, hotelId: e.target.value })}
                required
              >
                <option value="">Select a hotel</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700">Images</label>
              <div className="image-preview-container">
                {newRoom.existingImageUrls && newRoom.existingImageUrls.length > 0 && (
                  <>
                    <div className="image-section-label">Existing Images</div>
                    <div className="image-preview-row">
                      {newRoom.existingImageUrls.map((url, index) => (
                        <div key={`existing-${index}`} className="preview-image-wrapper">
                          <img
                            src={url}
                            alt={`Existing-${index}`}
                            className="preview-image"
                          />
                          <span className="image-label">Old</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {newRoom.previewImages.length > 0 && (
                  <>
                    <div className="image-section-label">New Images</div>
                    <div className="image-preview-row">
                      {newRoom.previewImages.map((image, index) => (
                        <div key={`new-${index}`} className="preview-image-wrapper">
                          <img
                            src={image instanceof File ? URL.createObjectURL(image) : image}
                            alt={`New-${index}`}
                            className="preview-image"
                          />
                          <span className="image-label">New</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="form-input"
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
          <div className="button-group mt-6 flex justify-end gap-4">
            <button type="button" onClick={handleBack} className="back-btn">Back</button>
            <button type="submit" className="save-btn">Save</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Room Management</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="search-form mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search by room name"
          className="search-input"
          value={searchCriteria.roomName}
          onChange={(e) => setSearchCriteria({ ...searchCriteria, roomName: e.target.value })}
        />
        <button onClick={handleSearch} className="search-btn">Search</button>
        <button onClick={() => setIsAddMode(true)} className="add-btn">Add Room</button>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="table-header">
              <th className="table-cell">ID</th>
              <th className="table-cell">Room Name</th>
              <th className="table-cell">Description</th>
              <th className="table-cell">Price</th>
              <th className="table-cell">Capacity</th>
              <th className="table-cell">Hotel Name</th>
              <th className="table-cell">Status</th>
              <th className="table-cell">Images</th>
              <th className="table-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="table-row">
                <td className="table-cell">{room.id}</td>
                <td className="table-cell">{room.roomName}</td>
                <td className="table-cell">{room.description}</td>
                <td className="table-cell">{room.price}</td>
                <td className="table-cell">{room.capacity}</td>
                <td className="table-cell">{room.hotelName}</td>
                <td className="table-cell">
                  <select
                    value={room.roomStatus || 'AVAILABLE'}
                    onChange={(e) => handleChangeStatus(room.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="BOOKED">Booked</option>
                  </select>
                </td>
                <td className="table-cell">
                  {room.imageUrl && room.imageUrl.length > 0 && (
                    <div className="image-preview-row">
                      {room.imageUrl.map((url, index) => (
                        url && (
                          <div key={index} className="preview-image-wrapper">
                            <img
                              src={url}
                              alt={`${room.roomName}-${index}`}
                              className="preview-image"
                            />
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </td>
                <td className="table-cell action-cell">
                  <div className="action-buttons">
                    <button
                      onClick={() => {
                        setIsEditMode(true);
                        setNewRoom({
                          id: room.id,
                          roomName: room.roomName,
                          description: room.description,
                          price: room.price,
                          capacity: room.capacity,
                          imageUrls: [],
                          hotelId: room.hotelId,
                          existingImageUrls: room.imageUrl || [],
                          previewImages: [],
                        });
                      }}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button
          onClick={() => setPageNo((prev) => Math.max(prev - 1, 0))}
          disabled={pageNo === 0}
          className="pagination-btn"
        >
          Previous
        </button>
        <div className="pagination-numbers">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setPageNo(index)}
              className={`pagination-number ${pageNo === index ? 'active' : ''}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPageNo((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={pageNo >= totalPages - 1}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RoomManagermentPage;