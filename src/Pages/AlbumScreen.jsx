import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./AlbumScreen.css";

const BASE_URL = "http://localhost:8080/api";

function AlbumScreen() {
  const { tripId } = useParams();
  const [images, setImages] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [albumName, setAlbumName] = useState("");
  const [albumDate, setAlbumDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [tripName, setTripName] = useState("");
  const [modalGroup, setModalGroup] = useState(null);

  // ✅ Load favorites từ LocalStorage
  useEffect(() => {
    const storedFav = JSON.parse(localStorage.getItem("albumFavorites")) || [];
    setFavorites(storedFav);
  }, []);

  // ✅ Lưu favorites khi thay đổi
  useEffect(() => {
    localStorage.setItem("albumFavorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    fetchAlbum();
    fetchTripName();
  }, [tripId]);

  const fetchAlbum = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/albums/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setImages(res.data);
    } catch {
      setError("❌ Không tìm thấy album hoặc xảy ra lỗi khi tải ảnh.");
    }
  };

  const fetchTripName = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTripName(res.data.data?.name || "Không rõ tên chuyến");
    } catch {
      setTripName("Không rõ tên chuyến");
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
    setError("");
    setSuccess("");
  };

  const handleUpload = async () => {
    setError("");
    setSuccess("");

    if (selectedFiles.length === 0) return setError("⚠️ Chọn ít nhất 1 ảnh.");
    if (!albumName.trim()) return setError("⚠️ Chọn hoặc nhập tên album.");
    if (!albumDate) return setError("⚠️ Chọn ngày tạo album.");

    const today = new Date().toISOString().split("T")[0];
    if (albumDate > today) return setError("⚠️ Ngày tạo không hợp lệ.");

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("images", file));
    formData.append("name", albumName.trim());
    formData.append("date", albumDate);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${BASE_URL}/albums/${tripId}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("✅ Upload thành công!");
      setSelectedFiles([]);
      setAlbumName("");
      setAlbumDate("");
      fetchAlbum();
    } catch {
      setError("❌ Upload thất bại. Kiểm tra console để biết chi tiết.");
    }
  };

  // ✅ Gom nhóm album
  const groupedImages = images.reduce((acc, img) => {
    if (!acc[img.name]) acc[img.name] = [];
    acc[img.name].push(img);
    return acc;
  }, {});

  // ✅ Hàm toggle yêu thích
  const toggleFavorite = (albumName) => {
    setFavorites((prev) =>
      prev.includes(albumName)
        ? prev.filter((name) => name !== albumName)
        : [...prev, albumName]
    );
  };

  // ✅ Sắp xếp album: yêu thích lên đầu
  const sortedAlbums = Object.entries(groupedImages).sort(([nameA], [nameB]) => {
    const aFav = favorites.includes(nameA);
    const bFav = favorites.includes(nameB);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  return (
    <div className="album-container">
      <div className="album-wrapper">
        <h1 className="album-title">📸 Album Trip</h1>
        <p className="trip-name">🚩 {tripName}</p>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <button className="btn-primary" onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? "⬆ Hide Form Upload" : "➕ Add New Photo"}
        </button>
        <hr />

        {/* ✅ Form Upload */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="upload-form"
            >
              <label>📂 Select an available album:</label>
              <select value={albumName} onChange={(e) => setAlbumName(e.target.value)}>
                <option value="">-- Choose album --</option>
                {Object.keys(groupedImages).map((name, i) => (
                  <option key={i} value={name}>{name}</option>
                ))}
              </select>

              <p className="note">Or enter a new album name:</p>
              <input
                type="text"
                placeholder="Tên album mới..."
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
              />

              <input
                type="date"
                value={albumDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setAlbumDate(e.target.value)}
              />

              <input type="file" multiple accept="image/*" onChange={handleFileChange} />

              {/* ✅ Preview + nút Xóa từng ảnh + nút Xóa tất cả */}
              {selectedFiles.length > 0 && (
                <div>
                  <button
                    onClick={() => setSelectedFiles([])}
                    style={{
                      marginBottom: 10,
                      padding: "6px 12px",
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: 5,
                      cursor: "pointer"
                    }}
                  >
                    ❌ Deselect all
                  </button>

                  <div className="preview-grid">
                    {selectedFiles.map((file, i) => (
                      <div key={i} style={{ position: "relative", display: "inline-block", margin: 5 }}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 5 }}
                        />
                        <button
                          onClick={() =>
                            setSelectedFiles((prev) => prev.filter((_, index) => index !== i))
                          }
                          style={{
                            position: "absolute",
                            top: 2,
                            right: 2,
                            background: "rgba(0,0,0,0.6)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            cursor: "pointer"
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn-upload" onClick={handleUpload}>
                🚀 Upload {selectedFiles.length > 0 && `(${selectedFiles.length} ảnh)`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ Danh sách Album */}
        <div className="album-grid">
          {sortedAlbums.length > 0 ? (
            sortedAlbums.map(([name, group], idx) => (
              <motion.div key={idx} whileHover={{ scale: 1.03 }} className="album-card">
                <div className="relative">
                  {favorites.includes(name) && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="absolute top-2 right-2 text-2xl"
                    >
                      ⭐
                    </motion.span>
                  )}
                  <img src={`http://localhost:8080${group[0].url}`} alt={name} />
                </div>

                <div className="album-info">
                  <h3>{name}</h3>
                  <p>📅 {new Date(group[0].createdAt).toLocaleDateString("vi-VN")}</p>

                  <div className="btn-row">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => toggleFavorite(name)}
                      className="btn-fav"
                    >
                      {favorites.includes(name) ? "💔 Unfavorite" : "❤️Favourite"}
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setModalGroup(group)}
                      className="btn-view"
                    >
                      🔍See Details
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="no-image">📭 There are no photos yet.</p>
          )}
        </div>

        {/* ✅ Modal Chi Tiết Album */}
        <AnimatePresence>
          {modalGroup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setModalGroup(null)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="modal-close" onClick={() => setModalGroup(null)}>×</button>
                <h2>📂Album Details</h2>
                <div className="modal-grid">
                  {modalGroup.map((img, i) => (
                    <div key={i} className="modal-item">
                      <img src={`http://localhost:8080${img.url}`} alt={img.name} />
                      <div>
                        <p><b>Name:</b> {img.name}</p>
                        <p><b>Day:</b> {new Date(img.createdAt).toLocaleString("vi-VN")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AlbumScreen;
  