import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ReviewManagementPage.css';

const ReviewManagementPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [pageNo, setPageNo] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchCriteria, setSearchCriteria] = useState({ createdBy: '', comment: '' });
  const [viewMode, setViewMode] = useState('Review'); // 'Review' or 'Feedback'
  const [error, setError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [selectedReviewId, setSelectedReviewId] = useState(null);
const [loading, setLoading] = useState(false);
  const fetchData = async () => {
    try {
      const endpoint =
        viewMode === 'Review'
          ? 'http://localhost:8080/api/hotel-reviews/all'
          : 'http://localhost:8080/api/hotel-reviews/feedback-all';
      const params =
        viewMode === 'Review'
          ? { createdBy: searchCriteria.createdBy, comment: searchCriteria.comment, page: pageNo, size: 4 }
          : { userName: searchCriteria.createdBy, content: searchCriteria.comment, page: pageNo, size: 4 };
      const response = await axios.get(endpoint, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setReviews(response.data.data.elementList);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error(`Error fetching ${viewMode.toLowerCase()}s:`, error);
      setError(`Failed to fetch ${viewMode.toLowerCase()}s: ${error.response?.data?.message || 'Unknown error'}`);
      if (error.response?.status === 403) {
        navigate('/403');
      } else {
        navigate('/');
      }
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/hotel-reviews/detail/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSelectedReview(response.data.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching review detail:', error);
      alert('Failed to fetch review detail: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

   const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return alert('Reply content is required');

    try {
      const endpoint =
        viewMode === 'Review'
          ? `http://localhost:8080/api/hotel-reviews/${selectedReviewId}/reply`
          : `http://localhost:8080/api/feedback/${selectedReviewId}/reply`;

      const user = JSON.parse(localStorage.getItem('user'));
      const email = user?.email || 'admin@gmail.com'; // sửa theo email admin nha khải 1 admin thôi
      const token = localStorage.getItem('token');

      const payload = viewMode === 'Review' ? { reply: replyContent } : { reply: replyContent, repliedBy: email };

      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Reply submitted successfully!');
      setShowReplyModal(false);
      setReplyContent('');
      setSelectedReviewId(null);
      fetchData();
    } catch (error) {
      alert('Failed to submit reply: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageNo, searchCriteria, viewMode]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPageNo(0);
    fetchData();
  };
  
  const truncateComment = (text) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length > 5) {
      return words.slice(0, 5).join(' ') + '...';
    }
    return text;
  };

  return (
    <div className="review-container mx-auto p-6">
      <h1 className="review-title text-3xl font-bold mb-6 text-gray-800">Review Management</h1>
      {error && <p className="review-error-message">{error}</p>}

      {/* Search Form */}
      <div className="review-search-form mb-6 flex gap-4 items-end">
        {/* CreatedBy Input */}
        <input
          type="text"
          placeholder={viewMode === 'Review' ? 'Search by created by' : 'Search by user name'}
          className="review-search-input"
          value={searchCriteria.createdBy}
          onChange={(e) => setSearchCriteria({ ...searchCriteria, createdBy: e.target.value })}
        />

        {/* Comment / Content Input */}
        <input
          type="text"
          placeholder={viewMode === 'Review' ? 'Search by comment' : 'Search by content'}
          className="review-search-input"
          value={searchCriteria.comment}
          onChange={(e) => setSearchCriteria({ ...searchCriteria, comment: e.target.value })}
        />

        {/* Search Button */}
        <button onClick={handleSearch} className="review-search-btn">
          Search
        </button>

        {/* View Mode Selector, căn theo chiều dọc */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">View Mode:</label>
          <select
            value={viewMode}
            onChange={(e) => {
              setViewMode(e.target.value);
              setSearchCriteria({ createdBy: '', comment: '' });
              setPageNo(0);
            }}
            className="review-form-input px-2 py-1 rounded border border-gray-300"
          >
            <option value="Review">Review</option>
            <option value="Feedback">Feedback</option>
          </select>
        </div>
      </div>

      {/* Reviews/Feedback Table */}
      <div className="review-overflow-x-auto">
        <table className="review-table">
          <thead>
            <tr className="review-table-header">
              <th className="review-table-cell w-10">ID</th>
              {viewMode === 'Review' ? (
                <>
                  <th className="review-table-cell w-64">Comment</th>
                  <th className="review-table-cell w-24">Rating</th>
                  <th className="review-table-cell w-32">Image</th>
                  <th className="review-table-cell w-24">Type</th>
                </>
              ) : (
                <>
                  <th className="review-table-cell w-32">UserName</th>
                  <th className="review-table-cell w-64">Content</th>
                  <th className="review-table-cell w-24">Type</th>
                  <th className="review-table-cell w-40">Created At</th>
                </>
              )}
              <th className="review-table-cell w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((item) => (
              <tr key={item.id} className="review-table-row">
                <td className="review-table-cell w-10">{item.id}</td>
                {viewMode === 'Review' ? (
                  <>
                    <td className="review-table-cell w-64">{truncateComment(item.comment)}</td>
                    <td className="review-table-cell w-24">{item.rating} <span> ★</span></td>
                    <td className="review-table-cell w-32">
                      {item.image && <img src={item.image} alt="Review" className="review-table-image" />}
                    </td>
                    <td className="review-table-cell w-24">{item.type}</td>
                  </>
                ) : (
                  <>
                    <td className="review-table-cell w-32">{item.userName}</td>
                    <td className="review-table-cell w-64">{truncateComment(item.content)}</td>
                    <td className="review-table-cell w-24">{item.type}</td>
                    <td className="review-table-cell w-40">{new Date(item.createdAt).toLocaleString('en-US')}</td>
                  </>
                )}
                <td className="review-table-cell review-action-cell w-32">
                  <div className="review-action-buttons">
                    {viewMode === 'Review' && (
                      <button
                        className="review-view-detail-btn"
                        onClick={() => handleViewDetail(item.id)}
                      >
                        View Detail
                      </button>
                    )}
                    <button
                      className="review-reply-btn"
                      onClick={() => {
                        setSelectedReviewId(item.id);
                        setShowReplyModal(true);
                      }}
                    >
                      Reply
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="review-pagination">
        <button
          onClick={() => setPageNo((prev) => Math.max(prev - 1, 0))}
          disabled={pageNo === 0}
          className="review-pagination-btn"
        >
          Previous
        </button>
        <div className="review-pagination-numbers">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setPageNo(index)}
              className={`review-pagination-number ${pageNo === index ? 'review-active' : ''}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPageNo((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={pageNo >= totalPages - 1}
          className="review-pagination-btn"
        >
          Next
        </button>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReview && (
        <div className="review-modal">
          <div className="review-modal-content">
            <h2 className="review-modal-title">Review Details</h2>
            <div className="review-modal-body">
              <div className="review-modal-field">
                <label className="review-modal-label">Comment</label>
                <p className="review-modal-value">{selectedReview.comment}</p>
              </div>
              <div className="review-modal-field inline">
                <label className="review-modal-label">Rating:</label>
                <p className="review-modal-value">{selectedReview.rating}{selectedReview.rating === 5 && <span> ★</span>}</p>
              </div>
              <div className="review-modal-field inline">
                <label className="review-modal-label">Type:</label>
                <p className="review-modal-value">{selectedReview.type}</p>
              </div>
              <div className="review-modal-field inline">
                <label className="review-modal-label">Created By:</label>
                <p className="review-modal-value">{selectedReview.createdBy}</p>
              </div>
              <div className="review-modal-field inline">
                <label className="review-modal-label">Created At:</label>
                <p className="review-modal-value">{new Date(selectedReview.createdAt).toLocaleString('en-US')}</p>
              </div>
              <div className="review-modal-field inline">
                <label className="review-modal-label">Hotel:</label>
                <p className="review-modal-value">{selectedReview.hotel}</p>
              </div>
              <div className="review-modal-field inline">
                <label className="review-modal-label">Trip:</label>
                <p className="review-modal-value">{selectedReview.trip}</p>
              </div>
              {selectedReview.image && (
                <div className="review-modal-field">
                  <label className="review-modal-label">Review Image</label>
                  <img src={selectedReview.image} alt="Review" className="review-modal-image" />
                </div>
              )}
              {selectedReview.hotelImg && (
                <div className="review-modal-field">
                  <label className="review-modal-label">Hotel Image</label>
                  <img src={selectedReview.hotelImg} alt="Hotel" className="review-modal-image" />
                </div>
              )}
            </div>
            <div className="review-modal-footer">
              <button className="review-modal-close-btn" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="review-modal">
          <div className="review-modal-content">
            <h2 className="review-modal-title">Reply to {viewMode}</h2>
            <form onSubmit={handleReplySubmit}>
              <div className="review-modal-body">
                <div className="review-modal-field">
                  <label className="review-modal-label">Reply Content</label>
                  <textarea
                    className="review-form-input review-textarea"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Enter your reply"
                    rows="4"
                    required
                  ></textarea>
                </div>
              </div>
              <div className="review-modal-footer">
                <button type="button" className="review-modal-close-btn" onClick={() => setShowReplyModal(false)}>
                  Cancel
                </button>
                  <button type="submit" disabled={loading} className="review-modal-submit-btn">
  {loading ? <div className="spinner"></div> : 'Submit Reply'}
</button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagementPage;