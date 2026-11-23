#!/usr/bin/env node

/**
 * Network diagnostics tool for debugging live reload issues
 * Checks: IP detection, dev server, connectivity, firewall hints
 */

import { execSync } from 'child_process';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLocalIP } from './get-local-ip.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 WHOOSH Network Diagnostics\n');
console.log('═'.repeat(50));

// 1. Check Local IP
console.log('\n1️⃣  LOCAL IP ADDRESS');
const ip = getLocalIP();
console.log(`   ✅ Detected IP: ${ip}`);

if (ip === '127.0.0.1') {
  console.log('   ⚠️  Warning: Only localhost detected. Not connected to network?');
}

// 2. Check if dev server is running
console.log('\n2️⃣  DEV SERVER STATUS');
const port = 3000;

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

checkPort(port).then(isRunning => {
  if (isRunning) {
    console.log(`   ✅ Dev server running on port ${port}`);
    console.log(`   🌐 Local URL: http://localhost:${port}`);
    console.log(`   📱 Mobile URL: http://${ip}:${port}`);
  } else {
    console.log(`   ❌ Dev server NOT running on port ${port}`);
    console.log(`   💡 Run: npm run dev`);
  }
  
  // Continue with rest of diagnostics
  runRestOfDiagnostics();
});

function runRestOfDiagnostics() {
  // 3. Check environment
  console.log('\n3️⃣  ENVIRONMENT CHECK');
  try {
    const envIP = process.env.DEV_SERVER_IP;
    if (envIP) {
      console.log(`   ✅ DEV_SERVER_IP env: ${envIP}`);
    } else {
      console.log('   ℹ️  DEV_SERVER_IP not set (using auto-detection)');
    }
  } catch (e) {
    console.log('   ⚠️  Error reading env variables');
  }

  // 4. Check Capacitor config
  console.log('\n4️⃣  CAPACITOR CONFIG');
  try {
    const configPath = path.join(__dirname, '../capacitor.config.ts');
    if (fs.existsSync(configPath)) {
      const config = fs.readFileSync(configPath, 'utf8');
      const urlMatch = config.match(/url:\s*['"`]([^'"`]+)['"`]/);
      if (urlMatch) {
        console.log(`   📝 Config server URL: ${urlMatch[1]}`);
        if (urlMatch[1].includes(ip)) {
          console.log('   ✅ URL matches detected IP');
        } else {
          console.log('   ⚠️  URL does NOT match detected IP');
          console.log(`   💡 Run: npm run cap:update-ip`);
        }
      }
    }
  } catch (e) {
    console.log('   ⚠️  Could not read capacitor.config.ts');
  }

  // 5. Firewall hints
  console.log('\n5️⃣  FIREWALL TIPS');
  const platform = process.platform;

  if (platform === 'win32') {
    console.log('   🪟 Windows Firewall:');
    console.log('      - Open Windows Defender Firewall');
    console.log('      - Allow inbound rule for port 3000');
    console.log('      - Or run as admin: netsh advfirewall firewall add rule name="Vite Dev" dir=in action=allow protocol=TCP localport=3000');
  } else if (platform === 'darwin') {
    console.log('   🍎 Mac Firewall:');
    console.log('      - System Preferences → Security → Firewall');
    console.log('      - Allow Node.js or your terminal app');
  } else {
    console.log('   🐧 Linux Firewall:');
    console.log('      - Run: sudo ufw allow 3000/tcp');
    console.log('      - Or: sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT');
  }

  // 6. ADB check
  console.log('\n6️⃣  ADB CONNECTION');
  try {
    const devices = execSync('adb devices', { encoding: 'utf8' });
    const lines = devices.split('\n').filter(line => line.includes('\t'));
    if (lines.length > 0) {
      console.log(`   ✅ ${lines.length} device(s) connected via ADB:`);
      lines.forEach(line => console.log(`      - ${line.trim()}`));
    } else {
      console.log('   ❌ No devices connected via ADB');
      console.log('   💡 Connect phone via USB and enable USB debugging');
    }
  } catch (e) {
    console.log('   ⚠️  ADB not found or not in PATH');
    console.log('   💡 Make sure Android SDK platform-tools is installed');
  }

  // 7. Quick actions
  console.log('\n═'.repeat(50));
  console.log('\n📋 QUICK ACTIONS:\n');
  console.log('   • Update Capacitor IP:  npm run cap:update-ip');
  console.log('   • Rebuild debug APK:    npm run rebuild');
  console.log('   • Start dev server:     npm run dev');
  console.log('   • Install APK to phone: npm run install-apk');
  console.log('\n');
}
