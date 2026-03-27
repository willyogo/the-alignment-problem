import Image from "next/image";

export function ChapterArt({
  artPath,
  chapterNumber,
  title,
}: {
  artPath: string;
  chapterNumber: number;
  title: string;
}) {
  const numberWords = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

  return (
    <div className="relative w-full h-48 md:h-64 overflow-hidden border-b border-[var(--border)]">
      <Image
        src={artPath}
        alt={`Chapter ${chapterNumber} artwork`}
        fill
        className="object-cover opacity-30"
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
    </div>
  );
}
