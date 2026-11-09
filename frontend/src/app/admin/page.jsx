'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin';
import { formatDate } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminFetch('/api/admin/dashboard')
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="empty-state">{error}</div>;
  if (!stats) return <div className="empty-state">Loading dashboard...</div>;

  const statuses = { new: 'new', contacted: 'contacted', confirmed: 'confirmed', closed: 'closed' };

  return (
    <>
      <div className="admin-grid">
        <div className="stat">
          <div className="stat__label">Packages</div>
          <div className="stat__value">{stats.package_count}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--charcoal-soft)' }}>{stats.published_count} published · {stats.featured_count} featured</div>
        </div>
        <div className="stat">
          <div className="stat__label">New Inquiries</div>
          <div className="stat__value">{stats.inquiries_count}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--charcoal-soft)' }}>all time</div>
        </div>
        <div className="stat">
          <div className="stat__label">Bookings</div>
          <div className="stat__value accent">{stats.bookings_count}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--charcoal-soft)' }}>{stats.new_bookings_count} awaiting contact</div>
        </div>
        <div className="stat">
          <div className="stat__label">This Month</div>
          <div className="stat__value">{stats.bookings_this_month}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--charcoal-soft)' }}>new bookings</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card__head">
          <h2>Recent Bookings</h2>
          <Link className="admin-btn admin-btn--primary" href="/admin/bookings">View All</Link>
        </div>
        <div className="admin-card__body">
          {stats.recent_bookings?.length ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Customer</th>
                  <th>Package</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_bookings.map((b) => (
                  <tr key={b.id}>
<td data-label="Ref"><strong>{b.booking_ref}</strong></td>
                  <td data-label="Customer">{b.customer_name}<br /><span style={{ fontSize: '0.75rem', color: 'var(--charcoal-soft)' }}>{b.email}</span></td>
                  <td data-label="Package">{b.package_title || '-'}</td>
                  <td data-label="Status"><span className={`status-chip status-${b.status}`}>{b.status}</span></td>
                  <td data-label="Payment"><span className={`status-chip status-${b.payment_status || 'unpaid'}`}>{b.payment_status || 'unpaid'}</span></td>
                  <td data-label="Date">{formatDate(b.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">No bookings yet — they appear here the moment travellers submit the booking form.</p>
          )}
        </div>
      </div>

      <div className="admin-grid admin-grid--3" style={{ marginTop: 22 }}>
        <Link href="/admin/packages/new" className="stat" style={{ textDecoration: 'none', display: 'block' }}>
          <div className="stat__label">Quick actions</div>
          <div style={{ marginTop: 8, color: 'var(--glacier)' }}>+ Add a new package</div>
        </Link>
        <Link href="/admin/blog/new" className="stat" style={{ textDecoration: 'none', display: 'block' }}>
          <div className="stat__label">Content</div>
          <div style={{ marginTop: 8, color: 'var(--glacier)' }}>+ Write a blog post</div>
        </Link>
        <Link href="/admin/media" className="stat" style={{ textDecoration: 'none', display: 'block' }}>
          <div className="stat__label">Media</div>
          <div style={{ marginTop: 8, color: 'var(--glacier)' }}>Upload trip photos</div>
        </Link>
      </div>
    </>
  );
}