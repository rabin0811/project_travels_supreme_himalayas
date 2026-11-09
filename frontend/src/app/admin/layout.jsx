'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearToken, getToken, getUser } from '@/lib/admin';
import Logo from '@/components/Logo';
import './admin.css';

const MENU = [
  { href: '/admin', label: 'Dashboard', icon: '\u2296' },
  { href: '/admin/packages', label: 'Packages', icon: '\u2630' },
  { href: '/admin/categories', label: 'Categories', icon: '\u221A' },
  { href: '/admin/bookings', label: 'Bookings', icon: '\u2713' },
  { href: '/admin/inquiries', label: 'Inquiries', icon: '\u2709' },
  { href: '/admin/blog', label: 'Blog', icon: '\u2637' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: '\u2605' },
  { href: '/admin/media', label: 'Media Library', icon: '\u229B' },
  { href: '/admin/settings', label: 'Settings', icon: '\u2699' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUserState] = useState(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token && getUser()) {
      setUserState(getUser());
      setReady(true);
      return;
    }
    if (pathname === '/admin/login') {
      setReady(true);
      return;
    }
    router.replace('/admin/login');
  }, [router, pathname]);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const showShell = ready && user;
  const logout = () => {
    clearToken();
    router.replace('/admin/login');
  };

  return (
    <>
      <div className="admin-shell" style={showShell ? undefined : { display: 'none' }}>
        <div className={`admin-backdrop ${navOpen ? 'show' : ''}`} onClick={() => setNavOpen(false)} />
        <aside className={`admin-side ${navOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 }}>
            <Logo size={40} />
            <div>
              <div className="admin-brand">Trekking with Rabin</div>
              <div className="admin-brand-sub">Admin Panel</div>
            </div>
          </div>
          <nav className="admin-nav">
            {MENU.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className={`admin-nav__item ${pathname === m.href || (m.href !== '/admin' && pathname.startsWith(m.href)) ? 'active' : ''}`}
              >
                <span className="admin-nav__icon">{m.icon}</span>
                {m.label}
              </Link>
            ))}
          </nav>
          <div className="admin-side-foot">
            <div className="admin-user">
              <strong>{user?.username || 'Admin'}</strong>
              <span className="badge-pill badge-new" style={{ textTransform: 'uppercase' }}>{user?.role || 'user'}</span>
            </div>
            <Link href="/" className="admin-link">View Website</Link>
            <button onClick={logout} className="admin-link" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--flag-red)' }}>
              Sign Out
            </button>
          </div>
        </aside>

        <main className="admin-main">
          <header className="admin-topbar">
            <span className="admin-topbar-title">
              <button className="admin-burger" aria-label="Open menu" onClick={() => setNavOpen(!navOpen)}>{'\u2630'}</button>
              <span style={{ fontFamily: 'var(--display)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--alpine)', fontWeight: 600 }}>
                {MENU.find((m) => m.href === pathname || (m.href !== '/admin' && pathname.startsWith(m.href)))?.label || 'Dashboard'}
              </span>
            </span>
            <span className="admin-topbar-user" style={{ fontSize: '0.82rem', color: 'var(--charcoal-soft)' }}>Logged in as {user?.username}</span>
          </header>
          <div className="admin-content">{children}</div>
        </main>
      </div>
      {!ready && (
        <div style={{ minHeight: '100vh', background: 'var(--snow)', display: 'grid', placeItems: 'center', color: 'var(--charcoal-soft)' }}>Checking session...</div>
      )}
    </>
  );
}