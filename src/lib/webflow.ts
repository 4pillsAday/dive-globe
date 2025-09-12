export type DiveSiteDetail = {
  id: string;
  slug: string;
  name: string;
  lat: number;
  lng: number;
  country?: string;
  // Deprecated: use maxDepth/avgDepth instead
  depth?: number | null;
  maxDepth?: number | null;
  avgDepth?: number | null;
  bestTime?: string;
  waterTemp?: string;
  highlights?: string[];
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  description?: string;
  imageUrl?: string;
  nearestAirport?: string;
  diveTypes?: string[]; // e.g., ['Scuba', 'Freedive', 'Snorkel']
};

type WebflowItem = {
  id?: string;
  slug?: string;
  fieldData?: Record<string, unknown> & {
    slug?: string;
    name?: string;
    title?: string;
    latitude?: string | number;
    lat?: string | number;
    longitude?: string | number;
    lng?: string | number;
    country?: string;
    region?: string;
    depth?: string | number | null;
    maxDepth?: string | number | null;
    max_depth?: string | number | null;
    avgDepth?: string | number | null;
    averageDepth?: string | number | null;
    avg_depth?: string | number | null;
    bestTime?: string;
    best_time?: string;
    waterTemp?: string;
    water_temp?: string;
    difficulty?: string;
    description?: string;
    highlights?: string[] | string;
    image?: { url?: string } | string;
    imageUrl?: string;
    nearest_airport?: string;
    nearestAirport?: string;
    diveTypes?: string[] | string;
    dive_types?: string[] | string;
  };
};

export function createSlug(input: string): string {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function toDifficulty(value: unknown): DiveSiteDetail['difficulty'] | undefined {
  const str = String(value || '').toLowerCase();
  if (!str) return undefined;
  if (str.startsWith('beg')) return 'Beginner';
  if (str.startsWith('int')) return 'Intermediate';
  if (str.startsWith('adv')) return 'Advanced';
  return undefined;
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toArrayOfStrings(value: unknown): string[] | undefined {
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
  if (typeof value === 'string')
    return value
      .split(/[,;]/)
      .map((v) => v.trim())
      .filter(Boolean);
  return undefined;
}

function normalizeDiveTypes(value: unknown): string[] | undefined {
  const arr = toArrayOfStrings(value);
  if (!arr) return undefined;
  return arr.map((s) => {
    const t = s.toLowerCase();
    if (t.includes('free')) return 'Freedive';
    if (t.includes('snork')) return 'Snorkel';
    if (t.includes('scuba')) return 'Scuba';
    if (t.includes('tech')) return 'Technical';
    return s.charAt(0).toUpperCase() + s.slice(1);
  });
}

type FieldDataExtended = NonNullable<WebflowItem['fieldData']> & {
  maxDepth?: string | number | null;
  max_depth?: string | number | null;
  avgDepth?: string | number | null;
  averageDepth?: string | number | null;
  avg_depth?: string | number | null;
  diveTypes?: string[] | string;
  dive_types?: string[] | string;
};

export function normalizeItem(item: WebflowItem): DiveSiteDetail | null {
  const f: FieldDataExtended = (item?.fieldData ?? {}) as FieldDataExtended;
  const latRaw = f.latitude ?? f.lat;
  const lngRaw = f.longitude ?? f.lng;
  const lat = parseFloat(String(latRaw));
  const lng = parseFloat(String(lngRaw));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const name = f.name ?? f.title ?? 'Unnamed site';
  const slug = (item.slug as string | undefined) || f.slug || createSlug(String(name));
  const depth = toNumberOrNull(f.depth ?? null);
  const maxDepth = toNumberOrNull(f.maxDepth ?? f.max_depth ?? null);
  const avgDepth = toNumberOrNull(f.avgDepth ?? f.averageDepth ?? f.avg_depth ?? null);
  const country = f.country || f.region || undefined;
  const bestTime = f.bestTime || f.best_time || undefined;
  const waterTemp = f.waterTemp || f.water_temp || undefined;
  const difficulty = toDifficulty(f.difficulty);
  const description = f.description || undefined;
  const highlights = toArrayOfStrings(f.highlights);
  const diveTypes = normalizeDiveTypes(f.diveTypes ?? f.dive_types);
  const fAny = f as { nearest_airport?: unknown; nearestAirport?: unknown };
  const nearestAirportRaw = fAny.nearest_airport ?? fAny.nearestAirport ?? undefined;
  const nearestAirport = typeof nearestAirportRaw === 'string'
    ? nearestAirportRaw.trim().toUpperCase()
    : undefined;

  let imageUrl: string | undefined = undefined;
  const image = f.image ?? f.imageUrl;
  if (typeof image === 'string') {
    imageUrl = image;
  } else if (image && typeof image === 'object' && 'url' in image) {
    const url = (image as { url?: unknown }).url;
    if (typeof url === 'string') imageUrl = url;
  }

  return {
    id: item.id ?? `${lat},${lng}`,
    slug: String(slug || createSlug(name)),
    name: String(name),
    lat,
    lng,
    country,
    depth,
    maxDepth: maxDepth ?? null,
    avgDepth: (avgDepth ?? null) ?? (depth ?? null),
    bestTime,
    waterTemp,
    highlights,
    difficulty,
    description,
    imageUrl,
    nearestAirport,
    diveTypes,
  };
}

export function joinBasePath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const normalizedBase = base && base !== '/' ? base.replace(/\/$/, '') : '';
  const normalizedPath = `/${String(path || '')}`.replace(/\/+/, '/');
  return `${normalizedBase}${normalizedPath}`;
}

export const FALLBACK_SITES: DiveSiteDetail[] = [
  {
    id: 'raja-ampat',
    slug: 'raja-ampat',
    name: 'Raja Ampat',
    lat: -0.2346,
    lng: 130.5079,
    country: 'Indonesia',
    bestTime: 'Oct–Apr',
    waterTemp: '27–30°C',
    highlights: ['Mantas', 'Coral gardens', 'Macro'],
    difficulty: 'Intermediate',
    maxDepth: 30,
    avgDepth: 10,
    depth: 5,
    diveTypes: ['Scuba', 'Snorkel', 'Freedive'],
    description: 'Biodiversity hotspot with pristine reefs and frequent manta encounters.',
    imageUrl: undefined,
  },
  {
    id: 'ss-yongala',
    slug: 'ss-yongala',
    name: 'SS Yongala (Australia)',
    lat: -19.3,
    lng: 147.6,
    country: 'Australia',
    bestTime: 'Apr–Nov',
    waterTemp: '22–28°C',
    highlights: ['Wreck', 'Giant groupers', 'Eagle rays'],
    difficulty: 'Intermediate',
    maxDepth: 30,
    avgDepth: 22,
    depth: 28,
    diveTypes: ['Scuba'],
    description: 'Historic wreck in the Coral Sea teeming with pelagics and macro life.',
  },
  {
    id: 'richelieu-rock',
    slug: 'richelieu-rock-thailand',
    name: 'Richelieu Rock (Thailand)',
    lat: 9.75,
    lng: 98.08,
    country: 'Thailand',
    bestTime: 'Nov–Apr',
    waterTemp: '27–29°C',
    highlights: ['Soft corals', 'Whale sharks (seasonal)'],
    difficulty: 'Intermediate',
    maxDepth: 30,
    avgDepth: 18,
    depth: 18,
    diveTypes: ['Scuba'],
    description: 'Iconic Andaman Sea pinnacle with purple soft corals and rich fish life.',
  },
  {
    id: 'daedalus-reef',
    slug: 'daedalus-reef-egypt',
    name: 'Daedalus Reef (Egypt)',
    lat: 24.58,
    lng: 35.92,
    country: 'Egypt',
    bestTime: 'Mar–Jun, Sep–Nov',
    waterTemp: '22–28°C',
    highlights: ['Hammerheads', 'Walls'],
    difficulty: 'Advanced',
    maxDepth: 30,
    avgDepth: 25,
    depth: 25,
    diveTypes: ['Scuba'],
    description: 'Offshore Red Sea reef with exhilarating drifts and oceanic pelagics.',
  },
  {
    id: 'ras-mohammed-shark-yolanda',
    slug: 'shark-and-yolanda-reef-egypt',
    name: 'Shark & Yolanda Reef (Ras Mohammed)',
    lat: 27.736,
    lng: 34.258,
    country: 'Egypt',
    bestTime: 'Mar–Jun, Sep–Nov',
    waterTemp: '22–28°C',
    highlights: ['Walls', 'Abundant fish'],
    difficulty: 'Beginner',
    maxDepth: 30,
    avgDepth: 18,
    depth: 18,
    diveTypes: ['Scuba'],
    description: 'Two spectacular reefs with dramatic walls and prolific fish life.',
  },
  {
    id: '163c3274-e8eb-4984-9a9e-68a7119b9b04',
    slug: 'blue-hole-dahab',
    name: 'Blue Hole (Dahab)',
    lat: 28.572,
    lng: 34.536,
    country: 'Egypt',
    bestTime: 'Mar–Jun, Sep–Nov',
    waterTemp: '21–28°C',
    highlights: ['Blue hole', 'Sheer drop offs'],
    difficulty: 'Intermediate',
    maxDepth: 55,
    avgDepth: 25,
    depth: 30,
    diveTypes: ['Scuba', 'Freedive'],
    description: 'Famous sinkhole with a vertical abyss and vibrant reef life nearby.',
  },
  {
    id: 'uss-kittiwake',
    slug: 'uss-kittiwake-cayman',
    name: 'USS Kittiwake (Grand Cayman)',
    lat: 19.369,
    lng: -81.401,
    country: 'Cayman Islands',
    bestTime: 'Dec–May',
    waterTemp: '26–28°C',
    highlights: ['Wreck', 'Clear viz'],
    difficulty: 'Beginner',
    maxDepth: 20,
    avgDepth: 15,
    depth: 20,
    diveTypes: ['Scuba', 'Snorkel'],
    description: 'Artificial reef wreck with easy access and excellent visibility.',
  },
  {
    id: 'german-channel-palau',
    slug: 'german-channel-palau',
    name: 'German Channel (Palau)',
    lat: 7.283,
    lng: 134.468,
    country: 'Palau',
    bestTime: 'Nov–Apr',
    waterTemp: '27–29°C',
    highlights: ['Manta cleaning station', 'Sharks'],
    difficulty: 'Intermediate',
    maxDepth: 25,
    avgDepth: 18,
    depth: 18,
    diveTypes: ['Scuba'],
    description: 'Current-swept channel with manta cleaning stations and reef sharks.',
  },
  {
    id: 'monad-shoal',
    slug: 'monad-shoal-malapascua',
    name: 'Monad Shoal (Malapascua)',
    lat: 11.309,
    lng: 124.171,
    country: 'Philippines',
    bestTime: 'Nov–May',
    waterTemp: '26–29°C',
    highlights: ['Thresher sharks'],
    difficulty: 'Intermediate',
    maxDepth: 30,
    avgDepth: 25,
    depth: 25,
    diveTypes: ['Scuba'],
    description: 'Offshore seamount famed for sunrise encounters with thresher sharks.',
  },
  {
    id: 'apo-reef',
    slug: 'apo-reef-philippines',
    name: 'Apo Reef (Philippines)',
    lat: 12.666,
    lng: 120.416,
    country: 'Philippines',
    bestTime: 'Dec–May',
    waterTemp: '26–29°C',
    highlights: ['Walls', 'Sharks', 'Turtles'],
    difficulty: 'Intermediate',
    maxDepth: 30,
    avgDepth: 20,
    depth: 20,
    diveTypes: ['Scuba'],
    description: 'Second-largest contiguous coral reef in the world with vibrant walls.',
  },
  {
    id: 'coron-wrecks',
    slug: 'coron-wrecks-philippines',
    name: 'Coron Wrecks (Philippines)',
    lat: 12.0,
    lng: 120.2,
    country: 'Philippines',
    bestTime: 'Nov–Jun',
    waterTemp: '26–29°C',
    highlights: ['WWII wrecks'],
    difficulty: 'Intermediate',
    maxDepth: 30,
    avgDepth: 25,
    depth: 25,
    diveTypes: ['Scuba'],
    description: 'A cluster of WWII shipwrecks covered in corals around Busuanga/Coron.',
  },
  {
    id: 'anilao-batangas',
    slug: 'anilao-batangas',
    name: 'Anilao (Batangas)',
    lat: 13.747,
    lng: 120.884,
    country: 'Philippines',
    bestTime: 'Nov–May',
    waterTemp: '26–29°C',
    highlights: ['Macro', 'Critters'],
    difficulty: 'Beginner',
    maxDepth: 18,
    avgDepth: 12,
    depth: 15,
    diveTypes: ['Scuba'],
    description: 'Macro photography mecca with nudibranchs, frogfish, and flamboyant cuttlefish.',
  },
  {
    id: 'puerto-galera',
    slug: 'puerto-galera',
    name: 'Puerto Galera (Philippines)',
    lat: 13.514,
    lng: 120.953,
    country: 'Philippines',
    bestTime: 'Nov–May',
    waterTemp: '26–29°C',
    highlights: ['Drifts', 'Macro', 'Reefs'],
    difficulty: 'Beginner',
    maxDepth: 30,
    avgDepth: 18,
    depth: 18,
    diveTypes: ['Scuba', 'Freedive', 'Snorkel'],
    description: 'Varied dive sites with healthy reefs, muck dives, and channel drifts.',
  },
  {
    id: 'wakatobi',
    slug: 'wakatobi-indonesia',
    name: 'Wakatobi (Indonesia)',
    lat: -5.3,
    lng: 123.6,
    country: 'Indonesia',
    bestTime: 'Apr–Dec',
    waterTemp: '27–29°C',
    highlights: ['Pristine reefs', 'Walls'],
    difficulty: 'Beginner',
    maxDepth: 25,
    avgDepth: 15,
    depth: 15,
    diveTypes: ['Scuba', 'Snorkel'],
    description: 'Remote protected reefs with exceptional coral coverage and easy conditions.',
  },
  {
    id: 'lembeh-strait',
    slug: 'lembeh-strait',
    name: 'Lembeh Strait (Indonesia)',
    lat: 1.453,
    lng: 125.202,
    country: 'Indonesia',
    bestTime: 'Jul–Oct, Feb–Apr',
    waterTemp: '26–28°C',
    highlights: ['Muck', 'Rare critters'],
    difficulty: 'Beginner',
    maxDepth: 20,
    avgDepth: 12,
    depth: 12,
    diveTypes: ['Scuba'],
    description: 'Black-sand muck diving capital renowned for unusual macro life.',
  },
  {
    id: 'alor',
    slug: 'alor-indonesia',
    name: 'Alor (Indonesia)',
    lat: -8.267,
    lng: 124.567,
    country: 'Indonesia',
    bestTime: 'Apr–Nov',
    waterTemp: '25–28°C',
    highlights: ['Clear viz', 'Critters', 'Reefs'],
    difficulty: 'Intermediate',
    maxDepth: 30,
    avgDepth: 18,
    depth: 18,
    diveTypes: ['Scuba'],
    description: 'Off-the-beaten-path destination with clear waters and diverse sites.',
  },
  {
    id: 'banda-sea',
    slug: 'banda-sea-indonesia',
    name: 'Banda Sea (Indonesia)',
    lat: -4.525,
    lng: 129.896,
    country: 'Indonesia',
    bestTime: 'Sep–Nov',
    waterTemp: '27–29°C',
    highlights: ['Hammerheads (seasonal)', 'Walls'],
    difficulty: 'Advanced',
    maxDepth: 30,
    avgDepth: 25,
    depth: 25,
    diveTypes: ['Scuba'],
    description: 'Deep blue walls and seasonal schooling hammerheads on remote crossings.',
  },
  {
    id: 'usat-liberty',
    slug: 'usat-liberty-tulamben',
    name: 'USAT Liberty (Bali)',
    lat: -8.282,
    lng: 115.592,
    country: 'Indonesia',
    bestTime: 'Apr–Nov',
    waterTemp: '26–29°C',
    highlights: ['Wreck', 'Shallow'],
    difficulty: 'Beginner',
    maxDepth: 30,
    avgDepth: 18,
    depth: 15,
    diveTypes: ['Scuba'],
    description: 'Shore-access wreck covered in soft corals and teeming with fish.',
  },
  {
    id: 'lanai-cathedral',
    slug: 'lanai-cathedral-hawaii',
    name: 'Cathedrals (Lānaʻi, Hawaii)',
    lat: 20.76,
    lng: -156.9,
    country: 'USA',
    bestTime: 'Apr–Oct',
    waterTemp: '24–27°C',
    highlights: ['Lava caverns', 'Light beams'],
    difficulty: 'Beginner',
    maxDepth: 18,
    avgDepth: 15,
    depth: 15,
    diveTypes: ['Scuba'],
    description: 'Dramatic lava tubes and caverns with cathedral-like light rays.',
  },
  {
    id: 'salt-pier-bonaire',
    slug: 'salt-pier-bonaire',
    name: 'Salt Pier (Bonaire)',
    lat: 12.085,
    lng: -68.28,
    country: 'Caribbean Netherlands',
    bestTime: 'Sep–Nov',
    waterTemp: '26–29°C',
    highlights: ['Pillars with corals', 'Shore dive'],
    difficulty: 'Beginner',
    maxDepth: 15,
    avgDepth: 12,
    depth: 12,
    diveTypes: ['Scuba', 'Snorkel'],
    description: 'Iconic shore dive with photogenic pier pillars and abundant fish.',
  },
  {
    id: 'palancar-cozumel',
    slug: 'palancar-cozumel',
    name: 'Palancar (Cozumel)',
    lat: 20.35,
    lng: -87.02,
    country: 'Mexico',
    bestTime: 'Dec–May',
    waterTemp: '26–28°C',
    highlights: ['Drifts', 'Coral swim-throughs'],
    difficulty: 'Beginner',
    maxDepth: 25,
    avgDepth: 18,
    depth: 18,
    diveTypes: ['Scuba'],
    description: 'Gentle drifts along towering coral formations with crystal visibility.',
  },
  {
    id: 'turneffe-belize',
    slug: 'turneffe-atoll-belize',
    name: 'Turneffe Atoll (Belize)',
    lat: 17.33,
    lng: -87.86,
    country: 'Belize',
    bestTime: 'Dec–Jun',
    waterTemp: '26–29°C',
    highlights: ['Walls', 'Reefs'],
    difficulty: 'Beginner',
    maxDepth: 30,
    avgDepth: 18,
    depth: 18,
    diveTypes: ['Scuba'],
    description: 'Vast atoll with walls, patch reefs, and mangrove nurseries.',
  },
  {
    id: 'french-cay-tci',
    slug: 'french-cay-turks-and-caicos',
    name: 'French Cay (Turks & Caicos)',
    lat: 21.33,
    lng: -71.62,
    country: 'Turks & Caicos',
    bestTime: 'Nov–May',
    waterTemp: '24–29°C',
    highlights: ['Walls', 'Sharks'],
    difficulty: 'Beginner',
    maxDepth: 30,
    avgDepth: 20,
    depth: 20,
    diveTypes: ['Scuba'],
    description: 'Steep walls and frequent shark sightings in clear blue water.',
  },
  {
    id: 'beqa-lagoon',
    slug: 'beqa-lagoon-fiji',
    name: 'Beqa Lagoon (Fiji)',
    lat: -18.37,
    lng: 178.1,
    country: 'Fiji',
    bestTime: 'May–Oct',
    waterTemp: '25–28°C',
    highlights: ['Shark dives', 'Soft corals'],
    difficulty: 'Intermediate',
    maxDepth: 30,
    avgDepth: 18,
    depth: 18,
    diveTypes: ['Scuba'],
    description: 'Renowned shark encounters and colorful soft coral reefs.',
  },
  {
    id: 'great-astrolabe-reef',
    slug: 'great-astrolabe-reef-fiji',
    name: 'Great Astrolabe Reef (Fiji)',
    lat: -18.8,
    lng: 178.5,
    country: 'Fiji',
    bestTime: 'May–Oct',
    waterTemp: '25–28°C',
    highlights: ['Walls', 'Reefs', 'Mantas (seasonal)'],
    difficulty: 'Beginner',
    maxDepth: 25,
    avgDepth: 15,
    depth: 15,
    diveTypes: ['Scuba'],
    description: 'One of the world’s largest barrier reefs with healthy walls and bommies.',
  },
  {
    id: 'kimbe-bay',
    slug: 'kimbe-bay-png',
    name: 'Kimbe Bay (PNG)',
    lat: -5.48,
    lng: 150.15,
    country: 'Papua New Guinea',
    bestTime: 'May–Nov',
    waterTemp: '27–29°C',
    highlights: ['Biodiversity', 'Seamounts'],
    difficulty: 'Intermediate',
    maxDepth: 25,
    avgDepth: 18,
    depth: 18,
    diveTypes: ['Scuba'],
    description: 'Volcanic seamounts with dense fish schools and pristine hard corals.',
  },
  {
    id: 'solomon-iron-bottom',
    slug: 'iron-bottom-sound-solomon',
    name: 'Iron Bottom Sound (Solomons)',
    lat: -9.29,
    lng: 160.0,
    country: 'Solomon Islands',
    bestTime: 'May–Nov',
    waterTemp: '27–29°C',
    highlights: ['WWII wrecks', 'Reefs'],
    difficulty: 'Intermediate',
    depth: 25,
    description: 'Historic WWII wrecks and healthy reefs near Guadalcanal.',
  },
  {
    id: 'poor-knights',
    slug: 'poor-knights-new-zealand',
    name: 'Poor Knights Islands (New Zealand)',
    lat: -35.48,
    lng: 174.73,
    country: 'New Zealand',
    bestTime: 'Dec–Apr',
    waterTemp: '16–22°C',
    highlights: ['Caves', 'Kelp', 'Pelagics (summer)'],
    difficulty: 'Beginner',
    maxDepth: 30,
    avgDepth: 18,
    depth: 18,
    diveTypes: ['Scuba', 'Snorkel'],
    description: 'Marine reserve with arches, kelp forests, and seasonal pelagics.',
  },
  {
    id: 'tofo-mozambique',
    slug: 'tofo-mozambique',
    name: 'Tofo (Mozambique)',
    lat: -23.86,
    lng: 35.55,
    country: 'Mozambique',
    bestTime: 'May–Nov',
    waterTemp: '23–27°C',
    highlights: ['Mantas', 'Whale sharks'],
    difficulty: 'Intermediate',
    maxDepth: 25,
    avgDepth: 18,
    depth: 18,
    diveTypes: ['Scuba', 'Snorkel'],
    description: 'Plankton-rich waters attracting giant mantas and whale sharks year-round.',
  },
  {
    id: 'princess-alice-azores',
    slug: 'princess-alice-bank-azores',
    name: 'Princess Alice Bank (Azores)',
    lat: 38.93,
    lng: -29.27,
    country: 'Portugal',
    bestTime: 'Jul–Sep',
    waterTemp: '20–24°C',
    highlights: ['Mobula rays', 'Blue water'],
    difficulty: 'Advanced',
    maxDepth: 40,
    avgDepth: 30,
    depth: 30,
    diveTypes: ['Scuba'],
    description: 'Offshore seamount with schooling mobulas in warm season.',
  },
  {
    id: 'fotteyo-kandu',
    slug: 'fotteyo-kandu-maldives',
    name: 'Fotteyo Kandu (Maldives)',
    lat: 3.5,
    lng: 73.48,
    country: 'Maldives',
    bestTime: 'Jan–Apr',
    waterTemp: '27–30°C',
    highlights: ['Channels', 'Sharks'],
    difficulty: 'Advanced',
    maxDepth: 40,
    avgDepth: 25,
    depth: 25,
    diveTypes: ['Scuba'],
    description: 'Eastern atoll channel with strong currents and grey reef sharks.',
  },
  {
    id: 'hanifaru-bay',
    slug: 'hanifaru-bay-maldives',
    name: 'Hanifaru Bay (Maldives)',
    lat: 5.17,
    lng: 73.12,
    country: 'Maldives',
    bestTime: 'Jun–Oct',
    waterTemp: '27–29°C',
    highlights: ['Manta aggregation', 'Whale sharks'],
    difficulty: 'Beginner',
    maxDepth: 5,
    avgDepth: 3,
    depth: 5,
    diveTypes: ['Snorkel'],
    description: 'Seasonal plankton blooms bring huge manta aggregations (snorkel-focused).',
  },
  {
    id: 'rangiroa-tiputa',
    slug: 'tiputa-pass-rangiroa',
    name: 'Tiputa Pass (Rangiroa)',
    lat: -14.953,
    lng: -147.628,
    country: 'French Polynesia',
    bestTime: 'Jun–Aug, Dec–Mar',
    waterTemp: '26–29°C',
    highlights: ['Sharks', 'Dolphins', 'Drifts'],
    difficulty: 'Advanced',
    maxDepth: 30,
    avgDepth: 20,
    depth: 20,
    diveTypes: ['Scuba'],
    description: 'High-energy pass with sharks, dolphins, and powerful tidal currents.',
  },
  {
    id: 'gordon-rocks',
    slug: 'gordon-rocks-galapagos',
    name: 'Gordon Rocks (Galápagos)',
    lat: -0.773,
    lng: -90.244,
    country: 'Ecuador',
    bestTime: 'Jun–Nov',
    waterTemp: '18–25°C',
    highlights: ['Hammerheads', 'Sea lions'],
    difficulty: 'Advanced',
    maxDepth: 30,
    avgDepth: 20,
    depth: 20,
    diveTypes: ['Scuba'],
    description: 'Exposed volcanic crater with schooling hammerheads and playful sea lions.',
  },
  {
    id: 'dos-ojos-cenote',
    slug: 'cenote-dos-ojos',
    name: 'Cenote Dos Ojos (Mexico)',
    lat: 20.307,
    lng: -87.36,
    country: 'Mexico',
    bestTime: 'Year-round',
    waterTemp: '24–25°C',
    highlights: ['Caverns', 'Stalactites'],
    difficulty: 'Beginner',
    depth: 10,
    description: 'Crystal-clear freshwater caverns with dramatic light beams and formations.',
  },
  {
    id: 'andros-blue-holes',
    slug: 'andros-blue-holes-bahamas',
    name: 'Andros Blue Holes (Bahamas)',
    lat: 24.7,
    lng: -77.8,
    country: 'Bahamas',
    bestTime: 'Nov–Apr',
    waterTemp: '24–27°C',
    highlights: ['Blue holes', 'Caves'],
    difficulty: 'Advanced',
    depth: 30,
    description: 'Network of inland and ocean blue holes with unique geology.',
  },
  {
    id: 'protea-banks',
    slug: 'protea-banks-south-africa',
    name: 'Protea Banks (South Africa)',
    lat: -30.84,
    lng: 30.27,
    country: 'South Africa',
    bestTime: 'Apr–Nov',
    waterTemp: '20–24°C',
    highlights: ['Sharks', 'Drifts'],
    difficulty: 'Advanced',
    depth: 30,
    description: 'Deep reef system with seasonal migrations of various shark species.',
  },
  {
    id: 'nosy-be',
    slug: 'nosy-be-madagascar',
    name: 'Nosy Be (Madagascar)',
    lat: -13.4,
    lng: 48.3,
    country: 'Madagascar',
    bestTime: 'Sep–Dec, Mar–May',
    waterTemp: '25–29°C',
    highlights: ['Whale sharks (seasonal)', 'Reefs'],
    difficulty: 'Beginner',
    depth: 15,
    description: 'Warm-water reefs and seasonal whale shark encounters off northwest Madagascar.',
  },
  {
    id: 'deception-island',
    slug: 'deception-island-antarctica',
    name: 'Deception Island (Antarctica)',
    lat: -62.97,
    lng: -60.65,
    country: 'Antarctica',
    bestTime: 'Dec–Mar',
    waterTemp: '-1–2°C',
    highlights: ['Polar diving', 'Geothermal vents'],
    difficulty: 'Advanced',
    depth: 15,
    description: 'Unique polar volcanic caldera offering surreal cold-water diving.',
  },
  {
    id: 'saltstraumen',
    slug: 'saltstraumen-norway',
    name: 'Saltstraumen (Norway)',
    lat: 67.23,
    lng: 14.62,
    country: 'Norway',
    bestTime: 'May–Sep',
    waterTemp: '6–14°C',
    highlights: ['Strong currents', 'Kelp forests'],
    difficulty: 'Advanced',
    maxDepth: 25,
    avgDepth: 20,
    depth: 20,
    diveTypes: ['Scuba', 'Freedive'],
    description: 'World’s strongest tidal current with spectacular marine life in kelp.',
  },
  {
    id: 'scapa-flow',
    slug: 'scapa-flow-scotland',
    name: 'Scapa Flow (Scotland)',
    lat: 58.94,
    lng: -3.14,
    country: 'United Kingdom',
    bestTime: 'May–Oct',
    waterTemp: '6–14°C',
    highlights: ['WWI wreck fleet'],
    difficulty: 'Advanced',
    maxDepth: 45,
    avgDepth: 30,
    depth: 35,
    diveTypes: ['Scuba'],
    description: 'Historic scuttled German fleet wrecks in cold, clear waters.',
  },
  {
    id: 'medes-islands',
    slug: 'medes-islands-spain',
    name: 'Medes Islands (Spain)',
    lat: 42.05,
    lng: 3.23,
    country: 'Spain',
    bestTime: 'May–Oct',
    waterTemp: '16–24°C',
    highlights: ['Groupers', 'Caves'],
    difficulty: 'Beginner',
    maxDepth: 25,
    avgDepth: 18,
    depth: 18,
    diveTypes: ['Scuba', 'Snorkel', 'Freedive'],
    description: 'Mediterranean marine reserve with friendly groupers and caverns.',
  },
  {
    id: 'great-blue-hole',
    slug: 'great-blue-hole',
    name: 'Great Blue Hole',
    lat: 17.3156,
    lng: -87.5346,
    country: 'Belize',
    bestTime: 'Apr–Jun',
    waterTemp: '26–29°C',
    highlights: ['Stalactites', 'Deep walls'],
    difficulty: 'Advanced',
    maxDepth: 40,
    avgDepth: 25,
    depth: 40,
    diveTypes: ['Scuba', 'Freedive', 'Snorkel'],
    description: 'Iconic sinkhole offering dramatic deep dive walls and limestone formations.',
  },
  {
    id: 'great-barrier-reef',
    slug: 'great-barrier-reef',
    name: 'Great Barrier Reef',
    lat: -18.2871,
    lng: 147.6992,
    country: 'Australia',
    bestTime: 'Jun–Nov',
    waterTemp: '24–29°C',
    highlights: ['Coral bommies', 'Turtles'],
    difficulty: 'Beginner',
    maxDepth: 18,
    avgDepth: 10,
    depth: 10,
    diveTypes: ['Scuba', 'Snorkel'],
    description: 'World’s largest reef system with abundant marine life and easy conditions.',
  },
  {
    id: 'sipadan',
    slug: 'sipadan',
    name: 'Sipadan',
    lat: 4.1149,
    lng: 118.6283,
    country: 'Malaysia',
    bestTime: 'Apr–Dec',
    waterTemp: '27–30°C',
    highlights: ['Barracuda tornado', 'Turtles'],
    difficulty: 'Intermediate',
    maxDepth: 30,
    avgDepth: 20,
    depth: 20,
    diveTypes: ['Scuba'],
    description: 'Famed for massive schools of fish, turtles, and steep walls.',
  },
  {
    id: 'galapagos-darwin',
    slug: 'galapagos-darwin',
    name: 'Darwin Arch (Galápagos)',
    lat: 1.67,
    lng: -91.99,
    country: 'Ecuador',
    bestTime: 'Jun–Nov',
    waterTemp: '18–25°C',
    highlights: ['Hammerheads', 'Whale sharks'],
    difficulty: 'Advanced',
    maxDepth: 30,
    avgDepth: 25,
    depth: 25,
    diveTypes: ['Scuba'],
    description: 'Pelagic action with hammerhead schools and seasonal whale sharks.',
  },
  {
    id: 'maldives-ari',
    slug: 'maldives-ari-atoll',
    name: 'Ari Atoll (Maldives)',
    lat: 3.8667,
    lng: 72.7333,
    country: 'Maldives',
    bestTime: 'Dec–May',
    waterTemp: '27–30°C',
    highlights: ['Mantas', 'Whale sharks'],
    difficulty: 'Beginner',
    depth: 12,
    description: 'Channels and cleaning stations with frequent manta and whale shark sightings.',
  },
  {
    id: 'palau-blue-corner',
    slug: 'blue-corner-palau',
    name: 'Blue Corner (Palau)',
    lat: 7.305,
    lng: 134.464,
    country: 'Palau',
    bestTime: 'Nov–Apr',
    waterTemp: '27–29°C',
    highlights: ['Sharks', 'Strong currents'],
    difficulty: 'Advanced',
    maxDepth: 30,
    avgDepth: 20,
    depth: 18,
    diveTypes: ['Scuba'],
    description: 'Adrenaline-fueled drift diving with grey reef sharks and large schools.',
  },
  {
    id: 'komodo-batu-bolong',
    slug: 'batu-bolong-komodo',
    name: 'Batu Bolong (Komodo)',
    lat: -8.5875,
    lng: 119.5697,
    country: 'Indonesia',
    bestTime: 'Apr–Nov',
    waterTemp: '25–28°C',
    highlights: ['Colorful reefs', 'Current-swept'],
    difficulty: 'Intermediate',
    depth: 15,
    description: 'Pinacle with exceptional coral and fish life; currents can be strong.',
  },
  {
    id: 'egypt-brothers',
    slug: 'brothers-islands-egypt',
    name: 'Brothers Islands (Egypt)',
    lat: 26.3402,
    lng: 34.8443,
    country: 'Egypt',
    bestTime: 'Mar–Jun, Sep–Nov',
    waterTemp: '22–28°C',
    highlights: ['Oceanic whitetips', 'Wrecks'],
    difficulty: 'Advanced',
    maxDepth: 40,
    avgDepth: 30,
    depth: 30,
    diveTypes: ['Scuba'],
    description: 'Remote offshore reefs with sharks and spectacular walls and wrecks.',
  },
  {
    id: 'bahamas-tiger-beach',
    slug: 'tiger-beach-bahamas',
    name: 'Tiger Beach (Bahamas)',
    lat: 26.997,
    lng: -79.080,
    country: 'Bahamas',
    bestTime: 'Oct–Apr',
    waterTemp: '24–27°C',
    highlights: ['Tiger sharks', 'Clear sand flats'],
    difficulty: 'Beginner',
    maxDepth: 12,
    avgDepth: 10,
    depth: 12,
    diveTypes: ['Scuba'],
    description: 'Shallow sandy area famous for reliable tiger shark encounters.',
  },
  {
    id: 'mexico-socorro',
    slug: 'socorro-mexico',
    name: 'Socorro (Revillagigedo)',
    lat: 18.7833,
    lng: -110.95,
    country: 'Mexico',
    bestTime: 'Nov–May',
    waterTemp: '21–26°C',
    highlights: ['Giant mantas', 'Sharks'],
    difficulty: 'Advanced',
    depth: 20,
    description: 'Remote volcanic islands with giant mantas and abundant pelagics.',
  },
  {
    id: 'iceland-silfra',
    slug: 'silfra-iceland',
    name: 'Silfra Fissure (Iceland)',
    lat: 64.255,
    lng: -21.123,
    country: 'Iceland',
    bestTime: 'Year-round',
    waterTemp: '2–4°C',
    highlights: ['Clear glacial water', 'Continental rift'],
    difficulty: 'Beginner',
    maxDepth: 18,
    avgDepth: 10,
    depth: 18,
    diveTypes: ['Scuba', 'Snorkel'],
    description: 'Dive between tectonic plates in some of the clearest water on Earth.',
  },
  {
    id: 'south-africa-sardine-run',
    slug: 'sardine-run-south-africa',
    name: 'Sardine Run (South Africa)',
    lat: -31.6,
    lng: 29.5,
    country: 'South Africa',
    bestTime: 'Jun–Jul',
    waterTemp: '18–22°C',
    highlights: ['Bait balls', 'Dolphins', 'Sharks'],
    difficulty: 'Advanced',
    depth: 10,
    description: 'Seasonal spectacle with massive sardine bait balls and predators.',
  },
];
