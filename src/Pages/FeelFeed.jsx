import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FeelUpload from '../Pages/FeelUpload';

function FeelFeed() {
  const [feels, setFeels] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [myFeelMode, setMyFeelMode] = useState(false);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchFeels();
  }, [myFeelMode]);

  const fetchFeels = async () => {
    if (!userId) return;
    try {
      const url = myFeelMode
        ? `http://localhost:8080/api/feels/my?userId=${userId}`
        : `http://localhost:8080/api/feels`;
      const res = await axios.get(url);
      setFeels(res.data);
    } catch (err) {
      console.error("Lỗi tải feels:", err);
    }
  };

  const deleteFeel = async (feelId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa video này?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/feels/${feelId}`);
      fetchFeels();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
    }
  };

  const toggleLike = async (feelId) => {
    if (!userId) {
      alert("Vui lòng đăng nhập lại!");
      return;
    }
    try {
      await axios.post(`http://localhost:8080/api/feels/${feelId}/like`, null, {
        params: { userId }
      });
      fetchFeels();
    } catch (err) {
      console.error("Lỗi like:", err);
    }
  };

  const postComment = async (feelId) => {
    const content = commentText[feelId];
    if (!userId || !content?.trim()) return;

    try {
      await axios.post(`http://localhost:8080/api/feels/${feelId}/comment`, null, {
        params: { userId, content }
      });
      setCommentText({ ...commentText, [feelId]: '' });
      fetchFeels();
    } catch (err) {
      console.error("Lỗi bình luận:", err);
    }
  };

  const currentFeel = selectedIndex !== null ? feels[selectedIndex] : null;

  return (
    <div style={{ padding: '1rem' }}>
      {/* Toggle View */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '1rem' }}>
        <button
          onClick={() => setMyFeelMode(false)}
          style={{
            backgroundColor: myFeelMode ? '#ccc' : '#0984e3',
            color: myFeelMode ? 'black' : 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          🌍 All Feels
        </button>
        <button
          onClick={() => setMyFeelMode(true)}
          style={{
            backgroundColor: myFeelMode ? '#00cec9' : '#ccc',
            color: myFeelMode ? 'white' : 'black',
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          👤 My Feels
        </button>
      </div>

      {/* Upload */}
      <button
        onClick={() => setShowUploadModal(true)}
        style={{
          marginBottom: '1rem',
          background: '#00b894',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        ➕ Create Feel
      </button>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '90%',
            width: '400px',
            position: 'relative'
          }}>
            <button onClick={() => setShowUploadModal(false)} style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              fontSize: '20px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}>×</button>

            <FeelUpload onSuccess={() => {
              setShowUploadModal(false);
              fetchFeels();
            }} />
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem'
      }}>
        {feels.map((feel, index) => (
          <div key={feel.id} style={{
            width: '100%',
            aspectRatio: '9 / 16',
            overflow: 'hidden',
            borderRadius: '12px',
            backgroundColor: '#000',
            cursor: 'pointer',
            position: 'relative'
          }} onClick={() => setSelectedIndex(index)}>
            <video width="100%" height="100%" style={{ objectFit: 'cover' }} muted>
              <source src={`http://localhost:8080${feel.videoUrl}`} type="video/mp4" />
            </video>
            {myFeelMode && (
              <button onClick={(e) => {
                e.stopPropagation();
                deleteFeel(feel.id);
              }} style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                background: 'rgba(255, 0, 0, 0.8)',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}>
                🗑
              </button>
            )}
          </div>
        ))}
      </div>

      {/* View Modal */}
      {currentFeel && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          {selectedIndex > 0 && (
            <button onClick={() => setSelectedIndex(selectedIndex - 1)} style={{
              position: 'fixed',
              top: '10%',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '32px',
              color: 'white',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}>⬆</button>
          )}
          {selectedIndex < feels.length - 1 && (
            <button onClick={() => setSelectedIndex(selectedIndex + 1)} style={{
              position: 'fixed',
              bottom: '10%',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '32px',
              color: 'white',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}>⬇</button>
          )}

          <div style={{
            position: 'relative',
            width: '360px',
            height: '640px',
            background: '#000',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <video width="100%" height="100%" controls autoPlay style={{ objectFit: 'cover' }}>
              <source src={`http://localhost:8080${currentFeel.videoUrl}`} type="video/mp4" />
            </video>

            <div style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%',
              height: '100%',
              color: 'white',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 40%)'
            }}>
              <p><strong>{currentFeel.user?.name}</strong></p>
              <p>{currentFeel.caption}</p>

              <button onClick={() => toggleLike(currentFeel.id)} style={{
                margin: '0.5rem 0',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '20px',
                color: 'white',
                cursor: 'pointer'
              }}>
                ❤️ Thích ({currentFeel.likes?.length || 0})
              </button>

              <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '0.85rem' }}>
                {currentFeel.comments?.map(c => (
                  <div key={c.id}>
                    <strong>{c.user.name}</strong>: {c.content}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', marginTop: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Bình luận..."
                  value={commentText[currentFeel.id] || ''}
                  onChange={(e) => setCommentText({ ...commentText, [currentFeel.id]: e.target.value })}
                  style={{
                    flex: 1,
                    borderRadius: '16px',
                    border: 'none',
                    padding: '4px 8px',
                    color: 'black',
                    backgroundColor: 'white'
                  }}
                />
                <button onClick={() => postComment(currentFeel.id)} style={{
                  marginLeft: '8px',
                  border: 'none',
                  background: '#ff4757',
                  color: 'black',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  cursor: 'pointer'
                }}>💬</button>
              </div>
            </div>

            <button onClick={() => setSelectedIndex(null)} style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              fontSize: '24px',
              color: 'white',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeelFeed;
