import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaLock,
  FaLockOpen,
  FaSearch,
  FaFileExport,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function AdminUserPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const [showReasonModal, setShowReasonModal] = useState(false);
  const [lockReason, setLockReason] = useState("");
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loadingLock, setLoadingLock] = useState(false);

  const lockReasonsList = [
    "Violation of terms of service",
    "Spam or inappropriate content",
    "Fraud or scam",
    "Request from authorities",
    "Other",
  ];

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const lowerKeyword = keyword.toLowerCase();
    const filtered = allUsers.filter(
      (u) =>
        (u.email?.toLowerCase().includes(lowerKeyword) ||
          u.name?.toLowerCase().includes(lowerKeyword)) &&
        (roleFilter === "ALL" || u.role === roleFilter)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [keyword, allUsers, roleFilter]);

  const fetchAllUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/api/user/admin/all-users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Failed to fetch users");
    }
  };

  const performToggleLock = async (id, reason) => {
    const token = localStorage.getItem("token");
    setLoadingLock(true);
    try {
      const payload = reason ? { reason } : {};
      await axios.patch(
        `http://localhost:8080/api/user/admin/users/${id}/lock`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("User lock status updated!");
      fetchAllUsers();
    } catch (err) {
      toast.error("Failed to toggle lock");
      console.error("Toggle lock error:", err.response?.data || err.message);
    } finally {
      setLoadingLock(false);
      setShowReasonModal(false);
      setLockReason("");
      setSelectedReasons([]);
      setSelectedUserId(null);
    }
  };

  const submitLockReason = () => {
    const combinedReason = [...selectedReasons, lockReason.trim()]
      .filter((r) => r)
      .join("; ");
    if (!combinedReason) {
      toast.warning("Please select or enter a reason.");
      return;
    }
    performToggleLock(selectedUserId, combinedReason);
  };

  const handleChangeRole = async (userId, newRole) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `http://localhost:8080/api/user/admin/users/${userId}/role`,
        {
          role: newRole,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Role updated!");
      fetchAllUsers();
    } catch (err) {
      toast.error("Role change failed");
      console.error("Role change failed", err);
    }
  };

  const handleExport = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:8080/api/user/admin/export?role=${roleFilter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `users_${roleFilter.toLowerCase()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export successful!");
    } catch (err) {
      console.error("Export failed", err);
      toast.error("Export failed!");
    }
  };

  const handleReasonChange = (reason) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const roleStats = [
    { name: "USER", value: allUsers.filter((u) => u.role === "USER").length },
    { name: "PARTNER", value: allUsers.filter((u) => u.role === "PARTNER").length },
    { name: "ADMIN", value: allUsers.filter((u) => u.role === "ADMIN").length },
  ];

  const lockStats = [
    { name: "Active", value: allUsers.filter((u) => !u.locked).length },
    { name: "Locked", value: allUsers.filter((u) => u.locked).length },
  ];

  const COLORS = ["#28a745", "#ffc107", "#dc3545"];

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4 text-danger fw-bold title-shadow">User Management</h1>

      {showReasonModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reason for Locking</h5>
               
              </div>
              <div className="modal-body">
                {lockReasonsList.map((reason, index) => (
                  <div key={index} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`reason-${index}`}
                      checked={selectedReasons.includes(reason)}
                      onChange={() => handleReasonChange(reason)}
                    />
                    <label htmlFor={`reason-${index}`} className="form-check-label">
                      {reason}
                    </label>
                  </div>
                ))}
                <textarea
                  className="form-control mt-3"
                  placeholder="Enter additional details (if any)..."
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowReasonModal(false)}
                  disabled={loadingLock}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={submitLockReason}
                  disabled={loadingLock}
                >
                  {loadingLock ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    "Confirm Lock"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter buttons */}
      <div className="d-flex justify-content-center flex-wrap gap-2 mb-3">
        <button
          className={`btn ${roleFilter === "ALL" ? "btn-dark" : "btn-outline-dark"}`}
          onClick={() => setRoleFilter("ALL")}
        >
          All
        </button>
        <button
          className={`btn ${roleFilter === "ADMIN" ? "btn-danger" : "btn-outline-danger"}`}
          onClick={() => setRoleFilter("ADMIN")}
        >
          Admins
        </button>
        <button
          className={`btn ${roleFilter === "PARTNER" ? "btn-warning" : "btn-outline-warning"}`}
          onClick={() => setRoleFilter("PARTNER")}
        >
          Partners
        </button>
        <button
          className={`btn ${roleFilter === "USER" ? "btn-success" : "btn-outline-success"}`}
          onClick={() => setRoleFilter("USER")}
        >
          Users
        </button>
        <button className="btn btn-outline-primary" onClick={handleExport}>
          <FaFileExport className="me-2" />
          Export {roleFilter}
        </button>
      </div>

      {/* Search bar */}
      <div className="position-relative mb-4 mx-auto" style={{ maxWidth: 500 }}>
        <input
          type="text"
          className="form-control form-control-lg ps-5 pe-5 rounded-pill shadow-sm"
          placeholder="Search name or email..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
        {keyword && (
          <button
            className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-3"
            style={{ border: "none", background: "transparent" }}
            onClick={() => setKeyword("")}
          >
            ❌
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle text-center">
          <thead className="text-uppercase bg-deep-red text-white">
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Gender</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((u) => (
                <tr key={u.userId}>
                  <td>{u.email}</td>
                  <td>{u.name}</td>
                  <td>{u.phone}</td>
                  <td>{u.address}</td>
                  <td>{u.gender}</td>
                  <td>
                    <select
                      className={`form-select form-select-sm text-center fw-bold ${
                        u.role === "ADMIN"
                          ? "text-danger"
                          : u.role === "PARTNER"
                          ? "text-warning"
                          : "text-success"
                      }`}
                      value={u.role}
                      onChange={(e) => handleChangeRole(u.userId, e.target.value)}
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="PARTNER">PARTNER</option>
                      <option value="USER">USER</option>
                    </select>
                  </td>
                  <td>
                    {u.locked ? (
                      <FaLock className="text-danger fs-4" title="Locked" />
                    ) : (
                      <FaLockOpen className="text-success fs-4" title="Active" />
                    )}
                  </td>
                  <td>
                    {u.role !== "ADMIN" ? (
                      <button
                        onClick={() => {
                          if (!u.locked) {
                            setSelectedUserId(u.userId);
                            setShowReasonModal(true);
                          } else {
                            performToggleLock(u.userId);
                          }
                        }}
                        className="btn btn-sm btn-outline-warning"
                        title={u.locked ? "Unlock account" : "Lock account"}
                        disabled={loadingLock && selectedUserId === u.userId}
                      >
                        {loadingLock && selectedUserId === u.userId ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                        ) : u.locked ? (
                          <FaLockOpen />
                        ) : (
                          <FaLock />
                        )}
                      </button>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-muted">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center gap-3 mt-3">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            <FaArrowLeft /> Prev
          </button>
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next <FaArrowRight />
          </button>
        </div>
      )}

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-md-6">
          <h5 className="text-center">User Roles</h5>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={roleStats}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {roleStats.map((entry, index) => (
                  <Cell
                    key={`cell-role-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="col-md-6">
          <h5 className="text-center">Account Status</h5>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={lockStats}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {lockStats.map((entry, index) => (
                  <Cell
                    key={`cell-lock-${index}`}
                    fill={["#28a745", "#dc3545"][index % 2]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default AdminUserPage;
