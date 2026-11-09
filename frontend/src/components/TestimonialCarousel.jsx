'use client';

import { useEffect, useState } from 'react';

export default function TestimonialCarousel({ items }) {
  const [index, setIndex] = useState(0);
  const count = items.length;

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count]);

  if (!count) return <p className="empty-state">Reviews coming soon.</p>;

  const visible = items.slice(index, Math.min(index + 3, count));
  const dots = Array.from({ length: count });

  return (
    <div>
      <div className="grid-3">
        {visible.map((t, i) => (
          <div key={t.id ?? i} className="t-card fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="t-stars">{'\u2605'.repeat(t.rating)}{'\u2606'.repeat(5 - t.rating)}</div>
            <p className="t-quote">"{t.review}"</p>
            <div className="t-author">
              <div className="t-avatar">{t.name.charAt(0)}</div>
              <div>
                <strong>{t.name}</strong>
                <span>{t.country}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {count > 3 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 26 }}>
          {dots.map((_, i) => (
            <button
              key={i}
              aria-label={`Show review ${i + 1}`}
              onClick={() => setIndex(i)}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                border: 'none',
                background: i === index ? 'var(--glacier)' : 'var(--line)',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}