export default function VehicleCard({ vehicle, onSelect }) {
  const cover = vehicle.images && vehicle.images[0];

  return (
    <article style={styles.card}>
      <div style={styles.imageWrap}>
        {cover ? (
          <img src={cover} alt={vehicle.name} style={styles.image} />
        ) : (
          <div style={styles.noImage}>No photo yet</div>
        )}
        <span style={styles.tag}>{vehicle.type}</span>
      </div>
      <div style={styles.body}>
        <h3 style={styles.name}>{vehicle.name}</h3>
        <p style={styles.meta}>{vehicle.seats} seats · {vehicle.transmission}</p>
        <p style={styles.desc}>{vehicle.description}</p>
        <div style={styles.footer}>
          <span style={styles.price}>${vehicle.pricePerDay}<span style={styles.priceUnit}>/day</span></span>
          <button className="btn btn-primary" style={styles.btn} onClick={onSelect}>
            View &amp; reserve
          </button>
        </div>
      </div>
    </article>
  );
}

const styles = {
  card: {
    background: 'var(--paper)',
    border: '1.5px solid var(--line)',
    borderRadius: 'var(--radius-m)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  imageWrap: { position: 'relative', aspectRatio: '4 / 3', background: '#DDD6C6' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  noImage: {
    width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#8A8272', fontSize: '0.85rem',
  },
  tag: {
    position: 'absolute', top: 10, left: 10,
    background: 'var(--ink)', color: 'var(--paper)',
    fontSize: '0.72rem', fontWeight: 600,
    padding: '4px 10px', borderRadius: 999,
  },
  body: { padding: 18, display: 'flex', flexDirection: 'column', flex: 1 },
  name: { fontSize: '1.2rem', marginBottom: 2 },
  meta: { fontSize: '0.85rem', color: '#5C5747', marginBottom: 8 },
  desc: { fontSize: '0.9rem', color: '#3F3B30', flex: 1, marginBottom: 16 },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  price: { fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600 },
  priceUnit: { fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 400, color: '#5C5747' },
  btn: { fontSize: '0.85rem', padding: '10px 16px', whiteSpace: 'nowrap' },
};
