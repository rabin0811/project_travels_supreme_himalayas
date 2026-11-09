'use client';

import Link from 'next/link';
import { useState } from 'react';
import { assetUrl, formatDate, formatNpr, formatPrice } from '@/lib/api';
import PackageReviews from '@/components/PackageReviews';
import RouteMap from '@/components/RouteMap';

const TABS = ['Overview', 'Itinerary', 'Includes / Excludes', 'Map', 'Dates', 'Reviews', 'FAQ'];

export default function PackageDetailClient({ pkg }) {
  const [tab, setTab] = useState('Overview');
  const [lightbox, setLightbox] = useState(null);
  const gallery = pkg.gallery_images || [];
  const dates = pkg.fixed_departure_dates || [];
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [departureDate, setDepartureDate] = useState('');

  const nprRate = pkg.price_npr && Number(pkg.price) > 0 ? pkg.price_npr / Number(pkg.price) : null;
  const nprOf = (usd) => (nprRate ? Math.round(Number(usd) * nprRate) : undefined);

  const faq = [
    { q: `How fit do I need to be for ${pkg.title}?`, a: 'A good level of everyday fitness is enough for most days. You will be walking 4–7 hours, so any consistent training in the months before the trip will make it noticeably more enjoyable.' },
    { q: 'What happens if I cannot make the departure date?', a: 'Dates can be moved free of charge up to 30 days before departure. Every booking is an inquiry until confirmed by our team — no money is charged at inquiry time.' },
    { q: 'Do you organise flights and insurance?', a: 'We can organise domestic flights (including Lukla) and recommend insurance that covers high altitude treks. Travel insurance is mandatory on all treks.' },
  ];

  return (
    <>
      <div className="section" style={{ paddingBottom: 30 }}>
        <div className="container">
          {gallery.length > 0 && (
            <div className="gallery">
              <div className="g-main" onClick={() => setLightbox(gallery[0])}>
                <img src={assetUrl(gallery[0])} alt={pkg.title} />
              </div>
              {gallery.slice(1, 3).map((g, i) => (
                <div key={i} className="g-thumb" onClick={() => setLightbox(gallery[i + 1])}>
                  <img src={assetUrl(g)} alt={`${pkg.title} ${i + 2}`} />
                </div>
              ))}
            </div>
          )}

          <div className="tabs">
            {TABS.map((t) => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="tab-panel">
          {tab === 'Overview' && (
            <div className="grid-2" style={{ gap: 34, alignItems: 'start' }}>
              <div>
                <h2 className="section-title" style={{ fontSize: '1.3rem' }}>Trip Overview</h2>
                <p>{pkg.full_description}</p>
                <h3 style={{ marginTop: 22, fontSize: '1.1rem' }}>Short description</h3>
                <p style={{ color: 'var(--charcoal-soft)' }}>{pkg.short_description}</p>
              </div>
              <aside className="booking-widget">
                <div className="booking-widget__price">
                  <div>
                    <strong className="amount">{formatPrice(pkg.price)}</strong>
                    <span className="amount-npr">{formatNpr(pkg.price, pkg.price_npr)}</span>
                  </div>
                  <span className="tag" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>{pkg.grade}</span>
                </div>
                <div className="booking-widget__body">
                  <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-soft)', marginBottom: 10 }}>
                    Select a fixed departure, or pick your own date.
                  </p>
                  {dates.length > 0 && (
                    <div className="departure-list">
                      {dates.map((d, i) => (
                        <button
                          key={i}
                          type="button"
                          disabled={!d.available}
                          className={`departure-item ${departureDate === d.date ? 'selected' : ''} ${!d.available ? 'sold' : ''}`}
                          style={departureDate === d.date ? { borderColor: 'var(--flag-red)' } : {}}
                          onClick={() => {
                            setDepartureDate(d.date);
                            setTab('Dates');
                          }}
                        >
                          <span className="d-date">{formatDate(d.date)}</span>
                          <span className="d-price">
                            {formatPrice(d.price || pkg.price)}
                            <small className="d-price-npr">{formatNpr(d.price || pkg.price, nprOf(d.price || pkg.price))}</small>
                          </span>
                          <span className="d-status">{d.available ? 'Open' : 'Full'}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <Link className="btn btn--primary btn--block" href={`/book/${pkg.slug}`}>
                    Book Now / Enquire
                  </Link>
                  <p style={{ fontSize: '0.78rem', color: 'var(--charcoal-soft)', marginTop: 12, textAlign: 'center' }}>
                    Inquiry in minutes \u00b7 No payment required to reserve dates
                  </p>
                  <Link className="btn btn--outline btn--block" style={{ marginTop: 10 }} href="/contact">
                    Ask us anything
                  </Link>
                </div>
              </aside>
            </div>
          )}

          {tab === 'Itinerary' && (
            <div style={{ maxWidth: 800 }}>
              <h2 className="section-title" style={{ fontSize: '1.3rem' }}>Day-by-Day Itinerary</h2>
              <div className="itinerary">
                {(pkg.itinerary || []).map((d) => (
                  <div key={d.day} className="itinerary-day">
                    <h4><span>Day {d.day}</span>{d.title}</h4>
                    <p>{d.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Includes / Excludes' && (
            <div className="grid-2" style={{ gap: 40 }}>
              <div>
                <h2 className="section-title" style={{ fontSize: '1.3rem' }}>What's Included</h2>
                <ul className="list-check">
                  {(pkg.includes || []).map((i, idx) => (
                    <li key={idx}><span className="ok">\u2713</span>{i}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="section-title" style={{ fontSize: '1.3rem' }}>What's Not Included</h2>
                <ul className="list-check">
                  {(pkg.excludes || []).map((i, idx) => (
                    <li key={idx}><span className="no">\u2715</span>{i}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === 'Map' && (
            <div>
              {pkg.route_points?.length ? (
                <RouteMap points={pkg.route_points} />
              ) : pkg.map_embed_url ? (
                <iframe
                  src={pkg.map_embed_url}
                  style={{ width: '100%', height: 480, border: 0, borderRadius: 10 }}
                  loading="lazy"
                  title="Trip map"
                />
              ) : (
                <p className="empty-state">Map coming soon — every trip includes a detailed route map and elevation profile on arrival.</p>
              )}
            </div>
          )}

          {tab === 'Dates' && (
            <div style={{ maxWidth: 640 }}>
              <h2 className="section-title" style={{ fontSize: '1.3rem' }}>Fixed Departures</h2>
              {dates.length ? (
                <div className="departure-list">
                  {dates.map((d, i) => (
                    <div key={i} className={`departure-item ${!d.available ? 'sold' : ''}`}>
                      <span className="d-date">{formatDate(d.date)}</span>
                      <span className="d-price">
                        {formatPrice(d.price || pkg.price)}
                        <small className="d-price-npr">{formatNpr(d.price || pkg.price, nprOf(d.price || pkg.price))}</small>
                      </span>
                      <span className="d-status">{d.available ? 'Available' : 'Full'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">Any date you choose works for a private departure. Ask us for availability.</p>
              )}
              <p style={{ fontSize: '0.88rem', color: 'var(--charcoal-soft)', marginTop: 14 }}>
                Too many people want the same week? Not these dates? We run every trip as a private departure on any date.
              </p>
            </div>
          )}

          {tab === 'Reviews' && (
            <PackageReviews pkg={pkg} />
          )}

          {tab === 'FAQ' && (
            <div style={{ maxWidth: 720 }}>
              <h2 className="section-title" style={{ fontSize: '1.3rem' }}>Frequently Asked Questions</h2>
              {faq.map((f, i) => (
                <div key={i} style={{ borderBottom: '1px solid var(--line)', padding: '16px 0' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: 6 }}>{f.q}</h4>
                  <p style={{ fontSize: '0.92rem', color: 'var(--charcoal-soft)' }}>{f.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {(pkg.related || []).length > 0 && (
          <>
            <div className="facet-divider" style={{ marginTop: 30 }} />
            <div className="section" style={{ padding: '56px 0 70px' }}>
              <div className="section-head">
                <span className="eyebrow">You may also like</span>
                <h2 className="section-title">Related Packages</h2>
              </div>
              <div className="grid-3">
                {pkg.related.slice(0, 3).map((r) => (
                  <article key={r.id} className="pkg-card">
                    <div className="pkg-card__media">
                      {r.gallery_images?.[0] && (
                        <img src={assetUrl(r.gallery_images[0])} alt={r.title} loading="lazy" />
                      )}
                      <span className="pkg-card__price">{formatPrice(r.price)}</span>
                    </div>
                    <div className="pkg-card__body">
                      <h3 className="pkg-card__title"><Link href={`/packages/${r.slug}`}>{r.title}</Link></h3>
                      <p className="pkg-card__npr">{formatNpr(r.price, r.price_npr)} <small>approx.</small></p>
                      <div className="pkg-card__meta">
                        <span>{r.duration}</span><span>{r.grade}</span>
                      </div>
                      <div className="pkg-card__foot">
                        <Link className="btn btn--outline btn--sm" href={`/packages/${r.slug}`}>View</Link>
                        <Link className="btn btn--primary btn--sm" href={`/book/${r.slug}`}>Book</Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {lightbox && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(10, 44, 45, 0.92)',
            display: 'grid', placeItems: 'center', cursor: 'zoom-out',
          }}
          onClick={() => setLightbox(null)}
        >
          <img src={assetUrl(lightbox)} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }} />
        </div>
      )}
    </>
  );
}