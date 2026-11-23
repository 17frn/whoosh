<template>
  <div class="jakarta-leaflet-wrap">
    <!-- Shared Floating Controls (Status Pill, Zoom, FAB Panel, Tile Switcher, Mask Toggle, Region Focus & Floating Card) -->
    <MapFloatingControls
      province-name="DKI Jakarta"
      province-full-name="Daerah Khusus Ibukota Jakarta"
      :current-tile="currentTile"
      :is-mask-enabled="isMaskEnabled"
      :regions="JAKARTA_REGIONS"
      :active-region-id="activeRegionId"
      :selected-region-info="selectedRegionInfo"
      :region-moment-count="selectedRegionMoments"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @reset-view="resetView"
      @set-tile="setTileLayer"
      @toggle-mask="toggleMask"
      @select-region="focusRegion"
      @drilldown="(id) => $emit('subregion-click', id)"
      @close-region-card="activeRegionId = null"
    />

    <!-- Leaflet Map Container -->
    <div ref="mapContainerRef" class="bmap-map-canvas"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { TimelineData } from '../../../data/timeline';
import { JAKARTA_GEOJSON } from '../../../data/geojson/jakartaGeoData';
import MapFloatingControls from '../shared/MapFloatingControls.vue';
import { useLeafletProvinceMap, type RegionMeta } from '../../../composables/useLeafletProvinceMap';

const props = defineProps<{
  markers: TimelineData[];
}>();

const emit = defineEmits<{
  (e: 'marker-click', item: TimelineData, event?: any): void;
  (e: 'subregion-click', regionId: string): void;
}>();

const JAKARTA_REGIONS: RegionMeta[] = [
  { id: 'jaksel', name: 'Kota Administrasi Jakarta Selatan', shortName: 'Jakarta Selatan', type: 'kota', hasData: true, lat: -6.2771, lng: 106.8132, zoom: 12 },
  { id: 'jakpus', name: 'Kota Administrasi Jakarta Pusat', shortName: 'Jakarta Pusat', type: 'kota', hasData: true, lat: -6.1847, lng: 106.8248, zoom: 13 },
  { id: 'jakbar', name: 'Kota Administrasi Jakarta Barat', shortName: 'Jakarta Barat', type: 'kota', hasData: true, lat: -6.1589, lng: 106.7577, zoom: 12 },
  { id: 'jaktim', name: 'Kota Administrasi Jakarta Timur', shortName: 'Jakarta Timur', type: 'kota', hasData: true, lat: -6.2561, lng: 106.8930, zoom: 12 },
  { id: 'jakut', name: 'Kota Administrasi Jakarta Utara', shortName: 'Jakarta Utara', type: 'kota', hasData: true, lat: -6.1251, lng: 106.8657, zoom: 12 },
  { id: 'kep_seribu', name: 'Kabupaten Administrasi Kepulauan Seribu', shortName: 'Kep. Seribu', type: 'kabupaten', hasData: false, lat: -5.6728, lng: 106.5756, zoom: 10 },
];

const mapContainerRef = ref<HTMLDivElement | null>(null);

const {
  currentTile,
  isMaskEnabled,
  activeRegionId,
  selectedRegionInfo,
  setTileLayer,
  toggleMask,
  zoomIn,
  zoomOut,
  resetView,
  focusRegion,
} = useLeafletProvinceMap({
  containerRef: mapContainerRef,
  provinceId: 'jakarta',
  center: [-6.21, 106.845],
  defaultZoom: 12,
  bounds: [
    [-6.371, 106.687],
    [-6.088, 106.972],
  ],
  maxBounds: [
    [-6.45, 106.60],
    [-5.80, 107.05],
  ],
  minZoom: 9,
  geoJson: JAKARTA_GEOJSON,
  regions: JAKARTA_REGIONS,
  boundaryGlowColor: '#ef4444',
  enableLod: true,
  getMarkers: () => props.markers,
  onMarkerClick: (item, event) => emit('marker-click', item, event),
});

const selectedRegionMoments = computed(() => {
  if (!selectedRegionInfo.value) return 0;
  const kw = selectedRegionInfo.value.shortName.toLowerCase();
  return props.markers.filter(m => (m.location || '').toLowerCase().includes(kw)).length;
});
</script>

<style scoped>
.jakarta-leaflet-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #f8fafc;
}

.bmap-map-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
</style>
