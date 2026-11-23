<template>
  <Teleport to="body">
    <Transition name="orig-modal-pop">
      <div class="orig-modal-overlay" @click.self="$emit('close')">
        <div class="orig-modal-card" role="dialog" aria-modal="true" aria-labelledby="orig-local-title">

          <!-- Header -->
          <div class="orig-modal-header">
            <div class="orig-modal-eyebrow">
              <span class="orig-eyebrow-icon">
                <i class="fa-solid fa-mobile-screen" aria-hidden="true"></i>
              </span>
              <span class="orig-eyebrow-label">AKUN LOKAL</span>
            </div>
            <h2 id="orig-local-title" class="orig-modal-title">
              {{ isSignUp ? 'Buat Akun Lokal' : 'Masuk ke Akun Lokal' }}
            </h2>
            <p class="orig-modal-subtitle">
              {{ isSignUp
                ? 'Data tersimpan di perangkat ini saja. Buat akun baru:'
                : 'Masukkan username dan password akun lokal kamu:'
              }}
            </p>
          </div>

          <!-- Divider -->
          <div class="orig-divider-line" aria-hidden="true"></div>

          <!-- Scrollable Body -->
          <div class="orig-modal-body">

            <!-- Info Banner (sign up only) -->
            <div v-if="isSignUp" class="orig-info-banner" role="note">
              <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
              <span>Data hanya tersimpan di HP ini. Tidak perlu internet untuk masuk.</span>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="orig-auth-form" novalidate>

              <!-- Username -->
              <div class="orig-form-group">
                <label for="orig-local-username" class="orig-form-label">
                  Username
                  <span v-if="isSignUp" class="orig-field-badge">Unik di HP</span>
                </label>
                <input
                  type="text"
                  id="orig-local-username"
                  v-model="username"
                  required
                  placeholder=""
                  class="orig-input"
                  autocomplete="username"
                  :disabled="loading"
                  spellcheck="false"
                  autocorrect="off"
                  autocapitalize="none"
                />
              </div>

              <!-- Password -->
              <div class="orig-form-group">
                <label for="orig-local-password" class="orig-form-label">
                  Password
                  <span v-if="isSignUp" class="orig-field-badge">Min. 6 karakter</span>
                </label>
                <input
                  type="password"
                  id="orig-local-password"
                  v-model="password"
                  required
                  :placeholder="isSignUp ? 'Minimal 6 karakter' : '••••••••'"
                  class="orig-input"
                  autocomplete="current-password"
                  :disabled="loading"
                />
              </div>

              <!-- Error Alert -->
              <div v-if="errorMessage" class="orig-alert orig-alert-error" role="alert">
                <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                <span>{{ errorMessage }}</span>
              </div>

              <!-- Success Alert -->
              <div v-if="successMessage" class="orig-alert orig-alert-success" role="alert">
                <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
                <span>{{ successMessage }}</span>
              </div>

              <!-- Submit -->
              <button
                type="submit"
                class="orig-btn orig-btn-primary"
                :disabled="loading"
              >
                <i v-if="loading" class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
                <i v-else-if="isSignUp" class="fa-solid fa-user-plus" aria-hidden="true"></i>
                <i v-else class="fa-solid fa-arrow-right-to-bracket" aria-hidden="true"></i>
                <span>{{ loading ? 'Memproses...' : (isSignUp ? 'Buat Akun' : 'Masuk') }}</span>
              </button>
            </form>

            <!-- Toggle Login / Signup -->
            <div class="orig-toggle-row">
              <button
                type="button"
                class="orig-toggle-link"
                @click="toggleSignUpMode"
                :disabled="loading"
              >
                {{ isSignUp
                  ? 'Sudah punya akun lokal? Masuk di sini'
                  : 'Belum punya akun lokal? Buat sekarang'
                }}
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
import { createLocalUser, loginLocalUser } from '../../data/localStore';

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

const username = ref('');
const password = ref('');
const isSignUp = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

function toggleSignUpMode() {
  isSignUp.value = !isSignUp.value;
  errorMessage.value = '';
  successMessage.value = '';
}

async function handleSubmit() {
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  if (isSignUp.value && password.value.length < 6) {
    errorMessage.value = 'Password minimal 6 karakter.';
    loading.value = false;
    return;
  }

  try {
    const session = isSignUp.value
      ? await createLocalUser(username.value, password.value)
      : await loginLocalUser(username.value, password.value);

    emit('auth-success', {
      authType: 'local',
      username: session.username,
      shareToken: session.shareToken,
    });
  } catch (err: any) {
    errorMessage.value = err.message || 'Terjadi kesalahan saat autentikasi akun lokal.';
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
  background: #eef2ff;
  color: #4f46e5;
  border: 1px solid #e0e7ff;
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
  /* Hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.orig-modal-body::-webkit-scrollbar { display: none; }

/* ── Info Banner ─────────────────────────────────────────────────────── */
.orig-info-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: #334155;
  line-height: 1.45;
}

.orig-info-banner i {
  font-size: 0.8rem;
  margin-top: 1px;
  color: #4f46e5;
  flex-shrink: 0;
}

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
  background: #eef2ff;
  color: #4f46e5;
  border: 1px solid #e0e7ff;
  border-radius: 4px;
  padding: 1px 6px;
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
  border-color: #6f6bd8;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(111, 107, 216, 0.12);
}

.orig-input:disabled {
  opacity: 0.55;
  cursor: not-allowed;
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

.orig-alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
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

.orig-btn-primary {
  background: #6f6bd8;
  color: #ffffff;
  border: 1px solid #5753c4;
  box-shadow: 0 2px 6px rgba(111, 107, 216, 0.25);
}

.orig-btn-primary:hover:not(:disabled) {
  background: #5d59cb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(111, 107, 216, 0.32);
}

.orig-btn-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(111, 107, 216, 0.2);
}

.orig-btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

/* ── Toggle Row ──────────────────────────────────────────────────────── */
.orig-toggle-row {
  display: flex;
  justify-content: center;
}

.orig-toggle-link {
  background: none;
  border: none;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: #6f6bd8;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  padding: 4px;
  transition: color 0.15s ease;
}

.orig-toggle-link:hover:not(:disabled) { color: #4f46e5; }
.orig-toggle-link:disabled { opacity: 0.5; cursor: not-allowed; }

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
  outline: 2px solid #6f6bd8;
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
