'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatDate, formatPrice } from '@/lib/api';

export default function BookingConfirmedPage() {
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sh_last_booking');
      if (raw) setBooking(JSON.parse(raw));
    } catch {
      setBooking(null);
    }
  }, []);

  if (!booking) {
    return (
      <div className="container empty-state" style={{ padding: '120px 0' }}>
        <h2>No booking found</h2>
        <p>Start by choosing one of our trips.</p>
        <Link className="btn btn--primary" style={{ marginTop: 16 }} href="/packages">Browse Trips</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="confirm-box">
        <div className="confirm-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="eyebrow">Inquiry received</span>
        <h1 className="section-title" style={{ fontSize: '1.6rem' }}>Thank you!</h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--charcoal-soft)' }}>
          Your booking inquiry for <strong style={{ color: 'var(--alpine)' }}>{booking.package_title}</strong> has been received.
          Our team will contact you within 24 hours to confirm availability and your final itinerary.
        </p>
        <div className="confirm-ref">{booking.booking_ref}</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--charcoal-soft)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Your reference number
        </p>

        <div style={{ margin: '26px 0', textAlign: 'left' }}>
          <div className="summary-row" style={{ borderBottom: '1px solid var(--line)', padding: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span>Travel date</span><strong>{formatDate(booking.travel_date)}</strong>
          </div>
          <div className="summary-row" style={{ borderBottom: '1px solid var(--line)', padding: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span>Travellers</span><strong>{booking.travelers_count}</strong>
          </div>
          <div className="summary-row" style={{ padding: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span>Estimated total</span><strong style={{ color: 'var(--flag-red)' }}>{formatPrice(Number(booking.price) * (booking.travelers_count || 1))}</strong>
          </div>
        </div>

        <div className="note-payment">
          <strong>About payment:</strong> this is an inquiry only — your card is never charged. Once dates are confirmed we will
          send a secure deposit link (eSewa, Khalti or international card). Online payment is coming soon.
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 26, flexWrap: 'wrap' }}>
          <Link className="btn btn--primary" href="/packages">Explore More Trips</Link>
          <Link className="btn btn--outline" href="/contact">Ask a Question</Link>
        </div>
      </div>
    </div>
  );
}