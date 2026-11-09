import Link from 'next/link';
import { API_URL, API_URL_SERVER, formatPrice } from '@/lib/api';
import PackageDetailClient from '@/components/PackageDetailClient';

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

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pkg = await fetchJson(`/api/packages/${slug}`);
  return { title: pkg ? pkg.title : 'Package' };
}

export default async function PackageDetailPage({ params }) {
  const { slug } = await params;
  const pkg = await fetchJson(`/api/packages/${slug}`);
  if (!pkg) {
    return (
      <div className="container empty-state" style={{ padding: '120px 0' }}>
        <h2>Package not found</h2>
        <p>The trip you are looking for may have been retired or moved.</p>
        <div style={{ marginTop: 20 }}>
          <Link className="btn btn--primary" href="/packages">Browse All Trips</Link>
        </div>
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
            <Link href={`/destinations/${pkg.category_slug || 'nepal-trekking'}`}>{pkg.category_name}</Link>
            <span className="sep">/</span>
            {pkg.title}
          </p>
          <h1>{pkg.title}</h1>
          <p style={{ color: 'var(--on-dark-soft)', maxWidth: 640 }}>{pkg.short_description}</p>
          <div className="detail-meta" style={{ marginTop: 16 }}>
            <span><strong>{pkg.duration}</strong> duration</span>
            <span><strong>{pkg.grade}</strong> grade</span>
            <span><strong>{formatPrice(pkg.price)}</strong> per person</span>
            <span><strong>{pkg.fixed_departure_dates?.filter((d) => d.available).length || 0}</strong> open departures</span>
          </div>
        </div>
      </div>
      <PackageDetailClient pkg={pkg} />
    </>
  );
}