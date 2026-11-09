'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch, formatDate, formatNpr, formatPrice, TODAY } from '@/lib/api';

export default function BookingForm({ pkg }) {
  const router = useRouter();
  const dates = pkg.fixed_departure_dates || [];
  const [form, setForm] = useState({
    customer_name: '',
    email: '',
    phone: '',
    country: '',
    travel_date: '',
    travelers_count: 1,
    special_requests: '',
  });
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const nprRate = pkg.price_npr && Number(pkg.price) > 0 ? pkg.price_npr / Number(pkg.price) : null;
  const nprOf = (usd) => (nprRate ? Math.round(Number(usd) * nprRate) : undefined);

  const selectDate = (d) => setForm({ ...form, travel_date: d.date });

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const booking = await apiFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({ ...form, package_id: pkg.id }),
      });
      localStorage.setItem('sh_last_booking', JSON.stringify({ ...booking, package_title: pkg.title, price: pkg.price }));
      router.push('/book/confirmed');
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  const unitPrice = Number(pkg.price);
  const total = unitPrice * (form.travelers_count || 1);

  return (
    <div className="booking-shell">
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
        <div className="section-head" style={{ marginBottom: 24 }}>
          <span className="eyebrow">Reserve your dates</span>
          <h2 className="section-title">Booking Details</h2>
          <p className="section-sub" style={{ fontSize: '0.9rem' }}>
            Phase 1: this reserves your seat as an inquiry. Our team confirms within 24 hours — no payment is taken here.
          </p>
        </div>

        {dates.length > 0 && (
          <div className="field">
            <label>Fixed departures (tap to select)</label>
            <div className="departure-list">
              {dates.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  className={`departure-item ${!d.available ? 'sold' : ''} ${form.travel_date === d.date ? 'selected' : ''}`}
                  style={form.travel_date === d.date ? { borderColor: 'var(--flag-red)' } : {}}
                  disabled={!d.available}
                  onClick={() => selectDate(d)}
                >
                  <span className="d-date">{formatDate(d.date)}</span>
                  <span className="d-price">
                    {formatPrice(d.price || pkg.price)}
                    <small className="d-price-npr">{formatNpr(d.price || pkg.price, nprOf(d.price || pkg.price))}</small>
                  </span>
                  <span className="d-status">{d.available ? 'Open' : 'Full'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="field">
          <label htmlFor="bk-date">Travel Date {dates.length ? '(or your own)' : '*'}</label>
          <input
            id="bk-date"
            type="date"
            required
            min={TODAY}
            value={form.travel_date}
            onChange={(e) => setForm({ ...form, travel_date: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="bk-name">Full Name *</label>
            <input id="bk-name" required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="bk-country">Country *</label>
            <input id="bk-country" required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="bk-email">Email *</label>
            <input id="bk-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="bk-phone">Phone / WhatsApp *</label>
            <input id="bk-phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>

        <div className="field" style={{ maxWidth: 200 }}>
          <label htmlFor="bk-travelers">Travellers</label>
          <select
            id="bk-travelers"
            value={form.travelers_count}
            onChange={(e) => setForm({ ...form, travelers_count: Number(e.target.value) })}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="bk-req">Special Requests</label>
          <textarea
            id="bk-req"
            rows={4}
            value={form.special_requests}
            onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
            placeholder="Dietary needs, hotel nights in Kathmandu, airport pickup, room sharing..."
          />
        </div>

        {error && (
          <p style={{ marginBottom: 16, color: '#a93327', background: '#fbe9e7', borderRadius: 8, padding: '10px 14px', fontSize: '0.9rem' }}>
            {error}
          </p>
        )}

        <button className="btn btn--primary btn--block" type="submit" disabled={sending}>
          {sending ? 'Sending...' : 'Submit Booking Inquiry'}
        </button>
      </form>

      <aside className="summary-card">
        <h3>Your Trip Summary</h3>
        <div className="summary-row"><span>Trip</span><span>{pkg.title}</span></div>
        <div className="summary-row"><span>Duration</span><span>{pkg.duration}</span></div>
        <div className="summary-row"><span>Grade</span><span>{pkg.grade}</span></div>
        <div className="summary-row"><span>Price / person</span><span>{formatPrice(pkg.price)} <small className="summary-npr">({formatNpr(pkg.price, pkg.price_npr)})</small></span></div>
        <div className="summary-row"><span>Travellers</span><span>{form.travelers_count}</span></div>
        <div className="summary-row total" style={{ marginTop: 8 }}>
          <span>Estimated total</span>
          <span>{formatPrice(total)} <small className="summary-npr">({formatNpr(total, nprOf(total))})</small></span>
        </div>
        <div className="note-payment" style={{ marginTop: 18, background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--on-dark-soft)' }}>
          <strong>No payment today.</strong> This is an inquiry with a reference number. A quick deposit link (eSewa, Khalti or card) follows once your dates are confirmed.
        </div>
      </aside>
    </div>
  );
}