"use client";

import "@/styles/glitch.css";

export function SimulationSeam({ intensity }: { intensity: number }) {
  if (intensity === 0) return null;

  return (
    <div
      className="simulation-seam"
      style={{ "--glitch-intensity": intensity } as React.CSSProperties}
    >
      <div className="scan-lines" />
    </div>
  );
}
