# 🚀 Live Debugging Quick Start Guide

## ⚡ TL;DR - Quick Commands

```bash
# 1. Check your current IP
npm run ip
# Output: 10.224.78.157

# 2. Update Capacitor with current IP
npm run cap:update-ip

# 3. Rebuild and install APK
npm run rebuild        # Linux/Mac
npm run rebuild:win    # Windows

# 4. Start dev server
npm run dev

# 5. Open app on phone
# Your phone should now connect to http://10.224.78.157:3000
```

---

## 📱 First Time Setup (One-Time)

### 1. Enable Firewall
Allow port 3000 (one-time setup):

**Linux:**
```bash
sudo ufw allow 3000/tcp
```

**Mac:**
System Preferences → Security → Firewall → Allow Node.js

**Windows:**
```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### 2. Connect Phone via USB
- Enable Developer Options on phone
- Enable USB Debugging
- Connect USB cable
- Accept authorization popup on phone

### 3. Verify Setup
```bash
npm run diagnose
```

Expected output:
```
✅ Detected IP: 10.224.78.157
✅ Dev server running on port 3000
✅ 1 device(s) connected via ADB
```

---

## 🔄 Daily Workflow

### When Same Network
```bash
npm run dev     # Just start dev server, no rebuild needed
```

### When Network Changed (WiFi Baru)
```bash
npm run cap:update-ip    # Auto-update IP
npm run rebuild          # Rebuild APK with new IP
npm run dev              # Start dev server
```

---

## 🆘 Troubleshooting

### Can't Access from Phone Browser

**Problem:** Browser timeout saat akses `http://<IP>:3000`

**Solutions:**
1. Check firewall (see setup above)
2. Ensure phone & laptop on same WiFi
3. Check dev server running: `npm run dev`

### APK Connects but Browser Doesn't

**Problem:** APK works but browser HP tidak bisa akses

**Solution:** APK has old IP, rebuild it:
```bash
npm run rebuild
```

### Wrong IP Detected

**Problem:** `npm run ip` shows 127.0.0.1 or wrong IP

**Solution:** Set manual in `.env.local`:
```bash
# Add to .env.local
DEV_SERVER_IP=192.168.0.100
```

### ADB Not Found

**Problem:** `npm run diagnose` shows "ADB not found"

**Solution:** Check Android SDK in `.env.local`:
```bash
# Linux/Mac
ANDROID_HOME=$HOME/Android/Sdk

# Windows
ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk
```

---

## 📚 Full Documentation

- [LIVE_DEBUG_NETWORK_GUIDE.md](./LIVE_DEBUG_NETWORK_GUIDE.md) - Complete guide
- [FIREWALL_SETUP.md](./FIREWALL_SETUP.md) - Detailed firewall setup
- [ANDROID_SDK_SETUP.md](./ANDROID_SDK_SETUP.md) - SDK installation

---

## 🎯 Available Commands

| Command | Description |
|---------|-------------|
| `npm run ip` | Print current IP |
| `npm run diagnose` | Check all: IP, server, ADB, firewall |
| `npm run cap:update-ip` | Update Capacitor config with current IP |
| `npm run rebuild` | Full rebuild & install (Linux/Mac) |
| `npm run rebuild:win` | Full rebuild & install (Windows) |
| `npm run install-apk` | Install already-built APK |
| `npm run dev` | Start development server |

---

## ✅ Checklist Before Debugging

- [ ] Firewall allows port 3000 (one-time)
- [ ] Phone & laptop on same WiFi
- [ ] Phone USB debugging enabled (for install)
- [ ] IP updated (`npm run cap:update-ip`)
- [ ] APK rebuilt (`npm run rebuild`)
- [ ] Dev server running (`npm run dev`)
- [ ] Test browser: `http://<IP>:3000`

**Quick verify:** `npm run diagnose`

---

🎉 Happy Debugging!
