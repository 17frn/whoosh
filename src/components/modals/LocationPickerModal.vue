<template>
  <Teleport to="body">
    <Transition name="picker-fade">
      <div class="loc-picker-backdrop" @click.self="emit('close')">
        <div class="loc-picker-window">
          
          <!-- Header -->
          <div class="loc-picker-header">
            <div class="loc-header-left">
              <div class="loc-header-icon">
                <i class="fa-solid fa-map-location-dot"></i>
              </div>
              <div>
                <h3 class="loc-header-title">Tentukan Titik di Peta</h3>
                <p class="loc-header-sub">Ketuk atau geser pin untuk menentukan koordinat presisi</p>
              </div>
            </div>
          </div>

          <!-- Quick Navigation & GPS Bar -->
          <div class="loc-picker-toolbar">
            <div class="loc-quick-chips">
              <span class="toolbar-label">Lompat ke:</span>
              <button
                v-for="q in QUICK_LOCATIONS"
                :key="q.name"
                type="button"
                class="loc-quick-chip"
                @click="jumpTo(q.lat, q.lng, q.zoom)"
              >
                {{ q.name }}
              </button>
            </div>
            <button
              type="button"
              class="loc-gps-btn"
              :class="{ 'is-loading': isLocating }"
              @click="useCurrentLocation"
              title="Gunakan titik GPS perangkat saat ini"
            >
              <i class="fa-solid" :class="isLocating ? 'fa-spinner fa-spin' : 'fa-crosshairs'"></i>
              <span>Lokasi Saya</span>
            </button>
          </div>

          <!-- Map Container -->
          <div class="loc-picker-map-wrap">
            <div ref="mapContainerRef" class="loc-picker-map"></div>
            
            <!-- Crosshair Hint (overlay) -->
            <div class="loc-map-hint">
              <i class="fa-solid fa-circle-info"></i>
              <span>Ketuk di mana saja pada peta untuk memindahkan pin</span>
            </div>
          </div>

          <!-- Footer / Action Bar -->
          <div class="loc-picker-footer">
            <div class="loc-coord-readout">
              <span class="coord-label">Koordinat Terpilih:</span>
              <div class="coord-values">
                <span class="coord-val"><strong>Lat:</strong> {{ currentLat.toFixed(5) }}</span>
                <span class="coord-sep">&bull;</span>
                <span class="coord-val"><strong>Lng:</strong> {{ currentLng.toFixed(5) }}</span>
              </div>
            </div>
            <div class="loc-actions">
              <button type="button" class="btn-cancel" @click="emit('close')">
                Batal
              </button>
              <button type="button" class="btn-confirm" @click="confirmLocation">
                <i class="fa-solid fa-check"></i>
                <span>Gunakan Titik Ini</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { registerBackHandler, unregisterBackHandler } from '../../composables/useBackButton';

const props = withDefaults(defineProps<{
  initialLat?: number;
  initialLng?: number;
  locationName?: string;
}>(), {
  initialLat: -6.2917,
  initialLng: 106.7118,
  locationName: '',
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select-location', payload: { lat: number; lng: number }): void;
}>();

const QUICK_LOCATIONS = [
  { name: 'Tangsel', lat: -6.2917, lng: 106.7118, zoom: 14 },
  { name: 'Pamulang', lat: -6.3444, lng: 106.7384, zoom: 15 },
  { name: 'Ciputat', lat: -6.3117, lng: 106.7461, zoom: 15 },
  { name: 'Serpong', lat: -6.3089, lng: 106.6667, zoom: 15 },
  { name: 'Tangerang', lat: -6.1783, lng: 106.6319, zoom: 14 },
  { name: 'Serang', lat: -6.1200, lng: 106.1503, zoom: 14 },
  { name: 'Cilegon', lat: -6.0174, lng: 106.0538, zoom: 14 },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456, zoom: 13 },
];

const mapContainerRef = ref<HTMLDivElement | null>(null);
let mapInstance: L.Map | null = null;
let pinMarker: L.Marker | null = null;

const currentLat = ref(props.initialLat);
const currentLng = ref(props.initialLng);
const isLocating = ref(false);

function createCustomPinIcon() {
  const pinHtml = `
    <div class="picker-neo-pin">
      <div class="pin-crosshair"></div>
      <div class="pin-head">
        <i class="fa-solid fa-location-dot"></i>
      </div>
      <div class="pin-shadow"></div>
    </div>
  `;

  return L.divIcon({
    html: pinHtml,
    className: 'picker-neo-pin-wrapper',
    iconSize: [36, 44],
    iconAnchor: [18, 42],
  });
}

function updatePinPosition(lat: number, lng: number) {
  currentLat.value = lat;
  currentLng.value = lng;
  if (pinMarker) {
    pinMarker.setLatLng([lat, lng]);
  }
}

function jumpTo(lat: number, lng: number, zoom: number = 14) {
  if (!mapInstance) return;
  updatePinPosition(lat, lng);
  mapInstance.flyTo([lat, lng], zoom, { duration: 0.8 });
}

function useCurrentLocation() {
  if (!navigator.geolocation) {
    alert('Geolokasi tidak didukung pada perangkat ini.');
    return;
  }

  isLocating.value = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      isLocating.value = false;
      jumpTo(pos.coords.latitude, pos.coords.longitude, 16);
    },
    (err) => {
      isLocating.value = false;
      console.warn('Gagal membaca GPS:', err.message);
      alert('Tidak dapat mengambil titik GPS saat ini. Pastikan izin lokasi aktif.');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function confirmLocation() {
  emit('select-location', {
    lat: currentLat.value,
    lng: currentLng.value,
  });
  emit('close');
}

onMounted(() => {
  nextTick(() => {
    if (!mapContainerRef.value) return;

    mapInstance = L.map(mapContainerRef.value, {
      center: [currentLat.value, currentLng.value],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Clean OpenStreetMap Tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapInstance);

    // Zoom controls at top right
    L.control.zoom({ position: 'topright' }).addTo(mapInstance);

    // Draggable pin marker
    pinMarker = L.marker([currentLat.value, currentLng.value], {
      icon: createCustomPinIcon(),
      draggable: true,
      zIndexOffset: 1000,
    }).addTo(mapInstance);

    pinMarker.on('dragend', () => {
      const pos = pinMarker?.getLatLng();
      if (pos) {
        currentLat.value = pos.lat;
        currentLng.value = pos.lng;
      }
    });

    // Tap or click on map to move pin
    mapInstance.on('click', (e: L.LeafletMouseEvent) => {
      updatePinPosition(e.latlng.lat, e.latlng.lng);
    });

    setTimeout(() => {
      mapInstance?.invalidateSize();
    }, 200);
  });

  registerBackHandler('location-picker-modal', () => {
    emit('close');
    return true;
  });
});

onBeforeUnmount(() => {
  unregisterBackHandler('location-picker-modal');
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>

<style scoped>
.loc-picker-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: rgba(26, 26, 46, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.loc-picker-window {
  width: 100%;
  max-width: 580px;
  height: 85vh;
  max-height: 680px;
  background: #ffffff;
  border: 3px solid #1a1a2e;
  border-radius: 16px;
  box-shadow: 6px 6px 0 #1a1a2e;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ────────────────────────────────────────────────────────── */
.loc-picker-header {
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 2px solid #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.loc-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.loc-header-icon {
  width: 36px;
  height: 36px;
  background: #fcd34d;
  border: 2px solid #1a1a2e;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #1a1a2e;
  box-shadow: 2px 2px 0 #1a1a2e;
  flex-shrink: 0;
}

.loc-header-title {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  color: #1a1a2e;
}

.loc-header-sub {
  margin: 2px 0 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  color: #64748b;
}

.loc-close-btn {
  width: 34px;
  height: 34px;
  background: #fee2e2;
  border: 2px solid #1a1a2e;
  border-radius: 8px;
  color: #ef4444;
  font-size: 0.95rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 2px 2px 0 #1a1a2e;
  transition: transform 0.08s ease, box-shadow 0.08s ease;
  flex-shrink: 0;
}

.loc-close-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #1a1a2e;
}
.loc-close-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 #1a1a2e;
}

/* ── Toolbar ───────────────────────────────────────────────────────── */
.loc-picker-toolbar {
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 2px solid #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;
}
.loc-picker-toolbar::-webkit-scrollbar {
  display: none;
}

.loc-quick-chips {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.toolbar-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  white-space: nowrap;
}

.loc-quick-chip {
  background: #ffffff;
  border: 1.5px solid #1a1a2e;
  border-radius: 6px;
  padding: 3px 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  color: #1a1a2e;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 1px 1px 0 #1a1a2e;
  transition: transform 0.08s, box-shadow 0.08s, background 0.08s;
}

.loc-quick-chip:hover {
  background: #fef08a;
  transform: translate(-1px, -1px);
  box-shadow: 2px 2px 0 #1a1a2e;
}

.loc-gps-btn {
  background: #fcd34d;
  border: 2px solid #1a1a2e;
  border-radius: 8px;
  padding: 4px 10px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.72rem;
  font-weight: 800;
  color: #1a1a2e;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 2px 2px 0 #1a1a2e;
  white-space: nowrap;
  flex-shrink: 0;
  transition: transform 0.08s, box-shadow 0.08s;
}

.loc-gps-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #1a1a2e;
  background: #fef08a;
}
.loc-gps-btn.is-loading {
  opacity: 0.7;
  pointer-events: none;
}

/* ── Map Wrap ──────────────────────────────────────────────────────── */
.loc-picker-map-wrap {
  flex: 1;
  position: relative;
  width: 100%;
  min-height: 240px;
  background: #e2e8f0;
}

.loc-picker-map {
  width: 100%;
  height: 100%;
  display: block;
}

.loc-map-hint {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: rgba(26, 26, 46, 0.85);
  backdrop-filter: blur(4px);
  color: #ffffff;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  padding: 4px 12px;
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

/* ── Footer ────────────────────────────────────────────────────────── */
.loc-picker-footer {
  padding: 10px 16px;
  background: #ffffff;
  border-top: 2px solid #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.loc-coord-readout {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.coord-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.04em;
}

.coord-values {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', monospace;
  font-size: 0.76rem;
  color: #1a1a2e;
}

.coord-sep {
  color: #cbd5e1;
}

.loc-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel {
  background: #f1f5f9;
  border: 2px solid #1a1a2e;
  border-radius: 8px;
  padding: 7px 14px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  box-shadow: 2px 2px 0 #1a1a2e;
  transition: transform 0.08s, box-shadow 0.08s;
}

.btn-cancel:hover {
  background: #e2e8f0;
  color: #1a1a2e;
}

.btn-confirm {
  background: #fcd34d;
  border: 2px solid #1a1a2e;
  border-radius: 8px;
  padding: 7px 16px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  font-weight: 800;
  color: #1a1a2e;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 2px 2px 0 #1a1a2e;
  transition: transform 0.08s, box-shadow 0.08s;
}

.btn-confirm:hover {
  background: #fef08a;
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #1a1a2e;
}

.btn-confirm:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 #1a1a2e;
}

/* ── Animation ─────────────────────────────────────────────────────── */
.picker-fade-enter-active,
.picker-fade-leave-active {
  transition: opacity 0.18s ease;
}
.picker-fade-enter-from,
.picker-fade-leave-to {
  opacity: 0;
}
</style>

<!-- Non-scoped CSS for Custom Draggable Leaflet Pin -->
<style>
.picker-neo-pin-wrapper {
  background: transparent !important;
  border: none !important;
}

.picker-neo-pin {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: grab;
}
.picker-neo-pin:active {
  cursor: grabbing;
}

.picker-neo-pin .pin-head {
  width: 32px;
  height: 32px;
  background: #ef4444;
  border: 2.5px solid #1a1a2e;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 2px 2px 0 #1a1a2e;
  transition: transform 0.1s ease;
}

.picker-neo-pin .pin-head i {
  transform: rotate(45deg);
  font-size: 14px;
}

.picker-neo-pin:hover .pin-head {
  transform: rotate(-45deg) scale(1.12);
  background: #dc2626;
}

.picker-neo-pin .pin-shadow {
  position: absolute;
  bottom: -4px;
  width: 14px;
  height: 5px;
  background: rgba(26, 26, 46, 0.4);
  border-radius: 50%;
}
</style>
