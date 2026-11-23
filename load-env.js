#!/usr/bin/env node

/**
 * Load .env.local and set environment variables
 * ES Module version - compatible with "type": "module" in package.json
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local tidak ditemukan!');
  process.exit(1);
}

console.log('📂 Loading .env.local...');

const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');

lines.forEach(line => {
  // Skip comments dan empty lines
  if (!line || line.startsWith('#')) return;
  
  const [key, value] = line.split('=');
  if (!key || !value) return;
  
  // Expand $HOME
  let expandedValue = value
    .trim()
    .replace(/\$HOME/g, os.homedir());
  
  process.env[key.trim()] = expandedValue;
  console.log(`  ✅ ${key.trim()}=${expandedValue}`);
});

// Juga export untuk subprocess
process.env.ANDROID_HOME = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
process.env.ANDROID_SDK_ROOT = process.env.ANDROID_HOME;

console.log('\n✅ Environment variables loaded!\n');
