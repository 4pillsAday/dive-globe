'use client'

import { useEffect, useRef } from 'react';

type Props = { lat: number; lng: number; name: string };

export default function SiteMap({ lat, lng, name }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import('leaflet').Map | null = null;
    let cleanup: () => void = () => {};
    (async () => {
      // Ensure Leaflet CSS is present (CDN) so controls render properly
      const cssHref = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      const existing = document.querySelector(`link[href="${cssHref}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssHref;
        document.head.appendChild(link);
      }

      const L = (await import('leaflet')) as typeof import('leaflet');
      if (!mapRef.current) return;
      map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 9,
        zoomControl: true,
      });

      // English-style labels via Carto basemap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 18,
      }).addTo(map);

      // Site marker (circle to avoid missing icon assets in SSR)
      L.circleMarker([lat, lng], {
        radius: 8,
        color: '#0ea5e9',
        weight: 3,
        fillColor: '#22d3ee',
        fillOpacity: 1,
      }).addTo(map).bindPopup(name);

      // Fetch nearby dive shops using Overpass API
      const radiusMeters = 50000; // ~50km
      const query = `
        [out:json][timeout:25];
        (
          node["shop"="scuba_diving"](around:${radiusMeters},${lat},${lng});
          node["amenity"="dive_centre"](around:${radiusMeters},${lat},${lng});
          way["shop"="scuba_diving"](around:${radiusMeters},${lat},${lng});
          way["amenity"="dive_centre"](around:${radiusMeters},${lat},${lng});
        );
        out center;
      `;
      try {
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: query,
        });
        if (res.ok) {
          const data = await res.json();
          for (const el of data.elements ?? []) {
            const plat = typeof el.lat === 'number' ? el.lat : el.center?.lat;
            const plon = typeof el.lon === 'number' ? el.lon : el.center?.lon;
            if (typeof plat === 'number' && typeof plon === 'number') {
              const label: string = (el.tags && (el.tags.name || el.tags['name:en'])) || 'Dive shop';
              const m = L.circleMarker([plat, plon], {
                radius: 6,
                color: '#0ea5e9',
                weight: 2,
                fillColor: '#22d3ee',
                fillOpacity: 0.9,
              }).addTo(map);
              m.bindPopup(label);
            }
          }
        }
      } catch {}

      cleanup = () => {
        if (map) map.remove();
      };
    })();

    return () => cleanup();
  }, [lat, lng, name]);

  return (
    <div
      ref={mapRef}
      className="dg-embed-map"
      style={{ width: '100%', height: 360, borderRadius: 12 }}
    />
  );
}


