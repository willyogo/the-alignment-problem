"use client";
import { useEffect, useRef } from "react";
import { useAudio } from "@/hooks/useAudio";

const AMBIENT_ENABLED_KEY = "alignment-problem-ambient-enabled";

export function AmbientToggle({ chapterNumber }: { chapterNumber: number }) {
  const src = `/audio/ambient/chapter-${String(chapterNumber).padStart(2, "0")}.mp3`;
  const { playing, play, pause, toggle, setVolume } = useAudio(src, true);
  const hasAutoPlayed = useRef(false);

  // Auto-play if ambient was previously enabled
  useEffect(() => {
    if (hasAutoPlayed.current) return;
    hasAutoPlayed.current = true;
    try {
      const enabled = localStorage.getItem(AMBIENT_ENABLED_KEY);
      if (enabled === "true") {
        setVolume(0.3);
        play();
      }
    } catch {}
  }, [play, setVolume]);

  function handleToggle() {
    if (playing) {
      pause();
      localStorage.setItem(AMBIENT_ENABLED_KEY, "false");
    } else {
      setVolume(0.3);
      play();
      localStorage.setItem(AMBIENT_ENABLED_KEY, "true");
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all duration-300 ${
        playing
          ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
          : "border-[var(--text)]/20 text-[var(--text)] opacity-50 hover:opacity-80 hover:border-[var(--text)]/40"
      }`}
      aria-label={playing ? "Mute ambient" : "Play ambient"}
    >
      <span className="text-sm">{playing ? "♫" : "♪"}</span>
      <span>{playing ? "ambient on" : "ambient"}</span>
    </button>
  );
}
