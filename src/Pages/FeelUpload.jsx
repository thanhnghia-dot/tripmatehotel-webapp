import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function FeelUpload({ onSuccess  }) {
  const [caption, setCaption] = useState('');
  const [video, setVideo] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      toast.error("Please log in again. Missing user ID.");
    }
    setUserId(storedUserId);
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error("User ID is missing!");
      return;
    }

    if (!video) {
      toast.error("Please select a video file!");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("video", video);
    formData.append("userId", userId);

    try {
      setIsUploading(true);
      await axios.post("http://localhost:8080/api/feels/upload", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("✅ Video uploaded successfully!");
      setCaption('');
      setVideo(null);
    
      document.querySelector('input[type="file"]').value = '';
 if (typeof onSuccess === 'function') {
  onSuccess();
}

    } catch (err) {
      console.error("Upload failed", err);
      toast.error("❌ Failed to upload video!");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form 
      onSubmit={handleUpload} 
      className="feel-upload"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '480px',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        margin: 'auto'
      }}
    >
      <h2 style={{ marginBottom: '10px' }}>Share a Feel 🎥</h2>
      
      <textarea
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        required
        rows={3}
        style={{
          padding: '10px',
          fontSize: '14px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          resize: 'vertical'
        }}
      />

      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideo(e.target.files[0])}
        required
        style={{
          padding: '6px',
          fontSize: '14px'
        }}
      />

      {video && (
        <div style={{ fontSize: '14px', color: '#555' }}>
          🎬 Selected: <strong>{video.name}</strong>
        </div>
      )}

      <button 
        type="submit" 
        disabled={isUploading}
        style={{
          padding: '10px 16px',
          backgroundColor: isUploading ? '#95a5a6' : '#970606ff',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '8px',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        {isUploading ? 'Uploading...' : 'Upload Feel'}
      </button>
    </form>
  );
}

export default FeelUpload;
