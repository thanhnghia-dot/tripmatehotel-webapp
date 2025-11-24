import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import { FaHotel, FaBed, FaClipboardList, FaMoneyBillWave } from 'react-icons/fa';
import './dashboard.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';


function PartnerDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalHotels: null,
    totalRooms: null,
    totalRevenue: null,
    availableRooms: null,
    bookedRooms: null,
    totalBookings: null,
  });
const [tripRooms, setTripRooms] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 6;
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentTripRooms = tripRooms.slice(startIndex, endIndex);

const totalPages = Math.ceil(tripRooms.length / itemsPerPage);

  const COLORS = ['#22c55e', '#ef4444']; // Green, Red
  
  useEffect(() => {
    const cfg = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
     axios.get('http://localhost:8080/api/trip-rooms/all', cfg)
    .then(res => {
      if (Array.isArray(res.data)) {
        setTripRooms(res.data);
      } else {
        console.error('❌ Dữ liệu không hợp lệ!');
      }
    })
    .catch(err => {
      console.error('Không thể tải dữ liệu đặt phòng!', err);
    });
    axios.get('http://localhost:8080/api/partner/total-hotels', cfg)
      .then(res => setMetrics(m => ({ ...m, totalHotels: res.data })))
      .catch(console.error);

    axios.get('http://localhost:8080/api/partner/total-rooms', cfg)
      .then(res => setMetrics(m => ({ ...m, totalRooms: res.data })))
      .catch(console.error);

    axios.get('http://localhost:8080/api/trip-rooms/total-booking-revenue', cfg)
      .then(res => setMetrics(m => ({ ...m, totalRevenue: res.data })))
      .catch(console.error);

    axios.get('http://localhost:8080/api/trip-rooms/total-bookings', cfg)
      .then(res => setMetrics(m => ({ ...m, totalBookings: res.data })))
      .catch(console.error);

    axios.get('http://localhost:8080/api/rooms/status-summary', cfg)
      .then(res => {
        const { available, booked } = res.data;
        setMetrics(m => ({ ...m, availableRooms: available, bookedRooms: booked }));
      })
      .catch(console.error);
  }, []);
const monthlyRevenueData = tripRooms.reduce((acc, tr) => {
  if (!tr.checkIn || !tr.price) return acc;

  const checkInMonth = new Date(tr.checkIn).toISOString().slice(0, 7); // YYYY-MM
  const partnerRevenue = tr.price - (tr.commissionAmount ?? 0);

  const existing = acc.find(item => item.month === checkInMonth);
  if (existing) {
    existing.revenue += partnerRevenue;
  } else {
    acc.push({ month: checkInMonth, revenue: partnerRevenue });
  }

  return acc;
}, []).sort((a, b) => a.month.localeCompare(b.month)); // Sort theo tháng tăng dần

  const formatUSD = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value ?? 0);
  };
 const handleExportExcel = () => {
  // Chuẩn hóa dữ liệu cho xuất Excel
  const exportData = tripRooms.map(tr => ({
    Guest: tr.name,
    Email: tr.email,
    Hotel: tr.hotelName || 'N/A',
    Room: tr.roomName || 'N/A',
    "Check-in": tr.checkIn ? new Date(tr.checkIn).toLocaleDateString() : 'N/A',
    "Check-out": tr.checkOut ? new Date(tr.checkOut).toLocaleDateString() : 'N/A',
    "Total Price": tr.price ? tr.price.toFixed(2) : '0.00',
    "Commission %": tr.commissionPercent != null ? tr.commissionPercent + '%' : '10%',
    "Commission Amount": tr.commissionAmount != null ? tr.commissionAmount.toFixed(2) : '0.00',
    "Partner Revenue": tr.price && tr.commissionAmount
  ? (tr.price - tr.commissionAmount).toFixed(2)
  : '0.00',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Admin Commission');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, 'Admin_Commission_Report.xlsx');
};

  const pieData = [
    { name: 'Available', value: metrics.availableRooms ?? 0 },
    { name: 'Booked', value: metrics.bookedRooms ?? 0 },
  ];

  const { totalHotels, totalRooms, totalRevenue, availableRooms, bookedRooms, totalBookings } = metrics;

  const iconMap = [FaHotel, FaBed, FaClipboardList, FaMoneyBillWave, FaMoneyBillWave];

  const cardItems = [
    { title: 'Total Hotels', value: totalHotels },
    { title: 'Total Rooms', value: totalRooms },
    { title: 'Total Bookings', value: totalBookings },
    { title: 'Total Revenue', value: totalRevenue != null ? formatUSD(totalRevenue) : null },
     { 
    title: 'Partner Commission (40%)', 
    value: totalRevenue != null ? formatUSD(totalRevenue * 0.4) : null 
  },
  ];
const hotelRevenueData = Object.values(
  tripRooms.reduce((acc, tr) => {
    if (!tr.hotelName || !tr.price) return acc;
    if (!acc[tr.hotelName]) acc[tr.hotelName] = { name: tr.hotelName, value: 0 };
    acc[tr.hotelName].value += tr.price - (tr.commissionAmount ?? 0);
    return acc;
  }, {})
);
// 👉 Gom dữ liệu Hotel Commission Report
// 👉 Gom dữ liệu Hotel Commission Report (đúng với yêu cầu)
const hotelCommissionData = Object.values(
  tripRooms.reduce((acc, tr) => {
    if (!tr.hotelName || !tr.price) return acc;

    const partnerRevenue = tr.price - (tr.commissionAmount ?? 0); // revenue sau khi trừ commission
    const hotelShare = partnerRevenue * 0.4; // 👈 mỗi booking trả 40% cho hotel

    if (!acc[tr.hotelName]) {
      acc[tr.hotelName] = { 
        hotel: tr.hotelName, 
        bookings: 0, 
        totalPartnerRevenue: 0, 
        totalHotelRevenue: 0
      };
    }
    acc[tr.hotelName].bookings += 1;
    acc[tr.hotelName].totalPartnerRevenue += partnerRevenue;
    acc[tr.hotelName].totalHotelRevenue += hotelShare; // cộng 40% từ từng booking
    return acc;
  }, {})
);


  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
      <h2 className="text-center text-4xl font-bold text-green-600 mb-10">🏨 Partner Dashboard</h2>

 {/* 📊 Metrics & Chart Side by Side */}
<div className="dashboard-overview-container">
  {/* 🟩 Metrics Cards (Left) */}
  <div className="metrics-section">
    {cardItems.map((item, index) => {
      const Icon = iconMap[index];
      return (
        <div
          key={index}
          className="stat-card hover:shadow-lg transition-all duration-300 border-t-4 border-green-500"
        >
          <div className="flex justify-center mb-3">
            <Icon size={36} className="text-green-500" />
          </div>
          <h4>{item.title}</h4>
          <p>{item.value ?? '...'}</p>
        </div>
      );
    })}
  </div>

  {/* 🟦 Pie Chart (Right) */}
<div className="chart-section bg-white shadow rounded-xl p-6 mt-8">
  <h3 className="text-2xl font-semibold text-gray-800 mb-4">🏨 Revenue Contribution per Hotel</h3>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie data={hotelRevenueData} dataKey="value" nameKey="name" outerRadius={100} label>
        {hotelRevenueData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
      <Legend verticalAlign="bottom" height={36} />
    </PieChart>
  </ResponsiveContainer>
</div>
</div>
   <div className="commission-table-container">
  <h3 className="commission-table-title">💼 Admin Commission Report</h3>

  {tripRooms.length === 0 ? (
    <p className="commission-empty">Không có dữ liệu đặt phòng.</p>
  ) : (
    <>
      {/* 📦 Table Scroll Area */}
      <div className="commission-table-wrapper">
        <table className="commission-table">
          <thead className="commission-table-header">
            <tr>
              <th>#</th>
              <th>Guest</th>             
              <th>Hotel</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Total Price</th>
              <th>Commission %</th>
              <th>💰 Commission</th>
              <th>💼 Partner Revenue</th>
            </tr>
          </thead>
          <tbody>
            {currentTripRooms.filter(tr => tr.status === 'paid').map((tr, index) => (
              <tr key={tr.id} className="commission-table-row">
                <td>{startIndex + index + 1}</td>
                <td>{tr.name}</td>
                <td>{tr.hotelName || 'N/A'}</td>
                <td>{tr.roomName || 'N/A'}</td>
                <td>{new Date(tr.checkIn).toLocaleDateString()}</td>
                <td>{new Date(tr.checkOut).toLocaleDateString()}</td>
                <td>
                  {tr.price
                    ? `$${tr.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : 'N/A'}
                </td>
                <td>{tr.commissionPercent ?? 10}%</td>
                <td className="commission-amount">
                  {tr.commissionAmount
                    ? `$${tr.commissionAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}`
                    : '$0.00'}
                </td>
      <td className="partner-revenue">
  {tr.price && tr.commissionAmount
    ? `$${(tr.price - tr.commissionAmount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
      })}`
    : '$0.00'}
</td>
              </tr>

            ))}
            
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination BELOW table */}
      <div className="commission-pagination">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          ◀ Previous
        </button>

        <span className="mx-4 text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Next ▶
        </button>
        <button className="btn btn-green" onClick={handleExportExcel}>
          📁 Export Excel
        </button>
      </div>
    </>
  )}
</div>
<div className="hotel-report-container">
  <h3 className="hotel-report-title">🏨 Hotel Commission Report</h3>

  {tripRooms.length === 0 ? (
    <p className="hotel-report-empty">Không có dữ liệu đặt phòng.</p>
  ) : (
    <>
      <div className="hotel-report-table-wrapper">
        <table className="hotel-report-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Guest</th>
              <th>Hotel</th>
              <th>Room</th>
              <th>Total Price</th>
              <th>💼 Partner Revenue (Commission)</th>
              <th>🏨 Hotel Revenue (60%)</th>
              <th>💰 Final Revenue</th>
            </tr>
          </thead>
          <tbody>
            {currentTripRooms.filter(tr => tr.status === 'paid').map((tr, index) => {
              const partnerRevenue = tr.price && tr.commissionAmount
                ? tr.price - tr.commissionAmount
                : 0;
              const hotelRevenue = partnerRevenue * 0.6;
              const partnerKeep = partnerRevenue * 0.4;

              return (
                <tr key={tr.id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{tr.name}</td>
                  <td>{tr.hotelName || 'N/A'}</td>
                  <td>{tr.roomName || 'N/A'}</td>
                  <td>
                    {tr.price
                      ? `$${tr.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      : 'N/A'}
                  </td>
                  <td>${partnerRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="hotel-revenue">
                    ${hotelRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="final-revenue">
                    ${partnerKeep.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination */}
      <div className="hotel-report-pagination">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          ◀ Previous
        </button>

        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Next ▶
        </button>
      </div>
    </>
  )}
</div>




<div className="bg-white shadow-lg rounded-2xl p-6 max-w-4xl mx-auto mb-12">
  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
    💼 Partner Commission  by Month
  </h3>

  <ResponsiveContainer width="100%" height={320}>
    <BarChart
      data={monthlyRevenueData.map(item => ({
        ...item,
        commission: item.revenue * 0.4, // 👉 lấy 40% commission
      }))}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="month" tick={{ fill: "#374151" }} />
      <YAxis
        tickFormatter={(v) => `$${v.toLocaleString()}`}
        tick={{ fill: "#374151" }}
      />
      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
      <Bar
        dataKey="commission"
        fill="#3b82f6" // xanh dương (cho dễ phân biệt)
        radius={[6, 6, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
</div>



    </div>
  );
}
export default PartnerDashboardPage;
