<template>
  <div class="onboarding-page" :data-theme="activeTheme">
   <div class="ob-frame">

    <!-- ── GWEN THEME: Decorative ornaments with neo-brutalist photo mounts ─── -->
    <template v-if="activeTheme === 'gwen'">
      <!-- gwen-3: hanging upside-down with scrapbook paper mount — TOP-LEFT -->
      <div class="gwen-mount gwen-top-left" aria-hidden="true">
        <div class="gwen-paper-backing gwen-backing-top"></div>
        <img
          src="/src/assets/gwen-theme/gwen-3.png"
          alt=""
          class="gwen-img"
        />
      </div>
      <!-- gwen-1: standing comic art — RIGHT-CENTER beside map, mirrored -->
      <div class="gwen-mount gwen-mid-right" aria-hidden="true">
        <div class="gwen-paper-backing gwen-backing-mid"></div>
        <img
          src="/src/assets/gwen-theme/gwen-1.png"
          alt=""
          class="gwen-img"
        />
      </div>
      <!-- gwen-2: sitting 3D — BOTTOM-LEFT -->
      <div class="gwen-mount gwen-bot-left" aria-hidden="true">
        <div class="gwen-paper-backing gwen-backing-bot"></div>
        <img
          src="/src/assets/gwen-theme/gwen-2.png"
          alt=""
          class="gwen-img"
        />
      </div>
    </template>

    <!-- Decorative background shapes -->
    <svg
      class="ob-bg"
      viewBox="0 0 420 910"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <!-- Top-left indigo wavy blob -->
      <path
        d="M0,0 L155,0
           C150,40 105,55 115,95
           C125,135 95,160 60,175
           C30,188 10,215 0,245 Z"
        fill="#6f6bd8"
      />

      <!-- Orange outline hugging the blue blob's top edge -->
      <path
        d="M430,270
           C360,248 315,285 275,318
           C230,355 205,345 172,398
           C142,446 138,530 95,595
           C70,635 58,700 55,760
           L55,915 L430,915 Z"
        fill="#f97316"
      />

      <!-- Big blue blob (right / bottom) -->
      <path
        d="M430,285
           C362,262 320,298 280,330
           C235,367 210,357 178,408
           C148,456 144,538 102,602
           C78,640 66,703 63,762
           L63,915 L430,915 Z"
        fill="#6f6bd8"
      />

      <!-- Bottom-left yellow blob (stretching ~65% width, dipping down on the right) -->
      <path
        d="M0,580
           C80,560 160,720 270,895
           L270,915
           L0,915 Z"
        fill="#f6b93b"
      />
    </svg>

    <!-- Content wrapper -->
    <div class="ob-content">

      <!-- ── Original Theme Header ── -->
      <div v-if="activeTheme !== 'gwen'" class="ob-header-typo">
        <!-- Spiky star outline decoration -->
        <svg class="decor-spiky" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M50 0 L58 35 L90 20 L68 47 L100 50 L68 53 L90 80 L58 65 L50 100 L42 65 L10 80 L32 53 L0 50 L32 47 L10 20 L42 35 Z" stroke="#101010" stroke-width="6" stroke-linejoin="round"/>
        </svg>

        <h1 class="ob-line-1">WHOOSH</h1>
        <p class="ob-line-2">Collaborate Your Journey With</p>
        <div class="ob-line-3-container">
          <RocketAnimation :size="86" />
          <h1 class="ob-line-3">US</h1>
        </div>

        <!-- Orange star solid decoration -->
        <svg class="decor-orange" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M50 0 L58 35 L90 20 L68 47 L100 50 L68 53 L90 80 L58 65 L50 100 L42 65 L10 80 L32 53 L0 50 L32 47 L10 20 L42 35 Z" fill="#f97316" stroke="#101010" stroke-width="5" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- ── Gwen Theme Header ── -->
      <div v-else class="gwen-header-typo">
        <!-- Top label tag — eyebrow "READY FOR TAKEOFF?" -->
        <div class="gwen-tag-label">
          <span>READY FOR TAKEOFF?</span>
        </div>

        <!-- Main title card: notched neo-brutalist card —
             lower-right corner is cut away so the WITH US sticker docks into it.
             The card-wrap clips the shape; the backing layer matches the notch. -->
        <div class="gwen-title-card-wrap">
          <!-- Pink backing — offset by rotate+translate for layered-paper effect -->
          <div class="gwen-title-backing"></div>
          <!-- Foreground notched card: cream bg, border/shadow via filter on wrap -->
          <div class="gwen-title-card">
            <h1 class="gwen-title-main">WHOOSH</h1>
            <div class="gwen-title-divider"></div>
            <p class="gwen-title-sub">COLLABORATE YOUR<br>JOURNEY</p>
          </div>
          <!-- "WITH US" sticker — docked into the notch at lower-right of the card -->
          <div ref="withusStickerRef" class="gwen-withus-sticker">
            <span class="gwen-withus-text">WITH US</span>
          </div>
        </div>

        <!-- Sticker row: rocket only (WITH US moved to card-wrap notch) -->
        <div class="gwen-sticker-row">
          <!-- Rocket outer: translation animation via Motion for Vue runtime -->
          <div ref="rocketWrapRef" class="gwen-rocket-wrap">
            <!-- Rocket inner: static computed rotation only (independent of translation) -->
            <div
              class="gwen-rocket-inner"
              :style="{ transform: `rotate(${rocketRotation + 100}deg) scaleX(-1)` }"
            >
              <RocketAnimation :size="96" :disable-hover="true" />
            </div>
          </div>
        </div>
      </div>

      <!-- Map illustration card -->
      <div class="ob-map-wrapper" aria-hidden="true">
        <div class="ob-map-shadow"></div>
        <div class="ob-map-card">
          <!-- SVG map illustration -->
          <svg viewBox="0 0 350 300" xmlns="http://www.w3.org/2000/svg" class="ob-map-svg">
            <!-- Full background -->
            <rect width="350" height="300" fill="#f7eed6"/>

            <!-- Inner map area (padded inset: from 22,22 to 328,278) -->
            <rect x="22" y="22" width="306" height="256" fill="#f3e3bc"/>

            <!-- Teal water areas — all aligned to inner rect bounds -->
            <!-- Top-left water -->
            <path d="M22,22 L140,22 C118,58 72,66 66,105 C58,138 36,143 22,150 Z" fill="#5fa8a0"/>
            <!-- Top-right water -->
            <path d="M328,22 L328,100 C298,87 278,57 292,22 Z" fill="#5fa8a0"/>
            <!-- Bottom-left water -->
            <path d="M22,278 L22,200 C60,208 92,232 136,240 C172,246 186,278 186,278 Z" fill="#5fa8a0"/>
            <!-- Bottom-right water -->
            <path d="M328,278 L328,170 C298,183 268,215 274,278 Z" fill="#5fa8a0"/>

            <!-- Small cloud detail -->
            <circle cx="90" cy="68" r="11" fill="#f7eed6"/>
            <circle cx="105" cy="62" r="9" fill="#f7eed6"/>
            <circle cx="76" cy="73" r="7" fill="#f7eed6"/>

            <!-- Small island bottom-right -->
            <circle cx="298" cy="225" r="12" fill="#f3e3bc"/>

            <!-- Dashed route loop — spans inner area -->
            <path d="M105,155
                     C122,123 168,100 208,93
                     C242,87 268,106 274,132
                     C280,156 258,170 230,175
                     C200,180 168,172 152,194
                     C138,212 152,230 180,232
                     C212,235 248,223 266,205"
                  stroke="#1b1b1b" stroke-width="3.5" stroke-dasharray="10,8"
                  fill="none" stroke-linecap="round"/>

            <!-- Pin 1 -->
            <path d="M208 70 C198 70 191 77 191 87 C191 100 208 115 208 115 C208 115 225 100 225 87 C225 77 218 70 208 70 Z" fill="#1b1b1b"/>
            <circle cx="208" cy="87" r="6" fill="#f3e3bc"/>

            <!-- Pin 2 -->
            <path d="M180 212 C171 212 164 219 164 228 C164 240 180 255 180 255 C180 255 196 240 196 228 C196 219 189 212 180 212 Z" fill="#1b1b1b"/>
            <circle cx="180" cy="228" r="5.5" fill="#f3e3bc"/>

            <!-- Corner brackets aligned to inner rect corners -->
            <path d="M36,46 L36,34 L54,34" stroke="#b3987a" stroke-width="3" fill="none"/>
            <path d="M296,34 L314,34 L314,46" stroke="#b3987a" stroke-width="3" fill="none"/>
            <path d="M36,254 L36,266 L54,266" stroke="#b3987a" stroke-width="3" fill="none"/>
            <path d="M314,254 L314,266 L296,266" stroke="#b3987a" stroke-width="3" fill="none"/>

            <!-- Tiny compass marks -->
            <text x="10" y="155" font-size="11" fill="#b3987a" font-family="serif">&#10547;</text>
            <text x="332" y="162" font-size="11" fill="#b3987a" font-family="serif">&#9737;</text>
          </svg>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="ob-actions">
        <!-- Single Primary Entry Button: Mulai Sekarang -->
        <div class="btn-wrapper">
          <div class="btn-shadow" aria-hidden="true"></div>
          <button
            id="btn-main-entry"
            class="ob-btn-primary"
            @click="showAuthChoice = true"
          >
            <span>Mulai Sekarang</span>
            <i class="fa-solid fa-arrow-right" style="margin-left: 8px; font-size: 0.9em;"></i>
          </button>
        </div>

        <!-- Info Trigger: Pelajari Lanjutan (Custom Neo-Brutalist Modal) -->
        <button
          id="btn-pelajari"
          class="ob-link"
          @click="handleOpenLearnMore"
        >
          <i class="fa-regular fa-circle-question" style="margin-right: 4px;"></i>
          Pelajari lanjutan
        </button>

        <!-- Changelog Action: Refined 'Versi Aplikasi' with FA bolt icon, 2-line title & compact badges -->
        <div class="ob-changelog-trigger-wrap">
          <button
            class="ob-changelog-text-link"
            @click="handleOpenVersionHistory"
            type="button"
            :aria-label="`Lihat Versi Aplikasi v${APP_VERSION}`"
          >
            <i class="fa-solid fa-bolt ob-changelog-icon" aria-hidden="true"></i>
            <span class="ob-changelog-title">
              <span>Versi</span>
              <span>Aplikasi</span>
            </span>
            <span class="ob-changelog-badges">
              <span class="changelog-badge-ver">v{{ APP_VERSION }}</span>
              <span class="changelog-badge-new">NEW</span>
            </span>
          </button>
        </div>

        <!-- ── Theme Switcher — inline segmented control ── -->
        <div class="ob-theme-switcher-seg" role="group" aria-label="Pilih Tema">
          <button
            class="seg-btn"
            :class="{ 'is-active': activeTheme === 'original' }"
            @click="setTheme('original')"
            :aria-pressed="activeTheme === 'original'"
          >
            <span class="seg-dot" style="background:#6f6bd8"></span>
            Original
          </button>
          <span class="seg-divider" aria-hidden="true"></span>
          <button
            class="seg-btn"
            :class="{ 'is-active': activeTheme === 'gwen' }"
            @click="setTheme('gwen')"
            :aria-pressed="activeTheme === 'gwen'"
          >
            <span class="seg-dot" style="background:#e879a0"></span>
            Gwen
          </button>
        </div>

        <p class="ob-footer-note">
          Made with <i class="fa-solid fa-heart orig-heart-icon" aria-hidden="true"></i> by 17frn
        </p>

      </div>

    </div>

    <!-- ── CHANGELOG MODAL: ORIGINAL THEME ───────────────────── -->
    <Transition name="orig-selector-pop">
      <div
        v-if="showChangelog && activeTheme !== 'gwen'"
        class="orig-selector-overlay"
        @click="handleOverlayClick"
      >
        <div class="orig-selector-card orig-changelog-modal-card" @click.stop role="dialog" aria-modal="true" aria-label="Riwayat Versi APK">

          <!-- ── STATE 1: VERSION HISTORY LIST ── -->
          <template v-if="!selectedVersion">
            <div class="orig-selector-header">
              <div class="orig-selector-eyebrow orig-archive-eyebrow">
                <i class="fa-solid fa-box-archive" aria-hidden="true"></i>
                <span>ARSIP VERSI • WHOOSH</span>
              </div>
              <h2 class="orig-selector-title">Riwayat Versi APK</h2>
              <p class="orig-selector-subtitle">Lihat catatan rilis dan pembaruan di setiap versi.</p>
            </div>

            <div class="orig-selector-divider" aria-hidden="true"></div>

            <div class="orig-changelog-body-scroll">
              <div class="orig-version-list" role="list">
                <button
                  v-for="rel in VERSION_HISTORY"
                  :key="rel.version"
                  class="orig-version-item-btn"
                  @click="selectVersion(rel)"
                  type="button"
                  :aria-label="`Buka catatan rilis ${rel.versionLabel}`"
                >
                  <div class="orig-version-item-top">
                    <div class="orig-version-badges">
                      <span class="orig-badge-ver">{{ rel.versionLabel }}</span>
                      <span v-if="rel.isLatest" class="orig-badge-latest">NEW</span>
                      <span v-else class="orig-badge-date">{{ rel.dateLabelOriginal || rel.dateLabel }}</span>
                    </div>
                    <span class="orig-version-item-action">
                      <span>Buka</span>
                      <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                    </span>
                  </div>
                  <p class="orig-version-item-summary">{{ rel.shortSummaryOriginal || rel.shortSummary }}</p>
                </button>
              </div>
            </div>

            <div class="orig-history-footer-hint">
              <p>Ketuk area di luar panel untuk menutup halaman</p>
            </div>
          </template>

          <!-- ── STATE 2: CHANGELOG DETAIL VIEW (Clean Bento: Focus on release notes) ── -->
          <template v-else>
            <div class="orig-selector-header orig-detail-header">
              <div class="orig-selector-eyebrow orig-detail-eyebrow">
                <i class="fa-solid fa-file-lines" aria-hidden="true"></i>
                <span>CATATAN RILIS • {{ selectedVersion.versionLabel }}</span>
              </div>
              <h2 class="orig-selector-title orig-detail-title">{{ selectedVersion.titleOriginal || selectedVersion.title }}</h2>
              <div class="orig-detail-meta">
                <span class="orig-detail-meta-date">
                  <i class="fa-regular fa-clock" aria-hidden="true"></i> {{ selectedVersion.dateLabelOriginal || selectedVersion.dateLabel }}
                </span>
              </div>
            </div>

            <div class="orig-selector-divider" aria-hidden="true"></div>

            <div class="orig-changelog-body-scroll orig-detail-body-scroll">
              <div
                v-for="(cat, idx) in selectedVersion.categories"
                :key="idx"
                class="orig-cat-group"
              >
                <div class="orig-cat-header">
                  <i :class="cat.icon" aria-hidden="true"></i>
                  <span>{{ cat.titleOriginal || cat.title }}</span>
                </div>
                <div class="orig-cat-items">
                  <div v-for="(item, iIdx) in cat.items" :key="iIdx" class="orig-changelog-item">
                    <span :class="['orig-bullet-tag', `orig-${item.tagClass}`]">{{ item.tagOriginal || item.tag }}</span>
                    <div class="orig-changelog-text">
                      <strong>{{ item.titleOriginal || item.title }}</strong> {{ item.descriptionOriginal || item.description }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="orig-history-footer-hint">
              <p>Ketuk area di luar panel untuk menutup halaman</p>
            </div>
          </template>

        </div>
      </div>
    </Transition>

    <!-- ── CHANGELOG MODAL: GWEN THEME ───────────────────────── -->
    <Transition name="paper-pop">
      <div
        v-if="showChangelog && activeTheme === 'gwen'"
        class="paper-changelog-overlay"
        @click="handleOverlayClick"
      >
        <div class="paper-sheet-card" @click.stop>
          <!-- Washi tape at top -->
          <div class="paper-washi-tape" aria-hidden="true"></div>

          <!-- Paper clip decoration -->
          <div class="paper-clip-icon" aria-hidden="true">
            <i class="fa-solid fa-paperclip"></i>
          </div>

          <!-- ── STATE 1: VERSION HISTORY LIST ── -->
          <template v-if="!selectedVersion">
            <!-- Paper Header -->
            <div class="paper-header">
              <div class="paper-stamp-tag">
                <i class="fa-solid fa-clock-rotate-left"></i>
                <span>ARSIP VERSI • WHOOSH CHANGELOG</span>
              </div>
              <h2 class="paper-title">Riwayat Versi APK</h2>
              <p class="paper-history-sub">Lihat pembaruan di setiap versi WHOOSH.</p>
            </div>

            <!-- Divider perforated paper line -->
            <div class="paper-perforated-line"></div>

            <!-- Scrollable Version List -->
            <div class="paper-body-scroll version-history-scroll">
              <div class="version-history-list" role="list">
                <button
                  v-for="rel in VERSION_HISTORY"
                  :key="rel.version"
                  class="version-card-btn"
                  @click="selectVersion(rel)"
                  type="button"
                  :aria-label="`Buka catatan rilis ${rel.versionLabel}`"
                >
                  <div class="version-card-top">
                    <div class="version-card-badges">
                      <span class="changelog-badge-ver">{{ rel.versionLabel }}</span>
                      <span v-if="rel.isLatest" class="changelog-badge-new">NEW</span>
                      <span v-else class="version-card-date-tag">{{ rel.dateLabel }}</span>
                    </div>
                    <span class="version-card-open-hint">
                      <span class="hint-text">Buka</span>
                      <i class="fa-solid fa-chevron-right"></i>
                    </span>
                  </div>
                  <p class="version-card-summary">{{ rel.shortSummary }}</p>
                </button>
              </div>
            </div>

            <!-- Paper Footer Note -->
            <div class="paper-footer">
              <span class="paper-footer-hint">
                <i class="fa-solid fa-hand-pointer"></i> Ketuk area luar buat nutup ya bestie!
              </span>
            </div>
          </template>

          <!-- ── STATE 2: CHANGELOG DETAIL VIEW (Isolated per version) ── -->
          <template v-else>
            <!-- Paper Header -->
            <div class="paper-header">
              <div class="paper-stamp-tag">
                <i :class="selectedVersion.stampIcon"></i>
                <span>{{ selectedVersion.stampTag }}</span>
              </div>
              <h2 class="paper-title">{{ selectedVersion.title }}</h2>
              <div class="paper-meta-row">
                <span class="paper-version-badge">Versi {{ selectedVersion.version }}</span>
                <span class="paper-date"><i class="fa-regular fa-clock"></i> {{ selectedVersion.dateLabel }}</span>
              </div>
            </div>

            <!-- Divider perforated paper line -->
            <div class="paper-perforated-line"></div>

            <!-- Scrollable Changelog List for Selected Release ONLY -->
            <div class="paper-body-scroll">
              <div
                v-for="(cat, idx) in selectedVersion.categories"
                :key="idx"
                class="changelog-group"
              >
                <div class="group-header" :class="cat.iconClass || 'group-ui'">
                  <i :class="cat.icon"></i>
                  <span>{{ cat.title }}</span>
                </div>
                <ul class="changelog-list">
                  <li v-for="(item, iIdx) in cat.items" :key="iIdx">
                    <span class="bullet-tag" :class="item.tagClass || 'tag-blue'">{{ item.tag }}</span>
                    <div class="changelog-item-content">
                      <strong>{{ item.title }}</strong> {{ item.description }}
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Paper Footer Note -->
            <div class="paper-footer paper-footer-detail">
              <span class="paper-footer-hint">
                <i class="fa-solid fa-hand-pointer"></i> Ketuk area luar buat nutup ya bestie!
              </span>
            </div>
          </template>
        </div>
      </div>
    </Transition>

    <!-- ── AUTH METHOD SELECTION MODAL: ORIGINAL THEME ─────── -->
    <Transition name="orig-selector-pop">
      <div
        v-if="showAuthChoice && activeTheme !== 'gwen'"
        class="orig-selector-overlay"
        @click="showAuthChoice = false"
      >
        <div class="orig-selector-card" @click.stop role="dialog" aria-modal="true" aria-label="Pilih Cara Masuk">

          <!-- Header -->
          <div class="orig-selector-header">
            <div class="orig-selector-eyebrow">
              <i class="fa-solid fa-key" aria-hidden="true"></i>
              <span>MASUK / DAFTAR</span>
            </div>
            <h2 class="orig-selector-title">Pilih Cara Masuk</h2>
            <p class="orig-selector-subtitle">Pilih metode autentikasi yang paling cocok buat kamu:</p>
          </div>

          <div class="orig-selector-divider" aria-hidden="true"></div>

          <!-- Options -->
          <div class="orig-selector-options">

            <!-- Akun Lokal -->
            <button
              class="orig-choice-btn orig-choice-local"
              @click="handleSelectAuth('local')"
              type="button"
              id="btn-orig-choose-local"
            >
              <RiSmartphoneLine class="orig-choice-ri-icon orig-choice-ri-indigo" aria-hidden="true" />
              <div class="orig-choice-info">
                <div class="orig-choice-title-row">
                  <strong class="orig-choice-title orig-choice-title-indigo">Akun Lokal</strong>
                  <span class="orig-choice-label orig-label-indigo">Tersimpan di HP</span>
                </div>
                <p class="orig-choice-desc">Masuk atau buat akun yang tersimpan di perangkat ini.</p>
              </div>
              <i class="fa-solid fa-chevron-right orig-choice-chevron" aria-hidden="true"></i>
            </button>

            <!-- Token Sesi -->
            <button
              class="orig-choice-btn orig-choice-token"
              @click="handleSelectAuth('token')"
              type="button"
              id="btn-orig-choose-token"
            >
              <RiCloudLine class="orig-choice-ri-icon orig-choice-ri-orange" aria-hidden="true" />
              <div class="orig-choice-info">
                <div class="orig-choice-title-row">
                  <strong class="orig-choice-title orig-choice-title-orange">Token Sesi</strong>
                  <span class="orig-choice-label orig-label-orange">Cloud Bersama</span>
                </div>
                <p class="orig-choice-desc">Gabung ke sesi bersama menggunakan kode sesi.</p>
              </div>
              <i class="fa-solid fa-chevron-right orig-choice-chevron" aria-hidden="true"></i>
            </button>

          </div>

          <!-- Footer -->
          <div class="orig-selector-footer">
            <button
              class="orig-selector-cancel"
              @click="showAuthChoice = false"
              type="button"
            >
              Batal
            </button>
          </div>

        </div>
      </div>
    </Transition>

    <!-- ── AUTH METHOD SELECTION MODAL: GWEN THEME ──────────── -->
    <Transition name="paper-pop">
      <div
        v-if="showAuthChoice && activeTheme === 'gwen'"
        class="paper-modal-overlay"
        @click="showAuthChoice = false"
      >
        <div class="paper-sheet-card auth-choice-card-sheet" @click.stop>
          <div class="paper-washi-tape" aria-hidden="true"></div>

          <div class="paper-header">
            <div class="paper-stamp-tag">
              <i class="fa-solid fa-key"></i>
              <span>MASUK / DAFTAR</span>
            </div>
            <h2 class="paper-title">Pilih Cara Masuk</h2>
            <p class="auth-modal-subtitle">Pilih metode autentikasi yang paling cocok buat kamu:</p>
          </div>

          <div class="paper-perforated-line"></div>

          <div class="auth-options-grid">
            <!-- Option 1: Akun Lokal -->
            <button
              class="auth-opt-btn opt-local"
              @click="handleSelectAuth('local')"
              type="button"
            >
              <div class="auth-opt-icon">
                <i class="fa-solid fa-mobile-screen"></i>
              </div>
              <div class="auth-opt-info">
                <div class="auth-opt-title-row">
                  <strong class="auth-opt-title">Akun Lokal</strong>
                  <span class="auth-opt-pill">Tersimpan di HP</span>
                </div>
                <p class="auth-opt-desc">
                  Masuk atau buat akun untuk menyimpan data sesuai mekanisme akun lokal yang sudah tersedia.
                </p>
              </div>
              <div class="auth-opt-arrow">
                <i class="fa-solid fa-arrow-right"></i>
              </div>
            </button>

            <!-- Option 2: Token Sesi -->
            <button
              class="auth-opt-btn opt-token"
              @click="handleSelectAuth('token')"
              type="button"
            >
              <div class="auth-opt-icon">
                <i class="fa-solid fa-cloud"></i>
              </div>
              <div class="auth-opt-info">
                <div class="auth-opt-title-row">
                  <strong class="auth-opt-title">Token Sesi</strong>
                  <span class="auth-opt-pill pill-cloud">Cloud Bersama</span>
                </div>
                <p class="auth-opt-desc">
                  Gabung ke sesi bersama menggunakan kode sesi.
                </p>
              </div>
              <div class="auth-opt-arrow">
                <i class="fa-solid fa-arrow-right"></i>
              </div>
            </button>
          </div>

          <div class="paper-footer">
            <button
              class="paper-btn-cancel"
              @click="showAuthChoice = false"
              type="button"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── PELAJARI LANJUTAN INFO MODAL: ORIGINAL THEME ─────── -->
    <Transition name="orig-selector-pop">
      <div
        v-if="showLearnMore && activeTheme !== 'gwen'"
        class="orig-selector-overlay"
        @click="showLearnMore = false"
      >
        <div class="orig-selector-card orig-learn-card" @click.stop role="dialog" aria-modal="true" aria-label="Panduan Masuk">

          <div class="orig-selector-header">
            <div class="orig-learn-eyebrow">
              <RiBookOpenLine class="orig-learn-eyebrow-icon" aria-hidden="true" />
              <span>PANDUAN MASUK</span>
            </div>
            <h2 class="orig-selector-title">Bedanya apa, nih?</h2>
            <p class="orig-selector-subtitle">Pilih cara masuk yang paling cocok buat kamu.</p>
          </div>

          <div class="orig-selector-divider" aria-hidden="true"></div>

          <div class="orig-learn-body">

            <!-- Token Sesi block -->
            <div class="orig-learn-block orig-learn-block-orange">
              <div class="orig-learn-block-hdr">
                <RiCloudLine class="orig-learn-block-icon orig-learn-block-icon-orange" aria-hidden="true" />
                <h3 class="orig-learn-block-title orig-learn-block-title-orange">Token Sesi — Cloud Bersama</h3>
              </div>
              <p class="orig-learn-block-desc">
                Pakai kode sesi buat gabung ke timeline yang sama bareng pengguna lain. Data sesi tersimpan di cloud, bisa diakses bersama.
              </p>
            </div>

            <!-- Akun Lokal block -->
            <div class="orig-learn-block orig-learn-block-indigo">
              <div class="orig-learn-block-hdr">
                <RiSmartphoneLine class="orig-learn-block-icon orig-learn-block-icon-indigo" aria-hidden="true" />
                <h3 class="orig-learn-block-title orig-learn-block-title-indigo">Akun Lokal — Tersimpan di HP</h3>
              </div>
              <p class="orig-learn-block-desc">
                Username dan password disimpan di perangkat ini. Cocok buat catatan pribadi tanpa mengirim data ke server.
              </p>
            </div>

            <!-- Closing note -->
            <div class="orig-learn-closing">
              <i class="fa-solid fa-face-smile-wink" aria-hidden="true"></i>
              <span>Masih bingung? Santai, pilih sesuai kebutuhanmu.</span>
            </div>

          </div>

          <div class="orig-selector-footer">
            <button
              class="orig-learn-confirm-btn"
              @click="showLearnMore = false"
              type="button"
            >
              Oke, Paham!
            </button>
          </div>

        </div>
      </div>
    </Transition>

    <!-- ── PELAJARI LANJUTAN INFO MODAL: GWEN THEME ──────────── -->
    <Transition name="paper-pop">
      <div
        v-if="showLearnMore && activeTheme === 'gwen'"
        class="paper-modal-overlay"
        @click="showLearnMore = false"
      >
        <div class="paper-sheet-card learn-more-sheet" @click.stop>
          <div class="paper-washi-tape" aria-hidden="true"></div>

          <div class="paper-header">
            <div class="paper-stamp-tag">
              <i class="fa-solid fa-circle-question"></i>
              <span>PANDUAN MASUK • WHOOSH GUIDE</span>
            </div>
            <h2 class="paper-title">Bedanya apa, nih?</h2>
            <p class="learn-more-intro">Pilih cara masuk yang paling cocok buat kamu.</p>
          </div>

          <div class="paper-perforated-line"></div>

          <div class="learn-more-body">
            <!-- Section 1: Token Sesi (Cloud) -->
            <div class="learn-info-block block-token">
              <div class="learn-block-hdr">
                <h3 class="learn-block-title">Token Sesi — Sinkron di Cloud</h3>
              </div>
              <p class="learn-block-desc">
                Pakai kode sesi buat gabung ke timeline yang sama bareng pengguna lain. Data sesi tersimpan di cloud, jadi bisa diakses bersama sesuai alur aplikasi.
              </p>
            </div>

            <!-- Section 2: Akun Lokal -->
            <div class="learn-info-block block-local">
              <div class="learn-block-hdr">
                <h3 class="learn-block-title">Akun Lokal — Tersimpan di HP</h3>
              </div>
              <p class="learn-block-desc">
                Username dan password disimpan di perangkat ini. Cocok buat catatan pribadi tanpa mengirim data akun lokal ke server.
              </p>
            </div>

            <!-- Closing note -->
            <div class="learn-closing-card">
              <i class="fa-solid fa-face-smile-wink"></i>
              <span>Masih bingung? Santai, pilih sesuai kebutuhanmu.</span>
            </div>
          </div>

          <div class="paper-footer">
            <button
              class="learn-confirm-btn"
              @click="showLearnMore = false"
              type="button"
            >
              Oke, Paham!
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── DEDICATED GWEN AUTH POPUPS (SEPARATE INTERFACES) ── -->
    <GwenLocalAuthModal
      v-if="showGwenLocalAuth"
      @close="showGwenLocalAuth = false"
      @back="handleBackToChoice('local')"
      @auth-success="(res) => emit('auth-success', res)"
    />

    <GwenTokenAuthModal
      v-if="showGwenTokenAuth"
      @close="showGwenTokenAuth = false"
      @back="handleBackToChoice('token')"
      @auth-success="(res) => emit('auth-success', res)"
    />

    <!-- ── DEDICATED ORIGINAL AUTH POPUPS (SEPARATE INTERFACES) ── -->
    <OriginalLocalAuthModal
      v-if="showOriginalLocalAuth"
      @close="showOriginalLocalAuth = false"
      @back="handleBackToChoiceOriginal('local')"
      @auth-success="(res) => emit('auth-success', res)"
    />

    <OriginalTokenAuthModal
      v-if="showOriginalTokenAuth"
      @close="showOriginalTokenAuth = false"
      @back="handleBackToChoiceOriginal('token')"
      @auth-success="(res) => emit('auth-success', res)"
    />
   </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { RiBookOpenLine, RiCloudLine, RiSmartphoneLine } from '@remixicon/vue';
import { animate } from 'motion-v';
import RocketAnimation from '../components/shared/RocketAnimation.vue';
import GwenLocalAuthModal from '../components/modals/GwenLocalAuthModal.vue';
import GwenTokenAuthModal from '../components/modals/GwenTokenAuthModal.vue';
import OriginalLocalAuthModal from '../components/modals/OriginalLocalAuthModal.vue';
import OriginalTokenAuthModal from '../components/modals/OriginalTokenAuthModal.vue';
import { APP_VERSION, VERSION_HISTORY, type VersionRelease } from '../data/versionHistory';
import { registerBackHandler, unregisterBackHandler } from '../composables/useBackButton';

const showChangelog = ref(false);
const selectedVersion = ref<VersionRelease | null>(null);
const showAuthChoice = ref(false);
const showLearnMore = ref(false);
const showGwenLocalAuth = ref(false);
const showGwenTokenAuth = ref(false);
const showOriginalLocalAuth = ref(false);
const showOriginalTokenAuth = ref(false);

function handleOpenVersionHistory() {
  selectedVersion.value = null;
  showChangelog.value = true;
}

function selectVersion(release: VersionRelease) {
  selectedVersion.value = release;
}

function handleOverlayClick() {
  if (selectedVersion.value) {
    selectedVersion.value = null;
  } else {
    showChangelog.value = false;
  }
}

const emit = defineEmits<{
  'choose-account': [];
  'choose-token': [];
  'learn-more': [];
  'auth-success': [result: {
    authType: 'cloud' | 'local';
    username?: string;
    sessionId?: string;
    token?: string;
    sessionName?: string;
    shareToken?: string;
  }];
}>();

function handleSelectAuth(mode: 'local' | 'token') {
  showAuthChoice.value = false;
  if (activeTheme.value === 'gwen') {
    if (mode === 'local') {
      showGwenLocalAuth.value = true;
    } else {
      showGwenTokenAuth.value = true;
    }
  } else {
    // Original theme: open dedicated separate popups
    if (mode === 'local') {
      showOriginalLocalAuth.value = true;
    } else {
      showOriginalTokenAuth.value = true;
    }
  }
}

function handleBackToChoice(from: 'local' | 'token') {
  if (from === 'local') {
    showGwenLocalAuth.value = false;
  } else {
    showGwenTokenAuth.value = false;
  }
  showAuthChoice.value = true;
}

function handleBackToChoiceOriginal(from: 'local' | 'token') {
  if (from === 'local') {
    showOriginalLocalAuth.value = false;
  } else {
    showOriginalTokenAuth.value = false;
  }
  showAuthChoice.value = true;
}

function handleOpenLearnMore() {
  showLearnMore.value = true;
  emit('learn-more');
}

// ── Theme switcher ────────────────────────────────────────────────────────
type Theme = 'original' | 'gwen';
const STORAGE_KEY = 'whoosh_onboarding_theme';

// Read synchronously before render to avoid flicker
const savedTheme = (typeof localStorage !== 'undefined'
  ? (localStorage.getItem(STORAGE_KEY) as Theme | null)
  : null) ?? 'original';

const activeTheme = ref<Theme>(savedTheme);

function setTheme(theme: Theme) {
  activeTheme.value = theme;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, theme);
  }
}

// ── Rocket geometry & takeoff motion via Motion for Vue ────────────────────
// SVG viewBox="0 0 64 90":
//   - Nose tip: (32, 2) → points UP in screen coordinates (−Y direction)
//   - In screen coordinates (Y+ = down), "up" = −90° from the +X axis.
//   - Required rotation = atan2(dy, dx) − (−90°) = atan2(dy, dx) + 90°
const NATIVE_FORWARD_DEG = -90;
const TRAVEL_PX = 10; // 8-12px takeoff thrust toward sticker

// Robust defaults: Rocket is immediately left of sticker; sticker is slightly higher.
// Rotation of ~82° turns the UP-pointing nose toward the "WITH US" label (~8° above horizontal).
const rocketRotation = ref<number>(82);

const rocketWrapRef = ref<HTMLElement | null>(null);
const withusStickerRef = ref<HTMLElement | null>(null);

let rocketAnimationControls: ReturnType<typeof animate> | null = null;
let resizeObserver: ResizeObserver | null = null;

function startRocketAnimation(moveX: number, moveY: number) {
  const el = rocketWrapRef.value;
  if (!el) return;

  // Stop previous animation loop if running
  if (rocketAnimationControls) {
    try {
      rocketAnimationControls.stop();
    } catch {
      // noop
    }
    rocketAnimationControls = null;
  }

  // Smooth takeoff sequence via Motion for Vue runtime:
  // 0% rest -> 15% recoil -> 55% takeoff thrust -> 75% deceleration -> 100% return
  rocketAnimationControls = animate(
    el,
    {
      transform: [
        'translate(0px, 0px)',
        `translate(${(-moveX * 0.15).toFixed(2)}px, ${(-moveY * 0.15).toFixed(2)}px)`,
        `translate(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px)`,
        `translate(${(moveX * 0.85).toFixed(2)}px, ${(moveY * 0.85).toFixed(2)}px)`,
        'translate(0px, 0px)',
      ],
    },
    {
      duration: 2.6,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  );
}

function computeRocketAngle(): void {
  const rocketEl = rocketWrapRef.value;
  const stickerEl = withusStickerRef.value;
  if (!rocketEl || !stickerEl) return;

  const rr = rocketEl.getBoundingClientRect();
  const sr = stickerEl.getBoundingClientRect();
  if (rr.width === 0 || sr.width === 0) return;

  // Center of rocket → destination target at left-center of sticker
  const rx = rr.left + rr.width / 2;
  const ry = rr.top + rr.height / 2;
  const tx = sr.left + 12;
  const ty = sr.top + sr.height / 2;

  const dx = tx - rx;
  const dy = ty - ry;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return;

  const dirX = dx / dist;
  const dirY = dy / dist;

  const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
  const rotation = targetAngle - NATIVE_FORWARD_DEG; // nose points toward sticker

  rocketRotation.value = Number(rotation.toFixed(1));
  const mx = Number((dirX * TRAVEL_PX).toFixed(2));
  const my = Number((dirY * TRAVEL_PX).toFixed(2));

  startRocketAnimation(mx, my);
}

// Watch theme changes: recompute angle when user switches to Gwen theme
watch(activeTheme, async (newTheme) => {
  if (newTheme === 'gwen') {
    await nextTick();
    startRocketAnimation(9.8, -1.7);
    setTimeout(() => {
      computeRocketAngle();
    }, 60);
  } else {
    if (rocketAnimationControls) {
      rocketAnimationControls.stop();
      rocketAnimationControls = null;
    }
  }
});

onMounted(async () => {
  // Sync theme after hydration
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored && stored !== activeTheme.value) {
    activeTheme.value = stored;
  }

  // Wait for DOM layout to settle before measuring
  await nextTick();
  if (activeTheme.value === 'gwen') {
    startRocketAnimation(9.8, -1.7);
    setTimeout(() => {
      computeRocketAngle();
    }, 60);
  }

  // Recalculate when the viewport or frame resizes
  const frameEl = document.querySelector('.ob-frame');
  if (frameEl && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      if (activeTheme.value === 'gwen') {
        computeRocketAngle();
      }
    });
    resizeObserver?.observe(frameEl);
  }

  // Register back button handler for modal stack (supports Android back and gestures)
  registerBackHandler('onboarding-view-modals', () => {
    if (selectedVersion.value) {
      selectedVersion.value = null;
      return true;
    }
    if (showChangelog.value) {
      showChangelog.value = false;
      return true;
    }
    if (showLearnMore.value) {
      showLearnMore.value = false;
      return true;
    }
    if (showOriginalLocalAuth.value) {
      showOriginalLocalAuth.value = false;
      showAuthChoice.value = true;
      return true;
    }
    if (showOriginalTokenAuth.value) {
      showOriginalTokenAuth.value = false;
      showAuthChoice.value = true;
      return true;
    }
    if (showGwenLocalAuth.value) {
      showGwenLocalAuth.value = false;
      showAuthChoice.value = true;
      return true;
    }
    if (showGwenTokenAuth.value) {
      showGwenTokenAuth.value = false;
      showAuthChoice.value = true;
      return true;
    }
    if (showAuthChoice.value) {
      showAuthChoice.value = false;
      return true;
    }
    return false;
  });

  window.addEventListener('keydown', handleGlobalKeydown);
});

function handleGlobalKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (selectedVersion.value) {
      selectedVersion.value = null;
    } else if (showChangelog.value) {
      showChangelog.value = false;
    } else if (showLearnMore.value) {
      showLearnMore.value = false;
    } else if (showOriginalLocalAuth.value) {
      showOriginalLocalAuth.value = false;
      showAuthChoice.value = true;
    } else if (showOriginalTokenAuth.value) {
      showOriginalTokenAuth.value = false;
      showAuthChoice.value = true;
    } else if (showAuthChoice.value) {
      showAuthChoice.value = false;
    }
  }
}

onUnmounted(() => {
  unregisterBackHandler('onboarding-view-modals');
  window.removeEventListener('keydown', handleGlobalKeydown);
  if (rocketAnimationControls) {
    rocketAnimationControls.stop();
    rocketAnimationControls = null;
  }
  resizeObserver?.disconnect();
  resizeObserver = null;
});
</script>


<style scoped>
/* ── Root (Mobile-First: Default Fullscreen) ─────────────────────────── */
.onboarding-page {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  min-height: 100vh;
  background-color: #f4f2f7;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.ob-frame {
  position: relative;
  width: 100%;
  height: 100dvh;
  height: 100vh;
  background-color: #f4f2f7;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Desktop Only Preview Card (Layar Desktop > 768px) ──────────────── */
@media (min-width: 769px) {
  .onboarding-page {
    background-color: #d8d9e4;
    padding: 24px 0;
  }

  .ob-frame {
    max-width: 420px;
    height: auto;
    aspect-ratio: 9 / 19.5;
    max-height: calc(100vh - 48px);
    border-radius: 32px;
    box-shadow: 0 20px 60px rgba(26, 26, 46, 0.25);
  }
}

/* ── Background shapes ───────────────────────────────────────────────── */
.ob-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
/* ── Content ─────────────────────────────────────────────────────────── */
.ob-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 36px 24px 24px;
  box-sizing: border-box;
}

/* ── App Header / Tagline Typography (Neo-Brutalist 3-Line Title) ── */
.ob-header-typo {
  position: relative;
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-top: 80px; /* Increased to shift tagline down */
}

.ob-line-1 {
  font-family: 'Outfit', 'Space Grotesk', 'Impact', sans-serif;
  font-size: 3.4rem;
  font-weight: 900;
  color: #101010;
  text-align: center;
  text-transform: uppercase;
  line-height: 0.85;
  letter-spacing: -2px;
  margin: 0;
}

.ob-line-2 {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-size: 1.2rem; /* Adjusted size for pure text presentation */
  font-weight: 800;
  color: #101010;
  text-align: center;
  text-transform: uppercase;
  line-height: 1.0;
  letter-spacing: -0.5px;
  margin: 6px 0;
  white-space: nowrap; /* Forces text to stay on a single line */
}

.ob-line-3-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  width: 100%;
  margin: 0;
  padding-right: 25px; /* Alignment with map card */
  box-sizing: border-box;
}


.ob-line-3 {
  font-family: 'Syne', 'Outfit', 'Space Grotesk', 'Impact', sans-serif;
  font-size: 4.2rem;
  font-weight: 800;
  color: #6f6bd8; /* Vibrant purple/indigo matching the photo's colored text line! */
  text-transform: uppercase;
  line-height: 0.85;
  letter-spacing: -2px;
  margin: 0;
}

/* Floating decorations similar to the reference photo */
.decor-spiky {
  position: absolute;
  top: -18px;
  left: -12px;
  width: 38px;
  height: 38px;
  transform: rotate(-15deg);
  pointer-events: none;
  animation: float-slow 4s ease-in-out infinite;
}

.decor-orange {
  position: absolute;
  bottom: -12px;
  left: 20px;
  width: 34px;
  height: 34px;
  transform: rotate(20deg);
  pointer-events: none;
  animation: float-slow 3s ease-in-out infinite alternate;
}

@keyframes float-slow {
  0% { transform: translateY(0) rotate(-15deg); }
  50% { transform: translateY(-4px) rotate(-10deg); }
  100% { transform: translateY(0) rotate(-15deg); }
}

/* ── Map illustration ────────────────────────────────────────────────── */
.ob-map-wrapper {
  position: relative;
  width: 100%;
  max-width: 320px;
  margin: 36px auto 12px; /* Increased to shift map further down */
  margin-top: 90px;
}

.ob-map-shadow {
  position: absolute;
  top: 5px;
  left: 5px;
  width: 100%;
  height: 100%;
  background: #101010;
  z-index: 0;
}

.ob-map-card {
  position: relative;
  z-index: 1;
  border: 4px solid #101010;
  overflow: hidden;
  background: #f7eed6;
}

.ob-map-svg {
  display: block;
  width: 100%;
  height: auto;
}

/* ── Actions ─────────────────────────────────────────────────────────── */
.ob-actions {
  width: 100%;
  max-width: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px; /* Reduced gap to fit screens perfectly without overflow */
  margin-top: auto;
}

/* wrapper for button */
.btn-wrapper {
  position: relative;
  width: 100%;
}

.btn-shadow {
  display: none;
}

[data-theme="gwen"] .btn-shadow {
  display: block;
  position: absolute;
  top: 4px;
  left: 4px;
  width: 100%;
  height: 100%;
  background: #1f1412;
  border-radius: 14px;
  z-index: 0;
}

.ob-btn-primary {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 52px;
  padding: 15px 22px;
  background-color: #6f6bd8;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  border: 1px solid rgba(111, 107, 216, 0.25);
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(111, 107, 216, 0.25), 0 1px 3px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  letter-spacing: 0.1px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.ob-btn-primary:hover {
  background-color: #5d59cb;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(111, 107, 216, 0.35);
}

.ob-btn-primary:active {
  transform: translateY(1px);
  box-shadow: 0 2px 6px rgba(111, 107, 216, 0.2);
}

.ob-btn-primary:focus-visible {
  outline: 2px solid #6f6bd8;
  outline-offset: 3px;
}

.ob-btn-secondary {
  width: 100%;
 border-style: hidden;
  background-color: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
 
  cursor: pointer;
  transition: all 0.15s ease;
  letter-spacing: 0.1px;
}

.ob-btn-secondary:hover {
  background-color: #f7f7f7;
  transform: translateY(-1px);
}

.ob-btn-secondary:active {
  transform: translateY(1px);
}

.ob-link {
  background: none;
  border: none;
  color: #4b4b5e;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 0;
  margin-top: 2px;
  transition: opacity 0.2s ease;
}

.ob-link:hover {
  opacity: 0.7;
}

/* ── Changelog Action Trigger ──────────────────────────────────────── */
.ob-changelog-trigger-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ob-changelog-text-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  cursor: pointer;
  padding: 7px 14px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  text-decoration: none;
  outline: none;
}

.ob-changelog-text-link:focus-visible {
  outline: 2px solid #6f6bd8;
  outline-offset: 2px;
}

.ob-changelog-text-link:hover {
  transform: translateY(-1px);
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(111, 107, 216, 0.12);
}

.ob-changelog-text-link:active {
  transform: translateY(0);
  background: #f8fafc;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

/* Icon: Font Awesome solid fa-bolt */
.ob-changelog-icon {
  font-size: 15px;
  color: #6f6bd8; /* Original theme indigo accent */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.ob-changelog-text-link:hover .ob-changelog-icon {
  transform: scale(1.12);
}

/* Title: 2-line stacked layout without underlines */
.ob-changelog-title {
  display: inline-flex;
  flex-direction: column;
  line-height: 1.15;
  text-align: left;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: -0.1px;
  color: #0f172a;
}

.ob-changelog-title span {
  text-decoration: none;
}

/* Badges wrapper: horizontally grouped to the right */
.ob-changelog-badges {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 10px;
  flex-shrink: 0;
}

.changelog-badge-new {
  font-family: 'Inter', sans-serif;
  font-size: 0.62rem;
  font-weight: 800;
  background: #eab308;
  color: #0f172a;
  border: 1px solid #ca8a04;
  border-radius: 5px;
  padding: 1.5px 6px;
  box-shadow: none;
  text-decoration: none;
  line-height: 1.2;
  letter-spacing: 0.3px;
}

.orig-heart-icon {
  color: #f97316;
  font-size: 0.75rem;
  margin: 0 2px;
}

.ob-footer-note {
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: bolder;
  color: #000000;
  text-align: center;
  margin-top: 50px;
}

/* ── Paper Concept Changelog Modal (Neo-Brutalist) ─────────────────── */
.paper-changelog-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  padding: 18px;
  box-sizing: border-box;
}

.paper-sheet-card {
  position: relative;
  max-width: 380px;
  width: 100%;
  max-height: 86vh;
  background: #fffef8;
  background-image: repeating-linear-gradient(transparent, transparent 27px, #ebe7dc 28px);
  border: 3px solid #1a1a2e;
  border-radius: 20px;
  box-shadow: 8px 8px 0 #1a1a2e;
  display: flex;
  flex-direction: column;
  overflow: visible;
  transform: rotate(-0.5deg);
  box-sizing: border-box;
}

/* Washi Tape Accent */
.paper-washi-tape {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%) rotate(1deg);
  width: 110px;
  height: 22px;
  background: rgba(254, 240, 138, 0.95);
  border: 1.5px dashed #1a1a2e;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.12);
  z-index: 10;
  pointer-events: none;
}

/* Paper Clip Icon */
.paper-clip-icon {
  position: absolute;
  top: -12px;
  left: 22px;
  font-size: 1.7rem;
  color: #475569;
  transform: rotate(-18deg);
  z-index: 11;
  pointer-events: none;
}


/* Paper Header */
.paper-header {
  padding: 24px 20px 8px;
  text-align: left;
}

.paper-stamp-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fee2e2;
  border: 1.5px solid #1a1a2e;
  color: #991b1b;
  font-family: 'Outfit', sans-serif;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  box-shadow: 1.5px 1.5px 0 #1a1a2e;
  margin-bottom: 6px;
}

.paper-stamp-tag i {
  font-size: 0.68rem;
}

.paper-title {
  margin: 0;
  font-family: 'Outfit', 'Space Grotesk', sans-serif;
  font-size: 1.35rem;
  font-weight: 900;
  color: #1a1a2e;
  letter-spacing: -0.02em;
}

.paper-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.paper-version-badge {
  background: #fef08a;
  border: 1.5px solid #1a1a2e;
  padding: 2px 8px;
  border-radius: 999px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.72rem;
  font-weight: 800;
  color: #854d0e;
  box-shadow: 1.5px 1.5px 0 #1a1a2e;
}

.paper-date {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Perforated separator */
.paper-perforated-line {
  margin: 8px 0 12px;
  border-bottom: 2px dashed #cbd5e1;
  width: 100%;
}

/* Scrollable paper body (Hidden scrollbar) */
.paper-body-scroll {
  padding: 0 16px 14px;
  overflow-y: auto;
  max-height: calc(86vh - 190px);
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.paper-body-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
  width: 0;
  height: 0;
}

/* Groups */
.changelog-group {
  background: #ffffff;
  border: 2px solid #1a1a2e;
  border-radius: 14px;
  box-shadow: 3px 3px 0 #1a1a2e;
  padding: 12px 14px;
  margin-bottom: 12px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: 'Outfit', 'Space Grotesk', sans-serif;
  font-size: 0.86rem;
  font-weight: 900;
  color: #1a1a2e;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1.5px solid #f1f5f9;
}

.group-maps i {
  color: #d97706;
}

.group-ui i {
  color: #2563eb;
}

.group-sys i {
  color: #059669;
}

.changelog-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.changelog-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  line-height: 1.4;
  color: #334155;
}

.bullet-tag {
  font-family: 'Outfit', sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  border: 1.5px solid #1a1a2e;
  border-radius: 6px;
  padding: 1px 6px;
  flex-shrink: 0;
  margin-top: 1px;
  box-shadow: 1px 1px 0 #1a1a2e;
}

.tag-amber {
  background: #d97706;
  color: #ffffff;
}

.tag-blue {
  background: #0284c7;
  color: #ffffff;
}

.tag-emerald {
  background: #16a34a;
  color: #ffffff;
}

.tag-rose {
  background: #e11d48;
  color: #ffffff;
}

.tag-purple {
  background: #7c3aed;
  color: #ffffff;
}

.changelog-item-content {
  flex: 1;
  text-align: left;
}

.changelog-item-content strong {
  color: #0f172a;
}

.changelog-item-content code {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 0.72rem;
  color: #0f172a;
}

/* ── Version History List Styles ── */
.paper-history-sub {
  margin: 4px 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  color: #475569;
  line-height: 1.4;
  text-align: left;
}

.version-history-scroll {
  padding: 4px 16px 14px;
}

.version-history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.version-card-btn {
  width: 100%;
  text-align: left;
  background: #ffffff;
  border: 2px solid #1a1a2e;
  border-radius: 12px;
  box-shadow: 3px 3px 0 #1a1a2e;
  padding: 10px 12px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: inherit;
  box-sizing: border-box;
}

.version-card-btn:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 #1a1a2e;
  background: #fffdf5;
}

.version-card-btn:active {
  transform: translateY(0);
  box-shadow: 1.5px 1.5px 0 #1a1a2e;
  background: #fefce8;
}

.version-card-btn:focus-visible {
  outline: 2px solid #db2777;
  outline-offset: 2px;
}

.version-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.version-card-badges {
  display: flex;
  align-items: center;
  gap: 6px;
}

.version-card-date-tag {
  font-family: 'Outfit', sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 1px 6px;
  border-radius: 4px;
}

.version-card-open-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.72rem;
  font-weight: 800;
  color: #db2777;
  transition: transform 0.15s ease;
}

.version-card-open-hint .hint-text {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.version-card-btn:hover .version-card-open-hint {
  transform: translateX(2px);
}

.version-card-summary {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.74rem;
  color: #334155;
  line-height: 1.45;
  text-align: left;
}


/* Paper Footer */
.paper-footer {
  padding: 10px 16px 14px;
  background: #f8fafc;
  border-top: 2px solid #1a1a2e;
  text-align: center;
  border-radius: 0 0 17px 17px;
}

.paper-footer-detail {
  display: flex;
  align-items: center;
  justify-content: center;
}

.paper-footer-hint {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

/* Vue Transitions */
.paper-pop-enter-active,
.paper-pop-leave-active {
  transition: opacity 0.22s ease;
}

.paper-pop-enter-active .paper-sheet-card,
.paper-pop-leave-active .paper-sheet-card {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease;
}

.paper-pop-enter-from,
.paper-pop-leave-to {
  opacity: 0;
}

.paper-pop-enter-from .paper-sheet-card,
.paper-pop-leave-to .paper-sheet-card {
  opacity: 0;
  transform: scale(0.88) rotate(-2deg) translateY(14px);
}

@media (prefers-reduced-motion: reduce) {
  .paper-pop-enter-active,
  .paper-pop-leave-active {
    transition: opacity 0.12s ease;
  }
  .paper-pop-enter-active .paper-sheet-card,
  .paper-pop-leave-active .paper-sheet-card {
    transition: opacity 0.12s ease;
  }
  .paper-pop-enter-from .paper-sheet-card,
  .paper-pop-leave-to .paper-sheet-card {
    transform: none;
  }
  .version-card-btn {
    transition: none;
  }
}

/* ── Responsive ──────────────────────────────────────────────────────── */
@media (max-width: 380px) {
  .ob-title {
    font-size: 2.2rem;
  }
  .ob-content {
    padding: 48px 24px 40px;
  }
}

/* ── Legacy .ob-theme-switcher removed — replaced by .ob-theme-switcher-float */

.theme-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1.5px solid rgba(0, 0, 0, 0.18);
  background: rgba(255, 255, 255, 0.55);
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  color: #374151;
  cursor: pointer;
  transition: all 0.18s ease;
  min-height: 34px;
}

.theme-pill:hover {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(0, 0, 0, 0.3);
}

.theme-pill.is-active {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(0, 0, 0, 0.5);
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
}

.theme-pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════════════════════════════════
   GWEN THEME  [data-theme="gwen"]
   Palette from bg-1.jpeg:
     Kraft brown  #8d7052 | Cream grid #d6cfbc | Off-white #f2ede3
     Gwen pink    #e879a0 | Deep ink   #1f1412
   ═══════════════════════════════════════════════════════════════════════ */

/* Root page + frame: bg-1.jpeg full-cover */
[data-theme="gwen"] .ob-frame,
[data-theme="gwen"].onboarding-page {
  background-color: #d6cfbc;
  background-image: url('/src/assets/gwen-theme/bg-1.jpeg');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
}

/* Hide original SVG blobs — they clash with the paper texture */
[data-theme="gwen"] .ob-bg {
  display: none;
}

/* Content padding & natural stacking */
[data-theme="gwen"] .ob-content {
  padding: 36px 20px 20px;
  z-index: auto;
}

/* Typography */
[data-theme="gwen"] .ob-line-1 {
  color: #1f1412;
  text-shadow: 2px 2px 0 rgba(255,255,255,0.55);
}

[data-theme="gwen"] .ob-line-2 {
  color: #1f1412;
  text-shadow: 1px 1px 0 rgba(255,255,255,0.45);
}

[data-theme="gwen"] .ob-line-3 {
  color: #c0286a;
}

/* Decorative stars */
[data-theme="gwen"] .decor-spiky path {
  stroke: #1f1412;
}

[data-theme="gwen"] .decor-orange path {
  fill: #e879a0;
  stroke: #1f1412;
}

/* Map card: kraft-paper */
[data-theme="gwen"] .ob-map-card {
  border-color: #1f1412;
  background: #f2ede3;
}

[data-theme="gwen"] .ob-map-shadow {
  background: #1f1412;
}

/* Primary button: Gwen pink */
[data-theme="gwen"] .ob-btn-primary {
  background-color: #f9a8d4;
  border-color: #1f1412;
  color: #1f1412;
}

[data-theme="gwen"] .btn-shadow {
  background: #1f1412;
  border-radius: 14px;
}

[data-theme="gwen"] .ob-btn-primary:hover {
  background-color: #f472b6;
}

/* Secondary button */
[data-theme="gwen"] .ob-btn-secondary {
  color: #1f1412;
  background-color: rgba(255, 255, 255, 0.42);
  border: 1.5px solid rgba(31, 20, 18, 0.32);
  border-radius: 6px;
}

[data-theme="gwen"] .ob-btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.7);
}

/* Muted link */
[data-theme="gwen"] .ob-link {
  color: #3b2320;
}

/* Changelog trigger */
[data-theme="gwen"] .ob-changelog-text-link {
  color: #1f1412;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 1px 3px rgba(31, 20, 18, 0.06);
}

[data-theme="gwen"] .ob-changelog-icon {
  color: #db2777;
}

[data-theme="gwen"] .ob-changelog-text-link:hover {
  color: #1f1412;
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 3px 8px rgba(31, 20, 18, 0.09);
}

/* Footer */
[data-theme="gwen"] .ob-footer-note {
  color: #1f1412;
  text-shadow: 0 1px 2px rgba(255,255,255,0.5);
}

/* ═══════════════════════════════════════════════════════════════════════
   THEME SWITCHER — inline segmented control (accessible, no collision)
   ═══════════════════════════════════════════════════════════════════════ */
.ob-theme-switcher-seg {
  display: inline-flex;
  align-items: center;
  align-self: center;
  margin: 10px auto 4px;
  padding: 3px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
  z-index: 10;
}

.seg-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 999px;
  border: 1.5px solid transparent;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: #4b4b6a;
  cursor: pointer;
  transition: all 0.18s ease;
  min-height: 30px;
}

.seg-btn:hover {
  background: rgba(255, 255, 255, 0.65);
  color: #101010;
}

.seg-btn.is-active {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.18);
  color: #101010;
  box-shadow: 0 1.5px 5px rgba(0, 0, 0, 0.10);
}

.seg-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.seg-divider {
  width: 1px;
  height: 14px;
  background: rgba(0, 0, 0, 0.12);
  margin: 0 1px;
}

/* ── Gwen theme overrides for segmented theme switcher ── */
[data-theme="gwen"] .ob-theme-switcher-seg {
  background: #fbf9f4;
  border: 2px solid #1f1412;
  box-shadow: 3px 3px 0 #1f1412;
  padding: 3px 4px;
  backdrop-filter: none;
}

[data-theme="gwen"] .seg-btn {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
  color: #6b5b52;
}

[data-theme="gwen"] .seg-btn:hover {
  background: rgba(252, 231, 243, 0.6);
  color: #1f1412;
}

[data-theme="gwen"] .seg-btn.is-active {
  background: #fce7f3;
  border: 1.5px solid #1f1412;
  box-shadow: 1.5px 1.5px 0 #1f1412;
  color: #1f1412;
}

[data-theme="gwen"] .seg-divider {
  background: #1f1412;
  opacity: 0.3;
}

/* ── Gwen actions layout tuning to prevent collisions ── */
[data-theme="gwen"] .ob-actions {
  gap: 12px;
  position: relative;
  z-index: 5;
}

[data-theme="gwen"] .ob-changelog-trigger-wrap {
  margin-top: 2px;
}

/* ═══════════════════════════════════════════════════════════════════════
   GWEN HEADER REDESIGN — scrapbook label / Neo-brutalist (NO BLACK BG)
   ═══════════════════════════════════════════════════════════════════════ */
.gwen-header-typo {
  position: relative;
  width: 100%;
  /* Card block width — expanded so COLLABORATE YOUR has plenty of breathing room */
  max-width: 278px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: auto;
  margin-top: 32px;
  padding-right: 4px;
  gap: 6px;
  z-index: 4;
}

/* Top label tag — soft muted teal accent surface with neo-brutalist border */
.gwen-tag-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Space Grotesk', 'Outfit', sans-serif;
  font-size: 0.68rem;
  font-weight: 800;
  color: #0f766e;
  background: #f0fdfa;
  border: 2px solid #1f1412;
  box-shadow: 2.5px 2.5px 0 #1f1412;
  padding: 3px 10px;
  border-radius: 4px;
  letter-spacing: 1.2px;
  transform: rotate(-1.5deg);
  align-self: flex-start;
}

/* ── Card-wrap: contains the notched card + docked WITH US sticker.
   overflow: visible so drop-shadow and sticker can extend outside. */
.gwen-title-card-wrap {
  position: relative;
  width: 100%;
  /* Extra bottom padding makes room for the WITH US sticker docked at the lower-right */
  padding-bottom: 44px;
  overflow: visible;
}

/* ── Backing layer: also notched via clip-path so it doesn't bleed into cutout. */
.gwen-title-backing {
  position: absolute;
  /* Match card inset plus backing offset */
  top: 4px;
  left: 4px;
  right: -4px;
  bottom: 48px;   /* stops above the notch row */
  background: #fce7f3;
  border: 2px solid #1f1412;
  /* Notch polygon: top-left → top-right → step-right → step-left-at-notch → bottom-left. */
  clip-path: polygon(
    0% 0%,
    100% 0%,
    100% calc(100% - 44px),
    calc(100% - 120px) calc(100% - 44px),
    calc(100% - 120px) 100%,
    0% 100%
  );
  transform: rotate(1.4deg);
  border-radius: 3px;
  z-index: 0;
}

/* ── Main cream card: clip-path creates the actual notch silhouette.
   The notch is at the lower-right: leaves wide area on the left for COLLABORATE YOUR.
   filter: drop-shadow replaces box-shadow so it follows the clip-path outline. */
.gwen-title-card {
  position: relative;
  z-index: 1;
  background: #fbf9f4;
  /* Notch polygon: cut is 98px wide from right edge, 44px high from bottom */
  clip-path: polygon(
    0% 0%,
    100% 0%,
    100% calc(100% - 44px),
    calc(100% - 120px) calc(100% - 44px),
    calc(100% - 120px) 100%,
    0% 100%
  );
  /* drop-shadow follows the clip-path silhouette (box-shadow does not) */
  filter: drop-shadow(3.5px 3.5px 0px #1f1412);
  padding: 10px 14px 12px;
  transform: rotate(-0.8deg);
  width: 100%;
  box-sizing: border-box;
}

/* Border that follows the notch outline — rendered as a painted stroke via ::before */
.gwen-title-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: transparent;
  border: 2.5px solid #1f1412;
  clip-path: polygon(
    0% 0%,
    100% 0%,
    100% calc(100% - 44px),
    calc(100% - 120px) calc(100% - 44px),
    calc(100% - 120px) 100%,
    0% 100%
  );
  pointer-events: none;
  z-index: 2;
  box-sizing: border-box;
}

.gwen-title-main {
  font-family: 'Outfit', 'Space Grotesk', 'Impact', sans-serif;
  font-size: 2.65rem;
  font-weight: 900;
  color: #1f1412;
  text-transform: uppercase;
  line-height: 0.92;
  letter-spacing: -1.5px;
  margin: 0 0 5px 0;
}

.gwen-title-divider {
  width: 100%;
  height: 2px;
  background: #1f1412;
  margin: 5px 0;
}

.gwen-title-sub {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #1f1412;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  line-height: 1.3;
  margin: 0;
}

.gwen-title-sub em {
  font-style: normal;
  color: #db2777;
  font-weight: 900;
  background: #fce7f3;
  padding: 0 3px;
  border-radius: 2px;
}

.gwen-withus-sticker {
  position: absolute;
  right: -6px;
  bottom: 45px;
  width: 120px;
  background: #fce7f3;
  border: 2.5px solid #1f1412;
  box-shadow: 3.5px 3.5px 0 #1f1412;
  padding: 9px 0;
  transform: rotate(-1.5deg);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  z-index: 6;
  pointer-events: auto;
  box-sizing: border-box;
}

.gwen-withus-text {
  font-family: 'Outfit', 'Space Grotesk', sans-serif;
  font-size: 1.18rem;
  font-weight: 900;
  color: #9d174d;
  letter-spacing: 0.5px;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
}

/* ── Sticker row: now only contains the rocket (WITH US moved to card notch)
   Menggunakan position: absolute agar posisi roket bisa digeser bebas
   ke atas/bawah/kiri/kanan tanpa memengaruhi/menggeser section di bawahnya. */
.gwen-sticker-row {
  position: absolute;
  /* Atur posisi roket bebas di sini: */
  top: 110px;          /* <-- Ubah nilai ini untuk NAIK / TURUN (misal: 80px lebih naik, 140px lebih turun) */
  left: 180px;          /* <-- Ubah nilai ini untuk KIRI / KANAN (misal: 0px lebih ke kiri, 100px lebih ke kanan) */
  z-index: 10;         /* <-- z-index: 10 (lebih tinggi dari sticker z-index: 6) agar roket berada di DEPAN stiker */
  pointer-events: none;
}

/* Rocket outer wrapper — translation animation ONLY via Motion for Vue.
   Independent of inner rotation to prevent transform property collisions. */
.gwen-rocket-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  will-change: transform;
  overflow: visible;
  pointer-events: auto;
}

/* Rocket inner wrapper — static computed rotation ONLY, no animation.
   Oriented so nose points directly at the "WITH US" sticker. */
.gwen-rocket-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
  overflow: visible;
}

/* ═══════════════════════════════════════════════════════════════════════
   GWEN NEO-BRUTALIST PHOTO SILHOUETTE & PAPER MOUNT ORNAMENTS (ENLARGED)
   ═══════════════════════════════════════════════════════════════════════ */

/* Mount wrapper — transparent positioning envelope with hard z-index */
.gwen-mount {
  position: absolute;
  pointer-events: none;
  z-index: 3;
  user-select: none;
  -webkit-user-select: none;
  background: transparent;
  overflow: visible;
  max-width: 52vw;
}

/* Paper card backing for intentional scrapbook collage feel */
.gwen-paper-backing {
  position: absolute;
  border: 2.5px solid #1f1412;
  box-shadow: 4px 4px 0 #1f1412;
  border-radius: 2px;
  z-index: 1;
}

/* Gwen 1: Scrapbook backing on top-left */
.gwen-backing-top {
  inset: 12px 6px 14px 6px;
  background: #bae6fd; /* pastel cyan paper */
  transform: rotate(-5deg);
}

/* Gwen 2: Scrapbook backing beside map */
.gwen-backing-mid {
  inset: 16px 6px 18px 8px;
  background: #fce7f3; /* pastel pink paper */
  transform: rotate(3.5deg);
}

/* Gwen 3: Scrapbook backing at bottom-left */
.gwen-backing-bot {
  inset: 12px 4px 10px 6px;
  background: #fef08a; /* pastel warm yellow paper */
  transform: rotate(-3deg);
}

/* Image with photo-silhouette white backdrop and neo-brutalism shadow */
.gwen-img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  position: relative;
  z-index: 2;
  /* (1) subtle contour (2) white backdrop from photo (3) dark neo-brutalist shadow */
  filter: drop-shadow(0 0 1.5px #ffffff) drop-shadow(3.5px 3.5px 0 #ffffff) drop-shadow(5px 5px 0 #1f1412);
  transition: transform 0.2s ease;
}

/* ── Individual enlarged character placements ── */

/* Gwen 1: upside-down hanging spider-gwen — TOP-LEFT, enlarged to overlap title card */
.gwen-top-left {
  top: -6px;
  left: 0px;
  width: 190px;
  transform: rotate(-3deg);
  z-index: 6; /* above title card so overlap is visible */
}

/* Gwen 2: standing comic art beside map card — ENLARGED */
.gwen-mid-right {
  top: 29%;
  right: -4px;
  width: 135px;
  transform: rotate(-2.5deg);
}

/* Mirror the comic art to face inward toward map/content */
.gwen-mid-right .gwen-img {
  transform: scaleX(-1);
}

/* Gwen 3: sitting 3D character in lower left — ENLARGED */
.gwen-bot-left {
  bottom: 0px;
  left: 5px;
  width: 100px;
  transform: rotate(2deg);
}

/* ── Changelog Version Badge ── */
.changelog-badge-ver {
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  color: #ffffff;
  background: #16a34a;
  border: 1px solid #15803d;
  padding: 1.5px 6px;
  border-radius: 5px;
  letter-spacing: 0.2px;
  line-height: 1.2;
  text-decoration: none;
}

[data-theme="gwen"] .changelog-badge-ver {
  font-family: 'Outfit', 'Space Grotesk', sans-serif;
  font-size: 0.68rem;
  font-weight: 800;
  color: #1f1412;
  background: #fef08a;
  border: 1.5px solid #1f1412;
  padding: 1px 6px;
  border-radius: 4px;
  letter-spacing: 0.3px;
  line-height: 1.2;
}

[data-theme="gwen"] .changelog-badge-new {
  font-family: 'Inter', sans-serif;
  font-size: 0.6rem;
  font-weight: 900;
  background: #ef4444;
  color: #ffffff;
  border: 1.5px solid #1a1a2e;
  border-radius: 4px;
  padding: 1px 5px;
  box-shadow: 1.5px 1.5px 0 #1a1a2e;
  letter-spacing: 0;
}

/* ── Primary Button in Gwen Theme: bold pink neo-brutalist ── */
[data-theme="gwen"] .ob-btn-primary {
  background-color: #f9a8d4;
  border: 2.5px solid #1f1412;
  box-shadow: none;
  color: #1f1412;
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-size: 1.08rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

[data-theme="gwen"] .ob-btn-primary:hover {
  background-color: #f472b6;
}

[data-theme="gwen"] .ob-btn-primary:active {
  transform: translate(2px, 2px);
}

/* ═══════════════════════════════════════════════════════════════════════
   CUSTOM NEO-BRUTALIST MODALS (Auth Choice & Pelajari Lanjutan)
   ═══════════════════════════════════════════════════════════════════════ */
.paper-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(18, 14, 28, 0.65);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

/* Auth Choice Sheet */
.auth-choice-card-sheet {
  max-width: 360px;
  width: 100%;
}

.auth-modal-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  color: #4b4b62;
  margin: 4px 0 0;
  line-height: 1.4;
}

.auth-options-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
}

.auth-opt-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #ffffff;
  border: 2px solid #1f1412;
  box-shadow: 3.5px 3.5px 0 #1f1412;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}

.auth-opt-btn:hover {
  transform: translate(-1.5px, -1.5px);
  box-shadow: 5px 5px 0 #1f1412;
}

.auth-opt-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 1.5px 1.5px 0 #1f1412;
}

.opt-local {
  background: #fdfcf7;
}

.opt-local:hover {
  background: #fefce8;
}

.opt-token {
  background: #fdfcf7;
}

.opt-token:hover {
  background: #f0fdfa;
}

.auth-opt-icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: 2px solid #1f1412;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.opt-local .auth-opt-icon {
  background: #fef08a;
  color: #1f1412;
}

.opt-token .auth-opt-icon {
  background: #bae6fd;
  color: #1f1412;
}

.auth-opt-info {
  flex: 1;
  min-width: 0;
}

.auth-opt-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.auth-opt-title {
  font-family: 'Space Grotesk', 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  color: #1f1412;
}

.auth-opt-pill {
  font-family: 'Outfit', sans-serif;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  background: #fef08a;
  color: #1f1412;
  border: 1px solid #1f1412;
}

.pill-cloud {
  background: #bae6fd;
}

.auth-opt-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.73rem;
  color: #4b4b62;
  line-height: 1.35;
  margin: 0;
}

.auth-opt-arrow {
  font-size: 0.85rem;
  color: #1f1412;
  opacity: 0.6;
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.auth-opt-btn:hover .auth-opt-arrow {
  transform: translateX(3px);
  opacity: 1;
}

.paper-btn-cancel {
  width: 100%;
  padding: 9px;
  background: transparent;
  border: 1.5px solid rgba(31, 20, 18, 0.2);
  border-radius: 6px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #4b4b62;
  cursor: pointer;
  transition: background 0.15s ease;
}

.paper-btn-cancel:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1f1412;
}

/* Learn More Sheet */
.learn-more-sheet {
  max-width: 375px;
  width: 100%;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
}

.learn-more-intro {
  font-family: 'Inter', sans-serif;
  font-size: 0.84rem;
  color: #4b4b62;
  margin: 4px 0 0;
  line-height: 1.4;
}

.learn-more-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.learn-info-block {
  padding: 12px 14px;
  border: 2px solid #1f1412;
  box-shadow: 3.5px 3.5px 0 #1f1412;
  border-radius: 8px;
}

.block-token {
  background: #f0fdfa;
}

.block-local {
  background: #fffbeb;
}

.learn-block-hdr {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.learn-badge-icon {
  font-size: 1.15rem;
}

.learn-block-title {
  font-family: 'Space Grotesk', 'Outfit', sans-serif;
  font-size: 0.92rem;
  font-weight: 800;
  color: #1f1412;
  margin: 0;
}

.learn-block-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  color: #3b2320;
  line-height: 1.45;
  margin: 0;
}

.learn-closing-card {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fdf2f8;
  border: 1.5px dashed #c0286a;
  padding: 8px 12px;
  border-radius: 6px;
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: #9d174d;
  line-height: 1.35;
}

.learn-closing-card i {
  font-size: 1rem;
  color: #db2777;
}

.learn-confirm-btn {
  width: 100%;
  padding: 12px;
  background: #f9a8d4;
  border: 2px solid #1f1412;
  box-shadow: 3px 3px 0 #1f1412;
  border-radius: 6px;
  font-family: 'Space Grotesk', 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  color: #1f1412;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}

.learn-confirm-btn:hover {
  background-color: #f472b6;
  transform: translate(-1.5px, -1.5px);
  box-shadow: 4.5px 4.5px 0 #1f1412;
}

.learn-confirm-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 1.5px 1.5px 0 #1f1412;
}

/* ── Responsive ── */
@media (max-width: 380px) {
  .gwen-top-left   { width: 165px; top: -4px; left: 0px; }
  .gwen-mid-right  { width: 110px; right: -6px; }
  .gwen-bot-left   { width: 95px; bottom: 6px; left: -2px; }
  .gwen-title-main { font-size: 2.3rem; }
  .gwen-header-typo { margin-top: 28px; max-width: 215px; }
  /* Scale down notch + sticker on tiny screens */
  .gwen-withus-text { font-size: 1.1rem; }
  .gwen-withus-sticker { width: 92px; padding: 8px 0; }
  .gwen-title-card {
    clip-path: polygon(
      0% 0%, 100% 0%,
      100% calc(100% - 40px),
      calc(100% - 94px) calc(100% - 40px),
      calc(100% - 94px) 100%,
      0% 100%
    );
  }
  .gwen-title-card::before {
    clip-path: polygon(
      0% 0%, 100% 0%,
      100% calc(100% - 40px),
      calc(100% - 94px) calc(100% - 40px),
      calc(100% - 94px) 100%,
      0% 100%
    );
  }
  .gwen-title-backing {
    clip-path: polygon(
      0% 0%, 100% 0%,
      100% calc(100% - 40px),
      calc(100% - 120px) calc(100% - 40px),
      calc(100% - 120px) 100%,
      0% 100%
    );
    bottom: 42px;
  }
  .gwen-title-card-wrap { padding-bottom: 38px; }
  [data-theme="gwen"] .ob-actions { gap: 10px; }
}

@media (min-width: 769px) {
  .gwen-top-left   { width: 175px; left: 10px; }
  .gwen-mid-right  { width: 145px; right: 4px; }
  .gwen-bot-left   { width: 125px; left: 4px; }
}

/* ── Force animations on Gwen rocket regardless of OS prefers-reduced-motion ──
   Android Battery Saver / some accessibility settings set prefers-reduced-motion: reduce,
   which silences CSS animations. Since this rocket is intentionally animated, we override. */
@media (prefers-reduced-motion: reduce) {
  .gwen-rocket-wrap *,
  .gwen-rocket-inner * {
    animation-duration: revert !important;
    animation-iteration-count: revert !important;
    transition-duration: revert !important;
  }
}

/* ── ORIGINAL THEME AUTH SELECTOR & LEARN MORE MODALS ──────────────────── */
.orig-selector-overlay {
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

.orig-selector-card {
  position: relative;
  max-width: 380px;
  width: 100%;
  max-height: 90vh;
  background: #faf9fd;
  border: 1px solid #e4e0ef;
  border-radius: 18px;
  box-shadow:
    0 10px 25px -5px rgba(111, 107, 216, 0.10),
    0 4px 10px -2px rgba(111, 107, 216, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  animation: origCardIn 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.orig-selector-header {
  padding: 22px 20px 0;
}

.orig-selector-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(111, 107, 216, 0.85); /* aligned to #6f6bd8 blob hue */
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 3px 10px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

/* Panduan Masuk eyebrow — transparent inline label, no background fill */
.orig-learn-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  color: #7c3aed;
  border: none;
  padding: 0;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.orig-learn-eyebrow-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.orig-selector-title {
  margin: 0 0 4px;
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.orig-selector-subtitle {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.45;
}

.orig-selector-divider {
  height: 1px;
  background: #ede9f4; /* warm lavender, selaras #f4f2f7 page background */
  margin: 14px 20px 0;
}

.orig-selector-options {
  padding: 14px 20px 4px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.orig-choice-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: rgba(241, 240, 255, 0.70); /* default neutral — overridden per variant */
  border: none;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;
  box-sizing: border-box;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.orig-choice-local {
  background: rgba(111, 107, 216, 0.72); /* rich indigo — selaras #6f6bd8 blob */
}

.orig-choice-token {
  background: rgba(249, 115, 22, 0.60); /* rich orange — selaras #f97316 blob */
}

.orig-choice-btn:hover {
  filter: brightness(0.97);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.orig-choice-btn:active {
  transform: translateY(0);
  filter: brightness(0.95);
  box-shadow: none;
}

.orig-choice-local:hover {
  box-shadow: 0 4px 16px rgba(111, 107, 216, 0.32);
}

.orig-choice-token:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.28);
}

/* Remix Icon — bare SVG, no background container */
.orig-choice-ri-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: block;
}

.orig-choice-ri-indigo {
  color: #ffffff;
}

.orig-choice-ri-orange {
  color: #ffffff;
}

.orig-choice-info {
  flex: 1;
  min-width: 0;
}

.orig-choice-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 3px;
}

.orig-choice-title {
  font-family: 'Inter', sans-serif;
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
}

.orig-choice-title-indigo {
  color: #ffffff;
}

.orig-choice-title-orange {
  color: #ffffff;
}

/* Transparent inline label — matches Panduan Masuk badge system */
.orig-choice-label {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: transparent;
  border: none;
  padding: 0;
}

.orig-label-indigo {
  color: rgba(255, 255, 255, 0.78); /* putih semi-transparan, selaras dengan judul putih */
}

.orig-label-orange {
  color: rgba(255, 255, 255, 0.78);
}

.orig-choice-desc {
  font-family: 'Inter', sans-serif;
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.4;
}

.orig-choice-chevron {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
  transition: transform 0.18s ease, color 0.18s ease;
}

.orig-choice-btn:hover .orig-choice-chevron {
  transform: translateX(3px);
  color: #ffffff;
}

.orig-selector-footer {
  padding: 12px 20px 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid #f1f5f9;
}

.orig-selector-cancel {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid rgba(111, 107, 216, 0.22); /* warm indigo-tinted border */
  border-radius: 10px;
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  color: #6b6490; /* warm slate-violet, harmonized with #6f6bd8 */
  cursor: pointer;
  transition: all 0.15s ease;
}

.orig-selector-cancel:hover {
  background: rgba(111, 107, 216, 0.06);
  color: #3d3870;
  border-color: rgba(111, 107, 216, 0.38);
}

.orig-selector-cancel:active {
  transform: translateY(0);
}

.orig-selector-cancel:focus-visible {
  outline: 2px solid #6f6bd8;
  outline-offset: 2px;
}

/* Learn More Modal */
.orig-learn-card {
  max-width: 420px;
  border-radius: 18px;
}

.orig-learn-body {
  padding: 16px 20px 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.orig-learn-block {
  padding: 14px 16px;
  border-radius: 12px;
  border: none;
  /* No backdrop-filter, no blur, no glassmorphism */
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.orig-learn-block-orange {
  background: rgba(255, 237, 213, 0.72);
  box-shadow: none;
}

.orig-learn-block-indigo {
  background: rgba(237, 233, 254, 0.72);
  box-shadow: none;
}

.orig-learn-block-hdr {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

/* Icon — bare SVG, no background container */
.orig-learn-block-icon {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  display: block;
}

.orig-learn-block-icon-orange {
  color: #ea580c;
}

.orig-learn-block-icon-indigo {
  color: #4f46e5;
  background: transparent;
  border: none;
}

.orig-learn-block-title {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
}

.orig-learn-block-title-orange {
  color: #c2410c;
}

.orig-learn-block-title-indigo {
  color: #3730a3;
}

.orig-learn-block-desc {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  color: #475569;
  line-height: 1.5;
  padding-left: 36px; /* align with icon + gap */
}

.orig-learn-closing {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  color: #64748b;
}

.orig-learn-confirm-btn {
  width: 100%;
  padding: 11px 20px;
  background: #6f6bd8;
  color: #ffffff;
  border: 1px solid #5753c4;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 2px 6px rgba(111, 107, 216, 0.25);
}

.orig-learn-confirm-btn:hover {
  background: #5d59cb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(111, 107, 216, 0.32);
}

/* Transitions */
.orig-selector-pop-enter-active,
.orig-selector-pop-leave-active {
  transition: opacity 0.22s ease;
}

.orig-selector-pop-enter-active .orig-selector-card {
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.24s ease;
}

.orig-selector-pop-leave-active .orig-selector-card {
  transition: transform 0.18s ease-in, opacity 0.18s ease-in;
}

.orig-selector-pop-enter-from,
.orig-selector-pop-leave-to {
  opacity: 0;
}

.orig-selector-pop-enter-from .orig-selector-card {
  transform: scale(0.94) translateY(12px);
  opacity: 0;
}

.orig-selector-pop-leave-to .orig-selector-card {
  transform: scale(0.96) translateY(8px);
  opacity: 0;
}

/* ── Original Theme Changelog Modal ────────────────────────────── */
.orig-changelog-modal-card {
  max-width: 440px;
  height: min(620px, 86vh);
}

.orig-changelog-body-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overscroll-behavior: contain;
}

.orig-version-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.orig-version-item-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 16px;
  text-align: left;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  box-sizing: border-box;
}

.orig-version-item-btn:hover {
  background: #ffffff;
  border-color: #6f6bd8;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(111, 107, 216, 0.12);
}

.orig-version-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.orig-version-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Badge A: Released Version - Solid Green, White Text (inspired by Paid badge reference) */
.orig-badge-ver {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  background: #16a34a;
  border: 1px solid #15803d;
  padding: 2.5px 8px;
  border-radius: 6px;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  line-height: 1.2;
}

/* Badge B: NEW - Solid Yellow, Dark Charcoal Text */
.orig-badge-latest {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 800;
  color: #0f172a;
  background: #eab308;
  border: 1px solid #ca8a04;
  padding: 2.5px 7px;
  border-radius: 6px;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  line-height: 1.2;
}

.orig-badge-date {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.orig-version-item-action {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  transition: color 0.15s ease;
}

.orig-version-item-btn:hover .orig-version-item-action {
  color: #6f6bd8;
}

.orig-version-item-summary {
  margin: 0;
  font-size: 12px;
  color: #475569;
  line-height: 1.45;
}

/* Badge C: Arsip Versi WHOOSH Eyebrow - Solid Blue, White Text */
.orig-archive-eyebrow {
  background: #2563eb;
  color: #ffffff;
  border: 1px solid #1d4ed8;
  border-radius: 6px;
  padding: 4px 10px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.orig-archive-eyebrow i {
  color: #ffffff;
  font-size: 11px;
}

/* Footer Hint replacing Tutup button */
.orig-history-footer-hint {
  padding: 14px 20px 18px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.orig-history-footer-hint p {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
  line-height: 1.45;
}

.orig-detail-header {
  padding-bottom: 2px;
}

.orig-detail-eyebrow {
  background: #2563eb;
  color: #ffffff;
  border: 1px solid #1d4ed8;
  border-radius: 6px;
  padding: 4px 10px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.orig-detail-eyebrow i {
  color: #ffffff;
  font-size: 11px;
}

.orig-detail-title {
  font-size: 1.18rem;
  line-height: 1.35;
  margin-top: 2px;
  margin-bottom: 6px;
}

.orig-detail-meta {
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.orig-detail-body-scroll {
  padding-bottom: 24px;
}

.orig-cat-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 6px;
}

.orig-cat-header {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #2563eb;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.orig-cat-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.orig-changelog-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #f8fafc;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

/* Category & Feature Badges inside Changelog Detail */
.orig-bullet-tag {
  font-family: 'Inter', sans-serif;
  font-size: 10.5px;
  font-weight: 700;
  padding: 2.5px 8px;
  border-radius: 6px;
  flex-shrink: 0;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  line-height: 1.2;
}

.orig-tag-emerald {
  background: #16a34a;
  color: #ffffff;
  border: 1px solid #15803d;
}

.orig-tag-blue {
  background: #2563eb;
  color: #ffffff;
  border: 1px solid #1d4ed8;
}

.orig-tag-amber {
  background: #d97706;
  color: #ffffff;
  border: 1px solid #b45309;
}

.orig-tag-purple {
  background: #7c3aed;
  color: #ffffff;
  border: 1px solid #6d28d9;
}

.orig-tag-rose {
  background: #e11d48;
  color: #ffffff;
  border: 1px solid #be123c;
}

.orig-changelog-text {
  font-size: 12px;
  color: #334155;
  line-height: 1.45;
}

</style>

