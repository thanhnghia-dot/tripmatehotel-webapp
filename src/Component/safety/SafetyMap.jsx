// src/Component/safety/SafetyMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default icon display
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons
const userIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png", // icon người
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const hospitalIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png", // icon bệnh viện
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const policeIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2991/2991106.png", // icon cảnh sát
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Fetch hospitals and police stations around a location
async function fetchNearbySafetyPlaces({ lat, lon }, radius = 10000) {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      node["amenity"="police"](around:${radius},${lat},${lon});
    );
    out body;
  `;
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ data: query }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch safety locations.");
  }

  const data = await response.json();
  return data.elements || [];
}

export default function SafetyMap({ location }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!location || !location.lat || !location.lon) return;

    setLoading(true);
    fetchNearbySafetyPlaces(location)
      .then(setPlaces)
      .catch((err) => {
        console.error("Error loading safety places:", err);
        setPlaces([]);
      })
      .finally(() => setLoading(false));
  }, [location]);

  if (!location || !location.lat || !location.lon) {
    return <div className="text-muted mt-2">📍 Detecting your location…</div>;
  }

  return (
    <div style={{ width: "100%" }}>
      <div style={{ height: 400, width: "100%" }}>
        <MapContainer
          center={[location.lat, location.lon]}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Marker for user location */}
          <Marker position={[location.lat, location.lon]} icon={userIcon}>
            <Popup>
              <strong>📍 You are here</strong>
              <br />
              Latitude: {location.lat.toFixed(5)}
              <br />
              Longitude: {location.lon.toFixed(5)}
            </Popup>
          </Marker>

          {/* Markers for nearby hospitals and police stations */}
          {places.map((place) => {
            let icon = undefined;
            if (place.tags?.amenity === "hospital") icon = hospitalIcon;
            if (place.tags?.amenity === "police") icon = policeIcon;

            return (
              <Marker
                key={place.id}
                position={[place.lat, place.lon]}
                icon={icon}
              >
                <Popup>
                  <b>
                    {place.tags?.name ||
                      (place.tags?.amenity === "hospital"
                        ? "Hospital"
                        : "Police Station")}
                  </b>
                  <br />
                  Type: {place.tags?.amenity}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Loading and empty state messages */}
      {loading && (
        <div className="text-muted mt-2">
          🔍 Searching for nearby hospitals and police stations…
        </div>
      )}
      {!loading && places.length === 0 && (
        <div className="text-muted mt-2">
          ⚠ No safety locations found within 10km.
        </div>
      )}
    </div>
  );
}
