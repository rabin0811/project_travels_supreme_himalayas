'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { getSettings } from '@/lib/api';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Trips', href: '/packages' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [settings, setSettings] = useState({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-left">
            {settings.contact_email && (
              <a href={`mailto:${settings.contactEmail}`}>✉ {settings.contactEmail}</a>
            )}
            {settings.contactPhone && <a href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}>☎ {settings.contactPhone}</a>}
          </div>
          <div className="topbar-social">
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noreferrer">Facebook</a>
            )}
            {settings.linkedinUrl && (
              <a href={settings.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
            )}
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
            )}
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand" onClick={() => setOpen(false)}>
            <Logo size={46} />
            <span>
              <span className="brand-name">Trekking with Rabin</span>
              <div className="brand-tag">Personal treks &middot; Nepal</div>
            </span>
          </Link>

          <nav className={`main-nav ${open ? 'open' : ''}`}>
            <ul>
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} onClick={() => setOpen(false)}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-cta">
            <ThemeToggle />
            <Link href="/book" className="btn btn--primary btn--sm">Book Now</Link>
            <button
              className="nav-toggle"
              aria-label="Toggle menu"
              onClick={() => setOpen(!open)}
            >
              {open ? '\u2715' : '\u2630'}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}