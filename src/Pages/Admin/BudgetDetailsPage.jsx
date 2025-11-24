import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSearch, FaArrowLeft, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';


function BudgetDetailsPage() {
  const [budgets, setBudgets] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

// Group actual theo ngày
const actualPerDayMap = new Map();

budgets.forEach(b => {
  const date = dayjs(b.date).format('YYYY-MM-DD');
  if (!actualPerDayMap.has(date)) {
    actualPerDayMap.set(date, b.actual);
  } else {
    actualPerDayMap.set(date, actualPerDayMap.get(date) + b.actual);
  }
});

// Convert sang mảng để dùng cho biểu đồ
const chartData = Array.from(actualPerDayMap.entries()).map(([date, actual]) => ({
  date,
  actual,
}));



const [warnedBudgets, setWarnedBudgets] = useState([]);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchBudgets(); }, []);

const fetchBudgets = async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/trips/admin/budgets', config);
    // Lấy danh sách budgetId đã gửi cảnh báo từ localStorage
    const warnedIds = JSON.parse(localStorage.getItem('warnedBudgets')) || [];
    const enriched = res.data.map(item => ({
      ...item,
      warnSent: warnedIds.includes(item.budgetId)
    }));
    setBudgets(enriched);
    setWarnedBudgets(enriched.filter(b => b.warnSent));
  } catch {
    toast.error("Failed to fetch budgets");
  }
};

  
const sendWarning = async (item) => {
  if (!window.confirm(`Send budget warning for trip "${item.tripName}"?`)) return;
  try {
    await axios.post(`http://localhost:8080/api/trips/${item.tripId}/budgets/warn-overbudget`, null, config);
    toast.success(`✅ Warning sent to ${item.userEmail}`);

    // Cập nhật warnSent trong budgets
    setBudgets(prev =>
      prev.map(b => b.budgetId === item.budgetId ? { ...b, warnSent: true } : b)
    );

    // Cập nhật danh sách warnedBudgets
    setWarnedBudgets(prev => {
      if (prev.some(b => b.budgetId === item.budgetId)) return prev;
      const newList = [...prev, { ...item, warnSent: true }];
      // Lưu vào localStorage
      localStorage.setItem('warnedBudgets', JSON.stringify(newList.map(b => b.budgetId)));
      return newList;
    });
  } catch {
    toast.error("❌ Failed to send warning");
  }
};
const filteredBudgets = budgets.filter(b =>
  (b.type || '').toLowerCase().includes(keyword.toLowerCase()) ||
  (b.note || '').toLowerCase().includes(keyword.toLowerCase()) ||
  (b.tripName || '').toLowerCase().includes(keyword.toLowerCase())
);


  const totalPages = Math.ceil(filteredBudgets.length / itemsPerPage);
  const currentItems = filteredBudgets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="container py-4">
      <style>{`
        .bg-deep-red { background-color: #c82333 !important; color: white; }
        .title-shadow { text-shadow: 2px 2px 5px rgba(0,0,0,0.2); font-size: 2.2rem; }
        .animated-table { animation: fadeIn 0.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <h2 className="text-center mb-4 text-danger fw-bold title-shadow">Budget Management</h2>

     <div className="position-relative mb-4 mx-auto" style={{ maxWidth: 500 }}>
  <input
    type="text"
    className="form-control form-control-lg ps-5 pe-5 rounded-pill shadow-sm"
    placeholder="Search by type, trip name, or note..."
    value={keyword}
    onChange={(e) => setKeyword(e.target.value)}
  />
  <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
  {keyword && (
    <button
      className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-3"
      style={{ border: "none", background: "transparent" }}
      onClick={() => setKeyword("")}
      title="Clear search"
    >
      ❌
    </button>
  )}
</div>


      <div className="table-responsive animated-table">
        <table className="table table-bordered table-hover align-middle text-center fs-6 shadow">
          <thead className="text-uppercase bg-deep-red">
            <tr>
              <th>Trip Name</th>
              <th>User Email</th>
              <th>Type</th>
              <th>Estimated</th>
              <th>Actual</th>
              <th>Note</th>
          <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(item => (
                <tr key={item.budgetId}>
                  <td>{item.tripName || "N/A"}</td>
                  <td>{item.userEmail || "N/A"}</td>
                  <td>{item.type}</td>
                  <td>{item.estimated}$</td>
                  <td className={
                    item.actual > item.estimated
                      ? item.warnSent
                        ? "text-success fw-bold"
                        : "text-danger fw-bold"
                      : ""
                  }>
                    {item.actual}$
                  </td>
                  <td>{item.note}</td>
                 
                  <td>
                  <button
  className="btn btn-sm btn-warning"
  title="Send Budget Warning"
  onClick={() => sendWarning(item)}
>
  <FaExclamationTriangle />
</button>

                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="8" className="text-muted">No records found</td></tr>
            )}
          </tbody>
        </table>
      </div>
        {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <FaArrowLeft /> Prev
          </button>
          <span>Page {currentPage} / {totalPages}</span>
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next <FaArrowRight />
          </button>
        </div>
      )}
      
{warnedBudgets.length > 0 && (
  <div className="mt-5 row">
    {/* Bên trái - Bảng warnedBudgets */}
        <div className="col-md-6">
      <h4 className="text-danger mb-3 text-center">Budgets Already Warned</h4>

      <div
        className="table-responsive"
        style={{
          maxHeight: 'calc(10 * 2.5rem)', // Khoảng 5 dòng, bạn có thể chỉnh lại
          overflowY: 'auto'
        }}
      >
        <table className="table table-bordered table-sm align-middle text-center fs-7 shadow-sm">
          <thead className="text-uppercase bg-deep-red">
            <tr>
              <th>Trip Name</th>
              <th>User Email</th>
              <th>Type</th>
              <th>Estimated</th>
              <th>Actual</th>
              <th>Note</th>
              <th>Warn Sent</th>
            </tr>
          </thead>
          <tbody>
            {warnedBudgets.map(b => (
              <tr key={b.budgetId}>
                <td>{b.tripName || 'N/A'}</td>
                <td>{b.userEmail || 'N/A'}</td>
                <td>{b.type}</td>
                <td>{b.estimated}$</td>
                <td>{b.actual}$</td>
                <td>{b.note || '-'}</td>
                <td>Warning sent</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

<div className="col-md-6">
  <h4 className="text-danger mb-3 text-center">Total Actual Budget per Day</h4>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart
      data={chartData}
      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
    >
      <XAxis dataKey="date" />
      <YAxis allowDecimals={false} />
      <Tooltip formatter={(value) => [`$${value}`, 'Actual']} />
      <Bar dataKey="actual" fill="#c82333" />
    </BarChart>
  </ResponsiveContainer>
</div>




  </div>
)}

    
    </div>
    
  );
}

export default BudgetDetailsPage;
