"use client";

import { useEffect, useRef, useState } from "react";
import { Chapter } from "@/lib/types";
import { PaletteProvider } from "@/components/effects/PaletteProvider";
import { SimulationSeam } from "@/components/effects/SimulationSeam";
import { ChapterArt } from "@/components/reading/ChapterArt";
import { ContentBlockRenderer } from "@/components/reading/ContentBlockRenderer";
import { Header } from "@/components/navigation/Header";
import { ProgressBar } from "@/components/navigation/ProgressBar";
import { ChapterNav } from "@/components/navigation/ChapterNav";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { AmbientToggle } from "@/components/audio/AmbientToggle";

export function ChapterPageClient({
  chapter,
  prevChapter,
  nextChapter,
}: {
  chapter: Chapter;
  prevChapter?: Chapter;
  nextChapter?: Chapter;
}) {
  const { doorRevealed, setChapterProgress, completeChapter } = useReadingProgress();
  const artRef = useRef<HTMLDivElement>(null);
  const [audioSticky, setAudioSticky] = useState(true);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setChapterProgress(chapter.slug, progress);
      if (progress > 0.95) {
        completeChapter(chapter.slug);
      }

      // Keep audio bar sticky until user scrolls past the artwork
      if (artRef.current) {
        const artBottom = artRef.current.getBoundingClientRect().bottom;
        setAudioSticky(artBottom > 0);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapter.slug, setChapterProgress, completeChapter]);

  return (
    <PaletteProvider theme={chapter.theme}>
      <SimulationSeam intensity={chapter.glitchIntensity} />
      <Header doorRevealed={doorRevealed} />

      <div
        className={`flex items-center justify-between px-6 py-2 border-b border-[var(--border)] bg-[var(--bg)] z-40 transition-opacity duration-300 ${
          audioSticky ? "sticky top-[49px] opacity-100" : "opacity-0 pointer-events-none h-0 overflow-hidden border-0 py-0"
        }`}
      >
        <AudioPlayer chapterNumber={chapter.number} />
        <AmbientToggle chapterNumber={chapter.number} />
      </div>

      <div ref={artRef}>
        <ChapterArt
          artPath={chapter.artPath}
          chapterNumber={chapter.number}
          title={chapter.title}
        />
      </div>

      <main className="max-w-[640px] mx-auto px-6 py-12 pb-24">
        {chapter.blocks.map((block, index) => (
          <ContentBlockRenderer
            key={index}
            block={block}
            index={index}
            glitchIntensity={chapter.glitchIntensity}
          />
        ))}

        <ChapterNav prev={prevChapter} next={nextChapter} />
      </main>

      <ProgressBar
        accuracyDisplay={chapter.accuracyDisplay}
        shepherdsAwake={chapter.shepherdsAwake}
        chapterNumber={chapter.number}
      />
    </PaletteProvider>
  );
}
