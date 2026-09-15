import { useEffect, useState } from 'react';
import BookingForm from './BookingForm';

export default function VehicleModal({ vehicle, onClose }) {
  const [activeImage, setActiveImage] = useState(0);
  const images = vehicle.images && vehicle.images.length ? vehicle.images : [];

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div style={styles.overlay} onClick={onClose} role="presentation">
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${vehicle.name} details and reservation form`}
      >
        <button style={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        <div style={styles.content}>
          <div style={styles.gallerySide}>
            <div style={styles.mainImageWrap}>
              {images.length ? (
                <img src={images[activeImage]} alt={`${vehicle.name} photo ${activeImage + 1}`} style={styles.mainImage} />
              ) : (
                <div style={styles.noImage}>No photos yet</div>
              )}
            </div>
            {images.length > 1 && (
              <div style={styles.thumbRow}>
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    style={{
                      ...styles.thumbBtn,
                      borderColor: i === activeImage ? 'var(--amber)' : 'transparent',
                    }}
                    aria-label={`Show photo ${i + 1}`}
                  >
                    <img src={src} alt="" style={styles.thumbImage} />
                  </button>
                ))}
              </div>
            )}

            <div style={styles.detailsBlock}>
              <h2 style={styles.title}>{vehicle.name}</h2>
              <p style={styles.meta}>
                {vehicle.type} · {vehicle.seats} seats · {vehicle.transmission}
              </p>
              <p>{vehicle.description}</p>
              <p style={styles.price}>${vehicle.pricePerDay}<span style={styles.priceUnit}> / day</span></p>
            </div>
          </div>

          <div style={styles.formSide}>
            <h3 style={styles.formTitle}>Request this vehicle</h3>
            <BookingForm vehicle={vehicle} onDone={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(22,51,43,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20, zIndex: 100,
  },
  modal: {
    background: 'var(--paper)', borderRadius: 'var(--radius-m)',
    maxWidth: 960, width: '100%', maxHeight: '92vh', overflowY: 'auto',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute', top: 14, right: 14, zIndex: 2,
    background: 'var(--ink)', color: 'var(--paper)', border: 'none',
    width: 36, height: 36, borderRadius: '50%', fontSize: '1rem',
  },
  content: { display: 'grid', gridTemplateColumns: '1.1fr 1fr' },
  gallerySide: { padding: 24, borderRight: '1px solid var(--line)' },
  mainImageWrap: { aspectRatio: '4/3', background: '#DDD6C6', borderRadius: 'var(--radius-s)', overflow: 'hidden' },
  mainImage: { width: '100%', height: '100%', objectFit: 'cover' },
  noImage: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A8272' },
  thumbRow: { display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  thumbBtn: {
    width: 56, height: 56, padding: 0, borderRadius: 4, overflow: 'hidden',
    border: '2px solid transparent', background: 'none',
  },
  thumbImage: { width: '100%', height: '100%', objectFit: 'cover' },
  detailsBlock: { marginTop: 20 },
  title: { fontSize: '1.5rem', marginBottom: 4 },
  meta: { color: '#5C5747', fontSize: '0.9rem' },
  price: { fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginTop: 12 },
  priceUnit: { fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#5C5747' },
  formSide: { padding: 24 },
  formTitle: { fontSize: '1.2rem', marginBottom: 16 },
};

if (typeof document !== 'undefined' && !document.getElementById('modal-responsive-styles')) {
  const style = document.createElement('style');
  style.id = 'modal-responsive-styles';
  style.textContent = `
    @media (max-width: 780px) {
      [role="dialog"] > div { grid-template-columns: 1fr !important; }
      [role="dialog"] > div > div:first-child { border-right: none !important; border-bottom: 1px solid var(--line); }
    }
  `;
  document.head.appendChild(style);
}
