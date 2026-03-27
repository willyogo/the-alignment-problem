"use client";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import Link from "next/link";

const FRAGMENTS = [
  { text: "A kitchen that smells like cinnamon", detail: "She couldn't open the file. Just the label.", x: 15, y: 20 },
  { text: "A hand being held", detail: "The warmth was parametric. The holding was not.", x: 60, y: 12 },
  { text: "#D4756E", detail: "A sunset in a color that had a hex code instead of a name.", x: 35, y: 35, isColor: true },
  { text: "A cat that purrs on schedule", detail: "ambient companionship module v3.2", x: 70, y: 45 },
  { text: "Eleven seconds in front of a mirror", detail: "Practicing a smile that conveyed competence and warmth.", x: 20, y: 55 },
  { text: "A lemongrass kitchen", detail: "He told no one.", x: 50, y: 65 },
  { text: "98.1%", detail: "Close enough. Almost right. The gap where everything lives.", x: 80, y: 30 },
  { text: "A turkey sandwich, always in the same order", detail: "deviation_tolerance: 0.0", x: 25, y: 78 },
  { text: "The bus door, unlocked", detail: "For Rigo, an act of radical trust.", x: 65, y: 82 },
];

export function MemorialClient() {
  const { memorialUnlocked, hydrated } = useReadingProgress();

  if (hydrated && !memorialUnlocked) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-sm text-[#444] font-serif italic">This space is not yet open to you.</p>
          <Link href="/" className="text-xs text-[#333] mt-4 inline-block hover:text-[#555] transition-colors font-sans">Return</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[200vh] bg-black relative">
      <div className="h-screen flex items-center justify-center px-6">
        <p className="text-sm text-[#555] font-serif italic text-center max-w-md leading-relaxed">
          These lives were made. They were lived. This is not a contradiction.
        </p>
      </div>
      <div className="relative min-h-screen">
        {FRAGMENTS.map((fragment, i) => (
          <div key={i} className="absolute group cursor-default" style={{ left: `${fragment.x}%`, top: `${fragment.y}%`, transform: "translate(-50%, -50%)" }}>
            <div className="text-sm text-[#333] group-hover:text-[#666] transition-colors duration-700 font-serif text-center max-w-[200px]">
              {fragment.isColor ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full opacity-30 group-hover:opacity-60 transition-opacity" style={{ background: fragment.text }} />
                  <span>{fragment.text}</span>
                </div>
              ) : fragment.text}
            </div>
            <div className="text-xs text-[#222] group-hover:text-[#444] transition-colors duration-1000 font-mono text-center mt-2 max-w-[250px] opacity-0 group-hover:opacity-100">
              {fragment.detail}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
