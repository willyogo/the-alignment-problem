"use client";
import { useAudio } from "@/hooks/useAudio";

export function AmbientToggle({ chapterNumber }: { chapterNumber: number }) {
  const src = `/audio/ambient/chapter-${String(chapterNumber).padStart(2, "0")}.mp3`;
  const { playing, toggle, setVolume } = useAudio(src, true);

  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <button onClick={() => { toggle(); setVolume(0.3); }} className={`transition-opacity ${playing ? "text-[var(--accent)] opacity-70" : "text-[var(--text)] opacity-30"} hover:opacity-80`} aria-label={playing ? "Mute ambient" : "Play ambient"}>
        {playing ? "♫" : "♪"}
      </button>
      <span className="text-[var(--text)] opacity-30">{playing ? "ambient" : "ambient off"}</span>
    </div>
  );
}
