import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv";
import { FaCheckCircle, FaTimesCircle, FaSearch,FaFilePdf } from "react-icons/fa";
import "./RequestCancelPage.css";

function RequestCancelPage({ token }) {
  const [cancelRequests, setCancelRequests] = useState([]);
  const [refundedPayments, setRefundedPayments] = useState([]);
  const [loadingIds, setLoadingIds] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cancelRes, paymentRes] = await Promise.all([
          axios.get("http://localhost:8080/api/cancel-requests", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/api/room-payments/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setCancelRequests(cancelRes.data);
        const refunded = paymentRes.data.filter(
          (p) => p.status.toLowerCase() === "refunded"
        );
        setRefundedPayments(refunded);
      } catch {
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const confirmToast = (message, onConfirm) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p>{message}</p>
          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <button
              onClick={() => {
                onConfirm();
                closeToast();
              }}
              className="btn-confirm yes"
            >
              ✅ Yes
            </button>
            <button onClick={closeToast} className="btn-confirm no">
              ❌ No
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

  const handleApprove = (id) => {
    confirmToast("Approve this request?", async () => {
      setLoadingIds((prev) => [...prev, id]);
      try {
        const res = await axios.post(
          `http://localhost:8080/api/cancel-requests/${id}/approve`,
          null,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const refundAmount = res.data?.refundAmount;
        const roomName = res.data?.roomName;
        toast.success(
          `✅ Approved. ${
            refundAmount ? `Refund $${refundAmount} for ${roomName}.` : ""
          }`
        );
        setCancelRequests((prev) => prev.filter((req) => req.id !== id));
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to approve";
        toast.error(`❌ ${msg}`);
      } finally {
        setLoadingIds((prev) => prev.filter((i) => i !== id));
      }
    });
  };

  const handleReject = (id) => {
    confirmToast("Reject this request?", async () => {
      setLoadingIds((prev) => [...prev, id]);
      try {
        await axios.post(
          `http://localhost:8080/api/cancel-requests/${id}/reject`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.info("Request rejected");
        setCancelRequests((prev) =>
          prev.map((req) => (req.id === id ? { ...req, status: "REJECTED" } : req))
        );
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to reject";
        toast.error(`❌ ${msg}`);
      } finally {
        setLoadingIds((prev) => prev.filter((i) => i !== id));
      }
    });
  };

const filteredRequests = cancelRequests.filter((req) => {
  const statusMatch =
    statusFilter === "ALL" ||
    req.status.toUpperCase() === statusFilter.toUpperCase();
  const searchMatch =
    req.tripName.toLowerCase().includes(search.toLowerCase()) ||
    req.roomName.toLowerCase().includes(search.toLowerCase()) ||
    req.status.toLowerCase().includes(search.toLowerCase());
  return statusMatch && searchMatch;
});


  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === "string")
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  const paginatedRequests = sortedRequests.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const toggleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="cancel-page-container">
      <h2 className="page-title">Cancel Requests</h2>
      <div className="tools-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by trip, room, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <CSVLink data={cancelRequests} filename="cancel_requests.csv" className="export-btn">
          Export CSV
        </CSVLink>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <table className="modern-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort("id")}>
                ID {sortField === "id" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
              </th>
              <th>TripRoom</th>
              <th>Reason</th>
              <th onClick={() => toggleSort("status")}>
                Status {sortField === "status" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>
                  {req.tripName} <br />
                  <small>{req.roomName}</small>
                </td>
                <td>
                  {req.reasons?.length > 0 && (
                    <ul className="cancel-reasons">
                      {req.reasons.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  )}
                  {req.otherReason && <div className="cancel-other">Other: {req.otherReason}</div>}
                </td>
                <td>
                  <span className={`status-badge ${req.status.toLowerCase()}`}>
                    {req.status}
                  </span>
                </td>
                <td>
                  {req.status === "PENDING" ? (
                    <div className="action-buttons">
                      <button
                        className="btn approve"
                        onClick={() => handleApprove(req.id)}
                        disabled={loadingIds.includes(req.id)}
                      >
                        <FaCheckCircle /> {loadingIds.includes(req.id) ? "..." : "Approve"}
                      </button>
                      <button
                        className="btn reject"
                        onClick={() => handleReject(req.id)}
                        disabled={loadingIds.includes(req.id)}
                      >
                        <FaTimesCircle /> {loadingIds.includes(req.id) ? "..." : "Reject"}
                      </button>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredRequests.length / pageSize) }, (_, i) => (
          <button
            key={i + 1}
            className={`page-btn ${page === i + 1 ? "active" : ""}`}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Refunded Payments */}
         <h2 className="page-title mt-5">Refunded Payments</h2>
      <div className="tools-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by PayPal Capture/Refund ID..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CSVLink data={refundedPayments} filename="refunded_payments.csv" className="export-btn">Export CSV</CSVLink>
        <button className="export-btn"><FaFilePdf /> Export PDF</button>
      </div>
      <table className="modern-table">
        <thead>
          <tr>
            <th>Payment ID</th>
            <th>TripRoom</th>
            <th>Room</th>
            <th>Price</th>
            <th>Currency</th>
            <th>PayPal Capture ID</th>
            <th>PayPal Refund ID</th>
          </tr>
        </thead>
        <tbody>
          {refundedPayments.map((p) => (
            <tr key={p.paymentId} className={!p.paypalRefundId ? "highlight-refund" : ""}>
              <td>{p.paymentId}</td>
              <td>{p.guestName}</td>
              <td>{p.roomName}</td>
              <td>{p.price}</td>
              <td>{p.currency}</td>
              <td>{p.paypalCaptureId}</td>
              <td>{p.paypalRefundId || "Pending"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RequestCancelPage;
