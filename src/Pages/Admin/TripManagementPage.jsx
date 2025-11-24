import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './TripManagementPage.css';

const TripManagementPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [pageNo, setPageNo] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [dateError, setDateError] = useState("");
  const [searchParams, setSearchParams] = useState({
    name: '',
    creator: '',
    startDate: '',
    endDate: '',
    status: [], // đổi từ null -> [] để lưu nhiều trạng thái
  });
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [error, setError] = useState(null);

  const fetchTrips = async () => {
    try {
      const params = {
        ...searchParams,
        page: pageNo,
        size: 5,
        startDate: searchParams.startDate ? new Date(searchParams.startDate).toISOString() : undefined,
        endDate: searchParams.endDate ? new Date(searchParams.endDate).toISOString() : undefined,
        status: searchParams.status.length > 0 ? searchParams.status.join(",") : undefined,
      };
      console.log('API Request Params:', params);
      const response = await axios.get('http://localhost:8080/api/trips/search', {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log('API Response:', response.data);
      setTrips(response.data.elementList || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Fetch Trips Error:', error);
      setError('Failed to fetch trips: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const fetchTripDetail = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/trips/detail/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSelectedTrip(response.data);
    } catch (error) {
      setError('Failed to fetch trip details: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteTrip = async (tripId, isFinished) => {
    // If trip is finished, delete without confirmation
    if (isFinished) {
      try {
        await axios.delete(`http://localhost:8080/api/trips/delete/${tripId}`, {
          params: { confirm: true },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setSelectedTrip(null);
        fetchTrips();
        alert('Trip deleted successfully!');
      } catch (error) {
        setError('Failed to delete trip: ' + (error.response?.data?.message || error.message));
      }
    } else {
      // For unfinished trips, show confirmation dialog
      if (window.confirm('Are you sure you want to delete this trip?')) {
        try {
          await axios.delete(`http://localhost:8080/api/trips/delete/${tripId}`, {
            params: { confirm: true },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setSelectedTrip(null);
          fetchTrips();
          alert('Trip deleted successfully!');
        } catch (error) {
          setError('Failed to delete trip: ' + (error.response?.data?.message || error.message));
        }
      }
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [pageNo, searchParams]);

  useEffect(() => {
    console.log('Trips State:', trips);
  }, [trips]);

  const handleFinishedChange = (e) => {
    if (e.target.checked) {
      setSearchParams({ ...searchParams, isFinished: true });
    } else {
      setSearchParams({ ...searchParams, isFinished: null });
    }
  };

  const handleUnfinishedChange = (e) => {
    if (e.target.checked) {
      setSearchParams({ ...searchParams, isFinished: false });
    } else {
      setSearchParams({ ...searchParams, isFinished: null });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="header-section flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Trip Management</h1>
        {selectedTrip && (
          <button onClick={() => setSelectedTrip(null)} className="back-btn">
            Back
          </button>
        )}
      </div>
      {error && <p className="error-message text-sm text-red-600">{error}</p>}

      {selectedTrip ? (
        <div className="trip-detail-form bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Trip Details</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold w-28">Name:</p>
                <p className="text-sm">{selectedTrip.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold w-28">Type:</p>
                <p className="text-sm">{selectedTrip.type}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold w-28">Start Date:</p>
                <p className="text-sm">{new Date(selectedTrip.startDate).toLocaleDateString('en-US')}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold w-28">End Date:</p>
                <p className="text-sm">{new Date(selectedTrip.endDate).toLocaleDateString('en-US')}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold w-28">Status:</p>
                <p className={`text-sm ${selectedTrip.status === "Completed" ? "status-finished" :
                  selectedTrip.status === "Ongoing" ? "status-ongoing" :
                    "status-planning"
                  }`}>
                  {selectedTrip.status}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold w-28">Public:</p>
                <p className="text-sm">{selectedTrip.isPublic ? 'Yes' : 'No'}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold w-28">Hotel:</p>
                <p className="text-sm">{selectedTrip.hotel}</p>
              </div>
              {selectedTrip.hotelImg && (
                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold w-28">Hotel Image:</p>
                  <div className="image-frame w-24 h-24">
                    <img src={selectedTrip.hotelImg} alt="Hotel" className="w-full h-full object-cover rounded" />
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold w-28">Room:</p>
                <p className="text-sm">{selectedTrip.roomName}</p>
              </div>
              {selectedTrip.roomImgs && selectedTrip.roomImgs.length > 0 && (
                <div className="flex items-start gap-4">
                  <p className="text-sm font-semibold w-28">Room Images:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrip.roomImgs.map((img, index) => (
                      <div key={index} className="image-frame w-20 h-20">
                        <img src={img} alt={`Room ${index}`} className="w-full h-full object-cover rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold w-28">Created By:</p>
                <p className="text-sm">{selectedTrip.createdByUser}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold w-28">Total Amount:</p>
                <p className="text-sm">{selectedTrip.totalAmount}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold w-28">Created At:</p>
                <p className="text-sm">{new Date(selectedTrip.createdAt).toLocaleDateString('en-US')}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold w-28">Members:</p>
                <p className="text-sm">{selectedTrip.memberNames.join(', ')}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold w-28">Member Count:</p>
                <p className="text-sm">{selectedTrip.memberCount}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="search-filter mb-6 flex flex-row gap-4">
            <div className="search-section w-1/2 bg-white p-4 rounded-lg shadow">
              <h3 className="text-md font-semibold mb-2">Search by</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Trip Name"
                    className="form-input text-sm w-1/2"
                    value={searchParams.name}
                    onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Creator"
                    className="form-input text-sm w-1/2"
                    value={searchParams.creator}
                    onChange={(e) => setSearchParams({ ...searchParams, creator: e.target.value })}
                  />
                </div>
                <div className="tp-status-filters">
                  {["Planning", "Ongoing", "Completed"].map((status) => (
                    <label key={status}>
                      <input
                        type="checkbox"
                        checked={searchParams.status.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSearchParams({ ...searchParams, status: [status] });
                          } else {
                            setSearchParams({ ...searchParams, status: [] });
                          }
                        }}
                      />
                      {status} Trips Only
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="filter-section w-1/2 bg-white p-4 rounded-lg shadow">
              <h3 className="text-md font-semibold mb-2">Filter by</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <label className="text-sm font-semibold">Start Date</label>
                    <input
                      type="date"
                      className="form-input text-sm w-full"
                      value={searchParams.startDate}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        if (searchParams.endDate && newStart > searchParams.endDate) {
                          setDateError("Start Date không được lớn hơn End Date!");
                          return;
                        }
                        setDateError("");
                        setSearchParams({ ...searchParams, startDate: newStart });
                      }}
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="text-sm font-semibold">End Date</label>
                    <input
                      type="date"
                      className="form-input text-sm w-full"
                      value={searchParams.endDate}
                      onChange={(e) => {
                        const newEnd = e.target.value;
                        if (searchParams.startDate && newEnd < searchParams.startDate) {
                          setDateError("End Date không được nhỏ hơn Start Date!");
                          return;
                        }
                        setDateError("");
                        setSearchParams({ ...searchParams, endDate: newEnd });
                      }}
                    />
                  </div>
                </div>

                {/* Hiển thị lỗi nếu có */}
                {dateError && (
                  <p className="text-xs text-red-500 mt-1">{dateError}</p>
                )}

                {/* Nút Clear */}
                <div>
                  <button
                    type="button"
                    className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200 text-sm"
                    onClick={() => {
                      setSearchParams({ ...searchParams, startDate: "", endDate: "" });
                      setDateError("");
                    }}
                  >
                    Clear Dates
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="trip-list mb-6">
            <h2 className="text-xl font-semibold mb-4">Trip List</h2>
            {trips.length === 0 ? (
              <p className="text-sm text-gray-600">No trips found matching the current filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="table-header">
                      <th className="table-cell">ID</th>
                      <th className="table-cell">Name</th>
                      <th className="table-cell">Type</th>
                      <th className="table-cell">Start Date</th>
                      <th className="table-cell">End Date</th>
                      <th className="table-cell">Status</th>
                      <th className="table-cell">Visibility</th>
                      <th className="table-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map((trip) => (
                      <tr key={trip.id} className="table-row">
                        <td className="table-cell">{trip.id}</td>
                        <td className="table-cell">{trip.name}</td>
                        <td className="table-cell">{trip.type}</td>
                        <td className="table-cell">{new Date(trip.startDate).toLocaleDateString('en-US')}</td>
                        <td className="table-cell">{new Date(trip.endDate).toLocaleDateString('en-US')}</td>
                        <td className="table-cell">
                          <span
                            className={
                              trip.status?.toUpperCase() === "COMPLETED"
                                ? "status-finished"
                                : trip.status?.toUpperCase() === "ONGOING"
                                  ? "status-ongoing"
                                  : "status-planning"
                            }
                          >
                            {trip.status}
                          </span>
                        </td>
                        {/* 👇 thêm cột Public/Private */}
                        <td className="table-cell visibility-cell">
                          <span className={`visibility-label ${trip.isPublic ? 'visibility-public' : 'visibility-private'}`}>
                            {trip.isPublic ? 'Public' : 'Private'}
                          </span>
                        </td>
                        <td className="table-cell action-cell">
                          <button
                            onClick={() => fetchTripDetail(trip.id)}
                            className="action-btn w-full mb-2"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteTrip(trip.id, trip.status === "COMPLETED")}
                            className="action-btn w-full"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}
            <div className="pagination mt-4 flex justify-between items-center">
              <button
                onClick={() => setPageNo((prev) => Math.max(prev - 1, 0))}
                disabled={pageNo === 0}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="text-sm">Page {pageNo + 1} of {totalPages}</span>
              <button
                onClick={() => setPageNo((prev) => Math.min(prev + 1, totalPages - 1))}
                disabled={pageNo >= totalPages - 1}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TripManagementPage;