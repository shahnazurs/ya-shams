import { useState } from 'react';
import { api } from '../api';

const initial = { customerName: '', email: '', phone: '', startDate: '', endDate: '', notes: '' };

export default function BookingForm({ vehicle, onDone }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.phone.trim()) e.phone = 'Enter a phone number.';
    if (!form.startDate) e.startDate = 'Choose a start date.';
    if (!form.endDate) e.endDate = 'Choose an end date.';
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      e.endDate = 'End date must be after the start date.';
    }
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    setServerError('');
    try {
      await api.createBooking({
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        ...form,
      });
      setSubmitted(true);
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div>
        <p style={{ fontWeight: 600 }}>Request sent.</p>
        <p>
          Thanks, {form.customerName.split(' ')[0]} — we've received your request for the{' '}
          {vehicle.name}. We'll confirm availability by email at {form.email} within one
          business day.
        </p>
        <button className="btn btn-outline" onClick={onDone}>Close</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="customerName">Full name</label>
        <input
          id="customerName"
          value={form.customerName}
          onChange={(e) => update('customerName', e.target.value)}
          aria-invalid={!!errors.customerName}
        />
        {errors.customerName && <span className="field-error">{errors.customerName}</span>}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            aria-invalid={!!errors.email}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="startDate">Pick-up date</label>
          <input
            id="startDate"
            type="date"
            value={form.startDate}
            onChange={(e) => update('startDate', e.target.value)}
            aria-invalid={!!errors.startDate}
          />
          {errors.startDate && <span className="field-error">{errors.startDate}</span>}
        </div>
        <div className="field">
          <label htmlFor="endDate">Drop-off date</label>
          <input
            id="endDate"
            type="date"
            value={form.endDate}
            onChange={(e) => update('endDate', e.target.value)}
            aria-invalid={!!errors.endDate}
          />
          {errors.endDate && <span className="field-error">{errors.endDate}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Pick-up time, extra driver, child seat, etc."
        />
      </div>

      {serverError && <p className="field-error" style={{ marginBottom: 12 }}>{serverError}</p>}

      <button type="submit" className="btn btn-accent" disabled={submitting} style={{ width: '100%' }}>
        {submitting ? 'Sending…' : 'Send reservation request'}
      </button>
    </form>
  );
}
