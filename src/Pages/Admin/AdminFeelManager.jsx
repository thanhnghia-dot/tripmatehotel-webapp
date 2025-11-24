import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminFeelManager.css";

function AdminFeelManager() {
  const [feels, setFeels] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const fetchFeels = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8080/api/feels/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFeels(res.data);
    } catch (err) {
      console.error("Failed to fetch feels:", err.response?.data || err.message);
    }
  };

  const deleteFeel = async (feelId, userEmail) => {
    const reason = prompt(`Enter the reason for deleting ${userEmail}'s video:`);
    if (!reason) return;

    try {
      await axios.delete(`http://localhost:8080/api/feels/admin/delete/${feelId}`, {
        params: {
          reason,
          adminEmail: "khaih8375@gmail.com",
        },
      });
      alert("✅ Video deleted and email sent.");
      fetchFeels();
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchFeels();
  }, []);

  return (
    <div className="admin-container">
      <h2>🎬 Feel Video Management</h2>
      <div className="scroll-container">
        <table className="feel-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Caption</th>
              <th>Preview</th>
              <th>❤️ Likes</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feels.map((feel) => (
              <tr key={feel.id}>
                <td>{feel.user?.name}</td>
                <td>{feel.user?.email}</td>
                <td>{feel.caption}</td>
                <td>
                  <button onClick={() => setSelectedVideo(`http://localhost:8080${feel.videoUrl}`)}>▶️</button>
                </td>
                <td>{feel.likeCount || 0}</td>
                <td>{new Date(feel.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteFeel(feel.id, feel.user?.email)}
                  >
                    ❌ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedVideo && (
        <div className="modal" onClick={() => setSelectedVideo(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <video
              src={selectedVideo}
              controls
              autoPlay
              style={{ width: "100%", maxHeight: "80vh" }}
            />
            <button onClick={() => setSelectedVideo(null)} className="close-btn">✖</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFeelManager;
