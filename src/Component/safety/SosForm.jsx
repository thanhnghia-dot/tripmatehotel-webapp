// src/Component/safety/SosForm.jsx
import React, { useState, useEffect } from "react";

const apiUrl = "http://localhost:8080";

export default function SosForm({ location }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Lấy userId từ backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${apiUrl}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUserId(data.userId))
      .catch((err) => console.error("❌ Failed to fetch user info:", err));
  }, []);

  // ✅ Chuẩn hoá ngày từ backend
  const parseDate = (d) => {
    if (!d) return null;
    return new Date(d.toString().replace(" ", "T"));
  };

  // ✅ Lấy danh sách trips
  const loadTrips = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${apiUrl}/api/trips/my-trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load trips");

      const json = await res.json();
      // backend trả về { status, message, data: [...] }
      const list = Array.isArray(json) ? json : json.data || [];
      setTrips(list);
      return list;
    } catch (err) {
      console.error("❌ loadTrips error:", err);
      return [];
    }
  };

  // ✅ Chọn trip active
  const chooseTrip = async () => {
    const list = await loadTrips();
    const today = new Date();

    const active = list.filter(
      (t) =>
        !t.isFinished &&
        parseDate(t.startDate) <= today &&
        today <= parseDate(t.endDate)
    );

    if (active.length === 1) {
      setSelectedTrip(active[0]);
      return active[0];
    } else if (active.length > 1) {
      setShowModal(true);
      return null;
    }

    // fallback: upcoming trips
    const upcoming = list.filter((t) => parseDate(t.startDate) > today);
    if (upcoming.length > 0) {
      setShowModal(true);
    } else {
      alert("⚠️ You have no active or upcoming trips.");
    }
    return null;
  };

  // ✅ Gửi SOS
  const sendSOS = async (trip) => {
    if (!location) {
      alert("⚠️ Location not available!");
      return;
    }
    if (!userId) {
      alert("⚠️ User not logged in!");
      return;
    }
    if (!trip) {
      alert("⚠️ No trip selected!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/api/safety/sos/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
tripId: trip.id || trip.tripId,
          userId,
          latitude: location.lat,
          longitude: location.lon,
          message,
        }),
      });

      if (!res.ok) throw new Error("Failed to send SOS");

      alert(`🚨 SOS sent successfully for trip "${trip.name}"!`);
      setMessage("");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send SOS");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sos-form safety-card">
      <h3>🚨 Emergency SOS</h3>

      <textarea
        className="sos-textarea"
        placeholder="Enter your emergency message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={async () => {
          if (selectedTrip) {
            sendSOS(selectedTrip);
          } else {
            await chooseTrip();
          }
        }}
        disabled={loading}
        className="sos-btn"
      >
        {loading ? "Sending..." : "🚨 Send SOS"}
      </button>

      {/* ✅ Modal chọn trip */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h4 className="text-lg font-bold mb-4">Select Trip</h4>
            <ul className="space-y-3">
              {trips.map((t) => (
                <li key={t.id || t.tripId}>
                  <button
                    onClick={() => {
                      setSelectedTrip(t);
                      sendSOS(t);
                    }}
                    className="w-full text-left px-4 py-2 border rounded-md hover:bg-gray-100"
                  >
                    {t.name} ({new Date(t.startDate).toLocaleDateString()} →{" "}
                    {new Date(t.endDate).toLocaleDateString()})
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}