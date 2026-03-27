"use client";

import { useState } from "react";

export function DualLayerText({
  text,
  metadata,
  glitchIntensity,
}: {
  text: string;
  metadata: string;
  glitchIntensity: number;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <p
      className={`text-base leading-relaxed mb-6 relative cursor-pointer transition-all duration-500 ${
        glitchIntensity > 0.1 ? "glitch-text" : ""
      }`}
      style={{ "--glitch-intensity": glitchIntensity } as React.CSSProperties}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      onClick={() => setRevealed((prev) => !prev)}
    >
      <span
        className="transition-opacity duration-500"
        style={{ opacity: revealed ? 0.4 : 1 }}
      >
        {text}
      </span>
      <span
        className="absolute inset-0 font-mono text-xs leading-relaxed text-[var(--accent)] transition-opacity duration-500 flex items-center"
        style={{
          opacity: revealed ? 0.9 : 0,
          background: revealed ? `${metadata.includes("ERROR") ? "rgba(255,0,0,0.05)" : "rgba(var(--accent), 0.05)"}` : "transparent",
          padding: "8px 12px",
          borderRadius: "4px",
        }}
      >
        {metadata}
      </span>
      {!revealed && (
        <span className="absolute -bottom-1 left-0 right-0 h-px bg-[var(--accent)] opacity-20 border-b border-dotted border-[var(--accent)]" />
      )}
    </p>
  );
}
