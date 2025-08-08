"use client";

import { useCallback, useEffect, useRef } from "react";

export function useFlashbangAudio(src: string = "/sounds/flashbang.mp3") {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio(src);
        audio.preload = "auto";
        audioRef.current = audio;
        return () => {
            audioRef.current = null;
        };
    }, [src]);

    const play = useCallback(async () => {
        try {
            if (!audioRef.current) return;
            audioRef.current.currentTime = 0;
            await audioRef.current.play();
        } catch {
        }
    }, []);

    return play;
}


