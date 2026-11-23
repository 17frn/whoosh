/**
 * Smart Geolocation & Coordinate Resolver for Timeline Moments
 * Resolves accurate coordinates from Google Maps URLs, local districts/subdistricts,
 * and fixes inaccurate/province-level random coordinates.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

// ── Accurate District / Town / POI Coordinates in Banten & Jabodetabek ────────
interface SubLocationRule {
  keywords: string[];
  lat: number;
  lng: number;
  radiusKm?: number;
}

const ACCURATE_LOCATIONS: SubLocationRule[] = [
  // ── Tangerang Selatan (Tangsel) ───────────────────────────────────
  {
    keywords: ['pamulang', 'taman vip', 'taman eksis', 'sasmita', 'reneni', 'benda baru', 'kedaung'],
    lat: -6.3444,
    lng: 106.7384,
  },
  {
    keywords: ['ciputat timur', 'pisangan', 'cireundeu', 'rengas', 'rempoa'],
    lat: -6.3056,
    lng: 106.7611,
  },
  {
    keywords: ['ciputat', 'uin jakarta', 'pasar ciputat', 'jombang', 'serua'],
    lat: -6.3117,
    lng: 106.7461,
  },
  {
    keywords: ['bintaro', 'pondok aren', 'jurang mangu', 'bintaro jaya', 'bintaro plaza', 'bxchange', 'pondok betung', 'pondok kacang'],
    lat: -6.2750,
    lng: 106.7150,
  },
  {
    keywords: ['serpong utara', 'alam sutera', 'pakulonan', 'jelupang', 'pakualam'],
    lat: -6.2480,
    lng: 106.6580,
  },
  {
    keywords: ['serpong', 'bsd', 'bsd city', 'aeon bsd', 'the breeze', 'rawa buntu', 'lengkong gudang', 'ciater'],
    lat: -6.3089,
    lng: 106.6667,
  },
  {
    keywords: ['setu', 'muncul', 'babakan', 'bakti jaya', 'keranggan', 'puspiptek'],
    lat: -6.3500,
    lng: 106.6800,
  },
  {
    keywords: ['tangerang selatan', 'tangsel'],
    lat: -6.2917,
    lng: 106.7118,
  },

  // ── Kota Tangerang ───────────────────────────────────────────────
  {
    keywords: ['ciledug', 'karang tengah', 'larangan', 'paninggilan', 'sudimara'],
    lat: -6.2289,
    lng: 106.7089,
  },
  {
    keywords: ['cipondoh', 'danau cipondoh', 'gondrong', 'poris plawad'],
    lat: -6.1850,
    lng: 106.6800,
  },
  {
    keywords: ['karawaci', 'lippo karawaci', 'supermal karawaci', 'uph'],
    lat: -6.2089,
    lng: 106.6189,
  },
  {
    keywords: ['batuceper', 'benda', 'neglasari', 'bandara soekarno hatta', 'soetta'],
    lat: -6.1350,
    lng: 106.6600,
  },
  {
    keywords: ['kota tangerang', 'alun-alun tangerang', 'pasar lama tangerang', 'tangerang kota'],
    lat: -6.1783,
    lng: 106.6319,
  },

  // ── Kabupaten Tangerang ──────────────────────────────────────────
  {
    keywords: ['gading serpong', 'kelapa dua', 'summarecon serpong', 'curug', 'bonang'],
    lat: -6.2450,
    lng: 106.6250,
  },
  {
    keywords: ['citra raya', 'cikupa', 'panongan'],
    lat: -6.2400,
    lng: 106.5200,
  },
  {
    keywords: ['tigaraksa', 'pemda tigaraksa'],
    lat: -6.2625,
    lng: 106.4719,
  },
  {
    keywords: ['balaraja', 'jayanti', 'sukamulya'],
    lat: -6.1950,
    lng: 106.4500,
  },
  {
    keywords: ['pasar kemis', 'rajeg', 'sepatan'],
    lat: -6.1700,
    lng: 106.5500,
  },
  {
    keywords: ['teluknaga', 'kosambi', 'pantai pasir putih', 'pik 2 banten'],
    lat: -6.0750,
    lng: 106.6900,
  },
  {
    keywords: ['kabupaten tangerang', 'kab tangerang'],
    lat: -6.2625,
    lng: 106.4719,
  },

  // ── Kota Cilegon ─────────────────────────────────────────────────
  {
    keywords: ['merak', 'pelabuhan merak', 'pulo merau', 'gerem'],
    lat: -5.9300,
    lng: 105.9950,
  },
  {
    keywords: ['cilegon', 'kota cilegon', 'krakatau', 'ciwandan'],
    lat: -6.0174,
    lng: 106.0538,
  },

  // ── Kota & Kab. Serang ───────────────────────────────────────────
  {
    keywords: ['banten lama', 'kasemen', 'masjid agung banten'],
    lat: -6.0350,
    lng: 106.1550,
  },
  {
    keywords: ['kota serang', 'alun-alun serang', 'cipocok', 'serang kota'],
    lat: -6.1200,
    lng: 106.1503,
  },
  {
    keywords: ['anyer', 'pantai anyer', 'cinangka', 'mercusuar cikoneng'],
    lat: -6.0500,
    lng: 105.9200,
  },
  {
    keywords: ['ciruas', 'kragilan', 'cikande', 'pontang'],
    lat: -6.1350,
    lng: 106.2800,
  },
  {
    keywords: ['kabupaten serang', 'kab serang'],
    lat: -6.1982,
    lng: 106.0158,
  },

  // ── Kabupaten Pandeglang ─────────────────────────────────────────
  {
    keywords: ['carita', 'pantai carita', 'labuan'],
    lat: -6.3100,
    lng: 105.8400,
  },
  {
    keywords: ['tanjung lesung', 'panimbang'],
    lat: -6.5400,
    lng: 105.6500,
  },
  {
    keywords: ['ujung kulon', 'taman nasional ujung kulon', 'sumur', 'peucang'],
    lat: -6.7500,
    lng: 105.3500,
  },
  {
    keywords: ['pandeglang', 'kota pandeglang', 'gunung karang', 'cadasari'],
    lat: -6.3100,
    lng: 106.1050,
  },

  // ── Kabupaten Lebak ──────────────────────────────────────────────
  {
    keywords: ['rangkasbitung', 'rangkas', 'alun-alun rangkasbitung', 'mualaf'],
    lat: -6.3550,
    lng: 106.2450,
  },
  {
    keywords: ['sawarna', 'pantai sawarna', 'tanjung layar', 'bayah'],
    lat: -6.9800,
    lng: 106.3100,
  },
  {
    keywords: ['baduy', 'kanekes', 'baduy dalam', 'baduy luar', 'ciboleger'],
    lat: -6.5800,
    lng: 106.2200,
  },
  {
    keywords: ['malingping', 'binuangeun', 'pantai bagedur'],
    lat: -6.7900,
    lng: 105.9900,
  },
  {
    keywords: ['lebak', 'kabupaten lebak', 'kab lebak'],
    lat: -6.6534,
    lng: 106.2519,
  },

  // ── DKI Jakarta (Tetangga Banten) ─────────────────────────────────
  {
    keywords: ['jakarta selatan', 'jaksel', 'pondok indah', 'kebayoran', 'fatmawati', 'cilandak', 'blok m'],
    lat: -6.2615,
    lng: 106.8106,
  },
  {
    keywords: ['jakarta barat', 'jakbar', 'kebon jeruk', 'puri indah', 'kembangan', 'cengkareng'],
    lat: -6.1683,
    lng: 106.7588,
  },
  {
    keywords: ['jakarta pusat', 'jakpus', 'monas', 'thamrin', 'sudirman', 'gambir', 'senayan'],
    lat: -6.1865,
    lng: 106.8341,
  },
  {
    keywords: ['jakarta utara', 'jakut', 'ancol', 'pluit', 'kelapa gading', 'pantai indah kapuk', 'pik'],
    lat: -6.1384,
    lng: 106.8640,
  },
  {
    keywords: ['jakarta timur', 'jaktim', 'tmii', 'rawamangun', 'cakung', 'jatinegara'],
    lat: -6.2250,
    lng: 106.9004,
  },
  {
    keywords: ['jakarta', 'dki jakarta'],
    lat: -6.2088,
    lng: 106.8456,
  },

  // ── Jawa Barat (Depok, Bogor, dll.) ──────────────────────────────
  {
    keywords: ['cinere', 'sawangan', 'depok', 'ui depok', 'margonda'],
    lat: -6.3300,
    lng: 106.7850,
  },
  {
    keywords: ['bogor', 'parung', 'gunung sindur', 'ciseeng'],
    lat: -6.4200,
    lng: 106.7200,
  },
  {
    keywords: ['bandung'],
    lat: -6.9175,
    lng: 107.6191,
  },
];

/**
 * Extract GPS coordinates from various Google Maps URLs
 */
export function extractCoordinatesFromUrl(url?: string): LatLng | null {
  if (!url || typeof url !== 'string') return null;

  // 1. Google Maps iframe embed format: pb=!1m18!1m12!... !2d[lng]!3d[lat]
  // Note: in protobuf, 3d is Latitude and 2d/4d is Longitude
  const latMatch = url.match(/!3d(-?\d+\.\d+)/);
  const lngMatch = url.match(/![24]d(-?\d+\.\d+)/);
  if (latMatch && lngMatch) {
    const lat = parseFloat(latMatch[1]);
    const lng = parseFloat(lngMatch[1]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 2. Direct @lat,lng format: /@ -6.2917,106.7118
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 3. Query param q=lat,lng or ll=lat,lng or daddr=lat,lng
  const queryMatch = url.match(/[?&](?:q|ll|daddr|saddr)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (queryMatch) {
    const lat = parseFloat(queryMatch[1]);
    const lng = parseFloat(queryMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  return null;
}

function isValidLatLng(lat: number, lng: number): boolean {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Generate a small, deterministic jitter based on string id
 * so multiple markers in the exact same location don't overlap,
 * but remain stable across re-renders without jumping around.
 */
function getDeterministicOffset(id: string = '', index: number = 0): { dLat: number; dLng: number } {
  let hash = 0;
  const str = id + '_' + index;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const angle = (Math.abs(hash) % 360) * (Math.PI / 180);
  const radius = 0.003 + (Math.abs(hash >> 3) % 4) * 0.0015; // ~300m - 700m spread
  return {
    dLat: Math.sin(angle) * radius,
    dLng: Math.cos(angle) * radius,
  };
}

// ── Fast Coordinate Memoization Cache ─────────────────────────────────────────
const resolvedCoordCache = new Map<string, LatLng>();

export function clearResolvedCoordCache(): void {
  resolvedCoordCache.clear();
}

/**
 * Smart Geocoding Resolver:
 * Takes a timeline item and returns the most accurate {lat, lng} coordinate available.
 * Resolves Google Maps URLs, local districts, and fixes broken/out-of-bounds fallbacks.
 * Results are cached in memory by item.id or location string for O(1) performance.
 */
export function resolveMomentCoordinates(item: {
  id?: string;
  title?: string;
  location?: string;
  mapEmbedUrl?: string;
  latitude?: number;
  longitude?: number;
}): LatLng {
  const cacheKey = item.id || `${item.location || ''}__${item.mapEmbedUrl || ''}__${item.latitude || ''}`;
  const cached = resolvedCoordCache.get(cacheKey);
  if (cached) return cached;

  let result: LatLng;

  // 1. Prioritas 1: Titik Manual Pilihan Pengguna (Pin Point Manual dari Form)
  if (
    typeof item.latitude === 'number' &&
    typeof item.longitude === 'number' &&
    isValidLatLng(item.latitude, item.longitude) &&
    (item.latitude !== 0 || item.longitude !== 0)
  ) {
    result = { lat: item.latitude, lng: item.longitude };
    resolvedCoordCache.set(cacheKey, result);
    return result;
  }

  // 2. Prioritas 2: Ekstraksi presisi dari URL Google Maps (Embed/Link)
  const fromUrl = extractCoordinatesFromUrl(item.mapEmbedUrl);
  if (fromUrl) {
    resolvedCoordCache.set(cacheKey, fromUrl);
    return fromUrl;
  }

  // Normalisasi string pencarian
  const searchStr = `${item.location || ''} ${item.title || ''}`.toLowerCase();

  // 3. Prioritas 3: Analisis teks lokasi ke kamus wilayah akurat (Tangsel, Pamulang, Ciputat, Serpong, dll.)
  for (const rule of ACCURATE_LOCATIONS) {
    if (rule.keywords.some(kw => searchStr.includes(kw))) {
      const offset = getDeterministicOffset(item.id || searchStr);
      result = {
        lat: rule.lat + offset.dLat,
        lng: rule.lng + offset.dLng,
      };
      resolvedCoordCache.set(cacheKey, result);
      return result;
    }
  }

  // 4. Fallback Default untuk momen di Banten (Area Tangerang Selatan pusat)
  const fallbackOffset = getDeterministicOffset(item.id || 'tangsel_fallback');
  result = {
    lat: -6.2917 + fallbackOffset.dLat,
    lng: 106.7118 + fallbackOffset.dLng,
  };
  resolvedCoordCache.set(cacheKey, result);
  return result;
}
