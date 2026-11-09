'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function TestimonialsSubmit() {
  const [form, setForm] = useState({ name: '', country: '', rating: 5, review: '' });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiFetch('/api/testimonials', { method: 'POST', body: JSON.stringify({ ...form, package_id: null }) });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="review-form" style={{ textAlign: 'center', padding: '34px 24px' }}>
        <h3 style={{ marginBottom: 8 }}>Thank you!</h3>
        <p style={{ fontSize: '0.92rem', color: 'var(--charcoal-soft)' }}>
          Your review was submitted and will be published on this page once our team approves it.
        </p>
      </div>
    );
  }

  return (
    <form className="review-form" onSubmit={submit}>
      <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>Travelled with us? Tell future travellers about it</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-soft)', marginBottom: 14 }}>
        Your review is saved in our database and published here once approved — travelled on a specific trip?
        You can also review it on the trip page.
      </p>
      {error && <p style={{ color: 'var(--flag-red)', fontSize: '0.88rem', marginBottom: 10 }}>{error}</p>}
      <div className="form-row">
        <div className="field">
          <label htmlFor="ts-name">Your name *</label>
          <input id="ts-name" required maxLength={120} value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="ts-country">Country</label>
          <input id="ts-country" maxLength={80} placeholder="e.g. Australia" value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </div>
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label>Rating *</label>
        <div className="review-stars">
          {[5, 4, 3, 2, 1].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} stars`}
              onClick={() => setForm({ ...form, rating: n })}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem',
                color: n <= form.rating ? 'var(--gold)' : 'var(--line-strong)', padding: '0 2px',
              }}
            >
              {'\u2605'}
            </button>
          ))}
        </div>
      </div>
      <div className="field" style={{ marginBottom: 14 }}>
        <label htmlFor="ts-review">Your review *</label>
        <textarea id="ts-review" rows={4} required maxLength={2000} placeholder="How was your trip / experience with us?"
          value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} />
      </div>
      <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? 'Submitting...' : 'Submit review'}</button>
    </form>
  );
}