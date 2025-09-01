import { joinBasePath, type DiveSiteDetail, FALLBACK_SITES } from '@/lib/webflow';
import Link from 'next/link';
import { headers } from 'next/headers';
import DiveFilterBar from '../../components/DiveFilterBar';

async function fetchSites(): Promise<DiveSiteDetail[]> {
  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
    const proto = (h.get('x-forwarded-proto') || 'http').split(',')[0];
    const url = `${proto}://${host}${joinBasePath('/api/dives')}`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    const items = Array.isArray(data.items) ? (data.items as DiveSiteDetail[]) : [];
    return items.length ? items : FALLBACK_SITES;
  } catch {
    return FALLBACK_SITES;
  }
}

export default async function DiveIndexPage({ searchParams }: { searchParams?: Promise<{ country?: string; difficulty?: string; continent?: string; ocean?: string; divetype?: string }> }) {
  const sites = await fetchSites();
  const sp = (await searchParams) || {};
  const country = sp.country?.toLowerCase();
  const difficulty = sp.difficulty?.toLowerCase();
  const continent = sp.continent?.toLowerCase();
  const ocean = sp.ocean?.toLowerCase();
  const filtered = sites.filter((s) => {
    const sDiff = (s.difficulty || '').toLowerCase();
    const okCountry = country ? (s.country || '').toLowerCase() === country : true;
    const okDiff = difficulty ? sDiff === difficulty || sDiff.startsWith(difficulty) : true;
    const okCont = continent ? inferContinent(s.lat, s.lng).toLowerCase() === continent : true;
    const okOcean = ocean ? inferOcean(s.lat, s.lng).toLowerCase() === ocean : true;
    const typeParam = sp.divetype?.toLowerCase();
    const okType = typeParam ? (s.diveTypes || []).map((t)=>t.toLowerCase()).includes(typeParam) : true;
    return okCountry && okDiff && okCont && okOcean && okType;
  });
  const ordered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  function sitePassesFilters(s: DiveSiteDetail, skip: 'difficulty' | 'ocean' | 'continent' | 'country' | null): boolean {
    const okDiff = skip === 'difficulty' ? true : (difficulty ? (s.difficulty || '').toLowerCase() === difficulty : true);
    const okOcean = skip === 'ocean' ? true : (ocean ? inferOcean(s.lat, s.lng).toLowerCase() === ocean : true);
    const okCont = skip === 'continent' ? true : (continent ? inferContinent(s.lat, s.lng).toLowerCase() === continent : true);
    const okCountry = skip === 'country' ? true : (country ? (s.country || '').toLowerCase() === country : true);
    return okDiff && okOcean && okCont && okCountry;
  }

  const difficulties = Array.from(new Set(sites.filter((s) => sitePassesFilters(s, 'difficulty')).map((s) => s.difficulty).filter(Boolean))) as string[];
  difficulties.sort((a, b) => String(a).localeCompare(String(b)));

  const oceans = Array.from(new Set(sites.filter((s) => sitePassesFilters(s, 'ocean')).map((s) => inferOcean(s.lat, s.lng))));
  oceans.sort((a, b) => a.localeCompare(b));

  const continents = Array.from(new Set(sites.filter((s) => sitePassesFilters(s, 'continent')).map((s) => inferContinent(s.lat, s.lng))));
  continents.sort((a, b) => a.localeCompare(b));

  const countries = Array.from(new Set(sites.filter((s) => sitePassesFilters(s, 'country')).map((s) => s.country).filter(Boolean))) as string[];
  countries.sort((a, b) => a.localeCompare(b));

  return (
    <main className="dg-container">
      <h1 className="dg-title">Dive Sites</h1>
      <DiveFilterBar
        sites={sites}
        initial={{ difficulty, ocean, continent, country, diveType: sp.divetype?.toLowerCase() }}
      />
      <ul className="dg-grid">
        {ordered.length === 0 ? (
          <li className="dg-card" style={{gridColumn: '1 / -1'}}>
            <div className="dg-card-body">
              <div className="dg-card-header"><h2>No results</h2></div>
              <p className="dg-desc">Try clearing filters or selecting a different country/difficulty.</p>
            </div>
          </li>
        ) : null}
        {ordered.map((s) => (
          <li key={s.id} className="dg-card">
            <div className="dg-card-body">
              <div className="dg-card-header">
                <h2>{s.name}</h2>
                {s.country ? <span className="dg-chip">{s.country}</span> : null}
              </div>
              {s.description ? <p className="dg-desc">{s.description}</p> : <p className="dg-desc" aria-hidden />}
              <div className="dg-meta">
                {s.difficulty ? <span>Difficulty: {s.difficulty}</span> : null}
                {s.maxDepth != null ? <span>Max: {s.maxDepth} m</span> : null}
                {s.avgDepth != null ? <span>Avg: {s.avgDepth} m</span> : null}
              </div>
            </div>
            <div className="dg-card-actions">
              <Link className="dg-btn" href={`/dive/${s.slug}`}>View details</Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

function inferContinent(lat: number, lng: number): string {
  if (lat < -60) return 'Antarctica';
  if (lat > 35 && lat < 72 && lng > -25 && lng < 45) return 'Europe';
  if (lat > -35 && lat < 37 && lng > -20 && lng < 55) return 'Africa';
  if (lat > 0 && lng > 45 && lng <= 180) return 'Asia';
  if (lat > -50 && lat < 10 && (lng > 110 || lng < -150)) return 'Oceania';
  if (lat < 12 && lng > -90 && lng < -30) return 'South America';
  if (lat > 0 && lng > -170 && lng < -30) return 'North America';
  return 'Other';
}

function inferOcean(lat: number, lng: number): string {
  if (lat > 66) return 'Arctic Ocean';
  if (lat < -60) return 'Southern Ocean';
  const lon = ((lng + 540) % 360) - 180;
  if (lon > -70 && lon < 20) return 'Atlantic Ocean';
  if (lon >= 20 && lon < 150) return 'Indian Ocean';
  return 'Pacific Ocean';
}


