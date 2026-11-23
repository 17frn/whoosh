<template>
  <!-- Minimal Status Pill (Top-Left, Clean & Unobtrusive) -->
  <div class="bmap-status-pill">
    <span class="bmap-pulse-dot"></span>
    <span class="bmap-status-text">{{ provinceName }} &bull; Batas Resmi BIG</span>
  </div>

  <!-- Floating Controls Stack (Top-Right): FAB Tools + Zoom -->
  <div class="bmap-leaflet-controls">
    <!-- Map Tools & Layers FAB -->
    <button
      type="button"
      class="bmap-fab-btn"
      :class="{ 'is-open': isToolsOpen, 'has-active-filter': isMaskEnabled || activeRegionId !== null }"
      @click="isToolsOpen = !isToolsOpen"
      aria-label="Pengaturan Peta"
      title="Pengaturan & Lapisan Peta"
    >
      <i class="fa-solid fa-layer-group"></i>
      <span v-if="isMaskEnabled || activeRegionId" class="fab-active-dot"></span>
    </button>

    <!-- Zoom Controls -->
    <button type="button" class="bmap-ctrl-btn" @click="$emit('zoom-in')" aria-label="Zoom In" title="Perbesar">
      <i class="fa-solid fa-plus"></i>
    </button>
    <button type="button" class="bmap-ctrl-btn" @click="$emit('zoom-out')" aria-label="Zoom Out" title="Perkecil">
      <i class="fa-solid fa-minus"></i>
    </button>
    <button
      type="button"
      class="bmap-ctrl-btn bmap-ctrl-reset"
      @click="$emit('reset-view')"
      aria-label="Reset View"
      :title="`Reset ke ${provinceName}`"
    >
      <i class="fa-solid fa-rotate-left"></i>
    </button>
  </div>

  <!-- FAB Tools Panel (Floating Sheet from Right) -->
  <Transition name="bmap-tools-slide">
    <div v-if="isToolsOpen" class="bmap-tools-panel">
      <!-- Panel Header -->
      <div class="btools-header">
        <div class="btools-header-left">
          <div class="btools-header-icon">
            <i class="fa-solid fa-layer-group"></i>
          </div>
          <div>
            <span class="btools-header-title">Pengaturan Peta</span>
            <span class="btools-header-sub">{{ provinceName }} &bull; Vektor BIG Resmi</span>
          </div>
        </div>
      </div>

      <!-- Section: Basemap Tile -->
      <div class="btools-section">
        <span class="btools-section-label">
          <i class="fa-solid fa-map"></i> Jenis Peta
        </span>
        <div class="btools-tile-group">
          <button
            class="btools-tile-btn"
            :class="{ 'is-active': currentTile === 'osm' }"
            @click="$emit('set-tile', 'osm')"
          >
            <i class="fa-solid fa-road"></i>
            <span>OSM</span>
            <span class="tile-sub">Standar</span>
          </button>
          <button
            class="btools-tile-btn"
            :class="{ 'is-active': currentTile === 'topo' }"
            @click="$emit('set-tile', 'topo')"
          >
            <i class="fa-solid fa-mountain"></i>
            <span>Topografi</span>
            <span class="tile-sub">Kontur</span>
          </button>
          <button
            class="btools-tile-btn"
            :class="{ 'is-active': currentTile === 'streets' }"
            @click="$emit('set-tile', 'streets')"
          >
            <i class="fa-solid fa-car-side"></i>
            <span>Jalanan</span>
            <span class="tile-sub">Navigasi</span>
          </button>
        </div>
      </div>

      <!-- Section: Isolasi Wilayah -->
      <div class="btools-section">
        <span class="btools-section-label">
          <i class="fa-solid fa-eye"></i> Tampilan Wilayah
        </span>
        <button
          class="btools-mask-toggle"
          :class="{ 'is-active': isMaskEnabled }"
          @click="$emit('toggle-mask')"
        >
          <div class="mask-toggle-left">
            <i class="fa-solid" :class="isMaskEnabled ? 'fa-eye-slash' : 'fa-eye'"></i>
            <div>
              <span class="mask-toggle-label">Fokus Wilayah</span>
              <span class="mask-toggle-desc">
                {{ isMaskEnabled ? `Hanya wilayah ${provinceName} ditampilkan` : 'Semua wilayah sekitar terlihat' }}
              </span>
            </div>
          </div>
          <div class="mask-toggle-switch" :class="{ 'is-on': isMaskEnabled }">
            <div class="switch-knob"></div>
          </div>
        </button>
      </div>

      <!-- Section: Fokus Kabupaten / Kota -->
      <div v-if="regions && regions.length" class="btools-section">
        <span class="btools-section-label">
          <i class="fa-solid fa-location-crosshairs"></i> Fokus Kabupaten / Kota
        </span>
        <div class="btools-regions-grid">
          <button
            v-for="r in regions"
            :key="r.id"
            type="button"
            class="btools-region-btn"
            :class="{ 'has-data': r.hasData, 'is-active': activeRegionId === r.id }"
            @click="$emit('select-region', r); isToolsOpen = false"
          >
            <div class="region-btn-left">
              <i class="fa-solid" :class="r.type === 'kota' ? 'fa-city' : 'fa-tree-city'"></i>
              <div>
                <span class="region-btn-type">{{ r.type === 'kota' ? 'Kota' : 'Kabupaten' }}</span>
                <span class="region-btn-name">{{ r.shortName }}</span>
              </div>
            </div>
            <i v-if="r.hasData" class="fa-solid fa-circle-check region-has-data-icon"></i>
            <i v-else-if="activeRegionId === r.id" class="fa-solid fa-location-dot region-active-icon"></i>
          </button>
        </div>
      </div>

      <!-- Section: Subregions / Kota-Kabupaten Custom Slot -->
      <slot name="subregions"></slot>

      <!-- Section: Info Wilayah (Jika ada prop showInfo) -->
      <div v-if="showInfo" class="btools-section">
        <span class="btools-section-label">
          <i class="fa-solid fa-circle-info"></i> Informasi Wilayah
        </span>
        <slot name="info">
          <div class="btools-info-box">
            <div class="btools-info-row">
              <i class="fa-solid fa-map"></i>
              <div>
                <span class="btools-info-label">Provinsi</span>
                <span class="btools-info-value">{{ provinceFullName || provinceName }}</span>
              </div>
            </div>
            <div v-if="centerCoords" class="btools-info-row">
              <i class="fa-solid fa-location-dot"></i>
              <div>
                <span class="btools-info-label">Pusat Koordinat</span>
                <span class="btools-info-value">{{ centerCoords }}</span>
              </div>
            </div>
            <div class="btools-info-row">
              <i class="fa-solid fa-images"></i>
              <div>
                <span class="btools-info-label">Momen Tersimpan</span>
                <span class="btools-info-value">{{ momentCount }} momen</span>
              </div>
            </div>
          </div>
        </slot>
      </div>

      <!-- Footer: Action Button (Reset) -->
      <div class="btools-footer">
        <button
          type="button"
          class="btools-reset-btn"
          @click="$emit('reset-view'); isToolsOpen = false"
        >
          <i class="fa-solid fa-rotate-left"></i> Reset
        </button>
      </div>
    </div>
  </Transition>

  <!-- Panel backdrop overlay -->
  <Transition name="bmap-backdrop-fade">
    <div v-if="isToolsOpen" class="bmap-tools-backdrop" @click="isToolsOpen = false"></div>
  </Transition>

  <!-- Active Region Info Card (Centered Popup with Backdrop) -->
  <Transition name="bmap-card-fade">
    <div v-if="selectedRegionInfo && !isToolsOpen" class="bmap-region-backdrop" @click="$emit('close-region-card')">
      <div class="bmap-floating-info-card" @click.stop>
        <div class="info-card-header">
          <span class="info-card-type">{{ selectedRegionInfo.type === 'kota' ? 'Kota' : 'Kabupaten' }}</span>
        </div>
        <h4 class="info-card-name">{{ selectedRegionInfo.name }}</h4>
        <p class="info-card-sub">
          <i class="fa-solid fa-location-dot" style="color:#ef4444;margin-right:4px;"></i>{{ regionMomentCount ?? 0 }} momen tersimpan di sini
        </p>
        <div class="info-card-footer">
          <button class="info-card-drilldown-btn" @click="$emit('drilldown', selectedRegionInfo.id)">
            Lihat Detail <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TileLayerType, RegionMeta } from '../../../composables/useLeafletProvinceMap';

defineProps<{
  provinceName: string;
  provinceFullName?: string;
  currentTile: TileLayerType;
  isMaskEnabled: boolean;
  momentCount?: number;
  centerCoords?: string;
  regions?: RegionMeta[];
  activeRegionId?: string | null;
  selectedRegionInfo?: RegionMeta | null;
  regionMomentCount?: number;
  showInfo?: boolean;
}>();

defineEmits<{
  (e: 'zoom-in'): void;
  (e: 'zoom-out'): void;
  (e: 'reset-view'): void;
  (e: 'set-tile', tile: TileLayerType): void;
  (e: 'toggle-mask'): void;
  (e: 'select-region', region: RegionMeta): void;
  (e: 'drilldown', regionId: string): void;
  (e: 'close-region-card'): void;
}>();

const isToolsOpen = ref(false);
</script>

<style scoped>
/* ── Status Pill (Top-Left, Minimal) ───────────────────────────────── */
.bmap-status-pill {
  position: absolute;
  top: 10px;
  left: 12px;
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 7px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);
  border: 1.5px solid #1a1a2e;
  border-radius: 999px;
  padding: 5px 12px;
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  color: #1a1a2e;
  box-shadow: 2px 2px 0 rgba(26, 26, 46, 0.35);
  pointer-events: none;
}

.bmap-pulse-dot {
  width: 7px;
  height: 7px;
  background: #10b981;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: bmap-pulse 1.8s infinite;
}

@keyframes bmap-pulse {
  0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70%  { transform: scale(1);    box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* ── Floating Controls Stack (FAB + Zoom) ──────────────────────────── */
.bmap-leaflet-controls {
  position: absolute;
  bottom: 16px;
  right: 14px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bmap-fab-btn {
  position: relative;
  width: 50px;
  height: 50px;
  background: #1a1a2e;
  border: 2px solid #1a1a2e;
  border-radius: 12px;
  color: #fcd34d;
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 2.5px 2.5px 0 rgba(26, 26, 46, 0.5);
  transition: transform 0.1s ease, box-shadow 0.1s ease, background 0.15s ease;
}

.bmap-fab-btn:hover {
  background: #2d2d4e;
  transform: translate(-1px, -1px);
  box-shadow: 3.5px 3.5px 0 rgba(26, 26, 46, 0.5);
}

.bmap-fab-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 rgba(26, 26, 46, 0.5);
}

.bmap-fab-btn.is-open {
  background: #fcd34d;
  color: #1a1a2e;
  border-color: #1a1a2e;
}

.fab-active-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: #10b981;
  border: 1.5px solid #1a1a2e;
  border-radius: 50%;
}

.bmap-ctrl-btn {
  width: 43px;
  height: 43px;
  background: #ffffff;
  border: 2px solid #1a1a2e;
  border-radius: 8px;
  color: #1a1a2e;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 2px 2px 0 #1a1a2e;
  transition: transform 0.08s ease, box-shadow 0.08s ease, background 0.08s ease;
}

.bmap-ctrl-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #1a1a2e;
  background: #fef08a;
}

.bmap-ctrl-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 #1a1a2e;
}

.bmap-ctrl-reset {
  background: #f1f5f9;
  color: #64748b;
}

/* ── FAB Tools Backdrop ─────────────────────────────────────────────── */
.bmap-tools-backdrop {
  position: absolute;
  inset: 0;
  z-index: 1100;
  background: rgba(26, 26, 46, 0.3);
  backdrop-filter: blur(1px);
}

.bmap-backdrop-fade-enter-active,
.bmap-backdrop-fade-leave-active { transition: opacity 0.18s ease; }
.bmap-backdrop-fade-enter-from,
.bmap-backdrop-fade-leave-to   { opacity: 0; }

/* ── FAB Tools Panel ─────────────────────────────────────────────────── */
.bmap-tools-panel {
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  margin: 0 auto;
  z-index: 1200;
  width: calc(100% - 28px);
  max-width: 380px;
  max-height: calc(100% - 28px);
  overflow-y: auto;
  scrollbar-width: none;
  background: #ffffff;
  border: 2px solid #1a1a2e;
  border-radius: 16px;
  box-shadow: 4px 4px 0 #1a1a2e;
  display: flex;
  flex-direction: column;
}
.bmap-tools-panel::-webkit-scrollbar { display: none; }

.bmap-tools-slide-enter-active,
.bmap-tools-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.bmap-tools-slide-enter-from,
.bmap-tools-slide-leave-to {
  opacity: 0;
  transform: translateX(12px) scale(0.97);
}

/* Panel Header */
.btools-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 2px solid #1a1a2e;
  gap: 10px;
  flex-shrink: 0;
}

.btools-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btools-header-icon {
  width: 34px;
  height: 34px;
  background: #fcd34d;
  border: 2px solid #1a1a2e;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #1a1a2e;
  box-shadow: 2px 2px 0 #1a1a2e;
  flex-shrink: 0;
}

.btools-header-title {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  color: #1a1a2e;
  line-height: 1.2;
}

.btools-header-sub {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 0.62rem;
  color: #64748b;
  font-weight: 600;
}

/* Section */
.btools-section {
  padding: 10px 14px;
  border-bottom: 1.5px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btools-section-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Tile Buttons */
.btools-tile-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.btools-tile-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 4px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.12s ease;
}

.btools-tile-btn i {
  font-size: 1rem;
  color: #64748b;
}

.btools-tile-btn span:not(.tile-sub) {
  font-size: 0.68rem;
  font-weight: 700;
  color: #334155;
}

.btools-tile-btn .tile-sub {
  font-size: 0.58rem;
  color: #94a3b8;
  font-weight: 500;
}

.btools-tile-btn:hover {
  border-color: #1a1a2e;
  background: #f1f5f9;
}

.btools-tile-btn.is-active {
  background: #fef08a;
  border: 2px solid #1a1a2e;
  box-shadow: 2px 2px 0 #1a1a2e;
}

.btools-tile-btn.is-active i,
.btools-tile-btn.is-active span:not(.tile-sub) {
  color: #92400e;
}

/* Mask Toggle (Isolasi) */
.btools-mask-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.12s ease;
  text-align: left;
}

.btools-mask-toggle:hover {
  border-color: #1a1a2e;
  background: #f1f5f9;
}

.btools-mask-toggle.is-active {
  background: #fffbeb;
  border-color: #f59e0b;
}

.mask-toggle-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mask-toggle-left > i {
  font-size: 1rem;
  color: #64748b;
  width: 18px;
  text-align: center;
}

.btools-mask-toggle.is-active .mask-toggle-left > i { color: #d97706; }

.mask-toggle-label {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  font-weight: 800;
  color: #1a1a2e;
}

.mask-toggle-desc {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 0.62rem;
  color: #64748b;
  margin-top: 1px;
}

.mask-toggle-switch {
  width: 36px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 999px;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  padding: 2px;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.mask-toggle-switch.is-on {
  background: #fcd34d;
  border-color: #1a1a2e;
}

.switch-knob {
  width: 12px;
  height: 12px;
  background: #94a3b8;
  border-radius: 50%;
  transition: transform 0.15s ease, background 0.15s ease;
}

.mask-toggle-switch.is-on .switch-knob {
  transform: translateX(16px);
  background: #1a1a2e;
}

/* Subregions Grid */
.btools-regions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.btools-region-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.12s ease;
  text-align: left;
}

.btools-region-btn:hover {
  background: #f1f5f9;
  border-color: #1a1a2e;
}

.btools-region-btn.is-active {
  background: #fef08a;
  border-color: #1a1a2e;
}

.region-btn-left {
  display: flex;
  align-items: center;
  gap: 7px;
}

.region-btn-left > i {
  font-size: 0.85rem;
  color: #64748b;
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}

.region-btn-type {
  display: block;
  font-size: 0.55rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  font-family: 'Inter', sans-serif;
}

.region-btn-name {
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  color: #1a1a2e;
  font-family: 'Outfit', sans-serif;
  white-space: nowrap;
}

.region-has-data-icon {
  font-size: 0.75rem;
  color: #10b981;
  flex-shrink: 0;
}

.region-active-icon {
  font-size: 0.8rem;
  color: #ef4444;
  flex-shrink: 0;
}

/* Info Box */
.btools-info-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
}

.btools-info-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.btools-info-row > i {
  font-size: 0.82rem;
  color: #64748b;
  width: 14px;
  text-align: center;
  margin-top: 1px;
  flex-shrink: 0;
}

.btools-info-label {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #94a3b8;
}

.btools-info-value {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: #1a1a2e;
}

/* Footer */
.btools-footer {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  border-top: 1.5px solid #f1f5f9;
  background: #f8fafc;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
}

.btools-reset-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 14px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 800;
  color: #64748b;
  cursor: pointer;
  box-shadow: 1.5px 1.5px 0 #cbd5e1;
  transition: all 0.12s ease;
}

.btools-reset-btn:hover {
  border-color: #1a1a2e;
  color: #1a1a2e;
  box-shadow: 1.5px 1.5px 0 #1a1a2e;
}

.btools-reset-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 0 0 0 #1a1a2e;
}

.btools-close-footer-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: #fee2e2;
  border: 1.5px solid #1a1a2e;
  border-radius: 8px;
  padding: 10px 14px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 800;
  color: #dc2626;
  cursor: pointer;
  box-shadow: 2px 2px 0 #1a1a2e;
  transition: all 0.12s ease;
}

.btools-close-footer-btn:hover {
  background: #fca5a5;
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #1a1a2e;
}

.btools-close-footer-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 0 0 0 #1a1a2e;
}

/* ── Floating Region Info Card (Centered Popup with Backdrop) ──────── */
.bmap-region-backdrop {
  position: absolute;
  inset: 0;
  z-index: 1050;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

.bmap-floating-info-card {
  position: relative;
  width: min(320px, 86vw);
  background: #ffffff;
  border: 2.5px solid #1a1a2e;
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 5px 5px 0 #1a1a2e;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
}

.info-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-card-type {
  display: inline-block;
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 2px 8px;
  border-radius: 6px;
}

.info-card-close-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1.5px solid #1a1a2e;
  background: #f1f5f9;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.1s ease;
}

.info-card-close-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.info-card-name {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 1.15rem;
  font-weight: 800;
  color: #1a1a2e;
  line-height: 1.25;
}

.info-card-sub {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: #d97706;
  line-height: 1.35;
}

.info-card-sub.text-muted {
  color: #64748b;
  font-weight: 500;
}

.info-card-footer {
  margin-top: 4px;
}

.info-card-drilldown-btn {
  width: 100%;
  background: #fcd34d;
  border: 2px solid #1a1a2e;
  border-radius: 10px;
  padding: 9px 14px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 800;
  color: #1a1a2e;
  cursor: pointer;
  box-shadow: 2.5px 2.5px 0 #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.08s, box-shadow 0.08s;
}

.info-card-drilldown-btn:hover {
  background: #facc15;
  transform: translate(-1px, -1px);
  box-shadow: 3.5px 3.5px 0 #1a1a2e;
}

.info-card-drilldown-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 #1a1a2e;
}

.bmap-card-fade-enter-active,
.bmap-card-fade-leave-active {
  transition: all 0.15s ease;
}
.bmap-card-fade-enter-from,
.bmap-card-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
