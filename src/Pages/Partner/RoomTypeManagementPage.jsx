// tại file ReviewManagementPage1.jsx (đổi tên tuỳ bạn, hoặc cập nhật import/route...)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './RoomTypeManagementPage.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const ITEMS_PER_PAGE = 6;

const RoomTypeManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const preselectedHotelId = params.get('hotelId') || '';
  const [hotels, setHotels] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState(preselectedHotelId);
  const [isAddMode, setIsAddMode] = useState(!!preselectedHotelId);
  const [form, setForm] = useState({
    id: null,
    typeName: '',
    description: '',
    hotelId: selectedHotelId,
    imageFile: null,
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  // pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(roomTypes.length / ITEMS_PER_PAGE);
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
    </>
  const fetchHotels = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/hotels', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setHotels(res.data || []);
    } catch {
      setHotels([]);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/rooms-types', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const raw = res.data;
      setRoomTypes(Array.isArray(raw) ? raw : raw.data || []);
      setCurrentPage(0);
    } catch {
      setRoomTypes([]);
    }
  };

  useEffect(() => {
    fetchHotels();
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    if (preselectedHotelId) {
      setForm((p) => ({ ...p, hotelId: preselectedHotelId }));
      setSelectedHotelId(preselectedHotelId);
      setIsAddMode(true);
    }
  }, [preselectedHotelId, hotels.length]);

  const handleAdd = () => {
    setForm({id: null, typeName: '', description: '', hotelId: selectedHotelId, imageFile: null});
    setPreviewImage(null);
    setIsAddMode(true);
   
  };

  const handleEdit = (rt) => {
    setForm({
      id: rt.id,
      typeName: rt.typeName,
      description: rt.description,
      hotelId: rt.hotelId,
      imageFile: null,
    });
    setPreviewImage(Array.isArray(rt.imageUrls) ? rt.imageUrls[0] : rt.imageUrls);
    setIsAddMode(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.typeName.trim()) errs.typeName = 'Please enter room type name.';
    if (!form.description.trim()) errs.description = 'Please enter description.';
    if (!form.hotelId) errs.hotelId = 'Please select hotel.';

    if (form.id) {
      const init = { ...form };
      delete init.imageFile;
      const changed =
        form.typeName !== init.typeName ||
        form.description !== init.description ||
        form.hotelId !== init.hotelId ||
        form.imageFile;
      if (!changed) errs.general = 'You must change something before saving.';
    }

    if (Object.keys(errs).length) {
      setValidationErrors(errs);
      return;
    }

    const reqObj = {
      typeName: form.typeName.trim(),
      description: form.description.trim(),
      hotelId: form.hotelId,
    };
    const fd = new FormData();
    fd.append('request', new Blob([JSON.stringify(reqObj)], { type: 'application/json' }));
    if (form.imageFile) fd.append('files', form.imageFile);

    const cfg = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    };

    try {
      if (form.id) {
        await axios.put(`http://localhost:8080/api/rooms-types/${form.id}`, fd, cfg);
        toast.success('✔️ Room type updated successfully!')
      } else {
        await axios.post('http://localhost:8080/api/rooms-types', fd, cfg);
        toast.success('✔️ Room type added successfully!');
      }

      setIsAddMode(false);
      setForm({ id: null, typeName: '', description: '', hotelId: '', imageFile: null });
      setPreviewImage(null);
      setValidationErrors({});
      fetchRoomTypes();
    } catch {
      toast.error('❌ Failed to load room types!');
    }
  };

 const paged = roomTypes
  .filter(rt => !selectedHotelId || String(rt.hotelId) === String(selectedHotelId))
  .slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);


  return (
  <div className="rtm-container">
    <h1 className="rtm-page-title">Room Type Management</h1>

    {isAddMode ? (
      <div className="rtm-form-container">
        <h2 className="rtm-form-title">{form.id ? 'Edit' : 'Add'} Room Type</h2>
        {validationErrors.general && <p className="rtm-error">{validationErrors.general}</p>}
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="rtm-form">
          
          <select
            className="rtm-input"
            value={form.typeName}
            onChange={(e) => setForm({ ...form, typeName: e.target.value })}
          >
            <option value="">-- Select Room Type --</option>
           <option value="Single">Single</option>        {/* Phòng 1 người */}
<option value="Double">Double</option>        {/* Phòng 2 người */}
<option value="Twin">Twin</option>            {/* 2 giường đơn */}
<option value="Deluxe">Deluxe</option>        {/* Phòng nâng cấp, rộng hơn */}
<option value="Suite">Suite</option>          {/* Phòng sang trọng, nhiều tiện nghi */}
<option value="Family">Family</option>        {/* Phòng gia đình, nhiều giường */}
<option value="Executive">Executive</option>  {/* Phòng hạng cao, thường dành cho doanh nhân */}
<option value="Presidential">Presidential</option> 
          </select>
          {validationErrors.typeName && <p className="rtm-error">{validationErrors.typeName}</p>}

          <textarea
            placeholder="Description"
            className="rtm-input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {validationErrors.description && <p className="rtm-error">{validationErrors.description}</p>}

          <select
            value={form.hotelId}
            className="rtm-input"
            onChange={(e) => setForm({ ...form, hotelId: e.target.value })}
            disabled={!!form.hotelId}
          >
            {!form.id && <option value="">-- Select Hotel --</option>}
            {hotels
              .filter(h => !form.id || String(h.id) === String(form.hotelId))
              .map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
          {validationErrors.hotelId && <p className="rtm-error">{validationErrors.hotelId}</p>}

          <input
            type="file"
            accept="image/*"
            className="rtm-input-file"
            onChange={(e) => {
              setForm({ ...form, imageFile: e.target.files[0] });
              if (e.target.files[0]) setPreviewImage(URL.createObjectURL(e.target.files[0]));
            }}
          />
          {previewImage && <img src={previewImage} alt="Preview" className="rtm-preview-img" />}

          <div className="rtm-btn-group">
            <button type="submit" className="rtm-btn-primary">
              {form.id ? 'Save Changes' : 'Add Room Type'}
            </button>
            <button
              type="button"
              className="rtm-btn-secondary"
              onClick={() => navigate('/partner/hotelmanager')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    ) : (
      <>
        <div className="rtm-search-bar">
          <select
            className="rtm-input rtm-select-hotel"
            value={selectedHotelId}
            onChange={(e) => { setSelectedHotelId(e.target.value); setCurrentPage(0); }}
            disabled={!!preselectedHotelId}
          >
            <option value="">-- Filter by Hotel --</option>
            {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
          <button className="rtm-btn-primary" onClick={handleAdd}>Add Room Type</button>
        </div>

        <table className="rtm-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Type Name</th>
              <th>Description</th>
              <th>Hotel</th>
              <th className="rtm-text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(rt => (
              <tr key={rt.id} className="rtm-table-row">
                <td>
                  {rt.imageUrls ? (
                    <img
                      src={Array.isArray(rt.imageUrls) ? rt.imageUrls[0] : rt.imageUrls?.split(',')[0]}
                      alt={rt.typeName}
                      className="rtm-table-img"
                    />
                  ) : (
                    <span className="rtm-no-image">—</span>
                  )}
                </td>
                <td>{rt.typeName}</td>
              <td className="rtm-wrap-text">
  {rt.description.length > 80 
    ? rt.description.slice(0, 80) + '...' 
    : rt.description}
</td>
                <td>{rt.hotelName}</td>
                <td className="rtm-text-center">
                  <button className="rtm-btn-edit" onClick={() => handleEdit(rt)}>Edit</button>
                  <button className="rtm-btn-addroom" onClick={() => navigate(`/rooms/add?roomTypeId=${rt.id}`)}>Add Room</button>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={5} className="rtm-no-data">No Room Types found</td>
              </tr>
            )}
          </tbody>
        </table>

        <nav className="rtm-pagination-nav">
          <button
            className="rtm-page-btn"
            onClick={() => setCurrentPage(p => Math.max(p-1, 0))}
            disabled={currentPage === 0}
          >
            ← Previous
          </button>
          <span className="rtm-page-info">
            Page {totalPages === 0 ? 0 : currentPage+1} of {totalPages || 1}
          </span>
          <button
            className="rtm-page-btn"
            onClick={() => setCurrentPage(p => Math.min(p+1, totalPages-1))}
            disabled={currentPage >= totalPages-1}
          >
            Next →
          </button>
        </nav>
      </>
    )}
  </div>
);

};

export default RoomTypeManagementPage;
