<template>
  <div class="timeline-view-wrapper">
    <!-- Hero Header Section (optional banner/branding bisa di sini) -->

    <!-- Recent Highlights Section -->
    <RecentHighlights
      :items="items"
      :max-items="5"
      @open-detail="item => openDetail(item, 'highlights')"
    />

    <!-- Timeline Content with slide transition -->
    <div class="timeline-content-wrapper">
      <!-- Timeline Section Header (Galeri + Year Selector + Map) - STICKY, NO SWIPE -->
      <div class="timeline-section-header">
        <div class="timeline-header-left">
          <h1 class="timeline-section-title">Galeri</h1>
        </div>

        <div class="timeline-header-actions">
          <!-- Custom Month Selector Dropdown -->
          <div class="month-selector-wrapper">
            <button class="month-dropdown-btn" @click="isMonthDropdownOpen = !isMonthDropdownOpen" aria-label="Pilih Bulan">
              <span class="dropdown-label-text">{{ activeMonthLabel }}</span>
              <i class="fa-solid fa-chevron-down dropdown-icon"></i>
            </button>

            <div v-if="isMonthDropdownOpen" class="month-dropdown-overlay" @click="isMonthDropdownOpen = false"></div>

            <Transition name="fade">
              <div v-if="isMonthDropdownOpen" class="month-dropdown-menu">
                <button
                  v-for="opt in MONTH_DROPDOWN_OPTIONS"
                  :key="opt.value ?? 'all'"
                  class="month-dropdown-item"
                  :class="{ 'is-active': opt.value === activeMonth }"
                  @click="selectMonth(opt.value)"
                >
                  <span>{{ opt.label }}</span>
                  <div class="radio-circle"><div v-if="opt.value === activeMonth" class="radio-inner"></div></div>
                </button>
              </div>
            </Transition>
          </div>

          <!-- Custom Year Selector -->
          <div class="year-selector-wrapper">
            <button class="year-dropdown-btn" @click="isYearDropdownOpen = !isYearDropdownOpen" aria-label="Pilih Tahun">
              <span class="dropdown-label-text">{{ activeYear || 'Tahun' }}</span>
              <i class="fa-solid fa-chevron-down dropdown-icon"></i>
            </button>

            <div v-if="isYearDropdownOpen" class="year-dropdown-overlay" @click="isYearDropdownOpen = false"></div>

            <Transition name="fade">
              <div v-if="isYearDropdownOpen" class="year-dropdown-menu">
                <button
                  v-for="y in availableYears"
                  :key="y"
                  class="year-dropdown-item"
                  :class="{ 'is-active': y === activeYear }"
                  @click="selectYear(y)"
                >
                  <span>{{ y }}</span>
                  <div class="radio-circle"><div v-if="y === activeYear" class="radio-inner"></div></div>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Swipeable Content Area - ONLY THIS SWIPES -->
      <div
        class="timeline-swipeable-area"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
        <Transition :name="transitionName" mode="out-in">
          <div :key="activeYear ?? 'none'" class="timeline-container">
            <!-- Global Vertical Dotted Line -->
            <div v-if="filteredItems.length > 0" class="timeline-main-line"></div>

            <!-- Month groups -->
            <template v-if="filteredItems.length > 0 && monthGroups.length > 0">
              <!-- BLUE AMBER THEME FAMILY: Hanging Chain Memory Cards Layout -->
              <template v-if="isBlueAmberFamily">
                <div v-for="group in monthGroups" :key="group.month" class="chain-month-group">
                  <!-- Month header -->
                  <div class="month-header">
                    <div class="month-label-wrap">
                      <span class="month-name">{{ group.label }}</span>
                      <span class="month-count">{{ group.items.length }}×</span>
                    </div>
                    <div class="month-line"></div>
                  </div>

                  <!-- Two-Column Bento Memory Grid — Parallel Same-Column Vertical Chains -->
                  <div class="bento-canvas-wrapper">
                    <!-- Top Hanging Chains from Month Header down to First Row -->
                    <div class="bento-header-hangers" aria-hidden="true">
                      <div class="bento-hanger bento-hanger--left">
                        <div class="bento-chain-segment" :style="{ backgroundImage: `url(${chainAssetUrl})` }"></div>
                      </div>
                      <div class="bento-hanger bento-hanger--right">
                        <div class="bento-chain-segment" :style="{ backgroundImage: `url(${chainAssetUrl})` }"></div>
                      </div>
                    </div>

                    <!-- Bento Grid Rows (2 cards per row: Left Column and Right Column) -->
                    <div
                      v-for="(pair, rIdx) in group.canvasPairs"
                      :key="rIdx"
                      class="bento-row-block"
                    >
                      <div
                        class="bento-grid-row"
                        :class="{ 'bento-grid-row--solo': pair.length === 1 }"
                      >
                        <!-- Left Column Card (Moment 2*rIdx) -->
                        <div class="bento-col bento-col--left">
                          <div
                            class="bento-card"
                            :class="`bento-card--variation-${rIdx % 2 === 0 ? 'a' : 'b'}`"
                            @click="openDetail(pair[0], 'gallery')"
                            role="button"
                            tabindex="0"
                            @keydown.enter="openDetail(pair[0], 'gallery')"
                            :title="`Buka detail: ${pair[0].title}`"
                            :aria-label="`Buka detail: ${pair[0].title}`"
                          >
                            <!-- Top Eyelet (Receives vertical chain from above) -->
                            <div class="bento-eyelet bento-eyelet--top" aria-hidden="true">
                              <div class="bento-eyelet-hole"></div>
                              <div class="bento-eyelet-grommet"></div>
                            </div>

                            <div class="chain-card-inner">
                              <!-- Main Thumbnail Photo -->
                              <div class="chain-card-photo-wrap">
                                <img
                                  v-if="pair[0].moments && pair[0].moments.length > 0"
                                  :src="pair[0].moments[0].image"
                                  :alt="pair[0].title"
                                  class="chain-card-photo"
                                  loading="lazy"
                                />
                                <div v-else class="chain-card-photo-placeholder">
                                  <i class="fa-regular fa-image"></i>
                                </div>
                              </div>

                              <!-- Moment Information -->
                              <div class="chain-card-info">
                                <h3 class="chain-card-title">{{ pair[0].title }}</h3>
                                <div class="chain-card-meta">
                                  <span v-if="pair[0].location" class="chain-card-location" :title="pair[0].location">
                                    <i class="fa-solid fa-location-dot"></i>
                                    <span>{{ pair[0].location }}</span>
                                  </span>
                                  <span v-if="pair[0].date" class="chain-card-date">
                                    <i class="fa-regular fa-calendar"></i>
                                    <span>{{ pair[0].date }}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <!-- Bottom Eyelet (Sends vertical chain to next row in Left Column) -->
                            <div
                              v-if="rIdx < group.canvasPairs.length - 1"
                              class="bento-eyelet bento-eyelet--bottom"
                              aria-hidden="true"
                            >
                              <div class="bento-eyelet-hole"></div>
                              <div class="bento-eyelet-grommet"></div>
                            </div>
                          </div>
                        </div>

                        <!-- Right Column Card (Moment 2*rIdx + 1) -->
                        <div v-if="pair.length > 1" class="bento-col bento-col--right">
                          <div
                            class="bento-card"
                            :class="`bento-card--variation-${rIdx % 2 === 0 ? 'b' : 'a'}`"
                            @click="openDetail(pair[1], 'gallery')"
                            role="button"
                            tabindex="0"
                            @keydown.enter="openDetail(pair[1], 'gallery')"
                            :title="`Buka detail: ${pair[1].title}`"
                            :aria-label="`Buka detail: ${pair[1].title}`"
                          >
                            <!-- Top Eyelet (Receives vertical chain from above) -->
                            <div class="bento-eyelet bento-eyelet--top" aria-hidden="true">
                              <div class="bento-eyelet-hole"></div>
                              <div class="bento-eyelet-grommet"></div>
                            </div>

                            <div class="chain-card-inner">
                              <!-- Main Thumbnail Photo -->
                              <div class="chain-card-photo-wrap">
                                <img
                                  v-if="pair[1].moments && pair[1].moments.length > 0"
                                  :src="pair[1].moments[0].image"
                                  :alt="pair[1].title"
                                  class="chain-card-photo"
                                  loading="lazy"
                                />
                                <div v-else class="chain-card-photo-placeholder">
                                  <i class="fa-regular fa-image"></i>
                                </div>
                              </div>

                              <!-- Moment Information -->
                              <div class="chain-card-info">
                                <h3 class="chain-card-title">{{ pair[1].title }}</h3>
                                <div class="chain-card-meta">
                                  <span v-if="pair[1].location" class="chain-card-location" :title="pair[1].location">
                                    <i class="fa-solid fa-location-dot"></i>
                                    <span>{{ pair[1].location }}</span>
                                  </span>
                                  <span v-if="pair[1].date" class="chain-card-date">
                                    <i class="fa-regular fa-calendar"></i>
                                    <span>{{ pair[1].date }}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <!-- Bottom Eyelet (Sends vertical chain to next row in Right Column) -->
                            <div
                              v-if="rIdx < group.canvasPairs.length - 1 && group.canvasPairs[rIdx + 1]?.length > 1"
                              class="bento-eyelet bento-eyelet--bottom"
                              aria-hidden="true"
                            >
                              <div class="bento-eyelet-hole"></div>
                              <div class="bento-eyelet-grommet"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Vertical Chains Connecting Row rIdx down to Row rIdx + 1 (Same Column) -->
                      <div
                        v-if="rIdx < group.canvasPairs.length - 1"
                        class="bento-vertical-chains-connector"
                        aria-hidden="true"
                      >
                        <!-- Left Column Vertical Chain (Left Card rIdx -> Left Card rIdx + 1) -->
                        <div class="bento-chain-track bento-chain-track--left">
                          <div class="bento-chain-segment" :style="{ backgroundImage: `url(${chainAssetUrl})` }"></div>
                          <div class="bento-chain-lip bento-chain-lip--top"></div>
                          <div class="bento-chain-lip bento-chain-lip--bottom"></div>
                        </div>

                        <!-- Right Column Vertical Chain (Right Card rIdx -> Right Card rIdx + 1) -->
                        <div
                          v-if="pair.length > 1 && group.canvasPairs[rIdx + 1]?.length > 1"
                          class="bento-chain-track bento-chain-track--right"
                        >
                          <div class="bento-chain-segment" :style="{ backgroundImage: `url(${chainAssetUrl})` }"></div>
                          <div class="bento-chain-lip bento-chain-lip--top"></div>
                          <div class="bento-chain-lip bento-chain-lip--bottom"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- OTHER THEMES: Preserved Traditional Timeline -->
              <template v-else>
                <div v-for="group in monthGroups" :key="group.month" class="month-group">
                  <!-- Month header -->
                  <div class="month-header">
                    <div class="month-label-wrap">
                      <span class="month-name">{{ group.label }}</span>
                      <span class="month-count">{{ group.items.length }}×</span>
                    </div>
                    <div class="month-line"></div>
                  </div>

                  <!-- Trip cards list -->
                  <div class="trips-list">
                    <div
                      v-for="item in group.items"
                      :key="item.id"
                      class="trip-row"
                    >
                      <!-- Timeline vertical marker column -->
                      <div class="trip-timeline-col">
                        <div class="trip-dot" :style="{ backgroundColor: item.dotColor }"></div>
                      </div>

                      <!-- Actual Trip Card -->
                      <div
                        class="trip-card"
                        @click="openDetail(item, 'gallery')"
                        role="button"
                        tabindex="0"
                        @keydown.enter="openDetail(item, 'gallery')"
                      >
                        <div class="trip-body">
                          <div class="trip-meta">
                            <h3 class="trip-title">{{ item.title }}</h3>
                            <div class="trip-tags">
                              <span v-if="item.location" class="trip-tag">
                                <i class="fa-solid fa-location-dot"></i> {{ item.location }}
                              </span>
                              <span v-if="item.date" class="trip-tag trip-tag--muted">
                                <i class="fa-regular fa-calendar"></i> {{ item.date }}
                              </span>
                              <span v-if="item.addedBy" class="trip-tag trip-tag--author">
                                <i class="fa-solid fa-user"></i> {{ item.addedBy }}
                              </span>
                            </div>
                          </div>

                          <!-- Photo thumbnail strip -->
                          <div v-if="item.moments && item.moments.length > 0" class="thumb-strip">
                            <div v-for="(m, idx) in item.moments.slice(0, 4)" :key="idx" class="thumb">
                              <img :src="m.image" :alt="m.title" loading="lazy" />
                            </div>
                            <div v-if="item.moments.length > 4" class="thumb thumb--more">
                              +{{ item.moments.length - 4 }}
                            </div>
                          </div>
                          <div v-else class="thumb-empty">
                            <i class="fa-regular fa-image"></i> Belum ada foto
                          </div>
                        </div>

                        <!-- Chevron -->
                        <div class="trip-chevron">
                          <i class="fa-solid fa-chevron-right"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </template>

            <!-- Empty state -->
            <div v-else class="empty-state">
              <div class="empty-icon"><i class="fa-regular fa-compass"></i></div>
              <h3>Belum ada perjalanan<br>{{ activeMonthLabel !== 'Semua Bulan' ? `di bulan ${activeMonthLabel} ` : '' }}di tahun {{ activeYear }}</h3>
              <p>Mungkin masih dalam perencanaan :D</p>
              <button class="btn-add-empty" @click="$emit('add-moment')" id="btn-add-first-moment">
                <i class="fa-solid fa-plus"></i> Tambah Momen Pertama
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>


    <!-- Detail Modal -->
    <Transition name="fade">
      <div
        v-if="activeDetailItem"
        class="detail-modal-overlay"
        @click.self="closeDetail"
        @touchstart="onModalTouchStart"
        @touchend="onModalTouchEnd"
      >
        <div class="detail-modal-content">

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
              <p>Belum ada foto. Tambahkan lewat tombol ✏️</p>
            </div>
          </div>
          <!-- /Scrollable gallery -->

          <!-- Dedicated FAB footer section (only from gallery) -->
          <div
            v-if="detailSource === 'gallery'"
            class="detail-fab-section"
            @click.stop
          >
            <!-- FAB row: sub-actions float ABOVE, section height stays fixed -->
            <div class="detail-fab-row">
              <!-- Sub-actions popup (floats absolutely above the FAB) -->
              <Transition name="card-fab-sub">
                <div v-if="isDetailFabOpen" class="card-fab-actions">
                  <div
                    class="card-fab-item btn--edit"
                    @click.stop="handleFabEditMoment"
                    role="button"
                    tabindex="0"
                  >
                    <span class="card-fab-label">Edit Momen</span>
                    <div class="card-fab-circle edit-circle"><i class="fa-solid fa-pen"></i></div>
                  </div>
                  <div
                    class="card-fab-item btn--caption"
                    @click.stop="handleFabEditCaptions"
                    role="button"
                    tabindex="0"
                  >
                    <span class="card-fab-label">Kelola Caption Foto</span>
                    <div class="card-fab-circle caption-circle"><i class="fa-solid fa-comment-dots"></i></div>
                  </div>
                </div>
              </Transition>

              <!-- Main FAB button -->
              <button
                type="button"
                class="card-fab-main"
                :class="{ 'is-active': isDetailFabOpen }"
                @click.stop="isDetailFabOpen = !isDetailFabOpen"
                aria-label="Menu Aksi Detail"
              >
                <i class="fa-solid fa-ellipsis-vertical fab-icon-pen"></i>
                <i class="fa-solid fa-xmark fab-icon-x"></i>
              </button>
            </div>
          </div>
          <!-- /FAB footer section -->

        </div>
      </div>
    </Transition>

    <!-- Moment Caption Modal -->
    <MomentCaptionModal
      v-if="showCaptionModal && captionTargetMoment"
      :moment="captionTargetMoment"
      @close="showCaptionModal = false; captionTargetMoment = null"
      @save-captions="handleSaveCaptions"
    />

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch, type PropType } from 'vue';
import TimelineCard from '../components/feed/TimelineCard.vue';
import RecentHighlights from '../components/shared/RecentHighlights.vue';
import MomentCaptionModal from '../components/modals/MomentCaptionModal.vue';
import { registerBackHandler, unregisterBackHandler } from '../composables/useBackButton';
import { pushNavState } from '../composables/useGestureNavigation';
import { useTheme } from '../composables/useTheme';
import type { TimelineData } from '../data/timeline';
import chainAssetUrl from '../assets/chain.png';

const { activeThemeId } = useTheme();

// Helper to determine if the active theme belongs to the Blue Amber family
const isBlueAmberFamily = computed(() => {
  return activeThemeId.value === 'blue amber' ||
         activeThemeId.value === 'blue amber warm' ||
         activeThemeId.value === 'blue amber cool';
});

const props = defineProps({
  items: { type: Array as PropType<TimelineData[]>, required: true }
});

const emit = defineEmits(['add-moment', 'edit-moment', 'update-moment-captions', 'detail-modal-toggled', 'reorder-photos']);


// ── Indonesian month names ───────────────────────────────────────────
const BULAN_ID = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];

function isValidMapUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

const ID_UP = BULAN_ID.map(b => b.toUpperCase());
const EN_UP = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
const SH_UP = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function getMonthFromDate(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const u = dateStr.toUpperCase();
  for (let i = 0; i < ID_UP.length; i++) if (u.includes(ID_UP[i])) return i + 1;
  for (let i = 0; i < EN_UP.length; i++) if (u.includes(EN_UP[i])) return i + 1;
  for (let i = 0; i < SH_UP.length; i++) if (u.includes(SH_UP[i])) return i + 1;
  const m = dateStr.match(/\d{4}-(\d{2})/);
  if (m) return parseInt(m[1]);
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed.getMonth() + 1;
  return null;
}

function getDayFromDate(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  // Look for 1 or 2 digits standing alone or at the start
  const m = dateStr.match(/(?:^|\b)(\d{1,2})\b/);
  return m ? parseInt(m[1]) : 0;
}

// Robust date timestamp parser for chronological ordering (UTC to avoid timezone shifts)
function parseEventTimestamp(dateStr: string | null | undefined, fallbackYear: number = 2026): number {
  if (!dateStr) return 0;
  const trimmed = dateStr.trim();

  // 1. Try ISO format: YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return Date.UTC(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
  }

  // 2. Named Indonesian / English date string: e.g. "24 Maret 2026" or "4 April 2026"
  const day = getDayFromDate(trimmed) || 1;
  const month = getMonthFromDate(trimmed) || 1;
  const yearMatch = trimmed.match(/\b(20\d\d|19\d\d)\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : fallbackYear;

  return Date.UTC(year, month - 1, day);
}

// ── Year logic ───────────────────────────────────────────────────────
const availableYears = computed(() => {
  const years = new Set(props.items.filter(i => i.year !== 9999).map(i => i.year));
  [2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020].forEach(y => years.add(y));
  return Array.from(years).sort((a, b) => b - a);
});

const initialYear = computed(() => {
  const validItems = props.items.filter(i => i.year !== 9999);
  return validItems.length > 0
    ? Math.max(...validItems.map(i => i.year))
    : new Date().getFullYear();
});

const activeYear = ref<number | null>(null);
const isYearDropdownOpen = ref(false);

function selectYear(y: number) {
  activeYear.value = y;
  isYearDropdownOpen.value = false;
}

// ── Month selector options & state ──────────────────────────────────
const MONTH_DROPDOWN_OPTIONS = [
  { value: null, label: 'Semua Bulan' },
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' }
];

const activeMonth = ref<number | null>(null);
const isMonthDropdownOpen = ref(false);

const activeMonthLabel = computed(() => {
  if (activeMonth.value === null) return 'Semua Bulan';
  const opt = MONTH_DROPDOWN_OPTIONS.find(o => o.value === activeMonth.value);
  return opt ? opt.label : 'Semua Bulan';
});

function selectMonth(m: number | null) {
  activeMonth.value = m;
  isMonthDropdownOpen.value = false;
}

const transitionName = ref('slide-left');
const activeDetailItemId = ref<string | null>(null);
// Computed: always reads the freshest data from props.items — no sync needed
const activeDetailItem = computed(() => {
  if (!activeDetailItemId.value) return null;
  return props.items.find(i => i.id === activeDetailItemId.value) || null;
});
const isMapExpanded = ref(false);
let touchStartX = 0;

watch(initialYear, (val) => {
  if (activeYear.value === null) activeYear.value = val;
}, { immediate: true });

// ── Filtered by year ─────────────────────────────────────────────────
const filteredItems = computed(() =>
  props.items.filter(item => item.year === activeYear.value && item.title !== '__SYSTEM_COLLABORATOR_METADATA__')
);


// ── Group by month & canvas pairs (2 moments per canvas) ───────────────
const monthGroups = computed(() => {
  const map = new Map<number, TimelineData[]>();
  for (const item of filteredItems.value) {
    const month = getMonthFromDate(item.date) ?? 0;
    if (!map.has(month)) map.set(month, []);
    map.get(month)!.push(item);
  }

  const isBlueAmber = isBlueAmberFamily.value;

  // If a specific month is selected, filter to only that month
  let monthKeys = Array.from(map.keys());
  if (activeMonth.value !== null) {
    monthKeys = monthKeys.filter(m => m === activeMonth.value);
  }

  // For Blue Amber: sort newest month first (descending: 12 -> 1, then 0 / Tanpa Tanggal)
  // For other themes: maintain previous sorting
  const sorted = monthKeys.sort((a, b) => {
    if (a === 0) return 1;
    if (b === 0) return -1;
    return isBlueAmber ? b - a : a - b;
  });

  return sorted.map(month => {
    const items = [...(map.get(month) || [])];
    if (isBlueAmber) {
      // Sort items by actual event date descending (Newest moment first)
      items.sort((a: TimelineData, b: TimelineData) => {
        const timeA = parseEventTimestamp(a.date, a.year);
        const timeB = parseEventTimestamp(b.date, b.year);
        return timeB - timeA;
      });
    } else {
      // Sort items by day ascending (1 -> 31)
      items.sort((a: TimelineData, b: TimelineData) => getDayFromDate(a.date) - getDayFromDate(b.date));
    }

    // Partition items into batches of two cards per canvas/group
    const canvasPairs: TimelineData[][] = [];
    for (let i = 0; i < items.length; i += 2) {
      canvasPairs.push(items.slice(i, i + 2));
    }

    return {
      month,
      label: month > 0 ? BULAN_ID[month - 1] : 'Tanpa Tanggal',
      items,
      canvasPairs,
    };
  });
});

// ── Year slide direction & month reset synchronization ─────────────
watch(activeYear, (newVal, oldVal) => {
  if (oldVal !== null) {
    const ni = availableYears.value.indexOf(newVal ?? 0);
    const oi = availableYears.value.indexOf(oldVal ?? 0);
    transitionName.value = ni > oi ? 'slide-left' : 'slide-right';
  }

  // If selected month has no moments in newly selected year, reset to Semua Bulan
  if (activeMonth.value !== null) {
    const hasData = props.items.some(
      item => item.year === newVal &&
      item.title !== '__SYSTEM_COLLABORATOR_METADATA__' &&
      getMonthFromDate(item.date) === activeMonth.value
    );
    if (!hasData) {
      activeMonth.value = null;
    }
  }
});

// ── Swipe ────────────────────────────────────────────────────────────
const onTouchStart = (e: TouchEvent) => { touchStartX = e.changedTouches[0].screenX; };
const onTouchEnd = (e: TouchEvent) => {
  const diff = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(diff) < 60) return;
  const idx = availableYears.value.indexOf(activeYear.value ?? 0);
  if (diff > 0 && idx > 0) activeYear.value = availableYears.value[idx - 1];
  else if (diff < 0 && idx < availableYears.value.length - 1) activeYear.value = availableYears.value[idx + 1];
};

// ── Detail Modal & FAB State ──────────────────────────────────────────

const detailSource = ref<'highlights' | 'gallery'>('gallery');
const isDetailFabOpen = ref(false);
const showCaptionModal = ref(false);
const captionTargetMoment = ref<any>(null);

function openCaptionModal(moment: any) {
  captionTargetMoment.value = moment;
  showCaptionModal.value = true;
}

function handleSaveCaptions(payload: { id: string; moments: any[] }) {
  emit('update-moment-captions', payload);
}

function handleFabEditMoment() {
  isDetailFabOpen.value = false;
  if (activeDetailItem.value) {
    emit('edit-moment', activeDetailItem.value);
  }
}

function handleFabEditCaptions() {
  isDetailFabOpen.value = false;
  if (activeDetailItem.value) {
    openCaptionModal(activeDetailItem.value);
  }
}

const openDetail = (item: TimelineData, source: 'highlights' | 'gallery' = 'gallery') => {
  activeDetailItemId.value = item.id;
  detailSource.value = source;
  isDetailFabOpen.value = false;
  document.documentElement.classList.add('modal-open');
  emit('detail-modal-toggled', true);
  pushNavState('detail-modal');
};
const closeDetail = () => {
  activeDetailItemId.value = null;
  isDetailFabOpen.value = false;
  document.documentElement.classList.remove('modal-open');
  emit('detail-modal-toggled', false);
};

// Modal swipe-to-dismiss
let modalTouchStartX = 0;
let modalTouchStartY = 0;

const onModalTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 1) {
    modalTouchStartX = e.touches[0].clientX;
    modalTouchStartY = e.touches[0].clientY;
  }
};

const onModalTouchEnd = (e: TouchEvent) => {
  if (e.changedTouches.length === 1) {
    const diffX = e.changedTouches[0].clientX - modalTouchStartX;
    const diffY = e.changedTouches[0].clientY - modalTouchStartY;
    // Swipe right to dismiss modal
    if (diffX > 75 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
      closeDetail();
    }
  }
};

// When a moment is deleted externally, close detail if it was open
watch(() => props.items, (newItems) => {
  if (activeDetailItemId.value) {
    const stillExists = newItems.find(i => i.id === activeDetailItemId.value);
    if (!stillExists) closeDetail();
  }
});

// ── Photo Grid Logic (Removed swipe-to-reorder) ───────────────────────
// Reordering is now exclusively handled in the Edit Modal.

const onGlobalCloseDetail = () => {
  if (activeDetailItemId.value) closeDetail();
};

onMounted(() => {
  window.addEventListener('open-timeline-detail', (e) => {
    const item = props.items.find(i => i.id === (e as CustomEvent<string>).detail);
    if (item) openDetail(item);
  });
  window.addEventListener('close-timeline-detail', onGlobalCloseDetail);

  registerBackHandler('home-detail-modal', () => {
    if (activeDetailItemId.value) {
      closeDetail();
      return true;
    }
    return false;
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('close-timeline-detail', onGlobalCloseDetail);
  unregisterBackHandler('home-detail-modal');
});
</script>

<style scoped>
.timeline-view-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Enable vertical scrolling */
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox - hide scrollbar */
  -ms-overflow-style: none; /* IE/Edge - hide scrollbar */
}

/* Hide scrollbar for Chrome/Safari */
.timeline-view-wrapper::-webkit-scrollbar {
  display: none;
}

/* ── Timeline Section Header ─────────────────────────────────────── */
.timeline-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 12px;
  margin-bottom: 8px;
  background: var(--theme-header-bg);
  border-bottom: 2px solid var(--theme-border, #101010);
  position: sticky;
  top: 0;
  z-index: 30;
  transition: background 0.3s ease;
}

.timeline-header-left {
  flex: 1;
  padding-left: 16px;
}

.timeline-section-title {
  font-family: 'Outfit', 'Space Grotesk', sans-serif;
  font-size: 1.6rem;
  font-weight: 900;
  color: var(--theme-header-text, #101010);
  margin: 0;
  line-height: 1.1;
  transition: color 0.3s ease;
}

.timeline-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 16px;
  flex-shrink: 0;
}

/* Custom Dropdown Wrappers (Month & Year) */
.month-selector-wrapper,
.year-selector-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.month-dropdown-btn,
.year-dropdown-btn {
  appearance: none;
  background: var(--theme-surface);
  color: var(--theme-text);
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 0.78rem;
  padding: 6px 26px 6px 12px;
  border: 1px solid var(--theme-border);
  border-radius: 8px;
  cursor: pointer;
  box-shadow: none;
  outline: none;
  transition: all 0.2s ease;
  position: relative;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.dropdown-label-text {
  max-width: 95px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.month-dropdown-btn:hover,
.year-dropdown-btn:hover {
  background: var(--theme-accent);
  color: white;
  border-color: var(--theme-accent);
}

.month-dropdown-btn:active,
.year-dropdown-btn:active {
  transform: scale(0.98);
}

.dropdown-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 0.7rem;
  transition: color 0.2s ease;
}

.month-dropdown-btn:hover .dropdown-icon,
.year-dropdown-btn:hover .dropdown-icon {
  color: white;
}

.month-dropdown-overlay,
.year-dropdown-overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
}

.month-dropdown-menu,
.year-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 140px;
  max-height: 280px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--theme-surface);
  border: 2px solid var(--theme-border);
  border-radius: 0;
  box-shadow: 4px 4px 0 var(--theme-accent-light), 4px 4px 0 2px var(--theme-border);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.month-dropdown-item,
.year-dropdown-item {
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--theme-border);
  padding: 10px 14px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--theme-text);
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.15s;
  white-space: nowrap;
}

.month-dropdown-item:last-child,
.year-dropdown-item:last-child {
  border-bottom: none;
}

.month-dropdown-item:hover,
.year-dropdown-item:hover {
  background: var(--theme-accent-light);
  color: var(--theme-text);
}

.month-dropdown-item.is-active,
.year-dropdown-item.is-active {
  background: var(--theme-accent);
  color: white;
  font-weight: 800;
}

.radio-circle {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--theme-surface);
  transition: all 0.15s;
}

.month-dropdown-item.is-active .radio-circle,
.year-dropdown-item.is-active .radio-circle {
  background: white;
  border-color: white;
}

.radio-inner {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--theme-text);
  transition: background 0.15s;
}

.month-dropdown-item.is-active .radio-inner,
.year-dropdown-item.is-active .radio-inner {
  background: var(--theme-accent);
}





/* ── Timeline container ──────────────────────────────────────────── */
.timeline-content-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Timeline Swipeable Area - This is where swipe happens */
.timeline-swipeable-area {
  flex: 1;
  position: relative;
  overflow: visible;
  touch-action: pan-y; /* Allow vertical scroll, enable horizontal swipe detection */
}

.timeline-container {
  padding: 0 0 80px;
  position: relative;
}

/* Global Vertical Dotted Line */
.timeline-main-line {
  position: absolute;
  top: 36px;
  bottom: 36px;
  left: 27px;
  width: 0;
  border-left: 2.5px dashed var(--theme-dot-line);
  z-index: 0;
  pointer-events: none;
  transition: border-color 0.3s ease;
}

/* ── Month groups ────────────────────────────────────────────────── */
.month-group {
  margin-bottom: 28px;
  margin-left: 16px;
  margin-right: 16px;
  position: relative;
  z-index: 1;
}

.month-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-top: 8px;
  padding-bottom: 8px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--theme-month-bg);
  margin-left: -16px;
  margin-right: -16px;
  padding-left: 52px;
  padding-right: 16px;
  transition: background 0.3s ease;
}

.month-label-wrap {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-shrink: 0;
}

.month-name {
  font-family: 'Outfit', 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 900;
  color: var(--theme-month-label);
  text-transform: uppercase;
  letter-spacing: -0.3px;
  transition: color 0.3s ease;
}

.month-count {
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--theme-month-count-text);
  background: var(--theme-month-count-bg);
  padding: 1px 6px;
  border-radius: 20px;
  transition: background 0.3s ease, color 0.3s ease;
}

.month-line {
  flex: 1;
  height: 1px;
  background: repeating-linear-gradient(90deg, #d1d5db 0px, #d1d5db 5px, transparent 5px, transparent 10px);
}

/* ══════════════════════════════════════════════════════════════════
   HANGING CHAIN MEMORY CARDS — Galeri Redesign
   Inspired by connected scrapbook cards hanging by delicate chains
   ══════════════════════════════════════════════════════════════════ */
.chain-month-group {
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.chain-canvas-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 10px;
}

.chain-canvas-group {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  margin-bottom: 12px;
}

/* ══════════════════════════════════════════════════════════════════
   ASYMMETRIC BENTO MEMORY GRID — Galeri Redesign (Blue Amber)
   Two-column Bento pairs connected by a delicate, luminous silver chain
   ══════════════════════════════════════════════════════════════════ */
.chain-month-group {
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.bento-canvas-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  padding-top: 4px;
}

/* ── Top Hangers from Month Line down to Row 0 ── */
.bento-header-hangers {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(12px, 3.5vw, 18px);
  width: 100%;
  height: 22px;
  margin-bottom: -6px;
  position: relative;
  z-index: 5;
  pointer-events: none;
}

.bento-hanger {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.bento-hanger .bento-chain-segment {
  width: 10px;
  height: 24px;
}

/* ── Bento Row Block ── */
.bento-row-block {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
}

/* ── Two-Column Bento Grid Row ── */
.bento-grid-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(12px, 3.5vw, 18px);
  width: 100%;
  position: relative;
  align-items: start;
}

.bento-grid-row--solo {
  display: flex;
  justify-content: center;
}

.bento-grid-row--solo .bento-col {
  width: min(100%, 280px);
}

.bento-col {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* ── Bento Memory Card Frame ── */
.bento-card {
  position: relative;
  width: 100%;
  background: var(--dual-card-bg, #FFFDF9);
  border: 1.5px solid var(--dual-card-border, #1A1648);
  border-radius: 14px;
  padding: 4px;
  box-shadow: 0 4px 12px rgba(26, 22, 72, 0.14);
  cursor: pointer;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
  z-index: 2;
  display: flex;
  flex-direction: column;
}

.bento-card:hover {
  transform: translateY(-2px) scale(1.015);
  box-shadow: 0 8px 18px rgba(26, 22, 72, 0.20);
}

.bento-card:active {
  transform: translateY(1px) scale(0.99);
}

/* ── Controlled Bento Variations (Thumbnail Aspect Ratio) ── */
.bento-card--variation-a .chain-card-photo-wrap {
  aspect-ratio: 4 / 3;
}

.bento-card--variation-b .chain-card-photo-wrap {
  aspect-ratio: 16 / 10;
}

/* ── Card Inner Frame ── */
.chain-card-inner {
  border: 1px solid var(--dual-card-inner-border, rgba(26, 22, 72, 0.14));
  border-radius: 11px;
  padding: 5px 5px 8px 5px;
  background: var(--dual-card-bg, #FFFDF9);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: 100%;
}

/* ── Moment Thumbnail ── */
.chain-card-photo-wrap {
  width: 100%;
  border-radius: 7px;
  border: 1.2px solid var(--dual-card-photo-border, #1A1648);
  overflow: hidden;
  background: var(--dual-card-photo-bg, #EAE8FC);
  position: relative;
  transition: aspect-ratio 0.2s ease;
}

.chain-card-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.bento-card:hover .chain-card-photo {
  transform: scale(1.03);
}

.chain-card-photo-placeholder {
  width: 100%;
  height: 100%;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: #9A94B8;
  background: var(--dual-card-photo-bg, #EAE8FC);
}

/* ── Moment Info ── */
.chain-card-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 1px 1px 0;
}

.chain-card-title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.84rem;
  font-weight: 800;
  color: var(--dual-card-text, #1A1648);
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.chain-card-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 1px;
}

.chain-card-location {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--dual-card-muted, #5B5480);
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chain-card-location i {
  color: var(--dual-accent, #4E48AD);
  font-size: 0.64rem;
  flex-shrink: 0;
}

.chain-card-location span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chain-card-date {
  font-family: 'Inter', sans-serif;
  font-size: 0.64rem;
  font-weight: 600;
  color: var(--dual-card-muted, #7A7298);
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chain-card-date i {
  color: var(--dual-accent, #D97706);
  font-size: 0.64rem;
  flex-shrink: 0;
}

/* ── Bento Eyelets (Punched Holes Centered on Top and Bottom Borders) ── */
.bento-eyelet {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 4;
}

.bento-eyelet--top {
  top: -7px;
}

.bento-eyelet--bottom {
  bottom: -7px;
}

.bento-eyelet-hole {
  position: absolute;
  inset: 1px;
  border-radius: 50%;
  background: var(--dual-eyelet-hole, #201A42);
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.75);
}

.bento-eyelet-grommet {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.8px solid var(--dual-eyelet-grommet, #C8C4E0);
  box-shadow: 0 1px 2px rgba(255, 255, 255, 0.45);
}

/* ── Vertical Chains Row Connector (Straight Down Same Column) ── */
.bento-vertical-chains-connector {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(12px, 3.5vw, 18px);
  width: 100%;
  height: 44px;
  margin-top: -7px;
  margin-bottom: -7px;
  position: relative;
  z-index: 5;
  pointer-events: none;
}

.bento-chain-track {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
  height: 100%;
}

/* Vertical Silver Chain Segment using /src/assets/chain.png */
.bento-chain-segment {
  width: 10px;
  height: 100%;
  background-position: center top;
  background-repeat: repeat-y;
  background-size: 240px auto;
  filter: var(--dual-chain-filter, brightness(2.3) contrast(1.15) grayscale(1) drop-shadow(0 2px 4px rgba(10, 8, 30, 0.45)));
}

/* Upper and Lower Threading Lips on Vertical Chain Tracks */
.bento-chain-lip {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 7px;
  z-index: 6;
  pointer-events: none;
}

.bento-chain-lip--top {
  top: 0;
  border-top: 2px solid var(--dual-eyelet-grommet, #C8C4E0);
  border-left: 1.5px solid var(--dual-eyelet-grommet, #C8C4E0);
  border-right: 1.5px solid var(--dual-eyelet-grommet, #C8C4E0);
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
}

.bento-chain-lip--bottom {
  bottom: 0;
  border-bottom: 2px solid var(--dual-eyelet-grommet, #C8C4E0);
  border-left: 1.5px solid var(--dual-eyelet-grommet, #C8C4E0);
  border-right: 1.5px solid var(--dual-eyelet-grommet, #C8C4E0);
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
}

/* ── Trip list ───────────────────────────────────────────────────── */
.trips-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trip-row {
  display: flex;
  align-items: stretch;
  gap: 14px;
}

/* Timeline Column on the Left */
.trip-timeline-col {
  width: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex-shrink: 0;
  z-index: 2;
}

.trip-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3.5px solid #101010;
  margin-top: 18px; /* Vertically center dot with the first text line of card */
  flex-shrink: 0;
  box-shadow: 2px 2px 0 #101010;
}

/* ── Trip card ───────────────────────────────────────────────────── */
.trip-card {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: var(--theme-moment-layer1, #ffffff);
  border: 2px solid var(--theme-moment-layer2, #101010);
  box-shadow: 3px 3px 0 var(--theme-moment-layer2, #101010);
  padding: 14px 10px 14px 12px;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s, background-color 0.3s ease;
  -webkit-tap-highlight-color: transparent;
  position: relative;
}

/* Edit button inside trip card */
.btn-trip-edit {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fef08a; /* Yellow */
  border: 1.5px solid #101010;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #854d0e;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.2s, transform 0.2s;
  z-index: 2;
  box-shadow: 2px 2px 0 #101010;
}
.trip-card:hover .btn-trip-edit,
.trip-card:focus-within .btn-trip-edit {
  opacity: 1;
  transform: scale(1);
}
.btn-trip-edit:hover {
  background: #fde047;
  transform: scale(1) translate(-1px, -1px) !important;
  box-shadow: 3px 3px 0 #101010;
}

.trip-card:hover,
.trip-card:focus {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 var(--theme-moment-layer2, #101010);
  background: var(--theme-card-hover-bg);
  outline: none;
}

.trip-card:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 var(--theme-moment-layer2, #101010);
}


/* Body */
.trip-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trip-meta { display: flex; flex-direction: column; gap: 5px; }

.trip-title {
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--theme-text, #101010);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trip-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.trip-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--theme-tag-text);
  background: var(--theme-tag-bg);
  padding: 2px 8px;
  border-radius: 20px;
  transition: background 0.3s ease;
}

.trip-tag i { font-size: 0.65rem; color: var(--theme-accent, #6f6bd8); }
.trip-tag--muted { color: var(--theme-text-muted, #9ca3af); }
.trip-tag--author { background: var(--theme-accent-soft, #f0f0ff); color: var(--theme-accent, #6f6bd8); }
.trip-tag--author i { color: var(--theme-accent, #6f6bd8); }

/* Thumbnail strip */
.thumb-strip {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 2px;
}
.thumb-strip::-webkit-scrollbar { display: none; }

.thumb {
  width: 68px;
  height: 68px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1.5px solid var(--theme-border-light, #e5e7eb);
  background: var(--theme-surface-2, #f1f5f9);
  transition: background 0.3s ease;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb--more {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--theme-accent, #6f6bd8);
  background: var(--theme-accent-soft, #f4f3ff);
  border-color: var(--theme-accent, #6f6bd8);
}

.thumb-empty {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: var(--theme-text-muted, #9ca3af);
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Chevron */
.trip-chevron {
  flex-shrink: 0;
  color: var(--theme-text-muted, #d1d5db);
  font-size: 0.8rem;
  padding-top: 3px;
  transition: color 0.15s, transform 0.15s;
}
.trip-card:hover .trip-chevron,
.trip-card:focus .trip-chevron { color: #6f6bd8; transform: translateX(2px); }

/* ── Empty state ─────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 60px 24px;
  margin: 0 16px;
  border: 2px dashed var(--theme-empty-border);
  background: var(--theme-surface-2);
  border-radius: 16px;
}

.empty-icon {
  font-size: 2.6rem;
  color: var(--theme-text-muted, #d1d5db);
  margin-bottom: 16px;
}

.empty-state h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--theme-text, #374151);
  margin: 0 0 8px;
  line-height: 1.3;
}

.empty-state p {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: var(--theme-text-muted, #9ca3af);
  margin: 0 0 20px;
}

.btn-add-empty {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--theme-accent, #6f6bd8);
  color: var(--theme-bg, #ffffff);
  border: 2px solid #101010;
  padding: 10px 20px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 3px 3px 0 #101010;
  transition: transform 0.1s;
}
.btn-add-empty:hover { transform: translate(-2px,-2px); }

/* ── Card Detail FAB Speed Dial ─────────────────────────────────── */

/* ── Detail FAB Section (dedicated sticky footer strip) ─────── */
.detail-fab-section {
  flex-shrink: 0;
  border-top: 2px dashed var(--theme-modal-border, #cbd5e1);
  background: var(--theme-modal-bg, #ffffff);
  padding: 10px 20px 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative; /* anchor for sub-actions absolute popup */
  z-index: 30;
}

/* Anchor row — just wraps the FAB + its floating sub-actions */
.detail-fab-row {
  position: relative;
  display: flex;
  align-items: center;
}

/* Sub-actions float ABOVE the FAB anchor, section height unaffected */
.card-fab-actions {
  position: absolute;
  bottom: calc(100% + 10px); /* float above the FAB button */
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  z-index: 35;
}

/* Each action row: label + circle */
.card-fab-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  outline: none;
}

/* FAB label pill */
.card-fab-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #1e293b;
  background: #ffffff;
  padding: 6px 14px;
  border-radius: 20px;
  border: none;
  white-space: nowrap;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
  letter-spacing: 0.2px;
  user-select: none;
  transition: transform 0.1s, box-shadow 0.1s;
}
.card-fab-item:hover .card-fab-label {
  transform: scale(1.03);
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.16);
}
.card-fab-item:active .card-fab-label {
  transform: scale(0.97);
}

/* FAB circle icon button — 1x size (40px) */
.card-fab-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  border: none;
  flex-shrink: 0;
  transition: transform 0.12s, box-shadow 0.12s;
}
.card-fab-item:active .card-fab-circle {
  transform: scale(0.94);
}

/* Edit circle — pure yellow */
.edit-circle {
  background: #fef08a;
  color: #78350f;
  box-shadow: 0 4px 12px rgba(234, 179, 8, 0.35);
}

/* Caption circle — pure sky blue */
.caption-circle {
  background: #38bdf8;
  color: #0c4a6e;
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.35);
}

/* Main FAB trigger button — 1x size (48px) */
.card-fab-main {
  width: 60px;
  height: 60px;
  font-size: 1.15rem;
  border-radius: 50%;
  background: #6f6bd8;
  border: none;
  box-shadow: 0 5px 16px rgba(111, 107, 216, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.15s,
              background 0.2s;
  position: relative;
  z-index: 31;
  overflow: hidden;
  flex-shrink: 0;
}

.card-fab-main:active {
  transform: scale(0.94);
  box-shadow: 0 3px 10px rgba(111, 107, 216, 0.3);
}

/* Icon swap animation */
.fab-icon-pen,
.fab-icon-x {
  position: absolute;
  transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fab-icon-pen {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}
.fab-icon-x {
  opacity: 0;
  transform: scale(0) rotate(-90deg);
}

.card-fab-main.is-active {
  background: #f43f5e;
  box-shadow: 0 5px 16px rgba(244, 63, 94, 0.4);
}

.card-fab-main.is-active .fab-icon-pen {
  opacity: 0;
  transform: scale(0) rotate(90deg);
}
.card-fab-main.is-active .fab-icon-x {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

/* FAB sub-action transitions */
.card-fab-sub-enter-active {
  transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.card-fab-sub-leave-active {
  transition: all 0.15s ease-in;
}
.card-fab-sub-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.88);
}
.card-fab-sub-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.92);
}

/* ── Slide transitions ───────────────────────────────────────────── */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.slide-left-enter-from  { opacity: 0; transform: translateX(30px); }
.slide-left-leave-to    { opacity: 0; transform: translateX(-30px); }
.slide-right-enter-from { opacity: 0; transform: translateX(-30px); }
.slide-right-leave-to   { opacity: 0; transform: translateX(30px); }

/* ── Fade transition ─────────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Detail Modal ────────────────────────────────────────────────── */
.detail-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 700;
  display: flex;
  justify-content: center;
  align-items: center; /* Center the modal vertically and horizontally */
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
  max-height: 85vh; /* Fixed max height for the modal */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevent the modal itself from scrolling */
  box-sizing: border-box;
  position: relative; /* Keep FAB inside the card bounds */
}

.detail-fixed-top {
  padding: 20px 20px 0 20px;
  flex-shrink: 0;
}

.detail-gallery-scroll {
  padding: 0 20px 20px 20px;
  flex-grow: 1;
  overflow-y: auto;
}

.detail-header { position: relative; margin-bottom: 20px; }

.detail-header-actions {
  position: absolute;
  top: -10px;
  right: -10px;
  display: flex;
  gap: 8px;
}

.neo-btn {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 0.8rem;
  border: 2px solid #101010;
  box-shadow: 2px 2px 0 #101010;
  cursor: pointer;
  transition: all 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.neo-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0 0 0 #101010;
}

.edit-btn {
  background: #fef08a; /* yellow */
  color: #101010;
  padding: 6px 14px;
  border-radius: 6px;
}
.close-btn {
  background: #f43f5e; /* red */
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-size: 1rem;
}

.detail-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.8rem;
  color: var(--theme-text, #101010);
  margin: 0 0 12px;
  font-weight: 800;
  padding-right: 80px; /* space for absolute buttons */
}

.detail-subtitle-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
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
  background: var(--theme-modal-bg, #ffffff);
  color: var(--theme-text, #101010);
}

.map-pill {
  background: var(--theme-accent-soft, #e0e7ff); /* soft indigo */
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
.map-chevron {
  transition: transform 0.2s ease;
}

.date-pill {
  background: var(--theme-surface-2, #f3f4f6);
}

.detail-map-container {
  margin-bottom: 20px;
}
.neo-iframe {
  border: 2px solid #101010 !important;
  box-shadow: 4px 4px 0 #101010;
  border-radius: 12px;
}

.gallery-grid-neo {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 600px) {
  .gallery-grid-neo {
    grid-template-columns: repeat(3, 1fr); /* 3x3 layout max 9 photos */
    gap: 20px;
  }
}

.gallery-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--theme-text-muted, #9ca3af);
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.gallery-empty i {
  font-size: 2.5rem;
  color: var(--theme-text-muted, #d1d5db);
}

.gallery-card-wrap {
  position: relative;
  touch-action: pan-y; /* let vertical scroll still work except when swiping */
  user-select: none;
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.gallery-card-wrap.is-dragging {
  opacity: 0.55;
  transform: scale(0.96);
}

.drag-hint {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 26px;
  height: 26px;
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(4px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #6f6bd8;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.gallery-card-wrap:active .drag-hint,
.gallery-card-wrap.is-dragging .drag-hint {
  opacity: 1;
}

:global(html.modal-open),
:global(html.modal-open body) {
  overflow: hidden !important;
  height: 100vh !important;
}

@media (max-width: 480px) {
  .page-header {
    margin: 0;
    padding: 12px 16px 8px;
  }
}
</style>
