import { ref, onMounted, onBeforeUnmount } from 'vue';
import { triggerBack } from './useBackButton';

export interface GestureNavState {
  active: boolean;
  edge: 'left' | 'right';
  distance: number;
  progress: number; // 0 to 1
  thresholdReached: boolean;
  y: number;
}

export const gestureState = ref<GestureNavState>({
  active: false,
  edge: 'left',
  distance: 0,
  progress: 0,
  thresholdReached: false,
  y: 0,
});

/**
 * Push a history state entry to allow browser edge-swipe gesture
 * (like Chrome on Android) to naturally trigger popstate -> triggerBack.
 */
export function pushNavState(name: string) {
  try {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({ appNav: name, time: Date.now() }, '');
    }
  } catch {}
}

/**
 * useGestureNavigation composable
 * Captures swipe gestures from the left/right screen edge (similar to Android 10+ Gesture Navigation)
 * and triggers triggerBack() upon release.
 */
export function useGestureNavigation() {
  let touchStartX = 0;
  let touchStartY = 0;
  let isTracking = false;
  let activeEdge: 'left' | 'right' = 'left';
  const EDGE_ZONE = 48; // px from edge
  const THRESHOLD = 65; // px inwards to trigger back

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) {
      isTracking = false;
      gestureState.value.active = false;
      return;
    }

    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    const screenWidth = window.innerWidth;

    // Check if touch starts at left edge or right edge
    const isLeftEdge = x <= EDGE_ZONE;
    const isRightEdge = x >= screenWidth - EDGE_ZONE;

    // Also allow slightly wider start zone if a modal is open
    const isModalOpen = document.documentElement.classList.contains('modal-open');
    const isModalEdge = isModalOpen && (x <= 70 || x >= screenWidth - 70);

    if (isLeftEdge || (isModalEdge && x <= 70)) {
      touchStartX = x;
      touchStartY = y;
      isTracking = true;
      activeEdge = 'left';
      gestureState.value = {
        active: false,
        edge: 'left',
        distance: 0,
        progress: 0,
        thresholdReached: false,
        y: y,
      };
    } else if (isRightEdge || (isModalEdge && x >= screenWidth - 70)) {
      touchStartX = x;
      touchStartY = y;
      isTracking = true;
      activeEdge = 'right';
      gestureState.value = {
        active: false,
        edge: 'right',
        distance: 0,
        progress: 0,
        thresholdReached: false,
        y: y,
      };
    } else {
      isTracking = false;
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (!isTracking || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;

    const deltaX = currentX - touchStartX;
    const deltaY = currentY - touchStartY;

    // If movement is predominantly vertical, cancel gesture to allow smooth scroll
    if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5 && Math.abs(deltaY) > 20) {
      isTracking = false;
      gestureState.value.active = false;
      return;
    }

    // Inward distance
    let inwardDist = 0;
    if (activeEdge === 'left') {
      inwardDist = deltaX; // moving right
    } else {
      inwardDist = -deltaX; // moving left
    }

    if (inwardDist > 10) {
      const progress = Math.min(Math.max((inwardDist - 10) / THRESHOLD, 0), 1.2);
      const thresholdReached = inwardDist >= THRESHOLD;

      // Haptic tick when threshold is crossed
      if (thresholdReached && !gestureState.value.thresholdReached) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(10); } catch {}
        }
      }

      gestureState.value = {
        active: true,
        edge: activeEdge,
        distance: inwardDist,
        progress: Math.min(progress, 1),
        thresholdReached,
        y: currentY,
      };
    } else {
      gestureState.value.active = false;
    }
  }

  function onTouchEnd() {
    if (!isTracking) return;
    isTracking = false;

    if (gestureState.value.thresholdReached) {
      // Trigger navigation back!
      void triggerBack();
    }

    // Reset gesture indicator after brief animation
    setTimeout(() => {
      gestureState.value.active = false;
      gestureState.value.thresholdReached = false;
      gestureState.value.distance = 0;
      gestureState.value.progress = 0;
    }, 150);
  }

  function onTouchCancel() {
    isTracking = false;
    gestureState.value.active = false;
  }

  onMounted(() => {
    // Add touch listeners on window with passive: true so scrolling is non-blocking
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchCancel, { passive: true });
  });

  onBeforeUnmount(() => {
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchCancel);
  });

  return { gestureState };
}
