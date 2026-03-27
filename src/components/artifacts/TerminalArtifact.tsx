"use client";
import { useEffect, useRef, useState } from "react";

function TypewriterLine({ text, speed = 40, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else { clearInterval(interval); setDone(true); onComplete?.(); }
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);
  return <span>{displayed}{!done && <span className="blink-cursor" />}</span>;
}

export function TerminalArtifact({ lines }: { lines: Array<{ speaker: string; text: string; typing?: boolean }> }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) { hasAnimated.current = true; setVisibleLines(1); }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  function handleLineComplete() {
    if (visibleLines < lines.length) { setTimeout(() => setVisibleLines((v) => v + 1), 300); }
    else { setAllDone(true); }
  }

  return (
    <div ref={ref} className="crt-terminal my-8">
      <div className="text-[10px] text-green-900 mb-3 opacity-60 font-mono">TERMINAL SESSION</div>
      {lines.slice(0, visibleLines).map((line, i) => {
        const isOwen = line.speaker === "owen";
        const isLast = i === visibleLines - 1;
        return (
          <div key={i} className="mb-2">
            {!isOwen && <span className="text-green-800 text-sm font-mono">&gt; </span>}
            <span className={`font-mono text-sm ${isOwen ? "crt-glow" : "text-green-600"}`}>
              {line.typing && isLast && !allDone ? <TypewriterLine text={line.text} speed={40} onComplete={handleLineComplete} /> : line.text}
            </span>
          </div>
        );
      })}
      {allDone && <div className="mt-2"><span className="blink-cursor crt-glow" /></div>}
    </div>
  );
}
