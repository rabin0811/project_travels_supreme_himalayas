'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/admin';
import { slugify } from '@/lib/slugify';
import MediaPicker from './MediaPicker';

const emptyItinerary = () => ({ day: 1, title: '', description: '' });
const emptyItem = () => '';
const emptyDate = () => ({ date: '', price: '', available: true });

export default function PackageForm({ initial }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(() => ({
    title: '',
    slug: '',
    category_id: '',
    price: '',
    duration: '',
    grade: '',
    short_description: '',
    full_description: '',
    itinerary: [{ day: 1, title: '', description: '' }],
    includes: [''],
    excludes: [''],
    fixed_departure_dates: [],
    gallery_images: [],
    map_embed_url: '',
    route_points_text: '',
    status: 'draft',
    featured: false,
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/categories`, { cache: 'no-store' })
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
    if (initial) {
      setForm({
        ...initial,
        itinerary: (initial.itinerary || []).length ? initial.itinerary : [{ day: 1, title: '', description: '' }],
        includes: (initial.includes || []).length ? initial.includes : [''],
        excludes: (initial.excludes || []).length ? initial.excludes : [''],
        route_points_text: (initial.route_points || [])
          .map((p) => `${p.name || ''}${p.lat && p.lng ? `, ${p.lat}, ${p.lng}` : ''}`)
          .join('\n'),
      });
    }
  }, [initial]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const onTitle = (title) => {
    setForm({ ...form, title, slug: form.slug ? form.slug : slugify(title) });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const points = [];
    for (const line of (form.route_points_text || '').split('\n')) {
      const parts = line.split(',').map((s) => s.trim()).filter(Boolean);
      if (!parts.length) continue;
      if (parts.length !== 3 || !parts[1] || !parts[2] || Number.isNaN(Number(parts[1])) || Number.isNaN(Number(parts[2]))) {
        setError(`Route waypoints line "${line}" must be: Name, latitude, longitude — e.g. Lukla, 27.6879, 86.7314`);
        setSaving(false);
        return;
      }
      points.push({ name: parts[0], lat: Number(parts[1]), lng: Number(parts[2]) });
    }
    const payload = {
      ...form,
      category_id: form.category_id ? Number(form.category_id) : null,
      price: Number(form.price) || 0,
      itinerary: form.itinerary.filter((d) => d.title.trim()),
      includes: form.includes.filter((i) => i.trim()),
      excludes: form.excludes.filter((i) => i.trim()),
      fixed_departure_dates: form.fixed_departure_dates.filter((d) => d.date),
      route_points: points,
      route_points_text: undefined,
      featured: !!form.featured,
    };
    try {
      const res = initial
        ? await adminFetch(`/api/packages/${initial.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await adminFetch('/api/packages', { method: 'POST', body: JSON.stringify(payload) });
      router.push('/admin/packages');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      <div className="admin-card" style={{ marginBottom: 18 }}>
        <div className="admin-card__head"><h2>{initial ? 'Edit Package' : 'New Package'}</h2></div>
        <div className="admin-card__body">
          <div className="form-row">
            <div className="field">
              <label>Title *</label>
              <input required value={form.title} onChange={(e) => onTitle(e.target.value)} />
            </div>
            <div className="field">
              <label>Slug</label>
              <input value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} placeholder="auto-generated" />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Category *</label>
              <select required value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Price (USD)</label>
              <input type="number" min="0" step="10" value={form.price} onChange={(e) => set('price', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Duration</label>
              <input value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="e.g. 14 Days" />
            </div>
            <div className="field">
              <label>Grade</label>
              <select value={form.grade} onChange={(e) => set('grade', e.target.value)}>
                <option value="">Select grade</option>
                {['Easy', 'Easy-Moderate', 'Moderate', 'Challenging', 'Extreme'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Short description</label>
            <textarea rows={2} value={form.short_description} onChange={(e) => set('short_description', e.target.value)} />
          </div>
          <div className="field">
            <label>Full description</label>
            <textarea rows={7} value={form.full_description} onChange={(e) => set('full_description', e.target.value)} />
          </div>
          <div className="admin-status" style={{ gap: 18 }}>
            <label>
              <input
                type="radio"
                name="status"
                checked={form.status === 'draft'}
                onChange={() => set('status', 'draft')}
              /> Draft
            </label>
            <label>
              <input
                type="radio"
                name="status"
                checked={form.status === 'published'}
                onChange={() => set('status', 'published')}
              /> Published
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
              Featured (homepage)
            </label>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 18 }}>
        <div className="admin-card__head"><h2>Gallery</h2></div>
        <div className="admin-card__body">
          <MediaPicker value={form.gallery_images} onChange={(v) => set('gallery_images', v)} multiple />
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 18 }}>
        <div className="admin-card__head">
          <h2>Itinerary (day by day)</h2>
          <button type="button" className="admin-btn" onClick={() => set('itinerary', [...form.itinerary, emptyItinerary()])}>+ Add day</button>
        </div>
        <div className="admin-card__body">
          <div className="repeater">
            {form.itinerary.map((d, i) => (
              <div key={i} className="repeater-row repeater-row--itinerary">
                <input
                  type="number"
                  min="1"
                  value={d.day}
                  onChange={(e) => {
                    const itinerary = [...form.itinerary];
                    itinerary[i] = { ...d, day: Number(e.target.value) };
                    set('itinerary', itinerary);
                  }}
                />
                <input
                  placeholder="Day title"
                  value={d.title}
                  onChange={(e) => {
                    const itinerary = [...form.itinerary];
                    itinerary[i] = { ...d, title: e.target.value };
                    set('itinerary', itinerary);
                  }}
                />
                <textarea
                  rows={2}
                  placeholder="Description for this day"
                  value={d.description}
                  onChange={(e) => {
                    const itinerary = [...form.itinerary];
                    itinerary[i] = { ...d, description: e.target.value };
                    set('itinerary', itinerary);
                  }}
                />
                <button type="button" className="admin-btn admin-btn--danger" onClick={() => set('itinerary', form.itinerary.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 18 }}>
        <div className="admin-card__head">
          <h2>Includes & Excludes</h2>
        </div>
        <div className="admin-card__body">
          <h4>Included</h4>
          <div className="repeater" style={{ marginBottom: 18 }}>
            {form.includes.map((inc, i) => (
              <div key={i} className="repeater-row">
                <input
                  value={inc}
                  onChange={(e) => {
                    const includes = [...form.includes];
                    includes[i] = e.target.value;
                    set('includes', includes);
                  }}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  onClick={() => set('includes', form.includes.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="admin-btn" onClick={() => set('includes', [...form.includes, ''])}>+ Add included item</button>

          <h4>Excluded</h4>
          <div className="repeater">
            {form.excludes.map((exc, i) => (
              <div key={i} className="repeater-row">
                <input
                  value={exc}
                  onChange={(e) => {
                    const excludes = [...form.excludes];
                    excludes[i] = e.target.value;
                    set('excludes', excludes);
                  }}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  onClick={() => set('excludes', form.excludes.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="admin-btn" onClick={() => set('excludes', [...form.excludes, ''])}>+ Add excluded item</button>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 18 }}>
        <div className="admin-card__head">
          <h2>Fixed Departure Dates</h2>
          <button type="button" className="admin-btn" onClick={() => set('fixed_departure_dates', [...form.fixed_departure_dates, emptyDate()])}>+ Add date</button>
        </div>
        <div className="admin-card__body">
          <div className="repeater">
            {form.fixed_departure_dates.map((d, i) => (
              <div key={i} className="repeater-row repeater-row--date">
                <input
                  type="date"
                  value={d.date}
                  onChange={(e) => {
                    const list = [...form.fixed_departure_dates];
                    list[i] = { ...d, date: e.target.value };
                    set('fixed_departure_dates', list);
                  }}
                />
                <input
                  type="number"
                  placeholder="Price (empty = package price)"
                  value={d.price}
                  onChange={(e) => {
                    const list = [...form.fixed_departure_dates];
                    list[i] = { ...d, price: e.target.value };
                    set('fixed_departure_dates', list);
                  }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={d.available}
                    onChange={(e) => {
                      const list = [...form.fixed_departure_dates];
                      list[i] = { ...d, available: e.target.checked };
                      set('fixed_departure_dates', list);
                    }}
                  />
                  Open
                </label>
                <button type="button" className="admin-btn admin-btn--danger" onClick={() => set('fixed_departure_dates', form.fixed_departure_dates.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 18 }}>
        <div className="admin-card__head"><h2>Map</h2></div>
        <div className="admin-card__body">
          <div className="field">
            <label>Google Maps embed URL (optional fallback)</label>
            <input value={form.map_embed_url} onChange={(e) => set('map_embed_url', e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." />
          </div>
          <div className="field">
            <label>Route waypoints (name, latitude, longitude — one per line)</label>
            <textarea rows={5} value={form.route_points_text || ''} onChange={(e) => set('route_points_text', e.target.value)} placeholder={'Lukla, 27.6879, 86.7314\nPhakding, 27.7362, 86.7129\nNamche Bazaar, 27.8059, 86.7106'} />
            <p style={{ fontSize: '0.78rem', color: 'var(--charcoal-soft)', marginTop: 6 }}>
              The Map tab auto-finds and draws the travel route between these points in order. Get coordinates from Google
              Maps (right-click a place &gt; copy coordinates).
            </p>
          </div>
        </div>
      </div>

      {error && <p style={{ color: 'var(--flag-red)', marginBottom: 14 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="admin-btn admin-btn--primary" style={{ padding: '10px 26px' }} disabled={saving} type="submit">
          {saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Package'}
        </button>
        <a className="admin-btn" href="/admin/packages" style={{ padding: '10px 26px', textDecoration: 'none' }}>Cancel</a>
      </div>
    </form>
  );
}