<template>
  <Teleport to="body">
    <Transition name="orig-modal-pop">
      <div class="orig-modal-overlay" @click.self="$emit('close')">
        <div class="orig-modal-card" role="dialog" aria-modal="true" aria-labelledby="orig-token-title">

          <!-- Header -->
          <div class="orig-modal-header">
            <div class="orig-modal-eyebrow">
              <span class="orig-eyebrow-icon">
                <i class="fa-solid fa-cloud" aria-hidden="true"></i>
              </span>
              <span class="orig-eyebrow-label">TOKEN SESI</span>
            </div>
            <h2 id="orig-token-title" class="orig-modal-title">Masuk via Token Sesi</h2>
            <p class="orig-modal-subtitle">
              Masukkan token cloud (<code>MOMEN-XXXX-XXXX</code>) atau token lokal (<code>LOKAL-XXXX-XXXX</code>) untuk bergabung ke timeline:
            </p>
          </div>

          <!-- Divider -->
          <div class="orig-divider-line" aria-hidden="true"></div>

          <!-- Scrollable Body -->
          <div class="orig-modal-body">

            <!-- Form: Join with Token -->
            <form @submit.prevent="handleTokenSubmit" class="orig-auth-form" novalidate>

              <!-- Token Input -->
              <div class="orig-form-group">
                <label for="orig-token-input" class="orig-form-label">
                  Token Sesi
                  <span class="orig-field-badge orig-field-badge-orange">Cloud / Lokal</span>
                </label>
                <input
                  type="text"
                  id="orig-token-input"
                  v-model="tokenInput"
                  required
                  placeholder="MOMEN-XXXX-XXXX"
                  class="orig-input orig-input-token"
                  autocomplete="off"
                  :disabled="loading"
                  spellcheck="false"
                  autocorrect="off"
                  autocapitalize="characters"
                />
              </div>

              <!-- Error Alert -->
              <div v-if="errorMessage" class="orig-alert orig-alert-error" role="alert">
                <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                <span>{{ errorMessage }}</span>
              </div>

              <!-- Submit: Masuk -->
              <button
                type="submit"
                class="orig-btn orig-btn-orange"
                :disabled="loading"
              >
                <i v-if="loading" class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
                <i v-else class="fa-solid fa-right-to-bracket" aria-hidden="true"></i>
                <span>{{ loading ? 'Memeriksa...' : 'Masuk' }}</span>
              </button>
            </form>

            <!-- Divider: ATAU -->
            <div class="orig-or-divider" aria-hidden="true">
              <span class="orig-or-line"></span>
              <span class="orig-or-text">ATAU</span>
              <span class="orig-or-line"></span>
            </div>

            <!-- Create New Timeline -->
            <div class="orig-create-section">
              <p class="orig-create-subtitle">Belum punya timeline bersama?</p>
              <button
                type="button"
                class="orig-btn orig-btn-secondary"
                id="btn-orig-create-timeline"
                @click="handleCreateNewTimeline"
                :disabled="loading"
              >
                <i v-if="loading" class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
                <i v-else class="fa-solid fa-plus" aria-hidden="true"></i>
                <span>{{ loading ? 'Membuat...' : 'Buat Timeline Baru' }}</span>
              </button>
            </div>

          </div>

          <!-- Footer: Back to selector -->
          <div class="orig-modal-footer">
            <button
              type="button"
              class="orig-btn-back"
              @click="$emit('back')"
              :disabled="loading"
            >
              <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
              <span>Pilih Cara Masuk</span>
            </button>
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
      errorMessage.value = 'Token tidak ditemukan. Periksa kembali penulisan token kamu.';
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
/* ── Overlay ─────────────────────────────────────────────────────────── */
.orig-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1050;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  box-sizing: border-box;
}

/* ── Card ─────────────────────────────────────────────────────────────── */
.orig-modal-card {
  position: relative;
  max-width: 360px;
  width: 100%;
  max-height: 90vh;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.08),
    0 4px 10px -2px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* ── Header ──────────────────────────────────────────────────────────── */
.orig-modal-header {
  padding: 22px 20px 0;
}

.orig-modal-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  padding: 3px 8px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}

.orig-eyebrow-icon {
  display: flex;
  align-items: center;
  font-size: 0.7rem;
}

.orig-eyebrow-label {
  text-transform: uppercase;
}

.orig-modal-title {
  margin: 0 0 4px;
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.orig-modal-subtitle {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.45;
}

.orig-modal-subtitle code {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 0.76rem;
  color: #0f172a;
}

/* ── Divider ─────────────────────────────────────────────────────────── */
.orig-divider-line {
  height: 1px;
  background: #f1f5f9;
  margin: 14px 0 0;
}

/* ── Scrollable Body ─────────────────────────────────────────────────── */
.orig-modal-body {
  flex: 1;
  padding: 16px 20px 12px;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  gap: 13px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.orig-modal-body::-webkit-scrollbar { display: none; }

/* ── Form ────────────────────────────────────────────────────────────── */
.orig-auth-form {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.orig-form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.orig-form-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
}

.orig-field-badge {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  border-radius: 4px;
  padding: 1px 6px;
  background: #f3f0ff;
  color: #6f6bd8;
  border: 1px solid #ddd9f8;
}

.orig-field-badge-orange {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.orig-input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: #0f172a;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  box-sizing: border-box;
  -webkit-appearance: none;
}

.orig-input:focus {
  border-color: #f97316;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12);
}

.orig-input:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.orig-input-token {
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 700;
  font-size: 0.95rem;
}

/* ── Alerts ──────────────────────────────────────────────────────────── */
.orig-alert {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.45;
}

.orig-alert i {
  font-size: 0.85rem;
  margin-top: 1px;
  flex-shrink: 0;
}

.orig-alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

/* ── Buttons ─────────────────────────────────────────────────────────── */
.orig-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease, background-color 0.15s ease;
}

.orig-btn-orange {
  background: #ea580c;
  color: #ffffff;
  border: 1px solid #c2410c;
  box-shadow: 0 2px 6px rgba(234, 88, 12, 0.25);
}

.orig-btn-orange:hover:not(:disabled) {
  background: #c2410c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(234, 88, 12, 0.32);
}

.orig-btn-orange:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(234, 88, 12, 0.2);
}

.orig-btn-orange:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.orig-btn-secondary {
  background: #f8fafc;
  color: #334155;
  box-shadow: none;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 11px 16px;
}

.orig-btn-secondary:hover:not(:disabled) {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.orig-btn-secondary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}

.orig-btn-secondary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ── ATAU Divider ────────────────────────────────────────────────────── */
.orig-or-divider {
  display: flex;
  align-items: center;
  gap: 10px;
}

.orig-or-line {
  flex: 1;
  height: 1px;
  background: #f1f5f9;
}

.orig-or-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

/* ── Create Section ──────────────────────────────────────────────────── */
.orig-create-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.orig-create-subtitle {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  color: #64748b;
  text-align: center;
}

/* ── Footer ──────────────────────────────────────────────────────────── */
.orig-modal-footer {
  padding: 14px 20px 18px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
}

.orig-btn-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  padding: 9px 20px;
  transition: all 0.15s ease;
}

.orig-btn-back:hover:not(:disabled) {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.orig-btn-back:active:not(:disabled) {
  transform: translateY(0);
}

.orig-btn-back:focus-visible {
  outline: 2px solid #ea580c;
  outline-offset: 2px;
}

.orig-btn-back:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Transition ──────────────────────────────────────────────────────── */
.orig-modal-pop-enter-active {
  transition: opacity 0.22s ease;
}
.orig-modal-pop-leave-active {
  transition: opacity 0.18s ease;
}
.orig-modal-pop-enter-active .orig-modal-card,
.orig-modal-pop-leave-active .orig-modal-card {
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease;
}
.orig-modal-pop-enter-from,
.orig-modal-pop-leave-to { opacity: 0; }
.orig-modal-pop-enter-from .orig-modal-card,
.orig-modal-pop-leave-to .orig-modal-card {
  opacity: 0;
  transform: scale(0.94) translateY(10px);
}

@media (prefers-reduced-motion: reduce) {
  .orig-modal-pop-enter-active,
  .orig-modal-pop-leave-active { transition: opacity 0.1s ease; }
  .orig-modal-pop-enter-active .orig-modal-card,
  .orig-modal-pop-leave-active .orig-modal-card { transition: opacity 0.1s ease; }
  .orig-modal-pop-enter-from .orig-modal-card,
  .orig-modal-pop-leave-to .orig-modal-card { transform: none; }
}
</style>
