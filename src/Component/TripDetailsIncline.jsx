import React from 'react';
import './TripDetailsIncline.css';

const TripDetailsIncline = ({ trip, memberCount }) => {
  if (!trip) return <p className="no-trip">No Trip Information Available.</p>;

  return (
    <div className="trip-card">
      <h3 className="trip-title">
        📍 Destination: <span>{trip.destination || "Unknown"}</span>
      </h3>
      <div className="trip-info">
        <p>📛 Trip Name: <strong>{trip.name || "Unnamed Trip"}</strong></p>
        <p>
          📅 Departure: <strong>{trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "?"}</strong>
          {" "}to{" "}
          <strong>{trip.endDate ? new Date(trip.endDate).toLocaleDateString() : "?"}</strong>
        </p>
        <p>
          💰 Budget: <strong>
            ${new Intl.NumberFormat(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            }).format(trip.totalAmount ?? 0)}
          </strong>
        </p>
        <p>👤 Trip Owner: <strong>{trip.ownerName || "N/A"}</strong></p>
        <p>👥 Members: <strong>{memberCount}</strong></p>
      </div>
    </div>
  );
};

export default TripDetailsIncline;