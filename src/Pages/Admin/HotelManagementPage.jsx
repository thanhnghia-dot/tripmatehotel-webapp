import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './HotelManagermentPage.css';

const HotelManagermentPage = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [pageNo, setPageNo] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchCriteria, setSearchCriteria] = useState({ name: '', address: '' });
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newHotel, setNewHotel] = useState({
    id: null,
    name: '',
    address: '',
    checkIn: '2025-06-26T15:21', // Updated to current time 03:21 PM +07
    checkOut: '2025-06-27T12:00',
    image: null,
  });
  const [error, setError] = useState(null);

  const fetchHotels = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/hotels/search', {
        params: { ...searchCriteria, page: pageNo, size: 4 },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setHotels(response.data.data.elementList);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      if (error.response?.status === 403) {
        navigate('/403');
      } else {
        navigate('/');
      }
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [pageNo, searchCriteria]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPageNo(0);
    fetchHotels();
  };

  const handleAddHotel = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (!newHotel.name.trim() || !newHotel.address.trim()) {
        setError('Name and Address are required');
        return;
      }
      if (!newHotel.image) {
        setError('You must upload an image');
        return;
      }

      const hotelData = {
        name: newHotel.name,
        address: newHotel.address,
        checkIn: `${newHotel.checkIn}:00`,
        checkOut: `${newHotel.checkOut}:00`,
      };
      const formData = new FormData();
      formData.append('req', new Blob([JSON.stringify(hotelData)], { type: 'application/json' }));
      formData.append('file', newHotel.image);

      const response = await axios.post('http://localhost:8080/api/hotels', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setIsAddMode(false);
        setNewHotel({
          id: null,
          name: '',
          address: '',
          checkIn: '2025-06-26T15:21',
          checkOut: '2025-06-27T12:00',
          image: null,
        });
        fetchHotels();
        alert('Hotel created successfully!');
      }
    } catch (error) {
      console.error('Error adding hotel:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to add hotel');
    }
  };

  const handleUpdateHotel = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (!newHotel.name.trim() || !newHotel.address.trim()) {
        setError('Name and Address are required');
        return;
      }
      if (!newHotel.id) {
        setError('Invalid hotel ID');
        return;
      }

      const hotelData = {
        name: newHotel.name,
        address: newHotel.address,
        checkIn: `${newHotel.checkIn}:00`,
        checkOut: `${newHotel.checkOut}:00`,
      };
      const formData = new FormData();
      formData.append('req', new Blob([JSON.stringify(hotelData)], { type: 'application/json' }));
      if (newHotel.image) {
        formData.append('file', newHotel.image);
      }

      const response = await axios.put(`http://localhost:8080/api/hotels/${newHotel.id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setIsEditMode(false);
        setNewHotel({
          id: null,
          name: '',
          address: '',
          checkIn: '2025-06-26T15:21',
          checkOut: '2025-06-27T12:00',
          image: null,
        });
        fetchHotels();
        alert('Hotel updated successfully!');
      }
    } catch (error) {
      console.error('Error updating hotel:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to update hotel');
    }
  };

  const handleDeleteHotel = async (id) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        await axios.delete(`http://localhost:8080/api/hotels/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        fetchHotels();
        alert('Hotel deleted successfully!');
      } catch (error) {
        console.error('Error deleting hotel:', error);
        if (
          error.response?.status === 500 &&
          error.response?.data?.message.includes('Error when delete hotel image')
        ) {
          alert('Cannot delete hotel because it is associated with existing trips.');
        } else {
          alert('Failed to delete hotel: ' + (error.response?.data?.message || 'Unknown error'));
        }
      }
    }
  };

  if (isAddMode) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Add New Hotel</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleAddHotel} encType="multipart/form-data" className="add-form">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-base font-medium text-gray-700">Hotel Name</label>
              <input
                type="text"
                placeholder="Hotel Name"
                className="form-input"
                value={newHotel.name}
                onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700">Address</label>
              <input
                type="text"
                placeholder="Address"
                className="form-input"
                value={newHotel.address}
                onChange={(e) => setNewHotel({ ...newHotel, address: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700">Check-In Time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={newHotel.checkIn}
                onChange={(e) => setNewHotel({ ...newHotel, checkIn: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700">Check-Out Time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={newHotel.checkOut}
                onChange={(e) => setNewHotel({ ...newHotel, checkOut: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700">Image</label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={(e) => setNewHotel({ ...newHotel, image: e.target.files[0] })}
                required
              />
            </div>
          </div>
          <div className="button-group mt-6 flex justify-end gap-4">
            <button type="button" onClick={() => setIsAddMode(false)} className="back-btn">
              Back
            </button>
            <button type="submit" className="save-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Hotel</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleUpdateHotel} encType="multipart/form-data" className="add-form">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-base font-medium text-gray-700">Hotel Name</label>
              <input
                type="text"
                placeholder="Hotel Name"
                className="form-input"
                value={newHotel.name}
                onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700">Address</label>
              <input
                type="text"
                placeholder="Address"
                className="form-input"
                value={newHotel.address}
                onChange={(e) => setNewHotel({ ...newHotel, address: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700">Check-In Time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={newHotel.checkIn}
                onChange={(e) => setNewHotel({ ...newHotel, checkIn: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700">Check-Out Time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={newHotel.checkOut}
                onChange={(e) => setNewHotel({ ...newHotel, checkOut: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700">Image</label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={(e) => setNewHotel({ ...newHotel, image: e.target.files[0] })}
              />
            </div>
          </div>
          <div className="button-group mt-6 flex justify-end gap-4">
            <button type="button" onClick={() => setIsEditMode(false)} className="back-btn">
              Back
            </button>
            <button type="submit" className="save-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Hotel Management</h1>

      {/* Search Form */}
      <div className="search-form mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search by name"
          className="search-input"
          value={searchCriteria.name}
          onChange={(e) => setSearchCriteria({ ...searchCriteria, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Search by address"
          className="search-input"
          value={searchCriteria.address}
          onChange={(e) => setSearchCriteria({ ...searchCriteria, address: e.target.value })}
        />
        <button onClick={handleSearch} className="search-btn">
          Search
        </button>
        <button onClick={() => setIsAddMode(true)} className="add-btn">
          Add Hotel
        </button>
      </div>

      {/* Hotels Table */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="table-header">
              <th className="table-cell">ID</th>
              <th className="table-cell">Name</th>
              <th className="table-cell">Address</th>
              <th className="table-cell">Check In</th>
              <th className="table-cell">Check Out</th>
              <th className="table-cell">Star Rating</th>
              <th className="table-cell">Rooms</th>
              <th className="table-cell">Image</th>
              <th className="table-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((hotel) => (
              <tr key={hotel.id} className="table-row">
                <td className="table-cell">{hotel.id}</td>
                <td className="table-cell">{hotel.name}</td>
                <td className="table-cell">{hotel.address}</td>
                <td className="table-cell">{new Date(hotel.checkIn).toLocaleString('en-US')}</td>
                <td className="table-cell">{new Date(hotel.checkOut).toLocaleString('en-US')}</td>
                <td className="table-cell">{hotel.starRating || 'N/A'}</td>
                <td className="table-cell">
                  {hotel.rooms?.length > 0 ? hotel.rooms.map((room) => room.roomName).join(', ') : 'No rooms'}
                </td>
                <td className="table-cell">
                  {hotel.imageUrl && (
                    <img src={hotel.imageUrl} alt={hotel.name} className="table-image" />
                  )}
                </td>
                <td className="table-cell action-cell">
                  <button
                    onClick={() => {
                      setIsEditMode(true);
                      setNewHotel({
                        id: hotel.id,
                        name: hotel.name,
                        address: hotel.address,
                        checkIn: new Date(hotel.checkIn).toISOString().slice(0, 16),
                        checkOut: new Date(hotel.checkOut).toISOString().slice(0, 16),
                        image: null,
                      });
                    }}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteHotel(hotel.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

export default HotelManagermentPage;