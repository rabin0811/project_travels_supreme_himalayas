'use client';

import { useEffect, useState } from 'react';
import { apiFetch, assetUrl } from '@/lib/api';

export default function PackageReviews({ pkg }) {
  const pkgId = pkg?.id;
  const packageTitle = pkg?.title;
  const [reviews, setReviews] = useState(null);
  const [form, setForm] = useState({ name: '', country: '', rating: 5, review: '' });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    apiFetch(`/api/testimonials?package_id=${pkgId}`).then(setReviews).catch(() => setReviews([]));
  };
  useEffect(() => { load(); }, [pkgId]);

  const avg = reviews?.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiFetch('/api/testimonials', {
        method: 'POST',
        body: JSON.stringify({ ...form, package_id: pkgId }),
      });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="review-section">
      <div className="review-list">
        {reviews === null ? (
          <p className="empty-state">Loading reviews...</p>
        ) : reviews.length > 0 ? (
          <div style={{ display: 'grid', gap: 16 }}>
            {reviews.map((t) => (
              <div key={t.id} className="t-card" style={{ height: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div className="t-stars">{'\u2605'.repeat(t.rating)}{'\u2606'.repeat(5 - t.rating)}</div>
                  {t.photo && <img src={assetUrl(t.photo)} alt="" className="avatar-circle" style={{ width: 44, height: 44 }} />}
                </div>
                <p className="t-quote" style={{ marginTop: 10 }}>"{t.review}"</p>
                <div className="t-author">
                  <div className="t-avatar">{t.name.charAt(0)}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.country || 'Verified traveller'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">Be the first to review {packageTitle}.</p>
        )}
      </div>

      {!sent ? (
        <form className="review-form" onSubmit={submit}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>Travelled with us? Share your experience</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-soft)', marginBottom: 14 }}>
            Reviews appear on the website once our team approves them.
          </p>
          {error && <p style={{ color: 'var(--flag-red)', fontSize: '0.88rem', marginBottom: 10 }}>{error}</p>}
          <div className="form-row">
            <div className="field">
              <label htmlFor="rv-name">Your name *</label>
              <input id="rv-name" required maxLength={120} value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="rv-country">Country</label>
              <input id="rv-country" maxLength={80} placeholder="e.g. Germany" value={form.country}
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
                    fontSize: '1.6rem',
                    border: 'none',
                    background: 'none',
                    padding: '0 2px',
                    color: n <= form.rating ? 'var(--gold)' : 'var(--line)',
                    transition: 'color 0.15s',
                  }}
                >
                  {'\u2605'}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="rv-review">Your review *</label>
            <textarea id="rv-review" rows={4} required maxLength={2000} placeholder="How was the trip for you?"
              value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} />
          </div>
          <button className="btn btn--primary" disabled={busy}>
            {busy ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <div className="confirm-box" style={{ margin: '20px 0', maxWidth: '100%' }}>
          <div className="confirm-icon">{'\u2713'}</div>
          <h3>Thank you!</h3>
<p style={{ fontSize: '0.92rem', color: 'var(--charcoal-soft)' }}>
            Your review of <strong>{packageTitle}</strong> has been received. It will appear here once our team approves it.
          </p>
        </div>
      )}

      <style jsx>{`
        .review-section { display: grid; gap: 26px; }
        .review-form {
          background: var(--cloud);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow-sm);
        }
      `}</style>
    </div>
  );
}