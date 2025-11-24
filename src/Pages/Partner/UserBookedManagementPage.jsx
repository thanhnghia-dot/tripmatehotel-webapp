import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserBookedManagementPage.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
const UserBookedManagement = () => {
  const [tripRooms, setTripRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [error, setError] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hotelFilter, setHotelFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sendingId, setSendingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const itemsPerPage = 8;
  const [notifications, setNotifications] = useState([]);
  const [jumpPage, setJumpPage] = useState("");

  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // Fetch trip rooms data
  useEffect(() => {
    const fetchTripRooms = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/api/trip-rooms/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(res.data)) setTripRooms(res.data);
        else setError("Invalid data received!");
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError("Unable to load reservation list");
      }
    };
    fetchTripRooms();
  }, []);

  // Filter and search
  useEffect(() => {
    let filtered = tripRooms;

    // Search
    if (searchKeyword.trim() !== "") {
      const lowerSearch = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (tr) =>
          tr.name?.toLowerCase().includes(lowerSearch) ||
          tr.email?.toLowerCase().includes(lowerSearch)
      );
    }

    // Status
    if (statusFilter) filtered = filtered.filter((tr) => tr.status === statusFilter);

    // Hotel filter
    if (hotelFilter.trim() !== "") {
      filtered = filtered.filter((tr) =>
        tr.hotelName?.toLowerCase().includes(hotelFilter.toLowerCase())
      );
    }

    // Date range
    if (dateFrom) {
      filtered = filtered.filter((tr) => new Date(tr.checkIn) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter((tr) => new Date(tr.checkOut) <= new Date(dateTo));
    }

    // Price range
    if (priceMin) {
      filtered = filtered.filter((tr) => tr.price >= parseFloat(priceMin));
    }
    if (priceMax) {
      filtered = filtered.filter((tr) => tr.price <= parseFloat(priceMax));
    }

    setFilteredRooms(filtered);
  }, [searchKeyword, statusFilter, hotelFilter, dateFrom, dateTo, priceMin, priceMax, tripRooms]);

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const currentData = filteredRooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle cancel booking
  const handleCancelBooking = async (tripRoomId) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("❌ You are not logged in.");

    try {
      await axios.post(
        `http://localhost:8080/api/trip-rooms/${tripRoomId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTripRooms((prev) =>
        prev.map((tr) => (tr.id === tripRoomId ? { ...tr, status: "cancelled" } : tr))
      );
      toast.info("❌ Booking has been cancelled and email sent to guest.");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data || "❌ Failed to cancel booking.";
      toast.error(msg);
    }
  };

  // Handle send reminder
  const handleSendReminder = async (tripRoomId) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("❌ You are not logged in.");

    const tripRoom = tripRooms.find((tr) => tr.id === tripRoomId);
    if (!tripRoom?.email) return toast.error("❌ No email found for this booking.");

    try {
      setSendingId(tripRoomId);
      await axios.post(
        `http://localhost:8080/api/trip-rooms/${tripRoomId}/send-payment-reminder`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTripRooms((prev) =>
        prev.map((tr) =>
          tr.id === tripRoomId
            ? { ...tr, status: "REMINDER_SENT", reminderSentAt: new Date().toISOString() }
            : tr
        )
      );
      toast.success("✅ Payment reminder email sent!");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data || "❌ Failed to send reminder email.";
      toast.error(msg);
    } finally {
      setSendingId(null);
    }
  };

  // Countdown Button
  const CountdownButton = ({ reminderSentAt, tripRoomId }) => {
    const [timeLeft, setTimeLeft] = useState(
      Math.max(0, 30 * 60 * 1000 - (Date.now() - new Date(reminderSentAt).getTime()))
    );

    useEffect(() => {
      const interval = setInterval(() => {
        const remaining = Math.max(
          0,
          30 * 60 * 1000 - (Date.now() - new Date(reminderSentAt).getTime())
        );
        setTimeLeft(remaining);
      }, 1000);
      return () => clearInterval(interval);
    }, [reminderSentAt]);

    const formatTime = (ms) => {
      const totalSeconds = Math.ceil(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    if (timeLeft <= 0) {
      return (
        <button className="hegt61-button cancelled" onClick={() => handleCancelBooking(tripRoomId)}>
          ❌ Cancel
        </button>
      );
    }

    return <button className="hegt61-button" disabled>⏳ {formatTime(timeLeft)}</button>;
  };

  // Export CSV
  const handleExportCSV = () => {
    const csv = [
      ["No.", "Guest Name", "Email", "Hotel", "Room", "Check-in", "Check-out", "Price", "Status"],
      ...filteredRooms.map((tr, i) => [
        i + 1,
        tr.name,
        tr.email,
        tr.hotelName || "N/A",
        tr.roomName || "N/A",
        new Date(tr.checkIn).toLocaleString(),
        new Date(tr.checkOut).toLocaleString(),
        tr.price ? tr.price.toFixed(2) : "N/A",
        tr.status ? tr.status.toUpperCase() : "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "trip_rooms.csv");
    link.click();
  };

  // Export Excel
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredRooms);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, "trip_rooms.xlsx");
  };

  // Export PDF
const handleExportPDF = () => {
  const doc = new jsPDF();
  doc.text("Reservation List", 14, 10);

  const tableColumn = [
    "No.",
    "Guest Name",
    "Email",
    "Hotel",
    "Room",
    "Check-in",
    "Check-out",
    "Price",
    "Status",
  ];
  const tableRows = filteredRooms.map((tr, i) => [
    i + 1,
    tr.name,
    tr.email,
    tr.hotelName || "N/A",
    tr.roomName || "N/A",
    new Date(tr.checkIn).toLocaleDateString(),
    new Date(tr.checkOut).toLocaleDateString(),
    tr.price ? `$${tr.price}` : "N/A",
    tr.status || "N/A",
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    theme: "grid",
    styles: { fontSize: 8 },
    headStyles: { fillColor: [52, 73, 94] }, // Xám đậm cho header
  });

  doc.save("trip_rooms.pdf");
};


  const handleJumpToPage = () => {
    const page = parseInt(jumpPage, 10);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    } else {
      toast.error("Invalid page number");
    }
  };
const isUpcomingCheckIn = (checkIn) => {
  if (!checkIn) return false;
  const today = new Date();
  const checkInDate = new Date(checkIn);
  const diffDays = (checkInDate - today) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 7; // 7 ngày tới
};

const isOverdueBooking = (checkIn, status) => {
  if (!checkIn) return false;
  const today = new Date();
  const checkInDate = new Date(checkIn);
  return checkInDate < today && status?.toLowerCase() !== "paid"; // đã quá ngày mà chưa thanh toán
};

  return (
    <div className="hegt61-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="hegt61-title">Customer Reservation List</h1>

      {error && <p className="hegt61-error">⚠️ {error}</p>}

      {/* Filters */}
      <div className="hegt61-controls">
        <input type="text" placeholder="🔍 Search by guest name or email..." className="hegt61-search-input"
          value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
        <input type="text" placeholder="Hotel name..." className="hegt61-search-input"
          value={hotelFilter} onChange={(e) => setHotelFilter(e.target.value)} />
        <input type="date" className="hegt61-search-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" className="hegt61-search-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <input type="number" placeholder="Min Price" className="hegt61-search-input"
          value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
        <input type="number" placeholder="Max Price" className="hegt61-search-input"
          value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
        <select className="hegt61-search-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="REMINDER_SENT">Reminder Sent</option>
        </select>
      </div>

      {/* Export buttons */}
      <div className="hegt61-controls" style={{ marginTop: "10px" }}>
        <button onClick={handleExportCSV} className="hegt61-export-btn">📥 Export CSV</button>
        <button onClick={handleExportExcel} className="hegt61-export-btn">📗 Export Excel</button>
        <button onClick={handleExportPDF} className="hegt61-export-btn">📄 Export PDF</button>
      </div>

      {/* Table */}
      <div className="hegt61-table-wrapper">
        <table className="hegt61-table">
          <thead className="hegt61-table-header">
            <tr>
              <th>No.</th>
              <th>Guest Name</th>
              <th>Email</th>
              <th>Hotel Name</th>
              <th>Room Name</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((tr, index) => (
                <tr 
  key={tr.id} 
  className={`hegt61-row ${
    isUpcomingCheckIn(tr.checkIn) ? "upcoming" : ""
  } ${isOverdueBooking(tr.checkIn, tr.status) ? "overdue" : ""}`}
>

                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td onClick={() => setSelectedBooking(tr)} style={{ cursor: "pointer", color: "blue" }}>
                    {tr.name}
                  </td>
                  <td>{tr.email}</td>
                  <td>{tr.hotelName || "N/A"}</td>
                  <td>{tr.roomName || "N/A"}</td>
                  <td>{new Date(tr.checkIn).toLocaleString()}</td>
                  <td>{new Date(tr.checkOut).toLocaleString()}</td>
                  <td>{tr.price ? `$${tr.price.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD` : "N/A"}</td>
                  <td>{tr.status ? tr.status.toUpperCase() : "Unpaid"}</td>
               <td>
  {tr.status?.toLowerCase() === "paid" ? (
    <button className="trbtn trbtn-success" disabled>
      ✅ Sent Info
    </button>
  ) : tr.status?.toLowerCase() === "cancelled" ? (
    <button className="trbtn trbtn-danger" disabled>
      ❌ Cancelled
    </button>
  ) : tr.status === "REMINDER_SENT" && tr.reminderSentAt ? (
    <CountdownButton
      reminderSentAt={tr.reminderSentAt}
      tripRoomId={tr.id}
    />
  ) : (
<button
  onClick={() => handleSendReminder(tr.id)}
  className={`trbtn ${sendingId === tr.id ? "trbtn-disabled" : "trbtn-primary"}`}
  disabled={sendingId === tr.id}
>
  {sendingId === tr.id ? (
    <>
      ⏳ Sending...
    </>
  ) : (
    <>
      📩 Reminder
    </>
  )}
</button>



  )}
</td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="hegt61-cell hegt61-empty">
                  No reservation data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
        <button className="hegt61-button" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>‹ Prev</button>
        {[...Array(totalPages).keys()].map((n) => (
          <button key={n} className={`hegt61-button ${currentPage === n + 1 ? "sent" : ""}`} onClick={() => setCurrentPage(n + 1)}>
            {n + 1}
          </button>
        ))}
        <button className="hegt61-button" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>Next ›</button>
        <input type="number" placeholder="Page" value={jumpPage} onChange={(e) => setJumpPage(e.target.value)} style={{ width: "60px" }} />
        <button onClick={handleJumpToPage} className="hegt61-button">Go</button>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Booking Details</h2>
            <p><strong>Guest:</strong> {selectedBooking.name}</p>
            <p><strong>Email:</strong> {selectedBooking.email}</p>
            <p><strong>Hotel:</strong> {selectedBooking.hotelName}</p>
            <p><strong>Room:</strong> {selectedBooking.roomName}</p>
            <p><strong>Check-in:</strong> {new Date(selectedBooking.checkIn).toLocaleString()}</p>
            <p><strong>Check-out:</strong> {new Date(selectedBooking.checkOut).toLocaleString()}</p>
            <p><strong>Price:</strong> ${selectedBooking.price}</p>
            <p><strong>Status:</strong> {selectedBooking.status}</p>
            <button onClick={() => setSelectedBooking(null)} className="hegt61-button">Close</button>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="hegt61-notification-wrapper">
        {notifications.map((n) => (
          <div key={n.id} className={`hegt61-notification hegt61-notification-${n.type}`}>
            {n.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserBookedManagement;
