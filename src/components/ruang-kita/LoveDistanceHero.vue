<template>
  <div class="love-distance-hero">
    <!-- Top Bar: Status & Settings Button -->
    <div class="hero-header-bar">
      <div class="hero-status-tag">
        <span class="live-dot"></span>
        <span class="status-text">TERHUBUNG BERDUA</span>
      </div>
      <button
        class="hero-settings-btn"
        @click="showSettingsModal = true"
        title="Pengaturan Lokasi & Privasi"
        aria-label="Pengaturan Lokasi"
      >
        <i class="fa-solid fa-sliders"></i>
      </button>
    </div>

    <!-- Map Canvas & Visual Arc Connection -->
    <div class="distance-visual-card">
      <!-- Street Map Background with CSS Filter transformation to bright/light map style -->
      <div class="map-bg-wrapper" aria-hidden="true">
        <img
          :src="streetMapImg"
          alt=""
          class="street-map-img"
        />
        <div class="street-map-light-overlay"></div>
        <svg class="topo-svg" viewBox="0 0 400 180" preserveAspectRatio="none" fill="none">
          <!-- Connecting curved arc -->
          <path
            d="M 80 90 Q 200 45 320 90"
            stroke="var(--theme-accent, #756CE0)"
            stroke-width="2.5"
            stroke-dasharray="6 6"
            class="connecting-path"
          />
        </svg>
      </div>

      <!-- Left Profile (Partner A) -->
      <div class="profile-node node-left">
        <div class="avatar-frame">
          <div class="avatar-circle">
            <i class="fa-solid fa-user avatar-icon"></i>
          </div>
          <span class="pin-badge"><i class="fa-solid fa-location-dot"></i></span>
        </div>
        <div class="partner-info-box">
          <span class="partner-name">{{ partnerA.name }}</span>
          <span class="partner-city">{{ partnerA.locationName.split(',')[0] }}</span>
        </div>
      </div>

      <!-- Center Distance Metric Badge -->
      <div class="center-distance-badge">
        <div class="heart-pulse-node">
          <i class="fa-solid fa-heart distance-heart-icon"></i>
        </div>
        <div class="metric-value">{{ currentDistanceKm }} <span class="km-unit">KM</span></div>
        <div class="metric-sub">memisahkan kalian</div>
      </div>

      <!-- Right Profile (Partner B) -->
      <div class="profile-node node-right">
        <div class="avatar-frame">
          <div class="avatar-circle partner-b">
            <i class="fa-solid fa-user avatar-icon"></i>
          </div>
          <span class="pin-badge"><i class="fa-solid fa-location-dot"></i></span>
        </div>
        <div class="partner-info-box">
          <span class="partner-name">{{ partnerB.name }}</span>
          <span class="partner-city">{{ partnerB.locationName.split(',')[0] }}</span>
        </div>
      </div>
    </div>

    <!-- Bottom Metadata Strip -->
    <div class="hero-footer-strip">
      <div class="update-info">
        <i class="fa-solid fa-clock-rotate-left"></i>
        <span>Pembaruan: {{ partnerB.lastUpdated }}</span>
      </div>
      <div class="privacy-status" :class="{ 'is-private': !partnerA.isSharingLocation }">
        <i class="fa-solid" :class="partnerA.isSharingLocation ? 'fa-shield-halved' : 'fa-eye-slash'"></i>
        <span>{{ partnerA.isSharingLocation ? 'Lokasi Dibagikan' : 'Lokasi Tersembunyi' }}</span>
      </div>
    </div>

    <!-- Location Settings Modal -->
    <Teleport to="body">
      <div v-if="showSettingsModal" class="distance-modal-overlay" @click="showSettingsModal = false">
        <div class="distance-modal-card" @click.stop role="dialog" aria-modal="true">
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="modal-title-wrap">
              <i class="fa-solid fa-map-location-dot modal-title-icon"></i>
              <h3 class="modal-title">Atur Lokasi & Privasi</h3>
            </div>
            <button class="modal-close-btn" @click="showSettingsModal = false" aria-label="Tutup">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <p class="modal-desc">
            Perbarui kota tempat tinggal kalian berdua untuk menghitung jarak real-time secara tepat.
          </p>

          <!-- Input Form: Partner A Location -->
          <div class="setting-group">
            <label class="setting-label">
              <i class="fa-solid fa-location-crosshairs"></i>
              Lokasi {{ partnerA.name }}
            </label>
            <div class="city-selector-row">
              <select v-model="selectedCityA" class="city-select" @change="onSelectCityA">
                <option v-for="c in PRESET_CITIES" :key="c.name" :value="c.name">
                  {{ c.name }} ({{ c.province }})
                </option>
              </select>
            </div>
          </div>

          <!-- Input Form: Partner B Location -->
          <div class="setting-group">
            <label class="setting-label">
              <i class="fa-solid fa-location-pin"></i>
              Lokasi {{ partnerB.name }}
            </label>
            <div class="city-selector-row">
              <select v-model="selectedCityB" class="city-select" @change="onSelectCityB">
                <option v-for="c in PRESET_CITIES" :key="c.name" :value="c.name">
                  {{ c.name }} ({{ c.province }})
                </option>
              </select>
            </div>
          </div>

          <!-- Privacy Toggle -->
          <div class="setting-group-privacy">
            <div class="privacy-text-wrap">
              <div class="privacy-title">Bagikan Lokasi Saya</div>
              <div class="privacy-subtitle">Izinkan pasangan melihat jarak kilometer terkini</div>
            </div>
            <button
              class="toggle-switch-btn"
              :class="{ 'is-active': partnerA.isSharingLocation }"
              @click="partnerA.isSharingLocation = !partnerA.isSharingLocation"
              type="button"
            >
              <span class="toggle-knob"></span>
            </button>
          </div>

          <button class="modal-save-btn" @click="showSettingsModal = false">
            <i class="fa-solid fa-check"></i>
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRuangKita } from '../../data/ruangKitaStore';
import streetMapImg from '../../assets/street-map-love-distance.png';

const { data, currentDistanceKm, updatePartnerLocation } = useRuangKita();
const partnerA = data.value.partnerA;
const partnerB = data.value.partnerB;

const showSettingsModal = ref(false);

const PRESET_CITIES = [
  { name: 'Bandung', province: 'Jawa Barat', lat: -6.9175, lng: 107.6191 },
  { name: 'Jakarta Selatan', province: 'DKI Jakarta', lat: -6.2615, lng: 106.8106 },
  { name: 'Jakarta Pusat', province: 'DKI Jakarta', lat: -6.1818, lng: 106.8223 },
  { name: 'Tangerang Selatan', province: 'Banten', lat: -6.2889, lng: 106.7179 },
  { name: 'Yogyakarta', province: 'DI Yogyakarta', lat: -7.7956, lng: 110.3695 },
  { name: 'Surabaya', province: 'Jawa Timur', lat: -7.2575, lng: 112.7521 },
  { name: 'Semarang', province: 'Jawa Tengah', lat: -6.9667, lng: 110.4167 },
  { name: 'Denpasar', province: 'Bali', lat: -8.6705, lng: 115.2126 },
  { name: 'Malang', province: 'Jawa Timur', lat: -7.9666, lng: 112.6326 },
  { name: 'Medan', province: 'Sumatera Utara', lat: 3.5952, lng: 98.6722 },
  { name: 'Makassar', province: 'Sulawesi Selatan', lat: -5.1477, lng: 119.4327 },
];

const selectedCityA = ref(partnerA.locationName.split(',')[0]);
const selectedCityB = ref(partnerB.locationName.split(',')[0]);

function onSelectCityA() {
  const found = PRESET_CITIES.find(c => c.name === selectedCityA.value);
  if (found) {
    updatePartnerLocation('partnerA', `${found.name}, ${found.province}`, found.lat, found.lng);
  }
}

function onSelectCityB() {
  const found = PRESET_CITIES.find(c => c.name === selectedCityB.value);
  if (found) {
    updatePartnerLocation('partnerB', `${found.name}, ${found.province}`, found.lat, found.lng);
  }
}
</script>

<style scoped>
.love-distance-hero {
  background: var(--theme-surface, #ffffff);
  border: 2px solid var(--theme-border, #101010);
  border-radius: 16px;
  box-shadow: 4px 4px 0 var(--theme-border, #101010);
  overflow: hidden;
  position: relative;
  transition: all 0.2s ease;
}

/* ── Top Bar ────────────────────────────────────────────────────── */
.hero-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
  border-bottom: 1px dashed var(--theme-border-light, #eae8fc);
}

.hero-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  padding: 0;
  border-radius: 0;
  border: none;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  opacity: 0.85;
}

.status-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: var(--theme-accent, #000000);
}

.hero-settings-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: var(--theme-accent, #756ce0);
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  outline: none;
  transition: opacity 0.2s ease, transform 0.15s ease;
}

.hero-settings-btn:hover {
  opacity: 0.9;
}

.hero-settings-btn:active {
  transform: scale(0.96);
}

/* ── Visual Card & Map Composition ──────────────────────────────── */
.distance-visual-card {
  position: relative;
  padding: 24px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 154px;
  background: var(--theme-surface, #ffffff);
  overflow: hidden;
}

.map-bg-wrapper {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.street-map-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 36%;
  /* Invert dark street map to clean white/off-white background with subtle gray street lines */
  filter: invert(1) brightness(1.06) contrast(1.16);
  opacity: 0.94;
  display: block;
}

.street-map-light-overlay {
  position: absolute;
  inset: 0;
  /* Soft white radial overlay to keep text & distance badge perfectly legible */
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 255, 255, 0.44) 0%,
    rgba(255, 255, 255, 0.22) 65%,
    rgba(255, 255, 255, 0.32) 100%
  );
  backdrop-filter: blur(0.4px);
}

.topo-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.connecting-path {
  stroke-dashoffset: 0;
  animation: dashFlow 20s linear infinite;
}

@keyframes dashFlow {
  to {
    stroke-dashoffset: -120;
  }
}

/* ── Profile Nodes ──────────────────────────────────────────────── */
.profile-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 2;
  min-width: 76px;
}

.avatar-frame {
  position: relative;
  margin-bottom: 6px;
}

.avatar-circle {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: var(--theme-accent-light, #eae8fc);
  border: 2px solid var(--theme-border, #101010);
  box-shadow: 2px 2px 0 var(--theme-border, #101010);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-accent, #756ce0);
  font-size: 1.4rem;
}

.avatar-circle.partner-b {
  background: #fff0c6;
  color: #b45309;
}

.pin-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--theme-accent, #756ce0);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  border: 1.5px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.partner-info-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.94);
  border: 1.5px solid var(--theme-border, #101010);
  border-radius: 8px;
  padding: 3px 8px;
  box-shadow: 1.5px 1.5px 0 var(--theme-border, #101010);
  backdrop-filter: blur(4px);
  margin-top: 4px;
}

.partner-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--theme-text, #101010);
  line-height: 1.2;
}

.partner-city {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  color: var(--theme-text-muted, #71717a);
  font-weight: 600;
}

/* ── Center Distance Badge ──────────────────────────────────────── */
.center-distance-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid var(--theme-border, #101010);
  border-radius: 14px;
  padding: 8px 14px;
  box-shadow: 2px 2px 0 var(--theme-border, #101010);
  backdrop-filter: blur(6px);
}

.heart-pulse-node {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fee2e2;
  border: 1.5px solid #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.2);
}

.distance-heart-icon {
  font-size: 0.9rem;
  color: #ef4444;
  animation: pulseScale 2s ease-in-out infinite;
}

@keyframes pulseScale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.metric-value {
  font-family: 'Outfit', 'Space Grotesk', sans-serif;
  font-size: 1.65rem;
  font-weight: 900;
  color: var(--theme-text, #101010);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.km-unit {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--theme-accent, #756ce0);
}

.metric-sub {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  color: var(--theme-text-muted, #71717a);
  font-weight: 500;
  margin-top: 1px;
}

/* ── Bottom Strip ───────────────────────────────────────────────── */
.hero-footer-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 10px;
  background: var(--theme-surface-2, #f8f8fc);
  border-top: 1px solid var(--theme-border-light, #eae8fc);
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  color: var(--theme-text-muted, #71717a);
}

.update-info,
.privacy-status {
  display: flex;
  align-items: center;
  gap: 5px;
}

.privacy-status {
  color: #059669;
  font-weight: 600;
}

.privacy-status.is-private {
  color: #d97706;
}

/* ── Modal Settings Styles ──────────────────────────────────────── */
.distance-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.distance-modal-card {
  width: 100%;
  max-width: 380px;
  background: var(--theme-surface, #ffffff);
  border: 2px solid var(--theme-border, #101010);
  border-radius: 16px;
  box-shadow: 5px 5px 0 var(--theme-border, #101010);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1.5px solid var(--theme-border, #101010);
  padding-bottom: 12px;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-title-icon {
  font-size: 1.2rem;
  color: var(--theme-accent, #756ce0);
}

.modal-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
  color: var(--theme-text, #101010);
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--theme-text-muted, #71717a);
  cursor: pointer;
}

.modal-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  color: var(--theme-text-muted, #71717a);
  margin: 0;
  line-height: 1.4;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.setting-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--theme-text, #101010);
  display: flex;
  align-items: center;
  gap: 6px;
}

.city-select {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1.5px solid var(--theme-border, #101010);
  background: var(--theme-surface, #ffffff);
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: var(--theme-text, #101010);
  font-weight: 600;
  outline: none;
}

.setting-group-privacy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--theme-surface-2, #f8f8fc);
  border: 1px solid var(--theme-border-light, #eae8fc);
  border-radius: 10px;
}

.privacy-title {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--theme-text, #101010);
}

.privacy-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  color: var(--theme-text-muted, #71717a);
}

.toggle-switch-btn {
  width: 44px;
  height: 24px;
  background: #d1d5db;
  border-radius: 999px;
  border: 1.5px solid var(--theme-border, #101010);
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toggle-switch-btn.is-active {
  background: #10b981;
}

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #101010;
  transition: transform 0.2s ease;
}

.toggle-switch-btn.is-active .toggle-knob {
  transform: translateX(20px);
}

.modal-save-btn {
  width: 100%;
  padding: 12px;
  background: var(--theme-accent, #756ce0);
  color: #ffffff;
  border: 2px solid var(--theme-border, #101010);
  border-radius: 10px;
  box-shadow: 2px 2px 0 var(--theme-border, #101010);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.15s ease;
}

.modal-save-btn:active {
  transform: translate(1px, 1px);
  box-shadow: none;
}
</style>

