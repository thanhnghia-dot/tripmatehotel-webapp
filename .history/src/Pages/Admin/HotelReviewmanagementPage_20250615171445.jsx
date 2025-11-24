import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";

export default function HotelReviewManagementPage() {
const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2025-06-30");

  const fetchData = () => {
    axios.get("http://localhost:8080/api/hotel-reviews/statistics/compare", {
      params: {
        fromDate,
        toDate
      }
    }).then(res => {
      setData(res.data);
    }).catch(err => {
      console.error("Error fetching hotel review statistics:", err);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div>
      <h4>So sánh đánh giá giữa các khách sạn</h4>

      {/* Bộ lọc thời gian */}
      <form onSubmit={handleFilter} className="d-flex gap-2 mb-4">
        <div>
          <label>From: </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="form-control"
          />
        </div>
        <div>
          <label>To: </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-primary align-self-end">Lọc</button>
      </form>

      {/* Biểu đồ */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hotelName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="averageRating" fill="#8884d8" name="Đánh giá trung bình" />
          <Bar dataKey="reviewCount" fill="#82ca9d" name="Số lượt đánh giá" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
