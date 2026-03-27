import Link from "next/link";

export function TheDoor() {
  return (
    <Link
      href="/door"
      className="text-[var(--text)] opacity-25 hover:opacity-40 transition-opacity"
      aria-label="The Door"
      title=""
    >
      <svg width="14" height="16" viewBox="0 0 14 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="1" y="1" width="10" height="14" rx="0.5" />
        <line x1="4" y1="1" x2="3" y2="15" />
        <circle cx="8" cy="8" r="0.8" fill="currentColor" />
      </svg>
    </Link>
  );
}
