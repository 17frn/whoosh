<template>
  <div class="settings-view">
    <main class="settings-content">

      <!-- PERSONALIZATION SECTION CONTAINER -->
      <div class="personalization-container">

        <!-- 1. TEMA TAMPILAN -->
        <section class="settings-section">
          <div class="section-label">
            <i class="fa-solid fa-palette"></i>
            <span>Tema Tampilan</span>
          </div>

          <!-- Left-Aligned Staggered Brick Grid -->
          <div class="theme-brick-grid">
            <button
              v-for="(theme, idx) in themes"
              :key="theme.id"
              class="theme-card"
              :class="[
                `theme-card-${idx + 1}`,
                `theme-card-${theme.id.replace(/\s+/g, '-')}`,
                { 'is-active': activeThemeId === theme.id }
              ]"
              @click="setTheme(theme.id)"
              :aria-pressed="activeThemeId === theme.id"
              :aria-label="`Pilih tema ${theme.name}`"
            >
              <!-- Top Row: Swatch Chips & Active Checkmark -->
              <div class="card-header-row">
                <div class="theme-mini-swatch" aria-hidden="true">
                  <span
                    v-for="(color, cIdx) in (THEME_PALETTES[theme.id] || [theme.accentColor])"
                    :key="cIdx"
                    class="swatch-chip"
                    :style="{ backgroundColor: color }"
                  ></span>
                </div>
                <div v-if="activeThemeId === theme.id" class="theme-check-badge" aria-label="Aktif">
                  <i class="fa-solid fa-check"></i>
                </div>
              </div>

              <!-- Middle: Theme Name -->
              <div class="theme-title-row">
                <span class="theme-name">{{ theme.name }}</span>
              </div>

              <!-- Bottom: Compact Description -->
              <p class="theme-desc">{{ theme.description }}</p>
            </button>
          </div>
        </section>

        <!-- 2. TENTANG APLIKASI -->
        <section class="settings-section">
          <div class="section-label">
            <i class="fa-solid fa-circle-info"></i>
            <span>Tentang Aplikasi</span>
          </div>
          <div class="about-card">
            <div class="about-row">
              <span class="about-key">Versi</span>
              <span class="about-val">{{ APP_VERSION }}</span>
            </div>
            <div class="about-row">
              <span class="about-key">Framework</span>
              <span class="about-val">Vue 3 + Capacitor</span>
            </div>
          </div>
        </section>

        <!-- 3. LOG OUT (Placeholder) -->
        <section class="settings-section logout-section">
          <div class="section-label">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Keluar Sesi</span>
          </div>
          <div class="logout-card">
            <button
              type="button"
              class="logout-btn-placeholder"
              disabled
              aria-label="Keluar (Segera hadir)"
              title="Fitur keluar akun akan tersedia pada pembaruan mendatang"
            >
              <div class="logout-btn-left">
                <i class="fa-solid fa-arrow-right-from-bracket logout-btn-icon"></i>
                <span class="logout-btn-text">Keluar</span>
              </div>
              <span class="logout-badge-placeholder">Segera Hadir</span>
            </button>
          </div>
        </section>

      </div><!-- end .personalization-container -->

    </main>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme';
import { APP_VERSION } from '../data/versionHistory';

const { activeThemeId, themes, setTheme } = useTheme();

const THEME_PALETTES: Record<string, string[]> = {
  'blue amber': ['#FFFFFF', '#F4C46A', '#252525', '#A59EF5'],
  'blue amber warm': ['#FEF5E7', '#F4A460', '#1A1410', '#A0BFF2'],
  'blue amber cool': ['#FFFFFF', '#F59E0B', '#1E3A5F', '#93C5FD'],
  'zine': ['#FEF08A', '#FFFFFF', '#737373', '#E5E5E5'],
  'crimson': ['#FFFFFF', '#DDD6FE', '#4C0519', '#FDA4AF'],
};
</script>

<style scoped>
.settings-view {
  width: 100%;
  min-height: 100%;
  background: var(--theme-bg, #fdfdf5);
  transition: background 0.3s ease;
}

.settings-content {
  width: min(calc(100% - 32px), 390px);
  margin-inline: auto;
  box-sizing: border-box;
  padding: 16px 0 28px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* ── Personalization Container ── */
.personalization-container {
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: 100%;
}

/* ── Section ── */
.settings-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--theme-text-muted, #7c7060);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Left-Aligned Staggered Brick Grid ────────────────────────── */
.theme-brick-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px 8px;
  width: 100%;
}

/* Row 1: 3 cards (2 cols each, total 6 cols) — starts at col 1 (LEFT-ALIGNED) */
.theme-card-1 {
  grid-column: 1 / span 2;
}

.theme-card-2 {
  grid-column: 3 / span 2;
}

.theme-card-3 {
  grid-column: 5 / span 2;
}

/* Row 2: 2 cards (3 cols each, total 6 cols) — starts at col 1 (LEFT-ALIGNED) */
.theme-card-4 {
  grid-column: 1 / span 3;
}

.theme-card-5 {
  grid-column: 4 / span 3;
}

/* ── Compact Theme Card (Solid Surfaces) ───────────────────────── */
.theme-card {
  width: 100%;
  min-height: 94px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
  border: 1.5px solid var(--theme-border, #101010);
  box-shadow: 2px 2px 0 var(--theme-border, #101010);
  border-radius: 4px;
  padding: 8px 8px;
  cursor: pointer;
  text-align: left;
  position: relative;
  transition: transform 0.1s ease, box-shadow 0.1s ease, outline 0.15s ease;
  overflow: hidden;
  box-sizing: border-box;
}

.theme-card:hover {
  filter: brightness(1.04);
}

.theme-card:active {
  transform: translate(1.5px, 1.5px);
  box-shadow: 0.5px 0.5px 0 var(--theme-border, #101010);
}

/* ── Solid Background per Theme ── */
/* 1. Blue Amber: Indigo */
.theme-card-blue-amber {
  background-color: #6960D8;
  border-color: #242424;
}

/* 2. Blue Amber Warm: Warm Soft Blue */
.theme-card-blue-amber-warm {
  background-color: #4D78CE;
  border-color: #242424;
}

/* 3. Blue Amber Cool: Bright Tech Blue */
.theme-card-blue-amber-cool {
  background-color: #1D5BD8;
  border-color: #242424;
}

/* 4. Zine: Near Black */
.theme-card-zine {
  background-color: #141414;
  border-color: #242424;
}

/* 5. Crimson: Deep Crimson / Coral */
.theme-card-crimson {
  background-color: #D9264E;
  border-color: #242424;
}

/* ── Selected State ── */
.theme-card.is-active {
  outline: 2px solid #FFFFFF;
  outline-offset: -1px;
  box-shadow: 2.5px 2.5px 0 #101010;
}

.theme-card-zine.is-active {
  outline: 2px solid #FEF08A;
}

/* Top Row: Mini Swatch & Checkmark */
.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  width: 100%;
  min-height: 15px;
}

.theme-mini-swatch {
  display: flex;
  align-items: center;
  gap: 2.5px;
}

.swatch-chip {
  width: 8px;
  height: 8px;
  border-radius: 1.5px;
  border: 0.5px solid rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
  box-sizing: border-box;
}

.theme-check-badge {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  flex-shrink: 0;
}

.theme-card-blue-amber .theme-check-badge {
  background: #F4C46A;
  color: #1A1648;
}

.theme-card-blue-amber-warm .theme-check-badge {
  background: #F4A460;
  color: #122448;
}

.theme-card-blue-amber-cool .theme-check-badge {
  background: #F59E0B;
  color: #0C2356;
}

.theme-card-zine .theme-check-badge {
  background: #FEF08A;
  color: #141414;
}

.theme-card-crimson .theme-check-badge {
  background: #FFFFFF;
  color: #D9264E;
}

/* Middle Row: Name */
.theme-title-row {
  width: 100%;
}

.theme-name {
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  font-weight: 800;
  color: #FFFFFF;
  line-height: 1.15;
  display: block;
  word-break: break-word;
}

/* Bottom: Description */
.theme-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.88);
  margin: 0;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.theme-card-zine .theme-desc {
  color: rgba(255, 255, 255, 0.78);
}

/* ── About Card ────────────────────────────────────────────────── */
.about-card {
  background: var(--theme-surface, #ffffff);
  border: 1.5px solid var(--theme-border, #101010);
  box-shadow: 2px 2px 0 var(--theme-border, #101010);
  border-radius: 4px;
  overflow: hidden;
}

.about-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--theme-border-light, #e2e0d0);
}

.about-row:last-child {
  border-bottom: none;
}

.about-key {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--theme-text-muted, #7c7060);
}

.about-val {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--theme-text, #101010);
  text-align: right;
}

/* ── Logout Section (Placeholder) ──────────────────────────────── */
.logout-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.logout-card {
  width: 100%;
}

.logout-btn-placeholder {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  background: var(--theme-surface, #ffffff);
  border: 1.5px solid var(--theme-border, #101010);
  box-shadow: 2px 2px 0 var(--theme-border, #101010);
  border-radius: 4px;
  cursor: not-allowed;
  opacity: 0.85;
  box-sizing: border-box;
  transition: opacity 0.15s ease;
}

.logout-btn-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logout-btn-icon {
  font-size: 0.95rem;
  color: #D9264E;
}

.logout-btn-text {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--theme-text, #101010);
}

.logout-badge-placeholder {
  font-family: 'Inter', sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  background: var(--theme-accent-soft, #f0f0f0);
  color: var(--theme-text-muted, #7c7060);
  padding: 3px 7px;
  border-radius: 3px;
  border: 1px solid var(--theme-border-light, #e0e0e0);
}

/* ── Responsive Adaptations ────────────────────────────────────── */
@media (max-width: 330px) {
  .theme-brick-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px 6px;
  }
  .theme-card-1 { grid-column: 1 / span 1; }
  .theme-card-2 { grid-column: 2 / span 1; }
  .theme-card-3 { grid-column: 1 / span 1; }
  .theme-card-4 { grid-column: 2 / span 1; }
  .theme-card-5 { grid-column: 1 / span 2; }
}

@media (max-width: 260px) {
  .theme-brick-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .theme-card {
    grid-column: auto;
  }
}
</style>
