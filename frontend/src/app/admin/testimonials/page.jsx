'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin';

const STATUSES = ['pending', 'approved', 'rejected'];
const emptyForm = () => ({ name: '', country: '', review: '', rating: 5, photo: '', package_id: '' });

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  const load = () =>
    Promise.all([
      adminFetch('/api/testimonials/admin'),
      adminFetch('/api/packages?limit=100').catch(() => ({ packages: [] })),
    ])
      .then(([reviews, pkgData]) => {
        setItems(reviews);
        setPackages(pkgData?.packages || []);
      })
      .catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const pending = items.filter((t) => t.status === 'pending').length;

  const submit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        name: form.name,
        country: form.country,
        review: form.review,
        rating: Number(form.rating),
        photo: form.photo,
        status: form.status || 'approved',
        package_id: form.package_id ? Number(form.package_id) : null,
      };
      if (editing) {
        await adminFetch(`/api/testimonials/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await adminFetch('/api/testimonials', { method: 'POST', body: JSON.stringify(body) });
      }
      setForm(emptyForm());
      setEditing(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const startEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name, country: t.country, review: t.review,
      rating: t.rating, photo: t.photo,
      package_id: t.package_id || '', status: t.status,
    });
  };

  const doDelete = async (t) => {
    if (!window.confirm(`Delete review by ${t.name}?`)) return;
    try {
      await adminFetch(`/api/testimonials/${t.id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const setStatus = async (t, status) => {
    try {
      await adminFetch(`/api/testimonials/${t.id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="admin-card" style={{ marginBottom: 18 }}>
        <div className="admin-card__head">
          <h2>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
          {editing && <span className="status-chip status-pending">{editing.status}</span>}
        </div>
        <div className="admin-card__body">
          <form className="admin-form" onSubmit={submit}>
            <div className="form-row">
              <div className="field">
                <label>Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Country</label>
                <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="e.g. United Kingdom" />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Rating (1–5)</label>
                <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} {'\u2605'.repeat(n)}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Package (optional)</label>
                <select value={form.package_id} onChange={(e) => setForm({ ...form, package_id: e.target.value })}>
                  <option value="">General / no package</option>
                  {packages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Status</label>
                <select value={form.status || 'approved'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Photo URL (optional)</label>
                <input value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} placeholder="/uploads/media/..." />
              </div>
            </div>
            <div className="field">
              <label>Review *</label>
              <textarea rows={4} required value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="admin-btn admin-btn--primary" type="submit">{editing ? 'Save Changes' : 'Add Testimonial'}</button>
              {editing && (
                <button className="admin-btn" type="button" onClick={() => { setEditing(null); setForm(emptyForm()); }}>Cancel</button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card__head">
          <h2>Testimonials ({items.length})</h2>
          {pending > 0 && <span className="status-chip status-new">{pending} pending approval</span>}
        </div>
        <div className="admin-card__body">
          {error && <p style={{ color: 'var(--flag-red)', marginBottom: 12 }}>{error}</p>}
          {!items.length ? (
            <p className="empty-state">No testimonials yet — public reviews land here for approval.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Country</th>
                  <th>Package</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id}>
                    <td data-label="Name"><strong style={{ color: 'var(--alpine)' }}>{t.name}</strong></td>
                    <td data-label="Country">{t.country || '—'}</td>
                    <td data-label="Package">{t.package_title || 'General'}</td>
                    <td data-label="Rating" style={{ color: 'var(--gold)' }}>{'\u2605'.repeat(t.rating)}</td>
                    <td data-label="Review" style={{ maxWidth: 320, fontSize: '0.85rem' }}>{t.review}</td>
                    <td data-label="Status"><span className={`status-chip status-${t.status}`}>{t.status}</span></td>
                    <td>
                      <div className="admin-actions">
                        <label className="show-check" title="Show this review on the website">
                          <input
                            type="checkbox"
                            checked={t.status === 'approved'}
                            onChange={(e) => setStatus(t, e.target.checked ? 'approved' : 'rejected')}
                          />
                          <span>Show on website</span>
                        </label>
                        <button className="admin-btn" onClick={() => startEdit(t)}>Edit</button>
                        <button className="admin-btn admin-btn--danger" onClick={() => doDelete(t)}>Delete</button>
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