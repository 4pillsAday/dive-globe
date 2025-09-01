export type Airport = { iata: string; name?: string; lat: number; lng: number };

export const AIRPORTS: Airport[] = [
  { iata: 'SOQ', name: 'Sorong', lat: -0.926, lng: 131.121 },
  { iata: 'BZE', name: 'Belize City', lat: 17.539, lng: -88.308 },
  { iata: 'CNS', name: 'Cairns', lat: -16.885, lng: 145.755 },
  { iata: 'TWU', name: 'Tawau', lat: 4.320, lng: 118.127 },
  { iata: 'LBJ', name: 'Labuan Bajo', lat: -8.486, lng: 119.889 },
  { iata: 'GPS', name: 'Baltra', lat: -0.453, lng: -90.266 },
  { iata: 'ROR', name: 'Koror', lat: 7.367, lng: 134.544 },
  { iata: 'MLE', name: 'Male', lat: 4.191, lng: 73.529 },
  { iata: 'SSH', name: 'Sharm el-Sheikh', lat: 27.977, lng: 34.394 },
  { iata: 'RMF', name: 'Marsa Alam', lat: 25.557, lng: 34.583 },
  { iata: 'SJO', name: 'San José', lat: 9.998, lng: -84.204 },
  { iata: 'SJD', name: 'Cabo San Lucas', lat: 23.151, lng: -109.721 },
  { iata: 'KOA', name: 'Kona', lat: 19.738, lng: -156.045 },
  { iata: 'BON', name: 'Bonaire', lat: 12.131, lng: -68.269 },
  { iata: 'TVU', name: 'Taveuni', lat: -16.690, lng: -179.876 },
  { iata: 'HKT', name: 'Phuket', lat: 8.113, lng: 98.316 },
  { iata: 'PPS', name: 'Puerto Princesa', lat: 9.742, lng: 118.759 },
  { iata: 'TKK', name: 'Chuuk', lat: 7.461, lng: 151.843 },
  { iata: 'FPO', name: 'Freeport', lat: 26.559, lng: -78.695 },
  { iata: 'DUR', name: 'Durban', lat: -29.614, lng: 31.119 },
  { iata: 'FAV', name: 'Fakarava', lat: -16.054, lng: -145.657 },
  { iata: 'LYB', name: 'Little Cayman', lat: 19.659, lng: -80.090 },
  { iata: 'PLS', name: 'Providenciales', lat: 21.774, lng: -72.265 },
  { iata: 'KEF', name: 'Reykjavík KEF', lat: 63.985, lng: -22.605 },
  { iata: 'DPS', name: 'Bali (Denpasar)', lat: -8.748, lng: 115.167 },
  { iata: 'OGG', name: 'Kahului (Maui)', lat: 20.898, lng: -156.430 },
  { iata: 'CZM', name: 'Cozumel', lat: 20.522, lng: -86.925 },
  { iata: 'GRO', name: 'Girona', lat: 41.900, lng: 2.760 },
  { iata: 'NAS', name: 'Nassau', lat: 25.039, lng: -77.466 },
  { iata: 'CUN', name: 'Cancún', lat: 21.036, lng: -86.877 },
  { iata: 'RGI', name: 'Rangiroa', lat: -14.956, lng: -147.661 },
  { iata: 'PDL', name: 'Ponta Delgada', lat: 37.741, lng: -25.697 },
  { iata: 'NOS', name: 'Nosy Be', lat: -13.312, lng: 48.314 },
  { iata: 'PUQ', name: 'Punta Arenas', lat: -53.002, lng: -70.854 },
  { iata: 'BOO', name: 'Bodø', lat: 67.269, lng: 14.365 },
  { iata: 'KOI', name: 'Kirkwall', lat: 58.958, lng: -2.904 },
  { iata: 'AMQ', name: 'Ambon', lat: -3.710, lng: 128.089 },
  { iata: 'ARD', name: 'Alor', lat: -8.132, lng: 124.598 },
  { iata: 'MDC', name: 'Manado', lat: 1.549, lng: 124.926 },
  { iata: 'WNI', name: 'Matahora (Wakatobi)', lat: -5.294, lng: 123.636 },
  { iata: 'SUV', name: 'Suva', lat: -18.043, lng: 178.559 },
  { iata: 'KDV', name: 'Kadavu', lat: -19.058, lng: 178.157 },
  { iata: 'INH', name: 'Inhambane', lat: -23.876, lng: 35.408 },
  // North America major
  { iata: 'SEA', name: 'Seattle-Tacoma', lat: 47.443, lng: -122.303 },
  { iata: 'PAE', name: 'Paine Field', lat: 47.906, lng: -122.281 },
  { iata: 'PDX', name: 'Portland', lat: 45.588, lng: -122.598 },
  { iata: 'SFO', name: 'San Francisco', lat: 37.621, lng: -122.379 },
  { iata: 'LAX', name: 'Los Angeles', lat: 33.942, lng: -118.408 },
  { iata: 'SAN', name: 'San Diego', lat: 32.733, lng: -117.193 },
  { iata: 'DEN', name: 'Denver', lat: 39.856, lng: -104.673 },
  { iata: 'DFW', name: 'Dallas/Fort Worth', lat: 32.899, lng: -97.040 },
  { iata: 'ATL', name: 'Atlanta', lat: 33.640, lng: -84.427 },
  { iata: 'ORD', name: "Chicago O'Hare", lat: 41.974, lng: -87.907 },
  { iata: 'JFK', name: 'New York JFK', lat: 40.641, lng: -73.778 },
  { iata: 'EWR', name: 'Newark', lat: 40.689, lng: -74.174 },
  { iata: 'BOS', name: 'Boston', lat: 42.365, lng: -71.009 },
  { iata: 'YYZ', name: 'Toronto', lat: 43.677, lng: -79.624 },
  { iata: 'YVR', name: 'Vancouver', lat: 49.195, lng: -123.181 },
  { iata: 'MEX', name: 'Mexico City', lat: 19.436, lng: -99.072 },
  { iata: 'CUN', name: 'Cancún', lat: 21.036, lng: -86.877 },
  // Europe major
  { iata: 'LHR', name: 'London Heathrow', lat: 51.470, lng: -0.454 },
  { iata: 'CDG', name: 'Paris Charles de Gaulle', lat: 49.009, lng: 2.547 },
  { iata: 'AMS', name: 'Amsterdam', lat: 52.310, lng: 4.768 },
  { iata: 'FRA', name: 'Frankfurt', lat: 50.037, lng: 8.562 },
  { iata: 'MAD', name: 'Madrid', lat: 40.472, lng: -3.561 },
  { iata: 'BCN', name: 'Barcelona', lat: 41.297, lng: 2.083 },
  { iata: 'FCO', name: 'Rome Fiumicino', lat: 41.799, lng: 12.246 },
  // Asia-Pacific major
  { iata: 'HND', name: 'Tokyo Haneda', lat: 35.549, lng: 139.779 },
  { iata: 'NRT', name: 'Tokyo Narita', lat: 35.773, lng: 140.392 },
  { iata: 'ICN', name: 'Seoul Incheon', lat: 37.460, lng: 126.440 },
  { iata: 'SIN', name: 'Singapore', lat: 1.364, lng: 103.991 },
  { iata: 'BKK', name: 'Bangkok', lat: 13.690, lng: 100.750 },
  { iata: 'SYD', name: 'Sydney', lat: -33.939, lng: 151.175 },
  { iata: 'MEL', name: 'Melbourne', lat: -37.669, lng: 144.841 },
  { iata: 'AKL', name: 'Auckland', lat: -37.008, lng: 174.792 },
  { iata: 'HNL', name: 'Honolulu', lat: 21.325, lng: -157.924 },
  // Middle East / Africa major
  { iata: 'DXB', name: 'Dubai', lat: 25.253, lng: 55.365 },
  { iata: 'DOH', name: 'Doha', lat: 25.274, lng: 51.613 },
  { iata: 'AUH', name: 'Abu Dhabi', lat: 24.433, lng: 54.651 },
  { iata: 'CPT', name: 'Cape Town', lat: -33.971, lng: 18.602 },
  { iata: 'JNB', name: 'Johannesburg', lat: -26.139, lng: 28.246 },
];

function toRad(d: number): number { return (d * Math.PI) / 180; }
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function findNearestAirport(lat: number, lng: number): Airport | null {
  let best: Airport | null = null;
  let bestDist = Infinity;
  for (const a of AIRPORTS) {
    const d = haversine(lat, lng, a.lat, a.lng);
    if (d < bestDist) { bestDist = d; best = a; }
  }
  return best;
}


