'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

/* Auto-routes between the package waypoints (OSRM), falling back to a direct line. */
export default function RouteMap({ points }) {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const pts = (points || []).filter((p) => p && !Number.isNaN(p.lat) && !Number.isNaN(p.lng) && p.lng > -180 && p.lng < 180 && p.lat > -90 && p.lat < 90);
    const div = divRef.current;
    const statusEl = statusRef.current;
    if (!div) return;

    let map = null;
    let cancelled = false;

    import('leaflet')
      .then((mod) => {
        if (cancelled || !div) return;
        const L = mod.default || mod;

        map = L.map(div, { scrollWheelZoom: false, attributionControl: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        const showStatus = (html, tone) => {
          if (statusEl) statusEl.innerHTML = html;
        };

        const toLngLat = (p) => [p.lng, p.lat];

        if (pts.length === 0) {
          showStatus('No route waypoints on this trip yet. The team adds them in the admin map section.', 'muted');
          map.setView([27.7172, 85.324], 11);
          return;
        }

        pts.forEach((p, i) => {
          const m = L.circleMarker([p.lat, p.lng], {
            radius: 4,
            color: '#fff',
            weight: 2,
            fillColor: '#c0392b',
            fillOpacity: 1,
          });
          m.bindTooltip(`${i + 1}. ${p.name || `Stop ${i + 1}`}`, { permanent: false, direction: 'top' });
          m.addTo(map);
        });

        const drawDirect = () => {
          const line = pts.map((p) => [p.lat, p.lng]);
          L.polyline(line, { color: '#c0392b', weight: 4, opacity: 0.85, dashArray: '8 8' }).addTo(map);
          showStatus('Direct route drawn (auto routing was unavailable).');
          map.fitBounds(L.polyline(line).getBounds(), { padding: [30, 30] });
        };

        const coords = pts.map(toLngLat).join(';');
        fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`)
          .then((r) => r.json())
          .then((data) => {
            if (cancelled) return;
            if (data?.routes?.length && data.routes[0].geometry?.coordinates?.length) {
              const geo = data.routes[0].geometry.coordinates;
              const line = geo.map(([lng, lat]) => [lat, lng]);
              L.polyline(line, { color: '#c0392b', weight: 5, opacity: 0.9 }).addTo(map);
              showStatus('Route found automatically — following roads/paths between your waypoints.');
              map.fitBounds(L.latLngBounds(line), { padding: [30, 30] });
            } else {
              drawDirect();
            }
          })
          .catch(() => {
            if (!cancelled) drawDirect();
          });
      })
      .catch(() => {
        if (statusEl) statusEl.innerHTML = 'Map could not be loaded.';
      });

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [points]);

  return (
    <div>
      <div ref={divRef} style={{ height: 480, borderRadius: 10, zIndex: 0 }} />
      <p ref={statusRef} style={{ fontSize: '0.8rem', color: 'var(--charcoal-soft)', marginTop: 8 }} />
    </div>
  );
}
