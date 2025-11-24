import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaCalendarAlt, FaUser, FaTrash } from "react-icons/fa";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/articles/${id}`)
      .then((res) => setArticle(res.data))
      .catch((err) => console.error("❌ Lỗi tải bài viết:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("🗑 Bạn có chắc muốn xóa bài viết này?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Xóa bài viết thành công!");
      navigate("/blog"); // Quay về danh sách blog
    } catch (err) {
      console.error("❌ Lỗi xóa bài viết:", err);
      alert("⚠ Không thể xóa bài viết!");
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 50 }}>⏳ Đang tải bài viết...</p>;
  }

  if (!article) {
    return <p style={{ textAlign: "center", marginTop: 50 }}>⚠ Không tìm thấy bài viết.</p>;
  }

  return (
    <div
      style={{
        maxWidth: "850px",
        margin: "40px auto",
        padding: "25px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Nút quay lại */}
      <Link to="/blog" style={{ textDecoration: "none", color: "#333" }}>
        <button
          style={{
            background: "#f0f0f0",
            border: "none",
            padding: "8px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <FaArrowLeft style={{ marginRight: 6 }} /> Quay lại
        </button>
      </Link>

      {/* Tiêu đề */}
      <h1 style={{ fontSize: "28px", marginBottom: "10px", color: "#222" }}>{article.title}</h1>

      {/* Thông tin tác giả + ngày */}
      <div style={{ display: "flex", gap: "20px", color: "#666", fontSize: "14px", marginBottom: "15px" }}>
        <span>
          <FaUser style={{ marginRight: 6 }} />
          {article.user?.name || "Ẩn danh"}
        </span>
        <span>
          <FaCalendarAlt style={{ marginRight: 6 }} />
          {new Date(article.createdAt).toLocaleString()}
        </span>
      </div>

      {/* Ảnh bài viết */}
      {/* Ảnh bài viết */}
{article.image && (
  <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "20px" }}>
    {(() => {
      let urls = [];
      try {
        urls = JSON.parse(article.image); // thử parse JSON
      } catch {
        urls = [article.image]; // không phải JSON => coi là single URL
      }
      return urls.map((url, i) => (
        <div key={i} style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
          <img
            src={url}
            alt={`${article.title} - img${i + 1}`}
            style={{
              width: "100%",
              maxHeight: "400px",
              objectFit: "cover",
              borderRadius: "10px",
              transition: "transform 0.3s",
              filter: "brightness(0.8)", // làm chữ overlay nổi
            }}
          />
          {/* Optional: chữ overlay lên ảnh */}
          {article.description && i === 0 && (
            <div
              style={{
                position: "absolute",
                bottom: 15,
                left: 20,
                color: "#fff",
                fontSize: "18px",
                fontWeight: "bold",
                textShadow: "2px 2px 6px rgba(0,0,0,0.7)",
                maxWidth: "90%",
              }}
            >
              {article.description.slice(0, 100)}...
            </div>
          )}
        </div>
      ));
    })()}
  </div>
)}


      {/* Nội dung */}
      <p style={{ fontSize: "16px", lineHeight: "1.7", color: "#444", whiteSpace: "pre-line" }}>
        {article.description}
      </p>

      {/* ✅ Nút Delete */}
      <button
        onClick={handleDelete}
        style={{
          marginTop: "20px",
          background: "#ff4d4d",
          color: "white",
          border: "none",
          padding: "10px 18px",
          borderRadius: "8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <FaTrash /> Delete
      </button>
    </div>
  );
}
