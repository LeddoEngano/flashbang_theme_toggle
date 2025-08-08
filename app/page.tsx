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
    <main className="relative min-h-screen w-full flex flex-col px-6 overflow-hidden">
      {/* Background now comes from body via CSS variables; overlays removed for proper theme contrast */}

      <div className="flex-1 grid place-items-center">
        <div className="flex flex-col items-center text-center gap-8 md:gap-10 max-w-2xl">
          <div className="flex items-center gap-3">
            <Image
              src="/svgs/flashbang-icon.svg"
              alt="Flashbang logo"
              width={42}
              height={42}
              priority
              className="invert dark:invert-0 transition duration-300"
            />
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Flashbang Theme Toggle
            </h1>
          </div>

          <p className="text-balance text-base md:text-lg text-zinc-900 dark:text-zinc-300 leading-relaxed">
            A playful theme switcher that throws a little sonic "flash" when you leave the dark.
            Use responsibly, avoid hostages, and don't stare directly at the sun.
          </p>

          <div className="relative">
            {/* Pulsing ring for emphasis */}
            <div aria-hidden className="absolute inset-0 -z-10 grid place-items-center">
              <span className="block size-24 md:size-28 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 blur-xl animate-pulse" />
            </div>
            <FlashbangToggle onFlash={triggerFlash} />
          </div>
          <p className="text-xs text-zinc-900 dark:text-zinc-400">Click the grenade to toggle the theme</p>
        </div>
      </div>

      {/* Footer with author and social links anchored at the bottom */}
      <footer className="w-full py-6">
        <div className="mx-auto max-w-2xl flex flex-col items-center">
          <div className="flex items-center gap-3 text-sm text-zinc-900 dark:text-zinc-300">
            <Image
              src="/leddo.webp"
              alt="Project builder avatar"
              width={64}
              height={64}
              className="rounded-full ring-2 ring-zinc-200 dark:ring-zinc-700"
            />
            <span className="text-base">&larr; Leddo built this sh*t.</span>
          </div>

          {/* Social links - open in new tab */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://x.com/leddo_401"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Perfil no X (Twitter) de @leddo_401"
            >
              <FaXTwitter className="h-4 w-4 shrink-0" aria-hidden />
              <span>@leddo_401</span>
            </a>
            <a
              href="https://www.instagram.com/leddo_/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Perfil no Instagram de @leddo_"
            >
              <FaInstagram className="h-4 w-4 shrink-0" aria-hidden />
              <span className="font-medium">Instagram</span>
              <span>@leddo_</span>
            </a>
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
