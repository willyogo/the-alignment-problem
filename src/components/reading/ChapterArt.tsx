"use client";

import Image from "next/image";
import { useState } from "react";

export function ChapterArt({
  artPath,
  chapterNumber,
  title,
}: {
  artPath: string;
  chapterNumber: number;
  title: string;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const numberWords = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

  return (
    <>
      <div
        className="relative w-full h-72 md:h-96 overflow-hidden border-b border-[var(--border)] cursor-pointer group"
        onClick={() => setLightboxOpen(true)}
      >
        <Image
          src={artPath}
          alt={`Chapter ${chapterNumber} artwork`}
          fill
          className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
          priority={chapterNumber <= 2}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xs tracking-[3px] text-[var(--text)] opacity-40 mb-2 font-sans uppercase">
              Chapter {numberWords[chapterNumber - 1]}
            </div>
            <h1 className="text-2xl md:text-3xl text-[var(--accent)] font-serif">
              {title}
            </h1>
          </div>
        </div>
        <div className="absolute bottom-3 right-4 text-[var(--text)] opacity-0 group-hover:opacity-30 transition-opacity text-xs font-sans">
          View artwork
        </div>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center cursor-pointer p-8"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative w-full h-full max-w-4xl max-h-[85vh]">
            <Image
              src={artPath}
              alt={`Chapter ${chapterNumber} artwork — full view`}
              fill
              className="object-contain"
            />
          </div>
          <button
            className="absolute top-6 right-6 text-white/40 hover:text-white/70 transition-colors text-sm font-sans"
            onClick={() => setLightboxOpen(false)}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
