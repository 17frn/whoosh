<template>
  <div class="rencana-category-panel">
    <!-- Sub-tab Switcher: Bucket List & Our Places -->
    <div class="rencana-subtabs-row">
      <button
        class="subtab-btn"
        :class="{ 'is-active': activeSubtab === 'bucket' }"
        @click="activeSubtab = 'bucket'"
      >
        <i class="fa-solid fa-list-check"></i>
        <span>Bucket List</span>
      </button>
      <button
        class="subtab-btn"
        :class="{ 'is-active': activeSubtab === 'places' }"
        @click="activeSubtab = 'places'"
      >
        <i class="fa-solid fa-map-pin"></i>
        <span>Tempat Impian</span>
      </button>
    </div>

    <!-- ── SUBTAB 1: BUCKET LIST ────────────────────────────────────── -->
    <div v-if="activeSubtab === 'bucket'" class="bucket-subtab-content">
      <div class="subtab-action-bar">
        <span class="subtab-desc">Daftar impian dan kegiatan yang ingin diwujudkan bersama.</span>
        <button class="add-action-btn" @click="showAddBucketModal = true">
          <i class="fa-solid fa-plus"></i>
          <span>Tambah Wish</span>
        </button>
      </div>

      <div class="bucket-list-cards">
        <div
          v-for="item in bucketList"
          :key="item.id"
          class="bucket-item-card"
          :class="`status-${item.status}`"
        >
          <!-- Status Checkbox Icon -->
          <button
            class="bucket-status-toggle-btn"
            @click="toggleNextStatus(item)"
            :title="`Ubah status: ${getStatusLabel(item.status)}`"
          >
            <i class="fa-solid" :class="getStatusIcon(item.status)"></i>
          </button>

          <!-- Bucket Item Info -->
          <div class="bucket-details">
            <h4 class="bucket-title" :class="{ 'is-done': item.status === 'completed' }">
              {{ item.title }}
            </h4>
            <p class="bucket-desc">{{ item.description }}</p>
            <div class="bucket-meta-row">
              <span v-if="item.location" class="bucket-location">
                <i class="fa-solid fa-location-dot"></i>
                {{ item.location }}
              </span>
              <span class="bucket-status-pill" :class="item.status">
                {{ getStatusLabel(item.status) }}
              </span>
            </div>
          </div>

          <!-- Delete Action -->
          <button
            class="item-delete-btn"
            @click="confirmDeleteBucket(item.id, item.title)"
            title="Hapus impian"
          >
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- ── SUBTAB 2: OUR PLACES ─────────────────────────────────────── -->
    <div v-else class="places-subtab-content">
      <div class="subtab-action-bar">
        <span class="subtab-desc">Peta jejak tempat bersejarah & destinasi impian.</span>
        <button class="add-action-btn" @click="showAddPlaceModal = true">
          <i class="fa-solid fa-plus"></i>
          <span>Tambah Tempat</span>
        </button>
      </div>

      <div class="places-list">
        <div
          v-for="place in places"
          :key="place.id"
          class="place-item-card"
          :class="{ 'is-visited': place.visited }"
        >
          <div class="place-icon-circle" :class="{ 'is-visited': place.visited }">
            <i class="fa-solid" :class="place.visited ? 'fa-circle-check' : 'fa-compass'"></i>
          </div>

          <div class="place-details">
            <div class="place-title-row">
              <h4 class="place-name">{{ place.name }}</h4>
              <span class="place-visited-badge" :class="{ 'is-visited': place.visited }">
                {{ place.visited ? 'Sudah Dikunjungi' : 'Rencana Trip' }}
              </span>
            </div>
            <span class="place-location-label">
              <i class="fa-solid fa-map-marker-alt"></i>
              {{ place.locationName }}
            </span>
            <p v-if="place.notes" class="place-notes">{{ place.notes }}</p>
          </div>

          <button
            class="place-check-action-btn"
            @click="toggleVisitedPlace(place.id)"
            :title="place.visited ? 'Tandai belum dikunjungi' : 'Tandai sudah dikunjungi'"
          >
            <i class="fa-solid fa-check"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Bucket Modal -->
    <Teleport to="body">
      <div v-if="showAddBucketModal" class="rencana-modal-overlay" @click="showAddBucketModal = false">
        <div class="rencana-modal-card" @click.stop role="dialog" aria-modal="true">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <i class="fa-solid fa-list-check modal-icon"></i>
              <h3 class="modal-title">Tambah Bucket List</h3>
            </div>
            <button class="modal-close-btn" @click="showAddBucketModal = false">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form class="modal-form" @submit.prevent="submitBucket">
            <div class="form-group">
              <label class="form-label" for="bucket-title-input">Nama Rencana / Impian</label>
              <input
                id="bucket-title-input"
                v-model="newBucketTitle"
                type="text"
                class="form-input"
                placeholder="Misal: Piknik sore di taman..."
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="bucket-desc-input">Detail Rencana</label>
              <textarea
                id="bucket-desc-input"
                v-model="newBucketDesc"
                class="form-textarea"
                rows="3"
                placeholder="Misal: Siapkan bekal camilan dan buku bacaan..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="bucket-loc-input">Lokasi (Opsional)</label>
              <input
                id="bucket-loc-input"
                v-model="newBucketLoc"
                type="text"
                class="form-input"
                placeholder="Misal: Bandung..."
              />
            </div>

            <button type="submit" class="submit-btn">
              <i class="fa-solid fa-check"></i>
              Simpan ke Bucket List
            </button>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Add Place Modal -->
    <Teleport to="body">
      <div v-if="showAddPlaceModal" class="rencana-modal-overlay" @click="showAddPlaceModal = false">
        <div class="rencana-modal-card" @click.stop role="dialog" aria-modal="true">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <i class="fa-solid fa-map-pin modal-icon"></i>
              <h3 class="modal-title">Tambah Tempat Spesial</h3>
            </div>
            <button class="modal-close-btn" @click="showAddPlaceModal = false">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form class="modal-form" @submit.prevent="submitPlace">
            <div class="form-group">
              <label class="form-label" for="place-name-input">Nama Tempat</label>
              <input
                id="place-name-input"
                v-model="newPlaceName"
                type="text"
                class="form-input"
                placeholder="Misal: Kafe Kopi Kenangan..."
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="place-loc-input">Kota / Area</label>
              <input
                id="place-loc-input"
                v-model="newPlaceLoc"
                type="text"
                class="form-input"
                placeholder="Misal: Dago, Bandung..."
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="place-notes-input">Kenapa Tempat Ini Berarti?</label>
              <textarea
                id="place-notes-input"
                v-model="newPlaceNotes"
                class="form-textarea"
                rows="3"
                placeholder="Catatan kecil kenapa ingin ke sini..."
              ></textarea>
            </div>

            <button type="submit" class="submit-btn">
              <i class="fa-solid fa-check"></i>
              Simpan Tempat
            </button>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRuangKita, type BucketItem } from '../../data/ruangKitaStore';

const { data, addBucketItem, updateBucketStatus, deleteBucketItem, addOurPlace, toggleVisitedPlace } = useRuangKita();
const bucketList = data.value.bucketList;
const places = data.value.places;

const activeSubtab = ref<'bucket' | 'places'>('bucket');

// Bucket Modal
const showAddBucketModal = ref(false);
const newBucketTitle = ref('');
const newBucketDesc = ref('');
const newBucketLoc = ref('');

function submitBucket() {
  if (!newBucketTitle.value.trim()) return;
  addBucketItem({
    title: newBucketTitle.value.trim(),
    description: newBucketDesc.value.trim(),
    location: newBucketLoc.value.trim() || undefined,
    status: 'planned',
  });
  showAddBucketModal.value = false;
  newBucketTitle.value = '';
  newBucketDesc.value = '';
  newBucketLoc.value = '';
}

function toggleNextStatus(item: BucketItem) {
  if (item.status === 'planned') {
    updateBucketStatus(item.id, 'in_progress');
  } else if (item.status === 'in_progress') {
    updateBucketStatus(item.id, 'completed');
  } else {
    updateBucketStatus(item.id, 'planned');
  }
}

function confirmDeleteBucket(id: string, title: string) {
  if (confirm(`Hapus rencana "${title}"?`)) {
    deleteBucketItem(id);
  }
}

function getStatusIcon(status: BucketItem['status']): string {
  switch (status) {
    case 'completed': return 'fa-circle-check';
    case 'in_progress': return 'fa-spinner';
    default: return 'fa-circle';
  }
}

function getStatusLabel(status: BucketItem['status']): string {
  switch (status) {
    case 'completed': return 'Selesai Dilakukan';
    case 'in_progress': return 'Sedang Berjalan';
    default: return 'Direncanakan';
  }
}

// Places Modal
const showAddPlaceModal = ref(false);
const newPlaceName = ref('');
const newPlaceLoc = ref('');
const newPlaceNotes = ref('');

function submitPlace() {
  if (!newPlaceName.value.trim()) return;
  addOurPlace({
    name: newPlaceName.value.trim(),
    locationName: newPlaceLoc.value.trim() || 'Indonesia',
    lat: -6.9175,
    lng: 107.6191,
    notes: newPlaceNotes.value.trim(),
    visited: false,
  });
  showAddPlaceModal.value = false;
  newPlaceName.value = '';
  newPlaceLoc.value = '';
  newPlaceNotes.value = '';
}
</script>

<style scoped>
.rencana-category-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Subtab Switcher ────────────────────────────────────────────── */
.rencana-subtabs-row {
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

/* ── Bucket List Cards ──────────────────────────────────────────── */
.bucket-list-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bucket-item-card {
  display: flex;
  align-items: flex-start;
  padding: 12px 14px;
  background: var(--theme-surface, #ffffff);
  border: 1.5px solid var(--theme-border, #101010);
  border-radius: 12px;
  box-shadow: 3px 3px 0 var(--theme-border, #101010);
  gap: 12px;
  transition: transform 0.15s ease;
}

.bucket-status-toggle-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--theme-accent, #756ce0);
  cursor: pointer;
  padding: 2px;
  margin-top: 2px;
}

.status-completed .bucket-status-toggle-btn {
  color: #10b981;
}

.status-in_progress .bucket-status-toggle-btn {
  color: #f59e0b;
}

.bucket-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.bucket-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--theme-text, #101010);
  margin: 0;
  line-height: 1.3;
}

.bucket-title.is-done {
  text-decoration: line-through;
  color: #a1a1aa;
}

.bucket-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: var(--theme-text-muted, #71717a);
  margin: 0;
  line-height: 1.4;
}

.bucket-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.bucket-location {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--theme-text-muted, #71717a);
  display: flex;
  align-items: center;
  gap: 3px;
}

.bucket-status-pill {
  font-family: 'Inter', sans-serif;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid var(--theme-border-light, #eae8fc);
}

.bucket-status-pill.planned {
  background: #f4f4f5;
  color: #71717a;
}

.bucket-status-pill.in_progress {
  background: #fef3c7;
  color: #b45309;
  border-color: #fde68a;
}

.bucket-status-pill.completed {
  background: #d1fae5;
  color: #065f46;
  border-color: #a7f3d0;
}

.item-delete-btn {
  background: none;
  border: none;
  font-size: 0.78rem;
  color: #a1a1aa;
  cursor: pointer;
  padding: 2px;
}

.item-delete-btn:hover {
  color: #ef4444;
}

/* ── Our Places List ────────────────────────────────────────────── */
.places-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.place-item-card {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: var(--theme-surface, #ffffff);
  border: 1.5px solid var(--theme-border, #101010);
  border-radius: 12px;
  box-shadow: 3px 3px 0 var(--theme-border, #101010);
  gap: 12px;
}

.place-icon-circle {
  width: 40px;
  height: 40px;
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

.place-icon-circle.is-visited {
  background: #d1fae5;
  color: #059669;
}

.place-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.place-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.place-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--theme-text, #101010);
  margin: 0;
}

.place-visited-badge {
  font-family: 'Inter', sans-serif;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  background: #f4f4f5;
  color: #71717a;
}

.place-visited-badge.is-visited {
  background: #d1fae5;
  color: #065f46;
}

.place-location-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  color: var(--theme-text-muted, #71717a);
  display: flex;
  align-items: center;
  gap: 4px;
}

.place-notes {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  color: var(--theme-text-muted, #71717a);
  margin: 3px 0 0;
}

.place-check-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid var(--theme-border, #101010);
  background: var(--theme-surface-2, #f8f8fc);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #71717a;
  cursor: pointer;
  transition: all 0.15s ease;
}

.is-visited .place-check-action-btn {
  background: #10b981;
  color: #ffffff;
}

/* ── Modal Common Styles ────────────────────────────────────────── */
.rencana-modal-overlay {
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

.rencana-modal-card {
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

.form-input,
.form-textarea {
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

