<template>
  <nav class="bottom-nav" role="navigation" aria-label="Navigasi Utama">
    <!-- Cutout Background Mask Trick -->
    <div class="nav-bg-container">
      <div class="nav-bg-slider" :class="'active-' + modelValue">
        <div class="bg-cutout"></div>
      </div>
    </div>

    <!-- Floating elevated circle (sits inside the cutout) -->
    <div class="nav-indicator" :class="'active-' + modelValue">
      <div class="indicator-circle"></div>
    </div>

    <button
      id="nav-home"
      class="nav-item"
      :class="{ active: modelValue === 'home' }"
      @click="$emit('update:modelValue', 'home')"
      aria-label="Beranda"
    >
      <div class="icon-wrapper"><i class="fa-solid fa-house"></i></div>
      <span class="nav-label">Beranda</span>
    </button>

    <button
      id="nav-space"
      class="nav-item"
      :class="{ active: modelValue === 'space' }"
      @click="$emit('update:modelValue', 'space')"
      aria-label="Ruang Kita"
    >
      <div class="icon-wrapper"><i class="fa-solid fa-heart"></i></div>
      <span class="nav-label">Ruang Kita</span>
    </button>

    <button
      id="nav-timeline"
      class="nav-item"
      :class="{ active: modelValue === 'timeline' }"
      @click="$emit('update:modelValue', 'timeline')"
      aria-label="Linimasa"
    >
      <div class="icon-wrapper"><i class="fa-solid fa-route"></i></div>
      <span class="nav-label">Linimasa</span>
    </button>

    <button
      id="nav-settings"
      class="nav-item"
      :class="{ active: modelValue === 'settings' }"
      @click="$emit('update:modelValue', 'settings')"
      aria-label="Pengaturan"
    >
      <div class="icon-wrapper"><i class="fa-solid fa-gear"></i></div>
      <span class="nav-label">Pengaturan</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
export type TabName = 'home' | 'space' | 'timeline' | 'settings';

defineProps<{ modelValue: TabName }>();
defineEmits<{ 'update:modelValue': [tab: TabName] }>();
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 68px;
  background: transparent; /* Must be transparent for cutout to show */
  display: flex;
  z-index: 600;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* Container for the background and cutout */
.nav-bg-container {
  position: absolute;
  inset: 0;
  overflow: hidden; /* Clips the huge box-shadow to just the navbar bounds */
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.06);
  z-index: 0;
}

.nav-bg-slider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 25%;
  display: flex;
  justify-content: center;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.active-home     { transform: translateX(0); }
.active-space    { transform: translateX(100%); }
.active-timeline { transform: translateX(200%); }
.active-settings { transform: translateX(300%); }

/* The Cutout Hole */
.bg-cutout {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  background: transparent; /* The hole */
  /* This huge shadow acts as the solid background for the rest of the navbar */
  box-shadow: 0 0 0 2000px var(--theme-nav-bg, #ffffff);
  transform: translateY(-39px);
}

/* The Elevated Circle that sits inside the cutout */
.nav-indicator {
  position: absolute;
  top: 0; /* Anchor to top edge of navbar */
  width: 25%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 1;
  pointer-events: none;
}

.indicator-circle {
  width: 62px;
  height: 62px;
  background: var(--theme-nav-indicator, #ffffff);
  border-radius: 50%;
  transform: translateY(-50%);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.22);
  transition: background 0.3s ease;
}

/* Nav Buttons */
.nav-item {
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--theme-icon-primary, #b0bac9);
  position: relative;
  z-index: 2;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.icon-wrapper {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.3s ease;
}

.icon-wrapper i {
  font-size: 1.65rem;
}

.nav-label {
  position: absolute;
  bottom: 11px;
  font-family: 'Inter', sans-serif;
  font-size: 0.62rem;
  font-weight: 600;
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: 1;
  transform: translateY(0);
  white-space: nowrap;
}

/* Active Tab Styles */
.nav-item.active .icon-wrapper {
  /* Move icon up to be centered in elevated circle */
  transform: translate(-50%, -26px);
  color: var(--theme-icon-secondary, #6b9bd6);
}

.nav-item.active .nav-label {
  opacity: 0;
  transform: translateY(10px);
}
</style>
