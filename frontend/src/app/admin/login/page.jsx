'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminFetch, clearToken, getToken, getUser, setToken, setUser } from '@/lib/admin';
import Logo from '@/components/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace('/admin');
  }, [router]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.token) throw new Error(data.error || 'Login failed');
      setToken(data.token);
      setUser(data.user);
      router.replace('/admin');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--alpine)', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 24px 64px rgba(10,44,45,0.45)', padding: 44, width: 'min(420px, 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 8 }}>
          <Logo size={52} light={false} />
          <div>
            <div style={{ fontFamily: 'var(--display)', color: 'var(--alpine)', fontWeight: 700, fontSize: '1.25rem', textTransform: 'uppercase' }}>
              Admin Panel
            </div>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.22em', color: 'var(--glacier)', textTransform: 'uppercase', fontFamily: 'var(--display)' }}>
              Trekking with Rabin
            </div>
          </div>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--charcoal-soft)', fontSize: '0.88rem', margin: '14px 0 24px' }}>
          Sign in to manage packages, bookings and content.
        </p>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="a-user">Username</label>
            <input id="a-user" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="a-pass">Password</label>
            <input id="a-pass" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && (
            <p style={{ color: '#a93327', background: '#fbe9e7', padding: '10px 14px', borderRadius: 8, fontSize: '0.88rem', marginBottom: 16 }}>
              {error}
            </p>
          )}
          <button className="btn btn--primary btn--block" disabled={busy} style={{ marginTop: 6 }}>
            {busy ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ marginTop: 18, textAlign: 'center', fontSize: '0.8rem', color: 'var(--charcoal-soft)' }}>
          Demo accounts: <code>admin / admin123</code> or <code>editor / admin123</code>
        </p>
        <p style={{ marginTop: 8, textAlign: 'center' }}>
          <Link href="/" style={{ color: 'var(--glacier)', fontSize: '0.85rem' }}>← Back to website</Link>
        </p>
      </div>
    </div>
  );
}