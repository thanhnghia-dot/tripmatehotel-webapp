import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Trip() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my'); // "my" | "invited"
  const [myTrips, setMyTrips] = useState([]);
  const [invitedTrips, setInvitedTrips] = useState([]);

  const fetchTrips = () => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:8080/api/trips', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setMyTrips(res.data.data))
      .catch(err => console.error(err));

    axios.get('http://localhost:8080/api/trips/invited', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setInvitedTrips(res.data.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const renderTripRow = (trip, isInvited = false) => (
    <tr key={trip.id}>
      <td className="border p-3">{trip.id}</td>
      <td
        className="border p-3 text-blue-600 cursor-pointer hover:underline"
        onClick={() => navigate(`/trips/${trip.id}`)}
      >
        {trip.name}
      </td>
      <td className="border p-3">{trip.startDate}</td>
      <td className="border p-3">{trip.endDate}</td>
      <td className="border p-3">{trip.destination}</td>
      <td className="border p-3">{trip.type === 'du_lich' ? 'Leisure' : 'Business'}</td>
      <td className="border p-3">{trip.totalAmount || 0}</td>
      <td className="border p-3" style={{ display: 'flex', gap: 16 }}>
        {isInvited ? (
          <button
            type="button"
            className="btn btn-success"
            onClick={() => {
              const token = localStorage.getItem('token');
              axios.put(`http://localhost:8080/api/trips/${trip.id}/accept`, undefined ,{
                headers: { Authorization: `Bearer ${token}` }
              }).then(() => fetchTrips());
            }}
          >
            Accept
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/checklist/${trip.id}`)}
            >
              Invite member
            </button>
            <button
              type="button"
              className="btn btn-warning"
              onClick={() => navigate(`/checklist/${trip.id}`)}
            >
              View Checklist
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/trips/${trip.id}`)}
            >
              View details
            </button>
          </>
        )}
      </td>
    </tr>
  );

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <div style={{ display: 'flex', marginBottom: 16, gap: 12 }}>
          <button
onClick={() => setActiveTab('my')}
            className={activeTab === 'my' ? 'bg-blue-600 text-white px-4 py-2 rounded' : 'bg-gray-200 px-4 py-2 rounded'}
          >
            My Trips
          </button>
          <button
            onClick={() => setActiveTab('invited')}
            className={activeTab === 'invited' ? 'bg-blue-600 text-white px-4 py-2 rounded' : 'bg-gray-200 px-4 py-2 rounded'}
          >
            Invited Trips
          </button>
        </div>

        <h3 className="text-2xl font-bold mb-6">
          {activeTab === 'my' ? 'Your Trips' : 'Trips You Are Invited To'}
        </h3>

        <div className="overflow-x-auto rounded-xl shadow">
          <table className="min-w-full text-sm text-left border border-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="border p-3">ID</th>
                <th className="border p-3">Trip Name</th>
                <th className="border p-3">Start Date</th>
                <th className="border p-3">End Date</th>
                <th className="border p-3">Destination</th>
                <th className="border p-3">Type</th>
                <th className="border p-3">Total Amount</th>
                <th className="border p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {(activeTab === 'my' ? myTrips : invitedTrips).map(trip =>
                renderTripRow(trip, activeTab === 'invited')
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}