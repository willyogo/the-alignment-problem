"use client";

import Link from "next/link";
import { chapters } from "@/data/chapters";
import { useReadingProgress } from "@/hooks/useReadingProgress";

export function TableOfContents({ onClose }: { onClose: () => void }) {
  const { readingProgress, chaptersCompleted } = useReadingProgress();

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-sm bg-[var(--bg)] border-l border-[var(--border)] p-8 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg text-[var(--accent)] font-serif">Table of Contents</h2>
          <button onClick={onClose} className="text-[var(--text)] opacity-40 hover:opacity-70 text-sm font-sans">
            Close
          </button>
        </div>
        <nav>
          <ul className="space-y-4">
            {chapters.map((chapter) => {
              const progress = readingProgress[chapter.slug] || 0;
              const completed = chaptersCompleted.includes(chapter.slug);
              return (
                <li key={chapter.slug}>
                  <Link
                    href={`/chapter/${chapter.slug}`}
                    onClick={onClose}
                    className="block group"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="text-xs font-mono text-[var(--text)] opacity-30 w-4">
                        {chapter.number}
                      </span>
                      <span className="text-sm text-[var(--text)] opacity-70 group-hover:opacity-100 transition-opacity font-serif">
                        {chapter.title}
                      </span>
                      {completed && (
                        <span className="text-xs text-[var(--accent)] opacity-40 ml-auto">&#10003;</span>
                      )}
                    </div>
                    {progress > 0 && !completed && (
                      <div className="ml-7 mt-1 h-[1px] bg-[var(--border)] rounded-full">
                        <div
                          className="h-full bg-[var(--accent)] opacity-40 rounded-full"
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
