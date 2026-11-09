'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin';
import { formatDate } from '@/lib/api';

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [error, setError] = useState(null);

  const load = () => adminFetch('/api/inquiries').then(setInquiries).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const doDelete = async (i) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try {
      await adminFetch(`/api/inquiries/${i.id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card__head"><h2>Contact Form Inquiries ({inquiries.length})</h2></div>
      <div className="admin-card__body">
        {error && <p style={{ color: 'var(--flag-red)', marginBottom: 12 }}>{error}</p>}
        {!inquiries.length ? (
          <p className="empty-state">No quick inquiries yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Received</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Interested in</th>
                <th>Message</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((i) => (
                <tr key={i.id}>
                  <td data-label="Received">{formatDate(i.created_at)}</td>
                  <td data-label="Name"><strong>{i.name}</strong></td>
                  <td data-label="Contact" style={{ fontSize: '0.82rem' }}>{i.email}{i.phone ? <><br />{i.phone}</> : null}</td>
                  <td data-label="Interested in">{i.package_title || 'General'}</td>
                  <td data-label="Message" style={{ maxWidth: 260, fontSize: '0.85rem' }}>{i.message || '—'}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn" onClick={() => window.open(`mailto:${i.email}`, '_blank')}>Reply</button>
                      <button className="admin-btn admin-btn--danger" onClick={() => doDelete(i)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}