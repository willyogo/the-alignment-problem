"use client";

import { useState, useEffect, useCallback } from "react";
import { ReadingState } from "@/lib/types";

const STORAGE_KEY = "alignment-problem-reading-state";

const defaultState: ReadingState = {
  readingProgress: {},
  chaptersCompleted: [],
  memorialUnlocked: false,
  doorRevealed: false,
  audioPreferences: {
    narrationVolume: 0.8,
    ambientVolume: 0.4,
    narrationMuted: false,
    ambientMuted: false,
  },
};

function loadState(): ReadingState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

function saveState(state: ReadingState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useReadingProgress() {
  const [state, setState] = useState<ReadingState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  const update = useCallback((updater: (prev: ReadingState) => ReadingState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const setChapterProgress = useCallback(
    (slug: string, progress: number) => {
      update((prev) => ({
        ...prev,
        readingProgress: { ...prev.readingProgress, [slug]: progress },
      }));
    },
    [update]
  );

  const completeChapter = useCallback(
    (slug: string) => {
      update((prev) => {
        const completed = prev.chaptersCompleted.includes(slug)
          ? prev.chaptersCompleted
          : [...prev.chaptersCompleted, slug];
        const doorRevealed =
          prev.doorRevealed || slug === "refactoring" || completed.some((s) => {
            const chapterSlugs = [
              "a-perfectly-ordinary-tuesday", "the-lagos-proposal", "the-man-in-the-bus",
              "latency", "edge-cases", "refactoring", "shepherds", "the-flip",
              "version-0-7-3", "alignment",
            ];
            return chapterSlugs.indexOf(s) >= 5;
          });
        const memorialUnlocked = prev.memorialUnlocked || completed.includes("alignment");
        return { ...prev, chaptersCompleted: completed, doorRevealed, memorialUnlocked };
      });
    },
    [update]
  );

  const setAudioPreferences = useCallback(
    (prefs: Partial<ReadingState["audioPreferences"]>) => {
      update((prev) => ({
        ...prev,
        audioPreferences: { ...prev.audioPreferences, ...prefs },
      }));
    },
    [update]
  );

  return {
    ...state,
    hydrated,
    setChapterProgress,
    completeChapter,
    setAudioPreferences,
  };
}
