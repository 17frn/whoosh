#!/usr/bin/env node

/**
 * Install debug APK to connected device
 * Simpler alternative to full rebuild
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APK_PATH = 'android/app/build/outputs/apk/debug/app-debug.apk';

console.log('📱 WHOOSH APK Installer\n');

// Check if APK exists
if (!fs.existsSync(APK_PATH)) {
  console.error('❌ APK not found. Build it first:');
  console.error('   npm run rebuild\n');
  process.exit(1);
}

// Get APK info
const stats = fs.statSync(APK_PATH);
const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
console.log(`📦 APK: ${APK_PATH}`);
console.log(`📏 Size: ${sizeMB} MB\n`);

// Check connected devices
try {
  const devices = execSync('adb devices', { encoding: 'utf8' });
  const lines = devices.split('\n').filter(line => line.includes('\tdevice'));
  
  if (lines.length === 0) {
    console.error('❌ No devices connected via ADB');
    console.error('\n💡 Connect your phone via USB and:');
    console.error('   1. Enable Developer Options');
    console.error('   2. Enable USB Debugging');
    console.error('   3. Allow USB debugging popup on phone\n');
    process.exit(1);
  }
  
  console.log(`✅ Found ${lines.length} device(s):\n`);
  lines.forEach((line, i) => {
    const [serial] = line.trim().split('\t');
    console.log(`   ${i + 1}. ${serial}`);
  });
  
  // Install APK
  console.log('\n🔄 Installing APK...');
  execSync(`adb install -r "${APK_PATH}"`, { stdio: 'inherit' });
  
  console.log('\n✅ Installation complete!');
  console.log('📱 Open WHOOSH DEBUG app on your phone\n');
  
} catch (err) {
  console.error('\n❌ Installation failed');
  console.error('   Error:', err.message);
  console.error('\n💡 Try:');
  console.error('   - Disconnect and reconnect USB');
  console.error('   - Run: adb kill-server && adb start-server');
  console.error('   - Check phone screen for authorization popup\n');
  process.exit(1);
}
