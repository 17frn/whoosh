#!/usr/bin/env node

/**
 * Auto-detect local IP address from network interfaces
 * Priority: WiFi > Ethernet > Other non-internal IPv4
 */

import os from 'os';

export function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  // Priority list: check WiFi first, then Ethernet
  const priority = [
    'wlan0',      // Linux WiFi
    'Wi-Fi',      // Windows WiFi
    'en0',        // Mac WiFi
    'eth0',       // Linux Ethernet
    'Ethernet',   // Windows Ethernet
    'en1'         // Mac Ethernet
  ];
  
  // Check priority interfaces first
  for (const name of priority) {
    if (interfaces[name]) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  
  // Fallback: scan all interfaces for any non-internal IPv4
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  // Last resort fallback
  return '127.0.0.1';
}

// Main execution when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const ip = getLocalIP();
  console.log(ip);
}
