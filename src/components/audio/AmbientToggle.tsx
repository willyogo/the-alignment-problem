"use client";
import { useAudio } from "@/hooks/useAudio";

export function AmbientToggle({ chapterNumber }: { chapterNumber: number }) {
  const src = `/audio/ambient/chapter-${String(chapterNumber).padStart(2, "0")}.mp3`;
  const { playing, toggle, setVolume } = useAudio(src, true);

  return (
    <button
      onClick={() => { toggle(); setVolume(0.3); }}
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
