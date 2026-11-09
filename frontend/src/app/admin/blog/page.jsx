'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin';
import { assetUrl, formatDate } from '@/lib/api';

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  const load = () => adminFetch('/api/blog-posts').then(setPosts).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const doDelete = async (p) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    try {
      await adminFetch(`/api/blog-posts/${p.id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card__head">
        <h2>Blog Posts ({posts.length})</h2>
        <Link className="admin-btn admin-btn--primary" href="/admin/blog/new">+ New Post</Link>
      </div>
      <div className="admin-card__body">
        {error && <p style={{ color: 'var(--flag-red)', marginBottom: 12 }}>{error}</p>}
        {!posts.length ? (
          <p className="empty-state">No posts yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>Published</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.featured_image ? (
                      <img className="admin-thumb" src={assetUrl(p.featured_image)} alt="" />
                    ) : (
                      <span style={{ color: 'var(--line)' }}>—</span>
                    )}
                  </td>
                  <td><strong style={{ color: 'var(--alpine)' }}>{p.title}</strong></td>
                  <td data-label="Published">{p.published_at ? formatDate(p.published_at) : 'Not published'}</td>
                  <td>
                    <div className="admin-actions">
                      <Link className="admin-btn" href={`/blog/${p.slug}`} target="_blank">View</Link>
                      <Link className="admin-btn" href={`/admin/blog/${p.id}/edit`}>Edit</Link>
                      <button className="admin-btn admin-btn--danger" onClick={() => doDelete(p)}>Delete</button>
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