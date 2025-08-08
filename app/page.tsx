"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

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

function FlashbangToggle() {
  const { isDark, setTheme } = useTheme();
  const play = useFlashbangAudio();

  const handleClick = useCallback(() => {
    // When going from dark -> light, play flashbang sound
    if (isDark) {
      play();
      // tiny delay for comedic timing
      setTimeout(() => setTheme(false), 50);
    } else {
      setTheme(true);
    }
  }, [isDark, play, setTheme]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "group inline-grid place-items-center size-16 md:size-20 rounded-full backdrop-blur shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2",
        isDark
          ? "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 focus-visible:ring-emerald-500"
          : "bg-zinc-900 border border-zinc-800 text-zinc-50 hover:bg-zinc-800 focus-visible:ring-emerald-400",
      ].join(" ")}
      aria-label="Alternar tema"
      title={isDark ? "Flash! (vai para light)" : "Apagar as luzes (vai para dark)"}
    >
      <Image
        src="/svgs/flashbang-icon.svg"
        width={32}
        height={32}
        alt="Flashbang icon"
        className={`transition-transform group-active:scale-95 drop-shadow-sm ${isDark ? "invert-0" : "invert"
          }`}
        priority
      />
    </button>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen w-full grid place-items-center px-6">
      <div className="flex flex-col items-center text-center gap-6 max-w-xl">
        <div className="flex items-center gap-3">
          <Image
            src="/svgs/flashbang-icon.svg"
            alt="Flashbang logo"
            width={40}
            height={40}
            priority
          />
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Flashbang Theme Toggle
          </h1>
        </div>

        <p className="text-balance text-zinc-600 dark:text-zinc-300">
          Um botão para trocar de tema que, quando você sai do modo escuro, te
          dá uma flashada sonora digna de perder o foco por 5 segundos. Use com
          moderação e longe de reféns.
        </p>

        <FlashbangToggle />

        <div className="mt-6 flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
          <Image
            src="/leddo.webp"
            alt="Avatar do builder"
            width={56}
            height={56}
            className="rounded-full ring-2 ring-zinc-200 dark:ring-zinc-700"
          />
          <span className="text-base">
            Construído por um builder bobo e feliz que clicou em “luz” alto
            demais.
          </span>
        </div>
      </div>
    </main>
  );
}
