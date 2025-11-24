import React from 'react';
import './TripDetailsIncline.css'; 

const TripDetailsIncline = ({ trip }) => {
  if (!trip) return <p>No Trip Information.</p>;

  return (
    <div className="trip-card">
  <h3 className="trip-title">📍 Destination: {trip.destination || "Không rõ"}</h3>
  <div className="trip-info">
    <p>📛 Trip Name: {trip.name || "Không rõ"}</p>
    <p>📅 Departure: {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "?"}
       To {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : "?"}</p>
    <p>💰 Budget: {trip.totalAmount ?? 0} USD</p>
    <p>👤 Owner : {trip.ownerName}</p>
  </div>
</div>

  );
};

export default TripDetailsIncline;
