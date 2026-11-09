'use client';

import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '@/lib/api';

export default function HeroSlider({ slides }) {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setInterval(() => setIndex((i) => (i + 1) % Math.max(slides.length, 1)), 6000);
    return () => clearInterval(timer.current);
  }, [slides.length]);

  const slide = slides[Math.min(index, slides.length - 1)];

  return (
    <div className="hero">
      <div className="hero-slide">
        <div className="hero-media">
          {slide && slide.image && <img src={assetUrl(slide.image)} alt={slide.title} />}
        </div>
        <div className="container hero-inner">
          <p className="eyebrow" style={{ color: '#8fd0d2' }}>{slide.eyebrow}</p>
          <h1 className="hero-title">{slide.title}</h1>
          <p className="hero-sub">{slide.subtitle}</p>
          <div className="hero-badges">
            {slide.badges.split('\u00b7').map((b, i) => (
              <span key={i}>{b.trim()}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="#trips" className="btn btn--primary">Explore Trips</a>
            <a href="/contact" className="btn btn--ghost">Custom Itinerary</a>
          </div>
        </div>
      </div>
    </div>
  );
}