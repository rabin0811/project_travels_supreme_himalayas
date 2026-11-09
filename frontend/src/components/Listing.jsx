'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_URL } from '@/lib/api';
import PackageCard from '@/components/PackageCard';
import TripSearchWidget from '@/components/TripSearchWidget';

const GRADES = ['Easy', 'Easy-Moderate', 'Moderate', 'Challenging'];
const DURATIONS = [
  ['4', '1\u20134 days'],
  ['7', 'Up to 7 days'],
  ['10', 'Up to 10 days'],
  ['14', 'Up to 14 days'],
  ['99', '14+ days'],
];
const PRICES = [
  ['500', 'Under $500'],
  ['1000', '$500 \u2013 $1,000'],
  ['1500', '$1,000 \u2013 $1,500'],
  ['9999', '$1,500+'],
];

export default function TripList({ base = '/packages', sp = {}, title = 'All Trips & Packages', subtitle = '', heroImage }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp || {})) if (v) params.set(k, v);
    if (searchParams) {
      for (const key of ['q', 'duration_max', 'price_min', 'price_max', 'grade', 'sort']) {
        const v = searchParams.get(key);
        if (v) params.set(key, v);
      }
    }
    const page = searchParams?.get('page') || '1';
    params.set('page', page);
    params.set('limit', '9');
    return { params, page: parseInt(page, 10) || 1 };
  }, [searchParams, sp]);

  const [state, setState] = useState({ data: null, categories: [], loading: true, page: 1 });
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const { params, page } = buildQuery();
    let cancelled = false;
    Promise.all([
      fetch(`${API_URL}/api/packages?${params.toString()}`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API_URL}/api/categories`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([data, categories]) => {
        if (!cancelled) setState({ data, categories, loading: false, page });
      })
      .catch(() => {
        if (!cancelled) setState({ data: null, categories: [], loading: false, page });
      });
    return () => { cancelled = true; };
  }, [buildQuery]);

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    params.delete('page');
    router.push(`${base}?${params.toString()}`, { scroll: false });
  };

  const { data: resp, categories, loading, page } = state;
  const category = searchParams.get('category');
  const activeCategory = categories.find((c) => c.slug === category);
  const pageTitle = activeCategory ? `${activeCategory.name} Packages` : title;
  const basePath = base;

  return (
    <>
      <div className="detail-hero">
        <div className="hero-media">
          <img src={heroImage || `${API_URL}/uploads/media/hero-annapurna.svg`} alt="" />
        </div>
        <div className="container detail-hero-inner">
          <p className="breadcrumb crumb-invert">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <Link href="/destinations">Destinations</Link>
            <span className="sep">/</span>
            {activeCategory ? activeCategory.name : 'All Trips'}
          </p>
          <h1 style={{ color: '#fff' }}>{pageTitle}</h1>
          <p style={{ color: 'var(--on-dark-soft)', maxWidth: 620 }}>
            {subtitle || (activeCategory && `${activeCategory.name} — quality guided trips at transparent prices.`)}
          </p>
        </div>
      </div>

      <div className="container trip-search--hero" style={{ maxWidth: 980 }}>
        <TripSearchWidget categories={categories || []} compact />
      </div>

      <section className="section">
        <div className="container listing">
          <aside className={`filter-panel ${filtersOpen ? 'open' : ''}`}>
            <div className="filter-panel__head">
              <h3>Filter Trips</h3>
              <button className="filter-close" aria-label="Close filters" onClick={() => setFiltersOpen(false)}>{'\u2715'}</button>
            </div>
            <div className="filter-group">
              <Link className="btn btn--outline btn--sm btn--block" href={basePath}>Reset Filters</Link>
            </div>
            <div className="filter-group">
              <h4>Duration</h4>
              <div className="check-list">
                {DURATIONS.map(([v, label]) => (
                  <label key={v}>
                    <input
                      type="checkbox"
                      checked={searchParams.get('duration_max') === v}
                      onChange={() => setFilter('duration_max', searchParams.get('duration_max') === v ? '' : v)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <h4>Price (per person)</h4>
              <div className="check-list">
                {PRICES.map(([v, label]) => (
                  <label key={v}>
                    <input
                      type="checkbox"
                      checked={searchParams.get('price_max') === v}
                      onChange={() => setFilter('price_max', searchParams.get('price_max') === v ? '' : v)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <h4>Grade</h4>
              <div className="check-list">
                {GRADES.map((g) => (
                  <label key={g}>
                    <input
                      type="checkbox"
                      checked={searchParams.get('grade') === g}
                      onChange={() => setFilter('grade', searchParams.get('grade') === g ? '' : g)}
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
              <p style={{ fontSize: '0.9rem', color: 'var(--charcoal-soft)' }}>
                <strong style={{ color: 'var(--alpine)' }}>{loading ? '…' : resp?.total || 0}</strong> trips found
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn btn--outline btn--sm filter-toggle" onClick={() => setFiltersOpen(true)}>
                  {'\u2630'} Filters
                </button>
                <div className="field" style={{ marginBottom: 0, width: 220 }}>
                <select
                  value={searchParams.get('sort') || 'default'}
                  onChange={(e) => setFilter('sort', e.target.value === 'default' ? '' : e.target.value)}
                >
                  <option value="default">Sort: Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="duration">Duration: Short to Long</option>
                </select>
              </div>
              </div>
            </div>

            {loading ? (
              <p className="empty-state">Finding trips...</p>
            ) : resp?.packages?.length ? (
              <div className="grid-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {resp.packages.map((p) => (
                  <PackageCard key={p.id} pkg={p} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No trips match your filters</h3>
                <p>Try widening the duration or price range.</p>
                <div style={{ marginTop: 16 }}>
                  <Link className="btn btn--primary" href={basePath}>Show All Trips</Link>
                </div>
              </div>
            )}

            {resp && resp.pages > 1 && (
              <div className="pagination">
                {Array.from({ length: resp.pages }, (_, i) => i + 1).map((p) => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', p);
                  return (
                    <Link key={p} href={`${basePath}?${params.toString()}`}>{p}</Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}