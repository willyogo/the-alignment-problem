"use client";

import { useEffect } from "react";
import { ChapterTheme } from "@/lib/types";

export function PaletteProvider({
  theme,
  children,
}: {
  theme: ChapterTheme;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg", theme.bg);
    root.style.setProperty("--text", theme.text);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-secondary", theme.accentSecondary);
    root.style.setProperty("--border", theme.border);
    root.style.setProperty("--glow", theme.glow);
  }, [theme]);

  return <>{children}</>;
}
