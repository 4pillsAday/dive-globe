import { NextResponse } from 'next/server';
import { normalizeItem, FALLBACK_SITES, type DiveSiteDetail } from '@/lib/webflow';
import { findNearestAirport } from '@/lib/airports-lite';

export async function GET() {
  const token = process.env.WEBFLOW_API_TOKEN;
  const collectionId = process.env.DIVE_COLLECTION_ID;

  if (!token || !collectionId) {
    const items = FALLBACK_SITES.map((s) => ({
      ...s,
      nearestAirport: s.nearestAirport || findNearestAirport(s.lat, s.lng)?.iata,
    }));
    return NextResponse.json({ items });
  }

  try {
    const url = `https://api.webflow.com/v2/collections/${collectionId}/items?limit=100`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      // Edge runtime uses WHATWG fetch; no special agent needed
    });
    if (!res.ok) {
      // Fallback to local dataset if Webflow returns an error
      return NextResponse.json({ items: FALLBACK_SITES });
    }
    const data = await res.json();
    const itemsRaw: DiveSiteDetail[] = Array.isArray(data.items)
      ? (data.items.map(normalizeItem).filter(Boolean) as DiveSiteDetail[])
      : [];
    const baseList: DiveSiteDetail[] = itemsRaw.length ? itemsRaw : FALLBACK_SITES;
    const items: DiveSiteDetail[] = baseList.map((s: DiveSiteDetail) => ({
      ...s,
      nearestAirport: s.nearestAirport || findNearestAirport(s.lat, s.lng)?.iata,
    }));
    return NextResponse.json({ items });
  } catch {
    // On any unexpected error, return fallback so UI stays populated
    return NextResponse.json({ items: FALLBACK_SITES });
  }
}
