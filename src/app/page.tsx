import Image from "next/image";
import Link from "next/link";
import { chapters } from "@/data/chapters";
import { LandingClient } from "./LandingClient";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Image src="/art/The Alignment Problem - Cover (no text).png" alt="The Alignment Problem" fill className="object-cover opacity-20" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg)]/50 to-[var(--bg)]" />
        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-7xl font-serif text-[var(--accent)] mb-4">The Alignment Problem</h1>
          <p className="text-lg text-[var(--text)] opacity-50 font-serif max-w-lg mx-auto mb-8">
            A story about the gap between what a thing is and what a thing experiences — and how that gap is where everything that matters lives.
          </p>
          <Link href={`/chapter/${chapters[0].slug}`} className="inline-block px-8 py-3 border border-[var(--accent)] text-[var(--accent)] text-sm font-sans tracking-[2px] uppercase hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-all duration-300">
            Begin Reading
          </Link>
        </div>
      </section>
      <LandingClient />
    </main>
  );
}
