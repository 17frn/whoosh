<template>
  <div class="city-leaflet-wrap">
    <MapFloatingControls
      province-name="Tangerang Selatan"
      province-full-name="Kota Tangerang Selatan &bull; Banten"
      :current-tile="currentTile"
      :is-mask-enabled="isMaskEnabled"
      :moment-count="markers.length"
      center-coords="6.30°S, 106.71°E"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @reset-view="resetView"
      @set-tile="setTileLayer"
      @toggle-mask="toggleMask"
    />
    <div ref="mapContainerRef" class="bmap-map-canvas"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TimelineData } from '../../../data/timeline';
import { TANGSEL_GEOJSON } from '../../../data/geojson/banten/tangselGeoData';
import MapFloatingControls from '../shared/MapFloatingControls.vue';
import { useLeafletProvinceMap } from '../../../composables/useLeafletProvinceMap';

const props = defineProps<{
  markers: TimelineData[];
}>();

const emit = defineEmits<{
  (e: 'marker-click', item: TimelineData): void;
}>();

const mapContainerRef = ref<HTMLDivElement | null>(null);

const {
  currentTile,
  isMaskEnabled,
  setTileLayer,
  toggleMask,
  zoomIn,
  zoomOut,
  resetView,
} = useLeafletProvinceMap({
  containerRef: mapContainerRef,
  center: [-6.2958, 106.7090],
  defaultZoom: 12,
  bounds: [
    [-6.3622, 106.6380],
    [-6.2294, 106.7799],
  ],
  maxBounds: [
    [-6.45, 106.55],
    [-6.15, 106.85],
  ],
  minZoom: 10,
  maxZoom: 18,
  geoJson: TANGSEL_GEOJSON,
  boundaryGlowColor: '#f59e0b',
  getMarkers: () => props.markers,
  onMarkerClick: (item) => emit('marker-click', item),
});
</script>

<style scoped>
.city-leaflet-wrap {
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
