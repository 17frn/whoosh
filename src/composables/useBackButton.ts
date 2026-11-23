/**
 * useBackButton – Capacitor Android hardware back button handler & gesture navigation
 *
 * Priority stack (highest → lowest):
 *  1. Any open modal/sheet (closes it)
 *  2. Non-home tab  → navigate back to 'home'
 *  3. Home tab      → confirm exit dialog (double-press within 2s exits)
 */

import { App as CapacitorApp } from '@capacitor/app';
import { onMounted, onBeforeUnmount, ref } from 'vue';

type BackHandler = () => boolean; // return true = consumed the event

// Global ordered stack – higher index = higher priority
const _handlers: Array<{ id: string; fn: BackHandler }> = [];

export interface BackButtonOptions {
  /** Reactive getter: currently active tab */
  getActiveTab: () => string;
  /** Navigate to home tab */
  goHome?: () => void;
  /** Navigate back in tab history stack. Returns true if navigated to previous tab, false if at root */
  goBackTab?: () => boolean;
  /** Close FAB speed-dial if open */
  closeFab: () => boolean;
}

let _options: BackButtonOptions | null = null;
let _isBackHandling = false;

/** Register a handler. Returns unregister function. */
export function registerBackHandler(id: string, fn: BackHandler) {
  // Replace existing handler with same id if re-registered
  const idx = _handlers.findIndex(h => h.id === id);
  if (idx !== -1) _handlers.splice(idx, 1);
  _handlers.push({ id, fn });

  return () => {
    const i = _handlers.findIndex(h => h.id === id);
    if (i !== -1) _handlers.splice(i, 1);
  };
}

/** Unregister by id */
export function unregisterBackHandler(id: string) {
  const i = _handlers.findIndex(h => h.id === id);
  if (i !== -1) _handlers.splice(i, 1);
}

/** Check if any modal or non-home view is active */
export function canGoBack(): boolean {
  if (_handlers.length > 0) return true;
  if (_options?.getActiveTab() !== 'home') return true;
  return false;
}

/** Trigger back navigation programmatically (from gesture, system button, or browser back) */
export async function triggerBack(): Promise<boolean> {
  if (_isBackHandling) return true;
  _isBackHandling = true;
  setTimeout(() => {
    _isBackHandling = false;
  }, 250);

  // Walk the stack from highest priority to lowest
  for (let i = _handlers.length - 1; i >= 0; i--) {
    try {
      const consumed = _handlers[i].fn();
      if (consumed) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(12); } catch {}
        }
        return true;
      }
    } catch (err) {
      console.warn('Error in back handler:', err);
    }
  }

  // ── Built-in fallback logic ──────────────────────────────────────────
  // Close FAB speed-dial first if open
  if (_options?.closeFab()) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(12); } catch {}
    }
    return true;
  }

  // Go back in tab history stack (e.g. settings -> timeline -> home)
  if (_options?.goBackTab && _options.goBackTab()) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(12); } catch {}
    }
    return true;
  }

  // Fallback: If not on home tab -> go home
  if (_options && _options.getActiveTab() !== 'home') {
    _options.goHome?.();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(12); } catch {}
    }
    return true;
  }

  return false;
}

// ── Main composable (use ONCE in App.vue root) ───────────────────────────────

export function useBackButton(options: BackButtonOptions) {
  _options = options;

  // Exit-on-double-press state
  const exitToastVisible = ref(false);
  let exitTimer: ReturnType<typeof setTimeout> | null = null;

  let listenerHandle: (() => Promise<void>) | null = null;

  async function handleHardwareBack() {
    const consumed = await triggerBack();
    if (consumed) return;

    // On home tab with nothing open → double-press to exit
    if (exitToastVisible.value) {
      if (exitTimer) clearTimeout(exitTimer);
      exitToastVisible.value = false;
      try {
        await CapacitorApp.exitApp();
      } catch {
        // In browser or non-Capacitor environment
      }
      return;
    }

    // First press → show toast hint
    exitToastVisible.value = true;
    exitTimer = setTimeout(() => {
      exitToastVisible.value = false;
    }, 2000);
  }

  onMounted(async () => {
    try {
      const handle = await CapacitorApp.addListener('backButton', () => {
        void handleHardwareBack();
      });
      listenerHandle = () => handle.remove();
    } catch {
      // Capacitor not available (e.g. running purely in web browser)
    }

    // Also listen to browser history popstate for mobile browser live debugging
    const onPopState = () => {
      void triggerBack();
    };
    window.addEventListener('popstate', onPopState);

    // Save remove handler
    const prevRemove = listenerHandle;
    listenerHandle = async () => {
      window.removeEventListener('popstate', onPopState);
      if (prevRemove) await prevRemove();
    };
  });

  onBeforeUnmount(() => {
    listenerHandle?.();
    _options = null;
  });

  return { exitToastVisible, triggerBack };
}
