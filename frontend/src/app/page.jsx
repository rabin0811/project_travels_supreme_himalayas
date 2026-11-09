import Link from 'next/link';
import { API_URL, API_URL_SERVER } from '@/lib/api';
import HeroSlider from '@/components/HeroSlider';
import TripSearchWidget from '@/components/TripSearchWidget';
import PackageCard from '@/components/PackageCard';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import WhatsAppFloat from '@/components/WhatsAppFloat';

async function fetchJson(path) {
  try {
    const res = await fetch(`${API_URL_SERVER}${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const imgUrl = (n) => `${API_URL}/uploads/media/${n}`;

const FEATURES = [
  { icon: '\u2696', title: 'Licensed Local Guides', text: 'Government-certified trek leaders who grew up on these trails.' },
  { icon: '\u2728', title: 'Best Price Guarantee', text: 'Transparent pricing on packages, permits and flights — no hidden costs.' },
  { icon: '\u2699', title: 'Safety First', text: 'Emergency oxygen, first-aid, satellite comms and evacuation insurance on every trip.' },
  { icon: '\u2764', title: 'Responsible Travel', text: 'We fund village schools, trail cleanups and porter gear with every booking.' },
  { icon: '\u26A1', title: '24/7 Support', text: 'Reach us on WhatsApp day or night, from booking to safe return home.' },
  { icon: '\u2B50', title: 'Flexible Dates', text: 'Private departures any day, guided group departures weekly in season.' },
];

const CATEGORY_IMAGES = {
  'nepal-trekking': 'everest-base-camp',
  'nepal-tours': 'kathmandu-valley',
  'peak-climbing': 'island-peak',
};

const MODES = [
  { title: 'Private Trips', text: 'Your dates, your pace — a dedicated guide and team.', img: imgUrl('annapurna-sunrise'), href: '/packages' },
  { title: 'Group Departures', text: 'Fixed dates with fellow travellers; the classic shared adventure.', img: imgUrl('hero-everest'), href: '/packages' },
  { title: 'Family Journeys', text: 'Gentle itineraries the kids will love — culture, food and warm nights.', img: imgUrl('kathmandu-durbar'), href: '/packages' },
  { title: 'Talk to an Expert', text: 'One of our trek leaders will call you back within 24 hours.', img: imgUrl('island-peak'), href: '/contact' },
];

export const metadata = { title: 'Home' };

export default async function HomePage() {
  const [settings, categories, listing, featuredData, testimonials] = await Promise.all([
    fetchJson('/api/settings'),
    fetchJson('/api/categories'),
    fetchJson('/api/packages?limit=4'),
    fetchJson('/api/packages?featured=1&limit=8'),
    fetchJson('/api/testimonials'),
  ]);

  const cats = categories || [];
  const destTiles = cats.map((c) => ({
    ...c,
    image: imgUrl(`${CATEGORY_IMAGES[c.slug] || 'hero-everest'}`),
  }));

  const bestSelling = listing?.packages || [];
  const featured = featuredData?.packages || [];
  const specials = featured.slice(3, 6).length ? featured.slice(3, 6) : featured.slice(0, 3);

  const heroSlides = [
    {
      eyebrow: 'Everest Region \u00b7 Kathmandu',
      title: settings?.heroTitle || "Let's Discover The World Together",
      subtitle:
        settings?.heroSubtitle ||
        'Personal trekking & travel experiences across Nepal \u2014 from high passes to jungles, culture to giant mountains.',
      image: '/uploads/media/hero-everest.svg',
      badges: settings?.trustBadges || 'TripAdvisor Travellers\u2019 Choice \u00b7 NTB Licensed \u00b7 4.9\u2605 from 1,200+ travellers',
    },
    {
      eyebrow: 'Annapurna \u00b7 Nepal',
      title: 'Ten Days to the Foot of the Gods',
      subtitle: 'The Annapurna Base Camp trek through forests, Gurung villages and the vast amphitheatre of the Himalaya.',
      image: '/uploads/media/hero-annapurna.svg',
      badges: 'Small groups \u00b7 Max 12 trekkers \u00b7 Guaranteed departures',
    },
    {
      eyebrow: 'Khumbu \u00b7 Nepal',
      title: 'Island Peak: Your First 6,000m',
      subtitle: 'Climb Imja Tse with certified IFMGA guides — the classic first step into Himalayan mountaineering.',
      image: '/uploads/media/hero-langtang.svg',
      badges: '2:1 climber-to-guide ratio \u00b7 All climbing gear included',
    },
  ];

  return (
    <>
      <HeroSlider slides={heroSlides} />
      <div className="container trip-search--hero">
        <TripSearchWidget categories={cats} />
      </div>

      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">Where to next</span>
            <h2 className="section-title">Choose Your Destination</h2>
          </div>
          <div className="dest-tiles">
            {destTiles.slice(0, 4).map((d) => (
              <Link key={d.slug} className="dest-tile" href={`/destinations/${d.slug}`}>
                <img src={d.image} alt={d.name} loading="lazy" />
                <span>
                  {d.name}
                  <small>{d.package_count || 0} {d.package_count === 1 ? 'trip' : 'trips'}</small>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="facet-divider" />
      <section className="section section--tint" id="trips">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">Most loved by trekkers</span>
            <h2 className="section-title">Best Selling Packages</h2>
            <p className="section-sub">Hand-picked classics refined over years of guiding — each one available as a private or group trip.</p>
          </div>
          <div className="grid-4">
            {bestSelling.map((p) => (
              <PackageCard key={p.id} pkg={p} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 34 }}>
            <Link className="btn btn--outline" href="/packages">View All Trips</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">Why trek with us</span>
            <h2 className="section-title">Travel with Confidence</h2>
            <p className="section-sub">Six promises on every single trip — from a 4-day cultural tour to a 6,000m summit.</p>
          </div>
          <div className="grid-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-card__icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="facet-divider" />
      <section className="section section--tint">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">Trips for all</span>
            <h2 className="section-title">Your Kind of Journey</h2>
          </div>
          <div className="grid-4">
            {MODES.map((m) => (
              <Link key={m.title} href={m.href} className="mode-card">
                <img src={m.img} alt={m.title} loading="lazy" />
                <div className="mode-card__body">
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">Handpicked</span>
            <h2 className="section-title">Special Packages</h2>
          </div>
          <div className="grid-3">
            {specials.map((p) => (
              <PackageCard key={p.id} pkg={p} />
            ))}
          </div>
        </div>
      </section>

      <div className="facet-divider" />
      <section className="section section--tint">
        <div className="container">
          <div className="csr-card">
            <div>
              <span className="eyebrow" style={{ color: '#8fd0d2' }}>Social Work</span>
              <h2>Travel That Gives Back</h2>
              <p>{settings?.csrText || 'Every booking funds our village schools, trail cleanup days and porter-equipment drives.'}</p>
              <div style={{ marginTop: 20 }}>
                <Link className="btn btn--ghost" href="/about">Our Mission</Link>
              </div>
            </div>
            <div className="csr-badge">
              <div><strong>3</strong><span>Village Schools</span></div>
              <div><strong>120+</strong><span>Porter Kits</span></div>
              <div><strong>9</strong><span>Trail Cleanups</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">Traveller stories</span>
            <h2 className="section-title">Trusted by Trekkers</h2>
            <p className="section-sub">
              Real reviews from real travellers. Travelled with us? Share your story on any{' '}
              <Link href="/packages" style={{ color: 'var(--flag-red)', textDecoration: 'underline' }}>trip page</Link>.
            </p>
          </div>
          <TestimonialCarousel items={testimonials || []} />
        </div>
      </section>

      <WhatsAppFloat number={settings?.whatsappNumber} />
    </>
  );
}