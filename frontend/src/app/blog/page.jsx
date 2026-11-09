import Link from 'next/link';
import { API_URL, API_URL_SERVER, assetUrl, formatDate } from '@/lib/api';

async function fetchJson(path) {
  try {
    const res = await fetch(`${API_URL_SERVER}${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export const metadata = { title: 'Blog & Travel Guide' };

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const posts = (await fetchJson('/api/blog-posts')) || [];
  const [featured, ...rest] = posts;

  return (
    <>
      <div className="detail-hero">
        <div className="hero-media"><img src={`${API_URL}/uploads/media/blog-1.svg`} alt="" /></div>
        <div className="container detail-hero-inner">
          <p className="breadcrumb crumb-invert"><Link href="/">Home</Link><span className="sep">/</span>Blog</p>
          <h1 style={{ color: '#fff' }}>Blog & Travel Guide</h1>
          <p style={{ color: 'var(--on-dark-soft)', maxWidth: 560 }}>Packing lists, seasons, visas and field stories — written by the team who lives on these trails.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {featured ? (
            <Link className="blog-card" href={`/blog/${featured.slug}`} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', marginBottom: 40 }}>
              <div className="blog-card__media">
                <img src={assetUrl(featured.featured_image)} alt={featured.title} decoding="async" />
              </div>
              <div className="blog-card__body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span className="blog-card__date">{formatDate(featured.published_at || featured.created_at)}</span>
                <h3 style={{ fontSize: '1.4rem' }}>{featured.title}</h3>
                <p>{featured.excerpt || 'Read the full field guide from our leaders.'}</p>
                <span className="btn btn--primary btn--sm" style={{ alignSelf: 'flex-start', marginTop: 18 }}>Read Article</span>
              </div>
            </Link>
          ) : null}

          <div className="grid-3">
            {rest.map((p) => (
              <Link key={p.id} className="blog-card" href={`/blog/${p.slug}`}>
                <div className="blog-card__media">
                  {p.featured_image && <img src={assetUrl(p.featured_image)} alt={p.title} loading="lazy" decoding="async" />}
                </div>
                <div className="blog-card__body">
                  <span className="blog-card__date">{formatDate(p.published_at || p.created_at)}</span>
                  <h3>{p.title}</h3>
                  <p>{p.excerpt || 'Field notes from Trekking with Rabin.'}</p>
                  <span className="btn btn--outline btn--sm" style={{ marginTop: 14 }}>Read More</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}