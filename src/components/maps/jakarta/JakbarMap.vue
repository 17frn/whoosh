<template>
  <div class="city-leaflet-wrap">
    <MapFloatingControls
      province-name="Jakarta Barat"
      province-full-name="Kota Administrasi Jakarta Barat"
      :current-tile="currentTile"
      :is-mask-enabled="isMaskEnabled"
      :moment-count="markers.length"
      center-coords="6.16°S, 106.76°E"
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
import { JAKARTA_BARAT_GEOJSON } from '../../../data/geojson/jakarta/jakbarGeoData';
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
  center: [-6.1602, 106.7578],
  defaultZoom: 12,
  bounds: [
    [-6.2248, 106.6872],
    [-6.0956, 106.8283],
  ],
  maxBounds: [
    [-6.30, 106.62],
    [-6.02, 106.90],
  ],
  minZoom: 10,
  maxZoom: 18,
  geoJson: JAKARTA_BARAT_GEOJSON,
  boundaryGlowColor: '#f97316',
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
