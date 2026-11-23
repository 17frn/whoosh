<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRuangKita, type DailyCheckin } from '../../data/ruangKitaStore';

type MoodType = DailyCheckin['mood'];

interface MoodOption {
  id: MoodType;
  label: string;
  icon: string;
  color: string;
  bg: string;
}

const { data, addCheckin } = useRuangKita();

// Mood definitions - Strictly Font Awesome icons, ZERO emoji
const moodOptions: MoodOption[] = [
  { id: 'love', label: 'Penuh Kasih', icon: 'fa-solid fa-face-grin-hearts', color: '#ff6b8b', bg: '#fff0f3' },
  { id: 'happy', label: 'Bahagia', icon: 'fa-solid fa-face-smile', color: '#2ec4b6', bg: '#e8fbf8' },
  { id: 'calm', label: 'Tenang', icon: 'fa-solid fa-cloud-sun', color: '#3a86ff', bg: '#edf4ff' },
  { id: 'tired', label: 'Lelah', icon: 'fa-solid fa-face-tired', color: '#f77f00', bg: '#fff4e6' },
  { id: 'excited', label: 'Semangat', icon: 'fa-solid fa-bolt', color: '#ffb703', bg: '#fffde6' },
];

const selectedAuthor = ref<'partnerA' | 'partnerB'>('partnerA');
const selectedMood = ref<MoodType>('love');
const checkinMessage = ref<string>('');
const isSubmitting = ref<boolean>(false);
const showSuccessNotice = ref<boolean>(false);

// Today's date string YYYY-MM-DD
const todayDateStr = computed(() => new Date().toISOString().slice(0, 10));

// Today's check-ins for partnerA and partnerB
const partnerACheckin = computed(() => {
  return data.value.checkins.find(c => c.author === 'partnerA' && c.date === todayDateStr.value) ||
    data.value.checkins.find(c => c.author === 'partnerA');
});

const partnerBCheckin = computed(() => {
  return data.value.checkins.find(c => c.author === 'partnerB' && c.date === todayDateStr.value) ||
    data.value.checkins.find(c => c.author === 'partnerB');
});

// All check-ins sorted
const sortedCheckins = computed(() => {
  return [...data.value.checkins];
});

function handleSaveCheckin() {
  if (!checkinMessage.value.trim()) return;

  const moodObj = moodOptions.find(m => m.id === selectedMood.value) || moodOptions[0];
  const authorName = selectedAuthor.value === 'partnerA'
    ? data.value.partnerA.name
    : data.value.partnerB.name;

  isSubmitting.value = true;
  addCheckin({
    author: selectedAuthor.value,
    authorName,
    mood: moodObj.id,
    moodIcon: moodObj.icon,
    moodLabel: moodObj.label,
    message: checkinMessage.value.trim(),
  });

  checkinMessage.value = '';
  isSubmitting.value = false;
  showSuccessNotice.value = true;
  setTimeout(() => {
    showSuccessNotice.value = false;
  }, 3500);
}
</script>

<template>
  <div class="ruang-aktivitas-container">
    <!-- Today's Connection Status Bar -->
    <div class="today-banner">
      <div class="today-ribbon">
        <i class="fa-solid fa-calendar-check"></i>
        <span>Papan Kabar Harian Berdua</span>
      </div>
      <p class="today-sub">
        Bagikan perasaan dan pesan singkat untuk saling menyapa di sela kesibukan hari ini.
      </p>
    </div>

    <!-- Active Status Cards for Both Users -->
    <div class="partner-status-row">
      <!-- Partner A Card -->
      <div class="partner-today-card" :class="{ 'is-active-card': selectedAuthor === 'partnerA' }">
        <div class="card-pin"><i class="fa-solid fa-thumbtack"></i></div>
        <div class="partner-head">
          <div class="partner-avatar-badge avatar-a">
            <i class="fa-solid fa-user"></i>
          </div>
          <div class="partner-meta">
            <span class="partner-name">{{ data.partnerA.name }}</span>
            <span class="partner-role">Pengguna Utama</span>
          </div>
        </div>

        <div v-if="partnerACheckin" class="partner-mood-bubble">
          <div class="bubble-mood-tag">
            <i :class="partnerACheckin.moodIcon"></i>
            <span>{{ partnerACheckin.moodLabel }}</span>
            <span class="bubble-time">{{ partnerACheckin.createdAt }}</span>
          </div>
          <p class="bubble-text">“{{ partnerACheckin.message }}”</p>
        </div>
        <div v-else class="empty-bubble">
          <i class="fa-regular fa-clock"></i>
          <span>Belum membagikan kabar hari ini</span>
        </div>
      </div>

      <!-- Partner B Card -->
      <div class="partner-today-card" :class="{ 'is-active-card': selectedAuthor === 'partnerB' }">
        <div class="card-pin pin-right"><i class="fa-solid fa-thumbtack"></i></div>
        <div class="partner-head">
          <div class="partner-avatar-badge avatar-b">
            <i class="fa-solid fa-heart"></i>
          </div>
          <div class="partner-meta">
            <span class="partner-name">{{ data.partnerB.name }}</span>
            <span class="partner-role">Pasangan Tercinta</span>
          </div>
        </div>

        <div v-if="partnerBCheckin" class="partner-mood-bubble">
          <div class="bubble-mood-tag">
            <i :class="partnerBCheckin.moodIcon"></i>
            <span>{{ partnerBCheckin.moodLabel }}</span>
            <span class="bubble-time">{{ partnerBCheckin.createdAt }}</span>
          </div>
          <p class="bubble-text">“{{ partnerBCheckin.message }}”</p>
        </div>
        <div v-else class="empty-bubble">
          <i class="fa-regular fa-clock"></i>
          <span>Belum membagikan kabar hari ini</span>
        </div>
      </div>
    </div>

    <!-- Daily Check-in Form Card -->
    <div class="checkin-form-card">
      <div class="form-washi-tape"></div>
      
      <div class="form-header">
        <div class="header-icon-box">
          <i class="fa-solid fa-pen-fancy"></i>
        </div>
        <div>
          <h3 class="form-title">Kirim Kabar & Mood</h3>
          <p class="form-desc">Bagaimana perasaanmu saat ini?</p>
        </div>
      </div>

      <!-- Author Selector -->
      <div class="author-selector-group">
        <label class="input-label">
          <i class="fa-solid fa-user-check"></i>
          Check-in sebagai:
        </label>
        <div class="author-toggle-btns">
          <button
            type="button"
            class="author-choice-btn"
            :class="{ active: selectedAuthor === 'partnerA' }"
            @click="selectedAuthor = 'partnerA'"
          >
            <i class="fa-solid fa-user"></i>
            {{ data.partnerA.name }}
          </button>
          <button
            type="button"
            class="author-choice-btn"
            :class="{ active: selectedAuthor === 'partnerB' }"
            @click="selectedAuthor = 'partnerB'"
          >
            <i class="fa-solid fa-heart"></i>
            {{ data.partnerB.name }}
          </button>
        </div>
      </div>

      <!-- Mood Selection Pills -->
      <div class="mood-selection-section">
        <label class="input-label">
          <i class="fa-solid fa-face-smile-beam"></i>
          Pilih Mood Saat Ini:
        </label>
        <div class="mood-grid">
          <button
            v-for="m in moodOptions"
            :key="m.id"
            type="button"
            class="mood-btn"
            :class="{ selected: selectedMood === m.id }"
            @click="selectedMood = m.id"
          >
            <span class="mood-btn-icon" :style="{ color: m.color }">
              <i :class="m.icon"></i>
            </span>
            <span class="mood-btn-label">{{ m.label }}</span>
          </button>
        </div>
      </div>

      <!-- Message Textarea -->
      <div class="message-input-section">
        <label class="input-label">
          <i class="fa-solid fa-comment-dots"></i>
          Pesan Singkat Hari Ini:
        </label>
        <textarea
          v-model="checkinMessage"
          rows="3"
          placeholder="Tulis pesan kecil untuk menyemangati harimu atau bercerita ringkas..."
          class="checkin-textarea"
        ></textarea>
      </div>

      <!-- Success Notification Banner -->
      <div v-if="showSuccessNotice" class="success-alert">
        <i class="fa-solid fa-circle-check"></i>
        <span>Kabar harianmu berhasil disimpan dan dibagikan!</span>
      </div>

      <!-- Submit Button -->
      <button
        type="button"
        class="submit-checkin-btn"
        :disabled="!checkinMessage.trim() || isSubmitting"
        @click="handleSaveCheckin"
      >
        <i class="fa-solid fa-paper-plane"></i>
        <span>Kirim Kabar Harian</span>
      </button>
    </div>

    <!-- History Timeline -->
    <div class="history-section">
      <div class="history-header">
        <div class="history-title-wrap">
          <i class="fa-solid fa-clock-rotate-left"></i>
          <h4>Riwayat Kabar Berdua</h4>
        </div>
        <span class="history-count">{{ sortedCheckins.length }} Kabar</span>
      </div>

      <div class="history-timeline">
        <div
          v-for="item in sortedCheckins"
          :key="item.id"
          class="timeline-item"
        >
          <div class="timeline-dot" :class="item.author === 'partnerA' ? 'dot-a' : 'dot-b'">
            <i :class="item.moodIcon"></i>
          </div>

          <div class="timeline-content-card">
            <div class="timeline-meta">
              <div class="author-tag" :class="item.author === 'partnerA' ? 'author-tag-a' : 'author-tag-b'">
                <i :class="item.author === 'partnerA' ? 'fa-solid fa-user' : 'fa-solid fa-heart'"></i>
                <span>{{ item.authorName }}</span>
              </div>
              <div class="timeline-time">
                <i class="fa-regular fa-clock"></i>
                <span>{{ item.date }} • {{ item.createdAt }}</span>
              </div>
            </div>

            <div class="timeline-mood-badge">
              <i :class="item.moodIcon"></i>
              <span>{{ item.moodLabel }}</span>
            </div>

            <p class="timeline-message">
              {{ item.message }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ruang-aktivitas-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

/* Today Banner */
.today-banner {
  background: var(--card-bg, #ffffff);
  border: 2px solid var(--border-color, #1e293b);
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 3px 3px 0 var(--border-color, #1e293b);
}

.today-ribbon {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-color, #0f172a);
  margin-bottom: 4px;
}

.today-ribbon i {
  color: var(--accent-color, #3b82f6);
}

.today-sub {
  font-size: 12px;
  color: var(--text-muted, #64748b);
  line-height: 1.5;
  margin: 0;
}

/* Partner Status Row */
.partner-status-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
}

.partner-today-card {
  position: relative;
  background: var(--card-bg, #ffffff);
  border: 2px solid var(--border-color, #1e293b);
  border-radius: 14px;
  padding: 16px 14px;
  box-shadow: 3px 3px 0 var(--border-color, #1e293b);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.partner-today-card.is-active-card {
  border-color: var(--accent-color, #3b82f6);
  box-shadow: 3px 3px 0 var(--accent-color, #3b82f6);
}

.card-pin {
  position: absolute;
  top: -8px;
  left: 16px;
  font-size: 13px;
  color: #ef4444;
  transform: rotate(-15deg);
}

.card-pin.pin-right {
  left: auto;
  right: 16px;
  color: #ec4899;
  transform: rotate(15deg);
}

.partner-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.partner-avatar-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border: 2px solid var(--border-color, #1e293b);
}

.avatar-a {
  background: #dbeafe;
  color: #1d4ed8;
}

.avatar-b {
  background: #fce7f3;
  color: #be185d;
}

.partner-meta {
  display: flex;
  flex-direction: column;
}

.partner-name {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: var(--text-color, #0f172a);
}

.partner-role {
  font-size: 11px;
  color: var(--text-muted, #64748b);
}

.partner-mood-bubble {
  background: var(--bg-hover, #f8fafc);
  border: 1.5px dashed var(--border-color, #cbd5e1);
  border-radius: 10px;
  padding: 10px 12px;
}

.bubble-mood-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-color, #0f172a);
  margin-bottom: 6px;
}

.bubble-time {
  margin-left: auto;
  font-size: 11px;
  font-weight: normal;
  color: var(--text-muted, #64748b);
}

.bubble-text {
  font-size: 12px;
  font-style: italic;
  color: var(--text-color, #334155);
  line-height: 1.45;
  margin: 0;
}

.empty-bubble {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
  padding: 12px 10px;
  background: var(--bg-hover, #f8fafc);
  border-radius: 8px;
  border: 1px dashed var(--border-color, #cbd5e1);
}

/* Checkin Form Card */
.checkin-form-card {
  position: relative;
  background: var(--card-bg, #ffffff);
  border: 2px solid var(--border-color, #1e293b);
  border-radius: 16px;
  padding: 20px 18px;
  box-shadow: 4px 4px 0 var(--border-color, #1e293b);
}

.form-washi-tape {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 90px;
  height: 18px;
  background: rgba(251, 191, 36, 0.7);
  border: 1px dashed rgba(180, 83, 9, 0.4);
  backdrop-filter: blur(2px);
}

.form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.header-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #fef3c7;
  color: #b45309;
  border: 2px solid var(--border-color, #1e293b);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.form-title {
  margin: 0;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: var(--text-color, #0f172a);
}

.form-desc {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted, #64748b);
}

.input-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-color, #0f172a);
  margin-bottom: 8px;
}

.author-selector-group {
  margin-bottom: 16px;
}

.author-toggle-btns {
  display: flex;
  gap: 10px;
}

.author-choice-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 12px;
  border: 2px solid var(--border-color, #1e293b);
  background: var(--card-bg, #ffffff);
  border-radius: 10px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted, #64748b);
  cursor: pointer;
  box-shadow: 2px 2px 0 var(--border-color, #1e293b);
  transition: all 0.15s ease;
}

.author-choice-btn.active {
  background: var(--accent-color, #3b82f6);
  color: #ffffff;
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 var(--border-color, #1e293b);
}

/* Mood Grid */
.mood-selection-section {
  margin-bottom: 16px;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(95px, 1fr));
  gap: 8px;
}

.mood-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 6px;
  background: var(--card-bg, #ffffff);
  border: 1.5px solid var(--border-color, #1e293b);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 2px 2px 0 var(--border-color, #1e293b);
}

.mood-btn-icon {
  font-size: 20px;
}

.mood-btn-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-color, #1e293b);
  text-align: center;
}

.mood-btn.selected {
  border-color: var(--accent-color, #3b82f6);
  background: #eff6ff;
  transform: scale(1.03);
  box-shadow: 3px 3px 0 var(--border-color, #1e293b);
}

/* Message Textarea */
.message-input-section {
  margin-bottom: 16px;
}

.checkin-textarea {
  width: 100%;
  border: 2px solid var(--border-color, #1e293b);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  color: var(--text-color, #0f172a);
  background: var(--bg-hover, #f8fafc);
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.checkin-textarea:focus {
  outline: none;
  border-color: var(--accent-color, #3b82f6);
  background: #ffffff;
}

.success-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #dcfce7;
  color: #15803d;
  border: 1.5px solid #86efac;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 14px;
}

.submit-checkin-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--accent-color, #3b82f6);
  color: #ffffff;
  border: 2px solid var(--border-color, #1e293b);
  border-radius: 12px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 3px 3px 0 var(--border-color, #1e293b);
  transition: all 0.15s ease;
}

.submit-checkin-btn:hover:not(:disabled) {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 var(--border-color, #1e293b);
}

.submit-checkin-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

/* History Section */
.history-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.history-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 800;
  color: var(--text-color, #0f172a);
}

.history-title-wrap i {
  color: var(--accent-color, #3b82f6);
}

.history-count {
  font-size: 11px;
  font-weight: 700;
  background: var(--bg-hover, #f1f5f9);
  border: 1px solid var(--border-color, #cbd5e1);
  padding: 3px 8px;
  border-radius: 12px;
  color: var(--text-muted, #64748b);
}

.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  padding-left: 18px;
  border-left: 2px dashed var(--border-color, #cbd5e1);
  margin-left: 8px;
}

.timeline-item {
  position: relative;
}

.timeline-dot {
  position: absolute;
  top: 10px;
  left: -26px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  border: 2px solid var(--border-color, #1e293b);
}

.dot-a {
  background: #dbeafe;
  color: #1d4ed8;
}

.dot-b {
  background: #fce7f3;
  color: #be185d;
}

.timeline-content-card {
  background: var(--card-bg, #ffffff);
  border: 1.5px solid var(--border-color, #1e293b);
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 2px 2px 0 var(--border-color, #1e293b);
}

.timeline-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.author-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--border-color, #1e293b);
}

.author-tag-a {
  background: #eff6ff;
  color: #1d4ed8;
}

.author-tag-b {
  background: #fdf2f8;
  color: #be185d;
}

.timeline-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-muted, #64748b);
}

.timeline-mood-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-color, #0f172a);
  background: var(--bg-hover, #f8fafc);
  padding: 3px 8px;
  border-radius: 6px;
  margin-bottom: 6px;
}

.timeline-message {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-color, #1e293b);
  line-height: 1.45;
}
</style>

