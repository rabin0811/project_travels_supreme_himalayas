import Link from 'next/link';
import Logo from './Logo';
import { API_URL_SERVER } from '@/lib/api';

export default async function Footer() {
  let settings = {};
  try {
    const res = await fetch(`${API_URL_SERVER}/api/settings`, { cache: 'no-store' });
    settings = await res.json();
  } catch {}

  const destinations = settings.footerDestinations || [];

  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-col" style={{ minWidth: 0 }}>
          <div className="footer-brand">
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Logo size={44} />
              <span className="brand-name">Trekking with Rabin</span>
            </Link>
          </div>
          <p className="footer-about">{settings.aboutIntro || 'Your local trekking partner in Nepal — personal treks, real adventure.'}</p>
          <p className="footer-about">
            {settings.contactEmail && <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>}<br />
            {settings.contactPhone && <a href={`tel:${settings.contactPhone && settings.contactPhone.replace(/\s/g, '')}`}>{settings.contactPhone}</a>}
          </p>
        </div>

        <div className="footer-col">
          <h4>Destinations</h4>
          <ul>
            <li><Link href="/destinations/nepal-trekking">Nepal Trekking</Link></li>
            <li><Link href="/destinations/nepal-tours">Nepal Tours</Link></li>
            <li><Link href="/destinations/peak-climbing">Peak Climbing</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/about#team">Our Team</Link></li>
            <li><Link href="/testimonials">Testimonials</Link></li>
<li><Link href="/blog">Blog &amp; Travel Guide</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
            <li><Link href="/admin/login">Admin Login</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Good to Know</h4>
          <ul>
            <li><Link href="/blog/best-time-to-trek-himalaya-month-guide">Trekking Seasons</Link></li>
            <li><Link href="/blog/everest-base-camp-packing-list">Packing List</Link></li>
            <li><Link href="/blog/nepal-visa-on-arrival-guide">Visa Guide</Link></li>
            <li><Link href="/packages">All Trips</Link></li>
            <li><Link href="/contact">Custom Trip Quote</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Booking Info</h4>
          <ul>
            <li>Inquiry-based booking</li>
            <li>Free cancellation up to 30 days</li>
            <li>Deposit: 20% to confirm</li>
            <li>Balance due 15 days before trip</li>
            <li><Link href="/contact">Payment via eSewa, Khalti &amp; cards</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Follow Us</h4>
          <ul>
            <li><a href={settings.instagramUrl || 'https://www.instagram.com/__ra_bin__/'} target="_blank" rel="noopener noreferrer">Instagram: @__ra_bin__</a></li>
            <li><a href={settings.facebookUrl || 'https://www.facebook.com/groups/615513139185784'} target="_blank" rel="noopener noreferrer">Facebook Group</a></li>
            <li><a href={`https://wa.me/${(settings.whatsappNumber || '+9779762342058').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp: {settings.contactPhone || '9762342058'}</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span>&copy; {new Date().getFullYear()} Trekking with Rabin. All rights reserved.</span>
          <span>Made with pride in Nepal &middot; <Link href="/admin/login">Staff Login</Link></span>
        </div>
      </div>
    </footer>
  );
}