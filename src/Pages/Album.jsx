import React from 'react';
import './Album.css';

const mockPhotos = [
  "/images/photo1.jpg",
  "/images/photo2.jpg",
  "/images/photo3.jpg",
];

function Album() {
  return (
    <div className="album-container">
      <h2>Trip Photo Album</h2>
      <div className="photo-grid">
        {mockPhotos.map((src, i) => (
          <img key={i} src={src} alt={`photo-${i}`} className="photo-item" />
        ))}
      </div>
    </div>
  );
}

export default Album;
