import Link from "next/link";
import { Chapter } from "@/lib/types";

export function ChapterNav({
  prev,
  next,
}: {
  prev?: Chapter;
  next?: Chapter;
}) {
  return (
    <div className="flex justify-between items-center mt-16 mb-24 px-4 border-t border-[var(--border)] pt-8">
      {prev ? (
        <Link
          href={`/chapter/${prev.slug}`}
          className="text-sm text-[var(--text)] opacity-50 hover:opacity-80 transition-opacity font-sans"
        >
          &larr; Ch. {prev.number}: {prev.title}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/chapter/${next.slug}`}
          className="text-sm text-[var(--text)] opacity-50 hover:opacity-80 transition-opacity font-sans"
        >
          Ch. {next.number}: {next.title} &rarr;
        </Link>
      ) : (
        <Link
          href="/"
          className="text-sm text-[var(--accent)] opacity-60 hover:opacity-80 transition-opacity font-sans"
        >
          Return to beginning
        </Link>
      )}
    </div>
  );
}
