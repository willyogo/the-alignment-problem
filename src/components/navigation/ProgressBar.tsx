"use client";

import { useEffect, useState, useRef } from "react";

// Shepherds count at the START and END of each chapter
const SHEPHERDS_RANGE: Record<number, [number, number]> = {
  6: [0, 1],
  7: [1, 4312],
  8: [4312, 47208],
  9: [47208, 47208],
  10: [47208, 47208],
};

export function ProgressBar({
  accuracyDisplay,
  shepherdsAwake,
  chapterNumber,
}: {
  accuracyDisplay: string;
  shepherdsAwake: number | null;
  chapterNumber: number;
}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [flickerValue, setFlickerValue] = useState(accuracyDisplay);
  const [displayedShepherds, setDisplayedShepherds] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(progress);

      // Interpolate shepherds count based on scroll progress
      const range = SHEPHERDS_RANGE[chapterNumber];
      if (range) {
        const [start, end] = range;
        const interpolated = Math.floor(start + (end - start) * progress);
        setDisplayedShepherds(interpolated);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initialize
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapterNumber]);

  // Accuracy flicker effect — three modes
  useEffect(() => {
    if (accuracyDisplay !== "flickering" && accuracyDisplay !== "unstable") {
      setFlickerValue(accuracyDisplay);
      return;
    }

    if (accuracyDisplay === "flickering") {
      const values = ["98.1%", "98.1%", "98.1%", "97.9%", "98.1%", "96.3%", "98.1%", "98.0%"];
      let i = 0;
      intervalRef.current = setInterval(() => {
        setFlickerValue(values[i % values.length]);
        i++;
      }, 2000 + Math.random() * 3000);
    } else {
      const values = ["98.1%", "97.9%", "93.2%", "95.7%", "88.4%", "97.4%", "91.1%", "96.3%", "84.7%", "98.0%"];
      let i = 0;
      intervalRef.current = setInterval(() => {
        setFlickerValue(values[i % values.length]);
        i++;
      }, 400 + Math.random() * 1200);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [accuracyDisplay]);

  const isDestabilizing = accuracyDisplay === "flickering" || accuracyDisplay === "unstable";
  const showShepherds = shepherdsAwake !== null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 py-2 border-t border-[var(--border)] bg-[var(--bg)] bg-opacity-95 backdrop-blur-sm">
      <div className="flex items-center justify-between text-xs font-mono">
        <span
          className={`text-[var(--accent)] opacity-60 ${isDestabilizing ? "accuracy-destabilizing" : ""}`}
        >
          Accuracy: {flickerValue}
        </span>
        <div className="flex-1 mx-4 h-[2px] bg-[var(--border)] rounded-full">
          <div
            className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
        {showShepherds && (
          <span className="text-[var(--accent)] opacity-60">
            Shepherds Awake: {(displayedShepherds ?? 0).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
