import { useState, useEffect } from "react";

const ALBUMS_KEY = "vozdigital_albums";

function getAlbums() {
  try { return JSON.parse(localStorage.getItem(ALBUMS_KEY)) || []; } catch { return []; }
}

const defaultAlbums = [
  {
    id: "a1",
    title: "Inicio de Curso 2026",
    date: "2026-08-15",
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=400&fit=crop", caption: "Ceremonia de bienvenida" },
      { id: "p2", url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop", caption: "Primer día de clases" },
      { id: "p3", url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop", caption: "Grupos del salón" },
    ],
  },
  {
    id: "a2",
    title: "Vacaciones de Verano",
    date: "2026-07-20",
    photos: [
      { id: "p4", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop", caption: "Playa escolar" },
      { id: "p5", url: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&h=400&fit=crop", caption: "Actividades acuáticas" },
    ],
  },
];

export default function Gallery() {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getAlbums();
    setAlbums(stored.length > 0 ? stored : defaultAlbums);
    setLoading(false);
  }, []);

  function handleDownload(url, caption) {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${caption || "foto"}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div><p>Cargando galería...</p></div>;

  if (selectedAlbum) {
    const album = albums.find((a) => a.id === selectedAlbum);
    return (
      <main className="section-page">
        <button className="back-btn" onClick={() => setSelectedAlbum(null)}>← Volver a álbumes</button>
        <div className="section-page-header">
          <span className="section-icon">📸</span>
          <h1>{album.title}</h1>
          <p className="history-subtitle">{album.photos.length} foto(s)</p>
          <div className="section-line"></div>
        </div>
        <div className="gallery-grid">
          {album.photos.map((photo) => (
            <div key={photo.id} className="gallery-photo" onClick={() => setLightbox(photo)}>
              <img src={photo.url} alt={photo.caption} loading="lazy" />
              <div className="gallery-photo-overlay">
                <span>{photo.caption}</span>
                <button className="btn-download-gallery" onClick={(e) => { e.stopPropagation(); handleDownload(photo.url, photo.caption); }}>📥</button>
              </div>
            </div>
          ))}
        </div>
        {lightbox && (
          <div className="lightbox" onClick={() => setLightbox(null)}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
              <img src={lightbox.url} alt={lightbox.caption} />
              <p>{lightbox.caption}</p>
              <button className="btn-download" onClick={() => handleDownload(lightbox.url, lightbox.caption)}>📥 Descargar</button>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="section-page">
      <div className="section-page-header">
        <span className="section-icon">📸</span>
        <h1>Galería</h1>
        <div className="section-line"></div>
      </div>
      <div className="albums-grid">
        {albums.map((album) => (
          <div key={album.id} className="album-card" onClick={() => setSelectedAlbum(album.id)}>
            <div className="album-cover">
              <img src={album.photos[0]?.url} alt={album.title} loading="lazy" />
              <span className="album-count">{album.photos.length} fotos</span>
            </div>
            <div className="album-info">
              <h3>{album.title}</h3>
              <p>{album.date}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
