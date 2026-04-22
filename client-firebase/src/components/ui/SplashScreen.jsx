import { useEffect, useState } from 'react';

/**
 * Branded splash shown on initial app load. Fades out after ~1.2s so users
 * see the same logo treatment on web, desktop, and inside the Android APK
 * (Capacitor's native splash hands off to this React one on WebView ready).
 */
export default function SplashScreen({ duration = 1200 }) {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const hideT  = setTimeout(() => setVisible(false), duration);
    const unmnT  = setTimeout(() => setMounted(false), duration + 400); // after fade
    return () => { clearTimeout(hideT); clearTimeout(unmnT); };
  }, [duration]);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center
                  bg-ink-bg dark:bg-night-bg
                  transition-opacity duration-400 ease-out
                  ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <img
        src="/logo.png"
        alt=""
        className="w-24 h-24 rounded-full shadow-lg animate-fade-in"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      <div className="mt-5 text-center">
        <div className="text-xl font-semibold tracking-tight text-ink-text dark:text-night-text">
          Super Markting
        </div>
        <div className="mt-1 text-[12px] text-ink-muted dark:text-night-muted">
          loading your workspace…
        </div>
      </div>
    </div>
  );
}
