"use client";
import Link from "next/link";
import Image from "next/image";
import { chapters } from "@/data/chapters";
import { useReadingProgress } from "@/hooks/useReadingProgress";

export function LandingClient() {
  const { readingProgress, chaptersCompleted, hydrated } = useReadingProgress();

  return (
    <section className="max-w-2xl mx-auto px-6 py-24">
      <h2 className="text-xs tracking-[3px] text-[var(--text)] opacity-30 uppercase mb-12 font-sans">Chapters</h2>
      <div className="space-y-6">
        {chapters.map((chapter) => {
          const progress = hydrated ? readingProgress[chapter.slug] || 0 : 0;
          const completed = hydrated ? chaptersCompleted.includes(chapter.slug) : false;
          return (
            <Link key={chapter.slug} href={`/chapter/${chapter.slug}`} className="block group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0 opacity-40 group-hover:opacity-70 transition-opacity">
                  <Image src={chapter.artPath} alt="" fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs font-mono text-[var(--text)] opacity-20">{String(chapter.number).padStart(2, "0")}</span>
                    <span className="text-lg font-serif text-[var(--text)] opacity-70 group-hover:opacity-100 group-hover:text-[var(--accent)] transition-all">{chapter.title}</span>
                    {completed && <span className="text-xs text-[var(--accent)] opacity-40 ml-auto">&#10003;</span>}
                  </div>
                  {progress > 0 && !completed && (
                    <div className="mt-2 ml-7 h-[1px] bg-[var(--border)]">
                      <div className="h-full bg-[var(--accent)] opacity-30" style={{ width: `${progress * 100}%` }} />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
