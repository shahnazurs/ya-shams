import { useEffect, useState } from 'react';
import { api } from '../api';
import VehicleCard from './VehicleCard';
import VehicleModal from './VehicleModal';

export default function Home() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;
    api
      .listVehicles()
      .then((data) => {
        if (!cancelled) setVehicles(data.filter((v) => v.available !== false));
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const types = ['All', ...Array.from(new Set(vehicles.map((v) => v.type)))];
  const visible = typeFilter === 'All' ? vehicles : vehicles.filter((v) => v.type === typeFilter);

  return (
    <main>
      <section style={styles.hero}>
        <div className="container" style={styles.heroInner}>
          <div>
            <p style={styles.eyebrow}>Van &amp; car hire</p>
            <h1 style={styles.h1}>Pick a road.<br />We'll bring the wheels.</h1>
            <p style={styles.heroCopy}>
              A small fleet of campervans, 4x4s and family cars, ready for your next
              trip. Browse what's available, check the photos, and send a reservation
              request in a couple of minutes.
            </p>
            <a href="#fleet" className="btn btn-accent">Browse the fleet</a>
          </div>
        </div>
      </section>

      <section id="fleet" className="container" style={styles.fleetSection}>
        <div style={styles.fleetHeader}>
          <h2 style={styles.h2}>Available now</h2>
          <div style={styles.filters} role="group" aria-label="Filter by vehicle type">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={t === typeFilter ? 'btn btn-primary' : 'btn btn-outline'}
                style={styles.filterBtn}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading && <p>Loading the fleet…</p>}
        {error && <p style={{ color: 'var(--danger)' }}>Couldn't load vehicles: {error}</p>}
        {!loading && !error && visible.length === 0 && (
          <p>No vehicles match that filter right now.</p>
        )}

        <div style={styles.grid}>
          {visible.map((v) => (
            <VehicleCard key={v.id} vehicle={v} onSelect={() => setSelected(v)} />
          ))}
        </div>
      </section>

      <section id="how-it-works" className="container" style={styles.howSection}>
        <h2 style={styles.h2}>How a reservation works</h2>
        <div style={styles.steps}>
          <div style={styles.step}>
            <span style={styles.stepNum}>1</span>
            <h3 style={styles.stepTitle}>Choose your vehicle</h3>
            <p>Browse the fleet, look through the photos, and pick the one that fits your trip.</p>
          </div>
          <div style={styles.step}>
            <span style={styles.stepNum}>2</span>
            <h3 style={styles.stepTitle}>Send a request</h3>
            <p>Tell us your dates and contact details. It takes about a minute.</p>
          </div>
          <div style={styles.step}>
            <span style={styles.stepNum}>3</span>
            <h3 style={styles.stepTitle}>We confirm by email</h3>
            <p>Our team checks availability and confirms your booking within one business day.</p>
          </div>
        </div>
      </section>

      {selected && (
        <VehicleModal vehicle={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}

const styles = {
  hero: {
    background: 'linear-gradient(180deg, var(--ink) 0%, #1E4136 100%)',
    color: 'var(--paper)',
  },
  heroInner: { padding: '72px 24px 88px' },
  eyebrow: {
    color: 'var(--amber)',
    fontWeight: 600,
    fontSize: '0.95rem',
    marginBottom: 12,
  },
  h1: {
    color: 'var(--paper)',
    fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
    maxWidth: 640,
    marginBottom: 20,
  },
  heroCopy: {
    color: 'var(--stone)',
    fontSize: '1.05rem',
    maxWidth: 520,
    marginBottom: 28,
  },
  fleetSection: { padding: '56px 24px' },
  fleetHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
  },
  h2: { fontSize: '1.8rem' },
  filters: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  filterBtn: { padding: '8px 16px', fontSize: '0.85rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 24,
  },
  howSection: { padding: '32px 24px 80px' },
  steps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 32,
    marginTop: 24,
  },
  step: {
    borderTop: '3px solid var(--amber)',
    paddingTop: 16,
  },
  stepNum: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.6rem',
    color: 'var(--amber-dark)',
  },
  stepTitle: { fontSize: '1.1rem', margin: '8px 0' },
};

if (typeof document !== 'undefined' && !document.getElementById('home-responsive-styles')) {
  const style = document.createElement('style');
  style.id = 'home-responsive-styles';
  style.textContent = `
    @media (max-width: 720px) {
      #how-it-works > div:last-child { grid-template-columns: 1fr !important; }
      #fleet h2 { font-size: 1.5rem; }
    }
    @media (max-width: 480px) {
      #fleet > div:first-child { flex-direction: column; align-items: flex-start !important; }
    }
  `;
  document.head.appendChild(style);
}
