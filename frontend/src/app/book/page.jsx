import Link from 'next/link';
import { API_URL, API_URL_SERVER, formatNpr, formatPrice } from '@/lib/api';

async function fetchJson(path) {
  try {
    const res = await fetch(`${API_URL_SERVER}${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export const dynamic = 'force-dynamic';

export default async function BookIndexPage() {
  const data = await fetchJson('/api/packages?limit=50');
  const packages = data?.packages || [];

  return (
    <>
      <div className="detail-hero">
        <div className="hero-media">
          <img src={`${API_URL}/uploads/media/hero-everest.svg`} alt="" />
        </div>
        <div className="container detail-hero-inner">
          <p className="breadcrumb crumb-invert"><Link href="/">Home</Link><span className="sep">/</span>Book a Trip</p>
          <h1 style={{ color: '#fff' }}>Book a Trip</h1>
          <p style={{ color: 'var(--on-dark-soft)', maxWidth: 560 }}>Choose your adventure, reserve your dates — inquiry only, no payment today.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="grid-3">
            {packages.map((p) => (
              <div key={p.id} className="pkg-card">
                <div className="pkg-card__media">
                  {p.gallery_images?.[0] && <img src={`${API_URL}${p.gallery_images[0]}`} alt={p.title} />}
                  <span className="pkg-card__price">{formatPrice(p.price)}</span>
                </div>
                <div className="pkg-card__body">
                  <h3 className="pkg-card__title"><Link href={`/packages/${p.slug}`}>{p.title}</Link></h3>
                  <p className="pkg-card__npr">{formatNpr(p.price, p.price_npr)} <small>approx.</small></p>
                  <div className="pkg-card__meta">
                    <span>{p.duration}</span>
                    <span>{p.grade}</span>
                  </div>
                  <p className="pkg-card__desc">{p.short_description}</p>
                  <div className="pkg-card__foot">
                    <Link className="btn btn--outline btn--sm" href={`/packages/${p.slug}`}>Details</Link>
                    <Link className="btn btn--primary btn--sm" href={`/book/${p.slug}`}>Book / Enquire</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}