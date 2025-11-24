import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

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
    <div className="container mt-4">
      <h2>Thống kê đánh giá khách sạn #{hotelId}</h2>
      <div className="form-inline mb-3">
        <label className="mr-2">Thống kê theo:</label>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="form-control mr-3">
          <option value="weekly">Tuần</option>
          <option value="monthly">Tháng</option>
          <option value="yearly">Năm</option>
        </select>
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="form-control mr-2" />
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="form-control mr-2" />
        <button className="btn btn-info" onClick={fetchStats}>Làm mới</button>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Line type="monotone" dataKey="averageRating" stroke="#8884d8" name="Đánh giá trung bình" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default HotelStats;