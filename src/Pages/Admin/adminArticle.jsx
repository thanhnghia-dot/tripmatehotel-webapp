import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Badge, Spinner } from "react-bootstrap";

// 🔹 Modal Custom
function DeleteModal({ show, onClose, onSubmit, reason, setReason, loading }) {
  if (!show) return null;

  const predefinedReasons = [
    "Content violates policy",
    "Inappropriate language",
    "Spam / advertising posts",
    "Misinformation",
    "Other",
  ];

  const handleReasonChange = (value) => {
    if (value !== "Other") {
      setReason(value);
    } else {
      setReason("");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 10,
          width: 420,
          maxWidth: "90%",
          boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h5>🗑Delete post</h5>

        {/* Lý do chọn sẵn */}
        <div style={{ marginTop: 10 }}>
          {predefinedReasons.map((r, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <label style={{ cursor: "pointer" }}>
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r || (r === "Khác" && !predefinedReasons.includes(reason))}
                  onChange={() => handleReasonChange(r)}
                  style={{ marginRight: 8 }}
                />
                {r}
              </label>
            </div>
          ))}
        </div>

        {/* Ô nhập khi chọn "Khác" */}
        {reason === "" || !predefinedReasons.includes(reason) ? (
          <textarea
            rows={3}
            placeholder="Enter other reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              borderColor: !reason.trim() ? "#dc3545" : "#ccc",
              borderRadius: 5,
              marginTop: 10,
            }}
          ></textarea>
        ) : null}

        {!reason.trim() && (
          <p style={{ color: "red", fontSize: 14 }}>⚠ You must enter a reason for deletion.</p>
        )}

        {/* Nút hành động */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: "6px 12px",
              background: "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: 5,
            }}
          >
            Close
          </button>
          <button
            onClick={onSubmit}
            disabled={!reason.trim() || loading}
            style={{
              padding: "6px 12px",
              background: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              opacity: !reason.trim() || loading ? 0.6 : 1,
              cursor: !reason.trim() || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "⏳Processing..." : "🗑 Confirm deletion"}
          </button>
        </div>
      </div>
    </div>
  );
}

const api = axios.create({ baseURL: "http://localhost:8080" });

const STATUS_LABELS = {
  PENDING: "🕒 Pending Approval",
  APPROVED: "✅ Approved Articles",
};

export default function AdminArticle() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("PENDING");
  const [imagePopup, setImagePopup] = useState(null);

  // 🔹 State cho modal custom
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [reason, setReason] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 🔹 State quản lý xem thêm/thu gọn
  const [expandedArticles, setExpandedArticles] = useState({});

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/articles?status=${status}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setArticles(res.data);
    } catch (err) {
      console.error(err);
      toast.error("❌ Error loading article");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [status]);

  const approveArticle = async (id) => {
    try {
      const res = await api.put(`/api/admin/articles/${id}/approve`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success(res.data.message || "✅Article has been approved");
      if (res.data.email) toast.info(res.data.email);
      if (res.data.emailError) toast.warning(res.data.emailError);

      fetchArticles();
    } catch (err) {
      toast.error(err.response?.data?.error || "❌Error in approval");
    }
  };

  const submitDelete = async () => {
    if (!reason.trim()) return toast.warning("⚠ Please enter reason for deletion");

    setDeleteLoading(true);
    try {
      const res = await api.put(
        `/api/admin/articles/${deleteId}/delete`,
        { reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      toast.success(res.data.message || "🗑Post deleted");
      if (res.data.email) toast.info("📩 Email sent to" + res.data.email);
      if (res.data.emailError) toast.warning("⚠ " + res.data.emailError);

      setShowDeleteModal(false);
      setReason("");
      fetchArticles();
    } catch (err) {
      toast.error(err.response?.data?.error || "❌Error deleting post");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-center fw-bold mb-4 text-primary">📚 Blog Manager</h1>

      {/* Nút chọn trạng thái */}
      <div className="d-flex justify-content-center gap-3 mb-4">
        {Object.keys(STATUS_LABELS).map((s) => (
          <Button
            key={s}
            variant={status === s ? "danger" : "outline-primary"}
            onClick={() => setStatus(s)}
          >
            {STATUS_LABELS[s]}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : articles.length === 0 ? (
        <p className="text-center text-muted">📭 No posts</p>
      ) : (
        <div className="row g-4">
          {articles.map((a) => (
            <div key={a.id} className="col-md-4">
              <div className="card shadow-sm h-100">
                {/* 🔹 Hiển thị nhiều ảnh */}
                {a.image && (() => {
                  let urls = [];
                  try {
                    urls = JSON.parse(a.image);
                  } catch {
                    urls = [a.image];
                  }

                  return (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        overflowX: "auto",
                        padding: "4px 0",
                        scrollBehavior: "smooth",
                      }}
                    >
                      {urls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`${a.title}-img${i}`}
                          style={{
                            flex: "0 0 auto", // giữ kích thước cố định
                            height: 180,
                            width: 180,
                            objectFit: "cover",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                          onClick={() => setImagePopup(url)}
                        />
                      ))}
                    </div>
                  );
                })()}


                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{a.title}</h5>

                  {/* 🔹 Thu gọn/mở rộng mô tả */}
                  <p className="text-muted flex-grow-1">
                    {expandedArticles[a.id] || a.description.length <= 120
                      ? a.description
                      : a.description.slice(0, 120) + "... "}
                    {a.description.length > 120 && (
                      <span
                        onClick={() =>
                          setExpandedArticles((prev) => ({
                            ...prev,
                            [a.id]: !prev[a.id],
                          }))
                        }
                        style={{ color: "#0d6efd", cursor: "pointer", fontWeight: 500 }}
                      >
                        {expandedArticles[a.id] ? "Collapse" : "See more"}
                      </span>
                    )}
                  </p>

                  <small className="text-secondary mb-2">
                    📅 {new Date(a.createdAt).toLocaleString()}
                  </small>

                  {status === "PENDING" ? (
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="success" onClick={() => approveArticle(a.id)}>
                        ✅ Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setDeleteId(a.id);
                          setShowDeleteModal(true);
                        }}
                      >
                        🗑 Delete
                      </Button>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-between align-items-center">
                      <Badge bg="success">Approved</Badge>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setDeleteId(a.id);
                          setShowDeleteModal(true);
                        }}
                      >
                        🗑 Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔹 Modal Custom */}
      <DeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSubmit={submitDelete}
        reason={reason}
        setReason={setReason}
        loading={deleteLoading}
      />

      {/* Popup Ảnh */}
      {imagePopup && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75"
          style={{ zIndex: 9999, cursor: "zoom-out" }}
          onClick={() => setImagePopup(null)}
        >
          <img
            src={imagePopup}
            alt="Preview"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: 12,
              boxShadow: "0 6px 30px rgba(0,0,0,0.4)",
            }}
          />
        </div>
      )}
    </div>
  );
}
