'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin';
import { formatDate, formatPrice } from '@/lib/api';

const STATUSES = ['new', 'contacted', 'confirmed', 'closed'];
const PAYMENTS = ['unpaid', 'deposit_paid', 'paid'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    adminFetch(`/api/bookings${filter ? `?status=${filter}` : ''}`)
      .then(setBookings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const update = async (b, field, value) => {
    try {
      await adminFetch(`/api/bookings/${b.id}`, { method: 'PATCH', body: JSON.stringify({ [field]: value }) });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const doDelete = async (b) => {
    if (!window.confirm(`Delete booking ${b.booking_ref}?`)) return;
    try {
      await adminFetch(`/api/bookings/${b.id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const totals = bookings.reduce(
    (acc, b) => {
      if (b.status === 'new') acc.new++;
      if (b.status === 'confirmed') acc.confirmed++;
      return acc;
    },
    { new: 0, confirmed: 0 }
  );

  return (
    <>
      <div className="admin-grid admin-grid--3">
        <div className="stat"><div className="stat__label">All</div><div className="stat__value">{bookings.length}</div></div>
        <div className="stat"><div className="stat__label">Awaiting contact</div><div className="stat__value accent">{totals.new}</div></div>
        <div className="stat"><div className="stat__label">Confirmed</div><div className="stat__value">{totals.confirmed}</div></div>
      </div>

      <div className="admin-card">
        <div className="admin-card__head">
          <h2>Bookings & Inquiries</h2>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['', ...STATUSES].map((s) => (
              <button key={s || 'all'} className={`admin-btn ${filter === s ? 'admin-btn--primary' : ''}`} onClick={() => setFilter(s)}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>
        <div className="admin-card__body">
          {error && <p style={{ color: 'var(--flag-red)', marginBottom: 12 }}>{error}</p>}
          {loading ? (
            <p className="empty-state">Loading...</p>
          ) : !bookings.length ? (
            <p className="empty-state">No bookings yet — when travellers submit the booking form, they land here.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Customer</th>
                  <th>Package</th>
                  <th>Travel date</th>
                  <th>Pax</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td data-label="Ref"><strong>{b.booking_ref}</strong></td>
                    <td data-label="Customer">
                      {b.customer_name}<br />
                      <span style={{ fontSize: '0.75rem', color: 'var(--charcoal-soft)' }}>{b.email} · {b.phone} · {b.country}</span>
                      {b.special_requests && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--charcoal-soft)', marginTop: 2 }} title={b.special_requests}>"{b.special_requests.slice(0, 48)}..."</div>
                      )}
                    </td>
                    <td data-label="Package">{b.package_title || '—'}</td>
                    <td data-label="Travel date">{formatDate(b.travel_date)}</td>
                    <td data-label="Pax">{b.travelers_count}</td>
                    <td data-label="Status">
                      <select className="admin-btn" value={b.status} onChange={(e) => update(b, 'status', e.target.value)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td data-label="Payment">
                      <select className="admin-btn" value={b.payment_status} onChange={(e) => update(b, 'payment_status', e.target.value)}>
                        {PAYMENTS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn" onClick={() => window.open(`mailto:${b.email}?subject=Your Trekking with Rabin booking ${b.booking_ref}`, '_blank')}>
                          Email
                        </button>
                        <button className="admin-btn admin-btn--danger" onClick={() => doDelete(b)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}