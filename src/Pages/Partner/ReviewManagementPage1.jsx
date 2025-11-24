import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Sentiment from "sentiment";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import "react-toastify/dist/ReactToastify.css";
import "./ReviewManagementPage1.css";

const sentiment = new Sentiment();
const COLORS = ["#4CAF50", "#FFC107", "#F44336"]; // Positive, Neutral, Negative

const ReviewManagementPage1 = () => {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [hotelId, setHotelId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [pageNo, setPageNo] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchCriteria, setSearchCriteria] = useState({ createdBy: "", comment: "" });
  const [filters, setFilters] = useState({ rating: "", sentiment: "", replied: "" });
  const [sortOption, setSortOption] = useState("");
  const [error, setError] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyContent, setReplyContent] =  useState("");
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const [chartData, setChartData] = useState([]);
const ITEMS_PER_PAGE = 5;
const [currentPage, setCurrentPage] = useState(0);

const filteredReviews = reviews
  .filter(r => {
    if (filters.rating && r.rating !== Number(filters.rating)) return false;
    if (filters.sentiment) {
      const s = analyzeSentiment(r.comment, r.rating);
      if (filters.sentiment === "Positive" && s <= 0) return false;
      if (filters.sentiment === "Neutral" && s !== 0) return false;
      if (filters.sentiment === "Negative" && s >= 0) return false;
    }
    if (filters.replied) {
      if (filters.replied === "Replied" && !r.statusSent) return false;
      if (filters.replied === "Not Replied" && r.statusSent) return false;
    }
    return true;
  });



const pagedReviews = filteredReviews.slice(
  currentPage * ITEMS_PER_PAGE,
  (currentPage + 1) * ITEMS_PER_PAGE
);
  // ✅ Fetch hotels
  const fetchHotels = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/hotels", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const list = res.data.data || res.data;
      setHotels(list);
      if (list.length > 0) setHotelId(list[0].id.toString());
    } catch (err) {
      console.error("Failed to fetch hotels:", err);
      setError("Failed to fetch hotels");
    }
  };

  // ✅ Fetch reviews with filters & sorting
  const fetchData = async () => {
    if (!hotelId) return;
    try {
      const response = await axios.get("http://localhost:8080/api/hotel-reviews/all", {
        params: {
          createdBy: searchCriteria.createdBy,
          comment: searchCriteria.comment,
          page: pageNo,
          size: 50,
          hotelId: hotelId
        },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      let fetchedReviews = response.data.data.elementList;

      // Apply advanced filters
      fetchedReviews = fetchedReviews.filter((r) => {
        const sentimentScore = analyzeSentiment(r.comment, r.rating);
        const sentimentLabel =
          sentimentScore > 0 ? "Positive" : sentimentScore < 0 ? "Negative" : "Neutral";

        return (
          (filters.rating ? r.rating === parseInt(filters.rating) : true) &&
          (filters.sentiment ? sentimentLabel === filters.sentiment : true) &&
          (filters.replied ? (filters.replied === "Replied" ? r.statusSent : !r.statusSent) : true)
        );
      });

      // Apply sorting
      if (sortOption === "rating-desc") {
        fetchedReviews.sort((a, b) => b.rating - a.rating);
      } else if (sortOption === "rating-asc") {
        fetchedReviews.sort((a, b) => a.rating - b.rating);
      } else if (sortOption === "date-desc") {
        fetchedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      setReviews(fetchedReviews);
      setTotalPages(response.data.data.totalPages);
      setError(null);

      prepareChartData(fetchedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Failed to fetch reviews");
      if (error.response?.status === 403) {
        navigate("/403");
        return;
      }
      navigate("/");
    }
  };

  // ✅ Chart Data
  const prepareChartData = (data) => {
    const sentimentCount = { Positive: 0, Neutral: 0, Negative: 0 };
    const ratingCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    data.forEach((r) => {
      const s = analyzeSentiment(r.comment, r.rating);
      if (s > 0) sentimentCount.Positive++;
      else if (s < 0) sentimentCount.Negative++;
      else sentimentCount.Neutral++;
      ratingCount[r.rating]++;
    });

    setChartData({ sentimentCount, ratingCount });
  };

  // ✅ Fetch overview
  const fetchOverview = async () => {
    if (!hotelId) {
      setOverview(null);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:8080/api/hotel-reviews/${hotelId}/overview`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setOverview(res.data);
    } catch (err) {
      console.error("Failed to fetch overview:", err);
      setOverview(null);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    fetchData();
    fetchOverview();
  }, [pageNo, searchCriteria, hotelId, filters, sortOption]);

  // ✅ Reply Modal
  const handleReplyClick = (item) => {
    setSelectedReviewId(item.id);
    setSelectedReview(item);
    setReplyContent("");
    setShowReplyModal(true);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      toast.warning("Reply content is required");
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const email = user?.email || "admin@gmail.com";

      const replyHtml = `
<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
  <h2 style="color: #0275d8;">Dear ${selectedReview?.username || "Valued Guest"},</h2>
  <p>Thank you for your review. Here is our response:</p>
  <blockquote style="border-left: 4px solid #0275d8; margin: 10px 0; padding-left: 15px; color: #555;">
    ${replyContent}
  </blockquote>
  <p>We value your feedback and will use it to improve our service.</p>
  <br/>
  <p>Best regards,<br/><strong>TripMate Support Team</strong></p>
</div>`;

      await axios.post(
        `http://localhost:8080/api/hotel-reviews/${selectedReviewId}/reply`,
        { reply: replyHtml, repliedBy: email },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      toast.success("Reply submitted successfully!");

      setReviews((prev) =>
        prev.map((r) => (r.id === selectedReviewId ? { ...r, statusSent: true } : r))
      );

      setShowReplyModal(false);
    } catch (err) {
      toast.error("Failed to submit reply: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

 const generateAISuggestion = () => {
  if (!selectedReview) return;

  const score = analyzeSentiment(selectedReview.comment, selectedReview.rating);
  let suggestion = "";

  if (score > 0) {
    suggestion = `Thank you so much for your kind words! We're thrilled that you had a great experience with us. Your satisfaction is our top priority.`;
  } else if (score < 0) {
    suggestion = `We truly apologize for the inconvenience caused. Your feedback is very important, and we will take immediate steps to improve our services.`;
  } else {
    suggestion = `Thank you for your valuable feedback! We appreciate your input and will work on making our services even better.`;
  }

  setReplyContent(suggestion);
};


  const handleSearch = (e) => {
    e.preventDefault();
    setPageNo(0);
    fetchData();
  };

  // ✅ Sentiment analyzer
  const analyzeSentiment = (text, rating) => {
    if (rating >= 4) return 1;
    if (rating <= 2) return -1;

    const result = sentiment.analyze(text);
    let score = result.score;

    const positiveKeywords = ["excellent", "amazing", "perfect", "great", "wonderful", "love"];
    const negativeKeywords = ["bad", "terrible", "poor", "hate", "awful"];

    const lowerText = text.toLowerCase();
    if (score === 0) {
      for (const word of positiveKeywords) {
        if (lowerText.includes(word)) {
          score = 1;
          break;
        }
      }
      for (const word of negativeKeywords) {
        if (lowerText.includes(word)) {
          score = -1;
          break;
        }
      }
    }
    return score;
  };

  // ✅ Fixed RatingBar
  const RatingBar = ({ rating }) => {
    const percentage = (rating / 5) * 100;
    return (
      <div className="feedback-rating-bar">
        <div style={{ width: `${percentage}%` }} />
      </div>
    );
  };

  return (
    <div className="feedback-container mx-auto p-6">
      <h1 className="feedback-title">Review Management</h1>
      <ToastContainer position="top-center" autoClose={4000} theme="colored" />
      {error && <p className="error-message">{error}</p>}

      {/* ✅ Select hotel */}
      <div className="mb-4">
        <label htmlFor="hotel-select" className="font-semibold mr-2">Select Hotel:</label>
        <select id="hotel-select" value={hotelId} onChange={(e) => { setHotelId(e.target.value); setPageNo(0); }} className="form-input">
          {hotels.map((hotel) => (<option key={hotel.id} value={hotel.id}>{hotel.name}</option>))}
        </select>
      </div>

      {/* ✅ Overview */}
      {overview && (
        <div className="overview-panel mb-6 p-4 border rounded-md bg-green-50">
          <h2 className="text-xl font-semibold mb-3">📊 Review Overview</h2>
          <div className="overview-item mb-2"><strong>Overall Rating: </strong>{overview.overallRating.toFixed(2)} / 5<RatingBar rating={overview.overallRating} /></div>
          <div className="overview-item mb-2"><strong>Service: </strong>{overview.serviceRating.toFixed(2)} / 5<RatingBar rating={overview.serviceRating} /></div>
          <div className="overview-item mb-2"><strong>Cleanliness: </strong>{overview.cleanlinessRating.toFixed(2)} / 5<RatingBar rating={overview.cleanlinessRating} /></div>
          <div className="overview-item mb-2"><strong>Location: </strong>{overview.locationRating.toFixed(2)} / 5<RatingBar rating={overview.locationRating} /></div>
          <div className="overview-item mb-2"><strong>Facilities: </strong>{overview.facilitiesRating.toFixed(2)} / 5<RatingBar rating={overview.facilitiesRating} /></div>
          <div className="overview-item"><strong>Value for Money: </strong>{overview.valueForMoneyRating.toFixed(2)} / 5<RatingBar rating={overview.valueForMoneyRating} /></div>
          <div className="mt-4 font-medium">Total Reviews: {overview.totalReviewCount}</div>
        </div>
      )}

      {/* ✅ Charts */}
      {chartData && reviews.length > 0 && (
        <div className="charts-wrapper">
          <div className="chart-box">
            <h3>Sentiment Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={[
                  { name: "Positive", value: chartData.sentimentCount.Positive },
                  { name: "Neutral", value: chartData.sentimentCount.Neutral },
                  { name: "Negative", value: chartData.sentimentCount.Negative }
                ]} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                  {COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-box">
            <h3>Rating Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.keys(chartData.ratingCount).map(key => ({ rating: key, count: chartData.ratingCount[key] }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ✅ Filters */}
      <div className="filters-wrapper">
        <select onChange={(e) => setFilters({ ...filters, rating: e.target.value })}>
          <option value="">Filter by Rating</option>
          {[1, 2, 3, 4, 5].map((r) => (<option key={r} value={r}>{r} Stars</option>))}
        </select>
        <select onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}>
          <option value="">Filter by Sentiment</option>
          <option value="Positive">Positive</option>
          <option value="Neutral">Neutral</option>
          <option value="Negative">Negative</option>
        </select>
        <select onChange={(e) => setFilters({ ...filters, replied: e.target.value })}>
          <option value="">Filter by Reply Status</option>
          <option value="Replied">Replied</option>
          <option value="Not Replied">Not Replied</option>
        </select>
        <select onChange={(e) => setSortOption(e.target.value)}>
          <option value="">Sort by</option>
          <option value="rating-desc">Rating (High to Low)</option>
          <option value="rating-asc">Rating (Low to High)</option>
          <option value="date-desc">Newest First</option>
        </select>
      </div>

      {/* ✅ Table */}
      {/* ✅ Table */}
<div className="ft-table-wrapper">
  <table className="ft-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Comment + Sentiment</th>
        <th>Rating</th>
        <th>Image</th>
        <th>Type</th>
        <th>Actions</th>
      </tr>
    </thead>
   <tbody>
  {pagedReviews.map((item) => {
    const sentimentScore = analyzeSentiment(item.comment, item.rating);
    const sentimentLabel =
      sentimentScore > 0 ? "😊 Positive" :
      sentimentScore < 0 ? "😞 Negative" : "😐 Neutral";

    return (
      <tr key={item.id} className={`ft-row ${sentimentScore < 0 ? "ft-negative-row" : ""}`}>
        <td className="ft-cell-id">{item.id}</td>
        <td className="ft-cell-comment">
          {item.comment}
          <br />
          <small><strong>Sentiment:</strong> {sentimentLabel}</small>
        </td>
        <td className="ft-cell-rating">{item.rating}★</td>
        <td className="ft-cell-image">
          {item.image && <img src={item.image} alt="Review" className="ft-image" />}
        </td>
        <td className="ft-cell-type">{item.type}</td>
        <td className="ft-cell-actions">
          {item.statusSent ? (
            <span className="ft-status-replied">Replied ✅</span>
          ) : (
            <button className="ft-btn-reply" onClick={() => handleReplyClick(item)}>Reply</button>
          )}
        </td>
      </tr>
    );
  })}
  {pagedReviews.length === 0 && (
    <tr>
      <td colSpan={6} className="ft-no-data">No reviews found</td>
    </tr>
  )}
</tbody>

  </table>
</div>
<div className="ft-pagination-nav">
  <button
    className="ft-page-btn"
    disabled={currentPage === 0}
    onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
  >
    ← Previous
  </button>
  <span className="ft-page-info">
    Page {totalPages === 0 ? 0 : currentPage + 1} of {Math.ceil(filteredReviews.length / ITEMS_PER_PAGE) || 1}
  </span>
  <button
    className="ft-page-btn"
    disabled={currentPage >= Math.ceil(filteredReviews.length / ITEMS_PER_PAGE) - 1}
    onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(filteredReviews.length / ITEMS_PER_PAGE) - 1))}
  >
    Next →
  </button>
</div>
      {/* ✅ Reply Modal */}
   {showReplyModal && (
  <div className="reply-modal-overlay">
    <div className="reply-modal-container">
      <button className="reply-modal-close" onClick={() => setShowReplyModal(false)}>X</button>
      <h2 className="reply-modal-title">Reply to {selectedReview?.username}</h2>
      <p className="reply-modal-comment"><strong>Comment:</strong> {selectedReview?.comment}</p>
      <textarea
        className="reply-modal-textarea"
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder="Enter your reply here..."
        required
      />
      <div className="reply-modal-actions">
        <button type="button" className="reply-modal-ai-btn" onClick={generateAISuggestion}>
          Generate AI Suggestion
        </button>
        <button type="button" className="reply-modal-cancel-btn" onClick={() => setShowReplyModal(false)}>
          Cancel
        </button>
        <button
          className="reply-modal-send-btn"
          onClick={handleReplySubmit}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reply"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ReviewManagementPage1;
