import Link from 'next/link';
import { assetUrl, formatNpr, formatPrice } from '@/lib/api';

export default function PackageCard({ pkg }) {
  const img = pkg.gallery_images?.[0];
  return (
    <article className="pkg-card">
      <div className="pkg-card__media">
        {img && <img src={assetUrl(img)} alt={pkg.title} loading="lazy" />}
        <span className="pkg-card__cat">{pkg.categoryName || pkg.category_name}</span>
        <span className="pkg-card__price">{formatPrice(pkg.price)}</span>
      </div>
      <div className="pkg-card__body">
        <h3 className="pkg-card__title">
          <Link href={`/packages/${pkg.slug}`}>{pkg.title}</Link>
        </h3>
        <p className="pkg-card__npr">{formatNpr(pkg.price, pkg.price_npr)} <small>approx.</small></p>
        <div className="pkg-card__meta">
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3A5A8C" strokeWidth="2.4">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
            </svg>
            {pkg.duration}
          </span>
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3A5A8C" strokeWidth="2.4">
              <path d="M3 20h18M5 20V8l7-5 7 5v12" /><path d="M9 20v-6h6v6" />
            </svg>
            {pkg.grade}
          </span>
        </div>
        <p className="pkg-card__desc">{pkg.short_description}</p>
        <div className="pkg-card__foot">
          <Link className="btn btn--outline btn--sm" href={`/packages/${pkg.slug}`}>View Details</Link>
          <Link className="btn btn--primary btn--sm" href={`/book/${pkg.slug}`}>Book Now</Link>
        </div>
      </div>
    </article>
  );
}