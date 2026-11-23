import { markRaw } from 'vue';

export type LodLevel = 'overview' | 'kabkota' | 'detailed';

export interface ProvinceGeoCacheEntry {
  provinceId: string;
  lodOverview?: any;
  lodKabKota?: any;
  lodDetailed?: any;
  loadedAt: number;
}

const geoCache = new Map<string, ProvinceGeoCacheEntry>();

/**
 * Lazy loads and caches geographic GeoJSON datasets by province and LOD.
 * All cached objects are marked raw to prevent deep Vue reactivity overhead.
 */
export async function getProvinceGeoData(provinceId: string, lod: LodLevel = 'overview'): Promise<any> {
  const normalizedId = provinceId.toLowerCase().replace(/-/g, '_');
  let entry = geoCache.get(normalizedId);

  if (!entry) {
    entry = {
      provinceId: normalizedId,
      loadedAt: Date.now(),
    };
    geoCache.set(normalizedId, entry);
  }

  // 1. Overview LOD
  if (lod === 'overview') {
    if (entry.lodOverview) return entry.lodOverview;

    let data: any = null;
    if (normalizedId === 'banten') {
      const mod = await import('./geojson/bantenLodOverview');
      data = mod.BANTEN_LOD_OVERVIEW;
    } else if (normalizedId === 'jakarta') {
      const mod = await import('./geojson/jakartaGeoData');
      data = mod.JAKARTA_GEOJSON;
    } else if (normalizedId === 'jawa_barat') {
      const mod = await import('./geojson/jawaBaratGeoData');
      data = mod.JAWA_BARAT_GEOJSON;
    } else if (normalizedId === 'tangsel') {
      const mod = await import('./geojson/banten/tangselGeoData');
      data = mod.TANGSEL_GEOJSON;
    } else if (normalizedId === 'jaksel') {
      const mod = await import('./geojson/jakarta/jakselGeoData');
      data = mod.JAKARTA_SELATAN_GEOJSON;
    } else if (normalizedId === 'jakpus') {
      const mod = await import('./geojson/jakarta/jakpusGeoData');
      data = mod.JAKARTA_PUSAT_GEOJSON;
    } else if (normalizedId === 'jakbar') {
      const mod = await import('./geojson/jakarta/jakbarGeoData');
      data = mod.JAKARTA_BARAT_GEOJSON;
    } else if (normalizedId === 'jaktim') {
      const mod = await import('./geojson/jakarta/jaktimGeoData');
      data = mod.JAKARTA_TIMUR_GEOJSON;
    } else if (normalizedId === 'jakut') {
      const mod = await import('./geojson/jakarta/jakutGeoData');
      data = mod.JAKARTA_UTARA_GEOJSON;
    } else if (normalizedId === 'bandung') {
      const mod = await import('./geojson/jawa-barat/bandungGeoData');
      data = mod.KOTA_BANDUNG_GEOJSON;
    }

    if (data) {
      entry.lodOverview = markRaw(data);
    }
    return entry.lodOverview;
  }

  // 2. Kab/Kota Administrative Division LOD
  if (lod === 'kabkota') {
    if (entry.lodKabKota) return entry.lodKabKota;

    let data: any = null;
    if (normalizedId === 'banten') {
      const mod = await import('./geojson/banten/bantenKabKotaGeoData');
      data = mod.BANTEN_KABKOTA_GEOJSON;
    } else if (normalizedId === 'jakarta') {
      const mod = await import('./geojson/jakarta/jakartaKabKotaGeoData');
      data = mod.JAKARTA_KABKOTA_GEOJSON;
    } else if (normalizedId === 'jawa_barat') {
      const mod = await import('./geojson/jawa-barat/jabarKabKotaGeoData');
      data = mod.JABAR_KABKOTA_GEOJSON;
    }

    if (data) {
      entry.lodKabKota = markRaw(data);
    }
    return entry.lodKabKota || entry.lodOverview;
  }

  // 3. Detailed Boundary LOD (Full precision where needed)
  if (lod === 'detailed') {
    if (entry.lodDetailed) return entry.lodDetailed;

    let data: any = null;
    if (normalizedId === 'banten') {
      const mod = await import('./geojson/bantenGeoData');
      data = mod.BANTEN_GEOJSON;
    }

    if (data) {
      entry.lodDetailed = markRaw(data);
    }
    return entry.lodDetailed || entry.lodKabKota || entry.lodOverview;
  }

  return entry.lodOverview;
}

/** Clear cache if memory needs to be purged (e.g. session changes) */
export function clearProvinceGeoCache(): void {
  geoCache.clear();
}
