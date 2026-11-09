'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin';

const FIELDS = [
  { key: 'site_name', label: 'Site name', hint: 'Shown in the browser tab and footer' },
  { key: 'tagline', label: 'Tagline', hint: 'Short brand line' },
  { key: 'hero_title', label: 'Hero title', hint: 'Big headline on the homepage' },
  { key: 'hero_subtitle', label: 'Hero subtitle' },
  { key: 'trust_badges', label: 'Trust badges', hint: 'Separate items with ·' },
  { key: 'contact_email', label: 'Contact email' },
  { key: 'contact_phone', label: 'Contact phone' },
  { key: 'whatsapp_number', label: 'WhatsApp number', hint: 'International format, e.g. +9779823477992' },
  { key: 'address', label: 'Office address' },
  { key: 'facebook_url', label: 'Facebook URL' },
  { key: 'linkedin_url', label: 'LinkedIn URL' },
  { key: 'instagram_url', label: 'Instagram URL' },
  { key: 'about_intro', label: 'About intro (homepage + about page)' },
  { key: 'csr_text', label: 'CSR / social work text' },
  { key: 'exchange_rate', label: 'USD to NPR exchange rate', hint: '1 USD = ? Nepali Rupees. Used to show prices in both currencies (default 134)' },
];

const emptyForm = () => Object.fromEntries(FIELDS.map((f) => [f.key, '']));

export default function AdminSettings() {
  const [form, setForm] = useState(emptyForm());
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [liveRate, setLiveRate] = useState(null);
  const [rateStatus, setRateStatus] = useState('');

  useEffect(() => {
    adminFetch('/api/settings')
      .then((s) => setForm((f) => ({ ...f, ...s })))
      .catch((e) => setError(e.message));
    adminFetch('/api/settings/live-rate')
      .then((lr) => setLiveRate(lr))
      .catch(() => setLiveRate(null));
  }, []);

  const useLiveRate = () => {
    if (!liveRate) return;
    setForm((f) => ({ ...f, exchange_rate: String(liveRate.rate) }));
    const d = liveRate.date ? new Date(liveRate.date).toLocaleDateString() : '';
    setRateStatus(`Live rate filled: 1 USD = रू ${liveRate.rate}${d ? ` (rates updated ${d})` : ''}. Click Save to apply it to all prices.`);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await adminFetch('/api/settings', { method: 'PUT', body: JSON.stringify(form) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      <div className="admin-card">
        <div className="admin-card__head"><h2>Site Settings</h2></div>
        <div className="admin-card__body">
          {error && <p style={{ color: 'var(--flag-red)', marginBottom: 12 }}>{error}</p>}
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {FIELDS.map((f) => (
              <div className="field" key={f.key}>
                <label>{f.label}</label>
                {f.key === 'exchange_rate' ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                    <button
                      type="button"
                      className="admin-btn"
                      disabled={!liveRate}
                      title={liveRate ? `Live rate from ${liveRate.source}` : 'Live rate unavailable — check the API log'}
                      onClick={useLiveRate}
                    >
                      {liveRate ? `Use live: रू ${liveRate.rate}` : 'Fetching live rate…'}
                    </button>
                  </div>
                ) : f.key === 'about_intro' || f.key === 'hero_subtitle' || f.key === 'csr_text' ? (
                  <textarea rows={3} value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                ) : (
                  <input value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                )}
                {rateStatus && f.key === 'exchange_rate' && (
                  <small style={{ display: 'block', color: '#2e7d32', fontSize: '0.75rem', marginTop: 4 }}>{rateStatus}</small>
                )}
                {f.hint && <small style={{ color: 'var(--charcoal-soft)', fontSize: '0.75rem' }}>{f.hint}</small>}
              </div>
            ))}
          </div>
          <button className="admin-btn admin-btn--primary" style={{ padding: '10px 28px' }} type="submit">
            {saved ? 'Saved ✓' : 'Save Settings'}
          </button>
        </div>
      </div>
    </form>
  );
}