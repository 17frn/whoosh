<template>
  <div class="city-leaflet-wrap">
    <MapFloatingControls
      province-name="Jakarta Selatan"
      province-full-name="Kota Administrasi Jakarta Selatan"
      :current-tile="currentTile"
      :is-mask-enabled="isMaskEnabled"
      :moment-count="markers.length"
      center-coords="6.28°S, 106.80°E"
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
import { JAKARTA_SELATAN_GEOJSON } from '../../../data/geojson/jakarta/jakselGeoData';
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
  center: [-6.2838, 106.8021],
  defaultZoom: 12,
  bounds: [
    [-6.3649, 106.7374],
    [-6.2027, 106.8668],
  ],
  maxBounds: [
    [-6.45, 106.65],
    [-6.10, 106.95],
  ],
  minZoom: 10,
  maxZoom: 18,
  geoJson: JAKARTA_SELATAN_GEOJSON,
  boundaryGlowColor: '#3b82f6',
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
