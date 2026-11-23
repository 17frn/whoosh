# Panduan Live Debugging dengan Auto IP Detection

> **🎉 UPDATE:** Sistem sekarang sudah support **auto IP detection**! Tidak perlu manual edit config lagi.

## Problem
Saat live debugging ke HP/device, aplikasi mengakses backend/API melalui local network IP (contoh: `http://192.168.0.100:3000`). Ketika pindah WiFi/network, IP berubah dan app tidak bisa connect.

## ✨ Solusi Baru (Automated)

Sistem sekarang otomatis detect IP kamu! Gunakan commands berikut:

### 🚀 Quick Start (Recommended)

```bash
# 1. Start dev server (IP auto-detected)
npm run dev

# 2. Update Capacitor dengan IP terbaru
npm run cap:update-ip

# 3. Rebuild & install APK
npm run rebuild        # Linux/Mac
npm run rebuild:win    # Windows

# 4. Launch app di HP
```

**That's it!** Tidak perlu edit file manual lagi.

---

### 📋 Available Commands

| Command | Deskripsi |
|---------|-----------|
| `npm run ip` | Print current IP address |
| `npm run diagnose` | Check semua: IP, dev server, ADB, config |
| `npm run cap:update-ip` | Auto-update capacitor.config.ts dengan IP terbaru |
| `npm run rebuild` | Build APK debug + install ke HP (Linux/Mac) |
| `npm run rebuild:win` | Build APK debug + install ke HP (Windows) |
| `npm run install-apk` | Install APK yang sudah di-build ke HP |
| `npm run switch-network` | Quick switch untuk preset networks |

---

### 🔧 Advanced: Network Presets

Jika kamu punya beberapa network tetap (rumah, kantor, cafe), edit presets di `scripts/switch-network.js`:

```javascript
const PRESETS = {
  home: '192.168.0.100',    // WiFi rumah
  office: '192.168.1.100',  // WiFi kantor
  cafe: '10.0.0.100',       // WiFi cafe
};
```

Lalu pakai dengan:
```bash
npm run switch-network home
npm run switch-network office
npm run switch-network auto     # Auto-detect
```

---

## 📖 Manual Method (Old Way)

<details>
<summary>Klik untuk lihat cara manual (backup jika auto-detect gagal)</summary>

### 1. Cek IP Address Komputer yang Baru

#### Windows
```bash
ipconfig
```
Cari bagian `Wireless LAN adapter Wi-Fi` atau `Ethernet adapter`:
```
IPv4 Address. . . . . . . . . . . : 192.168.1.105
```

#### Mac/Linux
```bash
ifconfig
# atau
ip addr show
```
Cari `inet` di interface aktif (biasanya `wlan0` atau `eth0`):
```
inet 192.168.1.105/24
```

#### Cara Cepat (All OS)
Di terminal development (yang running `npm run dev`), Vite sudah menampilkan:
```
➜  Local:   http://localhost:3000/
➜  Network: http://192.168.1.105:3000/  ← INI IP YANG DIPAKAI
```

---

### 2. Update Capacitor Config

File: `capacitor.config.ts`

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.whoosh.timelinemomen',
  appName: 'Whoosh',
  webDir: 'dist',
  server: {
    // GANTI IP INI sesuai network baru
    url: 'http://192.168.1.105:3000',  // ← UPDATE IP DI SINI
    cleartext: true,
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    }
  }
};

export default config;
```

**Catatan:**
- Port biasanya `3000` atau `3001` (tergantung Vite)
- `cleartext: true` diperlukan untuk HTTP (non-HTTPS)

---

### 3. Sync Perubahan ke Android

```bash
# Stop running dev server dulu (Ctrl+C)

# Sync perubahan
npx cap sync android

# Atau kalau perlu rebuild
npx cap copy android
npx cap update android
```

---

### 4. Rebuild & Install APK ke HP

#### Opsi A: Debug APK (Cepat)
```bash
cd android
./gradlew assembleDebug

# Install ke HP yang sudah connect via USB
adb install app/build/outputs/apk/debug/app-debug.apk
```

#### Opsi B: Via Android Studio
1. Buka `android/` folder di Android Studio
2. Klik "Sync Project with Gradle Files" (icon elephant)
3. Pilih device (HP kamu)
4. Klik Run (▶️)

---

### 5. Pastikan HP dan Komputer di Network yang Sama

**Checklist:**
- ✅ HP dan komputer connect ke WiFi yang sama
- ✅ Firewall tidak block port 3000/3001
- ✅ Dev server running (`npm run dev`)
- ✅ IP di `capacitor.config.ts` sudah benar
- ✅ APK sudah di-rebuild dan install ulang

**Test koneksi dari HP:**
- Buka browser HP
- Akses `http://192.168.1.105:3000` (IP baru)
- Kalau website muncul = koneksi OK ✅
- Kalau timeout = ada masalah network/firewall ❌

---

### 6. Troubleshooting

#### Problem: "ERR_CONNECTION_REFUSED"
**Solusi:**
1. Pastikan dev server running
2. Check firewall:
   ```bash
   # Windows: Allow port di Windows Defender Firewall
   # Mac: System Preferences → Security → Firewall → Allow
   # Linux: sudo ufw allow 3000
   ```

#### Problem: APK install tapi tetap pakai IP lama
**Solusi:**
1. Uninstall app dari HP dulu
2. Clear cache Android Studio
3. Rebuild clean:
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   ```

#### Problem: IP terus berubah-ubah
**Solusi: Set Static IP di Router**
1. Masuk router admin panel (biasanya `192.168.1.1` atau `192.168.0.1`)
2. Cari menu DHCP → Static IP / IP Reservation
3. Bind MAC Address komputer ke IP tetap (contoh: `192.168.1.100`)
4. Restart router & komputer
5. Update `capacitor.config.ts` dengan IP static ini (cukup sekali)

---

## Quick Reference Commands

### Check Current Config
```bash
cat capacitor.config.ts | grep url
```

### One-Liner Update IP (Linux/Mac)
```bash
# Ganti 192.168.1.105 dengan IP baru
sed -i "s|url: 'http://.*'|url: 'http://192.168.1.105:3000'|g" capacitor.config.ts
```

### Full Rebuild Pipeline
```bash
# 1. Update IP di capacitor.config.ts (manual edit)
# 2. Sync
npx cap sync android
# 3. Build
cd android && ./gradlew assembleDebug
# 4. Install
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## Alternative: Tunneling (No IP Change Needed)

Kalau sering ganti network, pakai tunneling service:

### Opsi 1: ngrok
```bash
npm install -g ngrok

# Running di terminal terpisah
npm run dev  # Terminal 1
ngrok http 3000  # Terminal 2

# Copy URL dari ngrok (contoh: https://abc123.ngrok.io)
# Update capacitor.config.ts:
# url: 'https://abc123.ngrok.io'
```

### Opsi 2: Cloudflare Tunnel
```bash
npm install -g cloudflared

npm run dev  # Terminal 1
cloudflared tunnel --url http://localhost:3000  # Terminal 2

# Copy URL yang muncul
```

**Keuntungan:**
- ✅ IP tidak perlu diganti
- ✅ Bisa akses dari mana saja (tidak harus WiFi sama)
- ✅ HTTPS otomatis

**Kekurangan:**
- ⚠️ Latency lebih tinggi
- ⚠️ Bergantung internet

---

## Workflow Recommended

### Daily Development (Network Stabil)
```bash
# 1. Start dev server
npm run dev

# 2. Check IP di output Vite
# ➜  Network: http://192.168.0.189:3001/

# 3. Update capacitor.config.ts jika IP berubah

# 4. Sync & rebuild jika perlu
npx cap sync android
cd android && ./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk

# 5. Buka app di HP
```

### When Changing Network
```bash
# 1. Check IP baru
ifconfig  # atau lihat Vite output

# 2. Update capacitor.config.ts
vim capacitor.config.ts  # ganti IP

# 3. Must rebuild!
npx cap sync android
cd android && ./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Production Build (No IP Needed)
```bash
# Build production (pakai backend production URL)
npm run build

# Copy ke Capacitor
npx cap sync android

# Build release APK
cd android
./gradlew assembleRelease

# APK di: android/app/build/outputs/apk/release/
```

---

## File Checklist

Setiap ganti network, check files ini:

- [ ] `capacitor.config.ts` → `server.url` updated
- [ ] Dev server running (`npm run dev`)
- [ ] `npx cap sync android` executed
- [ ] APK rebuilt & installed
- [ ] HP connect ke WiFi yang sama dengan komputer

---

## Pro Tips

1. **Save IP configs untuk setiap network:**
   ```bash
   # capacitor.config.home.ts (192.168.0.x)
   # capacitor.config.office.ts (192.168.1.x)
   # capacitor.config.cafe.ts (10.0.0.x)
   
   # Copy sesuai lokasi
   cp capacitor.config.home.ts capacitor.config.ts
   ```

2. **Use environment variable:**
   ```typescript
   // capacitor.config.ts
   const DEV_SERVER_IP = process.env.DEV_SERVER_IP || '192.168.0.189';
   
   server: {
     url: `http://${DEV_SERVER_IP}:3000`,
     cleartext: true
   }
   ```
   
   ```bash
   # .env
   DEV_SERVER_IP=192.168.1.105
   ```

3. **Script untuk auto-detect IP:**
   ```javascript
   // scripts/get-local-ip.js
   const os = require('os');
   
   function getLocalIP() {
     const interfaces = os.networkInterfaces();
     for (const name of Object.keys(interfaces)) {
       for (const iface of interfaces[name]) {
         if (iface.family === 'IPv4' && !iface.internal) {
           return iface.address;
         }
       }
     }
     return 'localhost';
   }
   
   console.log(getLocalIP());
   ```
   
   ```bash
   # package.json
   "scripts": {
     "dev:ip": "node scripts/get-local-ip.js"
   }
   ```

---

## Summary

**Langkah Minimal Setiap Ganti Network:**
1. Cek IP baru: `npm run dev` (lihat output Vite)
2. Edit `capacitor.config.ts` → ganti IP
3. Sync: `npx cap sync android`
4. Rebuild: `cd android && ./gradlew assembleDebug`
5. Install: `adb install app/build/outputs/apk/debug/app-debug.apk`
6. Buka app di HP

**One-Time Setup (Recommended):**
- Set static IP di router untuk komputer dev
- Atau pakai ngrok/cloudflare tunnel

✅ Done!

</details>

---

## 🔥 New Features

### 1. Auto IP Detection
- ✅ Otomatis detect WiFi/Ethernet IP
- ✅ Priority: WiFi > Ethernet > Other
- ✅ Fallback ke env variable atau IP sebelumnya

### 2. Network Diagnostics
```bash
npm run diagnose
```
Output:
- ✅ Local IP detected
- ✅ Dev server status (running/not)
- ✅ Environment variables
- ✅ Capacitor config check
- ✅ ADB devices connected
- 💡 Firewall tips per OS
- 📋 Quick action commands

### 3. Quick Rebuild Pipeline
```bash
npm run rebuild
```
Automatic steps:
1. Load environment
2. Build Vue project (`npm run build`)
3. Sync Capacitor
4. Clean Gradle cache
5. Build debug APK
6. Auto-install ke HP (jika connected)

### 4. Smart Config Updates
`capacitor.config.ts` sekarang:
- Auto-exec `get-local-ip.js` saat sync
- Fallback ke `DEV_SERVER_IP` env variable
- Log IP yang digunakan di console

---

## 🐛 Troubleshooting Baru

### Auto-Detection Gagal?

**Solusi 1: Manual Set via Env**
```bash
# Edit .env.local
DEV_SERVER_IP=192.168.0.100

# Sync
npm run cap:update-ip
```

**Solusi 2: Check Script**
```bash
# Test IP detection
npm run ip

# Should output your local IP
# If outputs 127.0.0.1 → not connected to network
```

**Solusi 3: Use Preset**
```bash
# Edit scripts/switch-network.js, add your IP
# Then run:
npm run switch-network home
```

### Rebuild Gagal?

```bash
# Run diagnostics first
npm run diagnose

# Check output untuk specific issues
# Then fix accordingly
```

### APK Tidak Auto-Install?

```bash
# Check ADB
adb devices

# If no devices shown:
# - Connect USB
# - Enable USB debugging on phone
# - Accept authorization popup

# Manual install
npm run install-apk
```

---

## 🎯 Best Practices

### Daily Workflow

```bash
# Morning: Start dev session
npm run dev              # Terminal 1 (keep running)

# If IP changed (ganti WiFi):
npm run cap:update-ip    # Terminal 2
npm run rebuild          # Terminal 2

# That's it!
```

### Multiple Developers

```bash
# Setiap developer:
1. Clone repo
2. Copy .env.example → .env.local
3. Set ANDROID_HOME di .env.local
4. npm install
5. npm run cap:update-ip
6. npm run rebuild
7. Start coding!
```

### Static IP Setup (One-Time)

**Router Config:**
1. Login router admin (192.168.0.1 atau 192.168.1.1)
2. DHCP Settings → Static Lease / IP Reservation
3. Bind laptop MAC address ke IP tetap (e.g., 192.168.0.100)
4. Restart router + laptop
5. Update preset di `scripts/switch-network.js`
6. `npm run switch-network home`
7. Never worry about IP change lagi! ✨

---

## 🔗 Related Docs

- [FIREWALL_SETUP.md](./FIREWALL_SETUP.md) - Firewall configuration per OS
- [PROJECT_ENV_SETUP.md](./PROJECT_ENV_SETUP.md) - Initial project setup
- [ANDROID_SDK_SETUP.md](./ANDROID_SDK_SETUP.md) - Android SDK installation

---

## 🆘 Quick Help

**Stuck? Run diagnostics:**
```bash
npm run diagnose
```

Output akan kasih:
- ✅ What's working
- ❌ What's broken
- 💡 How to fix

**Still stuck? Check:**
1. Is dev server running? (`npm run dev`)
2. Is firewall allowing port 3000? (See FIREWALL_SETUP.md)
3. Are phone & laptop on same WiFi?
4. Is USB debugging enabled on phone?

---

✅ Happy debugging dengan auto IP detection!
