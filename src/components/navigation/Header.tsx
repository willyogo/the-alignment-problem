"use client";

import { useState } from "react";
import Link from "next/link";
import { TheDoor } from "./TheDoor";
import { TableOfContents } from "./TableOfContents";

export function Header({ doorRevealed }: { doorRevealed: boolean }) {
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--bg)] bg-opacity-95 backdrop-blur-sm">
        <Link href="/" className="text-xs tracking-[2px] text-[var(--text)] opacity-40 hover:opacity-70 transition-opacity font-sans uppercase">
          The Alignment Problem
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTocOpen(true)}
            className="text-xs text-[var(--text)] opacity-40 hover:opacity-70 transition-opacity font-sans"
            aria-label="Table of contents"
          >
            TOC
          </button>
          {doorRevealed && <TheDoor />}
        </div>
      </header>
      {tocOpen && <TableOfContents onClose={() => setTocOpen(false)} />}
    </>
  );
}
