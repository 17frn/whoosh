@echo off
REM Quick rebuild and install debug APK (Windows)
REM Usage: scripts\rebuild-debug.bat

echo.
echo 🔨 WHOOSH Debug APK Builder
echo ═══════════════════════════════════════════

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Run this script from project root
    exit /b 1
)

REM Step 1: Load environment
echo.
echo 1️⃣  Loading environment...
node load-env.js
if %errorlevel% neq 0 exit /b %errorlevel%
echo ✅ Environment loaded

REM Step 2: Build project
echo.
echo 2️⃣  Building Vue project...
call npm run build
if %errorlevel% neq 0 exit /b %errorlevel%
echo ✅ Build complete

REM Step 3: Sync Capacitor
echo.
echo 3️⃣  Syncing Capacitor...
call npx cap sync android
if %errorlevel% neq 0 exit /b %errorlevel%
echo ✅ Capacitor synced

REM Step 4: Clean Gradle cache
echo.
echo 4️⃣  Cleaning Gradle...
cd android
call gradlew.bat clean
if %errorlevel% neq 0 exit /b %errorlevel%
echo ✅ Gradle cleaned

REM Step 5: Build debug APK
echo.
echo 5️⃣  Building debug APK...
call gradlew.bat assembleDebug
if %errorlevel% neq 0 exit /b %errorlevel%
echo ✅ APK built successfully

REM Step 6: Install to connected device
echo.
echo 6️⃣  Installing to device...
cd ..

REM Check for connected devices
adb devices | findstr "device" > nul
if %errorlevel% equ 0 (
    adb install -r "android\app\build\outputs\apk\debug\app-debug.apk"
    echo ✅ APK installed to device
) else (
    echo ⚠️  No devices connected via ADB
    echo    APK location: android\app\build\outputs\apk\debug\app-debug.apk
    echo    Install manually or connect device and run again
)

REM Summary
echo.
echo ═══════════════════════════════════════════
echo ✨ Rebuild complete!
echo.
echo 📦 APK location:
echo    android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 💡 Launch app on your phone to test
echo.
