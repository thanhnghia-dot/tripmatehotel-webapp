import React, { useEffect, useState } from "react";
import axios from "axios";
import _ from "lodash";
import { Badge } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const BASE_URL = "http://localhost:8080/api";

function AlbumByTrip() {
  const [groupedAlbums, setGroupedAlbums] = useState({});
  const [expandedTrips, setExpandedTrips] = useState({});
  const [openAlbum, setOpenAlbum] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [tripNames, setTripNames] = useState({});

  const getLocalDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setIsLoggedIn(false);
    setIsLoggedIn(true);
    fetchAllImages(token);
  }, []);

  const fetchTripName = async (tripId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data?.name || `Trip #${tripId}`;
    } catch {
      return `Trip #${tripId}`;
    }
  };

  const fetchAllImages = async (token) => {
    try {
      const res = await axios.get(`${BASE_URL}/albums`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tripsGrouped = _.groupBy(res.data, (img) => img.trip?.tripId || img.tripId);

      const finalGroups = {};
      const names = {};

      for (const [tripId, imgs] of Object.entries(tripsGrouped)) {
        finalGroups[tripId] = _.groupBy(imgs, (img) => img.name);
        names[tripId] = await fetchTripName(tripId);
      }

      setGroupedAlbums(finalGroups);
      setTripNames(names);
    } catch (err) {
      console.error("❌ Error fetching images:", err);
    }
  };

  const toggleTrip = (tripId) =>
    setExpandedTrips((prev) => ({ ...prev, [tripId]: !prev[tripId] }));

  const handleDeleteAlbum = async (tripId, albumName) => {
    if (!window.confirm(`Are you sure you want to delete the entire album "${albumName}"?`)) return;

    const token = localStorage.getItem("token");
    const imgs = groupedAlbums[tripId][albumName] || [];

    try {
      for (const img of imgs) {
        await axios.delete(`${BASE_URL}/albums/${img.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchAllImages(token);
      setOpenAlbum(null);
    } catch (error) {
      if (error.response?.status === 403) {
        alert("🚫 You do not have permission to delete this album.");
      } else {
        alert("❌ Error deleting album. Please try again.");
        console.error(error);
      }
    }
  };

  const toggleSelectImage = (imgId) => {
    setSelectedImages((prev) =>
      prev.includes(imgId) ? prev.filter((id) => id !== imgId) : [...prev, imgId]
    );
  };

  const handleSelectAllImages = () => {
    if (!openAlbum) return;

    const allImages = groupedAlbums?.[openAlbum.tripId]?.[openAlbum.albumName] || [];
    const allImageIds = allImages.map((img) => img.id);
    const areAllSelected = allImageIds.every((id) => selectedImages.includes(id));

    if (areAllSelected) {
      setSelectedImages([]);
    } else {
      setSelectedImages(allImageIds);
    }
  };

  const handleDeleteSelectedImages = async () => {
    if (selectedImages.length === 0) {
      alert("You have not selected any images to delete!");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedImages.length} selected images?`)) return;

    const token = localStorage.getItem("token");

    try {
      for (const imgId of selectedImages) {
        await axios.delete(`${BASE_URL}/albums/${imgId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setSelectedImages([]);
      fetchAllImages(token);
    } catch (error) {
      if (error.response?.status === 403) {
        alert("🚫 You do not have permission to delete images.");
      } else {
        alert("❌ Error deleting images. Please try again.");
        console.error(error);
      }
    }
  };

  if (!isLoggedIn) {
    return <p style={{ textAlign: "center", marginTop: 50 }}>🚫 You need to login to view albums.</p>;
  }

  const filteredTrips = Object.entries(groupedAlbums)
    .filter(([tripId]) =>
      (tripNames[tripId] || "").toLowerCase().includes(searchText.toLowerCase())
    )
    .sort(([aId, aAlbums], [bId, bAlbums]) => {
      const latest = (albums) =>
        Math.max(...Object.values(albums).flat().map((img) => new Date(img.createdAt).getTime()));
      return sortOrder === "newest" ? latest(bAlbums) - latest(aAlbums) : latest(aAlbums) - latest(bAlbums);
    });

  return (
    <div style={{ maxWidth: 1300, margin: "auto", padding: 40 }}>
      <h2
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "2.3rem",
          background: "linear-gradient(to right, #007bff, #6610f2)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 25,
        }}
      >
        📸Trip Collection
      </h2>

      {/* Search Bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 25 }}>
        <input
          type="text"
          placeholder="🔍 Search by trip name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: 16 }}
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: 16 }}
        >
          <option value="newest">📅 Latest</option>
          <option value="oldest">📅 Oldest</option>
        </select>
      </div>

      {filteredTrips.length === 0 && (
        <p style={{ textAlign: "center", color: "#888", fontSize: 18 }}>📭 No albums found.</p>
      )}

      {filteredTrips.map(([tripId, albums]) => {
        const tripName = tripNames[tripId] || `Trip ${tripId}`;
        const isOpen = expandedTrips[tripId];

        return (
          <div key={tripId} style={{ marginBottom: 35 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                background: "#f8f9fa",
                padding: 14,
                borderRadius: 8,
                cursor: "pointer",
                boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                fontSize: 18,
              }}
              onClick={() => toggleTrip(tripId)}
            >
              <strong>
                📍 {tripName} <Badge bg="secondary">{Object.keys(albums).length} Albums</Badge>
              </strong>
              <span>{isOpen ? "▲" : "▼"}</span>
            </div>

            {isOpen && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 25, marginTop: 12 }}>
                {Object.entries(albums).map(([albumName, imgs]) => {
                  const coverImg = imgs[0] ? `http://localhost:8080${imgs[0].url}` : null;

                  return (
                    <div
                      key={albumName}
                      style={{
                        width: 250,
                        background: "#fff",
                        borderRadius: 12,
                        textAlign: "center",
                        boxShadow: "0 5px 12px rgba(0,0,0,0.15)",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ cursor: "pointer" }} onClick={() => setOpenAlbum({ tripId, albumName })}>
                        {coverImg ? (
                          <img
                            src={coverImg}
                            alt={albumName}
                            style={{ width: "100%", height: 160, objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              height: 160,
                              background: "#ddd",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontSize: 45,
                            }}
                          >
                            📁
                          </div>
                        )}
                        <div style={{ padding: 12 }}>
                          <strong style={{ fontSize: 16 }}>{albumName}</strong>
                          <p style={{ fontSize: 14, color: "#777" }}>{imgs.length} photos</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteAlbum(tripId, albumName)}
                        style={{
                          width: "90%",
                          marginBottom: 12,
                          background: "red",
                          color: "#fff",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        🗑 Delete Album
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Modal for album images */}
      {openAlbum && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "85%",
              maxHeight: "90%",
              background: "#fff",
              padding: 25,
              borderRadius: 12,
              overflowY: "auto",
            }}
          >
            <h3>📂 {openAlbum.albumName}</h3>

            <button
              onClick={() => handleDeleteAlbum(openAlbum.tripId, openAlbum.albumName)}
              style={{
                marginRight: 10,
                background: "red",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              🗑 Delete Album
            </button>

            <button
              onClick={handleDeleteSelectedImages}
              style={{
                marginRight: 10,
                background: "#dc3545",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              🗑 Delete selected photos
            </button>

            <button
              onClick={handleSelectAllImages}
              style={{
                marginRight: 10,
                background: "#007bff",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              ✅ Select All Photos
            </button>

            <button
              onClick={() => setOpenAlbum(null)}
              style={{
                float: "right",
                background: "#ccc",
                border: "none",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              ✖ Close
            </button>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 15 }}>
              {groupedAlbums?.[openAlbum.tripId]?.[openAlbum.albumName]?.map((img) => (
                <div
                  key={img.id}
                  style={{
                    width: 220,
                    background: "#fafafa",
                    borderRadius: 8,
                    padding: 12,
                    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedImages.includes(img.id)}
                    onChange={() => toggleSelectImage(img.id)}
                    style={{ marginBottom: 5 }}
                  />
                  <img
                    src={`http://localhost:8080${img.url}`}
                    alt={img.name}
                    style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 6 }}
                  />
                  <p style={{ fontSize: 14, margin: "6px 0" }}>📅 {getLocalDate(img.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlbumByTrip;
