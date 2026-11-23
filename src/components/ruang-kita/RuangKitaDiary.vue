<template>
  <div class="diary-category-panel">
    <!-- Header Action Row: Title & "Tulis Catatan" Button -->
    <div class="diary-action-bar">
      <div class="section-title-wrap">
        <h3 class="panel-section-title">
          <i class="fa-solid fa-book-bookmark"></i>
          Catatan & Surat Bersama
        </h3>
        <p class="panel-section-sub">Ruang menulis rahasia dan kenangan kata berdua.</p>
      </div>

      <button class="add-note-btn" @click="openCreateModal">
        <i class="fa-solid fa-pen-nib"></i>
        <span>Tulis Surat</span>
      </button>
    </div>

    <!-- Notes Masonry / List -->
    <div v-if="notes.length > 0" class="diary-notes-grid">
      <div
        v-for="note in notes"
        :key="note.id"
        class="scrapbook-note-card"
        :class="`paper-${note.paperColor || 'cream'}`"
      >
        <!-- Washi Tape Accent at Top -->
        <div class="washi-tape-strip" aria-hidden="true"></div>

        <!-- Note Header: Author & Actions -->
        <div class="note-card-header">
          <div class="author-badge" :class="note.author">
            <i class="fa-solid fa-feather-pointed"></i>
            <span>{{ note.authorName }}</span>
          </div>
          <div class="note-actions">
            <button
              class="note-fav-btn"
              :class="{ 'is-active': note.isFavorite }"
              @click="toggleFavoriteNote(note.id)"
              :title="note.isFavorite ? 'Hapus favorit' : 'Tandai favorit'"
            >
              <i class="fa-solid fa-star"></i>
            </button>
            <button
              class="note-delete-btn"
              @click="confirmDeleteNote(note.id, note.title)"
              title="Hapus catatan"
            >
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>

        <!-- Note Title & Content -->
        <h4 class="note-title">{{ note.title }}</h4>
        <p class="note-body">{{ note.content }}</p>

        <!-- Note Footer: Date -->
        <div class="note-card-footer">
          <span class="note-date">
            <i class="fa-regular fa-calendar"></i>
            {{ formatDate(note.createdAt) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="diary-empty-card">
      <i class="fa-solid fa-book-open empty-icon"></i>
      <h4 class="empty-title">Belum ada catatan bersama</h4>
      <p class="empty-desc">Tuliskan pesan pertama atau kenangan manis untuk mengawali diary ini.</p>
      <button class="empty-add-btn" @click="openCreateModal">
        <i class="fa-solid fa-plus"></i>
        Tulis Catatan Sekarang
      </button>
    </div>

    <!-- Create Note Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="note-modal-overlay" @click="showCreateModal = false">
        <div class="note-modal-card" @click.stop role="dialog" aria-modal="true">
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="modal-title-wrap">
              <i class="fa-solid fa-envelope-open-text modal-icon"></i>
              <h3 class="modal-title">Tulis Surat Baru</h3>
            </div>
            <button class="modal-close-btn" @click="showCreateModal = false">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Note Form -->
          <form class="note-form" @submit.prevent="submitNewNote">
            <div class="form-group">
              <label class="form-label">Penulis</label>
              <div class="author-toggle-row">
                <button
                  type="button"
                  class="author-opt-btn"
                  :class="{ 'is-selected': formAuthor === 'partnerA' }"
                  @click="formAuthor = 'partnerA'"
                >
                  <i class="fa-solid fa-user"></i>
                  {{ data.partnerA.name }}
                </button>
                <button
                  type="button"
                  class="author-opt-btn"
                  :class="{ 'is-selected': formAuthor === 'partnerB' }"
                  @click="formAuthor = 'partnerB'"
                >
                  <i class="fa-solid fa-user"></i>
                  {{ data.partnerB.name }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="note-title-input">Judul Catatan</label>
              <input
                id="note-title-input"
                v-model="formTitle"
                type="text"
                class="form-input"
                placeholder="Misal: Cerita sore kemarin..."
                required
                maxlength="60"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="note-content-input">Isi Pesan</label>
              <textarea
                id="note-content-input"
                v-model="formContent"
                class="form-textarea"
                rows="4"
                placeholder="Tuliskan ungkapan perasaan atau momen yang ingin selalu diingat..."
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Warna Kertas Surat</label>
              <div class="color-palette-row">
                <button
                  v-for="c in COLOR_OPTIONS"
                  :key="c.id"
                  type="button"
                  class="color-dot-btn"
                  :class="[`color-${c.id}`, { 'is-active': formColor === c.id }]"
                  :title="c.label"
                  @click="formColor = c.id"
                ></button>
              </div>
            </div>

            <button type="submit" class="submit-note-btn">
              <i class="fa-solid fa-paper-plane"></i>
              Simpan ke Diary
            </button>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRuangKita, type DiaryNote } from '../../data/ruangKitaStore';

const { data, addNote, deleteNote, toggleFavoriteNote } = useRuangKita();
const notes = data.value.notes;

const showCreateModal = ref(false);
const formTitle = ref('');
const formContent = ref('');
const formAuthor = ref<'partnerA' | 'partnerB'>('partnerA');
const formColor = ref<DiaryNote['paperColor']>('cream');

const COLOR_OPTIONS: { id: DiaryNote['paperColor']; label: string }[] = [
  { id: 'cream', label: 'Krem Hangat' },
  { id: 'rose', label: 'Soft Rose' },
  { id: 'lavender', label: 'Soft Lavender' },
  { id: 'mint', label: 'Pale Mint' },
  { id: 'amber', label: 'Soft Amber' },
];

function openCreateModal() {
  formTitle.value = '';
  formContent.value = '';
  formAuthor.value = 'partnerA';
  formColor.value = 'cream';
  showCreateModal.value = true;
}

function submitNewNote() {
  if (!formTitle.value.trim() || !formContent.value.trim()) return;

  const authorName = formAuthor.value === 'partnerA' ? data.value.partnerA.name : data.value.partnerB.name;
  addNote({
    title: formTitle.value.trim(),
    content: formContent.value.trim(),
    author: formAuthor.value,
    authorName,
    isFavorite: false,
    paperColor: formColor.value,
  });

  showCreateModal.value = false;
}

function confirmDeleteNote(id: string, title: string) {
  if (confirm(`Hapus catatan "${title}" dari diary bersama?`)) {
    deleteNote(id);
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
</script>

<style scoped>
.diary-category-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Action Bar ─────────────────────────────────────────────────── */
.diary-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--theme-text, #101010);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-section-title i {
  color: var(--theme-accent, #756ce0);
}

.panel-section-sub {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  color: var(--theme-text-muted, #71717a);
  margin: 2px 0 0;
}

.add-note-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--theme-accent, #756ce0);
  color: #ffffff;
  border: 1.5px solid var(--theme-border, #101010);
  border-radius: 8px;
  box-shadow: 2px 2px 0 var(--theme-border, #101010);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 8px 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.add-note-btn:active {
  transform: translate(1px, 1px);
  box-shadow: none;
}

/* ── Notes Grid ─────────────────────────────────────────────────── */
.diary-notes-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.scrapbook-note-card {
  position: relative;
  border: 1.5px solid var(--theme-border, #101010);
  border-radius: 12px;
  box-shadow: 3px 3px 0 var(--theme-border, #101010);
  padding: 18px 16px 14px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.scrapbook-note-card:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 var(--theme-border, #101010);
}

/* Paper colors */
.paper-cream    { background: #fffdf5; }
.paper-rose     { background: #fff1f2; }
.paper-lavender { background: #f5f3ff; }
.paper-mint     { background: #f0fdf4; }
.paper-amber    { background: #fffbeb; }

/* Washi Tape Accent */
.washi-tape-strip {
  position: absolute;
  top: -8px;
  left: 30px;
  width: 60px;
  height: 16px;
  background: rgba(234, 179, 8, 0.45);
  border: 1px dashed rgba(180, 83, 9, 0.3);
  transform: rotate(-3deg);
  pointer-events: none;
}

.note-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.author-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--theme-border, #101010);
  background: var(--theme-surface, #ffffff);
}

.author-badge.partnerA { color: var(--theme-accent, #756ce0); }
.author-badge.partnerB { color: #d97706; }

.note-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.note-fav-btn,
.note-delete-btn {
  background: none;
  border: none;
  font-size: 0.85rem;
  color: #a1a1aa;
  cursor: pointer;
  padding: 4px;
  transition: color 0.15s ease;
}

.note-fav-btn.is-active {
  color: #f59e0b;
}

.note-delete-btn:hover {
  color: #ef4444;
}

.note-title {
  font-family: 'Outfit', 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 800;
  color: #18181b;
  margin: 0 0 6px;
  line-height: 1.3;
}

.note-body {
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  color: #3f3f46;
  line-height: 1.5;
  margin: 0 0 10px;
  white-space: pre-line;
}

.note-card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
  padding-top: 8px;
}

.note-date {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  color: #71717a;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ── Empty State ────────────────────────────────────────────────── */
.diary-empty-card {
  text-align: center;
  padding: 36px 20px;
  background: var(--theme-surface, #ffffff);
  border: 2px dashed var(--theme-border-light, #dcd7fa);
  border-radius: 16px;
}

.empty-icon {
  font-size: 2.2rem;
  color: var(--theme-accent-light, #eae8fc);
  margin-bottom: 10px;
}

.empty-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 800;
  color: var(--theme-text, #101010);
  margin: 0 0 4px;
}

.empty-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  color: var(--theme-text-muted, #71717a);
  margin: 0 0 14px;
}

.empty-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--theme-accent, #756ce0);
  color: #ffffff;
  border: 1.5px solid var(--theme-border, #101010);
  border-radius: 8px;
  padding: 8px 16px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

/* ── Modal Styles ───────────────────────────────────────────────── */
.note-modal-overlay {
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

.note-modal-card {
  width: 100%;
  max-width: 400px;
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
  font-size: 1.1rem;
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

.note-form {
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

.author-toggle-row {
  display: flex;
  gap: 8px;
}

.author-opt-btn {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  border: 1.5px solid var(--theme-border, #101010);
  background: #f4f4f5;
  color: #71717a;
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.author-opt-btn.is-selected {
  background: var(--theme-accent, #756ce0);
  color: #ffffff;
  box-shadow: 2px 2px 0 var(--theme-border, #101010);
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

.color-palette-row {
  display: flex;
  gap: 10px;
}

.color-dot-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.5px solid var(--theme-border, #101010);
  cursor: pointer;
  transition: transform 0.15s ease;
}

.color-dot-btn.is-active {
  transform: scale(1.2);
  box-shadow: 0 0 0 2px var(--theme-accent, #756ce0);
}

.color-cream    { background: #fffdf5; }
.color-rose     { background: #fff1f2; }
.color-lavender { background: #f5f3ff; }
.color-mint     { background: #f0fdf4; }
.color-amber    { background: #fffbeb; }

.submit-note-btn {
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

.submit-note-btn:active {
  transform: translate(1px, 1px);
  box-shadow: none;
}
</style>

