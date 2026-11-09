import Link from 'next/link';
import { API_URL, API_URL_SERVER } from '@/lib/api';
import BookingForm from '@/components/BookingForm';

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

export default async function BookPage({ params }) {
  const { slug } = await params;
  const [pkg, packages] = await Promise.all([
    fetchJson(`/api/packages/${slug}`),
    fetchJson('/api/packages?limit=50'),
  ]);

  if (!pkg) {
    return (
      <div className="container empty-state" style={{ padding: '120px 0' }}>
        <h2>Package not found</h2>
        <Link className="btn btn--primary" style={{ marginTop: 16 }} href="/packages">Browse Trips</Link>
      </div>
    );
  }

  return (
    <>
      <div className="detail-hero">
        <div className="hero-media">
          {pkg.gallery_images?.[0] && <img src={`${API_URL}${pkg.gallery_images[0]}`} alt={pkg.title} />}
        </div>
        <div className="container detail-hero-inner">
          <p className="breadcrumb crumb-invert">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <Link href={`/packages/${pkg.slug}`}>{pkg.title}</Link>
            <span className="sep">/</span>
            Book
          </p>
          <h1 style={{ color: '#fff' }}>{pkg.title}</h1>
          <p style={{ color: 'var(--on-dark-soft)', maxWidth: 620 }}>Reserve your seats in under two minutes. No payment required to hold your inquiry.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <BookingForm pkg={pkg} />
        </div>
      </section>

      <section className="section section--tint" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Or pick another trip</span>
            <h2 className="section-title">More Adventures</h2>
          </div>
          <div className="grid-4">
            {(packages?.packages || [])
              .filter((p) => p.slug !== slug)
              .slice(0, 4)
              .map((p) => (
                <Link key={p.id} href={`/book/${p.slug}`} className="feature-card">
                  <h3 style={{ fontSize: '1rem' }}>{p.title}</h3>
                  <p style={{ fontSize: '0.85rem' }}>{p.duration} · {p.grade}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}