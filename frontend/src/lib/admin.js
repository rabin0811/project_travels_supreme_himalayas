import { API_URL } from './api';

export const TOKEN_KEY = 'sh_admin_token';
export const USER_KEY = 'sh_admin_user';

function readCookie(name) {
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return readCookie(TOKEN_KEY);
}

/* Session cookie (no Expires/Max-Age): cleared when the browser fully closes —
   that's the "logout on exit" behaviour. Stays logged in across tabs while open. */
export function setToken(token) {
  if (typeof window === 'undefined') return;
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  document.cookie = `${TOKEN_KEY}=; path=/; Max-Age=0`;
  localStorage.removeItem(USER_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function adminFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${getToken()}`,
    },
    cache: 'no-store',
  });
  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') window.location.href = '/admin/login';
    throw new Error('Session expired — please sign in again');
  }
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