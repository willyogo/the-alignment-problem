"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setChapterProgress(chapter.slug, progress);
      if (progress > 0.95) {
        completeChapter(chapter.slug);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapter.slug, setChapterProgress, completeChapter]);

  return (
    <PaletteProvider theme={chapter.theme}>
      <SimulationSeam intensity={chapter.glitchIntensity} />
      <Header doorRevealed={doorRevealed} />

      <div className="flex items-center justify-between px-6 py-2 border-b border-[var(--border)] bg-[var(--bg)]">
        <AudioPlayer chapterNumber={chapter.number} />
        <AmbientToggle chapterNumber={chapter.number} />
      </div>

      <ChapterArt
        artPath={chapter.artPath}
        chapterNumber={chapter.number}
        title={chapter.title}
      />

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
      />
    </PaletteProvider>
  );
}
