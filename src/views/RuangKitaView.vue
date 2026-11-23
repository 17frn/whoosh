<script setup lang="ts">
import { ref, computed } from 'vue';
import LoveDistanceHero from '../components/ruang-kita/LoveDistanceHero.vue';

// Underlying components and architecture preserved for future rollout:
// import RuangKitaDiary from '../components/ruang-kita/RuangKitaDiary.vue';
// import RuangKitaKenangan from '../components/ruang-kita/RuangKitaKenangan.vue';
// import RuangKitaRencana from '../components/ruang-kita/RuangKitaRencana.vue';
// import RuangKitaAktivitas from '../components/ruang-kita/RuangKitaAktivitas.vue';

type CategoryType = 'diary' | 'kenangan' | 'rencana' | 'aktivitas';

const activeCategory = ref<CategoryType>('diary');

const categories = [
  { id: 'diary' as CategoryType, label: 'Diary', icon: 'fa-solid fa-book-open', desc: 'Surat & Catatan' },
  { id: 'kenangan' as CategoryType, label: 'Kenangan', icon: 'fa-solid fa-camera-retro', desc: 'Foto & Momen' },
  { id: 'rencana' as CategoryType, label: 'Rencana', icon: 'fa-solid fa-map-location-dot', desc: 'Bucket & Tempat' },
  { id: 'aktivitas' as CategoryType, label: 'Aktivitas', icon: 'fa-solid fa-calendar-check', desc: 'Kabar & Mood' },
];

const currentCategory = computed(() => {
  return categories.find(c => c.id === activeCategory.value) || categories[0];
});
</script>

<template>
  <div class="ruang-kita-view">
    <!-- Clean Page Header: Title Only -->
    <header class="ruang-kita-header">
      <div class="header-content-inner">
        <h1 class="page-title">RUANG KITA</h1>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="ruang-kita-main">
      <!-- Pinned Love Distance Hero Card with Bright Street Map -->
      <section class="section-love-hero">
        <LoveDistanceHero />
      </section>

      <!-- Four-Menu Navigation: Direct layout without outer Neo-Brutalism card -->
      <section class="section-category-nav" role="tablist" aria-label="Navigasi Menu Ruang Kita">
        <div class="category-nav-bar">
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            role="tab"
            :aria-selected="activeCategory === cat.id"
            class="cat-nav-item"
            :class="{ active: activeCategory === cat.id }"
            @click="activeCategory = cat.id"
          >
            <div class="cat-nav-icon">
              <i :class="cat.icon"></i>
            </div>
            <div class="cat-nav-meta">
              <span class="cat-nav-label">{{ cat.label }}</span>
              <span class="cat-nav-sub">{{ cat.desc }}</span>
            </div>
            <!-- Subtle active indicator line -->
            <div class="cat-active-line" aria-hidden="true"></div>
          </button>
        </div>
      </section>

      <!-- Dotted Separator Between Navigation and Maintenance Section -->
      <div class="nav-maintenance-divider" aria-hidden="true"></div>

      <!-- Content Below Navigation: Maintenance State directly on page canvas -->
      <section class="section-category-content">
        <Transition name="panel-fade" mode="out-in">
          <div :key="activeCategory" class="maintenance-canvas-wrap">
            <!-- Selected menu icon in a single solid background shape (no nested layers, no secondary badge) -->
            <div class="maintenance-icon-solid">
              <i :class="currentCategory.icon" class="main-cat-icon"></i>
            </div>

            <!-- Active Category Label -->
            <span class="maintenance-category-label">{{ currentCategory.label }}</span>

            <!-- Required Maintenance Title -->
            <h2 class="maintenance-title">Page is under maintenance</h2>

          </div>
        </Transition>
      </section>
    </main>
  </div>
</template>

<style scoped>
.ruang-kita-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary, var(--theme-bg, #f8fafc));
  padding-bottom: 96px; /* Clearance for BottomNav */
}

/* ── 1. Clean Page Header ────────────────────────────────────────── */
.ruang-kita-header {
  background: var(--theme-surface, #ffffff);
  border-bottom: 2px solid var(--theme-border, #101010);
  padding: 16px 20px;
}

.header-content-inner {
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  margin: 0;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: -0.01em;
  color: var(--theme-text, #101010);
  text-transform: uppercase;
}

/* ── Main Content Container ──────────────────────────────────────── */
.ruang-kita-main {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.section-love-hero {
  width: 100%;
  margin-bottom: 16px;
}

/* ── Four-Menu Navigation (Direct Layout) ─────────────────────────── */
.section-category-nav {
  width: 100%;
  padding: 4px 0;
}

.category-nav-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  width: 100%;
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}

.cat-nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 4px 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

/* Direct Icon styling (No individual background boxes) */
.cat-nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  line-height: 1;
}

.cat-nav-icon i {
  /* Increased icon size for quick visual recognition */
  font-size: 1.55rem;
  color: var(--theme-icon-primary, #94a3b8);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), color 0.3s ease;
}

.cat-nav-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.cat-nav-label {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 0.85rem; /* ~13.6px, increased for better readability */
  font-weight: 700;
  color: var(--theme-text-muted, #64748b);
  transition: color 0.3s ease, font-weight 0.2s ease;
  white-space: nowrap;
}

.cat-nav-sub {
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem; /* ~10.8px, secondary */
  color: var(--theme-text-muted, #94a3b8);
  white-space: nowrap;
  transition: color 0.3s ease;
}

/* Subtle Active Indicator Line */
.cat-active-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 28px;
  height: 3px;
  border-radius: 3px;
  background: var(--theme-accent, #756ce0);
  transform: translateX(-50%) scaleX(0);
  opacity: 0;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

/* Active State: Restrained, Distinct, No Background Boxes */
.cat-nav-item.active .cat-nav-icon i {
  color: var(--theme-accent, #756ce0);
  transform: translateY(-2px);
}

.cat-nav-item.active .cat-nav-label {
  color: var(--theme-text, #101010);
  font-weight: 800;
}

.cat-nav-item.active .cat-nav-sub {
  color: var(--theme-accent, #756ce0);
}

.cat-nav-item.active .cat-active-line {
  transform: translateX(-50%) scaleX(1);
  opacity: 1;
}

.cat-nav-item:hover:not(.active) .cat-nav-icon i {
  color: var(--theme-text, #101010);
}

/* ── 3. Dotted Separator Between Navigation and Maintenance ──────── */
.nav-maintenance-divider {
  width: 100%;
  border-top: 2.5px dashed var(--theme-dot-line, #94a3b8);
  margin: 10px 0 20px;
}

/* ── 2. Maintenance Section Directly on Page Canvas ─────────────── */
.section-category-content {
  width: 100%;
}

.maintenance-canvas-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 16px 44px;
  width: 100%;
  box-sizing: border-box;
}

/* Single solid background shape (NO nested circles, NO border, NO secondary badge) */
.maintenance-icon-solid {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: var(--theme-accent, #756ce0);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  margin-bottom: 16px;
  border: none;
  box-shadow: none;
}

.main-cat-icon {
  font-size: 1.85rem;
  color: #ffffff;
}

.maintenance-category-label {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--theme-accent, #756ce0);
  margin-bottom: 8px;
}

.maintenance-title {
  margin: 0 0 10px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--theme-text, #101010);
  letter-spacing: -0.01em;
}

.maintenance-message {
  margin: 0;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.85rem;
  color: var(--theme-text-muted, #71717a);
  line-height: 1.55;
  max-width: 360px;
}

/* ── Panel Transitions ───────────────────────────────────────────── */
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.panel-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── Reduced Motion Preference ───────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .cat-nav-item,
  .cat-nav-icon i,
  .cat-active-line,
  .panel-fade-enter-active,
  .panel-fade-leave-active {
    transition: none !important;
    animation: none !important;
  }
}

/* ── Mobile Layout Fine-Tuning ───────────────────────────────────── */
@media (max-width: 480px) {
  .ruang-kita-main {
    padding: 12px 10px;
  }

  .category-nav-bar {
    gap: 4px;
  }

  .cat-nav-item {
    padding: 8px 2px 12px;
  }

  .cat-nav-icon i {
    font-size: 1.45rem;
  }

  .cat-nav-label {
    font-size: 0.8rem;
  }

  .cat-nav-sub {
    font-size: 0.62rem;
  }

  .maintenance-canvas-wrap {
    padding: 24px 12px 36px;
  }

  .maintenance-title {
    font-size: 1.15rem;
  }
}
</style>
