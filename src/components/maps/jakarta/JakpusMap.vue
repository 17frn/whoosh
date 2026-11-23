<template>
  <div class="city-leaflet-wrap">
    <MapFloatingControls
      province-name="Jakarta Pusat"
      province-full-name="Kota Administrasi Jakarta Pusat"
      :current-tile="currentTile"
      :is-mask-enabled="isMaskEnabled"
      :moment-count="markers.length"
      center-coords="6.18°S, 106.84°E"
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
import { JAKARTA_PUSAT_GEOJSON } from '../../../data/geojson/jakarta/jakpusGeoData';
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
  center: [-6.1831, 106.8366],
  defaultZoom: 13,
  bounds: [
    [-6.2293, 106.7918],
    [-6.1369, 106.8814],
  ],
  maxBounds: [
    [-6.30, 106.72],
    [-6.08, 106.94],
  ],
  minZoom: 11,
  maxZoom: 18,
  geoJson: JAKARTA_PUSAT_GEOJSON,
  boundaryGlowColor: '#eab308',
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
