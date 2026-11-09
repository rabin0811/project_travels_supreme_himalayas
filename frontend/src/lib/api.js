export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const isServer = typeof window === 'undefined';
export const API_URL_SERVER =
  isServer && process.env.API_INTERNAL_URL ? process.env.API_INTERNAL_URL : API_URL;

export const assetUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
};

export async function apiFetch(path, options = {}) {
  const { token, ...rest } = options;
  const headers = { 'Content-Type': 'application/json', ...(rest.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL_SERVER}${path}`, { ...rest, headers, cache: 'no-store' });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export const getSettings = () => apiFetch('/api/settings').catch(() => ({}));

export const formatPrice = (n) => {
  const v = Number(n);
  if (v >= 1000) return `$${Math.round(v).toLocaleString('en-US')}`;
  return `$${Math.round(v)}`;
};

export const DEFAULT_NPR_RATE = 134;

/* nprVal: package.price_npr from the API, or pass the already-converted NPR amount */
export const formatNpr = (usd, nprVal) => {
  const npr = nprVal != null && !Number.isNaN(Number(nprVal))
    ? Number(nprVal)
    : Math.round(Number(usd) * DEFAULT_NPR_RATE);
  return `रू ${Math.round(npr).toLocaleString('en-US')}`;
};

export const formatDate = (s) =>
  new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export const TODAY = new Date().toISOString().slice(0, 10);