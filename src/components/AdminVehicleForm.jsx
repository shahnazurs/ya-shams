import { useState } from 'react';

const blank = {
  name: '', type: '', seats: '', transmission: 'Manual',
  pricePerDay: '', description: '', images: '', available: true,
};

export default function AdminVehicleForm({ vehicle, onSave, onCancel }) {
  const [form, setForm] = useState(
    vehicle
      ? { ...vehicle, images: (vehicle.images || []).join('\n') }
      : blank
  );
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      seats: Number(form.seats) || 0,
      pricePerDay: Number(form.pricePerDay) || 0,
      images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    await onSave(payload);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div className="field-row">
        <div className="field">
          <label htmlFor="name">Vehicle name</label>
          <input id="name" required value={form.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="type">Type</label>
          <input id="type" required placeholder="Campervan, SUV, Jeep…" value={form.type} onChange={(e) => update('type', e.target.value)} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="seats">Seats</label>
          <input id="seats" type="number" min="1" required value={form.seats} onChange={(e) => update('seats', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="transmission">Transmission</label>
          <select id="transmission" value={form.transmission} onChange={(e) => update('transmission', e.target.value)}>
            <option>Manual</option>
            <option>Automatic</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="pricePerDay">Price per day (USD)</label>
        <input id="pricePerDay" type="number" min="0" required value={form.pricePerDay} onChange={(e) => update('pricePerDay', e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea id="description" required value={form.description} onChange={(e) => update('description', e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="images">Photo URLs (one per line)</label>
        <textarea
          id="images"
          placeholder={'https://example.com/van-1.jpg\nhttps://example.com/van-2.jpg'}
          value={form.images}
          onChange={(e) => update('images', e.target.value)}
        />
        <span style={{ fontSize: '0.8rem', color: '#5C5747' }}>
          Paste direct image links. For Google Drive photos, share the file as "Anyone with the
          link" and use a direct-view URL — see the README for the exact format.
        </span>
      </div>

      <div className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <input
          id="available"
          type="checkbox"
          style={{ width: 'auto' }}
          checked={!!form.available}
          onChange={(e) => update('available', e.target.checked)}
        />
        <label htmlFor="available" style={{ marginBottom: 0 }}>Listed as available</label>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button className="btn btn-accent" disabled={saving}>{saving ? 'Saving…' : 'Save vehicle'}</button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

const styles = {
  form: {
    background: 'var(--paper)', border: '1.5px solid var(--line)',
    borderRadius: 'var(--radius-m)', padding: 24, marginBottom: 24,
  },
};
