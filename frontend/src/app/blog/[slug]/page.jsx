import Link from 'next/link';
import { API_URL_SERVER, assetUrl, formatDate } from '@/lib/api';

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
  const post = await fetchJson(`/api/blog-posts/${slug}`);
  return { title: post ? post.title : 'Post' };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await fetchJson(`/api/blog-posts/${slug}`);
  if (!post) {
    return (
      <div className="container empty-state" style={{ padding: '120px 0' }}>
        <h2>Article not found</h2>
        <Link className="btn btn--primary" style={{ marginTop: 16 }} href="/blog">Back to Blog</Link>
      </div>
    );
  }

  return (
    <>
      <div className="detail-hero">
        <div className="hero-media">
          {post.featured_image && <img src={assetUrl(post.featured_image)} alt={post.title} />}
        </div>
        <div className="container detail-hero-inner">
          <p className="breadcrumb crumb-invert">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <Link href="/blog">Blog</Link>
            <span className="sep">/</span>
            {post.title}
          </p>
          <h1 style={{ color: '#fff', maxWidth: 760 }}>{post.title}</h1>
          <p style={{ color: 'var(--on-dark-mute)', fontFamily: 'var(--display)', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.8rem', marginTop: 10 }}>
            {formatDate(post.published_at || post.created_at)} &middot; Trekking with Rabin Team
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div
            className="prose"
            style={{ '--heading-color': post.heading_color || undefined }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <div style={{ marginTop: 40 }}>
            <Link className="btn btn--outline" href="/blog">← All Articles</Link>
          </div>
        </div>
      </section>
    </>
  );
}