import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BudgetPage.css';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BudgetPage() {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const navigate = useNavigate();
const [animateCards, setAnimateCards] = useState(false);

useEffect(() => {
  AOS.init({ duration: 1000, easing: 'ease-in-out', once: true });

  // Kích hoạt hiệu ứng "cuộn ra"
  setTimeout(() => {
    setAnimateCards(true);
  }, 100);
}, []);

  useEffect(() => {
    AOS.init({ duration: 1000, easing: 'ease-in-out', once: true });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get('http://localhost:8080/api/trips/my-trips', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTrips(res.data.data))
      .catch(() => setError('Failed to load trips.'));
  }, []);

  const indexOfLastTrip = currentPage * itemsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - itemsPerPage;
  const currentTrips = trips.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(trips.length / itemsPerPage);

  const budgetByMonth = () => {
    const monthlyTotals = {};
    trips.forEach((trip) => {
      if (!trip.startDate || !trip.totalAmount) return;
      const date = new Date(trip.startDate);
      if (isNaN(date)) return;
      const total = parseFloat(trip.totalAmount);
      if (isNaN(total)) return;
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + total;
    });

    const sortedMonths = Object.keys(monthlyTotals).sort();
    const totals = sortedMonths.map((m) => monthlyTotals[m]);
    return { sortedMonths, totals };
  };

  const { sortedMonths, totals } = budgetByMonth();

  const chartData = {
    labels: sortedMonths,
    datasets: [
      {
        label: 'Total Budget ($)',
        data: totals,
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderRadius: 12,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Monthly Budget Overview' },
    },
    animation: {
      duration: 1200,
      easing: 'easeOutBounce',
    },
  };

  return (
    <div className="container py-5">
      
      <div className="text-center mb-5" data-aos="fade-down">
        <h2 className="text-danger fw-bold display-4">📊 Budget Overview</h2>
        <p className="text-muted fs-5">Click a trip below to manage your budget</p>
      </div>

      {error && (
        <div className="alert alert-danger text-center" data-aos="fade-up">
          {error}
        </div>
      )}
<div className="row gx-5 gy-4 justify-content-center">
  {currentTrips.map((trip, idx) => {
    return (
      <div className="col-md-4 col-lg-3" key={trip.id} data-aos="zoom-in" data-aos-delay={idx * 100}>
        <div
          className={`card border-0 trip-card text-center h-100 ${animateCards ? 'card-animate' : ''}`}
          onClick={() => navigate(`/budget/${trip.id}`)}
        >
          <i className="bi bi-piggy-bank-fill trip-icon mb-3"></i>
          <h5 className="fw-bold mb-1">{trip.name}</h5>
          <p className="mb-1 text-muted">
            <strong>To:</strong> {trip.destination}
          </p>
          <p className="mb-0 text-success fw-semibold">
            $ {parseFloat(trip.totalAmount).toFixed(2)}
          </p>

{trip.status && (
  <span
    className={`badge rounded-pill fw-semibold mb-2 ${
      trip.status === 'Completed'
        ? 'bg-success'
        : trip.status === 'In Progress'
        ? 'bg-warning text-dark'
        : 'bg-secondary'
    }`}
  >
    {trip.status}
  </span>
)}


        </div>
      </div>
    );
  })}
</div>


      <div className="d-flex justify-content-center mt-5" data-aos="fade-up">
        <ul className="pagination pagination-rounded">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setCurrentPage((prev) => prev - 1)}>
              Previous
            </button>
          </li>
          {[...Array(totalPages)].map((_, index) => (
            <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                {index + 1}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setCurrentPage((prev) => prev + 1)}>
              Next
            </button>
          </li>
        </ul>
      </div>

      {sortedMonths.length > 0 && (
        <div className="mt-5" data-aos="fade-up">
          <div className="card shadow-lg p-4 chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetPage;
