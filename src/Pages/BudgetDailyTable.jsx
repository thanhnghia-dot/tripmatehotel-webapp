import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BudgetDailyTable.css';

const BudgetDailyTable = ({ tripId, refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/trips/${tripId}/budgets/daily-summary`)
      .then((res) => {
        setData(res.data);
        setCurrentPage(1); // Reset về page 1 mỗi lần fetch
      })
      .catch((err) => console.error(err));
  }, [tripId, refreshTrigger]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedData = data.slice(startIdx, endIdx);

  return (
  <div className="table-container">
  <h2 className="heading">📅 Daily Budget Breakdown</h2>

  <table>
    <thead>
      <tr>
        <th>🗓️ Day</th>
        <th>💰 Estimated ($)</th>
        <th>✅ Actual ($)</th>
        <th>🍽️ Food</th>
        <th>🚗 Transport</th>
        <th>🏨 Hotel</th>
        <th>🗺️ Sightseeing</th>
        <th>🎭 Entertainment</th>
        <th>🛍️ Shopping</th>
        <th>📦 Other</th>
        <th>📝 Note</th>
        <th>📅 Created At</th>
      </tr>
    </thead>
    <tbody>
      {paginatedData.map((item, idx) => (
        <tr key={idx}>
          <td>{item.type}</td>
          <td style={{ color: 'red', fontWeight: 'bold' }}>${(item.estimated || 0).toFixed(2)}</td>
          <td style={{ color: 'green', fontWeight: 'bold' }}>${(item.actual || 0).toFixed(2)}</td>
          <td>${(item.food || 0).toFixed(2)}</td>
          <td>${(item.transport || 0).toFixed(2)}</td>
          <td>${(item.hotel || 0).toFixed(2)}</td>
          <td>${(item.sightseeing || 0).toFixed(2)}</td>
          <td>${(item.entertainment || 0).toFixed(2)}</td>
          <td>${(item.shopping || 0).toFixed(2)}</td>
          <td>${(item.other || 0).toFixed(2)}</td>
          <td>{item.note || '—'}</td>
          <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</td>
        </tr>
      ))}
    </tbody>
  </table>

  <h3 className="sub-heading">📝 Notes Per Category</h3>

  <table>
    <thead>
      <tr>
        <th>🗓️ Day</th>
        <th> Food Note</th>
        <th> Transport Note</th>
        <th> Hotel Note</th>
        <th> Sightseeing Note</th>
        <th> Entertainment Note</th>
        <th> Shopping Note</th>
        <th> Other Note</th>
      </tr>
    </thead>
    <tbody>
      {paginatedData.map((item, idx) => (
        <tr key={idx}>
          <td>{item.type}</td>
          <td>{item.foodNote || '—'}</td>
          <td>{item.transportNote || '—'}</td>
          <td>{item.hotelNote || '—'}</td>
          <td>{item.sightseeingNote || '—'}</td>
          <td>{item.entertainmentNote || '—'}</td>
          <td>{item.shoppingNote || '—'}</td>
          <td>{item.otherNote || '—'}</td>
        </tr>
      ))}
    </tbody>
  </table>

  {totalPages > 1 && (
    <div className="pagination">
      <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
        ⬅️ Prev
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
        Next ➡️
      </button>
    </div>
  )}
</div>

  );
};

export default BudgetDailyTable;
