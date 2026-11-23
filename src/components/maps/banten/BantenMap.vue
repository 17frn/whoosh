<template>
  <div class="banten-leaflet-wrap">
    <!-- Shared Floating Controls (Status Pill, Zoom, FAB Panel, Tile Switcher, Mask Toggle, Region Focus & Floating Card) -->
    <MapFloatingControls
      province-name="Banten"
      province-full-name="Banten &bull; Vektor BIG Resmi"
      :current-tile="currentTile"
      :is-mask-enabled="isMaskEnabled"
      :regions="BANTEN_REGIONS"
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
import MapFloatingControls from '../shared/MapFloatingControls.vue';
import { useLeafletProvinceMap, type RegionMeta } from '../../../composables/useLeafletProvinceMap';

const props = defineProps<{
  markers: TimelineData[];
}>();

const emit = defineEmits<{
  (e: 'marker-click', item: TimelineData, event?: any): void;
  (e: 'subregion-click', regionId: string): void;
}>();

const BANTEN_REGIONS: RegionMeta[] = [
  { id: 'tangsel', name: 'Kota Tangerang Selatan', shortName: 'Tangsel', type: 'kota', hasData: true, lat: -6.2917, lng: 106.7118, zoom: 13 },
  { id: 'kota_tangerang', name: 'Kota Tangerang', shortName: 'Tangerang', type: 'kota', hasData: true, lat: -6.1783, lng: 106.6319, zoom: 12 },
  { id: 'kab_tangerang', name: 'Kabupaten Tangerang', shortName: 'Kab. Tangerang', type: 'kabupaten', hasData: true, lat: -6.2625, lng: 106.4719, zoom: 11 },
  { id: 'kota_serang', name: 'Kota Serang', shortName: 'Serang', type: 'kota', hasData: true, lat: -6.1200, lng: 106.1503, zoom: 12 },
  { id: 'kab_serang', name: 'Kabupaten Serang', shortName: 'Kab. Serang', type: 'kabupaten', hasData: true, lat: -6.1982, lng: 106.0158, zoom: 11 },
  { id: 'cilegon', name: 'Kota Cilegon', shortName: 'Cilegon', type: 'kota', hasData: true, lat: -6.0174, lng: 106.0538, zoom: 12 },
  { id: 'pandeglang', name: 'Kabupaten Pandeglang', shortName: 'Pandeglang', type: 'kabupaten', hasData: true, lat: -6.7028, lng: 105.8647, zoom: 10 },
  { id: 'lebak', name: 'Kabupaten Lebak', shortName: 'Lebak', type: 'kabupaten', hasData: true, lat: -6.6534, lng: 106.2519, zoom: 10 },
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
  provinceId: 'banten',
  center: [-6.42, 106.15],
  defaultZoom: 9,
  bounds: [
    [-7.10, 105.10],
    [-5.82, 106.85],
  ],
  maxBounds: [
    [-7.45, 104.70],
    [-5.55, 107.15],
  ],
  minZoom: 8,
  maxZoom: 18,
  regions: BANTEN_REGIONS,
  boundaryGlowColor: '#f59e0b',
  enableLod: true,
  getMarkers: () => props.markers,
  onMarkerClick: (item, event) => emit('marker-click', item, event),
  onRegionClick: (region) => {
    if (region.hasData) {
      emit('subregion-click', region.id);
    }
  },
});

const selectedRegionMoments = computed(() => {
  if (!selectedRegionInfo.value) return 0;
  if (selectedRegionInfo.value.id === 'tangsel') return props.markers.length;
  const kw = selectedRegionInfo.value.shortName.toLowerCase();
  return props.markers.filter(m => (m.location || '').toLowerCase().includes(kw)).length;
});
</script>

<style scoped>
.banten-leaflet-wrap {
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
