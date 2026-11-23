import type { CapacitorConfig } from '@capacitor/cli';
import { execSync } from 'child_process';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Auto-detect local IP address for dev server
 * Priority: 1. ENV variable, 2. Auto-detect script, 3. Fallback
 */
function getDevServerIP(): string {
  try {
    // Try environment variable first
    if (process.env.DEV_SERVER_IP) {
      console.log(`🌐 Using DEV_SERVER_IP from env: ${process.env.DEV_SERVER_IP}`);
      return process.env.DEV_SERVER_IP;
    }

    // Auto-detect using script
    const ip = execSync('node scripts/get-local-ip.js', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'] // Suppress stderr
    }).trim();

    if (ip && ip !== '127.0.0.1') {
      console.log(`🌐 Auto-detected dev server IP: ${ip}`);
      return ip;
    }

    // Fallback to previous IP
    console.warn('⚠️  Using fallback IP. Run: npm run switch-network auto');
    return '10.113.94.157';

  } catch (err) {
    console.warn('⚠️  Failed to detect IP, using fallback: 10.113.94.157');
    return '10.113.94.157';
  }
}

const devIP = isDev ? getDevServerIP() : null;

const config: CapacitorConfig = {
  appId: isDev ? 'com.whoosh.app.debug' : 'com.whoosh.app',
  appName: isDev ? 'WHOOSH DEBUG' : 'WHOOSH',
  webDir: 'dist',
  server: isDev && devIP ? {
    url: `http://${devIP}:3000`,
    cleartext: true,
    androidScheme: 'https',
    errorPath: 'connection-error.html'
  } : undefined,
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: isDev
  }
};

export default config;
