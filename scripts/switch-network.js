#!/usr/bin/env node

/**
 * Quick network switcher for common WiFi locations
 * Usage: node scripts/switch-network.js [home|office|cafe|auto]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLocalIP } from './get-local-ip.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '../capacitor.config.ts');
const envPath = path.join(__dirname, '../.env.local');

// Network presets (customize these for your networks)
const PRESETS = {
  home: '192.168.0.100',    // Your home WiFi IP
  office: '192.168.1.100',  // Your office WiFi IP
  cafe: '10.0.0.100',       // Common cafe network IP
  current: '10.113.94.157'  // Current IP from config
};

function updateCapacitorConfig(ip) {
  let config = fs.readFileSync(configPath, 'utf8');
  
  // Replace URL in server config
  config = config.replace(
    /url:\s*['"`]http:\/\/[^'"`]+['"`]/g,
    `url: 'http://${ip}:3000'`
  );
  
  fs.writeFileSync(configPath, config);
  console.log(`✅ Updated capacitor.config.ts with IP: ${ip}`);
}

function updateEnvFile(ip) {
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update or add DEV_SERVER_IP
  if (envContent.includes('DEV_SERVER_IP')) {
    envContent = envContent.replace(
      /DEV_SERVER_IP=.*/g,
      `DEV_SERVER_IP=${ip}`
    );
  } else {
    envContent += `\n# Development Server IP\nDEV_SERVER_IP=${ip}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Updated .env.local with IP: ${ip}`);
}

function autoDetectIP() {
  try {
    const ip = getLocalIP();
    return ip;
  } catch (e) {
    console.error('❌ Failed to auto-detect IP');
    return null;
  }
}

function syncCapacitor() {
  console.log('\n🔄 Syncing Capacitor...');
  try {
    execSync('npx cap sync android', { stdio: 'inherit' });
    console.log('✅ Capacitor synced successfully');
  } catch (e) {
    console.error('❌ Failed to sync Capacitor');
  }
}

// Main execution
const args = process.argv.slice(2);
const command = args[0] || 'auto';

console.log('🌐 WHOOSH Network Switcher\n');

if (command === 'list') {
  console.log('Available presets:');
  Object.entries(PRESETS).forEach(([name, ip]) => {
    console.log(`  - ${name.padEnd(10)} : ${ip}`);
  });
  console.log('\nUsage:');
  console.log('  node scripts/switch-network.js [home|office|cafe|auto|list]');
  console.log('  node scripts/switch-network.js <custom-ip>');
  process.exit(0);
}

let targetIP;

if (command === 'auto') {
  console.log('🔍 Auto-detecting IP...');
  targetIP = autoDetectIP();
  if (!targetIP) {
    console.error('❌ Could not detect IP. Please specify manually.');
    process.exit(1);
  }
  console.log(`📍 Detected: ${targetIP}`);
} else if (PRESETS[command]) {
  targetIP = PRESETS[command];
  console.log(`📍 Using preset "${command}": ${targetIP}`);
} else {
  // Assume it's a custom IP
  targetIP = command;
  console.log(`📍 Using custom IP: ${targetIP}`);
}

// Validate IP format
const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
if (!ipRegex.test(targetIP)) {
  console.error('❌ Invalid IP format');
  process.exit(1);
}

// Update configs
updateCapacitorConfig(targetIP);
updateEnvFile(targetIP);

// Sync Capacitor
syncCapacitor();

// Try enabling ADB reverse port forwarding for USB debugging
try {
  execSync('adb reverse tcp:3000 tcp:3000', { stdio: 'ignore' });
  console.log('⚡ ADB reverse port 3000 enabled for instant zero-latency mobile hot-reload!');
} catch (e) {
  // Ignore if no device plugged in
}

console.log('\n✨ Network switch complete!');
console.log(`\n📱 Mobile URL: http://${targetIP}:3000`);
console.log('\n💡 Next steps:');
console.log('   1. npm run dev           (start dev server)');
console.log('   2. npm run rebuild       (rebuild & install APK)');
console.log('\n');
