# PrepBridge — Native App Build Guide (Android + iOS)

## What was set up
- Capacitor 7 installed and configured (`capacitor.config.ts`)
- All icon sizes generated (72→512px PNG, all Apple sizes)
- All splash screens generated (Android mdpi→xxxhdpi, all iPhone + iPad)
- Safe-area / notch CSS (`env(safe-area-inset-*)`)
- Native service (`src/services/nativeService.js`) for haptics, push, status bar, back button
- PWA manifest updated with all icons, shortcuts, and app store links
- iOS `viewport-fit=cover` and `apple-mobile-web-app-capable` meta tags

---

## Prerequisites (install once on your machine)

### For Android
1. **Android Studio** — https://developer.android.com/studio
2. **Java JDK 17+** — https://adoptium.net
3. **Android SDK** — installed via Android Studio → SDK Manager
   - Install API 34 (Android 14) as target
   - Install API 24 (Android 7) as minimum

### For iOS (Mac only)
1. **Xcode 15+** — App Store on Mac
2. **CocoaPods** — `sudo gem install cocoapods`
3. **Apple Developer account** — https://developer.apple.com (you have this)

---

## One-time setup (run from project root)

```bash
# 1. Build the web app
npm run build

# 2. Add native platforms
npm run cap:add:android
npm run cap:add:ios        # Mac only

# 3. Sync web assets to native projects
npm run cap:sync
```

---

## Building Android APK / AAB

```bash
# 1. Build web + sync
npm run build:android

# 2. Open Android Studio
npm run cap:android

# In Android Studio:
# 3. Wait for Gradle sync to finish
# 4. Build → Generate Signed Bundle/APK
#    - Choose Android App Bundle (.aab) for Play Store
#    - Create or use existing keystore
#    - Build type: release
```

### Android config to change in Android Studio before release

**`android/app/src/main/AndroidManifest.xml`** — add these if missing:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

**`android/app/build.gradle`** — set versions:
```gradle
android {
    compileSdk 34
    defaultConfig {
        applicationId "in.prepbridge.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

### Firebase Android config
1. Firebase Console → Project Settings → Android → Add app
2. Package name: `in.prepbridge.app`
3. Download `google-services.json`
4. Place it at: `android/app/google-services.json`

---

## Building iOS IPA

```bash
# 1. Build web + sync (Mac only)
npm run build:ios

# 2. Open Xcode
npm run cap:ios

# In Xcode:
# 3. Select your Team in Signing & Capabilities
# 4. Set Bundle Identifier: in.prepbridge.app
# 5. Product → Archive
# 6. Distribute App → App Store Connect
```

### Firebase iOS config
1. Firebase Console → Project Settings → iOS → Add app
2. Bundle ID: `in.prepbridge.app`
3. Download `GoogleService-Info.plist`
4. Drag it into `ios/App/App/` in Xcode

### iOS Signing
1. Xcode → Signing & Capabilities → Team → select your Apple Developer account
2. Enable "Automatically manage signing"
3. This creates provisioning profiles automatically

---

## Every time you update the app

```bash
# Make code changes, then:
npm run build:android   # rebuilds web + syncs to android/
npm run cap:android     # opens Android Studio for final build

# or for iOS:
npm run build:ios
npm run cap:ios
```

---

## Play Store submission checklist
- [ ] `google-services.json` in `android/app/`
- [ ] App signed with release keystore (keep keystore file safe!)
- [ ] `versionCode` incremented for each upload
- [ ] AAB built in release mode
- [ ] Screenshots: 2-8 phone screenshots (min 320px, max 3840px)
- [ ] Feature graphic: 1024×500px
- [ ] Content rating questionnaire completed
- [ ] Privacy policy URL: https://prepbridge.in/privacy

## App Store submission checklist
- [ ] `GoogleService-Info.plist` added to Xcode project
- [ ] Bundle ID matches: `in.prepbridge.app`
- [ ] Signing team selected
- [ ] IPA built via Archive
- [ ] Screenshots for 6.5" iPhone, 12.9" iPad
- [ ] Privacy policy URL added
- [ ] App description in English and Hindi

---

## Deep links (OTP redirect on iOS/Android)

Add to `capacitor.config.ts` server section when needed:
```ts
server: {
  androidScheme: 'https',
  iosScheme: 'https',
  hostname: 'prepbridge.in',
}
```

For Firebase Phone Auth on Android, add SHA-1 fingerprint:
```bash
cd android && ./gradlew signingReport
# Copy SHA-1 → Firebase Console → Project Settings → Android app → Add fingerprint
```

---

## Updating `firebase-messaging-sw.js` for native

The service worker uses hardcoded Firebase config. When you move to env vars,
the service worker needs the config at build time. Add to your `.env.local`:

```
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here
```

Get VAPID key: Firebase Console → Project Settings → Cloud Messaging → Web Push certificates → Generate key pair
