import React, { useEffect, useState } from "react";
import axios from "axios";
import _ from "lodash";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch, FaFolderOpen, FaTrash, FaTimes } from "react-icons/fa";

const BASE_URL = "http://localhost:8080";

function AdminAlbumScreen() {
  const [images, setImages] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteAlbumForm, setShowDeleteAlbumForm] = useState(false);
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [tripAlbums, setTripAlbums] = useState([]);
  const [selectedAlbumName, setSelectedAlbumName] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [albumImages, setAlbumImages] = useState([]);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [currentImageId, setCurrentImageId] = useState(null);
  const [imageReason, setImageReason] = useState("");

  useEffect(() => {
    fetchAllAlbums();
  }, []);

  const fetchAllAlbums = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/admin/albums/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setImages(res.data);
      setAlbumImages(res.data);
      setFilteredImages(res.data);
    } catch {
      toast.error("❌ Failed to load album list");
    }
  };

  useEffect(() => {
    const search = searchText.trim().toLowerCase();
    const filtered = albumImages.filter((img) => {
      const idMatch = img.tripId?.toString().includes(search);
      const nameMatch = img.tripName?.toLowerCase().includes(search);
      const emailMatch = img.userEmail?.toLowerCase().includes(search);
      return idMatch || nameMatch || emailMatch;
    });
    setFilteredImages(filtered);
  }, [searchText, albumImages]);

  const handleDeleteImageConfirm = async () => {
    if (!imageReason.trim()) {
      toast.warn("⚠️ Please enter a reason to delete the image");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/admin/albums/${currentImageId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { reason: imageReason },
      });
      toast.success("✅ Image deleted successfully!");
      const updated = images.filter((img) => img.id !== currentImageId);
      setImages(updated);
      setAlbumImages(updated);
      setFilteredImages(updated);
      if (selectedAlbum) {
        setSelectedAlbum((prev) => ({
          ...prev,
          albumImages: prev.albumImages.filter((img) => img.id !== currentImageId),
        }));
      }
      setShowReasonModal(false);
      setImageReason("");
    } catch {
      toast.error("❌ Failed to delete image!");
    }
  };

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips(res.data?.data || []);
    } catch {
      toast.error("❌ Failed to load trips");
    }
  };

  const fetchAlbumsByTrip = async (tripId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/admin/albums/by-trip/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(res.data)) {
        const grouped = _.groupBy(res.data, "name");
        setTripAlbums(Object.keys(grouped));
      } else {
        toast.warn("⚠️ API did not return a valid album list");
      }
    } catch (err) {
      console.error("❌ Error fetching albums:", err);
      toast.error("❌ Failed to load albums");
    }
  };

  const handleDeleteAlbum = async () => {
    if (!selectedTripId || !selectedAlbumName) {
      toast.warn("⚠️ Please select both Trip and Album");
      return;
    }
    if (!deleteReason.trim()) {
      toast.warn("⚠️ Please enter a reason to delete the album");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/admin/albums/delete-album`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { tripId: selectedTripId, albumName: selectedAlbumName, reason: deleteReason },
      });
      toast.success("✅ Album deleted successfully!");
      setShowDeleteAlbumForm(false);
      fetchAllAlbums();
    } catch {
      toast.error("❌ Failed to delete album!");
    }
  };

  const groupedAlbums = _.groupBy(filteredImages, "name");

  return (
    <div className="container mt-4">
      <ToastContainer />

      <h2 className="text-center mb-4 fw-bold" style={{ background: "linear-gradient(to right, #007bff, #6610f2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        📸 Trip Album Management
      </h2>

      <div className="text-end mb-3">
        <button className="btn btn-danger" onClick={() => { setShowDeleteAlbumForm(true); fetchTrips(); }}>
          🗑 Delete Album
        </button>
      </div>

      <div className="row mb-4 justify-content-center">
        <div className="col-md-6 position-relative">
          <FaSearch style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#888" }} />
          <input
            type="text"
            className="form-control ps-4 shadow-sm"
            placeholder="🔍 Search by ID, trip name, or email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ borderRadius: 10 }}
          />
        </div>
      </div>

      <div className="table-responsive shadow-sm rounded">
        <table className="table table-striped table-hover text-center align-middle">
          <thead className="table-primary">
            <tr>
              <th>#</th><th>📍 Trip Name</th><th>🆔 Trip ID</th><th>📂 Album</th>
              <th>📧 Email</th><th>🖼 Images</th><th>⚙️ Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedAlbums).length === 0 ? (
              <tr><td colSpan="7" className="text-muted py-4">🚫 No matching data.</td></tr>
            ) : (
              Object.entries(groupedAlbums).map(([albumName, albumImages], index) => (
                <tr key={albumName}>
                  <td>{index + 1}</td>
                  <td>{albumImages[0]?.tripName ?? "N/A"}</td>
                  <td>{albumImages[0]?.tripId ?? "N/A"}</td>
                  <td><FaFolderOpen className="me-2 text-warning" /><strong>{albumName}</strong></td>
                  <td>{albumImages[0]?.userEmail ?? "N/A"}</td>
                  <td><span className="badge bg-info">{albumImages.length}</span></td>
                  <td>
                    <button className="btn btn-sm btn-primary shadow-sm" onClick={() => { setSelectedAlbum({ albumName, albumImages }); setShowModal(true); }}>
                      See details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Image Reason Modal */}
      {showReasonModal && (
        <div className="modal-backdrop d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 3000 }}
          onClick={() => setShowReasonModal(false)}>
          <div className="bg-white p-4 rounded shadow" style={{ width: "90%", maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <h5 className="mb-3 text-danger">🗑 Enter reason for deleting image</h5>
            <textarea
              className="form-control mb-3"
              placeholder="e.g., Image contains inappropriate content..."
              rows={3}
              value={imageReason}
              onChange={(e) => setImageReason(e.target.value)}
            />
            <div className="text-end">
              <button className="btn btn-secondary me-2" onClick={() => setShowReasonModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteImageConfirm}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Album Modal */}
      {showDeleteAlbumForm && (
        <div className="modal-backdrop d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)", position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 3000 }}
          onClick={() => setShowDeleteAlbumForm(false)}>
          <div className="bg-white p-4 rounded shadow" style={{ width: "90%", maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <h5 className="mb-3 fw-bold text-danger">🗑 Delete Album</h5>

            <div className="mb-3">
              <label className="form-label">📍 Select Trip</label>
              <select
                className="form-select"
                value={selectedTripId || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) {
                    setSelectedTripId("");
                    return;
                  }
                  const id = Number(value);
                  setSelectedTripId(id);
                  fetchAlbumsByTrip(id);
                }}
              >
                <option value="">-- Select Trip --</option>
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>{trip.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">📂 Select Album</label>
              <select
                className="form-select"
                value={selectedAlbumName}
                onChange={(e) => setSelectedAlbumName(e.target.value)}
              >
                <option value="">-- Select Album --</option>
                {tripAlbums.map((albumName) => (
                  <option key={albumName} value={albumName}>{albumName}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">✏️ Reason for Deletion</label>
              <textarea className="form-control" rows={3} value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} />
            </div>

            <div className="text-end">
              <button className="btn btn-secondary me-2" onClick={() => setShowDeleteAlbumForm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteAlbum}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Album Details Modal */}
      {showModal && selectedAlbum && (
        <div className="modal-backdrop d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.85)", position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 2000 }}
          onClick={() => setShowModal(false)}>
          <div className="bg-white p-4 rounded shadow-lg" style={{ maxWidth: "90%", maxHeight: "90%", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>
            <button className="btn btn-light position-absolute top-0 end-0 m-2 shadow" onClick={() => setShowModal(false)}>
              <FaTimes />
            </button>
            <h4 className="text-center mb-3">
              📂 Album: <span className="text-primary">{selectedAlbum.albumName}</span>
              <span className="badge bg-secondary ms-2">{selectedAlbum.albumImages.length} images</span>
            </h4>
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              {selectedAlbum.albumImages.map((img) => (
                <div key={img.id} className="card shadow-sm" style={{ width: 200 }}>
                  <img src={`${BASE_URL}${img.url}`} className="card-img-top" style={{ height: 150, objectFit: "cover" }} />
                  <div className="card-body text-center">
                    <small className="text-muted d-block mb-2">{new Date(img.createdAt).toLocaleString()}</small>
                    <button className="btn btn-danger btn-sm" onClick={() => { setCurrentImageId(img.id); setShowReasonModal(true); }}>
                      <FaTrash className="me-1" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminAlbumScreen;
