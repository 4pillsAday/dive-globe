import Image from 'next/image';
import { joinBasePath, type DiveSiteDetail, FALLBACK_SITES } from '@/lib/webflow';
import { headers } from 'next/headers';
import { findNearestAirport } from '@/lib/airports-lite';
import FlightLink from '../../../components/FlightLink';
import AccommodationLink from '../../../components/AccommodationLink';
import GoogleSiteMap from '../../../components/GoogleSiteMap';

async function fetchSite(slug: string): Promise<DiveSiteDetail | null> {
  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
    const proto = (h.get('x-forwarded-proto') || 'http').split(',')[0];
    const url = `${proto}://${host}${joinBasePath(`/api/dives/${slug}`)}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return data.item ?? null;
    }
  } catch {}
  // Fallback to local dataset
  const local = FALLBACK_SITES.find((s) => s.slug === slug) || null;
  if (!local) return null;
  return {
    ...local,
    nearestAirport: local.nearestAirport || findNearestAirport(local.lat, local.lng)?.iata,
  };
}

export default async function DiveDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await fetchSite(slug);
  if (!site) {
    return (
      <main className="dg-container dg-empty">
        <h1>Not found</h1>
        <p>We couldn’t find that dive site.</p>
      </main>
    );
  }

  return (
    <main className="dg-container dg-detail">
      {/** Build a Google Maps embed URL that forces English and centers on the site **/}
      {(() => {
        return null;
      })()}
      <div className="dg-hero">
        <div className="dg-hero-text">
          <h1 className="dg-title">{site.name}</h1>
          {site.country ? <p className="dg-subtitle">{site.country}</p> : null}
        </div>
        {site.imageUrl ? (
          <Image src={site.imageUrl} alt={site.name} width={960} height={480} className="dg-hero-img" />
        ) : (
          <div className="dg-hero-fallback" aria-hidden />
        )}
      </div>

      <section className="dg-section">
        <div className="dg-specs">
          {site.bestTime ? (
            <div><span className="dg-spec-label">Best time</span><span>{site.bestTime}</span></div>
          ) : null}
          {site.waterTemp ? (
            <div><span className="dg-spec-label">Water temp</span><span>{site.waterTemp}</span></div>
          ) : null}
          {site.diveTypes && site.diveTypes.length ? (
            <div><span className="dg-spec-label">Dive types</span><span>{site.diveTypes.join(', ')}</span></div>
          ) : null}
          {site.difficulty ? (
            <div><span className="dg-spec-label">Difficulty</span><span>{site.difficulty}</span></div>
          ) : null}
          {site.maxDepth != null ? (
            <div><span className="dg-spec-label">Max depth</span><span>{site.maxDepth} m</span></div>
          ) : null}
          {site.avgDepth != null ? (
            <div><span className="dg-spec-label">Avg depth</span><span>{site.avgDepth} m</span></div>
          ) : null}
          {site.nearestAirport ? (
            <div><span className="dg-spec-label">Nearest airport</span><span>{site.nearestAirport}</span></div>
          ) : null}
        </div>
        {site.highlights && site.highlights.length ? (
          <div className="dg-highlights">
            {site.highlights.map((h) => (
              <span key={h} className="dg-chip">{h}</span>
            ))}
          </div>
        ) : null}
        {site.diveTypes && site.diveTypes.length ? (
          <div className="dg-highlights">
            {site.diveTypes.map((t) => (
              <span key={`type-${t}`} className="dg-chip">{t}</span>
            ))}
          </div>
        ) : null}
        {site.description ? <p className="dg-desc-large">{site.description}</p> : null}
      </section>

      <section className="dg-mini-map">
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY ? (
          <GoogleSiteMap
            lat={site.lat}
            lng={site.lng}
            name={site.name}
            fallbackCenter={site.nearestAirport ? undefined : (findNearestAirport(site.lat, site.lng) ? { lat: findNearestAirport(site.lat, site.lng)!.lat, lng: findNearestAirport(site.lat, site.lng)!.lng } : undefined)}
          />
        ) : (
          (() => {
            const query = `dive shop near ${site.lat},${site.lng}`;
            const zoom = 12;
            const src = `https://www.google.com/maps?hl=en&output=embed&ll=${site.lat},${site.lng}&z=${zoom}&q=${encodeURIComponent(query)}`;
            return (
              <iframe
                title="Nearby dive shops"
                className="dg-iframe"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={src}
              />
            );
          })()
        )}
        <div className="dg-actions">
          <FlightLink destIata={site.nearestAirport} destLat={site.lat} destLng={site.lng} />
          <AccommodationLink name={site.name} country={site.country} lat={site.lat} lng={site.lng} />
          <a
            className="dg-btn"
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${site.name} ${site.country ?? ''} scuba diving`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >Watch on YouTube</a>
          {site.country ? (
            <a
              className="dg-btn"
              href={`https://www.liveaboard.com/diving/search/${slugifyCountry(site.country)}`}
              target="_blank"
              rel="noopener noreferrer"
            >Liveaboard trips</a>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function slugifyCountry(country: string): string {
  return country
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}


