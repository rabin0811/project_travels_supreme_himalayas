import Link from 'next/link';
import { API_URL, API_URL_SERVER } from '@/lib/api';

async function fetchJson(path) {
  try {
    const res = await fetch(`${API_URL_SERVER}${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const data = await fetchJson(`/api/categories`);
  const cat = (data || []).find((c) => c.slug === params.slug);
  return { title: cat ? cat.name : 'Destinations' };
}

const CATEGORY_IMAGES = {
  'nepal-trekking': 'everest-base-camp',
  'nepal-tours': 'kathmandu-valley',
  bhutan: 'bhutan-paro',
  tibet: 'lhasa-tibet',
  india: 'ladakh-india',
  'peak-climbing': 'island-peak',
};

export default async function DestinationsPage() {
  const cats = (await fetchJson('/api/categories')) || [];
  return (
    <>
      <div className="detail-hero">
        <div className="hero-media"><img src={`${API_URL}/uploads/media/hero-everest.svg`} alt="" /></div>
        <div className="container detail-hero-inner">
          <p className="breadcrumb crumb-invert"><Link href="/">Home</Link><span className="sep">/</span>Destinations</p>
          <h1 style={{ color: '#fff' }}>Choose Your Destination</h1>
          <p style={{ color: 'var(--on-dark-soft)', maxWidth: 560 }}>Six corners of the Himalaya, one local team on the ground.</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="grid-4">
            {cats.map((c) => (
              <Link key={c.slug} className="dest-tile" href={`/destinations/${c.slug}`}>
                <img src={`${API_URL}/uploads/media/${CATEGORY_IMAGES[c.slug] || 'hero-everest'}.svg`} alt={c.name} loading="lazy" decoding="async" />
                <span>{c.name}<small>{c.package_count} {c.package_count === 1 ? 'trip' : 'trips'}</small></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}