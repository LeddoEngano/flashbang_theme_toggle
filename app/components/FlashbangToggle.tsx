"use client";

import Image from "next/image";
import { FaMoon } from "react-icons/fa6";
import { useCallback, useState } from "react";
import { useTheme } from "../components/useTheme";
import { useFlashbangAudio } from "../components/useFlashbangAudio";

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

const FLASH_HOLD_MS = 1000;
const FLASH_FADE_MS = 3500;
export const FLASH_TOTAL_MS = FLASH_HOLD_MS + FLASH_FADE_MS;

export type FlashbangToggleProps = {
    onFlash?: () => void;
    className?: string;
    soundSrc?: string;
    storageKey?: string;
};

export function FlashbangToggle({ onFlash, className, soundSrc, storageKey }: FlashbangToggleProps) {
    const { isDark, setTheme } = useTheme({ storageKey });
    const play = useFlashbangAudio(soundSrc);
    const [isFlashing, setIsFlashing] = useState(false);

    const handleClick = useCallback(() => {
        if (isFlashing) return;
        if (isDark) {
            setIsFlashing(true);
            play();
            onFlash?.();
            setTimeout(() => {
                setTheme("light");
                setTimeout(() => setIsFlashing(false), FLASH_TOTAL_MS);
            }, 50);
        } else {
            setTheme("dark");
        }
    }, [isDark, isFlashing, onFlash, play, setTheme]);

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isFlashing}
            aria-pressed={!isDark}
            aria-label="Toggle theme"
            title={isDark ? "Flash! (switch to light)" : "Lights out (switch to dark)"}
            className={cx(
                "group inline-grid place-items-center size-16 md:size-20 rounded-full backdrop-blur shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
                isDark
                    ? "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 focus-visible:ring-emerald-500"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-50 hover:bg-zinc-800 focus-visible:ring-emerald-400",
                className
            )}
        >
            {isDark ? (
                <Image
                    src="/svgs/flashbang-icon.svg"
                    width={48}
                    height={48}
                    alt="Flashbang icon"
                    className="transition-transform group-active:scale-95 drop-shadow-sm invert-0"
                    priority
                />
            ) : (
                <FaMoon className="h-7 w-7 transition-transform group-active:scale-95 drop-shadow-sm" aria-hidden />
            )}
        </button>
    );
}

export default FlashbangToggle;


