<script setup lang="ts">
import { Device } from '@capacitor/device';
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import BottomNav from './components/layout/BottomNav.vue';
import HeroHeader from './components/layout/HeroHeader.vue';
import AddMomentModal from './components/modals/AddMomentModal.vue';
import AuthModal from './components/modals/AuthModal.vue';
import EditMomentModal from './components/modals/EditMomentModal.vue';
import GlobalMapModal from './components/modals/GlobalMapModal.vue';
import { addMoment, createSessionWithToken, getSessionByToken, getTimelineData, registerCollaborator, removeCollaborator, saveAliasToSession } from './data/authService';
import { addLocalMoment, getActiveLocalSession, getActiveLocalShareToken, getLocalTimeline, logoutLocalUser } from './data/localStore';
import type { TimelineData, TimelineMoment } from './data/timeline';
import HomeView from './views/HomeView.vue';
import OnboardingView from './views/OnboardingView.vue';
import SettingsView from './views/SettingsView.vue';
import TimelineView from './views/TimelineView.vue';
import RuangKitaView from './views/RuangKitaView.vue';
import GestureBackIndicator from './components/layout/GestureBackIndicator.vue';
import { useAppAutoUpdate } from './composables/useAppAutoUpdate';
import { useBackButton, registerBackHandler } from './composables/useBackButton';
import { useGestureNavigation, pushNavState } from './composables/useGestureNavigation';

// ── App Auto-Update (No close/reopen needed) ───────────────────────────
const { updateToastMessage, triggerManualRefresh } = useAppAutoUpdate();

// ── Android Hardware Back Button ──────────────────────────────────────
// Initialized after state declarations below – see "Back Button Setup" block.

// ── App State ─────────────────────────────────────────────────────────
type AuthType = 'cloud' | 'local' | null;

const showOnboarding = ref(true);
const showAuthModal = ref(false);
const authModalMode = ref<'token' | 'local'>('token');
const activeTab = ref<'home' | 'space' | 'timeline' | 'settings'>('home');
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDetailModal = ref(false);  // tracks when detail modal inside TimelineView is open
const activeEditMoment = ref<TimelineData | null>(null);

// ── Login Success Pop-up Message ──────────────────────────────────────
const showLoginSuccessPopup = ref(false);
const loginSuccessSubtext = ref('Selamat datang di WHOOSH!');
let loginPopupTimer: ReturnType<typeof setTimeout> | null = null;

function triggerLoginSuccessPopup(subtext = 'Selamat datang di WHOOSH!') {
  loginSuccessSubtext.value = subtext;
  showLoginSuccessPopup.value = true;
  if (loginPopupTimer) clearTimeout(loginPopupTimer);
  loginPopupTimer = setTimeout(() => {
    showLoginSuccessPopup.value = false;
  }, 2500);
}

const authType = ref<AuthType>(null);
const activeCloudSession = ref<{ id: string; token: string; name: string } | null>(null);
const activeLocalUsername = ref<string | null>(null);
const activeLocalShareToken = ref<string | null>(null); // ← NEW: local share token
const userAlias = ref<string>(''); // ← NEW: customizable username/alias
const collaborators = ref<string[]>([]); // ← NEW: real-time collaborators list
const isSessionOwner = ref<boolean>(localStorage.getItem('tl_is_session_owner') !== 'false');
const selectedCompanion = ref<string | null>(localStorage.getItem('whoosh_selected_companion') || null);

const timelineItems = ref<TimelineData[]>([]);

const loading = ref(false);
const loadingMessage = ref('Memuat...');
const deviceBrand = ref<string>('');

// ── Device Brand Detection ────────────────────────────────────────────

/**
 * Extract the raw device segment from Android WebView User-Agent.
 * UA format: "Mozilla/5.0 (Linux; Android 11; <MODEL> Build/...; wv) ..."
 */
function getRawModelFromUA(): string {
  const ua = navigator.userAgent;
  const match = ua.match(/\(Linux; Android [^;]+; ([^;)]+?)(?:\s+Build\/|Build\/|\))/);
  return match ? match[1].trim() : '';
}

/**
 * Detect brand name from Android model code prefixes/patterns.
 * Returns empty string if brand cannot be determined.
 */
function detectBrandFromModel(model: string): string {
  const m = model.toUpperCase().trim();

  // ── Brand name already in string (e.g. "Xiaomi 2210132C", "Samsung Galaxy S21") ──
  const explicitBrands = [
    'Samsung', 'Xiaomi', 'POCO', 'Redmi', 'OPPO', 'Realme', 'Vivo', 'OnePlus',
    'Huawei', 'Honor', 'Motorola', 'Nokia', 'Sony', 'Google', 'ASUS', 'Lenovo',
    'Infinix', 'Tecno', 'Nothing', 'Meizu', 'ZTE', 'TCL'
  ];
  for (const brand of explicitBrands) {
    if (m.startsWith(brand.toUpperCase())) return brand;
  }

  // ── Samsung: SM-, GT-, SGH-, SCH-, SHV-, SPH- ──
  if (/^(SM-|GT-|SGH-|SCH-|SHV-|SPH-)/.test(m)) return 'Samsung';

  // ── Redmi (Xiaomi sub-brand — separate brand identity) ──
  // 4 digits + DRA/DRM/DRB/DRC → Redmi Note series (e.g. 2510DRA23E = Redmi Note 15 4G)
  if (/^\d{4}(DRA|DRM|DRB|DRC)/.test(m)) return 'Redmi';
  // RN suffix in code → Redmi (e.g. 23100RN82L = Redmi 13C, 23053RN02A = Redmi 12)
  if (/^\d{5}RN\d/.test(m)) return 'Redmi';
  // PCD suffix → Redmi Note 13 series (e.g. 23049PCD8G)
  if (/^\d{5}PCD/.test(m)) return 'Redmi';
  // Known Redmi 5-digit numeric prefixes
  if (/^(22120|23100|23049|23053|24117|2304F|2408F|22111)/.test(m)) return 'Redmi';
  // Old Redmi: HM prefix (Hongmi)
  if (/^HM[_\s]/.test(m)) return 'Redmi';

  // ── Xiaomi (Mi series & POCO) ──
  // M + 4 digits (e.g. M2011K2G = Xiaomi Mi 11, M2007J20CI = POCO X3)
  if (/^M\d{4}[A-Z]/.test(m)) return 'Xiaomi';
  // 4 digits + Xiaomi Mi series suffix (MSF/MJG/MCE etc: Xiaomi 11/12/13 series)
  if (/^\d{4}(MSF|MJG|MCE|EMG|ENG|MJT|116|117|118|123|124|125|126)/.test(m)) return 'Xiaomi';

  // ── Realme ──
  // RMX prefix (most reliable Realme identifier)
  if (/^RMX/.test(m)) return 'Realme';
  // Confirmed Realme 4-digit patterns (DA/DB/DC/DM with digit suffix)
  if (/^\d{4}(DA\d|DB\d|DC\d|DM\d)/.test(m)) return 'Realme';

  // ── OPPO ──
  if (/^(CPH|PDHM|PDVM|PHK|PEQ|PGM|PEGM|PFUM)/.test(m)) return 'OPPO';

  // ── Vivo ──
  if (/^(V\d{4}A|V\d{4}T|PD\d{4}|I\d{4}(BA|EL))/.test(m)) return 'Vivo';

  // ── OnePlus ──
  if (/^(IN2|IN1|GM1|LE2|LE1|BE20|KB2|AC2|HD1|DE2|CPH\d{4}OBT)/.test(m)) return 'OnePlus';
  if (/^(ONE\s?PLUS|1\+)/.test(m)) return 'OnePlus';

  // ── Huawei ──
  if (/^(ELS|ANE|PRA|ALP|LYA|HMA|OCE|JSN|VOG|MAR|CLT|INE|DUB|LLD|ARS|MRD|ARE|BLA|RNE|ATU|AUM|COR|BND|CML|VTR|BKL|PCT|CAN|TAS|GOT|JKM|LIO|SEA|EVR|YAL|HRY|ELS|CDY|NEN|NOH|JNY|NNA|BAH|WGR|DBY)/.test(m)) return 'Huawei';

  // ── Honor (spun off from Huawei) ──
  if (/^(NTH|ANY|CRT|TNN|TNA|RLM|GIA|FNE|REA|CMA|DEA|VNE|BNE|DNE|WDY|CLE|ROB|FRI|ELZ|MAD|VER|PPA|NCE|CHL|CLA|CHM|PLK|CAM|ALE|MLA|TAG|NXT|LON|VNS|FIG|KII|KIW|KSA|MED|BAC|WAS|VEN)/.test(m)) return 'Honor';

  // ── Motorola ──
  if (/^XT\d{4}/.test(m)) return 'Motorola';
  if (/^MOTO/.test(m)) return 'Motorola';

  // ── Nokia ──
  if (/^TA-\d{4}/.test(m)) return 'Nokia';

  // ── Sony Xperia ──
  if (/^(XQ-|SOG\d{2}|SO-\d{2}[A-Z]|SOV\d{2})/.test(m)) return 'Sony';
  if (/^[GHIJ]\d{4}$/.test(m)) return 'Sony'; // G8342 etc.

  // ── LG ──
  if (/^(LM-|LG-)/.test(m)) return 'LG';

  // ── ASUS ──
  if (/^(ZB\d{3}|ZS\d{3}|AI22|ASUS_|ROG|ZE\d{3})/.test(m)) return 'ASUS';

  // ── Lenovo ──
  if (/^(TB-|K\d{5}(C|F)|L\d{5})/.test(m)) return 'Lenovo';

  // ── Google Pixel ──
  if (/^PIXEL/.test(m)) return 'Google';

  // ── Infinix ──
  if (/^(X\d{3}[A-Z]?$|X\d{4}[A-Z]?$)/.test(m)) return 'Infinix';

  // ── Tecno ──
  if (/^(TECNO|KG\d|KE\d|KH\d|KC\d|CD\d|LC\d|CE\d|CF\d|CH\d)/.test(m)) return 'Tecno';

  // ── Nothing Phone ──
  if (/^(A063|A065)/.test(m)) return 'Nothing';

  return '';
}

// Fetch device info — detects brand from UA model code
async function fetchDeviceInfo() {
  const rawModel = getRawModelFromUA();

  if (rawModel && rawModel !== 'unknown') {
    // Try to identify brand from model code
    const brand = detectBrandFromModel(rawModel);
    deviceBrand.value = brand || rawModel; // Show brand if detected, else raw model code
    return;
  }

  // Fallback: @capacitor/device native plugin
  try {
    const info = await Device.getInfo();
    const manufacturer = info.manufacturer;
    if (manufacturer && manufacturer !== 'unknown') {
      deviceBrand.value = manufacturer.charAt(0).toUpperCase() + manufacturer.slice(1);
    } else {
      deviceBrand.value = 'Perangkat Android';
    }
  } catch (err) {
    console.error('Failed to get device info:', err);
    deviceBrand.value = 'Perangkat Android';
  }
}


// ── Computed ──────────────────────────────────────────────────────────
const activeSessionToken = computed(() => activeCloudSession.value?.token ?? null);
// Session name for display (currently using userAlias instead)
// const activeSessionName = computed(() => activeCloudSession.value?.name ?? activeLocalUsername.value ?? null);
const isCloud = computed(() => authType.value === 'cloud');
const isLocal = computed(() => authType.value === 'local');

// ── Traveling Together & Member Summary (Warm Editorial) ──────────────
const showAllMembersPopup = ref(false);
const filteredCollaborators = computed(() => collaborators.value.filter(c => c !== userAlias.value));
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

// ── Collaborator & Alias Helpers ──────────────────────────────────────

/** Returns a stable device key that survives reinstalls (via Device plugin UUID or fallback) */
async function getDeviceKey(): Promise<string> {
  try {
    const info = await Device.getId();
    // identifier is stable on Android between reinstalls (Android ID)
    return (info as any).identifier || (info as any).uuid || '';
  } catch {
    return '';
  }
}

/**
 * Generates a deterministic, human-readable alias from a device key.
 * The same deviceKey always produces the same alias — no randomness.
 */
function buildAliasFromDeviceKey(deviceKey: string): string {
  // Use last 6 chars of device key as a stable suffix
  const suffix = deviceKey.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
  return `@Perangkat_${suffix || 'XXXX'}`;
}

/**
 * Initialises the user alias.
 * Priority:
 *  1. Already in localStorage → user may have manually set a custom alias (fastest path)
 *  2. Derived deterministically from Device.getId() → stable across reinstalls, no randomness
 *  3. Username for local mode (e.g. @parhan)
 * NOTE: There is NO random fallback. Same device = same alias, always.
 */
async function initUserAlias(username?: string, _sessionId?: string) {
  // 1) Already stored locally (same install, or user set a custom alias)
  const saved = localStorage.getItem('tl_user_alias');
  if (saved) {
    userAlias.value = saved;
    return;
  }

  let alias: string;

  if (username) {
    // 3) Local mode: use the actual username
    alias = `@${username}`;
  } else {
    // 2) Derive deterministically from stable device ID
    //    Device.getId() returns Android ID on Android — survives reinstalls
    const deviceKey = await getDeviceKey();
    if (deviceKey) {
      alias = buildAliasFromDeviceKey(deviceKey);
    } else {
      // Web/desktop fallback: use a persistent ID stored in localStorage under a
      // separate key that we try to preserve. If truly missing, generate once.
      let webId = localStorage.getItem('tl_device_id');
      if (!webId) {
        webId = Math.random().toString(36).substring(2, 10).toUpperCase();
        localStorage.setItem('tl_device_id', webId);
      }
      alias = `@Perangkat_${webId.slice(-6)}`;
    }
  }

  localStorage.setItem('tl_user_alias', alias);
  userAlias.value = alias;
}

async function syncCollaborators() {
  let sessionId = activeCloudSession.value?.id;
  if (!sessionId && isLocal.value && activeLocalShareToken.value) {
    try {
      const session = await getSessionByToken(activeLocalShareToken.value);
      if (session) sessionId = session.id;
    } catch {}
  }

  if (sessionId && userAlias.value) {
    try {
      const list = await registerCollaborator(sessionId, userAlias.value);
      collaborators.value = list;
    } catch (err) {
      console.warn('Gagal sinkronisasi kolaborator:', err);
    }
  }
}

// ── Profile Name Inline Editing ───────────────────────────────────────
const isEditingAlias = ref(false);
const editAliasInput = ref('');
const aliasInputRef = ref<HTMLInputElement | null>(null);

function startEditAlias() {
  editAliasInput.value = userAlias.value || '';
  isEditingAlias.value = true;
  nextTick(() => {
    aliasInputRef.value?.focus();
    aliasInputRef.value?.select();
  });
}

function cancelEditAlias() {
  isEditingAlias.value = false;
  editAliasInput.value = '';
}

async function saveInlineAlias() {
  const clean = editAliasInput.value.trim();
  if (!clean) {
    alert('Alias tidak boleh kosong!');
    return;
  }
  isEditingAlias.value = false;
  await applyAliasChange(clean);
}

async function changeAlias() {
  startEditAlias();
}

async function applyAliasChange(clean: string) {
  const old = userAlias.value;
  userAlias.value = clean;
  localStorage.setItem('tl_user_alias', clean);
  // Also persist to cloud so the new alias survives reinstall
  const sid = activeCloudSession.value?.id;
  if (sid) { _persistAliasToCloud(sid).catch(() => {}); }

  let sessionId = activeCloudSession.value?.id;
  if (!sessionId && isLocal.value && activeLocalShareToken.value) {
    try {
      const session = await getSessionByToken(activeLocalShareToken.value);
      if (session) sessionId = session.id;
    } catch {}
  }

  if (sessionId) {
    try {
      const list = await registerCollaborator(sessionId, clean, old);
      collaborators.value = list;
      alert(`Alias berhasil diubah menjadi: ${clean}`);
    } catch (err) {
      console.warn('Gagal update alias ke server:', err);
      alert('Alias disimpan secara lokal, gagal upload ke cloud.');
    }
  } else {
    alert(`Alias disimpan secara lokal.`);
  }
}

async function deleteAlias(aliasToRemove: string) {
  if (!confirm(`Hapus alias "${aliasToRemove}" dari sesi ini?`)) return;
  
  let sessionId = activeCloudSession.value?.id;
  if (!sessionId && isLocal.value && activeLocalShareToken.value) {
    try {
      const session = await getSessionByToken(activeLocalShareToken.value);
      if (session) sessionId = session.id;
    } catch {}
  }
  
  if (!sessionId) return;
  
  try {
    const list = await removeCollaborator(sessionId, aliasToRemove);
    collaborators.value = list;
  } catch (err) {
    console.error('Gagal menghapus alias:', err);
    alert('Gagal menghapus alias, periksa koneksi Anda.');
  }
}

// ── Back Button Setup (Android hardware back) ─────────────────────────
//
// Priority (highest → lowest):
//  1. Auth modal         6. Delete Search bar (collapse)
//  2. Add Moment modal   7. Speed-dial FAB (close)
//  3. Edit Moment modal  8. Non-home tab → go home
//  4. Logout modal       9. Home + double-press 2s → exit
//  5. Delete modal
//
// ── Tab History Stack (for accurate back gesture navigation across multiple tabs) ──
const tabHistory = ref<Array<'home' | 'space' | 'timeline' | 'settings'>>(['home']);
let isPoppingTab = false;

// Track tab navigation history
watch(activeTab, (newTab) => {
  if (isPoppingTab) return;
  const lastTab = tabHistory.value[tabHistory.value.length - 1];
  if (lastTab !== newTab) {
    tabHistory.value.push(newTab);
    if (tabHistory.value.length > 25) {
      tabHistory.value.shift();
    }
  }
  if (newTab !== 'home') pushNavState(newTab);
});

function goBackTab(): boolean {
  if (tabHistory.value.length > 1) {
    tabHistory.value.pop(); // Remove current tab
    const prev = tabHistory.value[tabHistory.value.length - 1];
    isPoppingTab = true;
    activeTab.value = prev;
    setTimeout(() => { isPoppingTab = false; }, 60);
    return true;
  }
  if (activeTab.value !== 'home') {
    isPoppingTab = true;
    activeTab.value = 'home';
    tabHistory.value = ['home'];
    setTimeout(() => { isPoppingTab = false; }, 60);
    return true;
  }
  return false;
}

const { exitToastVisible } = useBackButton({
  getActiveTab: () => activeTab.value,
  goBackTab,
  goHome: () => {
    isPoppingTab = true;
    activeTab.value = 'home';
    tabHistory.value = ['home'];
    setTimeout(() => { isPoppingTab = false; }, 60);
  },
  closeFab: () => {
    if (isFabOpen.value) { isFabOpen.value = false; return true; }
    return false;
  },
});

// Initialize Swipe Gesture Navigation (edge swipe left/right to go back)
useGestureNavigation();

watch(showAddModal, (v) => { if (v) pushNavState('add-modal'); });
watch(showEditModal, (v) => { if (v) pushNavState('edit-modal'); });
watch(showAuthModal, (v) => { if (v) pushNavState('auth-modal'); });

// Register per-modal handlers. They read reactive refs at call time so no
// stale closures. useBackButton resolves them highest-index-first.

registerBackHandler('detail-modal-global', () => {
  if (showDetailModal.value) {
    window.dispatchEvent(new CustomEvent('close-timeline-detail'));
    showDetailModal.value = false;
    return true;
  }
  return false;
});
registerBackHandler('auth-modal', () => {
  if (showAuthModal.value) { showAuthModal.value = false; return true; }
  return false;
});
registerBackHandler('add-modal', () => {
  if (showAddModal.value) { showAddModal.value = false; return true; }
  return false;
});
registerBackHandler('edit-modal', () => {
  if (showEditModal.value) { showEditModal.value = false; return true; }
  return false;
});
registerBackHandler('logout-modal', () => {
  if (showLogoutModal.value) { showLogoutModal.value = false; return true; }
  return false;
});
registerBackHandler('delete-modal', () => {
  if (showDeleteMomentModal.value) { closeDeleteMomentModal(); return true; }
  return false;
});
registerBackHandler('delete-search', () => {
  if (showDeleteSearch.value) {
    showDeleteSearch.value = false;
    deleteSearchQuery.value = '';
    return true;
  }
  return false;
});

// ── Auto-login on App Mount ───────────────────────────────────────────
onMounted(async () => {
  window.addEventListener('keydown', handleGlobalKeydown);
  fetchDeviceInfo();

  // Check for saved cloud token
  const savedToken = localStorage.getItem('tl_cloud_token');
  if (savedToken) {
    loading.value = true;
    loadingMessage.value = 'Menghubungkan sesi cloud...';
    try {
      const session = await getSessionByToken(savedToken);
      if (session) {
        activeCloudSession.value = session;
        authType.value = 'cloud';
        await initUserAlias(undefined, session.id);
        await fetchCloudTimeline(session.id);
        await syncCollaborators();
        // Save alias back to cloud in case this is a fresh install restoring
        await _persistAliasToCloud(session.id);
        showOnboarding.value = false;
        triggerLoginSuccessPopup(session.name ? `Sesi Cloud: ${session.name}` : 'Selamat datang kembali!');
        return;
      } else {
        localStorage.removeItem('tl_cloud_token');
      }
    } catch (err) {
      console.error('Cloud auto-login failed:', err);
    } finally {
      loading.value = false;
    }
  }

  // Check for saved local session
  const localSession = getActiveLocalSession();
  if (localSession) {
    activeLocalUsername.value = localSession.username;
    authType.value = 'local';
    activeLocalShareToken.value = getActiveLocalShareToken();
    await initUserAlias(localSession.username);
    loadLocalTimeline(localSession.username);
    await syncCollaborators();
    showOnboarding.value = false;
    triggerLoginSuccessPopup(`Akun: ${localSession.username}`);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});

/** Persist current alias to cloud so it survives reinstall */
async function _persistAliasToCloud(sessionId: string) {
  if (!userAlias.value || !sessionId) return;
  try {
    const deviceKey = await getDeviceKey();
    if (deviceKey) {
      await saveAliasToSession(sessionId, deviceKey, userAlias.value);
    }
  } catch { /* non-critical, ignore */ }
};


// ── Cloud Timeline ────────────────────────────────────────────────────
async function fetchCloudTimeline(sessionId: string) {
  loading.value = true;
  loadingMessage.value = 'Sinkronisasi data dari cloud...';
  try {
    const data = await getTimelineData(sessionId);
    timelineItems.value = data;
  } catch (err) {
    console.error('Failed to fetch cloud timeline:', err);
  } finally {
    loading.value = false;
  }
}

// ── Local Timeline ────────────────────────────────────────────────────
function loadLocalTimeline(username: string) {
  const localData = getLocalTimeline(username);
  timelineItems.value = localData;
  triggerLocalSync();

  function triggerLocalSync() {
    if (activeLocalShareToken.value) {
      syncLocalTimelineWithCloud(username, activeLocalShareToken.value);
    }
  }
}

let isLocalSyncing = false;

/**
 * Reconciles local storage moments with Supabase cloud database
 * for local accounts sharing their timeline.
 * Pass force=true to bypass the in-progress guard (used after explicit edits).
 */
async function syncLocalTimelineWithCloud(username: string, shareToken: string, force = false) {
  if (isLocalSyncing && !force) return;
  isLocalSyncing = true;

  try {
    // 1. Get or create corresponding session in Supabase cloud
    let session = await getSessionByToken(shareToken);
    if (!session) {
      session = await createSessionWithToken(shareToken, `Lokal: @${username}`);
    }

    // 2. Fetch data from both sources
    const cloudItems = await getTimelineData(session.id);
    const localItems = getLocalTimeline(username);

    // Build lookup maps by cloud ID (the stable Supabase UUID)
    // Local items may have a local_xxx ID (before first sync) or a cloud UUID (after sync)
    const cloudById = new Map(cloudItems.map(c => [c.id, c]));

    // Fallback signature using title+date only (NOT location, since location can change)
    const getSig = (item: any) =>
      `${(item.title || '').trim().toLowerCase()}|${(item.date || '').trim().toLowerCase()}`;

    const cloudBySig = new Map(cloudItems.map(c => [getSig(c), c]));

    let updated = false;
    const { updateMoment, addMomentPhoto } = await import('./data/authService');
    const { updateLocalMoment } = await import('./data/localStore');

    // A. Upload/update moments from local → cloud
    for (const localItem of localItems) {
      // Try to match by ID first (reliable after first sync)
      const matchById = cloudById.get(localItem.id);
      const isUUID = localItem.id && !localItem.id.toString().startsWith('local_');
      
      // Fallback: match by title+date signature ONLY if it's a local_ ID.
      // If it's a UUID and missing from cloud, it means it was deleted explicitly.
      const matchBySig = (!matchById && !isUUID) ? cloudBySig.get(getSig(localItem)) : null;
      const cloudMatch = matchById || matchBySig;

      if (!cloudMatch) {
        if (isUUID) {
          // This local item has a cloud UUID but is missing from the cloud.
          // This means it was deleted on another device. We should delete it locally!
          const { deleteLocalMoment } = await import('./data/localStore');
          deleteLocalMoment(username, localItem.id);
          updated = true;
        } else {
          // Truly new local moment — insert to cloud
          await addMoment(session.id, localItem, localItem.moments || [], username);
          updated = true;
        }
      } else {
        // Moment exists in cloud — update metadata if changed (e.g., location was edited)
        const metaChanged =
          localItem.title !== cloudMatch.title ||
          localItem.location !== cloudMatch.location ||
          localItem.date !== cloudMatch.date ||
          localItem.dotColor !== cloudMatch.dotColor ||
          localItem.rtl !== cloudMatch.rtl ||
          localItem.mapEmbedUrl !== cloudMatch.mapEmbedUrl;

        if (metaChanged && force) {
          await updateMoment(session.id, cloudMatch.id, {
            title: localItem.title,
            location: localItem.location,
            date: localItem.date,
            year: localItem.year,
            dotColor: localItem.dotColor,
            rtl: localItem.rtl,
            mapEmbedUrl: localItem.mapEmbedUrl || '',
            latitude: localItem.latitude,
            longitude: localItem.longitude,
          });
          updated = true;
        }

        // Sync extra photos: upload local extras that cloud doesn't have yet
        const localCount = (localItem.moments || []).length;
        const cloudCount = (cloudMatch.moments || []).length;
        if (localCount > cloudCount) {
          const photosToUpload = (localItem.moments || []).slice(cloudCount);
          for (const photo of photosToUpload) {
            await addMomentPhoto(cloudMatch.id, {
              title: photo.title || '',
              description: photo.description || '',
              image: photo.image,
              accentColor: photo.accentColor || ''
            });
          }
          updated = true;
        } else if (cloudCount > localCount) {
          // Download extra photos from cloud to local
          updateLocalMoment(username, localItem.id, { moments: cloudMatch.moments });
          updated = true;
        } else if (localCount === cloudCount && localCount > 0) {
          // Check if captions or titles differ
          const localPhotosStr = JSON.stringify((localItem.moments || []).map((m: any) => ({ t: m.title || '', d: m.description || '' })));
          const cloudPhotosStr = JSON.stringify((cloudMatch.moments || []).map((m: any) => ({ t: m.title || '', d: m.description || '' })));
          if (localPhotosStr !== cloudPhotosStr) {
            if (force) {
              const { clearMomentPhotos } = await import('./data/authService');
              await clearMomentPhotos(cloudMatch.id);
              for (const photo of (localItem.moments || [])) {
                await addMomentPhoto(cloudMatch.id, {
                  title: photo.title || '',
                  description: photo.description || '',
                  image: photo.image,
                  accentColor: photo.accentColor || ''
                });
                await new Promise(r => setTimeout(r, 10));
              }
              updated = true;
            } else {
              updateLocalMoment(username, localItem.id, { moments: cloudMatch.moments });
              updated = true;
            }
          }
        }
      }
    }

    // B. Download moments existing in cloud but missing locally
    const localIds = new Set(localItems.map(l => l.id));
    const localSigs = new Set(localItems.map(l => getSig(l)));
    for (const cloudItem of cloudItems) {
      if (!localIds.has(cloudItem.id) && !localSigs.has(getSig(cloudItem))) {
        addLocalMoment(username, cloudItem);
        updated = true;
      }
    }

    // C. Refresh UI if database reconciliation made additions
    if (updated) {
      timelineItems.value = getLocalTimeline(username);
    }
  } catch (err) {
    console.warn('Gagal sinkronisasi dengan database cloud (offline?):', err);
  } finally {
    isLocalSyncing = false;
  }
}



// ── Onboarding Handlers ───────────────────────────────────────────────
function handleChooseAccount() {
  authModalMode.value = 'local';
  showAuthModal.value = true;
}

function handleChooseToken() {
  authModalMode.value = 'token';
  showAuthModal.value = true;
}

function handleLearnMore() {
  // Information popup is displayed directly via custom in-app modal in OnboardingView
}

// ── Auth Modal Handlers ───────────────────────────────────────────────
async function handleAuthSuccess(result: {
  authType: 'cloud' | 'local';
  username?: string;
  sessionId?: string;
  token?: string;
  sessionName?: string;
  shareToken?: string;
  isOwner?: boolean;
}) {
  showAuthModal.value = false;
  loading.value = true;

  try {
    const isOwner = result.isOwner ?? true;
    isSessionOwner.value = isOwner;
    localStorage.setItem('tl_is_session_owner', isOwner ? 'true' : 'false');

    if (result.authType === 'cloud' && result.sessionId && result.token) {
      activeCloudSession.value = {
        id: result.sessionId,
        token: result.token,
        name: result.sessionName || 'Timeline Kami'
      };
      authType.value = 'cloud';
      localStorage.setItem('tl_cloud_token', result.token);
      await initUserAlias(undefined, result.sessionId);
      await fetchCloudTimeline(result.sessionId);
      await syncCollaborators();
      await _persistAliasToCloud(result.sessionId);
    } else if (result.authType === 'local' && result.username) {
      activeLocalUsername.value = result.username;
      authType.value = 'local';
      activeLocalShareToken.value = result.shareToken ?? getActiveLocalShareToken();
      await initUserAlias(result.username);
      loadLocalTimeline(result.username);
      await syncCollaborators();
    }


    showOnboarding.value = false;
    const sub = result.authType === 'cloud' && result.sessionName
      ? `Sesi Cloud: ${result.sessionName}`
      : (result.username ? `Akun: ${result.username}` : 'Selamat datang di WHOOSH!');
    triggerLoginSuccessPopup(sub);
  } catch (err) {
    console.error('Post-auth error:', err);
  } finally {
    loading.value = false;
  }
}

// ── Logout ────────────────────────────────────────────────────────────
const showLogoutModal = ref(false);

const logoutTokenInfo = computed(() => {
  if (isCloud.value && activeSessionToken.value) {
    return { label: 'Token Cloud', token: activeSessionToken.value, isCloud: true };
  } else if (activeLocalShareToken.value) {
    return { label: 'Token Lokal', token: activeLocalShareToken.value, isCloud: false };
  }
  return null;
});

function handleLogout() {
  showLogoutModal.value = true;
}

function confirmLogout() {
  showLogoutModal.value = false;
  localStorage.removeItem('tl_is_session_owner');
  localStorage.removeItem('whoosh_selected_companion');
  isSessionOwner.value = true;
  selectedCompanion.value = null;

  if (isCloud.value) {
    localStorage.removeItem('tl_cloud_token');
    activeCloudSession.value = null;
  } else {
    logoutLocalUser();
    activeLocalUsername.value = null;
    activeLocalShareToken.value = null;
  }
  authType.value = null;
  timelineItems.value = [];
  showOnboarding.value = true;
}

function handleUpdateCompanion(newCompanion: string | null) {
  selectedCompanion.value = newCompanion;
  if (newCompanion) {
    localStorage.setItem('whoosh_selected_companion', newCompanion);
  } else {
    localStorage.removeItem('whoosh_selected_companion');
  }
}

function copyLogoutToken() {
  const t = logoutTokenInfo.value?.token;
  if (t) navigator.clipboard.writeText(t).catch(() => {});
}

// ── Copy Token ────────────────────────────────────────────────────────
function copyToken() {
  if (activeSessionToken.value) {
    navigator.clipboard.writeText(activeSessionToken.value);
    alert(`Token disalin: ${activeSessionToken.value}`);
  }
}

function copyLocalToken() {
  if (activeLocalShareToken.value) {
    navigator.clipboard.writeText(activeLocalShareToken.value);
    alert(`Token lokal disalin: ${activeLocalShareToken.value}\n\nBagikan ke teman untuk join ke timeline ini!`);
  }
}
// Preserve copy functions for session mechanisms without triggering TS unused variable error
void copyToken;
void copyLocalToken;

// ── Add Moment ─────────────────────────────────────────────────────────
async function handleMomentAdded(data: {
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
}) {
  showAddModal.value = false;
  loading.value = true;
  loadingMessage.value = 'Menyimpan momen...';
  try {
    const momentShape = {
      title: data.title,
      location: data.location,
      date: data.date,
      year: data.year,
      dotColor: data.dotColor,
      rtl: data.rtl,
      mapEmbedUrl: data.mapEmbedUrl,
      latitude: data.latitude,
      longitude: data.longitude,
    };

    const newMomentItems: TimelineMoment[] = [];
    if (data.initialPhoto) {
      newMomentItems.push({
        title: 'Foto Utama',
        description: '',
        image: data.initialPhoto.image,
        accentColor: data.dotColor,
        localImageId: data.initialPhoto.localImageId
      });
    }
    // Add additional photos (multi-select)
    if (data.additionalPhotos && data.additionalPhotos.length > 0) {
      for (const photo of data.additionalPhotos) {
        newMomentItems.push({
          title: '',
          description: '',
          image: photo.image,
          accentColor: data.dotColor,
          localImageId: photo.localImageId
        });
      }
    }

    if (isCloud.value && activeCloudSession.value) {
      await addMoment(
        activeCloudSession.value.id,
        momentShape,
        newMomentItems,
        activeLocalUsername.value || undefined
      );
      await fetchCloudTimeline(activeCloudSession.value.id);
    } else if (isLocal.value && activeLocalUsername.value) {
      const addedData = { ...momentShape, moments: newMomentItems } as TimelineData;
      addLocalMoment(activeLocalUsername.value, addedData);
      loadLocalTimeline(activeLocalUsername.value);
    }
  } catch (err) {
    console.error('Failed to add moment:', err);
    alert('Gagal menyimpan momen. Coba lagi.');
  } finally {
    loading.value = false;
  }
}

function openEditModal(moment: TimelineData) {
  activeEditMoment.value = moment;
  showEditModal.value = true;
}

async function handleMomentUpdated(data: any) {
  showEditModal.value = false;
  loading.value = true;
  loadingMessage.value = 'Menyimpan perubahan...';
  try {
    const updatedData = { ...data };

    // Collect ALL new photos (initialPhoto + additionalPhotos)
    const allNewPhotos: Array<{ image: string; localImageId: string }> = [];
    if (data.initialPhoto) allNewPhotos.push(data.initialPhoto);
    if (data.additionalPhotos && data.additionalPhotos.length > 0) {
      allNewPhotos.push(...data.additionalPhotos);
    }

    // Build updated moments list: existing + new
    const existingMoments = data.existingMoments || (timelineItems.value.find(m => m.id === data.id)?.moments || []);
    const newPhotoItems = allNewPhotos.map(photo => ({
      title: '',
      description: '',
      image: photo.image,
      accentColor: data.dotColor,
      localImageId: photo.localImageId
    }));
    
    // Always assign moments array because existingMoments might have been reordered/deleted/edited
    updatedData.moments = [...existingMoments, ...newPhotoItems];

    // Optimistic UI update — create new array reference so Vue watchers trigger
    const idx = timelineItems.value.findIndex(m => m.id === data.id);
    if (idx !== -1) {
      const updated = { ...timelineItems.value[idx], ...updatedData };
      const newArr = [...timelineItems.value];
      newArr[idx] = updated;
      timelineItems.value = newArr;
    }

    if (isCloud.value && activeCloudSession.value) {
      const { updateMoment, addMomentPhoto, clearMomentPhotos } = await import('./data/authService');
      // Update metadata
      await updateMoment(activeCloudSession.value.id, data.id, updatedData);
      
      // Sync photos: clear existing in cloud and re-upload the entire updated array sequentially
      // Sequential upload guarantees that Supabase's created_at reflects the exact sorted order
      await clearMomentPhotos(data.id);
      for (const photo of updatedData.moments) {
        await addMomentPhoto(data.id, {
          title: photo.title || '',
          description: photo.description || '',
          image: photo.image,
          accentColor: photo.accentColor || data.dotColor
        });
        // Small delay to ensure created_at timestamps are strictly sequential
        await new Promise(r => setTimeout(r, 10));
      }
      
      await fetchCloudTimeline(activeCloudSession.value.id);
    } else if (isLocal.value && activeLocalUsername.value) {
      const { updateLocalMoment } = await import('./data/localStore');
      updateLocalMoment(activeLocalUsername.value, data.id, updatedData);
      loadLocalTimeline(activeLocalUsername.value);
      // ── Sync to cloud so other devices can pull the updated moment ──
      if (activeLocalShareToken.value) {
        syncLocalTimelineWithCloud(activeLocalUsername.value, activeLocalShareToken.value, true).catch(
          err => console.warn('Background cloud sync failed after edit:', err)
        );
      }
    }
  } catch (err) {
    console.error('Failed to update moment:', err);
    alert('Gagal menyimpan perubahan. Coba lagi.');
  } finally {
    loading.value = false;
  }
}

async function handleReorderPhotos({ momentId, moments }: { momentId: string; moments: any[] }) {
  // Optimistic UI already done in TimelineView — just persist
  const idx = timelineItems.value.findIndex(m => m.id === momentId);
  if (idx !== -1) {
    timelineItems.value[idx] = { ...timelineItems.value[idx], moments };
  }
  try {
    if (isLocal.value && activeLocalUsername.value) {
      const { updateLocalMoment } = await import('./data/localStore');
      updateLocalMoment(activeLocalUsername.value, momentId, { moments });
    } else if (isCloud.value && activeCloudSession.value) {
      // For cloud, update each moment_item order if backend supports it
      // For now, we rely on the local optimistic update within the session
      console.log('Photo reorder saved locally for cloud session:', momentId);
    }
  } catch (err) {
    console.error('Failed to persist photo reorder:', err);
  }
}

async function handleUpdateMomentCaptions({ id, moments }: { id: string; moments: any[] }) {
  const idx = timelineItems.value.findIndex(m => m.id === id);
  if (idx !== -1) {
    timelineItems.value[idx] = { ...timelineItems.value[idx], moments };
  }
  try {
    if (isCloud.value && activeCloudSession.value) {
      // Persist caption changes to Supabase: clear existing items and re-insert with updated captions
      const { clearMomentPhotos, addMomentPhoto } = await import('./data/authService');
      await clearMomentPhotos(id);
      for (const item of moments) {
        await addMomentPhoto(id, {
          title: item.title || '',
          description: item.description || '',
          image: item.image || '',
          accentColor: item.accentColor || 'var(--accent-1)'
        });
        await new Promise(r => setTimeout(r, 10));
      }
      await fetchCloudTimeline(activeCloudSession.value.id);
    } else if (isLocal.value && activeLocalUsername.value) {
      const { updateLocalMoment } = await import('./data/localStore');
      updateLocalMoment(activeLocalUsername.value, id, { moments });
      loadLocalTimeline(activeLocalUsername.value);
      if (activeLocalShareToken.value) {
        syncLocalTimelineWithCloud(activeLocalUsername.value, activeLocalShareToken.value, true).catch(
          err => console.warn('Background cloud sync failed after caption update:', err)
        );
      }
    }
  } catch (err) {
    console.error('Failed to persist caption update:', err);
  }
}

// ── Delete Moments FAB State ──────────────────────────────────────────
const showDeleteMomentModal = ref(false);
const selectedMomentsToDelete = ref<string[]>([]);
const isFabOpen = ref(false);

// Delete modal v2 filters
// ── Delete modal year paging ────────────────────────────────────────────
const YEARS_PER_PAGE = 9;
const DEL_BASE_YEAR  = 2020;
// Start on the page that contains the current year
const currentYear   = new Date().getFullYear();
const yearPageIndex = ref(Math.floor((currentYear - DEL_BASE_YEAR) / YEARS_PER_PAGE));

// Drag/swipe state
const delYearDragX      = ref(0);
const delYearIsDragging = ref(false);
const delYearSlideDir   = ref<'left' | 'right'>('left'); // which direction to animate
let   delYearStartX     = 0;

const delTotalYearPages = computed(() => {
  const maxYear = Math.max(new Date().getFullYear() + 5, DEL_BASE_YEAR + YEARS_PER_PAGE - 1);
  return Math.ceil((maxYear - DEL_BASE_YEAR + 1) / YEARS_PER_PAGE);
});

// 9 years for current page, descending (largest first)
const delYearPageYears = computed(() => {
  const start = DEL_BASE_YEAR + yearPageIndex.value * YEARS_PER_PAGE;
  const years: number[] = [];
  for (let i = YEARS_PER_PAGE - 1; i >= 0; i--) years.push(start + i);
  return years;
});

// Live drag offset (only during drag)
const delYearTrackStyle = computed(() => ({
  transform: `translateX(${delYearDragX.value}px)`,
  transition: delYearIsDragging.value ? 'none' : 'transform 0.35s cubic-bezier(0.25,1,0.5,1)',
}));

function delYearTouchStart(e: TouchEvent) {
  delYearStartX           = e.touches[0].clientX;
  delYearIsDragging.value = false; // start as NOT dragging; only drag after 8px
  delYearDragX.value      = 0;
}
function delYearTouchMove(e: TouchEvent) {
  const raw = e.touches[0].clientX - delYearStartX;
  // Only enter drag mode after 8px movement to distinguish tap from drag
  if (Math.abs(raw) > 8) {
    delYearIsDragging.value = true;
    delYearDragX.value = Math.max(-80, Math.min(80, raw));
  }
}
function delYearTouchEnd(e: TouchEvent) {
  const wasDragging = delYearIsDragging.value;
  delYearIsDragging.value = false;
  delYearDragX.value = 0;

  // Only change page if it was an actual swipe (not a tap on a button)
  if (!wasDragging) return;

  const diff = e.changedTouches[0].clientX - delYearStartX;
  const threshold = 50;
  if (diff > threshold && yearPageIndex.value < delTotalYearPages.value - 1) {
    delYearSlideDir.value = 'left';
    yearPageIndex.value++;
  } else if (diff < -threshold && yearPageIndex.value > 0) {
    delYearSlideDir.value = 'right';
    yearPageIndex.value--;
  }
}

// Close speed dial when switching tabs
watch(activeTab, () => { isFabOpen.value = false; });

const deleteSelectedYear  = ref<number>(new Date().getFullYear());
const deleteSelectedMonth = ref<string>('');
const showDeleteSearch    = ref(false);
const deleteSearchQuery   = ref('');
const delSearchInputRef   = ref<HTMLInputElement | null>(null);

// Auto-focus search input when search panel opens
watch(showDeleteSearch, (val) => {
  if (val) nextTick(() => delSearchInputRef.value?.focus());
});

// Reset month filter when year changes
watch(deleteSelectedYear, () => {
  deleteSelectedMonth.value = '';
});

// Computed for delete modal v2
// Helper: parse Indonesian date string "DD MMMM YYYY" → { year, month }
const MONTHS_ID: Record<string, string> = {
  'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
  'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
  'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12',
};
const MONTHS_ID_LABEL: Record<string, string> = {
  '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
  '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
  '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember',
};

function parseDateID(dateStr: string): { year: number; monthNum: string; monthLabel: string } | null {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(' ');
  // Format: "DD MMMM YYYY" → parts[0]=day, parts[1]=month-name, parts[2]=year
  if (parts.length === 3) {
    const year = parseInt(parts[2], 10);
    const monthNum = MONTHS_ID[parts[1]] ?? '';
    const monthLabel = parts[1];
    if (!isNaN(year) && monthNum) return { year, monthNum, monthLabel };
  }
  // Fallback: try YYYY-MM-DD
  if (parts.length === 1 && dateStr.includes('-')) {
    const [y, m] = dateStr.split('-');
    const year = parseInt(y, 10);
    if (!isNaN(year) && m) return { year, monthNum: m, monthLabel: MONTHS_ID_LABEL[m] ?? m };
  }
  return null;
}

const deleteMomentYears = computed(() => {
  const years = new Set<number>();
  timelineItems.value.forEach(item => {
    const parsed = parseDateID(item.date);
    if (parsed) years.add(parsed.year);
  });
  return Array.from(years).sort((a, b) => b - a);
});

// All 12 months always shown; months with data get a dot indicator
const ALL_MONTHS_LABEL = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];

const monthsWithData = computed(() => {
  const set = new Set<string>();
  timelineItems.value.forEach(item => {
    const p = parseDateID(item.date);
    if (p && p.year === deleteSelectedYear.value) set.add(p.monthLabel);
  });
  return set;
});

// Always return all 12 month names
const deleteMomentMonths = computed(() => ALL_MONTHS_LABEL);

const deleteFilteredMoments = computed(() => {
  let items = timelineItems.value;

  // Filter by year
  items = items.filter(item => {
    const parsed = parseDateID(item.date);
    return parsed?.year === deleteSelectedYear.value;
  });

  // Filter by month label if selected
  if (deleteSelectedMonth.value) {
    items = items.filter(item => {
      const parsed = parseDateID(item.date);
      return parsed?.monthLabel === deleteSelectedMonth.value;
    });
  }

  // Filter by search query (title or location)
  if (deleteSearchQuery.value.trim()) {
    const q = deleteSearchQuery.value.trim().toLowerCase();
    items = items.filter(item =>
      item.title?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q)
    );
  }

  return items;
});

function closeDeleteMomentModal() {
  showDeleteMomentModal.value = false;
  selectedMomentsToDelete.value = [];
}

function openDeleteMomentModal() {
  // Set initial year to the latest year available
  const years = deleteMomentYears.value;
  if (years.length > 0) {
    deleteSelectedYear.value = years[0]; // First item is the latest (sorted desc)
  }
  deleteSelectedMonth.value = '';
  selectedMomentsToDelete.value = [];
  showDeleteMomentModal.value = true;
}

// Legacy function - now using toggleDeleteSelectAllFiltered for v2 modal
// function toggleDeleteSelectAll(e: Event) {
//   const checked = (e.target as HTMLInputElement).checked;
//   if (checked) {
//     selectedMomentsToDelete.value = timelineItems.value.map(i => i.id);
//   } else {
//     selectedMomentsToDelete.value = [];
//   }
// }

function toggleDeleteSelectAllFiltered(e: Event) {
  const checked = (e.target as HTMLInputElement).checked;
  if (checked) {
    selectedMomentsToDelete.value = deleteFilteredMoments.value.map(i => i.id);
  } else {
    selectedMomentsToDelete.value = [];
  }
}

async function confirmDeleteMoments() {
  if (selectedMomentsToDelete.value.length === 0) return;
  const ids = [...selectedMomentsToDelete.value];
  closeDeleteMomentModal();
  await handleDeleteMoments(ids);
}

// ── Delete Moments ────────────────────────────────────────────────────
async function handleDeleteMoments(ids: string[]) {
  if (!ids || ids.length === 0) return;
  loading.value = true;
  loadingMessage.value = `Menghapus ${ids.length} momen...`;
  try {
    if (isCloud.value && activeCloudSession.value) {
      const { deleteMoment } = await import('./data/authService');
      for (const id of ids) {
        await deleteMoment(id);
      }
      await fetchCloudTimeline(activeCloudSession.value.id);
    } else if (isLocal.value && activeLocalUsername.value) {
      const { deleteLocalMoment, getLocalTimeline } = await import('./data/localStore');
      const { deleteMoment, getSessionByToken, getTimelineData } = await import('./data/authService');
      
      const localMomentsBefore = getLocalTimeline(activeLocalUsername.value);
      const itemsToDelete = localMomentsBefore.filter(m => ids.includes(m.id));

      for (const id of ids) {
        deleteLocalMoment(activeLocalUsername.value, id);
      }
      loadLocalTimeline(activeLocalUsername.value);
      
      // Also clean up from cloud sync if share token exists
      if (activeLocalShareToken.value) {
        try {
          const session = await getSessionByToken(activeLocalShareToken.value);
          if (session) {
            const cloudItems = await getTimelineData(session.id);
            for (const itemToDelete of itemsToDelete) {
               const sig = `${(itemToDelete.title || '').trim().toLowerCase()}|${(itemToDelete.date || '').trim().toLowerCase()}`;
               const cloudMatch = cloudItems.find(c => c.id === itemToDelete.id || `${(c.title || '').trim().toLowerCase()}|${(c.date || '').trim().toLowerCase()}` === sig);
               if (cloudMatch) {
                 await deleteMoment(cloudMatch.id);
               }
            }
          }
        } catch (e) {
          console.warn('Gagal menghapus momen dari cloud:', e);
        }

        syncLocalTimelineWithCloud(activeLocalUsername.value, activeLocalShareToken.value, true).catch(
          err => console.warn('Cloud sync after delete failed:', err)
        );
      }
    }
  } catch (err) {
    console.error('Failed to delete moments:', err);
    alert('Gagal menghapus momen. Coba lagi.');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <!-- Live Update Auto-Notification Toast -->
  <Transition name="live-update-toast">
    <div v-if="updateToastMessage" class="live-update-toast-banner" @click="triggerManualRefresh">
      <span class="live-update-toast-dot"></span>
      <span class="live-update-toast-text">{{ updateToastMessage }}</span>
      <span class="live-update-toast-tap">Ketuk segarkan ↺</span>
    </div>
  </Transition>
  <!-- Android Back Button: "Tekan sekali lagi untuk keluar" toast -->
  <Transition name="exit-toast">
    <div v-if="exitToastVisible" class="exit-toast-snackbar" aria-live="polite">
      <i class="fa-solid fa-door-open"></i>
      <span>Tekan kembali sekali lagi untuk keluar</span>
    </div>
  </Transition>

  <!-- Login Success Pop-up Message (Centered) -->
  <Transition name="login-popup-fade">
    <div v-if="showLoginSuccessPopup" class="login-success-overlay" @click="showLoginSuccessPopup = false">
      <div class="login-success-card" @click.stop>
        <!-- Corner Sticker Badge -->
        <div class="login-corner-sticker">
          <i class="fa-solid fa-bolt"></i>
          <span>Siap Eksplorasi!</span>
        </div>

        <!-- Mini Quick Close Button -->
        <button class="login-popup-close-btn" @click.stop="showLoginSuccessPopup = false" title="Tutup" aria-label="Tutup">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <!-- Floating Festive Trinkets (Font Awesome) -->
        <div class="login-trinket trinket-top-left" aria-hidden="true">
          <i class="fa-solid fa-star"></i>
        </div>
        <div class="login-trinket trinket-top-right" aria-hidden="true">
          <i class="fa-solid fa-bolt"></i>
        </div>
        <div class="login-trinket trinket-bottom-left" aria-hidden="true">
          <i class="fa-solid fa-heart"></i>
        </div>
        <div class="login-trinket trinket-bottom-right" aria-hidden="true">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
        </div>

        <!-- Confetti Accent Dots -->
        <span class="confetti-dot dot-1" aria-hidden="true"></span>
        <span class="confetti-dot dot-2" aria-hidden="true"></span>
        <span class="confetti-dot dot-3" aria-hidden="true"></span>
        <span class="confetti-dot dot-4" aria-hidden="true"></span>

        <!-- Hero Icon with layered neo-brutalist container & dynamic halo -->
        <div class="login-success-icon-wrap">
          <div class="login-icon-halo"></div>
          <div class="login-success-icon-inner">
            <i class="fa-solid fa-circle-check"></i>
          </div>
        </div>

        <!-- Security / Status Badge with Live Pulsing Dot -->
        <div class="login-status-pill">
          <span class="status-live-dot"></span>
          <i class="fa-solid fa-shield-halved"></i>
          <span>Sesi Terautentikasi</span>
        </div>

        <h3 class="login-success-title">Berhasil Login</h3>

        <!-- User detail box with Font Awesome user icon + sync indicator -->
        <div class="login-success-detail-box">
          <div class="detail-icon-pill">
            <i class="fa-solid fa-user-check"></i>
          </div>
          <div class="detail-text-col">
            <span class="login-success-sub">{{ loginSuccessSubtext }}</span>
            <span class="detail-cloud-badge">
              <i class="fa-solid fa-cloud-arrow-up"></i> Cloud Connected
            </span>
          </div>
        </div>

        <!-- Auto-Dismiss Timer Indicator with microcopy -->
        <div class="login-timer-section">
          <div class="login-timer-info">
            <i class="fa-regular fa-clock"></i>
            <span>Menutup otomatis</span>
          </div>
          <div class="login-timer-bar-wrap">
            <div class="login-timer-bar"></div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Loading Overlay -->
  <Transition name="fade">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-card">
        <i class="fa-solid fa-spinner fa-spin spinner-icon"></i>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>
  </Transition>

  <!-- Auth Modal -->
  <AuthModal
    v-if="showAuthModal"
    :mode="authModalMode"
    @close="showAuthModal = false"
    @switch-mode="(m) => authModalMode = m"
    @auth-success="handleAuthSuccess"
  />

  <!-- Onboarding / Setup Flow -->
  <OnboardingView
    v-if="showOnboarding"
    @choose-account="handleChooseAccount"
    @choose-token="handleChooseToken"
    @learn-more="handleLearnMore"
    @auth-success="handleAuthSuccess"
  />

  <!-- Timeline View with Bottom Navigation -->
  <div v-else class="portfolio-container timeline-active-view" :class="{ 'is-home-tab': activeTab === 'home', 'is-timeline-tab': activeTab === 'timeline', 'is-settings-tab': activeTab === 'settings', 'is-space-tab': activeTab === 'space' }">

    <!-- Member Popup Modal (Teleported to Body) -->
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
            <!-- Popup Header (Title + Count Badge, Close Button Removed — Outside Click & Esc Preserved) -->
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
                  @click.stop="deleteAlias(c)"
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

    <!-- Home Tab -->
    <div v-if="activeTab === 'home'" class="tab-content tab-content-home">
      <!-- Hero Header with Anime Banner -->
      <HeroHeader
        :user-alias="userAlias"
        :items="timelineItems"
        :collaborators="filteredCollaborators"
        :is-owner="isSessionOwner"
        :companion="selectedCompanion"
        @update:companion="handleUpdateCompanion"
      />

      <HomeView
        :items="timelineItems"
        @add-moment="showAddModal = true"
        @edit-moment="openEditModal"
        @detail-modal-toggled="(v: boolean) => showDetailModal = v"
        @reorder-photos="handleReorderPhotos"
        @delete-moments="handleDeleteMoments"
        @update-moment-captions="handleUpdateMomentCaptions"
      />
    </div>

    <!-- Ruang Kita Tab -->
    <div v-else-if="activeTab === 'space'" class="tab-content tab-content-space">
      <RuangKitaView />
    </div>

    <!-- Timeline Tab -->
    <div v-else-if="activeTab === 'timeline'" class="tab-content tab-content-timeline">
      <TimelineView
        :items="timelineItems"
      />
    </div>

    <!-- Settings Tab (Fixed Header + Dedicated Settings-Only Scroll) -->
    <div v-else-if="activeTab === 'settings'" class="tab-content tab-content-settings">

      <!-- FIXED HEADER REGION (never scrolls with Settings content) -->
      <header class="session-header">

        <!-- Unified Scrapbook Background: Profile + Traveling Together seamlessly connected -->
        <div class="hdr-scrapbook-bg">

          <!-- SECTION A: Profile Section -->
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

              <!-- Editable User Name: Single-line row with no wrapping -->
              <div v-if="!isEditingAlias" class="profile-name-row">
                <h1 class="profile-user-name" :title="userAlias">
                  {{ userAlias || 'Pengguna' }}<span class="profile-name-dot">.</span>
                </h1>
                <button class="hdr-btn-edit" @click="changeAlias" title="Ubah nama panggilan" aria-label="Ubah nama panggilan">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
              </div>
              <form v-else class="profile-name-row profile-name-edit-form" @submit.prevent="saveInlineAlias">
                <input
                  ref="aliasInputRef"
                  type="text"
                  v-model="editAliasInput"
                  class="profile-name-input"
                  maxlength="40"
                  placeholder="Nama panggilan..."
                  required
                />
                <button type="submit" class="hdr-btn-edit hdr-btn-save" title="Simpan nama" aria-label="Simpan nama">
                  <i class="fa-solid fa-check"></i>
                </button>
                <button type="button" class="hdr-btn-edit hdr-btn-cancel" @click="cancelEditAlias" title="Batal" aria-label="Batal">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </form>

              <!-- User / Session ID Badge -->
              <div class="profile-id-badge" title="Identitas Akun">
                <span class="id-label">ID</span>
                <span class="id-sep">·</span>
                <span class="id-val">{{ activeLocalUsername || activeSessionToken || userAlias || 'LOCAL' }}</span>
              </div>
            </div>

            <!-- Car (Bottom-Right) -->
            <div class="anim-wrapper car-wrapper" aria-hidden="true">
              <i class="fa-solid fa-wind particle-smoke smoke1"></i>
              <i class="fa-solid fa-wind particle-smoke smoke2"></i>
              <i class="fa-solid fa-car-side hdr-anim-car" title="Perjalanan darat"></i>
            </div>
          </div>

          <!-- SECTION B: Traveling Together — Solid White Card on Scrapbook Background -->
          <div v-if="filteredCollaborators.length > 0" class="hdr-traveling-panel">
            <div class="traveling-header">
              <div class="traveling-title-group">
                <i class="fa-solid fa-users traveling-icon"></i>
                <span class="traveling-title">TRAVELING BERSAMA</span>
              </div>
              <span class="traveling-count-badge">
                {{ String(filteredCollaborators.length).padStart(2, '0') }} MEMBER
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
                <button class="hdr-btn-remove" @click.stop="deleteAlias(c)" :title="`Hapus ${c}`" :aria-label="`Hapus ${c}`">
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

        </div><!-- end .hdr-scrapbook-bg -->

        <!-- SECTION C: Device Status Strip (outside scrapbook bg, own warm surface) -->
        <div v-if="deviceBrand" class="hdr-section-info">
          <div class="hdr-info-chip hdr-info-device">
            <i class="fa-solid fa-mobile-screen-button"></i>
            <span>{{ deviceBrand }}</span>
          </div>
        </div>

      </header>

      <!-- Settings-Only Scroll Area (only this region scrolls) -->
      <div class="settings-scroll-area">
        <SettingsView />
      </div>

    </div>


    <!-- Global Map (always mounted to listen to events) -->
    <GlobalMapModal :markers="timelineItems" />


    <!-- Bottom Navigation -->
    <BottomNav v-model="activeTab" />

    <!-- Add Moment Modal -->
    <AddMomentModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @moment-added="handleMomentAdded"
    />

    <!-- Edit Moment Modal -->
    <EditMomentModal
      v-if="showEditModal && activeEditMoment"
      :moment="activeEditMoment"
      @close="showEditModal = false"
      @moment-updated="handleMomentUpdated"
    />

    <!-- Speed Dial FAB -->
    <div
      v-show="activeTab === 'home' && !showAddModal && !showEditModal && !showDetailModal"
      class="speed-dial-wrapper"
    >
      <!-- Sub actions (appear when open) -->
      <Transition name="fab-sub">
        <div v-if="isFabOpen" class="speed-dial-actions">
          <!-- Add Moment -->
          <div class="speed-dial-item">
            <span class="speed-dial-label">Tambah Momen</span>
            <button class="speed-dial-btn speed-dial-btn--add" @click="isFabOpen = false; showAddModal = true" aria-label="Tambah Momen">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
          <!-- Delete Moments -->
          <div class="speed-dial-item">
            <span class="speed-dial-label">Hapus Momen</span>
            <button class="speed-dial-btn speed-dial-btn--delete" @click="isFabOpen = false; openDeleteMomentModal()" aria-label="Hapus Momen">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
          <!-- Logout -->
          <div class="speed-dial-item">
            <span class="speed-dial-label">Keluar</span>
            <button class="speed-dial-btn speed-dial-btn--logout" @click="isFabOpen = false; handleLogout()" aria-label="Keluar">
              <i class="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Backdrop to close -->
      <div v-if="isFabOpen" class="speed-dial-backdrop" @click="isFabOpen = false"></div>

      <!-- Main toggle button -->
      <button
        class="speed-dial-main"
        :class="{ 'is-open': isFabOpen }"
        @click="isFabOpen = !isFabOpen"
        aria-label="Menu Aksi"
      >
        <span class="icon-dots"><i class="fa-solid fa-ellipsis-vertical"></i></span>
        <span class="icon-chevron"><i class="fa-solid fa-chevron-down"></i></span>
      </button>
    </div>

    <!-- Delete Moments Modal (v2 with Year & Month Filter) -->
    <Transition name="fade">
      <div v-if="showDeleteMomentModal" class="del-modal-overlay" @click.self="closeDeleteMomentModal">
        <div class="del-modal-content-v2">
          <!-- Header -->
          <div class="del-modal-header-v2">
            <div class="del-header-left">
              <i class="fa-solid fa-trash-can del-header-icon"></i>
              <div>
                <h3 class="del-modal-title-v2">Hapus Momen</h3>
                <p class="del-modal-subtitle-v2">Tindakan hapus tidak dapat dibatalkan</p>
              </div>
            </div>
            <div class="del-header-actions">
              <button
                class="del-btn-icon del-btn-search"
                :class="{ 'is-searching': showDeleteSearch }"
                aria-label="Cari"
                @click="showDeleteSearch = !showDeleteSearch; if (!showDeleteSearch) deleteSearchQuery = ''"
              >
                <i class="fa-solid fa-magnifying-glass"></i>
              </button>
              <button class="del-btn-icon del-btn-close-v2" @click="closeDeleteMomentModal" aria-label="Tutup">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          <!-- Year Filter (swipeable 3x3 grid, 9 years per page) -->
          <div class="del-year-section">
            <div
              class="del-year-viewport"
              @touchstart="delYearTouchStart"
              @touchmove.prevent="delYearTouchMove"
              @touchend="delYearTouchEnd"
            >
              <!-- Direction-aware sliding grid -->
              <Transition :name="`year-slide-${delYearSlideDir}`" mode="out-in">
                <div
                  class="del-year-filter"
                  :key="yearPageIndex"
                  :style="delYearTrackStyle"
                >
                  <button
                    v-for="year in delYearPageYears"
                    :key="year"
                    class="del-year-btn"
                    :class="{ 'is-active': deleteSelectedYear === year }"
                    @click.stop="deleteSelectedYear = year; deleteSelectedMonth = ''"
                  >
                    {{ year }}
                  </button>
                </div>
              </Transition>
            </div>
            <!-- Page indicator dots -->
            <div class="del-year-page-dots">
              <span
                v-for="p in delTotalYearPages"
                :key="p"
                class="del-year-dot"
                :class="{ 'is-active': p - 1 === yearPageIndex }"
                @click="yearPageIndex = p - 1"
              ></span>
            </div>
          </div>

          <!-- Month Pills: ALL 12 months always visible, scrollable -->
          <div class="del-month-filter">
            <button
              class="del-month-pill"
              :class="{ 'is-active': deleteSelectedMonth === '' }"
              @click="deleteSelectedMonth = ''"
            >Semua</button>
            <button
              v-for="month in deleteMomentMonths"
              :key="month"
              class="del-month-pill"
              :class="{
                'is-active': deleteSelectedMonth === month,
                'has-data': monthsWithData.has(month)
              }"
              @click="deleteSelectedMonth = month"
            >{{ month }}</button>
          </div>

          <!-- Search Panel (shown when search toggled) -->
          <Transition name="del-search-slide">
            <div v-if="showDeleteSearch" class="del-search-panel">
              <div class="del-search-input-wrap">
                <i class="fa-solid fa-magnifying-glass del-search-icon"></i>
                <input
                  ref="delSearchInputRef"
                  v-model="deleteSearchQuery"
                  type="text"
                  class="del-search-input"
                  placeholder="Cari judul atau lokasi..."
                  @keydown.esc="showDeleteSearch = false; deleteSearchQuery = ''"
                />
                <button
                  v-if="deleteSearchQuery"
                  class="del-search-clear"
                  @click="deleteSearchQuery = ''"
                >
                  <i class="fa-solid fa-circle-xmark"></i>
                </button>
              </div>
              <p class="del-search-hint">
                Hasil di tahun <strong>{{ deleteSelectedYear }}</strong>
              </p>
            </div>
          </Transition>

          <!-- Moments List -->
          <div class="del-list-v2">
            <label
              v-for="item in deleteFilteredMoments"
              :key="item.id"
              class="del-item-card"
            >
              <input type="checkbox" :value="item.id" v-model="selectedMomentsToDelete" class="del-checkbox" />
              <div class="del-item-dot-v2" :style="{ backgroundColor: item.dotColor }"></div>
              <div class="del-item-details">
                <h4 class="del-item-title-v2">{{ item.title }}</h4>
                <div class="del-item-meta-v2">
                  <span><i class="fa-solid fa-location-dot"></i> {{ item.location || '—' }}</span>
                  <span>·</span>
                  <span><i class="fa-regular fa-calendar"></i> {{ item.date || '—' }}</span>
                </div>
              </div>
            </label>
            <div v-if="deleteFilteredMoments.length === 0" class="del-empty-v2">
              <i class="fa-solid fa-ghost del-empty-ghost-icon"></i>
              <p>Tidak ada momen di bulan ini.</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="del-modal-footer-v2">
            <div class="del-footer-left">
              <label class="del-select-all-v2">
                <input
                  type="checkbox"
                  :checked="selectedMomentsToDelete.length === deleteFilteredMoments.length && deleteFilteredMoments.length > 0"
                  @change="toggleDeleteSelectAllFiltered"
                />
                <span>Pilih Semua</span>
              </label>
            </div>
            <span class="del-count"><span class="del-count-num">{{ selectedMomentsToDelete.length }}</span> terpilih</span>
            <button
              class="del-btn-delete-v2"
              :disabled="selectedMomentsToDelete.length === 0"
              @click="confirmDeleteMoments"
            >
              <i class="fa-solid fa-trash-can"></i>
              HAPUS
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- LOGOUT MODAL — Neo Brutalism -->
    <Transition name="fade">
      <div v-if="showLogoutModal" class="logout-overlay" @click.self="showLogoutModal = false">
        <Transition name="logout-pop" appear>
          <div v-if="showLogoutModal" class="logout-dialog">

            <!-- Header row -->
            <div class="logout-header">
              <span class="logout-badge">⚠ KELUAR</span>
              <button class="logout-close-x" @click="showLogoutModal = false">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <h3 class="logout-title">Yakin mau cabut?</h3>

            <!-- Token box -->
            <div v-if="logoutTokenInfo" class="logout-token-box">
              <span class="logout-token-lbl">{{ logoutTokenInfo.label }}</span>
              <div class="logout-token-row">
                <code class="logout-token-val">{{ logoutTokenInfo.token }}</code>
                <button class="logout-copy-btn" @click="copyLogoutToken">
                  <i class="fa-regular fa-copy"></i>
                </button>
              </div>
              <p class="logout-token-note">Simpan dulu baru keluar!</p>
            </div>

            <!-- Actions -->
            <div class="logout-actions">
              <button class="lo-btn lo-btn--cancel" @click="showLogoutModal = false">Batal</button>
              <button class="lo-btn lo-btn--go" @click="confirmLogout">Keluar</button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Native Gesture Navigation Indicator -->
    <GestureBackIndicator />

  </div>
</template>

<style>
body {
  background-color: var(--bg-color);
  min-height: 100vh;
}

/* Loading */
.loading-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(26, 26, 46, 0.5);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-card {
  background: #ffffff;
  border: 3px solid #101010;
  box-shadow: 6px 6px 0px #101010;
  padding: 28px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}

.loading-card p {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  color: #101010;
  margin: 0;
  font-size: 0.95rem;
}

.spinner-icon {
  font-size: 2rem;
  color: #6366f1;
}

/* Fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Session Bar */
.session-bar {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 2px solid #101010;
  box-shadow: 0 2px 0 #101010;
  margin-bottom: 20px;
  gap: 8px;
}
.session-bar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.session-device-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: #4b5563;
  padding-top: 6px;
  border-top: 1px dashed #cbd5e1;
}

.session-device-row strong {
  color: #0f172a;
  font-weight: 700;
}

/* ── Local share token row ────────────────────────────────────── */
.session-token-row {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: #374151;
  padding-top: 6px;
  border-top: 1px dashed #cbd5e1;
  flex-wrap: wrap;
}

.session-token-row i { color: #6b9bd6; flex-shrink: 0; }

.local-share-token {
  font-family: monospace;
  font-size: 0.88rem;
  font-weight: 800;
  background: #e0f2fe;
  color: #0369a1;
  padding: 3px 9px;
  border: 1.5px solid #7dd3fc;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.15s;
}
.local-share-token:hover { background: #bae6fd; }

/* ── Alias Row ───────────────────────────────────────────────── */
.session-alias-row {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: #374151;
  padding-top: 6px;
  border-top: 1px dashed #cbd5e1;
  flex-wrap: wrap;
}

.session-alias-row i { color: #7c6fd6; flex-shrink: 0; }

.alias-name {
  font-family: monospace;
  font-size: 0.88rem;
  font-weight: 800;
  color: #1e1b4b;
  background: #ede9fe;
  border: 1.5px solid #a5b4fc;
  padding: 2px 8px;
  letter-spacing: 0.4px;
}

.btn-edit-alias {
  color: #7c6fd6;
  font-size: 0.75rem;
  padding: 2px 6px;
  transition: color 0.15s;
}
.btn-edit-alias:hover { color: #4f46e5; }

/* ── Collaborators Row ───────────────────────────────────────── */
.session-collab-row {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: #374151;
  padding-top: 6px;
  border-top: 1px dashed #cbd5e1;
  flex-wrap: wrap;
}

.session-collab-row i { color: #10b981; flex-shrink: 0; }

.collab-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.collab-tag {
  font-family: monospace;
  font-size: 0.82rem;
  font-weight: 700;
  background: #d1fae5;
  color: #065f46;
  border: 1.5px solid #6ee7b7;
  padding: 2px 8px;
  border-radius: 0;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  display: inline-block;
  padding: 3px 8px;
  border: 2px solid #101010;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
}

.cloud-badge { background-color: #dbeafe; color: #1e3a8a; }
.local-badge { background-color: #d1fae5; color: #064e3b; }

.session-token {
  font-family: monospace;
  font-size: 0.9rem;
  font-weight: 700;
  background: #f1f5f9;
  padding: 3px 8px;
  border: 1px solid #cbd5e1;
  cursor: pointer;
  color: #0f172a;
}
.session-token:hover { background: #e2e8f0; }

.session-username {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #101010;
}

.session-name {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 0.95rem;
  padding: 2px;
}
.btn-icon:hover { color: #6366f1; }

.btn-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fecdd3;
  color: #9f1239;
  border: 2px solid #101010;
  padding: 5px 12px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 2px 2px 0 #101010;
  transition: all 0.1s ease;
}
.btn-logout:hover { transform: translate(-1px, -1px); box-shadow: 3px 3px 0 #101010; }
.btn-logout:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0 #101010; }


/* ── Layout with bottom nav ──────────────────────────────────── */
.timeline-active-view {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
  padding-top: 0;
}

.timeline-active-view.is-settings-tab,
.timeline-active-view.is-space-tab {
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  max-width: 100% !important;
  width: 100% !important;
  height: 100dvh;
}

/* ── Ruang Kita Tab (Dedicated Scroll) ── */
.tab-content-space {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}

.tab-content {
  width: 100%;
  flex: 1;
  overflow: hidden; /* Each view manages its own scroll internally */
  display: flex;
  flex-direction: column;
}

/* ── Settings Tab (Fixed Header + Dedicated Settings-Only Scroll) ── */
.tab-content-settings {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 0;
}

.settings-scroll-area {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE / Edge */
  padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px));
}

.settings-scroll-area::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

/* ── Edge-to-edge full device view on Timeline (interactive map) tab ── */
.timeline-active-view.is-timeline-tab {
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin: 0 !important;
  max-width: 100vw !important;
  width: 100vw !important;
  height: 100dvh;
}

.tab-content-timeline {
  width: 100vw !important;
  max-width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
  height: 100% !important;
  flex: 1 !important;
}

/* ── Timeline placeholder ────────────────────────────────────── */
.tab-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
}

.placeholder-inner {
  text-align: center;
  padding: 40px 24px;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.placeholder-inner h3 {
  font-family: 'Outfit', 'Space Grotesk', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: #101010;
  margin: 0 0 10px;
}

.placeholder-inner p {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #9ca3af;
  margin: 0;
  line-height: 1.6;
}

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

/* ── Unified Scrapbook Background Wrapper ── */
.hdr-scrapbook-bg {
  position: relative;
  isolation: isolate;
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

.profile-name-edit-form {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  max-width: min(90vw, 360px);
  min-width: 0;
  box-sizing: border-box;
}

.profile-name-input {
  font-family: 'Space Grotesk', 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  color: #242424;
  background: #FFFFFF;
  border: 1.5px solid #242424;
  box-shadow: 2px 2px 0 #242424;
  border-radius: 4px;
  padding: 4px 10px;
  min-width: 0;
  max-width: min(60vw, 240px);
  box-sizing: border-box;
  outline: none;
  line-height: 1.2;
}

.hdr-btn-save {
  background: #F2C9A7;
  color: #242424;
}
.hdr-btn-cancel {
  background: #FFF8EF;
  color: #B96544;
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
   SPEED DIAL FAB
══════════════════════════════════════════ */
.speed-dial-wrapper {
  position: fixed;
  bottom: 84px;   /* just above bottom nav (68px + 16px gap) */
  right: 20px;
  z-index: 900;
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* Align right to prevent center shift */
}

/* Transparent backdrop to dismiss on tap-outside */
.speed-dial-backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
}

/* Main toggle button – pill shape like ">;" (1.5x enlarged: 84px) */
.speed-dial-main {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  box-shadow: 0 6px 24px rgba(0,0,0,0.14);
  color: #374151;
  font-size: 1.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  overflow: hidden;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  z-index: 2;
}

/* Pressing the button: no translate (keep position fixed), just a subtle bg pulse */
.speed-dial-main:active { background: #e5e7eb; }

.speed-dial-main.is-open {
  background: #f9fafb;
  box-shadow: 0 4px 14px rgba(0,0,0,0.1);
}

/* Both icon wrappers overlap perfectly in center of button */
.speed-dial-main .icon-dots,
.speed-dial-main .icon-chevron {
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  line-height: 1;
  pointer-events: none;
  transition:
    opacity 0.35s ease,
    transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

/* ── DOTS: start visible at 0°, spin CCW to -180° when menu opens */
.speed-dial-main .icon-dots {
  opacity: 1;
  transform: translate(-50%, -50%) rotate(0deg);
}
.speed-dial-main.is-open .icon-dots {
  opacity: 0;
  transform: translate(-50%, -50%) rotate(-180deg);
}

/* ── CHEVRON: start hidden at +180°, spin CCW to 0° when menu opens */
.speed-dial-main .icon-chevron {
  opacity: 0;
  transform: translate(-50%, -50%) rotate(180deg);
}
.speed-dial-main.is-open .icon-chevron {
  opacity: 1;
  transform: translate(-50%, -50%) rotate(0deg);
}

/* Sub-actions column (Centered above 84px main button: (84-66)/2 = 9px) */
.speed-dial-actions {
  position: absolute;
  bottom: 100%; /* Anchor to top of main button */
  right: 9px;
  display: flex;
  flex-direction: column-reverse;  /* top item = farthest from button */
  align-items: flex-end;
  gap: 14px;
  padding-bottom: 16px;
  width: max-content;
}

/* Each action row: label + button */
.speed-dial-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.speed-dial-label {
  background: rgba(255,255,255,0.96);
  color: #374151;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 20px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.12);
  white-space: nowrap;
  pointer-events: none;
}

/* Individual action buttons (1.5x enlarged: 66px) */
.speed-dial-btn {
  width: 66px;
  height: 66px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.speed-dial-btn:active { transform: scale(0.92); box-shadow: 0 2px 6px rgba(0,0,0,0.1); }

.speed-dial-btn--add    { background: #6b9bd6; color: #fff; }
.speed-dial-btn--delete { background: #f87171; color: #fff; }
.speed-dial-btn--logout { background: #ffffff; color: #6b7280; border: 1.5px solid #e5e7eb; }

/* FAB sub-action enter/leave animation */
.fab-sub-enter-active {
  animation: fabSubIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
.fab-sub-leave-active {
  animation: fabSubOut 0.2s ease forwards;
}
@keyframes fabSubIn {
  from { opacity: 0; transform: translateY(20px) scale(0.8); }
  to   { opacity: 1; transform: translateY(0)    scale(1);   }
}
@keyframes fabSubOut {
  from { opacity: 1; transform: translateY(0)    scale(1);   }
  to   { opacity: 0; transform: translateY(12px) scale(0.85); }
}


/* ══════════════════════════════════════════
   DELETE MODAL
══════════════════════════════════════════ */
.del-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
}

.del-modal-content {
  background: #fff;
  width: 100%;
  max-width: 500px;
  border-radius: 20px 20px 0 0;
  border: 2.5px solid #101010;
  border-bottom: none;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.18);
}

.del-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 12px;
  border-bottom: 2px solid #f1f5f9;
  flex-shrink: 0;
}

.del-modal-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  color: #ef4444;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.del-modal-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}
.del-modal-close:hover { background: #f3f4f6; }

.del-modal-subtitle {
  font-size: 0.82rem;
  color: #6b7280;
  padding: 8px 20px 0;
  margin: 0;
  flex-shrink: 0;
}

.del-select-all {
  padding: 10px 20px 6px;
  border-bottom: 1.5px solid #f1f5f9;
  flex-shrink: 0;
}

.del-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 20px;
}

.del-checkbox-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.12s;
  user-select: none;
}
.del-checkbox-row:hover { background: #fef2f2; }
.del-checkbox-row.is-selected { background: #fee2e2; }
.del-checkbox-row--all { font-weight: 700; font-size: 0.88rem; color: #374151; }

.del-checkbox-row input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #ef4444;
  flex-shrink: 0;
  cursor: pointer;
}

.del-item-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.del-item-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.del-item-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.del-item-title {
  font-weight: 700;
  font-size: 0.88rem;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.del-item-meta {
  font-size: 0.72rem;
  color: #9ca3af;
  font-weight: 500;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.del-empty {
  text-align: center;
  color: #9ca3af;
  font-size: 0.88rem;
  padding: 24px 0;
}

.del-modal-footer {
  display: flex;
  gap: 10px;
  padding: 14px 20px;
  border-top: 2px solid #f1f5f9;
  flex-shrink: 0;
}

.del-btn-cancel {
  flex: 1;
  padding: 10px;
  background: #f3f4f6;
  color: #374151;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  border: 2px solid #101010;
  border-radius: 0;
  cursor: pointer;
  box-shadow: 2px 2px 0 #101010;
  transition: transform 0.1s;
}
.del-btn-cancel:hover { transform: translate(-1px,-1px); }

.del-btn-confirm {
  flex: 1.5;
  padding: 10px;
  background: #ef4444;
  color: #fff;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  border: 2px solid #101010;
  border-radius: 0;
  cursor: pointer;
  box-shadow: 2px 2px 0 #101010;
  transition: transform 0.1s, opacity 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.del-btn-confirm:hover:not(:disabled) { transform: translate(-1px,-1px); }
.del-btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; }

/* ══════════════════════════════════════════
   DELETE MODAL V2 (with Year & Month Filters)
══════════════════════════════════════════ */
.del-modal-content-v2 {
  background: #fdfdfd;
  width: 100%;
  max-width: 520px;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full screen as per design */
  overflow: hidden;
}

.del-modal-header-v2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 2.5px solid #101010;
  flex-shrink: 0;
  gap: 12px;
}

.del-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.del-header-icon {
  font-size: 1.6rem;
  color: #ef4444;
  flex-shrink: 0;
}

.del-modal-title-v2 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.2rem;
  font-weight: 900;
  color: #101010;
  margin: 0;
  line-height: 1.2;
}

.del-modal-subtitle-v2 {
  font-size: 0.75rem;
  color: #64748b;
  margin: 2px 0 0;
  line-height: 1.3;
}

.del-header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.del-btn-icon {
  background: #fff;
  border: 2px solid #101010;
  font-size: 1rem;
  color: #101010;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 2px 0 #101010;
  transition: transform 0.1s, box-shadow 0.1s;
}
.del-btn-icon:active { 
  transform: translate(2px, 2px);
  box-shadow: 0 0 0 #101010;
}

/* Year Section wrapper */
.del-year-section {
  flex-shrink: 0;
  border-bottom: 1.5px solid #f1f5f9;
  user-select: none;
}

/* Viewport clips the sliding track — height fixed so nothing below shifts */
.del-year-viewport {
  overflow: hidden;
  /* 3 rows × ~40px + padding */
  height: 144px;
  position: relative;
}

/* The track slides left/right during drag */
.del-year-track {
  width: 100%;
  height: 100%;
  will-change: transform;
}

/* Year Filter Buttons (Grid 3 cols) */
.del-year-filter {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 20px 28px 8px;
}

.del-year-btn {
  padding: 10px 4px;
  background: transparent;
  border: none;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: #9ca3af;
  cursor: pointer;
  text-align: center;
  transition: color 0.15s;
}
.del-year-btn:hover { color: #6b7280; }
.del-year-btn.is-active {
  color: #ef4444;
  font-size: 1.1rem;
}

/* Page indicator dots */
.del-year-page-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 6px 0 10px;
}
.del-year-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e4e4e7;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
}
.del-year-dot.is-active {
  background: #ef4444;
  transform: scale(1.3);
}

/* Month Pills Filter */
.del-month-filter {
  display: flex;
  gap: 8px;
  padding: 12px 18px 14px;
  overflow-x: auto;
  flex-shrink: 0;
  scrollbar-width: none;
  border-bottom: 1.5px solid #f1f5f9;
}
.del-month-filter::-webkit-scrollbar { display: none; }

.del-month-pill {
  padding: 6px 16px;
  background: #f4f4f5;
  border: none;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  color: #52525b;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s;
}
.del-month-pill:hover { background: #e4e4e7; }
.del-month-pill.is-active {
  background: #101010;
  color: #fff;
}
/* Month with data gets a subtle accent border */
.del-month-pill.has-data:not(.is-active) {
  color: #101010;
  font-weight: 700;
  background: #fff;
  border: 1.5px solid #d1d5db;
}

/* ── Year grid slide transition (direction-aware) ── */
/* Slide LEFT (going to later years: swipe right) */
.year-slide-left-enter-active,
.year-slide-left-leave-active,
.year-slide-right-enter-active,
.year-slide-right-leave-active {
  transition: opacity 0.28s cubic-bezier(0.25,1,0.5,1),
              transform 0.28s cubic-bezier(0.25,1,0.5,1);
  position: absolute;
  width: 100%;
}
.year-slide-left-enter-from  { opacity: 0; transform: translateX(60%); }
.year-slide-left-leave-to    { opacity: 0; transform: translateX(-60%); }
.year-slide-right-enter-from { opacity: 0; transform: translateX(-60%); }
.year-slide-right-leave-to   { opacity: 0; transform: translateX(60%); }


/* Search Panel */
.del-search-panel {
  padding: 12px 18px 8px;
  border-bottom: 1.5px solid #f1f5f9;
  flex-shrink: 0;
}

.del-search-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.del-search-icon {
  color: #9ca3af;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.del-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-family: 'Inter', sans-serif;
  font-size: 0.92rem;
  color: #111827;
  background: transparent;
}
.del-search-input::placeholder { color: #9ca3af; }

.del-search-clear {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}
.del-search-clear:hover { color: #ef4444; }

.del-search-hint {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 6px 0 0 2px;
}
.del-search-hint strong { color: #374151; }

/* Search button active state */
.del-btn-search.is-searching {
  background: #101010;
  color: #fff;
  box-shadow: none;
}

/* Search panel slide transition */
.del-search-slide-enter-active { transition: max-height 0.28s cubic-bezier(0.25,1,0.5,1), opacity 0.22s ease; }
.del-search-slide-leave-active { transition: max-height 0.22s ease, opacity 0.18s ease; }
.del-search-slide-enter-from,
.del-search-slide-leave-to    { max-height: 0; opacity: 0; overflow: hidden; }
.del-search-slide-enter-to,
.del-search-slide-leave-from  { max-height: 120px; opacity: 1; }

/* Moments List v2 */

.del-list-v2 {
  flex: 1;
  overflow-y: auto;
  padding: 0 18px 12px;
}

.del-item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  background: transparent;
  border: none;
  cursor: pointer;
  user-select: none;
}

.del-item-card .del-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #101010;
  flex-shrink: 0;
  cursor: pointer;
  margin: 0 6px 0 0;
}

.del-item-dot-v2 {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid #101010;
}

.del-item-details {
  flex: 1;
  min-width: 0;
}

.del-item-title-v2 {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 0.92rem;
  color: #1f2937;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.del-item-meta-v2 {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: #9ca3af;
  font-weight: 500;
}

.del-item-meta-v2 i {
  font-size: 0.7rem;
  opacity: 0.8;
}

.del-empty-v2 {
  text-align: center;
  color: #9ca3af;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.del-empty-ghost-icon {
  font-size: 3.5rem;
  color: #d1d5db;
  display: block;
  animation: ghost-float 2.8s ease-in-out infinite;
}

@keyframes ghost-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}

.del-empty-v2 p {
  font-size: 0.9rem;
  margin: 0;
  color: #6b7280;
  font-weight: 500;
}

/* ═════════════ LOGOUT MODAL — Neo Brutalism ═════════════ */
.logout-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.logout-dialog {
  background: #fdfdfd;
  border: 3px solid #101010;
  box-shadow: 6px 6px 0 #101010;
  border-radius: 4px;
  padding: 22px 22px 20px;
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Header row */
.logout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logout-badge {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  background: #ef4444;
  color: #fff;
  padding: 3px 8px;
  border: 1.5px solid #101010;
  border-radius: 2px;
}
.logout-close-x {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #6b7280;
  cursor: pointer;
  padding: 2px 4px;
  line-height: 1;
}
.logout-close-x:hover { color: #111827; }

/* Title */
.logout-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
  line-height: 1.3;
}

/* Token box */
.logout-token-box {
  background: #f9fafb;
  border: 2px solid #101010;
  border-radius: 4px;
  padding: 10px 12px 8px;
  box-shadow: 3px 3px 0 #101010;
}
.logout-token-lbl {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9ca3af;
}
.logout-token-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.logout-token-val {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 0.82rem;
  font-weight: 700;
  color: #111827;
  word-break: break-all;
}
.logout-copy-btn {
  background: #101010;
  color: #fff;
  border: none;
  border-radius: 3px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  flex-shrink: 0;
  transition: opacity 0.15s;
}
.logout-copy-btn:hover { opacity: 0.7; }
.logout-token-note {
  font-size: 0.72rem;
  color: #f59e0b;
  font-weight: 700;
  margin: 6px 0 0;
}

/* Action buttons */
.logout-actions {
  display: flex;
  gap: 10px;
}
.lo-btn {
  flex: 1;
  padding: 10px 0;
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: 0.88rem;
  border-radius: 3px;
  cursor: pointer;
  border: 2px solid #101010;
  transition: transform 0.08s, box-shadow 0.08s;
}
.lo-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0 0 0 #101010 !important;
}
.lo-btn--cancel {
  background: #fff;
  color: #101010;
  box-shadow: 3px 3px 0 #101010;
}
.lo-btn--cancel:hover { background: #f3f4f6; }
.lo-btn--go {
  background: #ef4444;
  color: #fff;
  box-shadow: 3px 3px 0 #101010;
}
.lo-btn--go:hover { background: #dc2626; }

/* Animations */
.logout-pop-enter-active { transition: transform 0.28s cubic-bezier(0.25,1,0.5,1), opacity 0.22s ease; }
.logout-pop-leave-active { transition: transform 0.18s ease, opacity 0.15s ease; }
.logout-pop-enter-from  { transform: scale(0.88) translateY(12px); opacity: 0; }
.logout-pop-leave-to    { transform: scale(0.92); opacity: 0; }

/* Footer v2 */

.del-modal-footer-v2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 2.5px solid #101010;
  background: #fdfdfd;
  flex-shrink: 0;
}

.del-footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.del-select-all-v2 {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: #101010;
  user-select: none;
}

.del-select-all-v2 input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #101010;
  margin: 0;
  cursor: pointer;
}

.del-count {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: #52525b;
}

.del-count-num {
  color: #ef4444;
  font-weight: 800;
}

.del-btn-delete-v2 {
  background: #fca5a5;
  color: #101010;
  border: 2px solid #101010;
  padding: 10px 20px;
  border-radius: 0;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 3px 3px 0 #101010;
  transition: transform 0.1s, box-shadow 0.1s;
  flex-shrink: 0;
}
.del-btn-delete-v2:hover:not(:disabled) {
  background: #f87171;
}
.del-btn-delete-v2:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 #101010;
}
.del-btn-delete-v2:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
  transform: translate(3px, 3px);
}


/* ══════════════════════════════════════════
   BLUE AMBER — Welcome Header Theme Overrides (V2)
   Soft Indigo Scrapbook × Unified Profile Background × Solid Member Card
   Only applies when [data-theme="blue amber"] is active.
   Does NOT affect other themes.
   ══════════════════════════════════════════ */

/* ── A. Unified Scrapbook Background: Primary Indigo ── */
[data-theme="blue amber"] .hdr-scrapbook-bg {
  position: relative;
  isolation: isolate;
  background-color: #756CE0;
  overflow: hidden;
}

/* ── B. Soft Blueprint Grid (1px white line, 17% opacity, 40px spacing, 11deg rotation) ── */
[data-theme="blue amber"] .hdr-scrapbook-bg::before {
  content: "";
  position: absolute;
  inset: -60%;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.17) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.17) 1px, transparent 1px);
  background-size: 40px 40px;
  transform: rotate(11deg);
}

/* Profile section shares unified scrapbook background */
[data-theme="blue amber"] .hdr-profile-section {
  background-color: transparent;
}
[data-theme="blue amber"] .hdr-profile-section::before {
  display: none;
}

/* ── C. Profile Photo Frame — Solid White ── */
[data-theme="blue amber"] .profile-photo-frame {
  background: #FFFFFF;
  border-color: #242424;
  box-shadow: 2.5px 2.5px 0 #242424;
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

/* ── E. User Name — White on Indigo with Amber Dot ── */
[data-theme="blue amber"] .profile-user-name {
  color: #FFFFFF;
}
[data-theme="blue amber"] .profile-name-dot {
  color: #F2C45F;
}

/* ── F. Edit Button & Inline Input — Solid Surfaces ── */
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
[data-theme="blue amber"] .profile-name-input {
  background: #FFFFFF;
  color: #272443;
  border-color: #242424;
  box-shadow: 2px 2px 0 #242424;
}
[data-theme="blue amber"] .hdr-btn-save {
  background: #F2C45F;
  color: #272443;
}
[data-theme="blue amber"] .hdr-btn-save:hover {
  background: #E5B450;
}
[data-theme="blue amber"] .hdr-btn-cancel {
  background: #FFFFFF;
  color: #272443;
}

/* ── G. ID Badge — Solid White Surface ── */
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

/* ── H. Vehicle Animations — Colored on Indigo ── */
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

/* ── I. Traveling Together — Solid White Card on Scrapbook Background ── */
[data-theme="blue amber"] .hdr-traveling-panel {
  background-color: #FFFFFF;
  border: 1.5px solid #242424;
  box-shadow: 2.5px 2.5px 0 #242424;
  border-radius: 6px;
  position: relative;
  z-index: 2;
}
[data-theme="blue amber"] .hdr-traveling-panel::before {
  display: none; /* No grid inside solid card */
}

[data-theme="blue amber"] .traveling-header {
  border-bottom: 1.5px solid #EAE8FC;
}
[data-theme="blue amber"] .traveling-icon {
  color: #756CE0;
}
[data-theme="blue amber"] .traveling-title {
  color: #242424;
  font-weight: 800;
}

/* ── J. Member Count Badge — Soft Amber ── */
[data-theme="blue amber"] .traveling-count-badge {
  background: #F2C45F;
  color: #242424;
  border: 1px solid #242424;
  font-weight: 800;
}

/* ── K. Member Chips & Rows — Solid Random Palette (Deterministic) ── */
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

/* ── L. +N Member Chip — Amber Solid ── */
[data-theme="blue amber"] .collab-more-chip {
  background: #F2C45F;
  color: #242424;
  border: 1.5px solid #242424;
  box-shadow: 1.5px 1.5px 0 #242424;
}
[data-theme="blue amber"] .collab-more-chip:hover {
  background: #E5B450;
  color: #242424;
}

/* ── M. Member Popup Modal — Blue Amber Member Panel ── */
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

/* ── N. Device Status Strip — Solid Soft Indigo (#E7E4FF) ── */
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

/* ── N. Header outer shell border — stays charcoal ── */
[data-theme="blue amber"] .session-header {
  border-bottom-color: #242424;
  box-shadow: 0 4px 0 #242424;
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

/* ── Live Update Toast ─────────────────────────────────────── */
.live-update-toast-banner {
  position: fixed;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999999;
  background: #fcd34d;
  color: #1a1a2e;
  border: 2px solid #1a1a2e;
  border-radius: 999px;
  padding: 6px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  font-weight: 800;
  box-shadow: 3px 3px 0 #1a1a2e;
  cursor: pointer;
  white-space: nowrap;
}
.live-update-toast-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
  animation: live-toast-pulse 1.2s infinite;
}
@keyframes live-toast-pulse {
  0% { transform: scale(0.9); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.8; }
}
.live-update-toast-tap {
  font-size: 0.68rem;
  font-family: 'Inter', sans-serif;
  color: #78350f;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(26, 26, 46, 0.2);
  padding: 2px 7px;
  border-radius: 999px;
  margin-left: 4px;
}
.live-update-toast-enter-active,
.live-update-toast-leave-active {
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.live-update-toast-enter-from,
.live-update-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-14px) scale(0.95);
}

/* ── Exit App Toast (Android Back Button) ─────────────────────────── */
.exit-toast-snackbar {
  position: fixed;
  bottom: 88px; /* above bottom nav */
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #1a1a2e;
  color: #fcd34d;
  border: 2px solid #fcd34d;
  border-radius: 999px;
  padding: 10px 20px;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(0,0,0,0.35);
  white-space: nowrap;
  pointer-events: none;
}

.exit-toast-snackbar i {
  font-size: 1rem;
  opacity: 0.85;
}

.exit-toast-enter-active,
.exit-toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.exit-toast-enter-from,
.exit-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px) scale(0.95);
}

/* ── Login Success Centered Pop-up ───────────────────────────────────── */
.login-success-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  padding: 24px;
  box-sizing: border-box;
}

.login-success-card {
  position: relative;
  background: radial-gradient(#cbd5e1 1.2px, #ffffff 1.2px);
  background-size: 14px 14px;
  border: 3px solid #1a1a2e;
  border-radius: 26px;
  box-shadow: 8px 8px 0 #1a1a2e;
  padding: 32px 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: min(326px, 88vw);
  box-sizing: border-box;
  overflow: visible;
}

/* Corner Sticker Badge */
.login-corner-sticker {
  position: absolute;
  top: -14px;
  left: -8px;
  background: #ffdd00;
  border: 2px solid #1a1a2e;
  border-radius: 8px;
  transform: rotate(-6deg);
  box-shadow: 2.5px 2.5px 0 #1a1a2e;
  padding: 4px 10px;
  font-family: 'Outfit', 'Space Grotesk', sans-serif;
  font-size: 0.7rem;
  font-weight: 900;
  color: #1a1a2e;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  z-index: 4;
  pointer-events: none;
  animation: sticker-wobble 3s ease-in-out infinite;
}

.login-corner-sticker i {
  color: #d97706;
  font-size: 0.72rem;
}

@keyframes sticker-wobble {
  0%, 100% {
    transform: rotate(-6deg);
  }
  50% {
    transform: rotate(-2deg) scale(1.03);
  }
}

/* Mini Quick Close Button */
.login-popup-close-btn {
  position: absolute;
  top: -12px;
  right: -8px;
  width: 32px;
  height: 32px;
  background: #ffffff;
  border: 2px solid #1a1a2e;
  border-radius: 50%;
  box-shadow: 2.5px 2.5px 0 #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: #1a1a2e;
  cursor: pointer;
  z-index: 5;
  transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}

.login-popup-close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
  transform: scale(1.08);
}

.login-popup-close-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0.5px 0.5px 0 #1a1a2e;
}

/* Floating Festive Trinkets */
.login-trinket {
  position: absolute;
  border: 2px solid #1a1a2e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2.5px 2.5px 0 #1a1a2e;
  pointer-events: none;
  z-index: 3;
}

.trinket-top-left {
  top: 18px;
  left: -15px;
  width: 30px;
  height: 30px;
  background: #fde047;
  color: #1a1a2e;
  font-size: 0.76rem;
  animation: float-rotate-a 2.6s ease-in-out infinite;
}

.trinket-top-right {
  top: 24px;
  right: -15px;
  width: 30px;
  height: 30px;
  background: #fbbf24;
  color: #1a1a2e;
  font-size: 0.8rem;
  animation: float-rotate-b 3s ease-in-out infinite;
}

.trinket-bottom-left {
  bottom: 40px;
  left: -14px;
  width: 28px;
  height: 28px;
  background: #fda4af;
  color: #e11d48;
  font-size: 0.72rem;
  animation: float-rotate-c 2.8s ease-in-out infinite;
}

.trinket-bottom-right {
  bottom: 36px;
  right: -14px;
  width: 30px;
  height: 30px;
  background: #c4b5fd;
  color: #6d28d9;
  font-size: 0.75rem;
  animation: float-rotate-d 3.2s ease-in-out infinite;
}

@keyframes float-rotate-a {
  0%, 100% {
    transform: translateY(0) rotate(-8deg);
  }
  50% {
    transform: translateY(-5px) rotate(12deg) scale(1.08);
  }
}

@keyframes float-rotate-b {
  0%, 100% {
    transform: translateY(0) rotate(10deg);
  }
  50% {
    transform: translateY(-6px) rotate(-8deg) scale(1.08);
  }
}

@keyframes float-rotate-c {
  0%, 100% {
    transform: translateY(0) rotate(-12deg);
  }
  50% {
    transform: translateY(-4px) rotate(6deg) scale(1.06);
  }
}

@keyframes float-rotate-d {
  0%, 100% {
    transform: translateY(0) rotate(8deg);
  }
  50% {
    transform: translateY(-5px) rotate(-14deg) scale(1.08);
  }
}

/* Confetti Accent Dots */
.confetti-dot {
  position: absolute;
  width: 9px;
  height: 9px;
  border: 1.5px solid #1a1a2e;
  border-radius: 50%;
  pointer-events: none;
  box-shadow: 1.5px 1.5px 0 #1a1a2e;
}

.confetti-dot.dot-1 {
  top: -4px;
  right: 48px;
  background: #38bdf8;
  animation: pulse-dot 2s ease-in-out infinite alternate;
}

.confetti-dot.dot-2 {
  bottom: -4px;
  right: 56px;
  background: #fb923c;
  animation: pulse-dot 2.3s ease-in-out infinite alternate;
}

.confetti-dot.dot-3 {
  top: 50%;
  left: -6px;
  background: #4ade80;
  animation: pulse-dot 1.8s ease-in-out infinite alternate;
}

.confetti-dot.dot-4 {
  bottom: 12px;
  left: 28px;
  background: #f43f5e;
  animation: pulse-dot 2.5s ease-in-out infinite alternate;
}

@keyframes pulse-dot {
  0% {
    transform: scale(0.85);
  }
  100% {
    transform: scale(1.25);
  }
}

/* Hero Check Icon with Halo */
.login-success-icon-wrap {
  width: 72px;
  height: 72px;
  background: #ffffff;
  border: 3px solid #1a1a2e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 4px 4px 0 #10b981;
  margin-bottom: 14px;
  position: relative;
}

.login-icon-halo {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.28);
  z-index: 0;
  animation: halo-pulse 2s ease-in-out infinite;
}

@keyframes halo-pulse {
  0%, 100% {
    transform: scale(0.96);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.16);
    opacity: 0.15;
  }
}

.login-success-icon-inner {
  position: relative;
  z-index: 1;
  font-size: 2.5rem;
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: icon-pop-bounce 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes icon-pop-bounce {
  0% {
    transform: scale(0.3) rotate(-20deg);
    opacity: 0;
  }
  70% {
    transform: scale(1.18) rotate(5deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Security / Status Pill Badge */
.login-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #fef3c7;
  border: 1.5px solid #1a1a2e;
  color: #92400e;
  font-family: 'Outfit', 'Space Grotesk', sans-serif;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  padding: 4px 11px;
  border-radius: 999px;
  box-shadow: 2px 2px 0 #1a1a2e;
  margin-bottom: 10px;
}

.status-live-dot {
  width: 7px;
  height: 7px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 6px #10b981;
  animation: live-pulse 1.4s ease-in-out infinite;
}

@keyframes live-pulse {
  0%, 100% {
    transform: scale(0.85);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
}

.login-status-pill i {
  font-size: 0.76rem;
  color: #d97706;
}

/* Title */
.login-success-title {
  margin: 0;
  font-family: 'Outfit', 'Space Grotesk', sans-serif;
  font-size: 1.48rem;
  font-weight: 900;
  color: #1a1a2e;
  letter-spacing: -0.02em;
}

/* Detail Info Box */
.login-success-detail-box {
  margin-top: 10px;
  background: #ffffff;
  border: 2px solid #1a1a2e;
  box-shadow: 3px 3px 0 #e2e8f0;
  border-radius: 14px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
}

.detail-icon-pill {
  width: 32px;
  height: 32px;
  background: #e0f2fe;
  border: 1.5px solid #0284c7;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: #0284c7;
  flex-shrink: 0;
}

.detail-text-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  flex: 1;
  min-width: 0;
}

.login-success-sub {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
  word-break: break-word;
}

.detail-cloud-badge {
  font-family: 'Outfit', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  color: #059669;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

/* Timer Section */
.login-timer-section {
  width: 100%;
  margin-top: 16px;
}

.login-timer-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 6px;
  letter-spacing: 0.01em;
}

.login-timer-info i {
  font-size: 0.72rem;
  color: #94a3b8;
}

.login-timer-bar-wrap {
  width: 100%;
  height: 7px;
  background: #f1f5f9;
  border: 1.5px solid #1a1a2e;
  border-radius: 999px;
  overflow: hidden;
  box-sizing: border-box;
}

.login-timer-bar {
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, #34d399, #10b981);
  border-radius: 999px;
  animation: timer-shrink 2.5s linear forwards;
}

@keyframes timer-shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Transitions */
.login-popup-fade-enter-active,
.login-popup-fade-leave-active {
  transition: opacity 0.22s ease;
}

.login-popup-fade-enter-active .login-success-card,
.login-popup-fade-leave-active .login-success-card {
  transition: transform 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.22s ease;
}

.login-popup-fade-enter-from,
.login-popup-fade-leave-to {
  opacity: 0;
}

.login-popup-fade-enter-from .login-success-card,
.login-popup-fade-leave-to .login-success-card {
  opacity: 0;
  transform: scale(0.8) translateY(16px);
}
</style>
