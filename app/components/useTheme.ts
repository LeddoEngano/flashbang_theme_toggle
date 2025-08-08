"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

export type UseThemeOptions = {
    storageKey?: string;
    defaultTheme?: ThemeMode;
};

export function useTheme(options: UseThemeOptions = {}) {
    const { storageKey = "flashbang-theme", defaultTheme = "dark" } = options;
    const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);

    useEffect(() => {
        const root = document.documentElement;
        try {
            const persisted = localStorage.getItem(storageKey) as ThemeMode | null;
            const initial = persisted ?? (root.classList.contains("dark") ? "dark" : defaultTheme);
            root.classList.toggle("dark", initial === "dark");
            setThemeState(initial);
        } catch {
            const initial = root.classList.contains("dark") ? "dark" : defaultTheme;
            root.classList.toggle("dark", initial === "dark");
            setThemeState(initial);
        }
    }, [defaultTheme, storageKey]);

    const setTheme = useCallback(
        (next: ThemeMode) => {
            const root = document.documentElement;
            root.classList.toggle("dark", next === "dark");
            try {
                localStorage.setItem(storageKey, next);
            } catch { }
            setThemeState(next);
        },
        [storageKey]
    );

    const toggle = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [setTheme, theme]);

    return { theme, isDark: theme === "dark", setTheme, toggle } as const;
}


