export default function AdBanner({ ad }) {
  if (!ad) return null;

  return (
    <a href={ad.link || "#"} className="ad-banner" target="_blank" rel="noopener noreferrer">
      <div className="ad-content">
        <div className="ad-text">
          <span className="ad-label">Publicidad</span>
          <h3 className="ad-title" style={{ color: ad.color }}>
            {ad.title}
          </h3>
          <p className="ad-description">{ad.description}</p>
        </div>
        {ad.imageUrl && (
          <img src={ad.imageUrl} alt={ad.title} className="ad-image" />
        )}
      </div>
    </a>
  );
}
