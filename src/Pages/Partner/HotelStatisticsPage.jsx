import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import './HotelStatisticsPage.css';

const HotelStatisticsPage = () => {
  const [hotels, setHotels] = useState([]); // dữ liệu gốc
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [tripRooms, setTripRooms] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [revenueByMonth, setRevenueByMonth] = useState([]);

  const [search, setSearch] = useState('');
  const [analyzeColumn, setAnalyzeColumn] = useState('revenue'); // cột phân tích

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const cfg = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        const res = await axios.get('http://localhost:8080/api/hotels/hotel-stats', cfg);
        setHotels(res.data.data);
        setFilteredHotels(res.data.data);
      } catch (err) {
        console.error('Failed to fetch hotel statistics', err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const cfg = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        const res = await axios.get('http://localhost:8080/api/trip-rooms/all', cfg);
        setTripRooms(res.data);
      } catch (err) {
        console.error('Failed to fetch bookings', err);
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    setFilteredHotels(
      hotels.filter(h => h.hotelName.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, hotels]);

  useEffect(() => {
    if (!tripRooms.length) {
      setRevenueByMonth([]);
      return;
    }

    const revenueMap = {};
    tripRooms.forEach(({ hotelName, checkIn, price }) => {
      if (!hotelName || !checkIn) return;

      const checkInDate = new Date(checkIn);
      const checkInMonth = checkInDate.getMonth() + 1;
      if (checkInMonth === month) {
        revenueMap[hotelName] = (revenueMap[hotelName] || 0) + (price || 0);
      }
    });

    const revenueArr = Object.entries(revenueMap).map(([hotelName, revenue]) => ({
      hotelName,
      revenue,
    }));

    setRevenueByMonth(revenueArr);
  }, [month, tripRooms]);

  // Xuất Excel doanh thu tháng
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(revenueByMonth);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue By Month');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Revenue_Month_${month}.xlsx`);
  };

  // Dữ liệu biểu đồ cho cột phân tích
  const getAnalyzeData = () => {
    switch (analyzeColumn) {
      case 'revenue':
        return filteredHotels.map(h => ({
          hotelName: h.hotelName,
          value: h.revenue,
        }));
      case 'bookings':
        return filteredHotels.map(h => ({
          hotelName: h.hotelName,
          value: h.bookings,
        }));
      case 'rating':
        return filteredHotels.map(h => ({
          hotelName: h.hotelName,
          value: h.avgRating,
        }));
      default:
        return [];
    }
  };



  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-green-700">📊 Hotel Revenue Statistics</h2>

      {/* Search & Export */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search hotel name..."
          className="filter-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn-green" onClick={() => {
          const worksheet = XLSX.utils.json_to_sheet(filteredHotels);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Hotel Stats');
          const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
          saveAs(blob, 'Hotel_Statistics.xlsx');
        }}>
          📁 Export Excel
        </button>
      </div>

     {/* Tổng bảng */}
<div className="hotel-table-container">
  <table className="hotel-table">
    <thead className="hotel-thead">
      <tr>
        <th className="hotel-th-left">Hotel</th>
        <th className="hotel-th-right">Revenue ($)</th>
        <th className="hotel-th-right">Bookings</th>
        <th className="hotel-th-right">Rating</th>
        <th className="hotel-th-center">Suggestion</th>
      </tr>
    </thead>
    <tbody className="hotel-tbody">
      {filteredHotels.length > 0 ? filteredHotels.map(hotel => (
        <tr key={hotel.hotelId} className="hotel-tr">
          <td data-label="Hotel" className="hotel-td-left">{hotel.hotelName}</td>
          <td data-label="Revenue ($)" className="hotel-td-right">{hotel.revenue.toLocaleString()}</td>
          <td data-label="Bookings" className="hotel-td-right">{hotel.bookings}</td>
         <td data-label="Rating" className="hotel-td-right">
  {hotel.avgRating ? hotel.avgRating.toFixed(1) : "N/A"}
</td>

          <td data-label="Suggestion" className="hotel-td-left">{hotel.suggestion}</td>
        </tr>
      )) : (
        <tr>
          <td colSpan={5} className="hotel-td-center">No data found</td>
        </tr>
      )}
    </tbody>
  </table>
</div>


      {/* Phân tích doanh thu tháng */}
      <h3 className="text-xl font-semibold mb-4 text-gray-700">📅 Revenue by Month (Choose month)</h3>

      <div className="mb-6">
        <label htmlFor="month-select" className="mr-3 font-semibold">Select Month:</label>
        <select
          id="month-select"
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="filter-input"
          style={{ width: '120px', display: 'inline-block' }}
        >
          {[...Array(12).keys()].map(m => (
            <option key={m + 1} value={m + 1}>{`Month ${m + 1}`}</option>
          ))}
        </select>

        <button
          onClick={handleExportExcel}
          className="btn-green ml-4"
          disabled={revenueByMonth.length === 0}
        >
          📥 Export Monthly Revenue Excel
        </button>
      </div>

      <div className="overflow-auto bg-white rounded-xl shadow-md mb-10">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Hotel</th>
              <th className="px-4 py-2 text-right">Revenue in Month ($)</th>
            </tr>
          </thead>
          <tbody>
            {revenueByMonth.length > 0 ? (
              revenueByMonth.map(({ hotelName, revenue }) => (
                <tr key={hotelName} className="border-t">
                  <td className="px-4 py-2 font-medium">{hotelName}</td>
                  <td className="px-4 py-2 text-right">{revenue.toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center py-4">No revenue data for selected month</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Biểu đồ doanh thu theo tháng */}
      <div className="mt-10 bg-white p-6 shadow rounded-xl">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">📈 Monthly Revenue Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hotelName" angle={-25} textAnchor="end" interval={0} />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* --- Phân tích cột tùy chọn --- */}
    {/* --- Top 10 khách sạn được đặt nhiều nhất --- */}
<h3 className="top10-title">🏨 Top 10 Hotels by Bookings (Month {month})</h3>

{tripRooms.length > 0 ? (
  (() => {
    const bookingMap = {};
    tripRooms.forEach(({ hotelName, checkIn }) => {
      if (!hotelName || !checkIn) return;
      const checkInDate = new Date(checkIn);
      const checkInMonth = checkInDate.getMonth() + 1;
      if (checkInMonth === month) {
        bookingMap[hotelName] = (bookingMap[hotelName] || 0) + 1;
      }
    });

    const topHotels = Object.entries(bookingMap)
      .map(([hotelName, bookings]) => ({ hotelName, bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10);

    return topHotels.length > 0 ? (
      <>
        {/* Bảng top 10 */}
        <div className="top10-table-container">
          <table className="top10-table">
            <thead className="top10-thead">
              <tr>
                <th className="top10-th-rank">Rank</th>
                <th className="top10-th-hotel">Hotel</th>
                <th className="top10-th-bookings">Bookings</th>
              </tr>
            </thead>
            <tbody className="top10-tbody">
              {topHotels.map((h, idx) => (
                <tr key={h.hotelName} className="top10-tr">
                  <td className="top10-td-rank">{idx + 1}</td>
                  <td className="top10-td-hotel">{h.hotelName}</td>
                  <td className="top10-td-bookings">{h.bookings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Biểu đồ top 10 */}
        <div className="top10-chart-container">
          <h4 className="top10-chart-title">📊 Top 10 Booked Hotels Chart</h4>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topHotels}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hotelName" angle={-25} textAnchor="end" interval={0} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#f59e0b" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </>
    ) : (
      <p className="top10-empty">No bookings found for this month</p>
    );
  })()
) : (
  <p className="top10-empty">No data available</p>
)}

    </div>
  );
};

export default HotelStatisticsPage;
