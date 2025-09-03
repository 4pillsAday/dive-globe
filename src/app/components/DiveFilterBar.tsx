'use client';

import { useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { DiveSiteDetail } from '@/lib/webflow';

type Props = {
  sites: DiveSiteDetail[];
  initial: { difficulty?: string; ocean?: string; continent?: string; country?: string; diveType?: string };
};

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

export default function DiveFilterBar({ sites, initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const difficulty = (sp.get('difficulty') || initial.difficulty || '').toLowerCase();
  const ocean = (sp.get('ocean') || initial.ocean || '').toLowerCase();
  const continent = (sp.get('continent') || initial.continent || '').toLowerCase();
  const country = (sp.get('country') || initial.country || '').toLowerCase();
  const diveType = (sp.get('divetype') || initial.diveType || '').toLowerCase();

  function passes(site: DiveSiteDetail, skip: 'difficulty'|'ocean'|'continent'|'country'|'divetype'|null): boolean {
    const d = (site.difficulty || '').toLowerCase();
    const okDiff = skip==='difficulty' ? true : (difficulty ? (d === difficulty || d.startsWith(difficulty)) : true);
    const okOcean = skip==='ocean' ? true : (ocean ? inferOcean(site.lat, site.lng).toLowerCase() === ocean : true);
    const okCont = skip==='continent' ? true : (continent ? inferContinent(site.lat, site.lng).toLowerCase() === continent : true);
    const okCountry = skip==='country' ? true : (country ? (site.country || '').toLowerCase() === country : true);
    const types = (site.diveTypes || []).map((t)=>t.toLowerCase());
    const okType = skip==='divetype' ? true : (diveType ? types.includes(diveType) : true);
    return okDiff && okOcean && okCont && okCountry && okType;
  }

  const difficulties = useMemo(() => {
    const set = new Set<string>();
    for (const s of sites) if (passes(s, 'difficulty') && s.difficulty) set.add(String(s.difficulty));
    return Array.from(set).sort((a,b)=>String(a).localeCompare(String(b)));
  }, [sites, ocean, continent, country, diveType, passes]);

  const oceans = useMemo(() => {
    const set = new Set<string>();
    for (const s of sites) if (passes(s, 'ocean')) set.add(inferOcean(s.lat, s.lng));
    return Array.from(set).sort((a,b)=>a.localeCompare(b));
  }, [sites, difficulty, continent, country, diveType, passes]);

  const continents = useMemo(() => {
    const set = new Set<string>();
    for (const s of sites) if (passes(s, 'continent')) set.add(inferContinent(s.lat, s.lng));
    return Array.from(set).sort((a,b)=>a.localeCompare(b));
  }, [sites, difficulty, ocean, country, diveType, passes]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const s of sites) if (passes(s, 'country') && s.country) set.add(String(s.country));
    return Array.from(set).sort((a,b)=>a.localeCompare(b));
  }, [sites, difficulty, ocean, continent, diveType, passes]);

  const diveTypes = useMemo(() => {
    const set = new Set<string>();
    for (const s of sites) if (passes(s, 'divetype') && s.diveTypes) s.diveTypes.forEach((t)=>set.add(String(t)));
    return Array.from(set).sort((a,b)=>a.localeCompare(b));
  }, [sites, difficulty, ocean, continent, country, passes]);

  function update(key: string, val: string) {
    const params = new URLSearchParams(sp.toString());
    if (val) params.set(key, val); else params.delete(key);
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.push(url);
  }

  return (
    <form className="dg-filters" action="#" onSubmit={(e)=>e.preventDefault()}>
      <div>
        <label htmlFor="divetype">Dive Type</label>
        <select id="divetype" name="divetype" value={diveType} onChange={(e)=>update('divetype', e.target.value)}>
          <option value="">All</option>
          {diveTypes.map((t)=> (
            <option key={t} value={t.toLowerCase()}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="difficulty">Difficulty</label>
        <select id="difficulty" name="difficulty" value={difficulty} onChange={(e)=>update('difficulty', e.target.value)}>
          <option value="">All</option>
          {difficulties.map((d)=> (
            <option key={d} value={String(d).toLowerCase()}>{d}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="ocean">Ocean</label>
        <select id="ocean" name="ocean" value={ocean} onChange={(e)=>update('ocean', e.target.value)}>
          <option value="">All</option>
          {oceans.map((o)=> (
            <option key={o} value={o.toLowerCase()}>{o}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="continent">Continent</label>
        <select id="continent" name="continent" value={continent} onChange={(e)=>update('continent', e.target.value)}>
          <option value="">All</option>
          {continents.map((c)=> (
            <option key={c} value={c.toLowerCase()}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="country">Country</label>
        <select id="country" name="country" value={country} onChange={(e)=>update('country', e.target.value)}>
          <option value="">All</option>
          {countries.map((c)=> (
            <option key={c} value={c.toLowerCase()}>{c}</option>
          ))}
        </select>
      </div>
      <div style={{alignSelf:'end'}}>
        <button className="dg-btn" type="button" onClick={()=>router.push('/dive')}>Clear</button>
      </div>
    </form>
  );
}


