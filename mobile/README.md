# CRM Mobile (Capacitor → Android APK)

Wraps the existing `client/` build as an Android app. Same React + Tailwind code, same API calls, same design — just shipped as an APK.

## How it fits together

```
client/ (React + Vite)          ── same codebase ─┐
         │ build produces                          ├─> hits the deployed API at VITE_API_BASE_URL
         ▼                                         │    (Render, Railway, etc.)
client/dist/  ────(cap sync)──►  mobile/android/  ─┘
                                         │
                                 gradlew assembleDebug
                                         ▼
                                   app-debug.apk
```

## Building the APK

**In CI (recommended):** push to GitHub — the workflow `.github/workflows/android-apk.yml` builds the APK and uploads it as a downloadable artifact.

**Locally (optional):** requires Android Studio + JDK 17 + Android SDK.

```bash
cd mobile
npm install
VITE_API_BASE_URL=https://your-api.onrender.com npm run build
npm run apk:debug          # produces android/app/build/outputs/apk/debug/app-debug.apk
```

## How the API URL is set

`VITE_API_BASE_URL` is baked into the JS bundle at build time. Change it by rebuilding — the CI workflow accepts it as a workflow input.
