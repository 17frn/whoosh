<template>
  <div class="timeline-map-page">
    <!-- Top Bar -->
    <header class="pmap-topbar">
      <div class="pmap-topbar-left">
        <div class="pmap-topbar-icon-wrap">
          <i class="fa-solid fa-map-location-dot"></i>
        </div>
        <div>
          <h1 class="pmap-topbar-title">
            <template v-if="selectedSubRegion">
              <button class="pmap-breadcrumb-btn" @click="selectedSubRegion = null">{{ selectedProvince?.name || 'Provinsi' }}</button>
              <span class="pmap-breadcrumb-sep">›</span>
              {{ selectedSubRegionName }}
            </template>
            <template v-else-if="selectedProvince">
              {{ selectedProvince.name }}
            </template>
            <template v-else>Peta Perjalanan</template>
          </h1>
          <p class="pmap-topbar-sub">
            <template v-if="selectedSubRegion">
              <span class="pmap-topbar-pill">{{ markersForSubRegion.length }} momen</span>
              <span class="pmap-topbar-sep">&bull;</span>
              <span>Sub-wilayah {{ selectedProvince?.name }}</span>
            </template>
            <template v-else-if="selectedProvince">
              <span class="pmap-topbar-pill">{{ markersForProvince.length }} momen</span>
              <span class="pmap-topbar-sep">&bull;</span>
              <span>Total {{ totalItems }} momen &bull; {{ totalProvinces }} provinsi</span>
            </template>
            <template v-else>
              {{ totalItems }} momen &bull; {{ totalProvinces }} provinsi
            </template>
          </p>
        </div>
      </div>

      <div v-if="selectedSubRegion" class="pmap-topbar-right">
        <button class="pmap-topbar-back-btn" @click="selectedSubRegion = null" title="Kembali ke tampilan provinsi">
          <i class="fa-solid fa-arrow-left"></i>
          <span>Kembali</span>
        </button>
      </div>
    </header>

    <!-- Province Chips Bar -->
    <div class="pmap-chips-bar">
      <button
        v-for="p in availableProvinces"
        :key="p.id"
        class="pmap-chip"
        :class="{ 'is-active': selectedProvinceId === p.id }"
        @click="onSelectProvince(p.id)"
      >
        <span class="pmap-chip-name">{{ p.name }}</span>
        <span class="pmap-chip-count">{{ p.count }}</span>
      </button>

      <!-- Toggle Button to Open Province Modal -->
      <button
        class="pmap-chip pmap-chip-more"
        @click="isProvinceModalOpen = true"
        title="Lihat Semua Provinsi"
      >
        <i class="fa-solid fa-list-ul"></i>
        <span>Semua ({{ allRegisteredProvinces.length }})</span>
      </button>
    </div>

    <!-- Map Canvas Body -->
    <main class="pmap-body">
      <!-- Subregion drill-down maps -->
      <template v-if="selectedSubRegion === 'tangsel'">
        <TangselMap
          :markers="markersForSubRegion"
          @marker-click="onMarkerClick"
        />
      </template>

      <template v-else-if="selectedSubRegion === 'jaksel'">
        <JakselMap
          :markers="markersForSubRegion"
          @marker-click="onMarkerClick"
        />
      </template>

      <template v-else-if="selectedSubRegion === 'jakpus'">
        <JakpusMap
          :markers="markersForSubRegion"
          @marker-click="onMarkerClick"
        />
      </template>

      <template v-else-if="selectedSubRegion === 'jakbar'">
        <JakbarMap
          :markers="markersForSubRegion"
          @marker-click="onMarkerClick"
        />
      </template>

      <template v-else-if="selectedSubRegion === 'jaktim'">
        <JaktimMap
          :markers="markersForSubRegion"
          @marker-click="onMarkerClick"
        />
      </template>

      <template v-else-if="selectedSubRegion === 'jakut'">
        <JakutMap
          :markers="markersForSubRegion"
          @marker-click="onMarkerClick"
        />
      </template>

      <template v-else-if="selectedSubRegion === 'bandung'">
        <BandungMap
          :markers="markersForSubRegion"
          @marker-click="onMarkerClick"
        />
      </template>

      <!-- Banten province: dedicated Leaflet map with kab/kota boundaries -->
      <template v-else-if="selectedProvince?.id === 'banten'">
        <BantenMap
          :markers="markersForProvince"
          @marker-click="onMarkerClick"
          @subregion-click="onSubRegionClick"
        />
      </template>

      <!-- DKI Jakarta: dedicated Leaflet interactive map -->
      <template v-else-if="selectedProvince?.id === 'jakarta'">
        <JakartaMap
          :markers="markersForProvince"
          @marker-click="onMarkerClick"
          @subregion-click="onSubRegionClick"
        />
      </template>

      <!-- Jawa Barat: dedicated Leaflet interactive map -->
      <template v-else-if="selectedProvince?.id === 'jawa_barat'">
        <JawaBaratMap
          :markers="markersForProvince"
          @marker-click="onMarkerClick"
          @subregion-click="onSubRegionClick"
        />
      </template>

      <!-- Generic provinces: ProvinceMapViewer -->
      <template v-else-if="selectedProvince">
        <ProvinceMapViewer
          :province="selectedProvince"
          :markers="markersForProvince"
          @marker-click="onMarkerClick"
        />
      </template>

      <div v-else class="pmap-empty-state">
        <div class="pmap-empty-icon"><i class="fa-solid fa-map-location-dot"></i></div>
        <p class="pmap-empty-text">Pilih provinsi dulu!</p>
        <p class="pmap-empty-hint">{{ availableProvinces.length }} provinsi tersedia</p>
      </div>

      <!-- Floating Marker Popup (Persegi, Fixed Center, No X button) -->
      <Transition name="pmap-popup-fade">
        <div v-if="activeMarker" class="pmap-popup-backdrop" @click="activeMarker = null">
          <div class="pmap-popup-card" @click.stop>
            <div class="pmap-popup-top">
              <div class="pmap-popup-dot" :style="{ background: activeMarker.dotColor }"></div>
              <h3 class="pmap-popup-title">{{ activeMarker.title }}</h3>
            </div>
            <div class="pmap-popup-meta">
              <span><i class="fa-solid fa-location-dot"></i> {{ activeMarker.location }}</span>
              <span><i class="fa-regular fa-calendar"></i> {{ activeMarker.date }}</span>
            </div>
            <button class="pmap-popup-cta" @click="openDetail(activeMarker)">
              Lihat Detail <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </Transition>
    </main>

    <!-- Fullscreen Moment Detail Modal (Neo-brutalist, matching HomeView, no edit button) -->
    <Transition name="fade">
      <div
        v-if="activeDetailItem"
        class="detail-modal-overlay"
        @click="closeDetail"
        @touchstart="onModalTouchStart"
        @touchend="onModalTouchEnd"
      >
        <div class="detail-modal-content" @click.stop>

          <!-- Fixed top: header + map -->
          <div class="detail-fixed-top">
            <div class="detail-header">
              <h2 class="detail-title">{{ activeDetailItem.title }}</h2>
            </div>

            <!-- Pill container for subtitle/map -->
            <div class="detail-subtitle-row">
              <button
                v-if="activeDetailItem.location"
                class="neo-pill map-pill"
                :class="{ 'has-map': isValidMapUrl(activeDetailItem.mapEmbedUrl) }"
                @click="isValidMapUrl(activeDetailItem.mapEmbedUrl) && (isMapExpanded = !isMapExpanded)"
              >
                <i class="fa-solid fa-location-dot"></i> {{ activeDetailItem.location }}
                <i v-if="isValidMapUrl(activeDetailItem.mapEmbedUrl)" class="fa-solid" :class="isMapExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </button>

              <div v-if="activeDetailItem.date" class="neo-pill date-pill">
                <i class="fa-regular fa-calendar"></i> {{ activeDetailItem.date }}
              </div>
            </div>

            <!-- Map embed (Conditional) -->
            <div v-if="isMapExpanded && isValidMapUrl(activeDetailItem.mapEmbedUrl)" class="detail-map-container">
              <iframe
                :src="activeDetailItem.mapEmbedUrl"
                width="100%"
                height="160"
                class="neo-iframe"
                allowfullscreen="false"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
          <!-- /Fixed top -->

          <!-- Scrollable gallery section -->
          <div class="detail-gallery-scroll">
            <div class="gallery-grid-neo" :style="`direction: ${activeDetailItem.rtl ? 'rtl' : 'ltr'}`">
              <div
                v-for="(momen, idx) in activeDetailItem.moments?.slice(0, 9)"
                :key="idx"
                class="gallery-card-wrap"
              >
                <TimelineCard
                  :image="momen.image"
                  :title="momen.title"
                  :description="momen.description"
                  :accentColor="momen.accentColor"
                />
              </div>
            </div>
            <div v-if="!activeDetailItem.moments || activeDetailItem.moments.length === 0" class="gallery-empty">
              <i class="fa-regular fa-image"></i>
              <p>Belum ada foto.</p>
            </div>
          </div>
          <!-- /Scrollable gallery -->

        </div>
      </div>
    </Transition>

    <!-- Province Selector Pop-up Panel (Neo-brutalist) -->
    <Transition name="pmap-panel-slide">
      <div v-if="isProvinceModalOpen" class="bmap-tools-panel pmap-province-panel">
        <!-- Panel Header -->
        <div class="btools-header">
          <div class="btools-header-left">
            <div class="btools-header-icon">
              <i class="fa-solid fa-earth-asia"></i>
            </div>
            <div>
              <span class="btools-header-title">Pilih Provinsi</span>
              <span class="btools-header-sub">{{ allRegisteredProvinces.length }} provinsi terdaftar &bull; {{ totalItems }} momen</span>
            </div>
          </div>
        </div>

        <!-- Search Bar Section -->
        <div class="btools-search-section">
          <div class="btools-search-box">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              v-model="provinceSearchQuery"
              type="text"
              placeholder="Cari provinsi (mis. Bali, Jawa)..."
              class="btools-search-input"
            />
            <button
              v-if="provinceSearchQuery"
              class="btools-search-clear"
              @click="provinceSearchQuery = ''"
              aria-label="Hapus pencarian"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <!-- Scrollable Province List -->
        <div class="province-scroll-body">
          <div v-if="filteredModalProvinces.length === 0" class="province-empty-search">
            <i class="fa-solid fa-compass"></i>
            <p>Provinsi tidak ditemukan</p>
          </div>
          <div v-else class="province-items-grid">
            <button
              v-for="p in filteredModalProvinces"
              :key="p.id"
              class="btools-region-btn province-item-btn"
              :class="{ 'is-active': selectedProvinceId === p.id, 'has-data': p.count > 0 }"
              @click="selectProvinceFromModal(p.id)"
            >
              <div class="region-btn-left">
                <i class="fa-solid" :class="p.count > 0 ? 'fa-location-dot' : 'fa-map-pin'"></i>
                <div>
                  <span class="region-btn-type">{{ p.count > 0 ? `${p.count} Momen Terdaftar` : 'Belum Ada Momen' }}</span>
                  <span class="region-btn-name">{{ p.name }}</span>
                </div>
              </div>
              <div class="province-item-right">
                <span v-if="p.count > 0" class="province-count-pill">{{ p.count }}</span>
                <i v-if="selectedProvinceId === p.id" class="fa-solid fa-circle-check province-selected-icon"></i>
              </div>
            </button>
          </div>
        </div>

      </div>
    </Transition>

    <!-- Panel Backdrop Overlay (tap outside closes panel) -->
    <Transition name="pmap-backdrop-fade">
      <div v-if="isProvinceModalOpen" class="pmap-tools-backdrop" @click="isProvinceModalOpen = false"></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue';
import type { TimelineData } from '../data/timeline';
import TimelineCard from '../components/feed/TimelineCard.vue';
import MapLoadingIndicator from '../components/maps/shared/MapLoadingIndicator.vue';

// ── Lazy-loaded Province and Subregion Map Components ────────────────────────
const BantenMap = defineAsyncComponent({
  loader: () => import('../components/maps/banten/BantenMap.vue'),
  loadingComponent: MapLoadingIndicator,
  delay: 60,
});
const JakartaMap = defineAsyncComponent({
  loader: () => import('../components/maps/jakarta/JakartaMap.vue'),
  loadingComponent: MapLoadingIndicator,
  delay: 60,
});
const JawaBaratMap = defineAsyncComponent({
  loader: () => import('../components/maps/jawa-barat/JawaBaratMap.vue'),
  loadingComponent: MapLoadingIndicator,
  delay: 60,
});
const TangselMap = defineAsyncComponent({
  loader: () => import('../components/maps/banten/TangselMap.vue'),
  loadingComponent: MapLoadingIndicator,
  delay: 60,
});
const JakselMap = defineAsyncComponent({
  loader: () => import('../components/maps/jakarta/JakselMap.vue'),
  loadingComponent: MapLoadingIndicator,
  delay: 60,
});
const JakpusMap = defineAsyncComponent({
  loader: () => import('../components/maps/jakarta/JakpusMap.vue'),
  loadingComponent: MapLoadingIndicator,
  delay: 60,
});
const JakbarMap = defineAsyncComponent({
  loader: () => import('../components/maps/jakarta/JakbarMap.vue'),
  loadingComponent: MapLoadingIndicator,
  delay: 60,
});
const JaktimMap = defineAsyncComponent({
  loader: () => import('../components/maps/jakarta/JaktimMap.vue'),
  loadingComponent: MapLoadingIndicator,
  delay: 60,
});
const JakutMap = defineAsyncComponent({
  loader: () => import('../components/maps/jakarta/JakutMap.vue'),
  loadingComponent: MapLoadingIndicator,
  delay: 60,
});
const BandungMap = defineAsyncComponent({
  loader: () => import('../components/maps/jawa-barat/BandungMap.vue'),
  loadingComponent: MapLoadingIndicator,
  delay: 60,
});
const ProvinceMapViewer = defineAsyncComponent({
  loader: () => import('../components/shared/ProvinceMapViewer.vue'),
  loadingComponent: MapLoadingIndicator,
  delay: 60,
});
import { getAllProvinces, getProvinceData } from '../data/provinceMaps';
import type { ProvinceMapData } from '../data/provinceMaps';
import { indonesiaLocations } from '../data/indonesiaLocations';
import { registerBackHandler, unregisterBackHandler } from '../composables/useBackButton';
import { pushNavState } from '../composables/useGestureNavigation';

const props = withDefaults(
  defineProps<{
    items?: TimelineData[];
  }>(),
  {
    items: () => []
  }
);

const emit = defineEmits<{
  (e: 'open-detail', item: TimelineData): void;
}>();

// ── State ─────────────────────────────────────────────────────────────
const selectedProvinceId = ref<string | null>(null);
const activeMarker = ref<TimelineData | null>(null);
const isMapExpanded = ref(false);
const selectedSubRegion = ref<string | null>(null); // e.g. 'tangsel'
const activeDetailItemId = ref<string | null>(null);
const isProvinceModalOpen = ref(false);
const provinceSearchQuery = ref('');

const filteredModalProvinces = computed(() => {
  if (!provinceSearchQuery.value.trim()) return allRegisteredProvinces.value;
  const q = provinceSearchQuery.value.trim().toLowerCase();
  return allRegisteredProvinces.value.filter(p => p.name.toLowerCase().includes(q));
});

function selectProvinceFromModal(id: string) {
  onSelectProvince(id);
  isProvinceModalOpen.value = false;
  provinceSearchQuery.value = '';
}

// ── Province Resolution ───────────────────────────────────────────────
const PROVINCE_NAME_TO_ID: Record<string, string> = {
  'daerah khusus ibukota jakarta': 'jakarta',
  'dki jakarta': 'jakarta',
  'd.k.i. jakarta': 'jakarta',
  'dki_jakarta': 'jakarta',
  'jakarta raya': 'jakarta',
  'daerah istimewa yogyakarta': 'yogyakarta',
  'di yogyakarta': 'yogyakarta',
  'd.i. yogyakarta': 'yogyakarta',
  'bangka belitung': 'bangka_belitung',
  'kepulauan bangka belitung': 'bangka_belitung',
};

function nameToId(name: string): string {
  const lower = name.toLowerCase();
  if (PROVINCE_NAME_TO_ID[lower]) return PROVINCE_NAME_TO_ID[lower];
  return lower.replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
}

function getProvinceIdForItem(item: TimelineData): string | null {
  const loc = item.location?.toLowerCase() ?? '';
  for (const entry of indonesiaLocations) {
    if (entry.keywords.some((k: string) => loc.includes(k))) {
      const id = nameToId(entry.province);
      if (getProvinceData(id)) return id;
    }
  }
  return null;
}

// Map of provinceId -> moment count
const momentCountByProvince = computed<Map<string, number>>(() => {
  const map = new Map<string, number>();
  for (const item of props.items) {
    const id = getProvinceIdForItem(item);
    if (!id) continue;
    map.set(id, (map.get(id) || 0) + 1);
  }
  return map;
});

// All 34 registered provinces for the Modal (sorted: provinces with moments first, then alphabetically)
const allRegisteredProvinces = computed<{ id: string; name: string; count: number }[]>(() => {
  const counts = momentCountByProvince.value;
  return getAllProvinces()
    .map(p => ({
      id: p.id,
      name: p.name,
      count: counts.get(p.id) || 0,
    }))
    .sort((a, b) => {
      // Priority 1: Provinces with moments first (descending count)
      if (a.count !== b.count) return b.count - a.count;
      // Priority 2: Alphabetical order
      return a.name.localeCompare(b.name, 'id');
    });
});

// Horizontal Chips: Provinces with moments (or default fallback to registered provinces if empty)
const chipsProvinces = computed<{ id: string; name: string; count: number }[]>(() => {
  const withMoments = allRegisteredProvinces.value.filter(p => p.count > 0);
  if (withMoments.length > 0) return withMoments;
  // If no moments recorded yet, show first 4 registered provinces as starters
  return allRegisteredProvinces.value.slice(0, 4);
});

// Alias for backwards compatibility / template consistency
const availableProvinces = computed(() => chipsProvinces.value);

const selectedProvince = computed<ProvinceMapData | null>(() =>
  selectedProvinceId.value ? getProvinceData(selectedProvinceId.value) : null
);

const markersForProvince = computed<TimelineData[]>(() => {
  if (!selectedProvinceId.value) return [];
  return props.items.filter(item => getProvinceIdForItem(item) === selectedProvinceId.value);
});

const totalItems = computed(() => props.items.length);
const totalProvinces = computed(() => {
  // Count how many provinces have at least 1 moment
  const count = allRegisteredProvinces.value.filter(p => p.count > 0).length;
  return count > 0 ? count : allRegisteredProvinces.value.length;
});

// Markers filtered to selected sub-region (e.g. Tangsel)
const markersForSubRegion = computed<TimelineData[]>(() => {
  if (!selectedSubRegion.value) return [];
  const sub = selectedSubRegion.value;
  return markersForProvince.value.filter(item => {
    const loc = item.location?.toLowerCase() ?? '';
    const subKeywords: Record<string, string[]> = {
      tangsel:         ['tangerang selatan', 'tangsel', 'ciputat', 'pamulang', 'pondok aren', 'serpong', 'bintaro'],
      jaksel:          ['jakarta selatan', 'jaksel', 'kebayoran', 'cilandak', 'tebet', 'pancoran', 'mampang', 'pasar minggu', 'jagakarsa', 'pesanggrahan', 'setiabudi'],
      jakpus:          ['jakarta pusat', 'jakpus', 'gambir', 'menteng', 'tanah abang', 'senen', 'cempaka putih', 'kemayoran', 'sawah besar', 'johar baru', 'monas'],
      jakbar:          ['jakarta barat', 'jakbar', 'kebon jeruk', 'palmerah', 'grogol', 'tambora', 'taman sari', 'cengkareng', 'kalideres', 'kembangan'],
      jaktim:          ['jakarta timur', 'jaktim', 'matraman', 'pulogadung', 'jatinegara', 'duren sawit', 'kramat jati', 'pasar rebo', 'ciracas', 'cipayung', 'cakung'],
      jakut:           ['jakarta utara', 'jakut', 'penjaringan', 'tanjung priok', 'koja', 'cilincing', 'pademangan', 'kelapa gading', 'ancol'],
      bandung:         ['bandung', 'dago', 'lembang', 'gedung sate', 'alun-alun bandung', 'braga', 'sukajadi', 'buahbatu', 'cibiru', 'coblong'],
      cilegon:         ['cilegon'],
      kota_serang:     ['kota serang'],
      kab_serang:      ['kabupaten serang', 'kab serang'],
      pandeglang:      ['pandeglang'],
      lebak:           ['lebak'],
      kab_tangerang:   ['kabupaten tangerang', 'kab tangerang', 'tigaraksa', 'tangerang'],
      kota_tangerang:  ['kota tangerang'],
    };
    const kws = subKeywords[sub] ?? [sub];
    return kws.some(kw => loc.includes(kw));
  });
});

const selectedSubRegionName = computed(() => {
  const NAMES: Record<string, string> = {
    tangsel: 'Tangerang Selatan',
    jaksel: 'Jakarta Selatan',
    jakpus: 'Jakarta Pusat',
    jakbar: 'Jakarta Barat',
    jaktim: 'Jakarta Timur',
    jakut: 'Jakarta Utara',
    bandung: 'Kota Bandung',
  };
  return selectedSubRegion.value ? (NAMES[selectedSubRegion.value] ?? selectedSubRegion.value) : null;
});

// Auto-select first province (prefer Banten or first province with moments)
watch(
  allRegisteredProvinces,
  provinces => {
    if (provinces.length > 0 && !selectedProvinceId.value) {
      // Pick province with moments, preferring Banten
      const bantenWithMoments = provinces.find(p => p.id === 'banten' && p.count > 0);
      const firstWithMoments = provinces.find(p => p.count > 0);
      const banten = provinces.find(p => p.id === 'banten');
      selectedProvinceId.value = bantenWithMoments?.id || firstWithMoments?.id || banten?.id || provinces[0].id;
    }
  },
  { immediate: true }
);

// ── Handlers ──────────────────────────────────────────────────────────
function onSelectProvince(id: string) {
  selectedProvinceId.value = id;
  activeMarker.value = null;
  selectedSubRegion.value = null;
}

function onMarkerClick(item: TimelineData) {
  activeMarker.value = item;
}

function onSubRegionClick(regionId: string) {
  selectedSubRegion.value = regionId;
  activeMarker.value = null;
}

// ── Detail Modal ──────────────────────────────────────────────────────
const activeDetailItem = computed(() => {
  if (!activeDetailItemId.value) return null;
  return props.items.find(i => i.id === activeDetailItemId.value) || null;
});

function openDetail(item: TimelineData) {
  activeDetailItemId.value = item.id;
  emit('open-detail', item);
  pushNavState('timeline-detail');
}

function closeDetail() {
  activeDetailItemId.value = null;
}

// Modal swipe-to-dismiss
let modalTouchStartX = 0;
let modalTouchStartY = 0;

function onModalTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) {
    modalTouchStartX = e.touches[0].clientX;
    modalTouchStartY = e.touches[0].clientY;
  }
}

function onModalTouchEnd(e: TouchEvent) {
  if (e.changedTouches.length === 1) {
    const diffX = e.changedTouches[0].clientX - modalTouchStartX;
    const diffY = e.changedTouches[0].clientY - modalTouchStartY;
    if (diffX > 75 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
      closeDetail();
    }
  }
}

function isValidMapUrl(url?: string): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

const onGlobalCloseDetail = () => {
  if (activeDetailItemId.value) closeDetail();
};

// ── Hardware Back Button Integration ──────────────────────────────────
onMounted(() => {
  registerBackHandler('timeline-map-view', () => {
    // 0. Province selector pop-up open -> close it
    if (isProvinceModalOpen.value) {
      isProvinceModalOpen.value = false;
      return true;
    }
    // 1. Detail modal sheet open -> close it
    if (activeDetailItemId.value) {
      closeDetail();
      return true;
    }
    // 2. Active marker popup open -> dismiss it
    if (activeMarker.value) {
      activeMarker.value = null;
      return true;
    }
    // 3. Sub-region open (Tangsel) -> return to province (Banten)
    if (selectedSubRegion.value) {
      selectedSubRegion.value = null;
      return true;
    }
    // Not consumed -> default behavior will switch tab back to Home
    return false;
  });
  window.addEventListener('close-timeline-detail', onGlobalCloseDetail);
});

onBeforeUnmount(() => {
  window.removeEventListener('close-timeline-detail', onGlobalCloseDetail);
  unregisterBackHandler('timeline-map-view');
});
</script>

<style scoped>
.timeline-map-page {
  width: 100vw;
  max-width: 100vw;
  height: 100%;
  max-height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fffbf0;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  margin: 0;
  padding: 0;
  padding-bottom: 68px; /* space for fixed bottom navigation bar */
}

/* ─── Top Bar (Edge-to-edge device width) ─── */
.pmap-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px 10px;
  background: #ffffff;
  border-bottom: 2px solid var(--theme-border, #101010);
  border-left: none;
  border-right: none;
  flex-shrink: 0;
  gap: 12px;
  z-index: 20;
  box-sizing: border-box;
}

.pmap-topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pmap-topbar-icon-wrap {
  width: 38px;
  height: 38px;
  background: #ffdd00;
  border: 2px solid var(--theme-border, #101010);
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  color: var(--theme-border, #101010);
  box-shadow: 2.5px 2.5px 0 var(--theme-border, #101010);
  flex-shrink: 0;
}

.pmap-topbar-title {
  font-family: 'Outfit', 'Space Grotesk', sans-serif;
  font-size: 1.12rem;
  font-weight: 900;
  color: var(--theme-border, #101010);
  margin: 0;
  line-height: 1.15;
}

.pmap-topbar-sub {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b7280;
  margin: 3px 0 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.pmap-topbar-pill {
  display: inline-flex;
  align-items: center;
  padding: 1.5px 7px;
  background: #fef08a;
  color: var(--theme-border, #101010);
  border: 1.5px solid var(--theme-border, #101010);
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 800;
  box-shadow: 1px 1px 0 var(--theme-border, #101010);
}

.pmap-topbar-sep {
  color: #9ca3af;
  font-weight: bold;
}

.pmap-topbar-right {
  display: flex;
  align-items: center;
}

.pmap-topbar-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #ffffff;
  border: 1.5px solid var(--theme-border, #101010);
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.76rem;
  font-weight: 800;
  color: var(--theme-border, #101010);
  cursor: pointer;
  box-shadow: 2px 2px 0 var(--theme-border, #101010);
  transition: transform 0.08s, box-shadow 0.08s;
  white-space: nowrap;
}

.pmap-topbar-back-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 0 0 0 var(--theme-border, #101010);
}

/* Breadcrumb button in title */
.pmap-breadcrumb-btn {
  background: none;
  border: none;
  font-family: inherit;
  font-size: inherit;
  font-weight: 900;
  color: #2563eb;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.pmap-breadcrumb-sep {
  color: #9ca3af;
  margin: 0 4px;
  font-weight: 400;
}

/* ─── Chips Bar ─── */
.pmap-chips-bar {
  display: flex;
  gap: 8px;
  width: 100%;
  padding: 8px 16px;
  overflow-x: auto;
  flex-shrink: 0;
  background: #ffffff;
  border-bottom: 2px solid var(--theme-border, #101010);
  border-left: none;
  border-right: none;
  scrollbar-width: none;
  z-index: 15;
  box-sizing: border-box;
}

.pmap-chips-bar::-webkit-scrollbar {
  display: none;
}

.pmap-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1.5px solid var(--theme-border, #101010);
  background: #f3f4f6;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 2px 2px 0 var(--theme-border, #101010);
  transition: transform 0.08s, box-shadow 0.08s, background 0.12s;
}

.pmap-chip:active {
  transform: translate(1px, 1px);
  box-shadow: 0 0 0 var(--theme-border, #101010);
}

.pmap-chip.is-active {
  background: #ffdd00;
  border-color: var(--theme-border, #101010);
  box-shadow: 2.5px 2.5px 0 var(--theme-border, #101010);
}

.pmap-chip-name {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: #374151;
}

.pmap-chip.is-active .pmap-chip-name {
  color: var(--theme-border, #101010);
}

.pmap-chip-count {
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  font-weight: 800;
  background: var(--theme-border, #101010);
  color: #ffdd00;
  border-radius: 4px;
  padding: 1px 5px;
  min-width: 16px;
  text-align: center;
}

/* ─── Map Body ─── */
.pmap-body {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background: #fffbf0;
  min-height: 0;
  margin: 0;
  padding: 0;
}

.pmap-empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.pmap-empty-icon {
  font-size: 3.5rem;
  color: #d1d5db;
}

.pmap-empty-text {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 800;
  color: var(--theme-border, #101010);
  margin: 0;
}

.pmap-empty-hint {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0;
}

/* ─── Marker Popup Backdrop & Square Card (Fixed Center) ─── */
.pmap-popup-backdrop {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

.pmap-popup-card {
  position: relative;
  width: min(290px, 86vw);
  aspect-ratio: 1 / 1;
  background: #ffffff;
  border: 2.5px solid var(--theme-border, #101010);
  border-radius: 16px;
  box-shadow: 6px 6px 0 var(--theme-border, #101010);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

.pmap-popup-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.pmap-popup-dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 2px solid var(--theme-border, #101010);
  flex-shrink: 0;
  margin-top: 4px;
}

.pmap-popup-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--theme-border, #101010);
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.25;
}

.pmap-popup-dismiss {
  width: 26px;
  height: 26px;
  border: 1.5px solid var(--theme-border, #101010);
  border-radius: 6px;
  background: #f3f4f6;
  color: #374151;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pmap-popup-meta {
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: #4b5563;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
}

.pmap-popup-meta span {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pmap-popup-meta i {
  color: #ef4444;
  font-size: 0.85rem;
  width: 14px;
  text-align: center;
  flex-shrink: 0;
}

.pmap-popup-cta {
  width: 100%;
  padding: 11px 14px;
  background: #ffdd00;
  border: 2px solid var(--theme-border, #101010);
  border-radius: 10px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--theme-border, #101010);
  cursor: pointer;
  box-shadow: 3px 3px 0 var(--theme-border, #101010);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.08s, box-shadow 0.08s, background-color 0.15s;
}

.pmap-popup-cta:hover {
  background: #facc15;
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 var(--theme-border, #101010);
}

.pmap-popup-cta:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 var(--theme-border, #101010);
}

/* ─── Detail Modal (Neo-brutalist, identical to HomeView) ─── */
.detail-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9500;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
}

.detail-modal-content {
  background: var(--theme-modal-bg, #ffffff);
  border: 2px solid var(--theme-modal-border, #101010);
  box-shadow: 6px 6px 0 #101010;
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
}

.detail-fixed-top {
  padding: 20px 20px 0 20px;
  flex-shrink: 0;
}

.detail-header {
  position: relative;
  margin-bottom: 12px;
}

.detail-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.8rem;
  color: #101010;
  margin: 0;
  font-weight: 800;
}

.detail-subtitle-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.neo-pill {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  border: 2px solid #101010;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  color: #101010;
}

.map-pill {
  background: #e0e7ff;
  cursor: default;
}
.map-pill.has-map {
  cursor: pointer;
  box-shadow: 2px 2px 0 #101010;
  transition: all 0.1s ease;
}
.map-pill.has-map:active {
  transform: translate(2px, 2px);
  box-shadow: 0 0 0 #101010;
}

.date-pill {
  background: #f3f4f6;
}

.detail-map-container {
  margin-bottom: 16px;
}
.neo-iframe {
  border: 2px solid #101010 !important;
  box-shadow: 4px 4px 0 #101010;
  border-radius: 12px;
}

.detail-gallery-scroll {
  padding: 0 20px 20px 20px;
  flex-grow: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.gallery-grid-neo {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 600px) {
  .gallery-grid-neo {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

.gallery-empty {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
  font-family: 'Inter', sans-serif;
}
.gallery-empty i {
  font-size: 2.2rem;
  margin-bottom: 8px;
  display: block;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ─── Transitions ─── */
.pmap-popup-slide-enter-active {
  transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s;
}

.pmap-popup-slide-leave-active {
  transition: transform 0.18s ease, opacity 0.15s;
}

.pmap-popup-slide-enter-from {
  transform: translateX(-50%) translateY(16px);
  opacity: 0;
}

.pmap-popup-slide-leave-to {
  transform: translateX(-50%) translateY(10px);
  opacity: 0;
}

.detail-modal-fade-enter-active,
.detail-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.detail-modal-fade-enter-from,
.detail-modal-fade-leave-to {
  opacity: 0;
}

/* ─── Province Modal Backdrop ─── */
.pmap-tools-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9200;
  background: rgba(26, 26, 46, 0.45);
  backdrop-filter: blur(2px);
}

/* ─── Province Modal Panel (Neo-brutalist) ─── */
.pmap-province-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  z-index: 9300;
  width: calc(100% - 24px);
  max-width: 480px;
  max-height: min(85dvh, 640px);
  background: #ffffff;
  border: 2px solid #1a1a2e;
  border-radius: 18px;
  box-shadow: 6px 6px 0 #1a1a2e;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Modal Header */
.btools-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 2px solid #1a1a2e;
  background: #ffffff;
  flex-shrink: 0;
}

.btools-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btools-header-icon {
  width: 36px;
  height: 36px;
  background: #fcd34d;
  border: 2px solid #1a1a2e;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  color: #1a1a2e;
  box-shadow: 2px 2px 0 #1a1a2e;
  flex-shrink: 0;
}

.btools-header-title {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 800;
  color: #1a1a2e;
  line-height: 1.2;
}

.btools-header-sub {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  color: #64748b;
  font-weight: 600;
  margin-top: 2px;
}

/* Search Box in Modal */
.btools-search-section {
  padding: 10px 14px;
  border-bottom: 1.5px solid #f1f5f9;
  background: #ffffff;
  flex-shrink: 0;
}

.btools-search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.btools-search-box .search-icon {
  position: absolute;
  left: 11px;
  font-size: 0.85rem;
  color: #94a3b8;
}

.btools-search-input {
  width: 100%;
  padding: 8px 32px 8px 32px;
  background: #f8fafc;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  color: #1a1a2e;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease;
}

.btools-search-input:focus {
  border-color: #1a1a2e;
  background: #ffffff;
}

.btools-search-clear {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px;
}

/* Scrollable Province List */
.province-scroll-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 60vh;
}

.province-items-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.province-item-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 11px 14px;
  cursor: pointer;
  transition: all 0.12s ease;
  text-align: left;
}

.province-item-btn:hover {
  border-color: #1a1a2e;
  background: #f1f5f9;
}

.province-item-btn.is-active {
  background: #fef08a;
  border: 2px solid #1a1a2e;
  box-shadow: 2px 2px 0 #1a1a2e;
}

.region-btn-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.region-btn-left > i {
  font-size: 1.05rem;
  color: #64748b;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.province-item-btn.is-active .region-btn-left > i {
  color: #92400e;
}

.region-btn-type {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  color: #94a3b8;
}

.province-item-btn.is-active .region-btn-type {
  color: #78350f;
}

.region-btn-name {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 0.98rem;
  font-weight: 800;
  color: #1a1a2e;
}

.province-item-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.province-count-pill {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 800;
  background: #1a1a2e;
  color: #ffdd00;
  border-radius: 6px;
  padding: 3px 8px;
}

.province-selected-icon {
  color: #15803d;
  font-size: 1.15rem;
}

.province-empty-search {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 12px;
  color: #94a3b8;
  text-align: center;
  gap: 10px;
}

.province-empty-search i {
  font-size: 2.2rem;
}

/* Modal Footer */
.btools-footer {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-top: 1.5px solid #f1f5f9;
  background: #f8fafc;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

.btools-close-footer-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fee2e2;
  border: 1.5px solid #1a1a2e;
  border-radius: 10px;
  padding: 11px 16px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.92rem;
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

/* Panel Transitions */
.pmap-panel-slide-enter-active,
.pmap-panel-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.pmap-panel-slide-enter-from,
.pmap-panel-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -46%) scale(0.96);
}

.bmap-backdrop-fade-enter-active,
.bmap-backdrop-fade-leave-active,
.pmap-backdrop-fade-enter-active,
.pmap-backdrop-fade-leave-active {
  transition: opacity 0.18s ease;
}

.bmap-backdrop-fade-enter-from,
.bmap-backdrop-fade-leave-to,
.pmap-backdrop-fade-enter-from,
.pmap-backdrop-fade-leave-to {
  opacity: 0;
}

/* Marker Popup Fade & Scale */
.pmap-popup-fade-enter-active,
.pmap-popup-fade-leave-active {
  transition: opacity 0.2s ease;
}

.pmap-popup-fade-enter-active .pmap-popup-card,
.pmap-popup-fade-leave-active .pmap-popup-card {
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}

.pmap-popup-fade-enter-from,
.pmap-popup-fade-leave-to {
  opacity: 0;
}

.pmap-popup-fade-enter-from .pmap-popup-card,
.pmap-popup-fade-leave-to .pmap-popup-card {
  opacity: 0;
  transform: scale(0.92);
}
</style>
