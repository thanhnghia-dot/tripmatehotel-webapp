import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { FaChartLine, FaSyncAlt, FaCalendarAlt, FaListUl } from 'react-icons/fa';

function HotelStats() {
  const { hotelId } = useParams();
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [fromDate, setFromDate] = useState('2025-01-01');
  const [toDate, setToDate] = useState('2025-06-30');

  useEffect(() => {
    fetchStats();
  }, [period, fromDate, toDate]);

  const fetchStats = () => {
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:8080/api/hotel-reviews/${hotelId}/statistics`, {
      params: { period, fromDate, toDate },
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setData(res.data.data))
      .catch(err => console.error('Error fetching statistics:', err));
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="card-title mb-4">
            <FaChartLine className="me-2" />
            Thống kê đánh giá khách sạn #{hotelId}
          </h3>

          <div className="row g-3 align-items-end mb-3">
            <div className="col-md-3">
              <label className="form-label">Thống kê theo:</label>
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="form-select"
              >
                <option value="weekly">Tuần</option>
                <option value="monthly">Tháng</option>
                <option value="yearly">Năm</option>
                <option value="custom">Tùy chọn</option>
              </select>
            </div>

            {(period === 'custom' || period === 'monthly' || period === 'weekly' || period === 'yearly') && (
              <>
                <div className="col-md-3">
                  <label className="form-label">Từ ngày:</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Đến ngày:</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    className="form-control"
                  />
                </div>
              </>
            )}

            <div className="col-md-3">
              <button className="btn btn-primary w-100" onClick={fetchStats}>
  <FaSyncAlt className="me-2" /> Làm mới
</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {data.length === 0 ? (
            <p className="text-muted">Không có dữ liệu đánh giá trong khoảng thời gian đã chọn.</p>
          ) : (
            <>
              <h5 className="card-title mb-3">📈 Biểu đồ đánh giá</h5>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis domain={[0, 5]} allowDecimals />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="averageRating"
                    stroke="#007bff"
                    strokeWidth={2}
                    name="Đánh giá trung bình"
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HotelStats;