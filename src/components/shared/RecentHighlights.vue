<template>
  <div class="recent-highlights-section">
    <!-- Section Header -->
    <div class="highlights-header">
      <div class="header-left-group">
        <h2 class="header-title">
          <i class="fa-solid fa-sparkles"></i>
          Sorotan Terkini
        </h2>
        <span class="header-subtitle">Jemuran Polaroid Bersama</span>
      </div>
      <div class="header-count">{{ recentItems.length }} Momen</div>
    </div>

    <!-- Horizontal Scroll Container -->
    <div class="highlights-scroll-container">
      <div class="highlights-track">
        <!-- Natural Curved Clothesline Wire (Moves synchronously with carousel scroll) -->
        <div class="clothesline-container" aria-hidden="true">
          <svg class="clothesline-svg" viewBox="0 0 1200 28" preserveAspectRatio="none" fill="none">
            <!-- Subtle Ambient Drop Shadow for Wire/Rope -->
            <path
              class="clothesline-shadow"
              d="M 0,8 Q 600,24 1200,8"
              stroke-width="2.6"
              stroke-linecap="round"
            />
            <!-- Natural Hanging String (Gentle catenary sag across the span) -->
            <path
              class="clothesline-wire"
              d="M 0,6 Q 600,22 1200,6"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <!-- Left and Right knot anchor points -->
            <circle cx="8" cy="6" r="3" fill="currentColor" opacity="0.6" />
            <circle cx="1192" cy="6" r="3" fill="currentColor" opacity="0.6" />
          </svg>
        </div>

        <!-- Hanging Polaroid Photo Cards -->
        <div
          v-for="(item, idx) in recentItems"
          :key="item.id"
          class="highlight-card polaroid-frame"
          :class="`tilt-${(idx % 3) + 1}`"
          @click="$emit('open-detail', item)"
          role="button"
          tabindex="0"
          @keydown.enter="$emit('open-detail', item)"
          :title="`Buka detail momen: ${item.title}`"
          :aria-label="`Buka detail momen: ${item.title}`"
        >
          <!-- 3D Metallic Binder Clip (Clamps card firmly onto clothesline wire) -->
          <div class="polaroid-binder-clip" aria-hidden="true">
            <svg class="binder-clip-svg" viewBox="0 0 28 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter :id="`clip-shadow-${idx}`" x="-30%" y="-20%" width="160%" height="150%">
                  <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.28"/>
                </filter>
                <linearGradient :id="`clip-bevel-${idx}`" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
                  <stop offset="30%" stop-color="#ffffff" stop-opacity="0.06"/>
                  <stop offset="80%" stop-color="#000000" stop-opacity="0.1"/>
                  <stop offset="100%" stop-color="#000000" stop-opacity="0.32"/>
                </linearGradient>
              </defs>
              <!-- Wire Handle Loop (Hooks over clothesline wire) -->
              <path class="clip-wire-handle" d="M9 20V5a5 5 0 0 1 10 0v15" stroke-linecap="round" stroke-width="2"/>
              
              <!-- 3D Clamp Body with Drop Shadow -->
              <g :filter="`url(#clip-shadow-${idx})`">
                <!-- Main Clamp Body (Trapezoid / Rounded Rectangle) -->
                <rect class="clip-clamp-body" x="4" y="19" width="20" height="15" rx="1.5"/>
                <!-- Metallic Bevel Lighting Overlay -->
                <rect x="4" y="19" width="20" height="15" rx="1.5" :fill="`url(#clip-bevel-${idx})`"/>
                <!-- Theme 3D Metallic Color Accent Lip -->
                <rect class="clip-clamp-accent" x="4" y="19" width="20" height="2.5" rx="0.5"/>
                <!-- Top Bevel Shine Line -->
                <line x1="5" y1="19.5" x2="23" y2="19.5" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/>
              </g>
              
              <!-- Front Wire Clamping Arms (Clamped firmly onto top frame) -->
              <path class="clip-wire-arms" d="M9.5 20L11.5 31M18.5 20L16.5 31" stroke-linecap="round" stroke-width="1.6"/>
            </svg>
          </div>

          <!-- Decorative Semi-Transparent Washi Tape Sticker -->
          <div class="polaroid-washi-tape" :class="`washi-tape-${(idx % 3) + 1}`" aria-hidden="true"></div>

          <!-- Polaroid Photo Box (Square 1:1 Aspect Ratio) -->
          <div class="polaroid-photo-wrapper">
            <img
              v-if="item.moments && item.moments.length > 0"
              :src="item.moments[0].image"
              :alt="item.title"
              class="polaroid-photo-img"
              loading="lazy"
            />
            <div v-else class="polaroid-photo-placeholder">
              <i class="fa-regular fa-image"></i>
            </div>

            <!-- Compact Photo Count Pill (Glassmorphic, bottom right) -->
            <span
              v-if="item.moments && item.moments.length > 0"
              class="photo-count-pill"
            >
              <i class="fa-solid fa-camera"></i>
              {{ item.moments.length }} foto
            </span>
          </div>

          <!-- Polaroid White Chin (Clean typography & metadata) -->
          <div class="polaroid-caption-area">
            <h3 class="highlight-title" :title="item.title">{{ item.title }}</h3>
            <div class="highlight-meta">
              <span class="highlight-location" v-if="item.location">
                <i class="fa-solid fa-location-dot"></i>
                {{ truncate(item.location, 14) }}
              </span>
              <span class="highlight-date" v-if="item.date">
                {{ formatDate(item.date) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Empty State Card -->
        <div v-if="recentItems.length === 0" class="highlight-card highlight-empty polaroid-frame">
          <div class="empty-content">
            <i class="fa-regular fa-compass"></i>
            <p>Belum ada momen terbaru</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Organic Dual-Tone Rounded Cap Bridge (Transition into Lower Canvas) -->
    <div class="canvas-transition-bridge" aria-hidden="true">
      <div class="bridge-handle-pill"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TimelineData } from '../../data/timeline';

const props = defineProps<{
  items: TimelineData[];
  maxItems?: number;
}>();

defineEmits<{
  'open-detail': [item: TimelineData];
}>();

// ── Date parsing helpers (same as HomeView) ───────────────────────
const BULAN_ID = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];

const ID_UP = BULAN_ID.map(b => b.toUpperCase());
const EN_UP = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
const SH_UP = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function getMonthFromDate(dateStr: string): number | null {
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

function getDayFromDate(dateStr: string): number {
  if (!dateStr) return 0;
  const m = dateStr.match(/(?:^|\b)(\d{1,2})\b/);
  return m ? parseInt(m[1]) : 0;
}

// Get recent items (sorted by year DESC, month DESC, day DESC)
const recentItems = computed(() => {
  const validItems = props.items.filter(
    item => item.title !== '__SYSTEM_COLLABORATOR_METADATA__' && item.year !== 9999
  );

  const sorted = [...validItems].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;

    const monthA = getMonthFromDate(a.date) ?? 0;
    const monthB = getMonthFromDate(b.date) ?? 0;
    if (monthA !== monthB) return monthB - monthA;

    const dayA = getDayFromDate(a.date);
    const dayB = getDayFromDate(b.date);
    return dayB - dayA;
  });

  return sorted.slice(0, props.maxItems || 5);
});

function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr.length > 12 ? dateStr.slice(0, 12) + '...' : dateStr;
}
</script>

<style scoped>
/* ── Section Container ──────────────────────────────────────────── */
.recent-highlights-section {
  padding: 0;
  background: transparent;
  position: relative;
  overflow: visible;
}

/* ── Header ─────────────────────────────────────────────────────── */
.highlights-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px 14px;
  background: var(--theme-header-bg);
  position: sticky;
  top: 0;
  z-index: 25;
  border-bottom: 1px solid var(--theme-header-border);
  transition: background 0.3s ease;
}

.header-left-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  font-family: 'Outfit', 'Space Grotesk', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--theme-header-text, #101010);
  margin: 0;
  line-height: 1.1;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s ease;
}

.header-title i {
  font-size: 1.1rem;
  color: var(--theme-accent, #6f6bd8);
}

.header-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--theme-text-muted, #6B6484);
  letter-spacing: 0.01em;
}

.header-count {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--theme-text, #101010);
  background: var(--theme-surface, #ffffff);
  border: 1px solid var(--theme-border-light, #e5e7eb);
  border-radius: 9999px;
  padding: 4px 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.15s;
}

/* ── Horizontal Scroll Container ────────────────────────────────── */
.highlights-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 34px 0 18px;
  position: relative;
  z-index: 2;
}

.highlights-scroll-container::-webkit-scrollbar {
  display: none;
}

.highlights-track {
  display: flex;
  gap: 16px;
  padding: 0 20px;
  min-width: min-content;
  position: relative;
}

/* ── Clothesline Wire (Catenary Sag) ────────────────────────────── */
.clothesline-container {
  position: absolute;
  top: 2px;
  left: 0;
  right: 0;
  height: 28px;
  pointer-events: none;
  z-index: 1;
}

.clothesline-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.clothesline-wire {
  stroke: var(--clothesline-wire-color, #64748b);
  transition: stroke 0.2s ease;
}

.clothesline-shadow {
  stroke: var(--clothesline-wire-shadow, rgba(0, 0, 0, 0.12));
}

/* ── Polaroid Hanging Photo Frame (Card) ─────────────────────────── */
.polaroid-frame {
  flex: 0 0 185px;
  width: 185px;
  background: var(--polaroid-bg, #ffffff);
  border: var(--polaroid-border, 1px solid rgba(0, 0, 0, 0.08));
  border-radius: 8px;
  box-shadow: var(--polaroid-shadow, 0 6px 18px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.03));
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 8px 8px 12px 8px;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  overflow: visible;
  margin-top: 14px;
  z-index: 2;
}

/* Subtle organic rotation angles */
.tilt-1 {
  transform: rotate(-1.8deg);
}

.tilt-2 {
  transform: rotate(1.6deg);
}

.tilt-3 {
  transform: rotate(-0.8deg);
}

.polaroid-frame:hover {
  transform: translateY(-5px) rotate(0deg) scale(1.025);
  box-shadow: var(--polaroid-hover-shadow, 0 14px 30px rgba(0, 0, 0, 0.14), 0 4px 8px rgba(0, 0, 0, 0.05));
  z-index: 15;
}

.polaroid-frame:active {
  transform: translateY(-1px) rotate(0deg) scale(1.00);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

/* ── 3D Metallic Binder Clip ─────────────────────────────────────── */
.polaroid-binder-clip {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  width: 26px;
  height: 38px;
  z-index: 10;
  pointer-events: none;
}

.binder-clip-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.clip-clamp-body {
  fill: var(--clip-body-fill, #252529);
  transition: fill 0.2s ease;
}

.clip-clamp-accent {
  fill: var(--clip-accent-fill, var(--theme-accent, #E9C46A));
  transition: fill 0.2s ease;
}

.clip-wire-handle {
  stroke: var(--clip-wire-stroke, #94a3b8);
  transition: stroke 0.2s ease;
}

.clip-wire-arms {
  stroke: var(--clip-arms-stroke, #cbd5e1);
  transition: stroke 0.2s ease;
}

/* ── Washi Tape Sticker ─────────────────────────────────────────── */
.polaroid-washi-tape {
  position: absolute;
  top: 5px;
  width: 34px;
  height: 11px;
  pointer-events: none;
  z-index: 8;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  opacity: 0.85;
}

.washi-tape-1 {
  left: 8px;
  transform: rotate(-10deg);
  background: var(--polaroid-washi-1, rgba(244, 196, 106, 0.85));
}

.washi-tape-2 {
  right: 8px;
  transform: rotate(10deg);
  background: var(--polaroid-washi-2, rgba(117, 108, 224, 0.75));
}

.washi-tape-3 {
  left: 10px;
  transform: rotate(-6deg);
  background: var(--polaroid-washi-3, rgba(52, 211, 153, 0.75));
}

/* ── Polaroid Photo Area (Square 1:1) ───────────────────────────── */
.polaroid-photo-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: var(--theme-bg-alt, #f1f3f5);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.polaroid-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.polaroid-frame:hover .polaroid-photo-img {
  transform: scale(1.03);
}

.polaroid-photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--theme-bg-alt, #f1f3f5);
  color: var(--theme-text-muted, #7c7060);
  font-size: 1.8rem;
}

/* Floating Photo Count Pill */
.photo-count-pill {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.68);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  color: #ffffff;
  border-radius: 4px;
  padding: 2px 6px;
  font-family: 'Inter', sans-serif;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.photo-count-pill i {
  font-size: 0.58rem;
  opacity: 0.9;
}

/* ── Polaroid Caption Area (White Chin) ─────────────────────────── */
.polaroid-caption-area {
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.highlight-title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--theme-text, #1e293b);
  margin: 0;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.highlight-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  margin-top: 2px;
}

.highlight-location {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--theme-text-muted, #64748b);
  font-weight: 600;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.highlight-location i {
  font-size: 0.62rem;
  color: var(--theme-accent, #756CE0);
  opacity: 0.95;
}

.highlight-date {
  color: var(--theme-text-muted, #94a3b8);
  font-weight: 500;
  font-size: 0.64rem;
  white-space: nowrap;
}

/* ── Organic Dual-Tone Rounded Cap Bridge ───────────────────────── */
.canvas-transition-bridge {
  position: relative;
  width: 100%;
  height: 32px;
  margin-top: 4px;
  background-color: var(--bridge-bg, var(--dual-canvas-lower, #4E48AD));
  border-radius: 28px 28px 0 0;
  box-shadow: var(--bridge-shadow, 0 -4px 14px rgba(78, 72, 173, 0.22));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  transition: background-color 0.3s ease;
}

.bridge-handle-pill {
  width: 42px;
  height: 4px;
  border-radius: 9999px;
  background: var(--bridge-pill-bg, rgba(255, 255, 255, 0.4));
  transition: all 0.2s ease;
}

/* ── Empty State ────────────────────────────────────────────────── */
.highlight-empty {
  cursor: default;
  border-style: dashed;
  border-color: var(--theme-border-light, #e2e8f0);
  box-shadow: none;
  background: var(--theme-surface, #ffffff);
}

.highlight-empty:hover {
  transform: none;
  box-shadow: none;
}

.empty-content {
  width: 100%;
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--theme-text-muted, #7c7060);
}

.empty-content i {
  font-size: 2.2rem;
  color: var(--theme-border-light, #d1d5db);
}

.empty-content p {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  margin: 0;
}

/* ── Responsive ─────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .highlights-scroll-container {
    padding: 32px 0 16px;
  }

  .polaroid-frame {
    flex: 0 0 165px;
    width: 165px;
    padding: 7px 7px 10px 7px;
    margin-top: 12px;
  }

  .header-title {
    font-size: 1.15rem;
  }

  .header-count {
    font-size: 0.7rem;
    padding: 3px 10px;
  }

  .polaroid-binder-clip {
    top: -22px;
    width: 24px;
    height: 35px;
  }

  .canvas-transition-bridge {
    height: 28px;
    border-radius: 24px 24px 0 0;
  }

  .bridge-handle-pill {
    width: 36px;
    height: 3.5px;
  }
}
</style>
