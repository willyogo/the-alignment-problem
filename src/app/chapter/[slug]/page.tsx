import { notFound } from "next/navigation";
import { chapters, getChapterBySlug } from "@/data/chapters";
import { ChapterPageClient } from "./ChapterPageClient";

export function generateStaticParams() {
  return chapters.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) return { title: "Not Found" };
  return {
    title: `Ch. ${chapter.number}: ${chapter.title} — The Alignment Problem`,
  };
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) notFound();

  const prevChapter = chapters.find((c) => c.number === chapter.number - 1);
  const nextChapter = chapters.find((c) => c.number === chapter.number + 1);

  return (
    <ChapterPageClient
      chapter={chapter}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
    />
  );
}
