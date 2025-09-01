'use client';

import { useEffect, useState } from 'react';
import { findNearestAirport } from '@/lib/airports-lite';

type Props = {
  destIata?: string;
  destLat: number;
  destLng: number;
};

export default function FlightLink({ destIata, destLat, destLng }: Props) {
  const dIata = destIata || findNearestAirport(destLat, destLng)?.iata;
  const [href, setHref] = useState<string>(
    dIata
      ? `https://www.google.com/travel/flights?q=${encodeURIComponent(`flights to ${dIata}`)}`
      : `https://www.google.com/travel/flights?q=${encodeURIComponent(`flights to ${destLat},${destLng}`)}`
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const oIata = findNearestAirport(pos.coords.latitude, pos.coords.longitude)?.iata;
        const dIata = destIata || findNearestAirport(destLat, destLng)?.iata;
        if (oIata && dIata) {
          // Use query mode with explicit IATA on both ends for more reliable parsing
          setHref(`https://www.google.com/travel/flights?q=${encodeURIComponent(`${oIata} to ${dIata}`)}`);
        } else if (dIata) {
          setHref(`https://www.google.com/travel/flights?q=${encodeURIComponent(`flights to ${dIata}`)}`);
        }
      },
      () => {
        // ignore and keep default
      },
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 600000 }
    );
  }, [destIata, destLat, destLng]);

  return (
    <a className="dg-btn" href={href} target="_blank" rel="noopener noreferrer">Check flights</a>
  );
}


