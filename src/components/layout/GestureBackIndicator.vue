<template>
  <div
    v-if="gestureState.active"
    class="gesture-indicator-wrap"
    :class="[
      `edge-${gestureState.edge}`,
      { 'is-ready': gestureState.thresholdReached }
    ]"
    :style="indicatorStyle"
    aria-hidden="true"
  >
    <div class="gesture-pill">
      <i
        class="fa-solid"
        :class="gestureState.edge === 'left' ? 'fa-chevron-left' : 'fa-chevron-right'"
      ></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { gestureState } from '../../composables/useGestureNavigation';

const indicatorStyle = computed(() => {
  // Constrain Y inside screen bounds
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;
  const clampedY = Math.max(60, Math.min(gestureState.value.y, screenH - 60));

  // Elastic expansion based on distance
  const pull = Math.min(gestureState.value.distance * 0.45, 36);

  if (gestureState.value.edge === 'left') {
    return {
      top: `${clampedY}px`,
      left: '0px',
      transform: `translate3d(${pull}px, -50%, 0) scale(${0.8 + gestureState.value.progress * 0.3})`,
    };
  } else {
    return {
      top: `${clampedY}px`,
      right: '0px',
      transform: `translate3d(-${pull}px, -50%, 0) scale(${0.8 + gestureState.value.progress * 0.3})`,
    };
  }
});
</script>

<style scoped>
.gesture-indicator-wrap {
  position: fixed;
  z-index: 999999;
  pointer-events: none;
  user-select: none;
  transition: transform 0.08s ease-out, opacity 0.15s ease-out;
  will-change: transform, opacity;
}

.gesture-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(30, 41, 59, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #ffffff;
  font-size: 18px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.2);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}

/* Teardrop edge curvature */
.edge-left .gesture-pill {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.edge-right .gesture-pill {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

/* Threshold crossed: ready to trigger back */
.gesture-indicator-wrap.is-ready .gesture-pill {
  background: var(--theme-accent, #3b82f6);
  border-color: #ffffff;
  color: #ffffff;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.65), 0 4px 16px rgba(0, 0, 0, 0.4);
  transform: scale(1.12);
}

.gesture-indicator-wrap.is-ready i {
  animation: pulse-arrow 0.5s ease-in-out infinite alternate;
}

@keyframes pulse-arrow {
  0% { transform: scale(1); }
  100% { transform: scale(1.25); }
}
</style>
