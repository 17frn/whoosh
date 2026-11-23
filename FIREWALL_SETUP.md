# Firewall Setup Guide for Live Debugging

Agar HP bisa akses development server di komputer kamu, firewall harus mengizinkan koneksi ke port 3000.

---

## 🪟 Windows

### Windows Defender Firewall (Cara GUI)

1. **Buka Windows Defender Firewall**
   - Tekan `Win + R`
   - Ketik: `wf.msc`
   - Enter

2. **Buat Inbound Rule Baru**
   - Klik "Inbound Rules" di sidebar kiri
   - Klik "New Rule..." di sidebar kanan
   - Pilih "Port" → Next
   - Pilih "TCP" dan ketik port: `3000` → Next
   - Pilih "Allow the connection" → Next
   - Centang semua (Domain, Private, Public) → Next
   - Nama: `Vite Dev Server` → Finish

### PowerShell (Cara Command Line)

```powershell
# Run sebagai Administrator
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### Verify Rule

```powershell
Get-NetFirewallRule -DisplayName "Vite Dev Server" | Get-NetFirewallPortFilter
```

---

## 🍎 macOS

### System Preferences

1. **Buka Firewall Settings**
   - System Preferences → Security & Privacy → Firewall
   - Klik 🔒 lock icon (masukkan password)
   - Klik "Firewall Options..."

2. **Allow Node.js atau Terminal**
   - Klik tombol `+`
   - Cari aplikasi: `/usr/local/bin/node` atau Terminal.app
   - Pilih "Allow incoming connections"
   - OK

### Command Line (Alternative)

```bash
# Allow Node.js through firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
```

### Disable Firewall (Not Recommended untuk WiFi Publik)

```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

---

## 🐧 Linux

### UFW (Ubuntu/Debian)

```bash
# Allow port 3000
sudo ufw allow 3000/tcp

# Check status
sudo ufw status

# Enable UFW jika belum aktif
sudo ufw enable
```

### iptables (Manual)

```bash
# Allow port 3000
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT

# Save rules (Ubuntu/Debian)
sudo iptables-save | sudo tee /etc/iptables/rules.v4

# Save rules (RHEL/CentOS)
sudo service iptables save
```

### firewalld (Fedora/RHEL/CentOS)

```bash
# Allow port 3000
sudo firewall-cmd --zone=public --add-port=3000/tcp --permanent
sudo firewall-cmd --reload

# Check rules
sudo firewall-cmd --list-all
```

---

## 🧪 Test Koneksi

### Dari Komputer

```bash
# Check if port 3000 is listening
# Linux/Mac
lsof -i :3000
netstat -an | grep 3000

# Windows
netstat -an | findstr :3000
```

### Dari HP

1. **Pastikan HP connect ke WiFi yang sama dengan komputer**

2. **Buka browser HP, akses:**
   ```
   http://<IP_KOMPUTER>:3000
   ```
   
   Contoh:
   ```
   http://192.168.0.100:3000
   ```

3. **Jika berhasil:**
   - Website WHOOSH muncul ✅
   - Hot reload works saat edit code

4. **Jika gagal:**
   - Coba ping komputer dari HP:
     ```bash
     # Di HP (termux atau terminal emulator)
     ping 192.168.0.100
     ```
   - Check firewall settings lagi
   - Check apakah dev server running: `npm run dev`

---

## 🔍 Troubleshooting

### Problem: "Connection Refused"

**Solusi:**
1. Check dev server running:
   ```bash
   npm run dev
   ```

2. Verify server listening di `0.0.0.0`:
   ```bash
   lsof -i :3000  # Mac/Linux
   netstat -an | findstr :3000  # Windows
   ```
   
   Output harus menunjukkan `0.0.0.0:3000` bukan `127.0.0.1:3000`

3. Check firewall rules sudah di-add

### Problem: "Connection Timeout"

**Kemungkinan:**
- HP dan komputer tidak di WiFi yang sama
- Router block inter-device communication (AP Isolation)
- Antivirus block koneksi

**Solusi:**
1. Pastikan WiFi sama
2. Coba disable AP Isolation di router settings
3. Temporary disable antivirus
4. Gunakan tunneling (ngrok/cloudflare)

### Problem: APK Connect tapi Browser HP Tidak

**Solusi:**
- Rebuild APK dengan IP baru:
  ```bash
  npm run cap:update-ip
  npm run rebuild
  ```

### Problem: Firewall Rule Tidak Work

**Windows:**
```powershell
# List semua rules
Get-NetFirewallRule | Where-Object DisplayName -like "*Vite*"

# Delete rule lama
Remove-NetFirewallRule -DisplayName "Vite Dev Server"

# Buat ulang
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Any
```

**Linux:**
```bash
# Flush and re-add
sudo ufw delete allow 3000/tcp
sudo ufw allow 3000/tcp
sudo ufw reload
```

---

## 🚀 Quick Commands Reference

### Check Current IP
```bash
npm run ip
```

### Update Capacitor with Current IP
```bash
npm run cap:update-ip
```

### Run Diagnostics
```bash
npm run diagnose
```

### Rebuild & Install APK
```bash
# Linux/Mac
npm run rebuild

# Windows
npm run rebuild:win
```

---

## 🌐 Alternative: Tunneling (No Firewall Config)

Jika firewall terlalu ribet atau sering ganti network, pakai tunneling service:

### Option 1: ngrok

```bash
# Install
npm install -g ngrok

# Terminal 1: Start dev server
npm run dev

# Terminal 2: Create tunnel
ngrok http 3000
```

Copy URL dari ngrok (contoh: `https://abc123.ngrok.io`)

Update `capacitor.config.ts`:
```typescript
url: 'https://abc123.ngrok.io'
```

**Keuntungan:**
- ✅ No firewall config
- ✅ Works dari mana saja
- ✅ HTTPS otomatis

**Kekurangan:**
- ⚠️ Latency lebih tinggi
- ⚠️ URL berubah setiap restart (free tier)

### Option 2: Cloudflare Tunnel

```bash
# Install
npm install -g cloudflared

# Terminal 1: Start dev server
npm run dev

# Terminal 2: Create tunnel
cloudflared tunnel --url http://localhost:3000
```

---

## 📋 Checklist Lengkap

Sebelum mulai debugging:

- [ ] Dev server running (`npm run dev`)
- [ ] Firewall allow port 3000
- [ ] HP dan komputer di WiFi sama
- [ ] IP sudah diupdate di capacitor.config (`npm run cap:update-ip`)
- [ ] APK sudah direbuild (`npm run rebuild`)
- [ ] APK installed ke HP
- [ ] Test akses dari browser HP dulu (`http://<IP>:3000`)

✅ Semua checklist hijau = siap debug!

---

## 💡 Pro Tips

1. **Save firewall rule sekali, pakai selamanya**
   - Tidak perlu setup ulang setiap dev session

2. **Gunakan static IP di router**
   - Set DHCP reservation untuk komputer dev
   - IP tidak berubah setiap reconnect

3. **Bookmark IP di HP browser**
   - Quick test sebelum rebuild APK

4. **Use `npm run diagnose`**
   - Auto-check semua kemungkinan masalah

5. **Keep APK debug installed**
   - Cukup rebuild saat IP berubah
   - Tidak perlu uninstall dulu

---

🎉 Selamat debugging!
