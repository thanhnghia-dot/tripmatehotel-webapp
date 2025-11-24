import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

export default function HotelReviewManagementPage() {
  const [hotels, setHotels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:8080/api/hotels', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setHotels(res.data))
      .catch(err => console.error('Error fetching hotels:', err));
  }, []);

  return (
    <div className="container mt-4">
      <h2>Danh sách khách sạn</h2>
      <table className="table table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Hình ảnh</th>
            <th>Tên khách sạn</th>
            <th>Địa chỉ</th>
            <th>Xếp hạng sao</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {hotels.map(hotel => (
            <tr key={hotel.id}>
              <td><img src={hotel.imageUrl} alt={hotel.name} style={{ width: 100 }} /></td>
              <td>{hotel.name}</td>
              <td>{hotel.address}</td>
              <td>{hotel.starRating} ⭐</td>
              <td>
                <button className="btn btn-primary" onClick={() => navigate(`/hotels/${hotel.id}/stats`)}>
                  Xem thống kê
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
