"use client";
import { useAudio } from "@/hooks/useAudio";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const AUTOPLAY_KEY = "alignment-problem-autoplay-narration";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ chapterNumber, nextChapterSlug }: { chapterNumber: number; nextChapterSlug?: string }) {
  const router = useRouter();
  const [speed, setSpeedState] = useState(1);

  const handleEnded = useCallback(() => {
    if (nextChapterSlug) {
      sessionStorage.setItem(AUTOPLAY_KEY, "true");
      router.push(`/chapter/${nextChapterSlug}`);
    }
  }, [nextChapterSlug, router]);

  const src = `/audio/narration/chapter-${String(chapterNumber).padStart(2, "0")}.mp3`;
  const { playing, currentTime, duration, toggle, play, seek, setSpeed } = useAudio(src, false, handleEnded);
  const hasAutoPlayed = useRef(false);

  // Auto-play if navigated here from a finished chapter
  useEffect(() => {
    if (hasAutoPlayed.current) return;
    hasAutoPlayed.current = true;
    try {
      const shouldAutoPlay = sessionStorage.getItem(AUTOPLAY_KEY);
      if (shouldAutoPlay === "true") {
        sessionStorage.removeItem(AUTOPLAY_KEY);
        // Small delay to let the audio element load
        setTimeout(() => play(), 500);
      }
    } catch {}
  }, [play]);

  function cycleSpeed() {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeedState(next);
    setSpeed(next);
  }

  return (
    <div className="flex items-center gap-3 text-xs font-mono">
      <button onClick={toggle} className="text-[var(--accent)] opacity-70 hover:opacity-100 transition-opacity" aria-label={playing ? "Pause narration" : "Play narration"}>
        {playing ? "⏸" : "▶"}
      </button>
      <span className="text-[var(--text)] opacity-40 w-10">{formatTime(currentTime)}</span>
      <input type="range" min={0} max={duration || 0} value={currentTime} onChange={(e) => seek(Number(e.target.value))} className="flex-1 h-1 accent-[var(--accent)] bg-[var(--border)] rounded-full appearance-none cursor-pointer" />
      <span className="text-[var(--text)] opacity-40 w-10">{formatTime(duration)}</span>
      <button onClick={cycleSpeed} className="text-[var(--text)] opacity-40 hover:opacity-70 transition-opacity w-8 text-center">{speed}x</button>
    </div>
  );
}
