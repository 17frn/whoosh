<template>
  <div class="kenangan-category-panel">
    <!-- Sub-tab Switcher: Foto Spesial & Tanggal Penting -->
    <div class="kenangan-subtabs-row">
      <button
        class="subtab-btn"
        :class="{ 'is-active': activeSubtab === 'photos' }"
        @click="activeSubtab = 'photos'"
      >
        <i class="fa-solid fa-camera-retro"></i>
        <span>Foto Spesial</span>
      </button>
      <button
        class="subtab-btn"
        :class="{ 'is-active': activeSubtab === 'dates' }"
        @click="activeSubtab = 'dates'"
      >
        <i class="fa-solid fa-calendar-star"></i>
        <span>Hari Penting</span>
      </button>
    </div>

    <!-- ── SUBTAB 1: FOTO SPESIAL (Polaroid Scrapbook Gallery) ──────── -->
    <div v-if="activeSubtab === 'photos'" class="photos-subtab-content">
      <div class="subtab-action-bar">
        <span class="subtab-desc">Galeri foto berdua berbingkai Polaroid.</span>
        <button class="add-action-btn" @click="showAddPhotoModal = true">
          <i class="fa-solid fa-plus"></i>
          <span>Tambah Foto</span>
        </button>
      </div>

      <div class="polaroid-gallery-grid">
        <div
          v-for="(photo, idx) in photos"
          :key="photo.id"
          class="polaroid-scrap-card"
          :class="`tilt-${(idx % 2) + 1}`"
        >
          <!-- Mini Paper Clip -->
          <div class="mini-paper-clip" aria-hidden="true">
            <i class="fa-solid fa-paperclip"></i>
          </div>

          <div class="polaroid-img-frame">
            <img :src="photo.imageUrl" :alt="photo.caption" class="polaroid-img" loading="lazy" />
          </div>

          <div class="polaroid-caption-box">
            <p class="polaroid-text">{{ photo.caption }}</p>
            <div class="polaroid-meta-row">
              <span class="polaroid-date">
                <i class="fa-regular fa-clock"></i>
                {{ photo.date }}
              </span>
              <button
                class="photo-fav-btn"
                :class="{ 'is-active': photo.isFavorite }"
                @click="photo.isFavorite = !photo.isFavorite"
                title="Favorit"
              >
                <i class="fa-solid fa-heart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── SUBTAB 2: TANGGAL PENTING (Milestones & Countdown) ────────── -->
    <div v-else class="dates-subtab-content">
      <div class="subtab-action-bar">
        <span class="subtab-desc">Momen istimewa dan hitung mundur hari bersama.</span>
        <button class="add-action-btn" @click="showAddDateModal = true">
          <i class="fa-solid fa-plus"></i>
          <span>Tambah Tanggal</span>
        </button>
      </div>

      <div class="dates-list">
        <div
          v-for="item in dates"
          :key="item.id"
          class="important-date-card"
          :class="`type-${item.type}`"
        >
          <div class="date-card-left">
            <div class="date-badge-circle">
              <i class="fa-solid" :class="getDateIcon(item.type)"></i>
            </div>
            <div class="date-details">
              <h4 class="date-title">{{ item.title }}</h4>
              <p class="date-desc">{{ item.description }}</p>
              <span class="date-formatted">
                <i class="fa-regular fa-calendar-check"></i>
                {{ formatIndoDate(item.date) }}
              </span>
            </div>
          </div>

          <div class="date-card-right">
            <div class="countdown-badge">
              <span class="countdown-number">{{ getCountdownDays(item.date).days }}</span>
              <span class="countdown-label">{{ getCountdownDays(item.date).label }}</span>
            </div>
            <button
              class="date-delete-btn"
              @click="confirmDeleteDate(item.id, item.title)"
              title="Hapus tanggal"
            >
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Photo Modal -->
    <Teleport to="body">
      <div v-if="showAddPhotoModal" class="kenangan-modal-overlay" @click="showAddPhotoModal = false">
        <div class="kenangan-modal-card" @click.stop role="dialog" aria-modal="true">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <i class="fa-solid fa-camera-retro modal-icon"></i>
              <h3 class="modal-title">Simpan Foto Polaroid</h3>
            </div>
            <button class="modal-close-btn" @click="showAddPhotoModal = false">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form class="modal-form" @submit.prevent="submitPhoto">
            <div class="form-group">
              <label class="form-label" for="photo-caption-input">Keterangan Foto</label>
              <input
                id="photo-caption-input"
                v-model="newPhotoCaption"
                type="text"
                class="form-input"
                placeholder="Misal: Senja di stasiun..."
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="photo-date-input">Tanggal Momen</label>
              <input
                id="photo-date-input"
                v-model="newPhotoDate"
                type="text"
                class="form-input"
                placeholder="Misal: 7 November 2026"
                required
              />
            </div>

            <button type="submit" class="submit-btn">
              <i class="fa-solid fa-check"></i>
              Simpan Foto
            </button>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Add Date Modal -->
    <Teleport to="body">
      <div v-if="showAddDateModal" class="kenangan-modal-overlay" @click="showAddDateModal = false">
        <div class="kenangan-modal-card" @click.stop role="dialog" aria-modal="true">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <i class="fa-solid fa-calendar-plus modal-icon"></i>
              <h3 class="modal-title">Tambah Tanggal Penting</h3>
            </div>
            <button class="modal-close-btn" @click="showAddDateModal = false">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form class="modal-form" @submit.prevent="submitDate">
            <div class="form-group">
              <label class="form-label" for="date-title-input">Nama Momen</label>
              <input
                id="date-title-input"
                v-model="newDateTitle"
                type="text"
                class="form-input"
                placeholder="Misal: Hari Ulang Tahun..."
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="date-val-input">Pilih Tanggal</label>
              <input
                id="date-val-input"
                v-model="newDateVal"
                type="date"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="date-desc-input">Catatan / Harapan</label>
              <input
                id="date-desc-input"
                v-model="newDateDesc"
                type="text"
                class="form-input"
                placeholder="Misal: Rayakan bersama di tempat favorit..."
              />
            </div>

            <button type="submit" class="submit-btn">
              <i class="fa-solid fa-check"></i>
              Simpan Tanggal
            </button>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRuangKita, type ImportantDate } from '../../data/ruangKitaStore';

const { data, addImportantDate, deleteImportantDate } = useRuangKita();
const photos = data.value.photos;
const dates = data.value.dates;

const activeSubtab = ref<'photos' | 'dates'>('photos');

// Photo Modal
const showAddPhotoModal = ref(false);
const newPhotoCaption = ref('');
const newPhotoDate = ref('');

function submitPhoto() {
  if (!newPhotoCaption.value.trim()) return;
  photos.unshift({
    id: `photo-${Date.now()}`,
    imageUrl: '/whoosh-icon.jpg',
    caption: newPhotoCaption.value.trim(),
    date: newPhotoDate.value.trim() || 'Baru saja',
    author: 'partnerA',
    isFavorite: false,
  });
  showAddPhotoModal.value = false;
  newPhotoCaption.value = '';
  newPhotoDate.value = '';
}

// Date Modal
const showAddDateModal = ref(false);
const newDateTitle = ref('');
const newDateVal = ref('');
const newDateDesc = ref('');

function submitDate() {
  if (!newDateTitle.value.trim() || !newDateVal.value) return;
  addImportantDate({
    title: newDateTitle.value.trim(),
    date: newDateVal.value,
    description: newDateDesc.value.trim() || 'Momen spesial kita berdua.',
    type: 'custom',
  });
  showAddDateModal.value = false;
  newDateTitle.value = '';
  newDateVal.value = '';
  newDateDesc.value = '';
}

function confirmDeleteDate(id: string, title: string) {
  if (confirm(`Hapus tanggal penting "${title}"?`)) {
    deleteImportantDate(id);
  }
}

function getDateIcon(type: ImportantDate['type']): string {
  switch (type) {
    case 'anniversary': return 'fa-heart';
    case 'birthday': return 'fa-cake-candles';
    case 'milestone': return 'fa-flag-checkered';
    default: return 'fa-calendar-check';
  }
}

function formatIndoDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getCountdownDays(dateStr: string): { days: number; label: string } {
  try {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = target - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days > 0) {
      return { days, label: 'Hari Lagi' };
    } else if (days === 0) {
      return { days: 0, label: 'Hari Ini!' };
    } else {
      return { days: Math.abs(days), label: 'Hari Terlewati' };
    }
  } catch {
    return { days: 0, label: 'Hari' };
  }
}
</script>

<style scoped>
.kenangan-category-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Subtab Switcher ────────────────────────────────────────────── */
.kenangan-subtabs-row {
  display: flex;
  background: var(--theme-surface-2, #f8f8fc);
  border: 1.5px solid var(--theme-border, #101010);
  border-radius: 10px;
  padding: 3px;
  gap: 4px;
}

.subtab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--theme-text-muted, #71717a);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.subtab-btn.is-active {
  background: var(--theme-surface, #ffffff);
  color: var(--theme-text, #101010);
  box-shadow: 1.5px 1.5px 0 var(--theme-border, #101010);
  border: 1px solid var(--theme-border, #101010);
}

.subtab-btn.is-active i {
  color: var(--theme-accent, #756ce0);
}

.subtab-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 2px;
}

.subtab-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  color: var(--theme-text-muted, #71717a);
}

.add-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--theme-accent, #756ce0);
  color: #ffffff;
  border: 1.5px solid var(--theme-border, #101010);
  border-radius: 8px;
  padding: 6px 12px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

/* ── Polaroid Gallery ───────────────────────────────────────────── */
.polaroid-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
}

.polaroid-scrap-card {
  background: #ffffff;
  border: 1.5px solid var(--theme-border, #101010);
  border-radius: 4px;
  padding: 8px 8px 10px;
  box-shadow: 3px 3px 0 var(--theme-border, #101010);
  position: relative;
  transition: transform 0.2s ease;
}

.tilt-1 { transform: rotate(-1deg); }
.tilt-2 { transform: rotate(1.2deg); }

.polaroid-scrap-card:hover {
  transform: translateY(-2px) rotate(0deg);
}

.mini-paper-clip {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  color: #64748b;
  font-size: 1rem;
  z-index: 2;
}

.polaroid-img-frame {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #f4f4f5;
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border-radius: 2px;
}

.polaroid-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.polaroid-caption-box {
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.polaroid-text {
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: #18181b;
  margin: 0;
  line-height: 1.25;
}

.polaroid-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.polaroid-date {
  font-family: 'Inter', sans-serif;
  font-size: 0.62rem;
  color: #71717a;
  display: flex;
  align-items: center;
  gap: 3px;
}

.photo-fav-btn {
  background: none;
  border: none;
  font-size: 0.75rem;
  color: #d1d5db;
  cursor: pointer;
  padding: 2px;
}

.photo-fav-btn.is-active {
  color: #ef4444;
}

/* ── Important Dates List ───────────────────────────────────────── */
.dates-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.important-date-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: var(--theme-surface, #ffffff);
  border: 1.5px solid var(--theme-border, #101010);
  border-radius: 12px;
  box-shadow: 3px 3px 0 var(--theme-border, #101010);
  gap: 12px;
}

.date-card-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.date-badge-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--theme-accent-light, #eae8fc);
  border: 1.5px solid var(--theme-border, #101010);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-accent, #756ce0);
  font-size: 1.1rem;
  flex-shrink: 0;
}

.type-anniversary .date-badge-circle {
  background: #fee2e2;
  color: #ef4444;
}

.type-birthday .date-badge-circle {
  background: #fef3c7;
  color: #d97706;
}

.date-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--theme-text, #101010);
  margin: 0;
}

.date-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  color: var(--theme-text-muted, #71717a);
  margin: 0;
}

.date-formatted {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--theme-accent, #756ce0);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.date-card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.countdown-badge {
  background: var(--theme-surface-2, #f8f8fc);
  border: 1px solid var(--theme-border-light, #eae8fc);
  border-radius: 8px;
  padding: 4px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 58px;
}

.countdown-number {
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--theme-text, #101010);
  line-height: 1;
}

.countdown-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.58rem;
  font-weight: 700;
  color: var(--theme-text-muted, #71717a);
}

.date-delete-btn {
  background: none;
  border: none;
  font-size: 0.75rem;
  color: #a1a1aa;
  cursor: pointer;
  padding: 2px;
}

.date-delete-btn:hover {
  color: #ef4444;
}

/* ── Modal Common Styles ────────────────────────────────────────── */
.kenangan-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.kenangan-modal-card {
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border: 2px solid var(--theme-border, #101010);
  border-radius: 16px;
  box-shadow: 5px 5px 0 var(--theme-border, #101010);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1.5px solid var(--theme-border, #101010);
  padding-bottom: 10px;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-icon {
  font-size: 1.2rem;
  color: var(--theme-accent, #756ce0);
}

.modal-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0;
  color: #101010;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #71717a;
  cursor: pointer;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  color: #101010;
}

.form-input {
  width: 100%;
  border-radius: 8px;
  border: 1.5px solid var(--theme-border, #101010);
  background: #ffffff;
  padding: 8px 12px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #101010;
  box-sizing: border-box;
  outline: none;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: var(--theme-accent, #756ce0);
  color: #ffffff;
  border: 2px solid var(--theme-border, #101010);
  border-radius: 10px;
  box-shadow: 2px 2px 0 var(--theme-border, #101010);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}

.submit-btn:active {
  transform: translate(1px, 1px);
  box-shadow: none;
}
</style>

