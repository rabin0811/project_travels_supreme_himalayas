'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', parent_id: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  const load = () => adminFetch('/api/categories').then(setCategories).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await adminFetch(`/api/categories/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await adminFetch('/api/categories', { method: 'POST', body: JSON.stringify(form) });
      }
      setForm({ name: '', parent_id: '' });
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, parent_id: c.parent_id || '' });
  };

  const doDelete = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try {
      await adminFetch(`/api/categories/${c.id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="admin-card" style={{ marginBottom: 18 }}>
        <div className="admin-card__head">
          <h2>{editing ? `Edit: ${editing.name}` : 'New Category'}</h2>
        </div>
        <div className="admin-card__body">
          <form className="admin-form form-row" onSubmit={submit} style={{ gridTemplateColumns: '1fr 1fr auto', alignItems: 'end' }}>
            <div className="field">
              <label>Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Nepal Trekking" />
            </div>
            <div className="field">
              <label>Parent (optional)</label>
              <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}>
                <option value="">None (top level)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="admin-btn admin-btn--primary" type="submit">{editing ? 'Save' : 'Add Category'}</button>
              {editing && (
                <button className="admin-btn" type="button" onClick={() => { setEditing(null); setForm({ name: '', parent_id: '' }); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
          {error && <p style={{ color: 'var(--flag-red)', marginTop: 10 }}>{error}</p>}
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card__head"><h2>Categories ({categories.length})</h2></div>
        <div className="admin-card__body">
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Slug</th><th>Packages</th><th>Parent</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td data-label="Name"><strong style={{ color: 'var(--alpine)' }}>{c.name}</strong></td>
                  <td data-label="Slug"><code>{c.slug}</code></td>
                  <td data-label="Packages">{c.package_count}</td>
                  <td data-label="Parent">{categories.find((p) => p.id === c.parent_id)?.name || '—'}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn" onClick={() => startEdit(c)}>Edit</button>
                      <button className="admin-btn admin-btn--danger" onClick={() => doDelete(c)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}