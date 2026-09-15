import { useEffect, useState } from 'react';
import { api, clearAdminToken } from '../api';
import AdminVehicleForm from './AdminVehicleForm';
import BookingsTable from './BookingsTable';

export default function AdminDashboard() {
  const [tab, setTab] = useState('fleet');
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | vehicle object

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const [v, b] = await Promise.all([api.listVehicles(), api.listBookings()]);
      setVehicles(v);
      setBookings(b);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function handleSaveVehicle(payload) {
    if (editing && editing !== 'new') {
      await api.updateVehicle({ ...payload, id: editing.id });
    } else {
      await api.addVehicle(payload);
    }
    setEditing(null);
    loadAll();
  }

  async function handleDeleteVehicle(id) {
    if (!confirm('Remove this vehicle from the fleet?')) return;
    await api.deleteVehicle(id);
    loadAll();
  }

  async function handleStatusChange(id, status) {
    setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, status } : b)));
    await api.updateBookingStatus(id, status);
  }

  function logout() {
    clearAdminToken();
    window.location.href = './';
  }

  return (
    <main className="container" style={styles.wrap}>
      <div style={styles.headerRow}>
        <h1 style={styles.h1}>Admin panel</h1>
        <button className="btn btn-outline" onClick={logout}>Log out</button>
      </div>

      <div style={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'fleet'}
          className={tab === 'fleet' ? 'btn btn-primary' : 'btn btn-outline'}
          onClick={() => setTab('fleet')}
        >
          Fleet ({vehicles.length})
        </button>
        <button
          role="tab"
          aria-selected={tab === 'bookings'}
          className={tab === 'bookings' ? 'btn btn-primary' : 'btn btn-outline'}
          onClick={() => setTab('bookings')}
        >
          Reservations ({bookings.filter((b) => b.status === 'pending').length} pending)
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

      {!loading && tab === 'fleet' && (
        <div>
          {editing && (
            <AdminVehicleForm
              vehicle={editing === 'new' ? null : editing}
              onSave={handleSaveVehicle}
              onCancel={() => setEditing(null)}
            />
          )}

          {!editing && (
            <button className="btn btn-accent" style={{ marginBottom: 20 }} onClick={() => setEditing('new')}>
              + Add vehicle
            </button>
          )}

          <div style={styles.vehicleList}>
            {vehicles.map((v) => (
              <div key={v.id} style={styles.vehicleRow}>
                <img
                  src={(v.images && v.images[0]) || ''}
                  alt=""
                  style={styles.thumb}
                  onError={(e) => { e.target.style.visibility = 'hidden'; }}
                />
                <div style={{ flex: 1 }}>
                  <strong>{v.name}</strong>
                  <div style={{ fontSize: '0.85rem', color: '#5C5747' }}>
                    {v.type} · ${v.pricePerDay}/day · {v.available === false ? 'Hidden' : 'Listed'}
                  </div>
                </div>
                <button className="btn btn-outline" onClick={() => setEditing(v)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDeleteVehicle(v.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && tab === 'bookings' && (
        <BookingsTable bookings={bookings} onStatusChange={handleStatusChange} />
      )}
    </main>
  );
}

const styles = {
  wrap: { padding: '40px 24px 80px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  h1: { fontSize: '1.8rem', marginBottom: 0 },
  tabs: { display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' },
  vehicleList: { display: 'flex', flexDirection: 'column', gap: 10 },
  vehicleRow: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: 'var(--paper)', border: '1.5px solid var(--line)',
    borderRadius: 'var(--radius-s)', padding: 12,
  },
  thumb: { width: 64, height: 48, objectFit: 'cover', borderRadius: 4, background: '#DDD6C6' },
};
