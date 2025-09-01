import { NextResponse } from 'next/server';
import { FALLBACK_SITES, normalizeItem, type DiveSiteDetail } from '@/lib/webflow';
import { findNearestAirport } from '@/lib/airports-lite';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);
  const slug = parts[parts.length - 1];
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const token = process.env.WEBFLOW_API_TOKEN;
  const collectionId = process.env.DIVE_COLLECTION_ID;

  if (!token || !collectionId) {
    const src = FALLBACK_SITES.find((s) => s.slug === slug);
    if (!src) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item: DiveSiteDetail = {
      ...src,
      nearestAirport: src.nearestAirport || findNearestAirport(src.lat, src.lng)?.iata,
    };
    return NextResponse.json({ item });
  }

  try {
    const url = `https://api.webflow.com/v2/collections/${collectionId}/items?limit=100`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: 'Webflow API error', details: text }, { status: 502 });
    }
    const data = await res.json();
    const items: DiveSiteDetail[] = Array.isArray(data.items)
      ? (data.items.map(normalizeItem).filter(Boolean) as DiveSiteDetail[])
      : [];
    const found = items.find((i: DiveSiteDetail) => i.slug === slug) || FALLBACK_SITES.find((s) => s.slug === slug);
    if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item: DiveSiteDetail = {
      ...found,
      nearestAirport: found.nearestAirport || findNearestAirport(found.lat, found.lng)?.iata,
    };
    return NextResponse.json({ item });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: 'Unexpected error', message }, { status: 500 });
  }
}


