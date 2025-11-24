// src/Pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

function DashboardPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [tripStats, setTripStats] = useState([]);
  const [budgetStats, setBudgetStats] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    axios.get("http://localhost:8080/api/admin/total-users", config)
      .then(res => setTotalUsers(res.data))
      .catch(err => console.error("Failed to fetch total users", err));

    axios.get("http://localhost:8080/api/admin/trips-by-month", config)
      .then(res => {
        const data = Object.entries(res.data).map(([month, count]) => ({
          month, count
        }));
        setTripStats(data);
      })
      .catch(err => console.error("Failed to fetch trip stats", err));

    axios.get("http://localhost:8080/api/admin/total-budget-by-month", config)
      .then(res => {
        const data = Object.entries(res.data).map(([month, total]) => ({
          month, total: parseFloat(total.toFixed(2))
        }));
        setBudgetStats(data);
      })
      .catch(err => console.error("Failed to fetch budget stats", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 md:px-10">
      <h2 className="text-center text-4xl md:text-5xl font-extrabold text-red-600 mb-12 tracking-wide">
         Admin Dashboard
      </h2>

      {/* Thống kê tổng người dùng */}
      <div className="flex justify-center mb-12">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm text-center border-l-8 border-red-500">
          <h3 className="text-xl font-semibold text-gray-600">👥 Total Users</h3>
     <p className="text-5xl font-extrabold text-red-600 mt-4">{totalUsers}</p>


        </div>
      </div>

      {/* Biểu đồ thống kê */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
    

        <div className="bg-white shadow-xl rounded-2xl p-6 text-center">
          <h3 className="text-2xl font-semibold text-rose-700 mb-6"> Total Budget Spent Per Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={budgetStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#dc2626" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
            <div className="bg-white shadow-xl rounded-2xl p-6 text-center">
          <h3 className="text-2xl font-semibold text-indigo-700 mb-6"> Trips Created Per Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tripStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
