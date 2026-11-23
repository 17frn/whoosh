<template>
  <Teleport to="body">
    <Transition name="paper-pop">
      <div class="paper-modal-overlay" @click.self="$emit('close')">
        <div class="paper-sheet-card gwen-auth-card-sheet" @click.stop>
          <!-- Washi tape at top (fully unclipped via overflow: visible on sheet) -->
          <div class="paper-washi-tape" aria-hidden="true"></div>

          <!-- Scrollable body so inner content scrolls smoothly on small screens -->
          <div class="gwen-auth-scroll-body">
            <!-- Header -->
            <div class="paper-header">
              <div class="paper-header-top-row">
                <div class="paper-stamp-tag tag-token">
                  <i class="fa-solid fa-cloud"></i>
                  <span>TOKEN SESI • CLOUD</span>
                </div>
              </div>

              <h2 class="paper-title">Masuk via Token Sesi</h2>
              <p class="auth-modal-subtitle">
                Masukkan token cloud (<code>MOMEN-XXXX-XXXX</code>) atau token lokal (<code>LOKAL-XXXX-XXXX</code>) untuk bergabung ke timeline:
              </p>
            </div>

            <div class="paper-perforated-line"></div>

            <!-- Form: Join with Token -->
            <form @submit.prevent="handleTokenSubmit" class="gwen-auth-form">
              <!-- Token Sesi Input Field -->
              <div class="gwen-form-group">
                <label for="gwen-token-input" class="gwen-form-label">
                  <span>Token Sesi</span>
                  <span class="gwen-label-pill pill-cloud">Cloud / Lokal</span>
                </label>
                <input
                  type="text"
                  id="gwen-token-input"
                  v-model="tokenInput"
                  required
                  placeholder="MOMEN-XXXX-XXXX"
                  class="gwen-brutal-input token-uppercase"
                  autocomplete="off"
                  :disabled="loading"
                />
              </div>

              <!-- Error message alert -->
              <div v-if="errorMessage" class="gwen-auth-error-box" role="alert">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>{{ errorMessage }}</span>
              </div>

              <!-- Primary Masuk Button (Warm golden yellow from Screenshot 2) -->
              <div class="gwen-btn-wrap">
                <div class="gwen-btn-shadow" aria-hidden="true"></div>
                <button
                  type="submit"
                  class="gwen-auth-submit-btn btn-yellow"
                  :disabled="loading"
                >
                  <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
                  <i v-else class="fa-solid fa-right-to-bracket"></i>
                  <span>{{ loading ? 'Memeriksa...' : 'Masuk' }}</span>
                </button>
              </div>
            </form>

            <!-- Divider: ATAU -->
            <div class="gwen-auth-divider">
              <span class="divider-line"></span>
              <span class="divider-text">ATAU</span>
              <span class="divider-line"></span>
            </div>

            <!-- Create New Timeline Section (Lavender button from Screenshot 2) -->
            <div class="gwen-create-section">
              <p class="gwen-create-subtitle">Belum punya timeline bersama?</p>
              <div class="gwen-btn-wrap">
                <div class="gwen-btn-shadow" aria-hidden="true"></div>
                <button
                  type="button"
                  @click="handleCreateNewTimeline"
                  class="gwen-auth-submit-btn btn-lavender"
                  id="btn-create-timeline"
                  :disabled="loading"
                >
                  <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
                  <i v-else class="fa-solid fa-plus"></i>
                  <span>{{ loading ? 'Membuat...' : 'Buat Timeline Baru' }}</span>
                </button>
              </div>
            </div>

            <!-- Footer: Single deliberate navigation action back to method selector -->
            <div class="paper-footer">
              <button
                type="button"
                class="gwen-btn-back-selector"
                @click="$emit('back')"
                :disabled="loading"
              >
                <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
                <span>Pilih Cara Masuk</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getSessionByToken, createSession } from '../../data/authService';
import { joinByLocalToken } from '../../data/localStore';

const emit = defineEmits<{
  'close': [];
  'back': [];
  'auth-success': [result: {
    authType: 'cloud' | 'local';
    username?: string;
    sessionId?: string;
    token?: string;
    sessionName?: string;
    shareToken?: string;
  }];
}>();

const tokenInput = ref('');
const loading = ref(false);
const errorMessage = ref('');

async function handleTokenSubmit() {
  loading.value = true;
  errorMessage.value = '';

  const rawToken = tokenInput.value.trim().toUpperCase();

  try {
    // Detect local share tokens (LOKAL- prefix)
    if (rawToken.startsWith('LOKAL-')) {
      try {
        const result = joinByLocalToken(rawToken);
        emit('auth-success', {
          authType: 'local',
          username: result.ownerUsername,
          shareToken: result.shareToken,
        });
        return;
      } catch {
        // Fallback: If token is not registered locally, check Supabase
        const session = await getSessionByToken(rawToken);
        if (session) {
          emit('auth-success', {
            authType: 'cloud',
            sessionId: session.id,
            token: session.token,
            sessionName: session.name,
          });
          return;
        } else {
          errorMessage.value = 'Token lokal tidak ditemukan di perangkat ini maupun di cloud.';
          return;
        }
      }
    }

    // Cloud token (MOMEN- prefix or standard session token)
    const session = await getSessionByToken(rawToken);
    if (!session) {
      errorMessage.value = 'Token tidak ditemukan. Periksa kembali penulisan token Anda.';
      return;
    }
    emit('auth-success', {
      authType: 'cloud',
      sessionId: session.id,
      token: session.token,
      sessionName: session.name,
    });
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal terhubung ke server.';
  } finally {
    loading.value = false;
  }
}

async function handleCreateNewTimeline() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const session = await createSession();
    emit('auth-success', {
      authType: 'cloud',
      sessionId: session.id,
      token: session.token,
      sessionName: session.name,
    });
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal membuat timeline baru.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* ── Overlay ───────────────────────────────────────────────────────── */
.paper-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(18, 14, 28, 0.65);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 16px;
  box-sizing: border-box;
}

/* ── Card Sheet (overflow: visible ensures top tape is never clipped) ── */
.gwen-auth-card-sheet {
  position: relative;
  max-width: 360px;
  width: 100%;
  max-height: 90vh;
  background: #fffef8;
  background-image: repeating-linear-gradient(transparent, transparent 27px, #ebe7dc 28px);
  border: 3px solid #1f1412;
  border-radius: 20px;
  box-shadow: 6px 6px 0 #1f1412;
  display: flex;
  flex-direction: column;
  overflow: visible;
  transform: rotate(-0.5deg);
  box-sizing: border-box;
}

/* ── Washi Tape Accent: fully visible with entire dashed outline ───── */
.paper-washi-tape {
  position: absolute;
  top: -11px;
  left: 50%;
  transform: translateX(-50%) rotate(1deg);
  width: 110px;
  height: 22px;
  background: rgba(254, 240, 138, 0.95);
  border: 1.5px dashed #1f1412;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.12);
  z-index: 20;
  pointer-events: none;
  box-sizing: border-box;
}

/* ── Scrollable Body: handles inner scroll cleanly ─────────────────── */
.gwen-auth-scroll-body {
  width: 100%;
  max-height: calc(90vh - 20px);
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 17px;
  display: flex;
  flex-direction: column;
  -webkit-overflow-scrolling: touch;
}

/* ── Header ────────────────────────────────────────────────────────── */
.paper-header {
  padding: 22px 18px 8px;
  text-align: left;
}

.paper-header-top-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.paper-stamp-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fee2e2;
  color: #991b1b;
  border: 1.5px solid #1f1412;
  padding: 2px 8px;
  border-radius: 999px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.tag-token {
  background: #bae6fd;
  color: #0369a1;
  border-color: #1f1412;
}

.paper-title {
  font-family: 'Space Grotesk', 'Outfit', sans-serif;
  font-size: 1.35rem;
  font-weight: 800;
  color: #1f1412;
  margin: 4px 0 2px;
  line-height: 1.2;
}

.auth-modal-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  color: #4b4b62;
  margin: 4px 0 0;
  line-height: 1.4;
}

.auth-modal-subtitle code {
  background: #f1f0ea;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: 'Space Grotesk', monospace;
  font-size: 0.74rem;
  color: #1f1412;
  border: 1px solid #d1cfc7;
}

.paper-perforated-line {
  border-bottom: 2px dashed #d1cfc7;
  margin: 10px 0 14px;
  width: 100%;
}

/* ── Form ──────────────────────────────────────────────────────────── */
.gwen-auth-form {
  padding: 0 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gwen-form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.gwen-form-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #1f1412;
}

.gwen-label-pill {
  font-family: 'Outfit', sans-serif;
  font-size: 0.58rem;
  font-weight: 800;
  background: #fef08a;
  color: #1f1412;
  border: 1px solid #1f1412;
  padding: 1px 5px;
  border-radius: 4px;
}

.gwen-label-pill.pill-cloud {
  background: #bae6fd;
  color: #0369a1;
}

.gwen-brutal-input {
  width: 100%;
  padding: 10px 12px;
  background: #ffffff;
  border: 2px solid #1f1412;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  color: #1f1412;
  outline: none;
  box-sizing: border-box;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.gwen-brutal-input:focus {
  box-shadow: 2.5px 2.5px 0 #1f1412;
  transform: translate(-1px, -1px);
}

.token-uppercase {
  text-transform: uppercase;
  font-family: 'Space Grotesk', monospace;
  letter-spacing: 1.5px;
  font-weight: 800;
  font-size: 0.95rem;
  text-align: center;
}

.gwen-brutal-input:disabled {
  background: #f1f0ea;
  opacity: 0.7;
  cursor: not-allowed;
}

/* ── Error Box ─────────────────────────────────────────────────────── */
.gwen-auth-error-box {
  background: #fee2e2;
  border: 1.5px solid #ef4444;
  border-radius: 6px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: #991b1b;
  line-height: 1.35;
}

/* ── Button Wrapper & Buttons ──────────────────────────────────────── */
.gwen-btn-wrap {
  position: relative;
  width: 100%;
}

.gwen-btn-shadow {
  position: absolute;
  inset: 0;
  background: #1f1412;
  border-radius: 8px;
  transform: translate(3.5px, 3.5px);
  z-index: 1;
}

.gwen-auth-submit-btn {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 11px;
  border: 2px solid #1f1412;
  border-radius: 8px;
  font-family: 'Space Grotesk', 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  color: #1f1412;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

/* Warm yellow for Masuk (Screenshot 2) */
.btn-yellow {
  background: #fbbf24;
}

/* Lavender / soft purple for Buat Timeline Baru (Screenshot 2) */
.btn-lavender {
  background: #c7c4f5;
}

.gwen-auth-submit-btn:hover:not(:disabled) {
  transform: translate(-1.5px, -1.5px);
}

.gwen-auth-submit-btn:active:not(:disabled) {
  transform: translate(2px, 2px);
}

.gwen-auth-submit-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

/* ── Divider: ATAU ─────────────────────────────────────────────────── */
.gwen-auth-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px 4px;
}

.divider-line {
  flex: 1;
  height: 1.5px;
  background: #1f1412;
  opacity: 0.25;
}

.divider-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.7rem;
  font-weight: 800;
  color: #1f1412;
  letter-spacing: 1px;
}

/* ── Create Section ────────────────────────────────────────────────── */
.gwen-create-section {
  padding: 0 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
}

.gwen-create-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: #4b4b62;
  margin: 0;
}

/* ── Footer: New Dedicated "Pilih Cara Masuk" Button ──────────────── */
.paper-footer {
  padding: 14px 18px 18px;
}

.gwen-btn-back-selector {
  width: 100%;
  min-height: 44px;
  padding: 10px 16px;
  background: #fffef8;
  border: 2px solid #1f1412;
  box-shadow: 3px 3px 0 #1f1412;
  border-radius: 8px;
  font-family: 'Space Grotesk', 'Outfit', sans-serif;
  font-size: 0.88rem;
  font-weight: 800;
  color: #1f1412;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease;
  box-sizing: border-box;
}

.gwen-btn-back-selector:hover:not(:disabled) {
  background: #fefce8;
  transform: translate(-1.5px, -1.5px);
  box-shadow: 4.5px 4.5px 0 #1f1412;
}

.gwen-btn-back-selector:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 #1f1412;
}

.gwen-btn-back-selector:focus-visible {
  outline: 2px solid #db2777;
  outline-offset: 2px;
}

.gwen-btn-back-selector:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.gwen-btn-back-selector i {
  font-size: 0.85rem;
  transition: transform 0.15s ease;
}

.gwen-btn-back-selector:hover:not(:disabled) i {
  transform: translateX(-3px);
}

/* ── Transition ────────────────────────────────────────────────────── */
.paper-pop-enter-active,
.paper-pop-leave-active {
  transition: opacity 0.2s ease;
}

.paper-pop-enter-active .paper-sheet-card,
.paper-pop-leave-active .paper-sheet-card {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}

.paper-pop-enter-from,
.paper-pop-leave-to {
  opacity: 0;
}

.paper-pop-enter-from .paper-sheet-card,
.paper-pop-leave-to .paper-sheet-card {
  opacity: 0;
  transform: scale(0.92) rotate(-3deg);
}
</style>
