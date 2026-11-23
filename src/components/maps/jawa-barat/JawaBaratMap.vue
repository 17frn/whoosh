<template>
  <div class="jabar-leaflet-wrap">
    <!-- Shared Floating Controls (Status Pill, Zoom, FAB Panel, Tile Switcher, Mask Toggle, Region Focus & Floating Card) -->
    <MapFloatingControls
      province-name="Jawa Barat"
      province-full-name="Jawa Barat"
      :current-tile="currentTile"
      :is-mask-enabled="isMaskEnabled"
      :regions="JABAR_REGIONS"
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
import { JAWA_BARAT_GEOJSON } from '../../../data/geojson/jawaBaratGeoData';
import MapFloatingControls from '../shared/MapFloatingControls.vue';
import { useLeafletProvinceMap, type RegionMeta } from '../../../composables/useLeafletProvinceMap';

const props = defineProps<{
  markers: TimelineData[];
}>();

const emit = defineEmits<{
  (e: 'marker-click', item: TimelineData, event?: any): void;
  (e: 'subregion-click', regionId: string): void;
}>();

const JABAR_REGIONS: RegionMeta[] = [
  { id: 'bandung', name: 'Kota Bandung', shortName: 'Kota Bandung', type: 'kota', hasData: true, lat: -6.8927, lng: 107.6313, zoom: 12 },
  { id: 'kota_bogor', name: 'Kota Bogor', shortName: 'Kota Bogor', type: 'kota', hasData: true, lat: -6.5938, lng: 106.7967, zoom: 12 },
  { id: 'kota_bekasi', name: 'Kota Bekasi', shortName: 'Kota Bekasi', type: 'kota', hasData: true, lat: -6.2955, lng: 106.9783, zoom: 12 },
  { id: 'depok', name: 'Kota Depok', shortName: 'Depok', type: 'kota', hasData: true, lat: -6.3907, lng: 106.8375, zoom: 12 },
  { id: 'cimahi', name: 'Kota Cimahi', shortName: 'Cimahi', type: 'kota', hasData: true, lat: -6.8928, lng: 107.5488, zoom: 13 },
  { id: 'kota_cirebon', name: 'Kota Cirebon', shortName: 'Kota Cirebon', type: 'kota', hasData: true, lat: -6.7466, lng: 108.5467, zoom: 13 },
  { id: 'kota_sukabumi', name: 'Kota Sukabumi', shortName: 'Sukabumi', type: 'kota', hasData: true, lat: -6.9433, lng: 106.9211, zoom: 13 },
  { id: 'kota_tasik', name: 'Kota Tasikmalaya', shortName: 'Tasikmalaya', type: 'kota', hasData: true, lat: -7.3759, lng: 108.2444, zoom: 13 },
  { id: 'banjar', name: 'Kota Banjar', shortName: 'Banjar', type: 'kota', hasData: true, lat: -7.3746, lng: 108.5762, zoom: 13 },
  { id: 'kab_bandung', name: 'Kabupaten Bandung', shortName: 'Kab. Bandung', type: 'kabupaten', hasData: true, lat: -7.0558, lng: 107.6642, zoom: 11 },
  { id: 'bandung_barat', name: 'Kabupaten Bandung Barat', shortName: 'Bandung Barat', type: 'kabupaten', hasData: true, lat: -6.8610, lng: 107.4491, zoom: 11 },
  { id: 'kab_bogor', name: 'Kabupaten Bogor', shortName: 'Kab. Bogor', type: 'kabupaten', hasData: true, lat: -6.5428, lng: 106.7887, zoom: 11 },
  { id: 'kab_bekasi', name: 'Kabupaten Bekasi', shortName: 'Kab. Bekasi', type: 'kabupaten', hasData: true, lat: -6.1996, lng: 107.1207, zoom: 11 },
  { id: 'karawang', name: 'Kabupaten Karawang', shortName: 'Karawang', type: 'kabupaten', hasData: true, lat: -6.2534, lng: 107.2992, zoom: 11 },
  { id: 'purwakarta', name: 'Kabupaten Purwakarta', shortName: 'Purwakarta', type: 'kabupaten', hasData: true, lat: -6.6034, lng: 107.4308, zoom: 11 },
  { id: 'subang', name: 'Kabupaten Subang', shortName: 'Subang', type: 'kabupaten', hasData: true, lat: -6.4576, lng: 107.7919, zoom: 11 },
  { id: 'indramayu', name: 'Kabupaten Indramayu', shortName: 'Indramayu', type: 'kabupaten', hasData: true, lat: -6.4609, lng: 108.1669, zoom: 11 },
  { id: 'kab_cirebon', name: 'Kabupaten Cirebon', shortName: 'Kab. Cirebon', type: 'kabupaten', hasData: true, lat: -6.7757, lng: 108.5972, zoom: 11 },
  { id: 'kuningan', name: 'Kabupaten Kuningan', shortName: 'Kuningan', type: 'kabupaten', hasData: true, lat: -6.9969, lng: 108.5887, zoom: 11 },
  { id: 'majalengka', name: 'Kabupaten Majalengka', shortName: 'Majalengka', type: 'kabupaten', hasData: true, lat: -6.8028, lng: 108.2351, zoom: 11 },
  { id: 'sumedang', name: 'Kabupaten Sumedang', shortName: 'Sumedang', type: 'kabupaten', hasData: true, lat: -6.8110, lng: 107.9864, zoom: 11 },
  { id: 'garut', name: 'Kabupaten Garut', shortName: 'Garut', type: 'kabupaten', hasData: true, lat: -7.2889, lng: 107.8309, zoom: 11 },
  { id: 'kab_tasik', name: 'Kabupaten Tasikmalaya', shortName: 'Kab. Tasik', type: 'kabupaten', hasData: true, lat: -7.4283, lng: 108.2155, zoom: 11 },
  { id: 'ciamis', name: 'Kabupaten Ciamis', shortName: 'Ciamis', type: 'kabupaten', hasData: true, lat: -7.4758, lng: 108.4940, zoom: 11 },
  { id: 'cianjur', name: 'Kabupaten Cianjur', shortName: 'Cianjur', type: 'kabupaten', hasData: true, lat: -6.9768, lng: 107.1703, zoom: 11 },
  { id: 'kab_sukabumi', name: 'Kabupaten Sukabumi', shortName: 'Kab. Sukabumi', type: 'kabupaten', hasData: true, lat: -7.0867, lng: 106.7068, zoom: 11 },
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
  provinceId: 'jawa_barat',
  center: [-6.86, 107.61],
  defaultZoom: 9,
  bounds: [
    [-7.82, 106.35],
    [-5.90, 108.85],
  ],
  maxBounds: [
    [-8.45, 105.80],
    [-5.30, 109.30],
  ],
  minZoom: 7,
  geoJson: JAWA_BARAT_GEOJSON,
  regions: JABAR_REGIONS,
  boundaryGlowColor: '#10b981',
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
.jabar-leaflet-wrap {
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
