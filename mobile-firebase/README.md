# CRM Mobile (Firebase edition) → Android APK

Capacitor wrapper that ships [../client-firebase/](../client-firebase/) as an Android APK. Because the web app talks directly to Firestore, the APK needs no backend URL — it just needs the Firebase config baked in at build time (via `VITE_FIREBASE_*` env vars).

## How it fits together

```
client-firebase/ (React + Vite + Firestore) ── build ──> client-firebase/dist/
                                                               │
                                                               ▼
                                                   mobile-firebase/android/
                                                        (cap sync + gradlew)
                                                               │
                                                               ▼
                                                          app-debug.apk
```

Same UI as the web + desktop versions. Live realtime sync via Firestore `onSnapshot` — admin edits on desktop appear instantly in the APK and vice versa.

## Building the APK

**CI (recommended):** push to `main` — [../.github/workflows/android-apk-firebase.yml](../.github/workflows/android-apk-firebase.yml) runs automatically and uploads `app-debug.apk` as an artifact. You'll need to add the Firebase config as repo secrets first (see below).

**Locally** (requires Android Studio + JDK 17 + Android SDK):

```bash
# 1. Build the web bundle with Firebase config
cd ../client-firebase
npm install
npm run build

# 2. Sync + build APK
cd ../mobile-firebase
npm install
npm run sync
npm run apk:debug      # -> android/app/build/outputs/apk/debug/app-debug.apk
```

## Required GitHub Actions secrets

Settings → Secrets and variables → Actions → New repository secret. Paste the same six values from your `client-firebase/.env.local`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## App icon + splash screen

Logo source lives at [resources/icon.png](resources/icon.png) (1024×1024) and [resources/splash.png](resources/splash.png) (2732×2732). Run `npm run generate-assets` whenever you change them to regenerate all Android densities.

Splash screen is configured in [capacitor.config.json](capacitor.config.json) — 1.5s native splash hands off to the React splash inside client-firebase for a seamless transition.
