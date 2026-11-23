<template>
  <header class="app-main-header select-none">
    <!-- ── 1. Contextual Greeting & Companion Presence Row ───────── -->
    <div class="header-top-row">
      <!-- Left: Contextual Greeting -->
      <div class="greeting-col">
        <div class="ambient-pill">
          <span class="ambient-ping-dot"></span>
          <i :class="timePeriod.icon" class="ambient-icon"></i>
          <span class="ambient-label">{{ timePeriod.label }}</span>
        </div>

        <h1 class="greeting-title">
          Halo, {{ userAlias || 'User' }}
          <template v-if="activeCompanionName">
            &amp; {{ activeCompanionName }}
          </template>
          <i class="fa-solid fa-wand-magic-sparkles spark-icon"></i>
        </h1>

        <p class="greeting-subtitle">
          {{ timePeriod.subtitle }}
        </p>
      </div>

      <!-- Right: Companion Presence Avatar Badge + Dropdown -->
      <div class="companion-wrapper" ref="dropdownRef">
        <button
          type="button"
          class="companion-badge-btn"
          :class="{ 'is-active': isDropdownOpen, 'is-guest': !isOwner }"
          @click="toggleDropdown"
          :title="isOwner ? 'Atur Companion / Partner' : 'Akses terbatas: Hanya pemilik sesi utama yang dapat memilih companion'"
          aria-haspopup="true"
          :aria-expanded="isDropdownOpen"
        >
          <div class="companion-avatar-frame">
            <span class="companion-initial">{{ companionInitial }}</span>
            <span class="presence-pulse-dot" :class="isCompanionActive ? 'dot--online' : 'dot--idle'"></span>
          </div>

          <div class="companion-text-block">
            <div class="companion-name-line">
              <span class="companion-name-text">{{ activeCompanionName || (isOwner ? 'Pilih Partner' : 'Tanpa Partner') }}</span>
              <i v-if="isOwner" class="fa-solid fa-chevron-down chevron-indicator" :class="{ 'rotate-180': isDropdownOpen }"></i>
              <i v-else class="fa-solid fa-lock lock-indicator" title="Terkunci: Khusus Pemilik Sesi"></i>
            </div>
            <span class="companion-sync-label">
              <i class="fa-solid fa-circle-check sync-icon"></i>
              <span>{{ activeCompanionName ? 'Sinkron' : (isOwner ? 'Atur Partner' : 'Tamu') }}</span>
            </span>
          </div>
        </button>

        <!-- Dropdown Menu -->
        <transition name="dropdown-anim">
          <div v-if="isDropdownOpen" class="companion-dropdown-card" @click.stop>
            <!-- Mode Pemilik Sesi (Owner): Boleh Memilih / Mengubah Companion (Maks 1) -->
            <div v-if="isOwner" class="dropdown-inner">
              <div class="dropdown-header">
                <div class="dropdown-header-title">
                  <i class="fa-solid fa-users-viewfinder title-icon"></i>
                  <span>Pilih Companion</span>
                </div>
                <span class="max-badge">Maks 1</span>
              </div>
              <p class="dropdown-desc">
                Pilih satu partner untuk ditampilkan berdampingan di header dan timeline utama.
              </p>

              <!-- Candidate Options List -->
              <div class="candidate-list">
                <button
                  v-for="cand in candidateList"
                  :key="cand.name"
                  type="button"
                  class="candidate-item"
                  :class="{ 'is-selected': selectedCompanion === cand.name }"
                  @click="selectCompanion(cand.name)"
                >
                  <div class="cand-avatar">
                    <span>{{ cand.name.charAt(0).toUpperCase() }}</span>
                    <i v-if="selectedCompanion === cand.name" class="fa-solid fa-circle-check cand-check"></i>
                  </div>
                  <div class="cand-meta">
                    <span class="cand-name">{{ cand.name }}</span>
                    <span class="cand-role">{{ cand.role }}</span>
                  </div>
                  <div class="cand-radio">
                    <i v-if="selectedCompanion === cand.name" class="fa-solid fa-circle-dot radio-active"></i>
                    <i v-else class="fa-regular fa-circle radio-inactive"></i>
                  </div>
                </button>

                <div v-if="candidateList.length === 0" class="empty-candidate-box">
                  <i class="fa-solid fa-user-group empty-icon"></i>
                  <p class="empty-text">Belum ada partner atau kolaborator lain yang bergabung di timeline ini.</p>
                </div>
              </div>

              <!-- Reset / Deselect Button -->
              <div v-if="selectedCompanion" class="dropdown-footer">
                <button
                  type="button"
                  class="clear-btn"
                  @click="clearCompanion"
                >
                  <i class="fa-solid fa-user-xmark"></i>
                  <span>Hapus / Tanpa Partner</span>
                </button>
              </div>
            </div>

            <!-- Mode Tamu / Joiner (Non-Owner): Read-only & Terkunci -->
            <div v-else class="dropdown-inner locked-inner">
              <div class="locked-header">
                <div class="locked-title-row">
                  <i class="fa-solid fa-shield-halved locked-icon"></i>
                  <span class="locked-title">Akses Khusus Pemilik Sesi</span>
                </div>
                <span class="locked-tag">Read Only</span>
              </div>
              <p class="locked-desc">
                Menu pemilihan companion hanya dapat diatur oleh <strong>pemegang sesi momen utama</strong>.
                Sebagai kolaborator yang bergabung (join timeline), Anda tidak memiliki izin untuk mengubah partner terpilih.
              </p>
              <div class="locked-current-pill">
                <span class="pill-label">Companion Terpilih:</span>
                <span class="pill-val">
                  <i class="fa-solid fa-user"></i>
                  {{ activeCompanionName || 'Belum Ditentukan' }}
                </span>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- ── 2. Vintage Travelogue Ticket Pass (Micro-Insight Elemen B) ── -->
    <div class="ticket-pass-wrapper">
      <div class="ticket-pass-card">
        <!-- Punch Notches Left & Right -->
        <div class="ticket-notch notch--left" aria-hidden="true"></div>
        <div class="ticket-notch notch--right" aria-hidden="true"></div>

        <!-- Ticket Top Strip -->
        <div class="ticket-top-strip">
          <div class="strip-left">
            <span class="ticket-status-dot"></span>
            <span class="strip-title">WHOOSH MEMORY PASS</span>
          </div>
          <span class="strip-serial">NO. {{ ticketNumber }}</span>
        </div>

        <!-- Ticket Main Body: 3 Insight Columns -->
        <div class="ticket-body">
          <div class="ticket-metrics-grid">
            <!-- Metric 1: Momen / Shots -->
            <div class="ticket-col">
              <div class="col-kicker">
                <i class="fa-solid fa-camera-retro kicker-icon" aria-hidden="true"></i>
                <span>CAPSULE</span>
              </div>
              <div class="col-value-row">
                <span class="col-number">{{ totalMoments }}</span>
                <span class="col-unit unit--indigo">SHOTS</span>
              </div>
              <div class="col-subtext">Terarsip Rapi</div>
            </div>

            <!-- Metric 2: Kota / Cities -->
            <div class="ticket-col col-bordered">
              <div class="col-kicker">
                <i class="fa-solid fa-map-location-dot kicker-icon" aria-hidden="true"></i>
                <span>EXPLORED</span>
              </div>
              <div class="col-value-row">
                <span class="col-number">{{ formattedCities }}</span>
                <span class="col-unit unit--amber">CITIES</span>
              </div>
              <div class="col-subtext" :title="cityPreviewCodes">{{ cityPreviewCodes }}</div>
            </div>

            <!-- Metric 3: Hari Bareng / Days -->
            <div class="ticket-col col-bordered">
              <div class="col-kicker">
                <i class="fa-solid fa-route kicker-icon" aria-hidden="true"></i>
                <span>JOURNEY</span>
              </div>
              <div class="col-value-row">
                <span class="col-number">{{ daysTogether }}</span>
                <span class="col-unit unit--rose">DAYS</span>
              </div>
              <div class="col-subtext" :title="journeyCompanionText">{{ journeyCompanionText }}</div>
            </div>
          </div>

          <!-- Ticket Bottom Perforated Line & Barcode -->
          <div class="ticket-footer-strip">
            <div class="ticket-barcode" aria-hidden="true">
              <span class="bar bar-w2"></span>
              <span class="bar bar-w1"></span>
              <span class="bar bar-w3"></span>
              <span class="bar bar-w1"></span>
              <span class="bar bar-w2"></span>
              <span class="bar bar-w4"></span>
              <span class="bar bar-w1"></span>
              <span class="bar bar-w2"></span>
              <span class="bar bar-w3"></span>
              <span class="bar bar-w1"></span>
              <span class="bar bar-w2"></span>
              <span class="bar bar-w3"></span>
              <span class="bar bar-w1"></span>
              <span class="bar bar-w2"></span>
            </div>
            <div class="ticket-action-note">
              <i class="fa-solid fa-passport note-icon" aria-hidden="true"></i>
              <span>Koleksi Paspor Bersama</span>
              <i class="fa-solid fa-arrow-right arrow-icon" aria-hidden="true"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 3. Story Banner Carousel (Grup 1 Layout + Old Content) ── -->
    <div
      class="banner-carousel-container"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
      @mouseenter="pauseTimer"
      @mouseleave="resumeTimer"
    >
      <div
        class="banner-track"
        :style="{ transform: `translateX(-${activeIndex * 100}%)` }"
      >
        <!-- Slide 1: Hits Different (Gaskeun) -->
        <div class="banner-slide slide--blue">
          <!-- Background Abstract Neo-Brutalist Shapes -->
          <div class="abstract-shape shape-ring" aria-hidden="true"></div>
          <div class="abstract-shape shape-diamond" aria-hidden="true"></div>

          <div class="slide-body">
            <!-- Left Info Area -->
            <div class="slide-info">
              <div class="badge-row">
                <span class="neo-badge badge--dark">GASKEUN</span>
                <span class="neo-badge badge--outline">ICONIC</span>
              </div>
              <h2 class="slide-title">
                HITS<br />
                <span class="slide-title-accent text-accent-blue">DIFFERENT</span>
              </h2>
              <p class="slide-desc">
                moment-mu is iconic &amp; siap lo kenang lagi
              </p>
            </div>

            <!-- Right Character Cutout Area -->
            <div class="slide-illustration">
              <div class="char-frame frame--blue">
                <img
                  src="../../assets/anime-banner.png"
                  alt="Character Anime 1"
                  class="char-img char-img-1"
                />
              </div>
              <span class="stamp-badge">
                <i class="fa-solid fa-star stamp-icon"></i>
                TOP #1
              </span>
            </div>
          </div>
        </div>

        <!-- Slide 2: Hidup Lo Hits Banget (Literally) -->
        <div class="banner-slide slide--amber">
          <!-- Background Abstract Neo-Brutalist Shapes -->
          <div class="abstract-shape shape-ring" aria-hidden="true"></div>
          <div class="abstract-shape shape-diamond" aria-hidden="true"></div>

          <div class="slide-body">
            <!-- Left Info Area -->
            <div class="slide-info">
              <div class="badge-row">
                <span class="neo-badge badge--dark">LITERALLY</span>
                <span class="neo-badge badge--white">HITS</span>
              </div>
              <h2 class="slide-title">
                HIDUP LO<br />
                <span class="slide-title-accent text-accent-amber">HITS BANGET</span>
              </h2>
              <p class="slide-desc">
                literally perjalanan hidup lo penuh warna
              </p>
            </div>

            <!-- Right Character Cutout Area -->
            <div class="slide-illustration">
              <div class="char-frame frame--amber">
                <img
                  src="../../assets/anime-banner-1.png"
                  alt="Character Anime 2"
                  class="char-img char-img-2"
                />
              </div>
              <span class="stamp-badge stamp--amber">
                <i class="fa-solid fa-heart stamp-icon"></i>
                FAVORIT
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Carousel Dot Indicators -->
      <div class="carousel-indicators">
        <button
          type="button"
          class="dot-btn"
          :class="{ 'is-active': activeIndex === 0 }"
          @click="goToSlide(0)"
          aria-label="Slide 1"
        ></button>
        <button
          type="button"
          class="dot-btn"
          :class="{ 'is-active': activeIndex === 1 }"
          @click="goToSlide(1)"
          aria-label="Slide 2"
        ></button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { TimelineData } from '../../data/timeline';
import { useRuangKita } from '../../data/ruangKitaStore';

interface Props {
  userAlias?: string;
  items?: TimelineData[];
  collaborators?: string[];
  isOwner?: boolean;
  companion?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  userAlias: '',
  items: () => [],
  collaborators: () => [],
  isOwner: true,
  companion: null,
});

const emit = defineEmits<{
  'update:companion': [companion: string | null];
}>();

// ── Dropdown & Companion Selection Logic ──────────────────────────────
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const selectedCompanion = ref<string | null>(props.companion ?? null);

watch(() => props.companion, (newVal) => {
  selectedCompanion.value = newVal ?? null;
});

interface Candidate {
  name: string;
  role: string;
  isCollaborator: boolean;
}

const candidateList = computed<Candidate[]>(() => {
  const result: Candidate[] = [];
  const added = new Set<string>();

  // 1. From collaborators (passed from App.vue)
  if (props.collaborators && props.collaborators.length > 0) {
    props.collaborators.forEach((collab) => {
      const name = collab?.trim();
      if (
        name &&
        name.toLowerCase() !== props.userAlias?.trim().toLowerCase() &&
        !added.has(name.toLowerCase())
      ) {
        added.add(name.toLowerCase());
        result.push({
          name,
          role: 'Kolaborator Sesi',
          isCollaborator: true,
        });
      }
    });
  }

  // 2. From Ruang Kita partner profile
  try {
    const { data: rkData } = useRuangKita();
    const partnerBName = rkData.value?.partnerB?.name?.trim();
    if (
      partnerBName &&
      partnerBName.toLowerCase() !== props.userAlias?.trim().toLowerCase() &&
      !added.has(partnerBName.toLowerCase())
    ) {
      added.add(partnerBName.toLowerCase());
      result.push({
        name: partnerBName,
        role: 'Pasangan (Ruang Kita)',
        isCollaborator: false,
      });
    }

    const partnerAName = rkData.value?.partnerA?.name?.trim();
    if (
      partnerAName &&
      partnerAName.toLowerCase() !== props.userAlias?.trim().toLowerCase() &&
      !added.has(partnerAName.toLowerCase())
    ) {
      added.add(partnerAName.toLowerCase());
      result.push({
        name: partnerAName,
        role: 'Partner A (Ruang Kita)',
        isCollaborator: false,
      });
    }
  } catch (e) {
    // Ruang kita store fallback
  }

  return result;
});

const activeCompanionName = computed<string | null>(() => {
  if (selectedCompanion.value) return selectedCompanion.value;
  // If not explicitly selected, but candidates exist, pick first as default preview
  if (candidateList.value.length > 0) {
    return candidateList.value[0].name;
  }
  return null;
});

const isCompanionActive = computed(() => Boolean(activeCompanionName.value));

const companionInitial = computed(() => {
  if (activeCompanionName.value) {
    return activeCompanionName.value.charAt(0).toUpperCase();
  }
  return '?';
});

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

function selectCompanion(name: string) {
  // Hanya pemegang sesi utama yang dapat memilih / mengubah companion!
  if (!props.isOwner) return;

  if (selectedCompanion.value === name) {
    selectedCompanion.value = null;
  } else {
    // Maksimal 1 yang dipilih
    selectedCompanion.value = name;
  }
  emit('update:companion', selectedCompanion.value);
  isDropdownOpen.value = false;
}

function clearCompanion() {
  if (!props.isOwner) return;
  selectedCompanion.value = null;
  emit('update:companion', null);
  isDropdownOpen.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false;
  }
}

// ── Contextual Time & Greeting Logic ──────────────────────────────────
interface TimeGreeting {
  label: string;
  icon: string;
  subtitle: string;
}

const timePeriod = computed<TimeGreeting>(() => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) {
    return {
      label: 'Pagi Segar',
      icon: 'fa-solid fa-sun text-amber-500',
      subtitle: 'Momen mana yang mau lo tengok pagi ini?',
    };
  } else if (hour >= 11 && hour < 15) {
    return {
      label: 'Siang Semangat',
      icon: 'fa-solid fa-cloud-sun text-amber-500',
      subtitle: 'Momen mana yang mau lo tengok siang ini?',
    };
  } else if (hour >= 15 && hour < 18) {
    return {
      label: 'Sore Santai',
      icon: 'fa-solid fa-cloud-sun text-amber-500',
      subtitle: 'Momen mana yang mau lo tengok sore ini?',
    };
  } else {
    return {
      label: 'Malam Syahdu',
      icon: 'fa-solid fa-moon text-indigo-400',
      subtitle: 'Momen mana yang mau lo tengok malam ini?',
    };
  }
});

// ── Micro-Insights (Total Momen, Total Kota, Hari Bareng) ─────────────
const totalMoments = computed(() => {
  if (!props.items || props.items.length === 0) return 0;
  return props.items.reduce((sum, item) => sum + (item.moments?.length || 1), 0);
});

const totalCities = computed(() => {
  if (!props.items || props.items.length === 0) return 0;
  const uniqueCities = new Set<string>();
  props.items.forEach((item) => {
    if (item.location) {
      const city = item.location.split(',')[0].trim().toLowerCase();
      if (city) uniqueCities.add(city);
    }
  });
  return uniqueCities.size || (props.items.length > 0 ? 1 : 0);
});

const daysTogether = computed(() => {
  let earliestMs: number | null = null;

  // Check timeline items
  if (props.items && props.items.length > 0) {
    props.items.forEach((item) => {
      if (item.year) {
        const d = new Date(item.year, 0, 1).getTime();
        if (!earliestMs || d < earliestMs) earliestMs = d;
      }
    });
  }

  // Check Ruang Kita anniversary date
  try {
    const { data: rkData } = useRuangKita();
    if (rkData.value?.anniversaryDate) {
      const anniv = new Date(rkData.value.anniversaryDate).getTime();
      if (!isNaN(anniv) && (!earliestMs || anniv < earliestMs)) {
        earliestMs = anniv;
      }
    }
  } catch (e) {
    // fallback
  }

  if (earliestMs) {
    const diff = Math.max(0, Date.now() - earliestMs);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return Math.max(1, days);
  }
  return 1;
});

// ── Vintage Travelogue Ticket Pass Computeds ──────────────────────────
const ticketNumber = computed(() => {
  const year = new Date().getFullYear();
  const u = (props.userAlias?.trim().charAt(0) || 'U').toUpperCase();
  const c = (activeCompanionName.value?.trim().charAt(0) || 'S').toUpperCase();
  return `WM-${year}-${u}${c}`;
});

const formattedCities = computed(() => {
  return String(totalCities.value).padStart(2, '0');
});

const cityPreviewCodes = computed(() => {
  if (!props.items || props.items.length === 0) return 'EXPLORE';
  const uniqueCities: string[] = [];
  props.items.forEach((item) => {
    if (item.location) {
      const city = item.location.split(',')[0].trim();
      if (city && !uniqueCities.some((c) => c.toLowerCase() === city.toLowerCase())) {
        uniqueCities.push(city);
      }
    }
  });
  if (uniqueCities.length === 0) return 'INDONESIA';
  return uniqueCities
    .slice(0, 3)
    .map((c) => (c.length <= 4 ? c.toUpperCase() : c.substring(0, 3).toUpperCase()))
    .join(' • ');
});

const journeyCompanionText = computed(() => {
  const u = props.userAlias?.trim() || 'User';
  if (activeCompanionName.value) {
    return `${u} & ${activeCompanionName.value}`;
  }
  return `${u} Timeline`;
});

// ── Carousel Swiping & Auto-Timer ─────────────────────────────────────
const activeIndex = ref(0);
let autoTimer: ReturnType<typeof setInterval> | null = null;

function nextSlide() {
  activeIndex.value = (activeIndex.value + 1) % 2;
}

function prevSlide() {
  activeIndex.value = (activeIndex.value - 1 + 2) % 2;
}

function goToSlide(idx: number) {
  activeIndex.value = idx;
  resetTimer();
}

function pauseTimer() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
}

function resumeTimer() {
  resetTimer();
}

function resetTimer() {
  pauseTimer();
  autoTimer = setInterval(nextSlide, 4500);
}

// Touch swipe gestures
let touchStartX = 0;
function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX;
}
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) {
    if (dx < 0) nextSlide();
    else prevSlide();
    resetTimer();
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
  resetTimer();
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
  pauseTimer();
});
</script>

<style scoped>
.app-main-header {
  padding: 24px 20px 20px;
  background: var(--theme-canvas-bg, var(--bg-color, #ffffff));
  width: 100%;
  box-sizing: border-box;
}

/* ── 1. Header Top Row ─────────────────────────────────────────────── */
.header-top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.greeting-col {
  flex: 1;
  min-width: 0;
}

.ambient-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 9999px;
  background: #eae8fc;
  border: 1.5px solid #252525;
  color: #4b44b8;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  box-shadow: 1.5px 1.5px 0 #252525;
}

.ambient-ping-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #756ce0;
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.ambient-icon {
  font-size: 11px;
}

.ambient-label {
  line-height: 1;
}

.greeting-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.65rem;
  font-weight: 900;
  color: #1a1648;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
  line-height: 1.15;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.spark-icon {
  font-size: 1.1rem;
  color: #f59e0b;
}

.greeting-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #6b6484;
  margin: 0;
  font-weight: 600;
  line-height: 1.3;
}

/* ── Companion Badge & Dropdown ────────────────────────────────────── */
.companion-wrapper {
  position: relative;
  flex-shrink: 0;
}

.companion-badge-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px 5px 6px;
  background: #ffffff;
  border: 2px solid #252525;
  border-radius: 9999px;
  box-shadow: 2.5px 2.5px 0 #252525;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  user-select: none;
}

.companion-badge-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3.5px 3.5px 0 #252525;
}

.companion-badge-btn:active,
.companion-badge-btn.is-active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 #252525;
}

.companion-badge-btn.is-guest {
  background: #fbfbfd;
}

.companion-avatar-frame {
  position: relative;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1.5px solid #252525;
  background: #e9c46a;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.companion-initial {
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 900;
  color: #1a1648;
}

.presence-pulse-dot {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #ffffff;
}

.dot--online {
  background: #10b981;
}

.dot--idle {
  background: #94a3b8;
}

.companion-text-block {
  text-align: left;
}

.companion-name-line {
  display: flex;
  align-items: center;
  gap: 5px;
}

.companion-name-text {
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  color: #1a1648;
  max-width: 90px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron-indicator {
  font-size: 9px;
  color: #4b44b8;
  transition: transform 0.2s ease;
}

.lock-indicator {
  font-size: 9px;
  color: #94a3b8;
}

.companion-sync-label {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-weight: 800;
  color: #756ce0;
  line-height: 1;
}

.sync-icon {
  font-size: 8px;
  color: #10b981;
}

/* Dropdown Card */
.companion-dropdown-card {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: #ffffff;
  border: 2px solid #252525;
  border-radius: 14px;
  box-shadow: 4px 4px 0 #252525;
  z-index: 100;
  overflow: hidden;
}

.dropdown-inner {
  padding: 14px;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.dropdown-header-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 900;
  color: #1a1648;
}

.title-icon {
  font-size: 12px;
  color: #756ce0;
}

.max-badge {
  font-size: 9px;
  font-weight: 800;
  background: #eae8fc;
  color: #4b44b8;
  border: 1px solid #756ce0;
  padding: 1px 6px;
  border-radius: 6px;
}

.dropdown-desc {
  font-size: 11px;
  color: #6b6484;
  line-height: 1.35;
  margin: 0 0 12px 0;
}

.candidate-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
}

.candidate-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  background: #fbfbfd;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.candidate-item:hover {
  background: #f4f3fd;
  border-color: #756ce0;
}

.candidate-item.is-selected {
  background: #eff6ff;
  border-color: #252525;
  box-shadow: 2px 2px 0 #252525;
}

.cand-avatar {
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e9c46a;
  border: 1.5px solid #252525;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 900;
  color: #1a1648;
  flex-shrink: 0;
}

.cand-check {
  position: absolute;
  bottom: -2px;
  right: -2px;
  font-size: 9px;
  color: #10b981;
  background: #ffffff;
  border-radius: 50%;
}

.cand-meta {
  flex: 1;
  min-width: 0;
}

.cand-name {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 800;
  color: #1a1648;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cand-role {
  display: block;
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
}

.cand-radio {
  font-size: 14px;
}

.radio-active {
  color: #756ce0;
}

.radio-inactive {
  color: #cbd5e1;
}

.empty-candidate-box {
  padding: 16px 10px;
  text-align: center;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
}

.empty-icon {
  font-size: 18px;
  color: #94a3b8;
  margin-bottom: 6px;
}

.empty-text {
  font-size: 11px;
  color: #64748b;
  margin: 0;
}

.dropdown-footer {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #e2e8f0;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 6px 10px;
  background: #fff1f2;
  border: 1.5px solid #fecdd3;
  border-radius: 8px;
  color: #e11d48;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
}

.clear-btn:hover {
  background: #ffe4e6;
  border-color: #fda4af;
}

/* Locked / Non-Owner View */
.locked-inner {
  background: #fafaf9;
}

.locked-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.locked-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.locked-icon {
  color: #f59e0b;
  font-size: 13px;
}

.locked-title {
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 900;
  color: #1c1917;
}

.locked-tag {
  font-size: 9px;
  font-weight: 800;
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  padding: 1px 6px;
  border-radius: 6px;
  text-transform: uppercase;
}

.locked-desc {
  font-size: 11px;
  color: #57534e;
  line-height: 1.4;
  margin: 0 0 10px 0;
}

.locked-current-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: #ffffff;
  border: 1.5px solid #252525;
  border-radius: 8px;
  box-shadow: 1.5px 1.5px 0 #252525;
}

.pill-label {
  font-size: 10px;
  font-weight: 700;
  color: #78716c;
}

.pill-val {
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 900;
  color: #1c1917;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dropdown-anim-enter-active,
.dropdown-anim-leave-active {
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-anim-enter-from,
.dropdown-anim-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

/* ── 2. Vintage Travelogue Ticket Pass (Micro-Insight Elemen B) ────── */
.ticket-pass-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 20px;
}

.ticket-pass-card {
  position: relative;
  width: 100%;
  background: #ffffff;
  border-radius: 14px;
  /* Clean, authentic vintage ticket border — NOT fancy or glowing */
  border: 1px solid #dcd7eb;
  box-shadow: 0 2px 6px rgba(26, 22, 72, 0.04), 0 1px 2px rgba(26, 22, 72, 0.02);
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

/* Subtle vintage stationery dot texture watermark */
.ticket-pass-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(117, 108, 224, 0.15) 0.75px, transparent 0.75px);
  background-size: 14px 14px;
  pointer-events: none;
  opacity: 0.35;
  z-index: 0;
}

.ticket-pass-card:hover {
  border-color: #b8b0db;
  box-shadow: 0 4px 10px rgba(26, 22, 72, 0.06);
}

/* Punch Notches Left & Right (Smooth ticket stub punch hole) */
.ticket-notch {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--dual-canvas-upper, var(--theme-canvas-bg, var(--bg-color, #f7f3ec)));
  z-index: 5;
  pointer-events: none;
  transition: background-color 0.3s ease;
}

.notch--left {
  left: -9px;
  border-right: 1px solid #dcd7eb;
}

.notch--right {
  right: -9px;
  border-left: 1px solid #dcd7eb;
}

/* Ticket Top Strip (Clean vintage boarding pass header, not fancy gradient) */
.ticket-top-strip {
  position: relative;
  z-index: 1;
  background: #f7f6fc;
  padding: 7px 16px;
  border-bottom: 1px solid #eae6f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.strip-left {
  display: flex;
  align-items: center;
  gap: 7px;
}

.ticket-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #756ce0;
}

.strip-title {
  font-family: 'Outfit', sans-serif;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #4b44b8;
}

.strip-serial {
  font-family: 'Space Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: #64748b;
  background: #ede9f8;
  padding: 1.5px 6px;
  border-radius: 4px;
}

/* Ticket Body & 3 Columns */
.ticket-body {
  position: relative;
  z-index: 1;
  padding: 12px 16px 10px 16px;
}

.ticket-metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
  align-items: center;
}

.ticket-col {
  text-align: left;
  padding-right: 4px;
  min-width: 0;
}

.ticket-col.col-bordered {
  padding-left: 10px;
  border-left: 1px dashed #dcd7eb;
}

.col-kicker {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Space Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
  font-size: 8.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #64748b;
  line-height: 1;
  margin-bottom: 4px;
}

.kicker-icon {
  font-size: 8px;
  color: #756ce0;
}

.col-value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  line-height: 1;
  margin-bottom: 3px;
}

.col-number {
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: -0.5px;
  color: #1a1648;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.col-unit {
  font-family: 'Outfit', sans-serif;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.4px;
  line-height: 1;
}

.unit--indigo {
  color: #5d54c8;
}

.unit--amber {
  color: #c26100;
}

.unit--rose {
  color: #c01e46;
}

.col-subtext {
  font-family: 'Inter', sans-serif;
  font-size: 8px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ticket Bottom Perforated Line & Barcode */
.ticket-footer-strip {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #dcd7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ticket-barcode {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 13px;
  opacity: 0.7;
}

.ticket-barcode .bar {
  height: 100%;
  background-color: #1a1648;
  border-radius: 0.5px;
}

.bar-w1 { width: 1px; }
.bar-w2 { width: 2px; }
.bar-w3 { width: 3px; }
.bar-w4 { width: 4px; }

.ticket-action-note {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 9px;
  font-weight: 700;
  color: #4e48ad;
  letter-spacing: 0.2px;
}

.note-icon {
  font-size: 9.5px;
  color: #756ce0;
}

.arrow-icon {
  font-size: 8px;
  color: #756ce0;
  transition: transform 0.15s ease;
}

.ticket-pass-card:hover .arrow-icon {
  transform: translateX(2px);
}

/* ── Theme Adaptations (Blue Amber & Dark Variants) ───────────────── */
:is([data-theme="blue amber"], [data-theme="blue amber warm"], [data-theme="blue amber cool"]) .ticket-pass-card {
  background: #ffffff;
  border-color: #ded8ee;
}

:is([data-theme="blue amber warm"]) .ticket-top-strip {
  background: #faf8f3;
  border-bottom-color: #ece7da;
}

:is([data-theme="blue amber warm"]) .strip-serial {
  background: #f3efe6;
  color: #78716c;
}

:is([data-theme="blue amber cool"]) .ticket-top-strip {
  background: #f5f8ff;
  border-bottom-color: #e2eafc;
}

:is([data-theme*="dark"], .dark, [data-theme="dark"]) .ticket-pass-card {
  background: #1c1936;
  border-color: #2e2952;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

:is([data-theme*="dark"], .dark, [data-theme="dark"]) .ticket-pass-card::before {
  background-image: radial-gradient(rgba(233, 196, 106, 0.15) 0.75px, transparent 0.75px);
  opacity: 0.2;
}

:is([data-theme*="dark"], .dark, [data-theme="dark"]) .ticket-pass-card:hover {
  border-color: #413a73;
}

:is([data-theme*="dark"], .dark, [data-theme="dark"]) .ticket-notch {
  background-color: var(--dual-canvas-upper, #16152b);
  border-color: #2e2952;
}

:is([data-theme*="dark"], .dark, [data-theme="dark"]) .notch--left {
  border-right: 1px solid #2e2952;
}

:is([data-theme*="dark"], .dark, [data-theme="dark"]) .notch--right {
  border-left: 1px solid #2e2952;
}

:is([data-theme*="dark"], .dark, [data-theme="dark"]) .ticket-top-strip {
  background: #221f42;
  border-bottom-color: #2b2750;
}

:is([data-theme*="dark"], .dark, [data-theme="dark"]) .strip-serial {
  background: #2b2654;
  color: #c4c0e0;
}

:is([data-theme*="dark"], .dark, [data-theme="dark"]) .ticket-col.col-bordered {
  border-left-color: #2b2750;
}

:is([data-theme*="dark"], .dark, [data-theme="dark"]) .ticket-footer-strip {
  border-top-color: #2b2750;
}

:is([data-theme*="dark"], .dark, [data-theme="dark"]) .col-number {
  color: #f8f8fc;
}

:is([data-theme*="dark"], .dark, [data-theme="dark"]) .strip-title {
  color: #e9c46a;
}

:is([data-theme*="dark"], .dark, [data-theme="dark"]) .strip-serial,
:is([data-theme*="dark"], .dark, [data-theme="dark"]) .col-kicker,
:is([data-theme*="dark"], .dark, [data-theme="dark"]) .col-subtext {
  color: #a5a0c2;
}

:is([data-theme*="dark"], .dark, [data-theme="dark"]) .ticket-barcode .bar {
  background-color: #f8f8fc;
}

:is([data-theme*="dark"], .dark, [data-theme="dark"]) .ticket-action-note {
  color: #e9c46a;
}

/* ── 3. Story Banner Carousel (Grup 1 Layout) ──────────────────────── */
.banner-carousel-container {
  position: relative;
  width: 100%;
  border-radius: 16px;
  border: 2.5px solid #252525;
  box-shadow: 4px 4px 0 #252525;
  overflow: hidden;
  touch-action: pan-y;
  user-select: none;
}

.banner-track {
  display: flex;
  width: 100%;
  transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
}

.banner-slide {
  flex: 0 0 100%;
  min-width: 100%;
  position: relative;
  padding: 18px 20px 28px;
  box-sizing: border-box;
  overflow: hidden;
}

/* Dual-Tone Gradients for Blue Amber */
.slide--blue {
  background: linear-gradient(135deg, #cce4ff 0%, #eae8fc 50%, #fde68a 100%);
}

.slide--amber {
  background: linear-gradient(135deg, #f8e0a4 0%, #fed7aa 45%, #cce4ff 100%);
}

/* Abstract Neo-Brutalist Shapes */
.abstract-shape {
  position: absolute;
  pointer-events: none;
  z-index: 1;
}

.shape-ring {
  right: -25px;
  bottom: -25px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid rgba(37, 37, 37, 0.12);
}

.shape-diamond {
  top: 10px;
  right: 70px;
  width: 22px;
  height: 22px;
  border: 2px solid rgba(37, 37, 37, 0.2);
  transform: rotate(45deg);
}

.slide-body {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.slide-info {
  flex: 1;
  max-width: 65%;
}

.badge-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.neo-badge {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 4px;
  font-family: 'Outfit', sans-serif;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.badge--dark {
  background: #252525;
  color: #fde68a;
  box-shadow: 1px 1px 0 #ffffff;
}

.badge--outline {
  background: #ffffff;
  color: #1a1648;
  border: 1px solid #252525;
}

.badge--white {
  background: #ffffff;
  color: #5c0a3a;
  border: 1px solid #5c0a3a;
}

.slide-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.45rem;
  font-weight: 900;
  color: #1a1648;
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: -0.5px;
  line-height: 1.05;
}

.slide-title-accent {
  display: inline-block;
}

.text-accent-blue {
  color: #4b44b8;
}

.text-accent-amber {
  color: #5c0a3a;
}

.slide-desc {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #252525;
  margin: 0;
  line-height: 1.25;
}

/* Character Display */
.slide-illustration {
  position: relative;
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.char-frame {
  position: relative;
  width: 82px;
  height: 82px;
  border-radius: 50%;
  border: 2px solid #252525;
  box-shadow: 2.5px 2.5px 0 #252525;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
}

.frame--blue {
  background: #ffffff;
}

.frame--amber {
  background: #fef3c7;
}

.char-img {
  width: auto;
  height: 115px;
  object-fit: contain;
  transform: translateY(8px);
  filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.4));
  pointer-events: none;
}

.char-img-2 {
  height: 120px;
  transform: translateY(6px);
}

.stamp-badge {
  position: absolute;
  bottom: -4px;
  left: -4px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #e9c46a;
  border: 1.5px solid #252525;
  color: #1a1648;
  font-family: 'Outfit', sans-serif;
  font-size: 8px;
  font-weight: 900;
  box-shadow: 1px 1px 0 #252525;
  letter-spacing: 0.3px;
  z-index: 3;
}

.stamp--amber {
  background: #fecdd3;
  color: #9f1239;
  border-color: #252525;
}

.stamp-icon {
  font-size: 8px;
}

/* Carousel Indicators */
.carousel-indicators {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  z-index: 5;
}

.dot-btn {
  height: 6px;
  width: 8px;
  border-radius: 9999px;
  background: rgba(37, 37, 37, 0.25);
  border: 1px solid rgba(37, 37, 37, 0.4);
  padding: 0;
  cursor: pointer;
  transition: all 0.25s ease;
}

.dot-btn.is-active {
  width: 24px;
  background: #1a1648;
  border-color: #252525;
}

/* ── Responsive Rules ──────────────────────────────────────────────── */
@media (max-width: 480px) {
  .app-main-header {
    padding: 18px 14px 16px;
  }

  .greeting-title {
    font-size: 1.4rem;
  }

  .slide-title {
    font-size: 1.2rem;
  }

  .slide-info {
    max-width: 60%;
  }

  .slide-illustration {
    width: 76px;
    height: 76px;
  }

  .char-frame {
    width: 70px;
    height: 70px;
  }

  .char-img {
    height: 95px;
  }

  .char-img-2 {
    height: 100px;
  }
}
</style>
