'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin';
import { assetUrl, formatPrice } from '@/lib/api';

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    const q = new URLSearchParams({ page, limit: 12 });
    if (status) q.set('status', status);
    if (search) q.set('q', search);
    adminFetch(`/api/packages?${q.toString()}`)
      .then((d) => {
        setPackages(d.packages);
        setTotal(d.total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, status]);

  const doDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await adminFetch(`/api/packages/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card__head">
        <h2>Packages ({total})</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            placeholder="Search packages..."
            value={search}
            style={{ padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: '0.85rem' }}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
          <select
            value={status}
            style={{ padding: '6px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: '0.85rem' }}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <Link className="admin-btn admin-btn--primary" href="/admin/packages/new">+ New Package</Link>
        </div>
      </div>
      <div className="admin-card__body">
        {error && <p style={{ color: 'var(--flag-red)', marginBottom: 12 }}>{error}</p>}
        {loading ? (
          <p className="empty-state">Loading...</p>
        ) : packages.length === 0 ? (
          <p className="empty-state">No packages found. <Link href="/admin/packages/new" style={{ color: 'var(--glacier)' }}>Create your first one</Link>.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Featured</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.gallery_images?.[0] ? (
                      <img className="admin-thumb" src={assetUrl(p.gallery_images[0])} alt="" />
                    ) : (
                      <span style={{ color: 'var(--line)' }}>—</span>
                    )}
                  </td>
<td><strong style={{ color: 'var(--alpine)' }}>{p.title}</strong></td>
                  <td data-label="Category">{p.category_name || '-'}</td>
                  <td data-label="Price">{formatPrice(p.price)}</td>
                  <td data-label="Duration">{p.duration}</td>
                  <td data-label="Status"><span className={`status-chip status-${p.status}`}>{p.status}</span></td>
                  <td data-label="Featured">{p.featured ? '\u2605' : ''}</td>
                  <td>
                    <div className="admin-actions">
                      <Link className="admin-btn" href={`/packages/${p.slug}`} target="_blank">View</Link>
                      <Link className="admin-btn" href={`/admin/packages/${p.id}/edit`}>Edit</Link>
                      <button className="admin-btn admin-btn--danger" onClick={() => doDelete(p.id, p.title)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {total > 12 && (
          <div className="pagination">
            {Array.from({ length: Math.ceil(total / 12) }, (_, i) => i + 1).map((p) => (
              <button key={p} className={p === page ? 'active' : ''} style={p === page ? { background: 'var(--glacier)', color: '#fff' } : {}} onClick={() => setPage(p)}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}