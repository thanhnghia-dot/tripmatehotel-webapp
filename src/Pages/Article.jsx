import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaHeart, FaRegHeart, FaUpload } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

function Article() {
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState({ title: '', file: null });
  const [preview, setPreview] = useState(null);
  const [likedArticles, setLikedArticles] = useState({});
  const [zoomImage, setZoomImage] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800, easing: 'ease-in-out' });
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/articles/listArticle');
      setArticles(res.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.file) {
      alert('Please select an image!');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('file', form.file);

      const res = await axios.post('http://localhost:8080/api/articles/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setArticles((prev) => [...prev, res.data]);
      setForm({ title: '', file: null });
      setPreview(null);

      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 300);
    } catch (error) {
      console.error('Error creating article:', error);
      alert('Failed to create article');
    }
  };

  const toggleLike = (id) => {
    setLikedArticles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await axios.delete(`http://localhost:8080/api/articles/${id}`);
        setArticles((prev) => prev.filter((article) => article.id !== id));
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Delete failed');
      }
    }
  };

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1000,
        margin: '0 auto',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#333',
      }}
    >
      <h2 data-aos="fade-down" style={{ textAlign: 'center', marginBottom: 20, fontWeight: 700 }}>
        Create New Article
      </h2>

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        data-aos="fade-up"
        data-aos-delay="200"
        style={{
          maxWidth: 450,
          margin: '0 auto 40px',
          backgroundColor: '#fff',
          padding: 24,
          borderRadius: 14,
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label
            htmlFor="title"
            style={{ fontWeight: 600, fontSize: 16, color: '#444', userSelect: 'none' }}
          >
            Article Title
          </label>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="Enter article title"
            value={form.title}
            onChange={handleChange}
            required
            style={{
              padding: '12px 16px',
              fontSize: 16,
              borderRadius: 12,
              border: '2px solid #ddd',
              outline: 'none',
              transition: 'border-color 0.25s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#e74c3c')}
            onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            autoComplete="off"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label
            htmlFor="file-upload"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              backgroundColor: '#e74c3c',
              color: '#fff',
              fontWeight: '700',
              fontSize: 15,
              borderRadius: 12,
              cursor: 'pointer',
              userSelect: 'none',
              width: 'fit-content',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c0392b')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e74c3c')}
          >
            <FaUpload size={18} />
            Choose Image
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            required
          />

          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{
                marginTop: 12,
                width: '100%',
                maxHeight: 240,
                borderRadius: 16,
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                objectFit: 'cover',
                cursor: 'zoom-in',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onClick={() => setZoomImage(preview)}
            />
          )}
        </div>

        <button
          type="submit"
          style={{
            padding: '14px',
            backgroundColor: '#e74c3c',
            color: '#fff',
            fontWeight: '700',
            fontSize: 17,
            borderRadius: 14,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(231,76,60,0.6)',
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#c0392b';
            e.currentTarget.style.boxShadow = '0 10px 28px rgba(192,57,43,0.8)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#e74c3c';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(231,76,60,0.6)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          + Add Article
        </button>
      </form>

      <hr style={{ margin: '30px 0', borderColor: '#eee' }} />

      <h2
        data-aos="fade-right"
        style={{ fontWeight: 700, color: '#444', marginBottom: 20, userSelect: 'none', textAlign: 'center' }}
      >
        Articles List
      </h2>

      {/* Wrapper để căn giữa danh sách */}
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            justifyContent: 'center', // canh giữa hàng ngang
          }}
          data-aos="fade-left"
          data-aos-delay="200"
        >
          {articles.map((article, index) => (
            <div
              key={article.id}
              style={{
                width: 230,
                borderRadius: 16,
                backgroundColor: '#fff',
                boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
                padding: 14,
                textAlign: 'center',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'default',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.06)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.1)';
              }}
              data-aos="zoom-in"
              data-aos-delay={300 + index * 100}
            >
              <strong
                style={{
                  display: 'block',
                  marginBottom: 8,
                  fontSize: 18,
                  color: '#222',
                  fontWeight: 700,
                  overflowWrap: 'break-word',
                }}
              >
                {article.title}
              </strong>
              <img
                src={article.image}
                alt={article.title}
                onClick={() => setZoomImage(article.image)}
                style={{
                  width: '100%',
                  height: 180,
                  borderRadius: 16,
                  objectFit: 'cover',
                  marginBottom: 12,
                  boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
                  cursor: 'zoom-in',
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />

              <div
                style={{
                  fontSize: 13,
                  color: '#666',
                  marginBottom: 12,
                  userSelect: 'text',
                  fontStyle: 'italic',
                }}
              >
                Created at: {new Date(article.createdAt).toLocaleString()}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <span
                  onClick={() => toggleLike(article.id)}
                  style={{
                    cursor: 'pointer',
                    color: likedArticles[article.id] ? '#e74c3c' : '#999',
                    fontSize: 22,
                    userSelect: 'none',
                    transition: 'transform 0.2s ease, color 0.3s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.3)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  title={likedArticles[article.id] ? 'Unlike' : 'Like'}
                >
                  {likedArticles[article.id] ? <FaHeart /> : <FaRegHeart />}
                </span>

                <button
                  onClick={() => handleDelete(article.id)}
                  style={{
                    padding: '6px 14px',
                    fontSize: 13,
                    borderRadius: 12,
                    backgroundColor: '#e74c3c',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(231,76,60,0.6)',
                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#c0392b';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(192,57,43,0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#e74c3c';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(231,76,60,0.6)';
                  }}
                  title="Delete article"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zoom modal */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            cursor: 'zoom-out',
            padding: 20,
          }}
        >
          <img
            src={zoomImage}
            alt="Zoom"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: 20,
              boxShadow: '0 0 40px rgba(0,0,0,0.7)',
              userSelect: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Article;
