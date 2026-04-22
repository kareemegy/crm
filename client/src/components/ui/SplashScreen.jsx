import { useEffect, useState } from 'react';

/**
 * Branded splash shown on initial app load. Falls back to a red TIK-colored
 * monogram circle if /logo.png isn't in public/ yet — so the splash is
 * always visible and on-brand, never a blank screen.
 */
export default function SplashScreen({ duration = 2000 }) {
  const [visible,   setVisible]   = useState(true);
  const [mounted,   setMounted]   = useState(true);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    const hideT = setTimeout(() => setVisible(false), duration);
    const unmT  = setTimeout(() => setMounted(false), duration + 400);
    return () => { clearTimeout(hideT); clearTimeout(unmT); };
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
      {imgFailed ? (
        <div className="w-24 h-24 rounded-full flex items-center justify-center
                        bg-gradient-to-br from-rose-500 to-rose-600
                        shadow-lg shadow-rose-500/30
                        text-white text-3xl font-black tracking-wide
                        animate-fade-in">
          TIK
        </div>
      ) : (
        <img
          src="/logo.png"
          alt=""
          className="w-24 h-24 rounded-full shadow-lg animate-fade-in"
          onError={() => setImgFailed(true)}
        />
      )}

      <div className="mt-5 text-center animate-fade-in">
        <div className="text-2xl font-semibold tracking-tight text-ink-text dark:text-night-text">
          Super Markting
        </div>
        <div className="mt-1.5 text-[12px] text-ink-muted dark:text-night-muted">
          loading your workspace…
        </div>
      </div>
    </div>
  );
}
