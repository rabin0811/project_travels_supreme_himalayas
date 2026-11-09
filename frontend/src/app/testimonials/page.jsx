import Link from 'next/link';
import { API_URL_SERVER, assetUrl } from '@/lib/api';
import TestimonialsSubmit from '@/components/TestimonialsSubmit';

export const metadata = { title: 'Testimonials — Trekking with Rabin' };

async function fetchJson(path) {
  try {
    const res = await fetch(`${API_URL_SERVER}${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function TestimonialsPage() {
  let items = [];
  try {
    items = (await fetchJson('/api/testimonials')) || [];
  } catch {}

  const avg = items.length
    ? (items.reduce((a, t) => a + t.rating, 0) / items.length).toFixed(1)
    : null;

  return (
    <>
      <section className="section section--hero-inner">
        <div className="container">
          <span className="eyebrow">Traveller stories</span>
          <h1 className="page-title">Testimonials</h1>
          <p className="section-sub">
            Real reviews from real travellers who have trekked and travelled with us.
            {avg && <> Average rating: <strong>{avg}/5</strong> ({items.length} reviews).</>}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {items.length ? (
            <div className="grid-3">
              {items.map((t) => (
                <div key={t.id} className="t-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="t-stars">{'\u2605'.repeat(t.rating)}{'\u2606'.repeat(5 - t.rating)}</div>
                    {t.photo && <img src={assetUrl(t.photo)} alt="" className="avatar-circle" style={{ width: 44, height: 44 }} />}
                  </div>
                  <p className="t-quote">"{t.review}"</p>
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
            <p className="empty-state">Be the first to leave a review.</p>
          )}

          <div style={{ marginTop: 44, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
            <TestimonialsSubmit />
          </div>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: '0.9rem' }}>
            Remember a specific trip? You can also <Link href="/packages" style={{ color: 'var(--flag-red)' }}>review it on its trip page</Link>.
          </p>
        </div>
      </section>
    </>
  );
}