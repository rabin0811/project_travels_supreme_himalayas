import Link from 'next/link';
import { API_URL, API_URL_SERVER } from '@/lib/api';

const TEAM = [
  { name: 'Rabin', role: 'Founder & Trekking Guide', photo: 'R', bio: 'Your personal guide for every trip. Rabin grew up in the Nepali hills, knows the trails by heart and keeps each group small so the adventure stays personal.' },
  { name: 'Your Trusted Guides', role: 'Local, Certified Team', photo: 'T', bio: 'Certified, altitude-trained trekking guides and porters who grew up on these trails — fair wages, safety first, always.' },
];

const VALUES = [
  { icon: '\u26F3', title: 'Born on the Trail', text: 'We are trekkers first, guides second. Every itinerary is walked, tested and improved by our own boots between seasons.' },
  { icon: '\uD83D\uDE91', title: 'Safety Without Compromise', text: 'Certified guides, altitude-trained staff, emergency oxygen above 3,500m and evacuation insurance on every single trip.' },
  { icon: '\uD83C\uDFD5', title: 'Fair to the Hills', text: 'Above-average wages for guides and porters, kid education sponsorships, and trails that stay cleaner than we found them.' },
];

export const metadata = { title: 'About Us' };

export default async function AboutPage() {
  let settings = {};
  try {
    const res = await fetch(`${API_URL_SERVER}/api/settings`, { cache: 'no-store' });
    settings = await res.json();
  } catch {}

  return (
    <>
      <div className="detail-hero">
        <div className="hero-media"><img src={`${API_URL}/uploads/media/hero-langtang.svg`} alt="" /></div>
        <div className="container detail-hero-inner">
          <p className="breadcrumb crumb-invert"><Link href="/">Home</Link><span className="sep">/</span>About Us</p>
          <h1 style={{ color: '#fff' }}>About Trekking with Rabin</h1>
          <p style={{ color: 'var(--on-dark-soft)', maxWidth: 600 }}>Your local trekking partner in Nepal — personal treks, real adventure.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Our story</span>
            <h2 className="section-title">From Thamel to the top of the world</h2>
          </div>
          <div className="grid-2" style={{ gap: 40, alignItems: 'start' }}>
            <p>
              {settings.aboutIntro || 'Trekking with Rabin is a personal trekking company run by Rabin, a local Nepali guide. No big agency, no hand-offs — you trek with Rabin himself and his trusted local team. From Everest Base Camp and Annapurna to Langtang and Island Peak, every itinerary is walked, tested and improved by our own boots between seasons. Small groups, honest prices, and safety without compromise.'}
            </p>
            <div className="csr-badge">
              <div><strong>100%</strong><span>Local &amp; personal</span></div>
              <div><strong>12</strong><span>Max group size</span></div>
              <div><strong>24/7</strong><span>WhatsApp support</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="facet-divider" />
      <section className="section section--tint" id="team">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">The humans behind the trips</span>
            <h2 className="section-title">Our Team</h2>
          </div>
          <div className="grid-4">
            {TEAM.map((m) => (
              <div key={m.name} className="feature-card" style={{ textAlign: 'center' }}>
                <div className="t-avatar" style={{ width: 84, height: 84, fontSize: '1.8rem', margin: '0 auto 14px', borderRadius: '50%' }}>
                  {m.photo}
                </div>
                <h3 style={{ fontSize: '1rem' }}>{m.name}</h3>
                <p style={{ fontFamily: 'var(--display)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.72rem', color: 'var(--glacier)', marginBottom: 10 }}>
                  {m.role}
                </p>
                <p style={{ fontSize: '0.86rem' }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">What we stand for</span>
            <h2 className="section-title">Our Values</h2>
          </div>
          <div className="grid-3">
            {VALUES.map((v) => (
              <div key={v.title} className="feature-card">
                <div className="feature-card__icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="facet-divider" />
      <section className="section section--tint">
        <div className="container csr-card" style={{ maxWidth: 900, margin: '0 auto' }}>
          <div>
            <span className="eyebrow" style={{ color: '#8fd0d2' }}>Join us</span>
            <h2>Ready for the trail?</h2>
            <p>Every adventure starts with a conversation. Tell us your dates and dreams — a real guide, not a chatbot, will reply within 24 hours.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link className="btn btn--primary" href="/contact">Plan My Trip</Link>
            <p style={{ marginTop: 14, fontSize: '0.85rem' }}>{settings.contactEmail || 'rubhum2058@gmail.com'}</p>
          </div>
        </div>
      </section>
    </>
  );
}