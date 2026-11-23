#!/bin/bash

# Quick rebuild and install debug APK
# Usage: ./scripts/rebuild-debug.sh

set -e  # Exit on error

echo "🔨 WHOOSH Debug APK Builder"
echo "═══════════════════════════════════════════"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Run this script from project root${NC}"
    exit 1
fi

# Step 1: Load environment
echo -e "\n${BLUE}1️⃣  Loading environment...${NC}"
node load-env.js
echo -e "${GREEN}✅ Environment loaded${NC}"

# Step 2: Build project
echo -e "\n${BLUE}2️⃣  Building Vue project...${NC}"
npm run build
echo -e "${GREEN}✅ Build complete${NC}"

# Step 3: Sync Capacitor
echo -e "\n${BLUE}3️⃣  Syncing Capacitor...${NC}"
npx cap sync android
echo -e "${GREEN}✅ Capacitor synced${NC}"

# Step 4: Clean Gradle cache
echo -e "\n${BLUE}4️⃣  Cleaning Gradle...${NC}"
cd android
./gradlew clean
echo -e "${GREEN}✅ Gradle cleaned${NC}"

# Step 5: Build debug APK
echo -e "\n${BLUE}5️⃣  Building debug APK...${NC}"
./gradlew assembleDebug
echo -e "${GREEN}✅ APK built successfully${NC}"

# Step 6: Install to connected device
echo -e "\n${BLUE}6️⃣  Installing to device...${NC}"
cd ..

# Check for connected devices
DEVICE_COUNT=$(adb devices | grep -w "device" | wc -l)

if [ $DEVICE_COUNT -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No devices connected via ADB${NC}"
    echo -e "${YELLOW}   APK location: android/app/build/outputs/apk/debug/app-debug.apk${NC}"
    echo -e "${YELLOW}   Install manually or connect device and run again${NC}"
else
    APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
    adb install -r "$APK_PATH"
    echo -e "${GREEN}✅ APK installed to device${NC}"
fi

# Summary
echo -e "\n═══════════════════════════════════════════"
echo -e "${GREEN}✨ Rebuild complete!${NC}"
echo -e "\n📦 APK location:"
echo -e "   android/app/build/outputs/apk/debug/app-debug.apk"

if [ $DEVICE_COUNT -gt 0 ]; then
    echo -e "\n📱 Installed to $DEVICE_COUNT device(s)"
    echo -e "\n💡 Launch app on your phone to test"
else
    echo -e "\n💡 Connect device via USB to auto-install"
fi

echo ""
