'use client';

import { useEffect, useState } from 'react';
import { apiFetch, API_URL, getSettings } from '@/lib/api';

export default function ContactPage() {
  const [settings, setSettings] = useState({});
  const [trips, setTrips] = useState([]);
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', package_id: '', message: '' });

  useEffect(() => {
    getSettings().then(setSettings);
    apiFetch('/api/packages?limit=50')
      .then((d) => setTrips(d.packages || []))
      .catch(() => setTrips([]));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      await apiFetch('/api/inquiries', {
        method: 'POST',
        body: JSON.stringify({ ...form, package_id: form.package_id ? Number(form.package_id) : null }),
      });
      setStatus({ ok: 'Thanks! Your inquiry is on its way — we will reply within 24 hours.' });
      setForm({ name: '', email: '', phone: '', package_id: '', message: '' });
    } catch (err) {
      setStatus({ error: err.message });
    } finally {
      setSending(false);
    }
  };

  const contactEmail = settings.contactEmail || 'rubhum2058@gmail.com';
  const contactPhone = settings.contactPhone || '9762342058, 9808047141';
  const address = settings.address || 'Kathmandu, Nepal';

  return (
    <>
      <div className="detail-hero">
        <div className="hero-media">
          <img src={`${API_URL}/uploads/media/hero-annapurna.svg`} alt="" />
        </div>
        <div className="container detail-hero-inner">
          <p className="breadcrumb crumb-invert"><a href="/">Home</a><span className="sep">/</span>Contact</p>
          <h1 style={{ color: '#fff' }}>Contact & Quick Inquiry</h1>
          <p style={{ color: 'var(--on-dark-soft)', maxWidth: 560 }}>
            Questions about your request? Want a custom itinerary? A real human — usually a guide — replies within 24 hours.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container booking-shell">
          <div>
            <div className="section-head" style={{ marginBottom: 24 }}>
              <span className="eyebrow">Quick inquiry</span>
              <h2 className="section-title">Tell us about your trip</h2>
            </div>

            <form
              style={{
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                padding: 30,
                boxShadow: 'var(--shadow-sm)',
              }}
              onSubmit={submit}
            >
              <div className="form-row">
                <div className="field">
                  <label htmlFor="c-name">Your Name *</label>
                  <input id="c-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="c-email">Email *</label>
                  <input id="c-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="c-phone">Phone / WhatsApp</label>
                  <input id="c-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="c-trip">Interested in</label>
                  <select id="c-trip" value={form.package_id} onChange={(e) => setForm({ ...form, package_id: e.target.value })}>
                    <option value="">General inquiry</option>
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="c-msg">Message</label>
                <textarea
                  id="c-msg"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Travel dates, group size, budget, questions..."
                />
              </div>
              <button className="btn btn--primary" type="submit" disabled={sending}>
                {sending ? 'Sending...' : 'Send Inquiry'}
              </button>
              {status?.ok && (
                <p style={{ marginTop: 16, color: '#2e7d32', background: '#e4f5e4', borderRadius: 8, padding: '10px 14px', fontSize: '0.9rem' }}>
                  {status.ok}
                </p>
              )}
              {status?.error && (
                <p style={{ marginTop: 16, color: '#a93327', background: '#fbe9e7', borderRadius: 8, padding: '10px 14px', fontSize: '0.9rem' }}>
                  {status.error}
                </p>
              )}
            </form>
          </div>

          <aside className="summary-card" style={{ position: 'sticky' }}>
            <h3>Direct Contacts</h3>
            <div className="summary-row"><span>Email</span><span><a href={`mailto:${contactEmail}`}>{contactEmail}</a></span></div>
            <div className="summary-row"><span>Phone / WhatsApp</span><span>{contactPhone.split(',').map((n) => <a key={n} style={{ display: 'block' }} href={`tel:${n.replace(/\s/g, '')}`}>{n.trim()}</a>)}</span></div>
            <div className="summary-row"><span>Office</span><span>{address}</span></div>
            <div className="summary-row"><span>Hours</span><span>Sun\u2013Fri, 9:00\u201318:00 NPT</span></div>
            <div style={{ marginTop: 20 }}>
              <strong style={{ color: '#fff' }}>Prefer WhatsApp?</strong>
              <p style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: 6 }}>
                Message us anytime \u2014 we answer evenings and weekends too.
              </p>
            </div>
            <div className="topbar-social" style={{ marginTop: 16 }}>
              {settings.facebookUrl && <a href={settings.facebookUrl} style={{ color: 'var(--on-dark-soft)' }}>Facebook</a>}
              {settings.instagramUrl && <a href={settings.instagramUrl} style={{ color: 'var(--on-dark-soft)' }}>Instagram</a>}
              {settings.linkedinUrl && <a href={settings.linkedinUrl} style={{ color: 'var(--on-dark-soft)' }}>LinkedIn</a>}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}