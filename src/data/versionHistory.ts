export interface ChangelogItem {
  tag: string;
  tagClass: 'tag-amber' | 'tag-blue' | 'tag-emerald' | 'tag-rose' | 'tag-purple';
  title: string;
  description: string;
  tagOriginal?: string;
  titleOriginal?: string;
  descriptionOriginal?: string;
}

export interface ChangelogCategory {
  title: string;
  icon: string;
  iconClass?: string;
  titleOriginal?: string;
  items: ChangelogItem[];
}

export interface VersionRelease {
  version: string;
  versionLabel: string;
  isLatest?: boolean;
  stampTag: string;
  stampIcon: string;
  title: string;
  titleOriginal?: string;
  dateLabel: string;
  dateLabelOriginal?: string;
  shortSummary: string;
  shortSummaryOriginal?: string;
  categories: ChangelogCategory[];
}

export const APP_VERSION = '1.5.1';

export const VERSION_HISTORY: VersionRelease[] = [
  {
    version: '1.5.1',
    versionLabel: 'v1.5.1',
    isLatest: true,
    stampTag: "WHAT'S POPPIN' • UPDATE DROPPED",
    stampIcon: 'fa-solid fa-fire',
    title: 'Changelog v1.5.1: Koneksi Lebih Mantap!',
    titleOriginal: 'Catatan Rilis v1.5.1',
    dateLabel: 'Rilis Terbaru',
    dateLabelOriginal: 'Pembaruan Terkini',
    shortSummary: 'Layar error Nailong baru & papan kayu interaktif, deteksi IP lokal otomatis, tema Gwen scrapbook, serta optimasi WebView.',
    shortSummaryOriginal: 'Diagnostik development server mandiri, deteksi IP otomatis, tema Gwen scrapbook, serta penyelarasan Clean Bento tema Original.',
    categories: [
      {
        title: 'Koneksi & Diagnostik Dev Server',
        titleOriginal: 'Koneksi & Diagnostik Dev Server',
        icon: 'fa-solid fa-network-wired',
        iconClass: 'group-sys',
        items: [
          {
            tag: 'Nailong',
            tagOriginal: 'Diagnostik',
            tagClass: 'tag-amber',
            title: 'Layar Error Mandiri & Maskot Makin Gede:',
            titleOriginal: 'Layar Diagnostik Koneksi (APK Debug):',
            description: 'Pas koneksi putus, Nailong langsung muncul +34% lebih besar dari sebelumnya. Warm halo radial-nya estetik banget, dan 100% offline-safe — ga butuh server buat jalan, no cap!',
            descriptionOriginal: 'Tampilan diagnostik mandiri untuk mode development dengan visual Nailong lebih besar dan terisolasi secara offline tanpa bergantung pada server backend.',
          },
          {
            tag: 'Papan Kayu',
            tagOriginal: 'Status Error',
            tagClass: 'tag-amber',
            title: 'Papan Kayu Interaktif yang Literally Ngomong Error:',
            titleOriginal: 'Papan Informasi Error Real-Time:',
            description: 'Nailong sekarang megangin papan kayu honey oak yang nampilin kode error secara real-time. Aesthetic + informatif, bet!',
            descriptionOriginal: 'Papan status interaktif yang menampilkan kode kendala jaringan development server secara langsung dan informatif.',
          },
          {
            tag: 'Auto IP',
            tagOriginal: 'Auto IP',
            tagClass: 'tag-emerald',
            title: 'Ganti WiFi? IP Auto Update, Bro:',
            titleOriginal: 'Pembaruan Alamat IP Otomatis:',
            description: 'Bridge Android-nya sekarang pinter — pas lo ganti jaringan WiFi atau hotspot, IP server development-nya langsung ke-update sendiri. Ga perlu setting ulang, chill aja!',
            descriptionOriginal: 'Bridge Android kini mendeteksi perubahan jaringan WiFi atau hotspot dan memperbarui alamat IP development server secara otomatis tanpa konfigurasi ulang.',
          },
          {
            tag: 'Sat-Set',
            tagOriginal: 'Utilitas',
            tagClass: 'tag-blue',
            title: 'Salin IP & Retry Makin Smooth:',
            titleOriginal: 'Alat Salin IP & Diagnostik Cepat:',
            description: "Tombol salin IP-nya ada animasi toast yang satisfying, tombol Coba Lagi ada efek spin yang bikin nagih, plus accordion diagnostik buat yang mau tau detail errornya. Chef's kiss!",
            descriptionOriginal: 'Penyempurnaan tombol salin IP dengan notifikasi toast, tombol coba lagi yang responsif, serta panel akordeon untuk inspeksi detail diagnostik jaringan.',
          },
        ],
      },
      {
        title: 'Visual & Tema Gwen',
        titleOriginal: 'Visual & Antarmuka Aplikasi',
        icon: 'fa-solid fa-palette',
        iconClass: 'group-ui',
        items: [
          {
            tag: 'Estetik',
            tagOriginal: 'Tema Gwen',
            tagClass: 'tag-rose',
            title: 'Modal Login Gaya Gwen yang Slay:',
            titleOriginal: 'Antarmuka Login Tema Gwen Neo-Brutalism:',
            description: 'Tampilan login akun lokal & token sesi sekarang bergaya scrapbook pastel neo-brutalism, ada ornamen memo bergaris sama stempel unik. Vibes-nya beda banget dari yang biasa!',
            descriptionOriginal: 'Pembaruan tampilan modal autentikasi akun lokal dan token sesi bertema scrapbook pastel neo-brutalism dengan ornamen memo bergaris dan stempel khas.',
          },
          {
            tag: 'Switch',
            tagOriginal: 'Tema',
            tagClass: 'tag-purple',
            title: 'Pilih Tema Langsung dari Onboarding:',
            titleOriginal: 'Pemilih Tema Tersegmentasi di Onboarding:',
            description: 'Mau tema Original atau Gwen? Tinggal tap kontrol tersegmentasi di layar onboarding, langsung ganti. Ga perlu masuk setting dulu, efisien banget fr fr!',
            descriptionOriginal: 'Penyediaan kontrol pemilih tema tersegmentasi langsung pada layar onboarding untuk memudahkan pengguna berganti antara tema Original dan Gwen.',
          },
          {
            tag: 'Bento',
            tagOriginal: 'Bento UI',
            tagClass: 'tag-blue',
            title: 'Penyelarasan Clean Bento Tema Original:',
            titleOriginal: 'Harmonisasi Clean Bento Tema Original:',
            description: 'Penyelarasan visual tema Original dengan tata letak Bento yang bersih, warna solid tanpa efek kaca (glassmorphism), dan hierarki tombol yang seimbang.',
            descriptionOriginal: 'Penerapan sistem desain Clean Bento UI pada tema Original dengan permukaan solid opak, eliminasi efek kaca (glassmorphism), dan penataan tombol yang proporsional.',
          },
        ],
      },
      {
        title: 'Stabilitas & Navigasi',
        titleOriginal: 'Stabilitas & Navigasi Sistem',
        icon: 'fa-solid fa-shield-halved',
        iconClass: 'group-sys',
        items: [
          {
            tag: 'Stabil',
            tagOriginal: 'Stabilitas',
            tagClass: 'tag-emerald',
            title: 'Anti Error Loop di WebView:',
            titleOriginal: 'Pencegahan Loop Error di WebView:',
            description: 'Penanganan error resource & HTTP status code-nya di-upgrade, jadi aplikasi ga bakal masuk loop error ga jelas waktu koneksi lemot. Stabil terus, ga drama!',
            descriptionOriginal: 'Peningkatan penanganan kode status HTTP dan pencegahan loop pemuatan ulang pada lingkungan Android WebView untuk memastikan keandalan aplikasi.',
          },
          {
            tag: 'Smooth',
            tagOriginal: 'Navigasi',
            tagClass: 'tag-blue',
            title: 'Tombol Back Makin Presisi & Anti Kepeleset:',
            titleOriginal: 'Optimasi Tombol Hardware Back & Gestur:',
            description: 'Gesture back hardware-nya lebih responsif, plus ada proteksi biar ga keluar aplikasi gara-gara kepencet back ga sengaja. Aman dari misclick, bestie!',
            descriptionOriginal: 'Integrasi sistem penanganan tombol kembali hardware Android dan gestur usap yang lebih responsif dengan proteksi konfirmasi sebelum keluar aplikasi.',
          },
        ],
      },
    ],
  },
  {
    version: '1.5.0',
    versionLabel: 'v1.5.0',
    isLatest: false,
    stampTag: 'HISTORICAL • POPULAR RELEASE',
    stampIcon: 'fa-solid fa-star',
    title: 'Changelog v1.5.0: Makin Slay!',
    titleOriginal: 'Catatan Rilis v1.5.0',
    dateLabel: 'Versi Sebelumnya',
    dateLabelOriginal: 'Rilis Sebelumnya',
    shortSummary: 'Leaflet Map Banten presisi 8 kab/kota, penambahan peta Jakarta & Jabar, memo paper neo-brutalism, dan rilis APK mandiri.',
    shortSummaryOriginal: 'Peta interaktif Leaflet Banten dengan batas wilayah presisi, penambahan peta Jakarta dan Jawa Barat, serta rilis APK mandiri.',
    categories: [
      {
        title: 'Peta & Eksplorasi (Fix Anti-Nyasar!)',
        titleOriginal: 'Peta & Eksplorasi Wilayah',
        icon: 'fa-solid fa-map-location-dot',
        iconClass: 'group-maps',
        items: [
          {
            tag: 'Sat-Set',
            tagOriginal: 'Banten',
            tagClass: 'tag-amber',
            title: 'Leaflet Map Banten Riil:',
            titleOriginal: 'Peta Interaktif Provinsi Banten:',
            description: '8 Kab/Kota resmi ber-boundary presisi + bisa zoom-in 7 kecamatan Tangsel. Vibes-nya makin real, no cap!',
            descriptionOriginal: 'Visualisasi 8 kabupaten/kota resmi di Provinsi Banten dengan batas wilayah presisi serta dukungan penelusuran 7 kecamatan di Tangerang Selatan.',
          },
          {
            tag: 'Mampir',
            tagOriginal: 'Wilayah',
            tagClass: 'tag-amber',
            title: 'Penambahan Map DKI Jakarta & Jawa Barat:',
            titleOriginal: 'Perluasan Wilayah DKI Jakarta & Jawa Barat:',
            description: 'Pilihan cakupan peta wilayah yang lebih luas untuk dokumentasi momen perjalanan kamu.',
            descriptionOriginal: 'Penambahan cakupan peta interaktif untuk mendokumentasikan momen perjalanan pengguna di wilayah DKI Jakarta dan Jawa Barat.',
          },
          {
            tag: 'Legaan',
            tagOriginal: 'Tata Letak',
            tagClass: 'tag-amber',
            title: 'Kontrol Peta di Kanan Bawah:',
            titleOriginal: 'Reposisi Kontrol Peta:',
            description: '4 tombol navigasi dipindah ke pojok kanan bawah (size 0.6x) biar tampilan layar makin lega & ga nge-block pop up.',
            descriptionOriginal: 'Penempatan tombol navigasi peta pada sudut kanan bawah guna menjaga keleluasaan bidang pandang layar utama.',
          },
          {
            tag: 'Auto Lock',
            tagOriginal: 'Geospasial',
            tagClass: 'tag-amber',
            title: 'Smart Geo Resolver:',
            titleOriginal: 'Resolusi Koordinat Geospasial Otomatis:',
            description: 'Koordinat momen kamu auto-presisi, ga ada cerita pin nyasar ke antah berantah.',
            descriptionOriginal: 'Penyelarasan otomatis penempatan pin lokasi momen berdasarkan data koordinat geospasial yang akurat.',
          },
        ],
      },
      {
        title: 'Visual Neo-Brutalism (Aesthetic Parah!)',
        titleOriginal: 'Visual & Pengalaman Pengguna',
        icon: 'fa-solid fa-wand-magic-sparkles',
        iconClass: 'group-ui',
        items: [
          {
            tag: 'Flexing',
            tagOriginal: 'Status',
            tagClass: 'tag-blue',
            title: 'Pop-up Berhasil Login Slay:',
            titleOriginal: 'Notifikasi Status Autentikasi:',
            description: 'Tiap masuk langsung disambut pop up berornamen estetik.',
            descriptionOriginal: 'Penyajian umpan balik visual yang informatif saat pengguna berhasil masuk ke dalam akun lokal maupun sesi cloud.',
          },
          {
            tag: 'Smooth',
            tagOriginal: 'Gestur',
            tagClass: 'tag-blue',
            title: 'Gesture Back Sat-Set:',
            titleOriginal: 'Dukungan Navigasi Gestur Usap:',
            description: 'Navigasi swipe gesture ala native + proteksi double-tap biar ga kepencet keluar aplikasi ga sengaja.',
            descriptionOriginal: 'Dukungan navigasi kembali melalui gestur usap layar native serta proteksi penekanan ganda sebelum menutup aplikasi.',
          },
          {
            tag: 'Dope',
            tagOriginal: 'Kertas',
            tagClass: 'tag-blue',
            title: 'Konsep Paper Keren:',
            titleOriginal: 'Penerapan Konsep Visual Memo Kertas:',
            description: 'Tampilan catatan memo bergaris, washi tape, dan paper clip yang super eye-catching & aesthetic!',
            descriptionOriginal: 'Penerapan gaya visual berbasis catatan memo bergaris, ornamen washi tape, dan tekstur kertas.',
          },
        ],
      },
      {
        title: 'Performa Rilis (Anti-Lag Club)',
        titleOriginal: 'Performa Rilis Produksi',
        icon: 'fa-solid fa-bolt',
        iconClass: 'group-sys',
        items: [
          {
            tag: 'Anywhere',
            tagOriginal: 'Jaringan',
            tagClass: 'tag-emerald',
            title: 'Bisa di Jaringan Mana Aja:',
            titleOriginal: 'Operasional Mandiri Lintas Jaringan:',
            description: 'APK versi rilis udah mandiri total. Pake kuota 4G/5G, WiFi kafe, atau hotspot temen, tetep gass jalan!',
            descriptionOriginal: 'APK versi produksi beroperasi secara mandiri dan andal di berbagai tipe koneksi internet seluler maupun WiFi publik.',
          },
          {
            tag: 'Enteng',
            tagOriginal: 'Efisiensi',
            tagClass: 'tag-emerald',
            title: 'RAM & Storage Friendly:',
            titleOriginal: 'Optimalisasi Memori & Ukuran Berkas:',
            description: 'Optimasi memori dan ukuran APK cuma ~5.5MB, anti bikin HP kentang nangis!',
            descriptionOriginal: 'Efisiensi konsumsi memori kerja dan ukuran paket instalasi aplikasi yang ringkas (~5.5MB) untuk performa yang optimal.',
          },
        ],
      },
    ],
  },
  {
    version: '1.0.0',
    versionLabel: 'v1.0.0',
    isLatest: false,
    stampTag: 'GENESIS • INITIAL RELEASE',
    stampIcon: 'fa-solid fa-rocket',
    title: 'Changelog v1.0.0: Hello, WHOOSH!',
    titleOriginal: 'Catatan Rilis Perdana v1.0.0',
    dateLabel: 'Rilis Perdana',
    dateLabelOriginal: 'Rilis Perdana',
    shortSummary: 'Rilis perdana aplikasi WHOOSH: timeline momen perjalanan kronologis, penyimpanan momen lokal & cloud, dan onboarding interaktif.',
    shortSummaryOriginal: 'Rilis perdana aplikasi WHOOSH: timeline momen perjalanan kronologis, penyimpanan data lokal & cloud, serta onboarding interaktif.',
    categories: [
      {
        title: 'Fitur Inti & Timeline Perjalanan',
        titleOriginal: 'Fitur Inti & Timeline Perjalanan',
        icon: 'fa-solid fa-timeline',
        iconClass: 'group-maps',
        items: [
          {
            tag: 'Momen',
            tagOriginal: 'Timeline',
            tagClass: 'tag-amber',
            title: 'Timeline Kronologis yang Literally Bikin Nostalgia:',
            titleOriginal: 'Pencatatan Momen Kronologis:',
            description: 'Catat kenangan & perjalanan kamu urut berdasarkan tanggal, lengkap sama judul dan foto. Scroll ke bawah, langsung time travel ke masa lalu, slay!',
            descriptionOriginal: 'Pencatatan dokumentasi perjalanan yang tersusun rapi berdasarkan urutan tanggal, judul momen, dan lampiran foto pendukung.',
          },
          {
            tag: 'Simpan',
            tagOriginal: 'Penyimpanan',
            tagClass: 'tag-amber',
            title: 'Nyimpen Momen? Fleksibel Banget:',
            titleOriginal: 'Penyimpanan Fleksibel (Lokal & Cloud):',
            description: 'Data momen bisa langsung disimpen di HP atau sync ke cloud. Offline-first tapi tetap bisa backup — best of both worlds fr!',
            descriptionOriginal: 'Dukungan penyimpanan data secara mandiri di perangkat (offline-first) maupun sinkronisasi sesi bersama melalui cloud.',
          },
        ],
      },
      {
        title: 'Antarmuka & Pengalaman Awal',
        titleOriginal: 'Antarmuka & Pengalaman Awal',
        icon: 'fa-solid fa-mobile-screen',
        iconClass: 'group-ui',
        items: [
          {
            tag: 'Onboard',
            tagOriginal: 'Onboarding',
            tagClass: 'tag-blue',
            title: 'Layar Onboarding yang Bikin Hype:',
            titleOriginal: 'Alur Pengenalan Aplikasi Interaktif:',
            description: 'Disambut animasi roket dan panduan singkat yang fun buat mulai perjalanan pertama kamu di WHOOSH. First impression? Immaculate!',
            descriptionOriginal: 'Layar pengenalan interaktif dengan panduan ringkas untuk memandu langkah pertama pengguna dalam aplikasi.',
          },
          {
            tag: 'Akses',
            tagOriginal: 'Autentikasi',
            tagClass: 'tag-blue',
            title: 'Login? Dua Pilihan, Ga Ribet:',
            titleOriginal: 'Dukungan Autentikasi Ganda:',
            description: 'Mau pake Akun Lokal di HP atau Token Sesi cloud, dua-duanya sat-set tanpa drama. Pilih yang paling cocok sama gaya kamu!',
            descriptionOriginal: 'Kemudahan memilih metode masuk antara Akun Lokal yang tersimpan di perangkat atau Token Sesi cloud.',
          },
        ],
      },
      {
        title: 'Fondasi Aplikasi Mobile',
        titleOriginal: 'Fondasi Aplikasi Mobile',
        icon: 'fa-solid fa-gears',
        iconClass: 'group-sys',
        items: [
          {
            tag: 'Hybrid',
            tagOriginal: 'Arsitektur',
            tagClass: 'tag-emerald',
            title: 'Dibangun di Atas Stack yang Solid:',
            titleOriginal: 'Fondasi Aplikasi Mobile Hybrid:',
            description: 'Vue 3 + Capacitor = web app modern yang jalan mulus di Android. Performanya responsif, ga ada lag yang bikin emosi. Fondasinya kuat, bestie!',
            descriptionOriginal: 'Dibangun menggunakan Vue 3 dan Capacitor untuk menghadirkan performa aplikasi mobile yang responsif, stabil, dan efisien di platform Android.',
          },
        ],
      },
    ],
  },
];
