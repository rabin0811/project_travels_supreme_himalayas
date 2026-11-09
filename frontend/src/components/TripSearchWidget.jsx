'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TODAY } from '@/lib/api';

export default function TripSearch({ categories = [], dark = false, compact = false }) {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [depart, setDepart] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [duration, setDuration] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set('category', destination);
    if (depart) params.set('depart', depart);
    if (returnDate) params.set('return', returnDate);
    if (duration) params.set('duration_max', duration);
    router.push(`/packages${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className={`trip-search ${dark ? 'trip-search--dark' : ''} ${compact ? '' : 'trip-search--hero'}`}>
      <div className="trip-search__title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <strong>Search Trips &amp; Treks</strong>
      </div>
      <form className="trip-search__form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="ts-dest">Destination</label>
          <select id="ts-dest" value={destination} onChange={(e) => setDestination(e.target.value)}>
            <option value="">All Destinations</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="ts-depart">Depart Date</label>
          <input
            id="ts-depart"
            type="date"
            min={TODAY}
            value={depart}
            onChange={(e) => setDepart(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="ts-return">Return Date</label>
          <input
            id="ts-return"
            type="date"
            min={depart || TODAY}
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="ts-duration">Duration</label>
          <select id="ts-duration" value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="">Any</option>
            <option value="4">Up to 4 days</option>
            <option value="7">Up to 7 days</option>
            <option value="10">Up to 10 days</option>
            <option value="14">Up to 14 days</option>
            <option value="99">14+ days</option>
          </select>
        </div>
        <button type="submit" className="btn btn--primary">Submit</button>
      </form>
    </div>
  );
}