<template>
  <div class="pmap-lazy-loading-wrap">
    <div class="pmap-lazy-pill">
      <span class="pmap-lazy-spinner"></span>
      <span class="pmap-lazy-text">{{ text || 'Memuat Peta Provinsi...' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string;
}>();
</script>

<style scoped>
.pmap-lazy-loading-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  z-index: 10;
}

.pmap-lazy-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  background: #ffffff;
  border: 2px solid var(--theme-border, #1a1a2e);
  border-radius: 999px;
  box-shadow: 3px 3px 0 var(--theme-border, #1a1a2e);
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--theme-border, #1a1a2e);
}

.pmap-lazy-spinner {
  width: 14px;
  height: 14px;
  border: 2.5px solid #e2e8f0;
  border-top-color: #f59e0b;
  border-radius: 50%;
  animation: pmap-spin 0.8s linear infinite;
}

@keyframes pmap-spin {
  to { transform: rotate(360deg); }
}
</style>
