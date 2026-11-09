'use client';

import { useEffect, useRef, useState } from 'react';

export default function MediaPicker({ value = [], onChange, multiple = true }) {
  const [media, setMedia] = useState([]);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const picked = Array.isArray(value) ? value : [];

  const load = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/media`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('sh_admin_token')}` },
      cache: 'no-store',
    })
      .then((r) => (r.ok ? r.json() : []))
      .then(setMedia)
      .catch(() => setMedia([]));
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async (files) => {
    setBusy(true);
    try {
      const fd = new FormData();
      for (const f of files) fd.append('files', f);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/media`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('sh_admin_token')}` },
        body: fd,
      });
      const uploaded = await res.json();
      if (!res.ok) throw new Error(uploaded.error || 'Upload failed');
      load();
      if (multiple) {
        onChange([...picked, ...uploaded.map((u) => u.url)]);
      } else if (uploaded[0]) {
        onChange([uploaded[0].url]);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const toggle = (url) => {
    if (!multiple) {
      onChange([url]);
      return;
    }
    onChange(picked.includes(url) ? picked.filter((u) => u !== url) : [...picked, url]);
  };

  return (
    <div>
      {picked.length > 0 && (
        <div className="media-picker-tray">
          {picked.map((u) => (
            <img
              key={u}
              src={u.startsWith('http') ? u : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${u}`}
              alt=""
              className="picked"
              onClick={() => toggle(u)}
              title="Click to remove"
            />
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <button type="button" className="admin-btn" onClick={() => setShow(!show)}>
          {show ? 'Hide library' : 'Choose from library'}
        </button>
        <button
          type="button"
          className="admin-btn"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? 'Uploading...' : 'Upload images'}
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => upload(Array.from(e.target.files || []))}
        />
      </div>
      {show && (
        <div className="media-grid" style={{ marginTop: 12 }}>
          {media.map((m) => (
            <div
              key={m.url}
              className={`media-item ${picked.includes(m.url) ? 'selected' : ''}`}
              onClick={() => toggle(m.url)}
              style={{ cursor: 'pointer' }}
            >
              <img src={m.url.startsWith('http') ? m.url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${m.url}`} alt={m.name} />
              <div className="filename">{m.name}</div>
            </div>
          ))}
          {!media.length && <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-soft)' }}>Library empty — upload some photos first.</p>}
        </div>
      )}
    </div>
  );
}