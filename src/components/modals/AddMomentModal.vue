<template>
  <Transition name="modal-fade">
    <div class="modal-overlay" @click.self="$emit('close')" role="dialog" aria-modal="true" aria-label="Tambah Momen">
      <div class="modal-box">

        <!-- Handle bar -->
        <div class="handle-bar"></div>

        <div class="modal-header">
          <div class="modal-header-title">
            <div class="header-icon-badge">
              <i class="fa-solid fa-plus"></i>
            </div>
            <div class="header-text">
              <span class="header-eyebrow">PERJALANAN</span>
              <h2>Tambah Momen</h2>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">

          <!-- Judul -->
          <div class="form-group">
            <label for="mom-title">Judul Perjalanan <span class="required">*</span></label>
            <input
              id="mom-title"
              v-model="form.title"
              type="text"
              placeholder="Mis: Liburan ke Bali"
              required
              autocomplete="off"
            />
          </div>

          <!-- Lokasi & Manual Pin -->
          <div class="form-group">
            <div class="form-label-row">
              <label for="mom-location">Lokasi</label>
              <button
                type="button"
                class="btn-pick-pin"
                @click="showLocationPicker = true"
                title="Tentukan titik langsung di peta"
              >
                <i class="fa-solid fa-map-location-dot"></i>
                <span>{{ form.latitude ? 'Ubah Titik Peta' : 'Tentukan Titik di Peta' }}</span>
              </button>
            </div>
            <input
              id="mom-location"
              v-model="form.location"
              type="text"
              placeholder="Mis: Taman VIP, Pamulang, Banten"
              autocomplete="off"
            />
            
            <!-- Pinned Coordinates Badge -->
            <div v-if="form.latitude && form.longitude" class="pinned-coord-badge">
              <div class="coord-info">
                <i class="fa-solid fa-location-crosshairs coord-icon"></i>
                <span class="coord-text">Titik Koordinat: {{ form.latitude.toFixed(5) }}, {{ form.longitude.toFixed(5) }}</span>
              </div>
              <button
                type="button"
                class="btn-remove-coord"
                @click="clearManualLocation"
                title="Hapus koordinat manual"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          <!-- Tanggal & Tahun -->
          <div class="form-row">
            <div class="form-group">
              <label for="mom-date">Tanggal</label>
              <input
                id="mom-date"
                v-model="form.date"
                type="text"
                placeholder="Mis: 15 Januari 2025"
              />
            </div>
            <div class="form-group">
              <label for="mom-year">Tahun <span class="required">*</span></label>
              <input
                id="mom-year"
                v-model.number="form.year"
                type="number"
                :min="2000"
                :max="2100"
                required
              />
            </div>
          </div>

          <!-- Warna Dot -->
          <div class="form-group">
            <label>Warna Penanda</label>
            <div class="color-picker-row">
              <button
                v-for="color in dotColors"
                :key="color"
                type="button"
                class="color-dot"
                :class="{ selected: form.dotColor === color }"
                :style="{ backgroundColor: color }"
                @click="form.dotColor = color"
                :aria-label="`Pilih warna ${color}`"
              ></button>
            </div>
          </div>

          <!-- Map Embed URL -->
          <div class="form-group">
            <label for="mom-map">Embed URL Peta <span class="label-hint">(opsional)</span></label>
            <div class="map-embed-hint">
              <i class="fa-solid fa-circle-info"></i>
              Buka Google Maps → Bagikan → Sematkan peta → salin URL dari <code>src="..."</code>
            </div>
            <textarea
              id="mom-map"
              v-model="form.mapEmbedUrl"
              rows="2"
              placeholder="https://www.google.com/maps/embed?pb=..."
              autocomplete="off"
              spellcheck="false"
            ></textarea>
          </div>

          <!-- Upload Foto (Multi-select) -->
          <div class="form-group">
            <label>Foto Perjalanan <span class="label-hint">(maks. 9 foto)</span></label>
            <div class="file-upload-wrapper">
              <input type="file" id="mom-photo" accept="image/*" multiple @change="handleFileChange" class="file-input" />
              <label for="mom-photo" class="file-label">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <span>{{ selectedFileCount > 0 ? `${selectedFileCount} foto dipilih` : 'Pilih Foto...' }}</span>
              </label>
            </div>
          </div>

          <!-- Error -->
          <div v-if="error" class="form-error">
            <i class="fa-solid fa-triangle-exclamation"></i> {{ error }}
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="$emit('close')">Batal</button>
            <div class="btn-wrapper">
              <div class="btn-shadow"></div>
              <button type="submit" class="btn-submit" :disabled="loading" id="btn-save-moment">
                <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
                <i v-else class="fa-solid fa-floppy-disk"></i>
                {{ loading ? 'Menyimpan...' : 'Simpan Momen' }}
              </button>
            </div>
          </div>

        </form>
        <!-- Photo warning toast — full width below form -->
        <Transition name="photo-warn">
          <div v-if="photoWarning" 
               class="photo-warning-toast"
               :style="isSwiping ? { transform: `translateX(${swipeOffset}px)`, opacity: 1 - Math.abs(swipeOffset)/300, transition: 'none' } : (swipeOffset === 0 ? {} : { transform: `translateX(${swipeOffset}px)` })"
               @touchstart="onTouchStart"
               @touchmove="onTouchMove"
               @touchend="onTouchEnd">
            <div class="toast-content">
              <i class="fa-solid fa-circle-exclamation"></i>
              <span>{{ photoWarning }}</span>
            </div>
            <button type="button" class="btn-dismiss-toast" @click="photoWarning = ''" title="Tutup">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>

  <!-- Location Picker Modal -->
  <LocationPickerModal
    v-if="showLocationPicker"
    :initial-lat="form.latitude"
    :initial-lng="form.longitude"
    :location-name="form.location"
    @close="showLocationPicker = false"
    @select-location="onLocationSelected"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const emit = defineEmits<{
  close: [];
  'moment-added': [data: {
    title: string;
    location: string;
    date: string;
    year: number;
    dotColor: string;
    rtl: boolean;
    mapEmbedUrl: string;
    latitude?: number;
    longitude?: number;
    initialPhoto?: { image: string, localImageId: string };
    additionalPhotos?: Array<{ image: string, localImageId: string }>;
  }];
}>();

import { compressImage, saveLocalImage } from '../../data/imageStore';
import LocationPickerModal from './LocationPickerModal.vue';

const dotColors = [
  '#6f6bd8', // indigo
  '#e66a5c', // red-coral
  '#f97316', // orange
  '#10b981', // emerald
  '#f6b93b', // yellow
  '#ec4899', // pink
];

const form = ref({
  title: '',
  location: '',
  date: '',
  year: new Date().getFullYear(),
  dotColor: '#6f6bd8',
  rtl: false,
  mapEmbedUrl: '',
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
});

const showLocationPicker = ref(false);

function onLocationSelected(coords: { lat: number; lng: number }) {
  form.value.latitude = coords.lat;
  form.value.longitude = coords.lng;
}

function clearManualLocation() {
  form.value.latitude = undefined;
  form.value.longitude = undefined;
}

const loading = ref(false);
const error = ref('');

const MAX_PHOTOS = 9;
const selectedFiles = ref<File[]>([]);
const selectedFileCount = computed(() => selectedFiles.value.length);
const photoWarning = ref('');

// Swipe to dismiss logic
const swipeOffset = ref(0);
const isSwiping = ref(false);
let startX = 0;

function onTouchStart(e: TouchEvent) {
  startX = e.touches[0].clientX;
  isSwiping.value = true;
  swipeOffset.value = 0;
}

function onTouchMove(e: TouchEvent) {
  if (!isSwiping.value) return;
  swipeOffset.value = e.touches[0].clientX - startX;
}

function onTouchEnd() {
  if (!isSwiping.value) return;
  isSwiping.value = false;
  if (Math.abs(swipeOffset.value) > 80) {
    photoWarning.value = ''; // Dismiss
  }
  swipeOffset.value = 0;
}

function showPhotoWarning(msg: string) {
  photoWarning.value = msg;
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const files = Array.from(target.files);
    if (files.length > MAX_PHOTOS) {
      showPhotoWarning(`Maksimal ${MAX_PHOTOS} foto. Hanya ${MAX_PHOTOS} foto pertama yang diambil.`);
      selectedFiles.value = files.slice(0, MAX_PHOTOS);
    } else {
      selectedFiles.value = files;
      photoWarning.value = '';
    }
  } else {
    selectedFiles.value = [];
  }
}

async function handleSubmit() {
  error.value = '';
  if (!form.value.title.trim()) {
    error.value = 'Judul perjalanan tidak boleh kosong.';
    return;
  }
  loading.value = true;
  try {
    // Process all selected photos
    const photos: Array<{ image: string; localImageId: string }> = [];
    for (const file of selectedFiles.value) {
      const { highRes, lowRes } = await compressImage(file);
      const localImageId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await saveLocalImage(localImageId, highRes);
      photos.push({ image: lowRes, localImageId });
    }
    const initialPhoto = photos.length > 0 ? photos[0] : undefined;
    const additionalPhotos = photos.slice(1);

    let cleanMapUrl = form.value.mapEmbedUrl.trim();
    if (cleanMapUrl.toLowerCase().startsWith('<iframe') && cleanMapUrl.includes('src="')) {
      const match = cleanMapUrl.match(/src="([^"]+)"/);
      if (match) {
        cleanMapUrl = match[1];
      }
    }

    const { resolveMomentCoordinates } = await import('../../data/geoResolver');
    const resolved = resolveMomentCoordinates({
      title: form.value.title,
      location: form.value.location,
      mapEmbedUrl: cleanMapUrl,
      latitude: form.value.latitude,
      longitude: form.value.longitude,
    });
    const latitude = resolved.lat;
    const longitude = resolved.lng;

    emit('moment-added', { 
      ...form.value, 
      title: form.value.title.trim(),
      mapEmbedUrl: cleanMapUrl,
      latitude,
      longitude,
      initialPhoto,
      additionalPhotos
    });
    
    // reset form
    form.value = {
      title: '', location: '', date: '',
      year: new Date().getFullYear(),
      dotColor: '#6f6bd8', rtl: false, mapEmbedUrl: '',
      latitude: undefined,
      longitude: undefined,
    };
    selectedFiles.value = [];
  } catch (err: any) {
    console.error('Error adding moment:', err);
    error.value = 'Terjadi kesalahan saat memproses gambar.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 900;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-box {
  background: #fafafa;
  border: 3px solid #101010;
  border-bottom: none;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 540px;
  box-shadow: 0 -5px 0 #101010;
  padding: 12px 24px 40px;
  max-height: 92vh;
  overflow-y: auto;
  scrollbar-width: none;
}

.modal-box::-webkit-scrollbar { display: none; }

.handle-bar {
  width: 40px;
  height: 4px;
  background: #d1d5db;
  border-radius: 99px;
  margin: 0 auto 18px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.modal-header-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon-badge {
  width: 48px;
  height: 48px;
  background: #fef08a;
  border: 2.5px solid #101010;
  box-shadow: 3px 3px 0 #101010;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #101010;
  flex-shrink: 0;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  color: #6f6bd8;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.modal-header h2 {
  font-family: 'Outfit', 'Space Grotesk', sans-serif;
  font-size: 1.35rem;
  font-weight: 900;
  color: #101010;
  margin: 0;
  line-height: 1.1;
}

.close-btn {
  background: none;
  border: 2px solid #e5e7eb;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  color: #6b7280;
  transition: all 0.15s;
}
.close-btn:hover { background: #fef2f2; border-color: #f43f5e; color: #f43f5e; }

.file-upload-wrapper {
  margin-top: 8px;
}
.photo-warning-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ef4444;
  color: #ffffff;
  border-top: 2px solid #101010;
  border-bottom: 2px solid #101010;
  border-radius: 0;
  padding: 7px 14px 7px 20px;
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  /* Break out of .modal-box padding (24px each side) */
  margin: 0 -24px -40px;
  width: calc(100% + 48px);
  box-sizing: border-box;
  justify-content: space-between;
}
.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
}
.photo-warning-toast i { font-size: 0.8rem; flex-shrink: 0; }
.btn-dismiss-toast {
  background: transparent;
  border: none;
  color: #ffffff;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-dismiss-toast:active { transform: scale(0.9); }
.photo-warn-enter-active, .photo-warn-leave-active { transition: all 0.2s ease; }
.photo-warn-enter-from, .photo-warn-leave-to { opacity: 0; transform: translateY(-4px); }
.file-input {
  display: none;
}
.file-label {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f1f5f9;
  border: 2px dashed #94a3b8;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #475569;
  transition: all 0.2s;
}
.file-label:hover {
  background: #e2e8f0;
  border-color: #6f6bd8;
  color: #6f6bd8;
}
.photo-preview {
  margin-top: 12px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #101010;
  max-width: 200px;
}
.photo-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 12px;
}

label {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.required { color: #ef4444; }

.label-hint {
  font-size: 0.68rem;
  color: #9ca3af;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}

.map-embed-hint {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  background: #f0f7ff;
  border: 1px solid #bfdbfe;
  padding: 8px 10px;
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  color: #1e40af;
  line-height: 1.4;
  margin-bottom: 4px;
}
.map-embed-hint i { margin-top: 1px; flex-shrink: 0; }
.map-embed-hint code {
  background: rgba(0,0,0,0.08);
  padding: 0 4px;
  border-radius: 3px;
  font-size: 0.7rem;
}

textarea {
  font-family: 'Inter', monospace;
  font-size: 0.78rem;
  padding: 10px 14px;
  border: 2px solid #101010;
  border-radius: 0;
  background: #ffffff;
  color: #374151;
  outline: none;
  transition: box-shadow 0.15s, border-color 0.15s;
  box-shadow: 3px 3px 0 #101010;
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  line-height: 1.5;
}
textarea:focus {
  border-color: #6f6bd8;
  box-shadow: 4px 4px 0 #6f6bd8;
}


input {
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  padding: 11px 14px;
  border: 2px solid #101010;
  border-radius: 0;
  background: #ffffff;
  color: #101010;
  outline: none;
  transition: box-shadow 0.15s, border-color 0.15s;
  box-shadow: 3px 3px 0 #101010;
  width: 100%;
  box-sizing: border-box;
}

input:focus {
  border-color: #6f6bd8;
  box-shadow: 4px 4px 0 #6f6bd8;
}

.color-picker-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-dot {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
  box-shadow: 2px 2px 0 #101010;
}

.color-dot:hover { transform: scale(1.12); }
.color-dot.selected {
  border-color: #101010;
  transform: scale(1.2);
  box-shadow: 3px 3px 0 #101010;
}

.form-error {
  background: #fef2f2;
  border: 2px solid #f87171;
  color: #b91c1c;
  padding: 10px 14px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 4px;
}

.btn-cancel {
  background: none;
  border: 2px solid #d1d5db;
  padding: 11px 20px;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s;
  border-radius: 0;
}
.btn-cancel:hover { border-color: #101010; color: #101010; }

.btn-wrapper {
  position: relative;
}

.btn-shadow {
  position: absolute;
  top: 4px;
  left: 4px;
  right: -4px;
  bottom: -4px;
  background: #101010;
}

.btn-submit {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #6f6bd8;
  color: #ffffff;
  border: 2px solid #101010;
  padding: 11px 22px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
  letter-spacing: 0.2px;
}
.btn-submit:hover { transform: translate(-2px, -2px); }
.btn-submit:active { transform: translate(2px, 2px); }
.btn-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

/* Transitions */
.modal-fade-enter-active { transition: opacity 0.22s ease; }
.modal-fade-leave-active { transition: opacity 0.18s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.modal-fade-enter-active .modal-box {
  animation: sheet-up 0.28s cubic-bezier(0.34, 1.3, 0.64, 1);
}
.modal-fade-leave-active .modal-box {
  animation: sheet-down 0.18s ease-in forwards;
}

@keyframes sheet-up {
  from { transform: translateY(60%); }
  to   { transform: translateY(0); }
}
@keyframes sheet-down {
  from { transform: translateY(0); }
  to   { transform: translateY(100%); }
}

/* ── Location Pin Picker Styling ───────────────────────────── */
.form-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.form-label-row label {
  margin-bottom: 0;
}
.btn-pick-pin {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fcd34d;
  color: #1a1a2e;
  border: 1.5px solid #1a1a2e;
  border-radius: 6px;
  padding: 3px 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 1.5px 1.5px 0 #1a1a2e;
  transition: transform 0.08s, box-shadow 0.08s;
}
.btn-pick-pin:hover {
  background: #fef08a;
  transform: translate(-1px, -1px);
  box-shadow: 2px 2px 0 #1a1a2e;
}
.btn-pick-pin:active {
  transform: translate(1px, 1px);
  box-shadow: none;
}
.pinned-coord-badge {
  margin-top: 6px;
  background: #f8fafc;
  border: 1.5px solid #1a1a2e;
  border-radius: 8px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  box-shadow: 1.5px 1.5px 0 #1a1a2e;
}
.pinned-coord-badge .coord-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', monospace;
  font-size: 0.72rem;
  font-weight: 600;
  color: #1a1a2e;
}
.pinned-coord-badge .coord-icon {
  color: #d97706;
  font-size: 0.8rem;
}
.btn-remove-coord {
  background: #fee2e2;
  border: 1px solid #ef4444;
  color: #dc2626;
  border-radius: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  cursor: pointer;
  transition: transform 0.08s;
}
.btn-remove-coord:hover {
  transform: scale(1.1);
  background: #fca5a5;
}
</style>
