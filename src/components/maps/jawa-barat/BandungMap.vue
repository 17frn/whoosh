<template>
  <div class="city-leaflet-wrap">
    <MapFloatingControls
      province-name="Kota Bandung"
      province-full-name="Kota Bandung &bull; Jawa Barat"
      :current-tile="currentTile"
      :is-mask-enabled="isMaskEnabled"
      :moment-count="markers.length"
      center-coords="6.90°S, 107.64°E"
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
import { KOTA_BANDUNG_GEOJSON } from '../../../data/geojson/jawa-barat/bandungGeoData';
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
  center: [-6.9023, 107.6426],
  defaultZoom: 12,
  bounds: [
    [-6.9676, 107.5459],
    [-6.8369, 107.7393],
  ],
  maxBounds: [
    [-7.05, 107.45],
    [-6.75, 107.85],
  ],
  minZoom: 10,
  maxZoom: 18,
  geoJson: KOTA_BANDUNG_GEOJSON,
  boundaryGlowColor: '#10b981',
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
