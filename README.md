<p align="center">
  <img src="public/logo.png" width="180" alt="Whoosh Logo" style="border-radius: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.12);" />
</p>

<h1 align="center">Whoosh — Timeline & Memory Space</h1>

<p align="center">
  <strong>Aplikasi linimasa kenangan interaktif dan ruang personal modern berbasis Vue 3, TypeScript, dan Capacitor.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Capacitor-8.4-119EFF?style=for-the-badge&logo=capacitor&logoColor=white" alt="Capacitor" />
  <img src="https://img.shields.io/badge/Supabase-Enabled-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet" />
</p>

---

## 📖 Tentang Whoosh

**Whoosh** adalah aplikasi jurnal visual dan pelacak momen personal yang memadukan estetika *scrapbook*, layout *Bento Grid*, serta peta interaktif. Dirancang untuk mengabadikan perjalanan, cerita cinta, dan momen berharga dalam hidup secara terstruktur, aman, dan memikat.

Aplikasi ini dapat dijalankan secara responsif di browser web modern maupun dikemas sebagai aplikasi mobile native Android menggunakan **Capacitor**.

---

## ✨ Fitur Unggulan

### 1. 🖼️ Galeri Linimasa & Bento Grid
- **Two-Column Bento Grid**: Komposisi kartu momen dua kolom yang seimbang dengan hierarki tipografi dan dimensi thumbnail yang teratur.
- **Rantai Perak Vertikal (Vertical Hanging Chains)**: Sambungan rantai perak realistis dengan efek *eyelet/punched-hole* yang menghubungkan kartu-kartu momen secara kronologis per kolom secara independen.
- **Sorotan Terkini (Recent Highlights)**: Transisi kanvas ganda (*dual-tone canvas*) dengan presentasi foto gantung bergaya Polaroid.
- **Penyaring Periode**: Filter interaktif berdasarkan Bulan dan Tahun secara cepat dan mulus.

### 2. 🗺️ Peta Wilayah Interaktif (Interactive Maps)
- **Leaflet & GeoJSON Terpadu**: Visualisasi peta detail untuk wilayah Indonesia, termasuk DKI Jakarta, Banten (Tangerang Selatan), dan Jawa Barat (Bandung).
- **Custom Pin Markers & Geo-Resolver**: Penanda lokasi kustom untuk setiap momen yang tersimpan lengkap dengan koordinat presisi.
- **Pemilih Lokasi Interaktif**: Modal pemilih lokasi (*Location Picker*) yang intuitif untuk menambahkan koordinat momen baru.

### 3. 💑 Ruang Kita
- **Love Distance Tracker**: Pelacak jarak real-time interaktif dengan visual peta jalanan (*street map*).
- **Sub-Modul Lengkap**:
  - 📖 **Diary**: Catatan dan surat personal.
  - 📷 **Kenangan**: Galeri foto dan arsip momen favorit.
  - 📍 **Rencana**: *Bucket list* destinasi dan impian bersama.
  - 📅 **Aktivitas**: Berbagi kabar harian dan catatan suasana hati (*mood*).

### 4. 🎨 Tema & Sistem Visual Dinamis
- **Blue Amber Family**:
  - *Blue Amber (Default)*: Hangat, bersih, dan modern dengan aksen indigo & amber.
  - *Blue Amber Warm*: Kombinasi *soft blue* dan *terracotta amber* yang nyaman.
  - *Blue Amber Cool*: Tampilan *cool blue* dan *bright amber* bernuansa teknologi segar.
- **Zine**: Gaya editorial berani (*bold dark mode*) dengan aksen kuning tegas.
- **Crimson**: Nuansa lavender hangat bernuansa travel dengan sentuhan mawar merah muda.

### 5. ⚡ Offline-First & Sinkronisasi Cloud
- **IndexedDB (`idb`)**: Penyimpanan lokal berkecepatan tinggi agar aplikasi tetap cepat diakses meski tanpa koneksi internet.
- **Supabase Cloud Sync**: Sinkronisasi akun, autentikasi multi-perangkat, dan pencadangan data ke database PostgreSQL cloud.

---

## 🛠️ Arsitektur Teknologi

| Komponen | Teknologi |
| :--- | :--- |
| **Framework Frontend** | [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`) |
| **Bahasa Pemrograman** | [TypeScript](https://www.typescriptlang.org/) |
| **Build Tooling** | [Vite](https://vitejs.dev/) |
| **Mobile Runtime** | [Capacitor 8](https://capacitorjs.com/) (Android) |
| **Penyimpanan Lokal** | [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via `idb` |
| **Database & Auth** | [Supabase](https://supabase.com/) |
| **Pemetaan & GeoJSON** | [Leaflet.js](https://leafletjs.com/) |
| **Animasi & Ikon** | [Motion-V](https://motion.dev/), [RemixIcon](https://remixicon.com/), FontAwesome |

---


## 🚀 Panduan Memulai

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 18.x atau lebih baru disarankan)
- [npm](https://www.npmjs.com/)
- [Android Studio](https://developer.android.com/studio) *(opsional, untuk kompilasi APK Android)*

### 1. Kloning Repository
```bash
git clone https://github.com/17frn/whoosh.git
cd whoosh
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (Environment Variables)
Salin berkas sampel `.env.example` menjadi `.env.local` atau `.env`:
```bash
cp .env.example .env
```
Sesuaikan variabel kredensial Supabase Anda di dalamnya:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban di `http://localhost:5173`.

---

## 📱 Alur Kerja Build Android (Capacitor)

```bash
# 1. Build berkas produksi & sinkronisasi ke proyek Android
npm run build
npm run cap:sync

# 2. Build Debug APK langsung melalui Gradle
npm run android:debug

# 3. Build Release APK
npm run android:release
```

## 📄 Lisensi

Proyek ini dikembangkan secara privat dan terbuka untuk portofolio pribadi [@17frn](https://github.com/17frn). Seluruh hak cipta dilindungi.
