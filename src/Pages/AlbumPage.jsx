import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';

const MyAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [creating, setCreating] = useState(false);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoDesc, setPhotoDesc] = useState('');
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [modalPhoto, setModalPhoto] = useState(null);

  const token = localStorage.getItem('token');

  const fetchAlbums = useCallback(async () => {
    if (!token) {
      setError("No token found. Please login again.");
      return;
    }
    try {
      const res = await axios.get("http://localhost:8080/api/albums/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlbums(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (e) {
      setError("Failed to load albums");
      console.error(e);
    }
  }, [token]);

  const fetchPhotos = async (albumId) => {
    if (!token) {
      setError("No token found. Please login again.");
      return;
    }
    try {
      const res = await axios.get(`http://localhost:8080/api/photos/album/${albumId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPhotos(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError("Failed to load photos");
      console.error(e);
    }
  };

  useEffect(() => {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
    fetchAlbums();
  }, [fetchAlbums]);

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    setCreateError(null);
    if (!token) {
      setCreateError("No token found. Please login again.");
      return;
    }
    if (!name.trim()) {
      setCreateError("Album name is required.");
      return;
    }
    try {
      setCreating(true);
      await axios.post(
        "http://localhost:8080/api/albums/create",
        { name: name.trim(), description: description.trim(), public: isPublic },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName('');
      setDescription('');
      setIsPublic(false);
      fetchAlbums();
    } catch (e) {
      setCreateError("Failed to create album");
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleAlbumClick = (album) => {
    setSelectedAlbum(album);
    setPhotos([]);
    fetchPhotos(album.albumId);
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    setUploadError(null);

    if (!photoFile) {
      setUploadError("Please select an image file");
      return;
    }
    if (!token) {
      setUploadError("No token found. Please login again.");
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', photoFile);
      formData.append('description', photoDesc.trim());

      await axios.post(
        `http://localhost:8080/api/photos/upload/${selectedAlbum.albumId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setPhotoFile(null);
      setPhotoDesc('');
      fetchPhotos(selectedAlbum.albumId);

      document.getElementById('photoFileInput').value = '';
    } catch (e) {
      setUploadError("Failed to upload photo");
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const openModal = (photo) => setModalPhoto(photo);
  const closeModal = () => setModalPhoto(null);

  return (
    <div
      style={{
        maxWidth: 720,
        margin: '30px auto',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#333',
        padding: '0 16px',
      }}
    >
      <h2
        data-aos="fade-down"
        style={{
          textAlign: 'center',
          marginBottom: 28,
          color: '#d32f2f',
          fontWeight: '700',
          letterSpacing: '1.2px',
          userSelect: 'none',
        }}
      >
        📸 My Albums
      </h2>

      {/* Create Album Form */}
      <form
        onSubmit={handleCreateAlbum}
        data-aos="fade-up"
        data-aos-delay="100"
        style={{
          marginBottom: 48,
          padding: 24,
          backgroundColor: '#fff',
          borderRadius: 12,
          boxShadow: '0 8px 20px rgb(211 47 47 / 0.2)',
          transition: 'box-shadow 0.3s ease',
          maxWidth: 480,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <h3 style={{ marginBottom: 24, fontWeight: '700', color: '#b71c1c', textAlign: 'center' }}>
          Create New Album
        </h3>

        {/* Inputs... (giữ nguyên như code bạn gửi) */}

        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="albumName"
            style={{
              display: 'block',
              fontWeight: '700',
              fontSize: 16,
              marginBottom: 6,
              color: '#a32a2a',
              userSelect: 'none',
            }}
          >
            Name <span style={{ color: '#d32f2f' }}>*</span>
          </label>
          <input
            id="albumName"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter album name"
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: 16,
              borderRadius: 8,
              border: '2px solid #e0e0e0',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              outline: 'none',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#d32f2f';
              e.target.style.boxShadow = '0 0 6px #d32f2faa';
            }}
            onBlur={e => {
              e.target.style.borderColor = '#e0e0e0';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Các input khác giữ nguyên */}

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 24,
            fontWeight: '600',
            color: '#a32a2a',
            userSelect: 'none',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
            style={{
              marginRight: 10,
              width: 20,
              height: 20,
              cursor: 'pointer',
              accentColor: '#d32f2f',
            }}
          />
          Public Album
        </label>

        {createError && (
          <p
            style={{
              color: '#b00020',
              fontWeight: '600',
              marginBottom: 16,
              userSelect: 'none',
              textAlign: 'center',
            }}
          >
            {createError}
          </p>
        )}

        <button
          type="submit"
          disabled={creating}
          style={{
            padding: '14px 32px',
            cursor: creating ? 'wait' : 'pointer',
            backgroundColor: creating ? '#9e1a1a' : '#d32f2f',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontWeight: '700',
            fontSize: 18,
            width: '100%',
            boxShadow: creating ? 'none' : '0 6px 15px rgb(211 47 47 / 0.6)',
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
            userSelect: 'none',
          }}
          onMouseEnter={e => {
            if (!creating) e.currentTarget.style.backgroundColor = '#b71c1c';
          }}
          onMouseLeave={e => {
            if (!creating) e.currentTarget.style.backgroundColor = '#d32f2f';
          }}
        >
          {creating ? 'Creating...' : 'Create Album'}
        </button>
      </form>

      {/* Albums List */}
      {error && (
        <p
          style={{
            color: '#b00020',
            marginBottom: 24,
            fontWeight: '600',
            textAlign: 'center',
          }}
          data-aos="fade-up"
          data-aos-delay="150"
        >
          {error}
        </p>
      )}

      {albums.length === 0 ? (
        <p
          style={{ textAlign: 'center', color: '#777' }}
          data-aos="fade-up"
          data-aos-delay="200"
        >
          No albums found.
        </p>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            marginBottom: 48,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 18,
          }}
          data-aos="fade-up"
          data-aos-delay="200"
        >
          {albums.map((album, index) => (
            <li
              key={album.albumId}
              onClick={() => handleAlbumClick(album)}
              data-aos="zoom-in"
              data-aos-delay={250 + index * 50}
              style={{
                padding: 18,
                borderRadius: 14,
                boxShadow:
                  selectedAlbum?.albumId === album.albumId
                    ? '0 6px 20px rgb(211 47 47 / 0.35)'
                    : '0 3px 10px rgb(0 0 0 / 0.1)',
                backgroundColor: selectedAlbum?.albumId === album.albumId ? '#ffebee' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                userSelect: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 120,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#ffe6e6';
                e.currentTarget.style.boxShadow = '0 8px 22px rgb(211 47 47 / 0.4)';
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor =
                  selectedAlbum?.albumId === album.albumId ? '#ffebee' : '#fff';
                e.currentTarget.style.boxShadow =
                  selectedAlbum?.albumId === album.albumId
                    ? '0 6px 20px rgb(211 47 47 / 0.35)'
                    : '0 3px 10px rgb(0 0 0 / 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div>
                <h4
                  style={{
                    margin: '0 0 8px',
                    fontWeight: '700',
                    fontSize: 20,
                    color: '#b71c1c',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                  title={album.name}
                >
                  {album.name}
                </h4>
                <p
                  style={{
                    margin: '0 0 10px',
                    fontStyle: album.description ? 'normal' : 'italic',
                    color: '#555',
                    height: 42,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={album.description || 'No description'}
                >
                  {album.description || 'No description'}
                </p>
              </div>
              <small
                style={{
                  color: '#888',
                  fontWeight: '600',
                  userSelect: 'none',
                  fontSize: 13,
                }}
                title={`Created At: ${new Date(album.createdAt).toLocaleString()}`}
              >
                Public: <strong>{album.public ? 'Yes' : 'No'}</strong> | Created: {new Date(album.createdAt).toLocaleDateString()}
              </small>
            </li>
          ))}
        </ul>
      )}

      {/* Selected Album Details */}
      {selectedAlbum && (
        <section
          data-aos="fade-up"
          data-aos-delay="300"
          style={{
            padding: 24,
            borderRadius: 14,
            backgroundColor: '#fff',
            boxShadow: '0 10px 30px rgb(0 0 0 / 0.15)',
            marginBottom: 60,
            transition: 'box-shadow 0.3s ease',
          }}
        >
          <h3 style={{ marginBottom: 12, fontWeight: '700', color: '#b71c1c' }}>
            Album: {selectedAlbum.name}
          </h3>
          <p
            style={{
              fontStyle: selectedAlbum.description ? 'normal' : 'italic',
              color: '#555',
              fontSize: 15,
              marginBottom: 30,
            }}
          >
            {selectedAlbum.description || 'No description'}
          </p>

          <h4 style={{ marginBottom: 20, fontWeight: '600', color: '#d32f2f' }}>Photos</h4>

          {photos.length === 0 ? (
            <p style={{ color: '#777', fontStyle: 'italic' }}>No photos yet.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: 16,
              }}
            >
              {photos.map((photo, index) => (
                <div
                  key={photo.photoId}
                  onClick={() => openModal(photo)}
                  data-aos="zoom-in"
                  data-aos-delay={350 + index * 50}
                  style={{
                    borderRadius: 14,
                    overflow: 'hidden',
                    boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    userSelect: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: 130,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.07)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.12)';
                  }}
                  title={photo.description || 'No description'}
                >
                  <img
                    src={photo.url}
                    alt={photo.description || 'Photo'}
                    style={{
                      width: '100%',
                      height: 90,
                      objectFit: 'cover',
                      borderRadius: '14px 14px 0 0',
                      flexShrink: 0,
                      userSelect: 'none',
                    }}
                    draggable={false}
                  />
                  <small
                    style={{
                      display: 'block',
                      padding: '6px 10px',
                      fontSize: 13,
                      color: '#444',
                      backgroundColor: '#fafafa',
                      borderRadius: '0 0 14px 14px',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      fontWeight: '600',
                      userSelect: 'none',
                    }}
                  >
                    {photo.description || 'No description'}
                  </small>
                </div>
              ))}
            </div>
          )}

          {/* Upload Photo Form */}
          <form
            onSubmit={handlePhotoUpload}
            style={{
              marginTop: 40,
              paddingTop: 24,
              borderTop: '1px solid #eee',
            }}
          >
            <h4 style={{ marginBottom: 16, fontWeight: '700', color: '#d32f2f' }}>
              Add New Photo
            </h4>

            <input
              id="photoFileInput"
              type="file"
              accept="image/*"
              onChange={e => setPhotoFile(e.target.files[0])}
              style={{
                marginBottom: 16,
                padding: 8,
                borderRadius: 8,
                border: '1.5px solid #ddd',
                cursor: 'pointer',
                width: '100%',
                boxSizing: 'border-box',
                fontSize: 14,
                transition: 'border-color 0.3s ease',
              }}
            />

          
            <textarea
              value={photoDesc}
              onChange={e => setPhotoDesc(e.target.value)}
              placeholder="Photo description (optional)"
              rows={3}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '2px solid #e0e0e0',
                fontSize: 15,
                resize: 'vertical',
                boxSizing: 'border-box',
                marginBottom: 20,
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                outline: 'none',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              }}
              onFocus={e => {
                e.target.style.borderColor = '#d32f2f';
                e.target.style.boxShadow = '0 0 6px #d32f2faa';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            />

            {uploadError && (
              <p
                style={{
                  color: '#b00020',
                  fontWeight: '600',
                  marginBottom: 16,
                  userSelect: 'none',
                  textAlign: 'center',
                }}
              >
                {uploadError}
              </p>
            )}

            <button
              type="submit"
              disabled={uploading}
              style={{
                padding: '14px 32px',
                cursor: uploading ? 'wait' : 'pointer',
                backgroundColor: uploading ? '#9e1a1a' : '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontWeight: '700',
                fontSize: 18,
                width: '100%',
                boxShadow: uploading ? 'none' : '0 6px 15px rgb(211 47 47 / 0.6)',
                transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                userSelect: 'none',
              }}
              onMouseEnter={e => {
                if (!uploading) e.currentTarget.style.backgroundColor = '#b71c1c';
              }}
              onMouseLeave={e => {
                if (!uploading) e.currentTarget.style.backgroundColor = '#d32f2f';
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </form>
        </section>
      )}

      {/* Modal to show photo large */}
      {modalPhoto && (
        <div
          onClick={closeModal}
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
            boxSizing: 'border-box',
          }}
          data-aos="zoom-in"
        >
          <img
            src={modalPhoto.url}
            alt={modalPhoto.description || 'Photo'}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: 20,
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
};

export default MyAlbums;
