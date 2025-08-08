"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaXTwitter, FaInstagram } from "react-icons/fa6";

// Small helper to compose class names safely
function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

// Flash timings (keep in sync with CSS arbitrary duration)
const FLASH_HOLD_MS = 1000; // keep screen fully white a bit longer
const FLASH_FADE_MS = 3500; // matches `duration-[3500ms]` class below
const FLASH_TOTAL_MS = FLASH_HOLD_MS + FLASH_FADE_MS;

/**
 * Preloads the flashbang audio and returns a play() function.
 * Resets currentTime for rapid consecutive plays after user gesture.
 */
function useFlashbangAudio() {
  // Preload audio for immediate playback with user gesture
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/sounds/flashbang.mp3");
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      audioRef.current = null;
    };
  }, []);

  const play = useCallback(async () => {
    try {
      if (!audioRef.current) return;
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch {
      // Ignore autoplay issues
    }
  }, []);

  return play;
}

/**
 * Manages theme using `.dark` on <html> with localStorage persistence.
 */
function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    // sync on mount
    const root = document.documentElement;
    const persisted = localStorage.getItem("flashbang-theme");
    const dark = persisted ? persisted === "dark" : root.classList.contains("dark");
    root.classList.toggle("dark", dark);
    setIsDark(dark);
  }, []);

  const setTheme = useCallback((dark: boolean) => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    localStorage.setItem("flashbang-theme", dark ? "dark" : "light");
    setIsDark(dark);
  }, []);

  const toggle = useCallback(() => setTheme(!isDark), [isDark, setTheme]);

  return { isDark, setTheme, toggle } as const;
}

type FlashbangToggleProps = {
  onFlash?: () => void;
};

/**
 * Theme toggle button that plays a flash gag when switching dark -> light.
 */
function FlashbangToggle({ onFlash }: FlashbangToggleProps) {
  const { isDark, setTheme } = useTheme();
  const play = useFlashbangAudio();
  const [isFlashing, setIsFlashing] = useState(false);

  const handleClick = useCallback(() => {
    // Prevent multiple clicks during flash sequence
    if (isFlashing) return;

    // When going from dark -> light, play flashbang sound
    if (isDark) {
      setIsFlashing(true);
      play();
      // trigger visual flash overlay
      onFlash?.();
      // tiny delay for comedic timing
      setTimeout(() => {
        setTheme(false);
        // Re-enable button after theme change + flash animation
        setTimeout(() => setIsFlashing(false), FLASH_TOTAL_MS);
      }, 50);
    } else {
      setTheme(true);
    }
  }, [isDark, isFlashing, onFlash, play, setTheme]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isFlashing}
      aria-pressed={!isDark}
      aria-label="Alternar tema"
      title={isDark ? "Flash! (vai para light)" : "Apagar as luzes (vai para dark)"}
      className={cx(
        "group inline-grid place-items-center size-16 md:size-20 rounded-full backdrop-blur shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
        isDark
          ? "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 focus-visible:ring-emerald-500"
          : "bg-zinc-900 border border-zinc-800 text-zinc-50 hover:bg-zinc-800 focus-visible:ring-emerald-400"
      )}
    >
      <Image
        src="/svgs/flashbang-icon.svg"
        width={48}
        height={48}
        alt="Flashbang icon"
        className={cx(
          "transition-transform group-active:scale-95 drop-shadow-sm",
          isDark ? "invert-0" : "invert"
        )}
        priority
      />
    </button>
  );
}

export default function Home() {
  // Controls visual white-out overlay when switching dark -> light
  const [showFlash, setShowFlash] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const { isDark } = useTheme();

  const triggerFlash = useCallback(() => {
    // Show overlay at full opacity, hold briefly, then transition to 0
    setShowFlash(true);
    setIsFading(false);
    // Use double rAF to ensure browser applies initial styles before transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Hold the white screen fully opaque before starting fade-out
        setTimeout(() => setIsFading(true), FLASH_HOLD_MS);
      });
    });
  }, []);

  return (
    <main className="relative min-h-screen w-full flex flex-col px-6 overflow-hidden pt-12 md:pt-16">
      {/* Background now comes from body via CSS variables; overlays removed for proper theme contrast */}

      {/* Top notch containing the title */}
      <div
        className={cx(
          "absolute top-4 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-[min(90vw,28rem)] rounded-b-[28px] bg-[color:var(--background)]",
          "border-x border-b border-[color:var(--border-subtle)]",
          "shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
        )}
      >
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-center justify-center gap-3 text-[color:var(--text-strong)]">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Flashbang Theme Toggle</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 grid place-items-center">
        <div className="flex flex-col items-center text-center gap-6 md:gap-8 max-w-3xl">
          <div className="relative">
            <div aria-hidden className="absolute inset-0 -z-10 grid place-items-center">
              <span className={cx(
                "block size-24 md:size-28 rounded-full blur-xl animate-pulse",
                isDark ? "bg-emerald-400/10" : "bg-emerald-500/10"
              )} />
            </div>
            <FlashbangToggle onFlash={triggerFlash} />
          </div>
          <p className="text-xs text-[color:var(--text-muted)]">Click the grenade to toggle the theme</p>
        </div>
      </div>

      {/* Footer: only the notch rising from the very bottom, containing the content */}
      <footer className="relative w-full pb-24">
        <div
          className={cx(
            "absolute bottom-2 left-1/2 -translate-x-1/2 translate-y-1/2",
            "w-[min(90vw,28rem)] rounded-t-[28px] bg-[color:var(--background)]",
            "border-x border-t border-[color:var(--border-subtle)]",
            "shadow-[0_-8px_20px_rgba(0,0,0,0.06)]"
          )}
        >
          <div className="px-4 pt-4 pb-17">
            <div className="flex items-center justify-between gap-4 text-sm text-[color:var(--text)]">
              <div className="flex items-center gap-3">
                <Image
                  src="/leddo.webp"
                  alt="Project builder avatar"
                  width={48}
                  height={48}
                  className={cx("rounded-full ring-2 ring-[color:var(--border-subtle)]")}
                />
                <span className="text-sm sm:text-base">&larr; Leddo built this sh*t.</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://x.com/leddo_401"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cx(
                    "inline-flex items-center justify-center size-8 rounded-full transition-colors border",
                    "border-[color:var(--border-subtle)] text-[color:var(--text)] hover:bg-[color:var(--hover-surface)]"
                  )}
                  aria-label="Perfil no X (Twitter) de @leddo_401"
                >
                  <FaXTwitter className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href="https://www.instagram.com/leddo_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cx(
                    "inline-flex items-center justify-center size-8 rounded-full transition-colors border",
                    "border-[color:var(--border-subtle)] text-[color:var(--text)] hover:bg-[color:var(--hover-surface)]"
                  )}
                  aria-label="Perfil no Instagram de @leddo_"
                >
                  <FaInstagram className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showFlash && (
        <div
          aria-hidden
          className={cx(
            "fixed inset-0 z-[9999] pointer-events-none bg-white",
            "transition-opacity duration-[3500ms] ease-out",
            isFading ? "opacity-0" : "opacity-100"
          )}
          onTransitionEnd={() => setShowFlash(false)}
        />
      )}
    </main>
  );
}
