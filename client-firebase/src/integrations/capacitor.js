// Capacitor-native integrations. No-ops on web/desktop.
//
// We deliberately use the global `window.Capacitor` bridge instead of
// `import { App } from '@capacitor/app'` so client-firebase/ stays free of
// native-only dependencies — the same build runs on web, Electron, and APK.

function nativePlatform() {
  const cap = typeof window !== 'undefined' ? window.Capacitor : null;
  if (!cap?.isNativePlatform?.()) return null;
  return cap;
}

// Route the Android hardware back button (and edge-swipe-back gesture) into
// React Router's history instead of letting Android finish() the app.
// When there's nowhere to go back to we call App.exitApp() so the gesture
// still behaves like a normal Android app.
export function wireAndroidBackButton() {
  const cap = nativePlatform();
  if (!cap) return;

  const AppPlugin = cap.Plugins?.App;
  if (!AppPlugin) return;

  AppPlugin.addListener('backButton', ({ canGoBack }) => {
    const hasHistory = canGoBack || (typeof window !== 'undefined' && window.history.length > 1);
    if (hasHistory) {
      window.history.back();
    } else {
      AppPlugin.exitApp();
    }
  });
}

// Hide the native Capacitor splash as soon as React is mounted + painted, so
// the native splash fades straight into our React SplashScreen without a
// double-flash. Safe to call outside Capacitor — it just does nothing.
export function hideNativeSplash() {
  const cap = nativePlatform();
  if (!cap) return;
  const Splash = cap.Plugins?.SplashScreen;
  if (!Splash) return;
  // Give one frame for the WebView to paint, then hide.
  requestAnimationFrame(() => Splash.hide().catch(() => { /* noop */ }));
}

export function setupCapacitorIntegrations() {
  wireAndroidBackButton();
  hideNativeSplash();
}
