// src/Pages/safety/SafetyPage.jsx
import React, { useEffect, useState } from "react";
import EmergencyDirectory from "../../Component/safety/EmergencyDirectory";
import SafetyMap from "../../Component/safety/SafetyMap";
import RealtimeSosListener from "../../Component/safety/RealtimeSosListener";
import SafetyAlertModal from "../../Component/safety/SafetyAlertModal";
import WeatherAlert from "../../Component/safety/WeatherAlert";
import SosForm from "../../Component/safety/SosForm";
import "./safety.css";

export default function SafetyPage() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [country, setCountry] = useState("VN");
  const fallback = { lat: 21.0285, lon: 105.8542 }; // Hà Nội default

  // ✅ Lấy location realtime
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("⚠ Browser không hỗ trợ geolocation.");
      setLocation(fallback);
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => {
        setError("⚠ Không thể lấy vị trí, dùng mặc định Hà Nội.");
        setLocation(fallback);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  // ✅ Detect quốc gia theo IP
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.country) setCountry(data.country);
      })
      .catch(() => setCountry("VN"));
  }, []);

  return (
    <div className="main-content">
      <div className="safety-container">
        <h2 className="safety-title">Safety Center</h2>

        {/* Emergency contacts */}
        <div className="safety-card">
          <h3>🚓 Emergency Contacts ({country})</h3>
          <div className="emergency-list">
            <div className="emergency-item">Police - 113</div>
            <div className="emergency-item">Fire - 114</div>
            <div className="emergency-item">Medical - 115</div>
          </div>
        </div>

        {/* Weather */}
        <div className="safety-card">
          <h3>🌦 Weather Alert</h3>
          <WeatherAlert location={location ?? fallback} />
        </div>

        {/* Map */}
        <div className="safety-card">
          <h3>📍 Nearby Safety Locations</h3>
          <div className="safety-map">
            {!location ? (
              <div className="loading-spinner"></div>
            ) : (
              <SafetyMap location={location} />
            )}
          </div>
          {error && <p className="error-text">{error}</p>}
        </div>

        {/* SOS */}
        <div className="safety-card sos-form">
          <SosForm location={location ?? fallback} />
        </div>

        {/* Realtime Listener */}
        <RealtimeSosListener />
        <SafetyAlertModal />
      </div>
    </div>
  );
}
