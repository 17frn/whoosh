/**
 * Composable for automatic app updates & hot-reloading
 * Ensures changes are applied instantly without closing/reopening the app.
 */
import { ref, onMounted } from 'vue';

export function useAppAutoUpdate() {
  const updateToastMessage = ref<string | null>(null);
  const isUpdating = ref(false);

  function showUpdateNotification(msg: string = '⚡ Pembaruan diterapkan!') {
    updateToastMessage.value = msg;
    setTimeout(() => {
      updateToastMessage.value = null;
    }, 2800);
  }

  function triggerManualRefresh() {
    isUpdating.value = true;
    showUpdateNotification('🔄 Memuat ulang aplikasi...');
    setTimeout(() => {
      window.location.reload();
    }, 200);
  }

  onMounted(() => {
    // 1. Vite HMR (Hot Module Replacement in Dev)
    if (import.meta.hot) {
      import.meta.hot.on('vite:beforeUpdate', (payload) => {
        const fileNames = payload.updates.map(u => u.path.split('/').pop()).filter(Boolean).join(', ');
        showUpdateNotification(`⚡ Memperbarui: ${fileNames || 'komponen'}`);
      });

      import.meta.hot.on('vite:afterUpdate', () => {
        showUpdateNotification('✅ Pembaruan selesai!');
      });

      // When Vite signals full-reload (e.g. env changes, html, or full page reload)
      import.meta.hot.on('vite:beforeFullReload', () => {
        showUpdateNotification('🔄 Memuat ulang halaman...');
      });
    }

    // 2. Service Worker Auto-Update (Production / PWA)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // A new service worker has taken over, reload to apply new assets
        if (!isUpdating.value) {
          isUpdating.value = true;
          showUpdateNotification('🚀 Versi baru terdeteksi. Memperbarui...');
          setTimeout(() => {
            window.location.reload();
          }, 400);
        }
      });
    }
  });

  return {
    updateToastMessage,
    isUpdating,
    triggerManualRefresh,
  };
}
