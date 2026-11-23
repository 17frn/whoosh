<template>
  <header class="session-header">
    <!-- ── SECTION A: Profile Section (White Scrapbook Grid) ─────────────────── -->
    <div class="hdr-profile-section">
      <!-- Airplane (Top-Left) -->
      <div class="anim-wrapper plane-wrapper" aria-hidden="true">
        <i class="fa-solid fa-cloud particle-cloud cloud1"></i>
        <i class="fa-solid fa-cloud particle-cloud cloud2"></i>
        <i class="fa-solid fa-cloud particle-cloud cloud3"></i>
        <i class="fa-solid fa-cloud particle-cloud cloud4"></i>
        <i class="fa-solid fa-plane hdr-anim-plane" title="Terbang ke tujuan baru"></i>
      </div>

      <!-- Center Identity Content -->
      <div class="profile-content-wrap">
        <!-- Rectangular Portrait Photo Frame (4:5 Ratio) -->
        <div class="profile-photo-frame" title="Foto Profil">
          <i class="fa-solid fa-user profile-photo-icon"></i>
        </div>

        <!-- Greeting -->
        <p class="profile-greeting">Selamat datang kembali,</p>

        <!-- Editable User Name -->
        <div class="profile-name-row">
          <h1 class="profile-user-name" :title="userAlias">
            {{ userAlias || 'Pengguna' }}<span class="profile-name-dot">.</span>
          </h1>
          <button class="hdr-btn-edit" @click="$emit('change-alias')" title="Ubah nama panggilan" aria-label="Ubah nama panggilan">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
        </div>

        <!-- User / Session ID Badge -->
        <div class="profile-id-badge" title="Identitas Akun">
          <span class="id-label">ID</span>
          <span class="id-sep">·</span>
          <span class="id-val">{{ activeSessionToken || activeLocalShareToken || userAlias || 'LOCAL' }}</span>
        </div>
      </div>

      <!-- Car (Bottom-Right) -->
      <div class="anim-wrapper car-wrapper" aria-hidden="true">
        <i class="fa-solid fa-wind particle-smoke smoke1"></i>
        <i class="fa-solid fa-wind particle-smoke smoke2"></i>
        <i class="fa-solid fa-car-side hdr-anim-car" title="Perjalanan darat"></i>
      </div>
    </div>

    <!-- ── SECTION B: Traveling Together (White Scrapbook Grid) ──────────────────── -->
    <div v-if="filteredCollaborators.length > 0" class="hdr-traveling-panel">
      <div class="traveling-header">
        <div class="traveling-title-group">
          <i class="fa-solid fa-users traveling-icon"></i>
          <span class="traveling-title">TRAVELING BERSAMA</span>
        </div>
        <span class="traveling-count-badge">
          {{ String(filteredCollaborators.length).padStart(2, '0') }} MEMBERS
        </span>
      </div>

      <div class="traveling-chips-row">
        <!-- Max 3 Anggota Pertama -->
        <span
          v-for="c in visibleCollaborators"
          :key="c"
          class="hdr-collab-tag"
          :data-badge-color="getMemberBadgeColorKey(c)"
        >
          <span class="hdr-collab-tag-text">{{ c }}</span>
          <button class="hdr-btn-remove" @click.stop="$emit('delete-alias', c)" :title="`Hapus ${c}`" :aria-label="`Hapus ${c}`">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </span>

        <!-- Chip +N Member jika anggota lebih dari 3 -->
        <button
          v-if="remainingMembersCount > 0"
          class="collab-more-chip"
          @click="showAllMembersPopup = !showAllMembersPopup"
          :title="`Lihat ${remainingMembersCount} anggota lainnya`"
          aria-label="Buka daftar seluruh anggota"
        >
          <span class="more-chip-text">+{{ remainingMembersCount }} Member</span>
          <i class="fa-solid fa-chevron-right more-chip-icon"></i>
        </button>
      </div>
    </div>

    <!-- ── SECTION C: Info Strip (Status Perangkat Saja — Session Badges Dihapus) ──────────────────── -->
    <div v-if="deviceBrand" class="hdr-section-info">
      <!-- Device -->
      <div class="hdr-info-chip hdr-info-device">
        <i class="fa-solid fa-mobile-screen-button"></i>
        <span>{{ deviceBrand }}</span>
      </div>
    </div>
  </header>

  <!-- ── Member Popup Modal (Teleported to Body) ──────────────────── -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showAllMembersPopup"
        class="members-popup-backdrop"
        @click="showAllMembersPopup = false"
      >
        <div
          class="members-popup-card"
          @click.stop
          role="dialog"
          aria-modal="true"
          aria-label="Daftar Seluruh Anggota Traveling Together"
        >
          <!-- Popup Header (Close Button Removed — Outside Click & Esc Preserved) -->
          <div class="members-popup-header">
            <div class="members-popup-title-group">
              <i class="fa-solid fa-users-viewfinder members-popup-icon"></i>
              <h3 class="members-popup-title">ANGGOTA TRAVELING</h3>
            </div>
            <span class="members-popup-count-badge">
              {{ String(filteredCollaborators.length).padStart(2, '0') }} MEMBERS
            </span>
          </div>

          <p class="members-popup-desc">
            Seluruh anggota dan perangkat yang terhubung dalam sesi ini:
          </p>

          <!-- Popup Scrollable Member List -->
          <div class="members-popup-list">
            <div
              v-for="(c, idx) in filteredCollaborators"
              :key="c"
              class="members-popup-row"
              :data-badge-color="getMemberBadgeColorKey(c)"
            >
              <div class="members-row-left">
                <span class="members-row-index">{{ String(idx + 1).padStart(2, '0') }}</span>
                <i class="fa-solid fa-user-tag members-row-icon"></i>
                <span class="members-row-name">{{ c }}</span>
              </div>
              <button
                class="members-row-del-btn"
                @click.stop="$emit('delete-alias', c)"
                :title="`Hapus ${c}`"
                :aria-label="`Hapus ${c}`"
              >
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{
  userAlias: string;
  collaborators: string[];
  isCloud: boolean;
  isLocal: boolean;
  activeSessionName: string | null;
  activeSessionToken: string | null;
  activeLocalShareToken: string | null;
  deviceBrand: string;
}>();

defineEmits(['change-alias', 'delete-alias', 'copy-token', 'copy-local-token']);

// ── Traveling Together & Member Summary ──────────────
const showAllMembersPopup = ref(false);
const filteredCollaborators = computed(() => (props.collaborators || []).filter(c => c !== props.userAlias));
const visibleCollaborators = computed(() => filteredCollaborators.value.slice(0, 3));
const remainingMembersCount = computed(() => Math.max(0, filteredCollaborators.value.length - 3));

// ── Deterministic Member Badge Color Key for Blue Amber ───────────────
const BADGE_COLOR_KEYS = ['amber', 'soft-sky', 'lavender', 'pale-cyan', 'soft-cream'] as const;

function getMemberBadgeColorKey(name: string): string {
  if (!name) return BADGE_COLOR_KEYS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return BADGE_COLOR_KEYS[Math.abs(hash) % BADGE_COLOR_KEYS.length];
}

function handleGlobalKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && showAllMembersPopup.value) {
    showAllMembersPopup.value = false;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<style scoped>
/* ══════════════════════════════════════════
   SESSION HEADER (Always White × Diagonal Scrapbook Grid)
   A. Profile Section (Rectangular Frame + Integrated Vehicles + Diagonal Grid)
   B. Traveling Together (White Diagonal Scrapbook Grid)
   C. Status Perangkat (Warm Editorial Solid Strip)
══════════════════════════════════════════ */
.session-header {
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
  border-bottom: 2px solid #242424;
  box-shadow: 0 4px 0 #242424;
  overflow: hidden;
  margin-bottom: 0;
  flex-shrink: 0;
  width: 100%;
}

/* ── Section A: Profile Section (Diagonal Scrapbook Grid) ── */
.hdr-profile-section {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px 20px 18px;
  overflow: hidden;
  background-color: #FFFFFF;
}

/* Diagonal Scrapbook Grid Texture (Rotated 12deg, 34px diamond pattern) */
.hdr-profile-section::before {
  content: "";
  position: absolute;
  inset: -60%;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(36, 36, 36, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(36, 36, 36, 0.05) 1px, transparent 1px);
  background-size: 34px 34px;
  transform: rotate(12deg);
}

.profile-content-wrap {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  max-width: 100%;
}

/* Rectangular Portrait Photo Frame (approx 4:5 ratio) */
.profile-photo-frame {
  width: 76px;
  height: 95px;
  background: #FFFFFF;
  border: 1.5px solid #242424;
  box-shadow: 2.5px 2.5px 0 #242424;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  overflow: hidden;
  position: relative;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.profile-photo-icon {
  font-size: 2.2rem;
  color: #766354;
}

.profile-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.profile-greeting {
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: #766354;
  letter-spacing: 0.2px;
  margin: 2px 0 0;
  line-height: 1.3;
}

.profile-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-width: 95%;
  margin: 1px 0 0;
  min-width: 0;
  flex-wrap: nowrap;
}

.profile-user-name {
  font-family: 'Space Grotesk', 'Outfit', sans-serif;
  font-size: 1.65rem;
  font-weight: 900;
  color: #242424;
  margin: 0;
  letter-spacing: -0.5px;
  line-height: 1.2;
  min-width: 0;
  max-width: min(68vw, 280px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
}

.profile-name-dot {
  color: #D9825B;
}

.hdr-btn-edit {
  background: #FFF8EF;
  border: 1.5px solid #242424;
  box-shadow: 2px 2px 0 #242424;
  border-radius: 4px;
  color: #242424;
  font-size: 0.75rem;
  padding: 4px 7px;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.hdr-btn-edit:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #242424;
  background: #F2C9A7;
}
.hdr-btn-edit:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 #242424;
}

.profile-id-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #FFF8EF;
  border: 1.5px solid #242424;
  box-shadow: 1.5px 1.5px 0 #242424;
  border-radius: 4px;
  padding: 2px 8px;
  margin-top: 3px;
}

.id-label {
  font-family: 'Space Grotesk', 'Outfit', sans-serif;
  font-size: 0.68rem;
  font-weight: 800;
  color: #B96544;
  letter-spacing: 0.8px;
}

.id-sep {
  color: #766354;
  opacity: 0.6;
  font-size: 0.72rem;
}

.id-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.74rem;
  font-weight: 700;
  color: #242424;
  letter-spacing: 0.3px;
}

/* ── Integrated Vehicles in Profile Section ──────────────── */
.anim-wrapper {
  position: absolute;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 1;
}

/* Airplane at Top-Left */
.plane-wrapper {
  top: 14px;
  left: 28px;
  font-size: 2.3rem;
}

/* Car at Bottom-Right */
.car-wrapper {
  bottom: 12px;
  right: 24px;
  font-size: 2.3rem;
}

.hdr-anim-plane {
  animation: floatPlane 3s ease-in-out infinite;
  color: #242424;
  text-shadow: 2px 2px 0 #FFFFFF;
  z-index: 2;
}

.hdr-anim-car {
  animation: driveCar 0.4s linear infinite;
  color: #242424;
  text-shadow: 2px 2px 0 #FFFFFF;
  z-index: 2;
}

/* Particles (100% PRESERVED ASSETS & KEYFRAMES) */
.particle-cloud, .particle-smoke {
  position: absolute;
  color: #FFFFFF;
  text-shadow: 1.5px 1.5px 0 #242424;
  opacity: 0;
  z-index: 1;
}

/* Plane clouds */
.cloud1 {
  font-size: 0.8rem;
  right: 40px;
  top: 25px;
  animation: flyTrail 1.5s linear infinite;
}
.cloud2 {
  font-size: 0.6rem;
  right: 60px;
  top: 10px;
  animation: flyTrail 1.5s linear infinite 0.75s;
}
.cloud3 {
  font-size: 0.7rem;
  right: -30px;
  top: 40px;
  animation: flyTrail 2s linear infinite 0.3s;
  z-index: 3;
}
.cloud4 {
  font-size: 0.9rem;
  right: -20px;
  top: -5px;
  animation: flyTrail 1.8s linear infinite 1.1s;
  z-index: 3;
}

/* Car smoke */
.smoke1 {
  font-size: 1.5rem;
  right: 45px;
  bottom: 8px;
  animation: flyTrailSmoke 0.8s linear infinite;
}
.smoke2 {
  font-size: 1rem;
  right: 55px;
  bottom: 18px;
  animation: flyTrailSmoke 0.8s linear infinite 0.4s;
}

@keyframes floatPlane {
  0%, 100% { transform: translateY(0) rotate(-10deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes driveCar {
  0% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-4px) rotate(-2deg); }
  100% { transform: translateY(0) rotate(0); }
}

@keyframes flyTrail {
  0% {
    transform: translateX(0) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translateX(-60px) scale(1.5);
    opacity: 0;
  }
}

@keyframes flyTrailSmoke {
  0% {
    transform: translateX(0) scale(-0.5, 0.5);
    opacity: 1;
  }
  100% {
    transform: translateX(-50px) scale(-1.5, 1.5);
    opacity: 0;
  }
}

/* ── Section B: Traveling Together (Diagonal Scrapbook Grid) ──────────────────── */
.hdr-traveling-panel {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  margin: 0 24px 16px;
  background-color: #FFFFFF;
  border: 1.5px solid #242424;
  box-shadow: 2.5px 2.5px 0 #242424;
  border-radius: 6px;
  padding: 10px 13px;
  box-sizing: border-box;
}

/* Diagonal Scrapbook Grid Texture (Matching Profile Section) */
.hdr-traveling-panel::before {
  content: "";
  position: absolute;
  inset: -60%;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(36, 36, 36, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(36, 36, 36, 0.05) 1px, transparent 1px);
  background-size: 34px 34px;
  transform: rotate(12deg);
}

.traveling-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px dashed rgba(36, 36, 36, 0.2);
}

.traveling-title-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.traveling-icon {
  color: #D9825B;
  font-size: 0.75rem;
}

.traveling-title {
  font-family: 'Space Grotesk', 'Outfit', sans-serif;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #242424;
}

.traveling-count-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  font-weight: 800;
  color: #B96544;
  background: #F2C9A7;
  border: 1px solid #242424;
  padding: 1px 6px;
  border-radius: 3px;
  letter-spacing: 0.5px;
}

.traveling-chips-row {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.hdr-collab-tag {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  background: #FFFFFF;
  color: #242424;
  border: 1.5px solid #242424;
  box-shadow: 1.5px 1.5px 0 #242424;
  border-radius: 3px;
  padding: 2px 7px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
}

.hdr-collab-tag-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hdr-btn-remove {
  background: none;
  border: none;
  color: #B96544;
  cursor: pointer;
  padding: 0;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, color 0.15s ease;
  line-height: 1;
}
.hdr-btn-remove:hover {
  color: #ef4444;
  transform: scale(1.25);
}

/* +N Member Summary Trigger Chip */
.collab-more-chip {
  background: #F2C9A7;
  border: 1.5px solid #242424;
  box-shadow: 1.5px 1.5px 0 #242424;
  border-radius: 3px;
  padding: 2px 8px;
  font-family: 'Space Grotesk', 'Outfit', sans-serif;
  font-size: 0.72rem;
  font-weight: 800;
  color: #242424;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: transform 0.12s ease, background 0.15s ease, color 0.15s ease;
  line-height: 1.4;
}
.collab-more-chip:hover {
  background: #D9825B;
  color: #FFFFFF;
  transform: translate(-1px, -1px);
}
.collab-more-chip:active {
  transform: translate(1px, 1px);
}
.more-chip-icon {
  font-size: 0.6rem;
}

/* ── Section C: Info Strip (Status Perangkat — Solid Warm Editorial) ─────────────── */
.hdr-section-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 24px 9px;
  background: #FFF8EF;
  border-top: 2px solid #242424;
  position: relative;
  z-index: 2;
}

.hdr-info-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #242424;
  background: #FFFFFF;
  border: 1.5px solid #242424;
  box-shadow: 2px 2px 0 #242424;
  padding: 3px 9px;
  border-radius: 4px;
}

.hdr-info-device {
  color: #766354;
  background: #FFF8EF;
  font-style: normal;
  font-weight: 600;
}
.hdr-info-device i {
  font-size: 0.75rem;
  color: #D9825B;
}

.hdr-badge {
  font-family: 'Space Grotesk', 'Outfit', sans-serif;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 1px 6px;
  letter-spacing: 0.5px;
  line-height: 1.4;
  border-radius: 3px;
  border: 1px solid #242424;
}

.hdr-badge-cloud {
  color: #242424;
  background: #F2C9A7;
}
.hdr-badge-local {
  color: #FFFFFF;
  background: #D9825B;
}

.hdr-token {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  color: #242424;
  background: #F8E9D8;
  padding: 2px 6px;
  border-radius: 3px;
  border: 1px solid #242424;
  letter-spacing: 0.4px;
  cursor: pointer;
  transition: background 0.15s;
}
.hdr-token:hover {
  background: #F2C9A7;
}

.hdr-btn-copy {
  background: #242424;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  color: #FFFFFF;
  font-size: 0.72rem;
  padding: 3px 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, background 0.15s;
}
.hdr-btn-copy:hover {
  background: #D9825B;
  transform: scale(1.1);
}

/* ── Member Popup Modal (Neo-Brutalism) ──────────────────── */
.members-popup-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(16, 16, 16, 0.5);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

.members-popup-card {
  background: #FFF8EF;
  border: 2px solid #242424;
  box-shadow: 4px 4px 0 #242424;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  padding: 16px;
  box-sizing: border-box;
}

.members-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-bottom: 2px solid #242424;
  padding-bottom: 10px;
}

.members-popup-title-group {
  display: flex;
  align-items: center;
  gap: 7px;
}

.members-popup-icon {
  color: #D9825B;
  font-size: 0.9rem;
}

.members-popup-title {
  margin: 0;
  font-family: 'Space Grotesk', 'Outfit', sans-serif;
  font-size: 0.88rem;
  font-weight: 900;
  color: #242424;
  letter-spacing: 0.8px;
}

.members-popup-count-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  font-weight: 800;
  color: #B96544;
  background: #F2C9A7;
  border: 1px solid #242424;
  padding: 2px 6px;
  border-radius: 3px;
  margin-left: auto;
  margin-right: 6px;
}

.members-popup-close-btn {
  background: #F8E9D8;
  border: 1.5px solid #242424;
  box-shadow: 1.5px 1.5px 0 #242424;
  border-radius: 3px;
  padding: 4px 8px;
  cursor: pointer;
  color: #242424;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease;
}
.members-popup-close-btn:hover {
  transform: translate(-1px, -1px);
  background: #f87171;
  color: #FFFFFF;
}

.members-popup-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #766354;
  margin: 10px 0 12px;
  line-height: 1.4;
}

.members-popup-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 4px;
}
.members-popup-list::-webkit-scrollbar {
  width: 4px;
}
.members-popup-list::-webkit-scrollbar-thumb {
  background: #F2C9A7;
  border: 1px solid #242424;
}

.members-popup-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: #FFFFFF;
  border: 1.5px solid #242424;
  box-shadow: 1.5px 1.5px 0 #242424;
  border-radius: 4px;
  padding: 6px 10px;
}

.members-row-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.members-row-index {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  font-weight: 800;
  color: #B96544;
  flex-shrink: 0;
}

.members-row-icon {
  font-size: 0.75rem;
  color: #766354;
  flex-shrink: 0;
}

.members-row-name {
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #242424;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.members-row-del-btn {
  background: none;
  border: none;
  color: #B96544;
  cursor: pointer;
  padding: 4px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.12s ease, color 0.15s ease;
  flex-shrink: 0;
}
.members-row-del-btn:hover {
  color: #ef4444;
  transform: scale(1.2);
}


/* ══════════════════════════════════════════
   BLUE AMBER — Welcome Header Theme Overrides
   Bold Indigo Blueprint × White Grid × Solid UI Surfaces
   ══════════════════════════════════════════ */

/* ── A. Scrapbook Background: Primary Indigo ── */
[data-theme="blue amber"] .hdr-profile-section {
  background-color: #756CE0;
}
[data-theme="blue amber"] .hdr-traveling-panel {
  background-color: #756CE0;
  border-color: #242424;
  box-shadow: 2.5px 2.5px 0 #242424;
}

/* ── B. White Blueprint Grid ── */
[data-theme="blue amber"] .hdr-profile-section::before,
[data-theme="blue amber"] .hdr-traveling-panel::before {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.90) 2px, transparent 2px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.90) 2px, transparent 2px);
  background-size: 40px 40px;
  transform: rotate(12deg);
  inset: -50%;
}

/* ── C. Profile Photo Frame — Solid White ── */
[data-theme="blue amber"] .profile-photo-frame {
  background: #FFFFFF;
  border-color: #FFFFFF;
  box-shadow: 2.5px 2.5px 0 rgba(36, 36, 36, 0.6);
}
[data-theme="blue amber"] .profile-photo-icon {
  color: #756CE0;
}

/* ── D. Greeting Text — Soft Amber Editorial Serif on Indigo ── */
[data-theme="blue amber"] .profile-greeting {
  font-family: Georgia, Cambria, 'Times New Roman', serif;
  font-style: italic;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.3px;
  color: #FFF0C6;
  text-shadow: 1px 1px 0 rgba(39, 36, 67, 0.4);
  margin: 2px 0 1px;
  line-height: 1.3;
}
[data-theme="blue amber"] .profile-user-name {
  color: #FFFFFF;
}
[data-theme="blue amber"] .profile-name-dot {
  color: #F2C45F;
}

/* ── E. Edit Button — White Surface ── */
[data-theme="blue amber"] .hdr-btn-edit {
  background: #FFFFFF;
  border-color: #242424;
  box-shadow: 2px 2px 0 #242424;
  color: #242424;
}
[data-theme="blue amber"] .hdr-btn-edit:hover {
  background: #EAE8FC;
  color: #756CE0;
}

/* ── F. ID Badge — White Solid Surface ── */
[data-theme="blue amber"] .profile-id-badge {
  background: #FFFFFF;
  border-color: #756CE0;
  box-shadow: 1.5px 1.5px 0 #242424;
}
[data-theme="blue amber"] .id-label {
  color: #756CE0;
}
[data-theme="blue amber"] .id-sep {
  color: #77727A;
}
[data-theme="blue amber"] .id-val {
  color: #252525;
}

/* ── G. Vehicle Colors — Colored on Indigo ── */
[data-theme="blue amber"] .hdr-anim-plane {
  color: #F2C45F;
  text-shadow: 2px 2px 0 #5148B8;
}
[data-theme="blue amber"] .hdr-anim-car {
  color: #CFE7FF;
  text-shadow: 2px 2px 0 #5148B8;
}
[data-theme="blue amber"] .particle-cloud {
  color: #FFF0C6;
  text-shadow: 1px 1px 0 rgba(81, 72, 184, 0.4);
}
[data-theme="blue amber"] .particle-smoke {
  color: #E7E4FF;
  text-shadow: 1px 1px 0 rgba(81, 72, 184, 0.4);
}

/* ── H. Traveling Together Inner ── */
[data-theme="blue amber"] .traveling-header {
  border-bottom-color: rgba(255, 255, 255, 0.3);
}
[data-theme="blue amber"] .traveling-icon {
  color: #756CE0;
}
[data-theme="blue amber"] .traveling-title {
  color: #FFFFFF;
}
[data-theme="blue amber"] .traveling-count-badge {
  background: #F2C45F;
  color: #272443;
  border-color: #242424;
}

/* ── I. Member Chips & Rows — Solid Random Palette (Deterministic) ── */
[data-theme="blue amber"] .hdr-collab-tag {
  border: 1.5px solid #242424;
  box-shadow: 1.5px 1.5px 0 #242424;
}
[data-theme="blue amber"] .hdr-collab-tag[data-badge-color="amber"],
[data-theme="blue amber"] .members-popup-row[data-badge-color="amber"] {
  background: #F2C45F !important;
  color: #272443 !important;
  border-color: #242424 !important;
}
[data-theme="blue amber"] .hdr-collab-tag[data-badge-color="soft-sky"],
[data-theme="blue amber"] .members-popup-row[data-badge-color="soft-sky"] {
  background: #CFE7FF !important;
  color: #272443 !important;
  border-color: #242424 !important;
}
[data-theme="blue amber"] .hdr-collab-tag[data-badge-color="lavender"],
[data-theme="blue amber"] .members-popup-row[data-badge-color="lavender"] {
  background: #DAD5FF !important;
  color: #272443 !important;
  border-color: #242424 !important;
}
[data-theme="blue amber"] .hdr-collab-tag[data-badge-color="pale-cyan"],
[data-theme="blue amber"] .members-popup-row[data-badge-color="pale-cyan"] {
  background: #C8E8EB !important;
  color: #272443 !important;
  border-color: #242424 !important;
}
[data-theme="blue amber"] .hdr-collab-tag[data-badge-color="soft-cream"],
[data-theme="blue amber"] .members-popup-row[data-badge-color="soft-cream"] {
  background: #FFF0C6 !important;
  color: #272443 !important;
  border-color: #242424 !important;
}

[data-theme="blue amber"] .hdr-btn-remove {
  color: #5148B8;
}
[data-theme="blue amber"] .hdr-btn-remove:hover {
  color: #ef4444;
}

/* ── J. +N Member Chip — Amber Solid ── */
[data-theme="blue amber"] .collab-more-chip {
  background: #F2C45F;
  color: #272443;
  border: 1.5px solid #242424;
  box-shadow: 1.5px 1.5px 0 #242424;
}
[data-theme="blue amber"] .collab-more-chip:hover {
  background: #E5B450;
  color: #272443;
}

/* ── K. Member Popup Modal — Blue Amber Member Panel ── */
[data-theme="blue amber"] .members-popup-card {
  background: #FFFFFF;
  border: 2px solid #242424;
  box-shadow: 4px 4px 0 #242424;
}
[data-theme="blue amber"] .members-popup-header {
  border-bottom: 2px solid #242424;
}
[data-theme="blue amber"] .members-popup-icon {
  color: #756CE0;
}
[data-theme="blue amber"] .members-popup-title {
  color: #272443;
}
[data-theme="blue amber"] .members-popup-count-badge {
  background: #F2C45F;
  color: #272443;
  border: 1px solid #242424;
}
[data-theme="blue amber"] .members-popup-desc {
  color: #5148B8;
  font-weight: 500;
}
[data-theme="blue amber"] .members-popup-list::-webkit-scrollbar-thumb {
  background: #756CE0;
  border: 1px solid #242424;
}
[data-theme="blue amber"] .members-popup-row {
  border: 1.5px solid #242424;
  box-shadow: 1.5px 1.5px 0 #242424;
}
[data-theme="blue amber"] .members-row-index,
[data-theme="blue amber"] .members-row-icon {
  color: #5148B8;
}
[data-theme="blue amber"] .members-row-name {
  color: #272443;
}
[data-theme="blue amber"] .members-row-del-btn {
  color: #5148B8;
}
[data-theme="blue amber"] .members-row-del-btn:hover {
  color: #ef4444;
}

/* ── L. Device Status Strip — Solid Soft Indigo (#E7E4FF) ── */
[data-theme="blue amber"] .hdr-section-info {
  background: #E7E4FF;
  border-top: 2px solid #242424;
}
[data-theme="blue amber"] .hdr-info-device {
  background: #FFFFFF;
  color: #5148B8;
  border: 1.5px solid #242424;
  box-shadow: 1.5px 1.5px 0 #242424;
  font-weight: 700;
}
[data-theme="blue amber"] .hdr-info-device i {
  color: #756CE0;
}

@media (max-width: 1024px) {

  .hdr-profile-section { padding-left: 30px; padding-right: 30px; }
  .plane-wrapper { left: 24px; top: 12px; }
  .car-wrapper { right: 20px; bottom: 10px; }
  .hdr-traveling-panel { margin-left: 20px; margin-right: 20px; }
  .hdr-section-info { padding-left: 24px; padding-right: 24px; }
}

@media (max-width: 640px) {
  .hdr-profile-section { padding: 20px 16px 16px; }
  .profile-photo-frame { width: 72px; height: 90px; }
  .profile-photo-icon { font-size: 2rem; }
  .profile-user-name { font-size: 1.4rem; }
  .plane-wrapper { left: 16px; top: 10px; font-size: 1.9rem; }
  .car-wrapper { right: 16px; bottom: 8px; font-size: 1.9rem; }
  .hdr-traveling-panel { margin: 0 16px 14px; padding: 9px 11px; }
  .hdr-section-info { padding: 6px 16px 7px; gap: 6px; }
}

@media (max-width: 480px) {
  .hdr-profile-section { padding: 18px 12px 14px; }
  .profile-photo-frame { width: 66px; height: 83px; }
  .profile-photo-icon { font-size: 1.8rem; }
  .profile-user-name { font-size: 1.25rem; }
  .plane-wrapper { left: 10px; top: 8px; font-size: 1.6rem; }
  .car-wrapper { right: 10px; bottom: 6px; font-size: 1.6rem; }
  .hdr-traveling-panel { margin: 0 12px 12px; padding: 8px 10px; }
  .hdr-section-info { padding-left: 12px; padding-right: 12px; }
  .members-popup-card { padding: 14px; }
}
</style>
