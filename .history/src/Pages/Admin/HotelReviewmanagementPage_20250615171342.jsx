import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";

export default function HotelReviewManagementPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/hotel-reviews/statistics/compare", {
      params: {
        fromDate: "2025-01-01",
        toDate: "2025-06-30"
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }).then(res => {
      setData(res.data);
    }).catch(err => {
      console.error("Error fetching hotel review statistics:", err);
    });
  }, []);

  return (
    <div>
      <h4>So sánh đánh giá giữa các khách sạn</h4>
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
