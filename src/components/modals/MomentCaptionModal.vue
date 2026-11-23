<template>
  <Teleport to="body">
    <Transition name="caption-modal-fade">
      <div class="caption-modal-backdrop" @click.self="$emit('close')">
        <div class="caption-modal-sheet" role="dialog" aria-modal="true" aria-label="Kelola Caption Foto">
          
          <!-- Sheet Header -->
          <div class="caption-sheet-header">
            <div class="caption-header-left">
              <div class="caption-header-icon">
                <i class="fa-solid fa-comment-dots"></i>
              </div>
              <div>
                <h3 class="caption-header-title">Caption Foto Momen</h3>
                <p class="caption-header-sub">{{ moment.title }} &bull; {{ localMoments.length }} Foto</p>
              </div>
            </div>
          </div>

          <!-- Sheet Body: Photos List -->
          <div class="caption-sheet-body">
            <div v-if="localMoments.length === 0" class="caption-empty-state">
              <i class="fa-regular fa-image"></i>
              <p>Momen ini belum memiliki foto.</p>
            </div>

            <div
              v-for="(photo, index) in localMoments"
              :key="index"
              class="caption-photo-card"
            >
              <!-- Photo Thumbnail -->
              <div class="photo-thumb-col">
                <img :src="photo.image" :alt="photo.title || `Foto ${index + 1}`" class="photo-thumb-img" />
                <span class="photo-index-badge">#{{ index + 1 }}</span>
              </div>

              <!-- Inputs Column -->
              <div class="photo-inputs-col">
                <div class="photo-input-group">
                  <label class="photo-input-label">
                    <span>Judul Foto (Opsional)</span>
                  </label>
                  <input
                    v-model="photo.title"
                    type="text"
                    class="photo-title-input"
                    placeholder="Mis: Foto Utama / Bersama Teman"
                    autocomplete="off"
                  />
                </div>

                <div class="photo-input-group">
                  <div class="photo-label-row">
                    <label class="photo-input-label">Caption / Cerita</label>
                    <button
                      v-if="photo.description"
                      type="button"
                      class="btn-clear-caption"
                      @click="photo.description = ''"
                      title="Hapus caption"
                    >
                      <i class="fa-solid fa-trash-can"></i> Hapus Caption
                    </button>
                  </div>
                  <textarea
                    v-model="photo.description"
                    class="photo-desc-textarea"
                    rows="2"
                    placeholder="Tuliskan cerita menarik atau keterangan foto ini..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Sheet Footer: Actions -->
          <div class="caption-sheet-footer">
            <button type="button" class="btn-caption-cancel" @click="$emit('close')">
              Batal
            </button>
            <button type="button" class="btn-caption-save" @click="handleSave" :disabled="isSaving">
              <i class="fa-solid fa-check"></i>
              <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Caption' }}</span>
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import type { TimelineData, TimelineMoment } from '../../data/timeline';
import { registerBackHandler, unregisterBackHandler } from '../../composables/useBackButton';

const props = defineProps<{
  moment: TimelineData;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save-captions', payload: { id: string; moments: TimelineMoment[] }): void;
}>();

// Deep copy moments array for isolated editing
const localMoments = ref<TimelineMoment[]>(
  JSON.parse(JSON.stringify(props.moment.moments || []))
);

const isSaving = ref(false);

function handleSave() {
  isSaving.value = true;
  emit('save-captions', {
    id: props.moment.id,
    moments: localMoments.value,
  });
  setTimeout(() => {
    isSaving.value = false;
    emit('close');
  }, 100);
}

onMounted(() => {
  registerBackHandler('moment-caption-modal', () => {
    emit('close');
    return true;
  });
});

onBeforeUnmount(() => {
  unregisterBackHandler('moment-caption-modal');
});
</script>

<style scoped>
.caption-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99990;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
}

@media (min-width: 640px) {
  .caption-modal-backdrop {
    align-items: center;
    padding: 20px;
  }
}

.caption-modal-sheet {
  width: 100%;
  max-width: 580px;
  max-height: 88dvh;
  background: #ffffff;
  border: 2px solid #1a1a2e;
  border-top-left-radius: 22px;
  border-top-right-radius: 22px;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.2), 6px 6px 0 #1a1a2e;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (min-width: 640px) {
  .caption-modal-sheet {
    border-radius: 20px;
  }
}

@keyframes slide-up {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Header */
.caption-sheet-header {
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 2px solid #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.caption-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.caption-header-icon {
  width: 42px;
  height: 42px;
  background: #38bdf8;
  border: 2px solid #1a1a2e;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  color: #1a1a2e;
  box-shadow: 2px 2px 0 #1a1a2e;
}

.caption-header-title {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  color: #1a1a2e;
}

.caption-header-sub {
  margin: 2px 0 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

/* Body */
.caption-sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  -webkit-overflow-scrolling: touch;
}

.caption-empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.caption-empty-state i {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.caption-photo-card {
  display: flex;
  gap: 14px;
  padding: 14px;
  background: #ffffff;
  border: 2px solid #1a1a2e;
  border-radius: 14px;
  box-shadow: 3px 3px 0 #1a1a2e;
}

.photo-thumb-col {
  position: relative;
  width: 90px;
  height: 90px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1.5px solid #1a1a2e;
  background: #0f172a;
}

.photo-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-index-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(26, 26, 46, 0.85);
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 6px;
}

.photo-inputs-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.photo-input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.photo-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.photo-input-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.btn-clear-caption {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-clear-caption:hover {
  text-decoration: underline;
}

.photo-title-input {
  width: 100%;
  padding: 6px 10px;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  color: #1a1a2e;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.photo-title-input:focus {
  border-color: #1a1a2e;
  background: #f8fafc;
}

.photo-desc-textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  color: #1a1a2e;
  outline: none;
  resize: vertical;
  min-height: 54px;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.photo-desc-textarea:focus {
  border-color: #1a1a2e;
  background: #f8fafc;
}

/* Footer */
.caption-sheet-footer {
  padding: 14px 20px;
  background: #f8fafc;
  border-top: 2px solid #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));
}

.btn-caption-cancel {
  padding: 10px 18px;
  background: #ffffff;
  border: 2px solid #1a1a2e;
  border-radius: 10px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  color: #64748b;
  cursor: pointer;
  box-shadow: 2px 2px 0 #1a1a2e;
  transition: all 0.1s;
}

.btn-caption-cancel:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 #1a1a2e;
}

.btn-caption-save {
  padding: 10px 22px;
  background: #ffdd00;
  border: 2px solid #1a1a2e;
  border-radius: 10px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  color: #1a1a2e;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 3px 3px 0 #1a1a2e;
  transition: all 0.1s;
}

.btn-caption-save:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 #1a1a2e;
}

/* Transitions */
.caption-modal-fade-enter-active,
.caption-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.caption-modal-fade-enter-from,
.caption-modal-fade-leave-to {
  opacity: 0;
}
</style>
