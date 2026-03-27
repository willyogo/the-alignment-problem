export function LetterArtifact({ author, text }: { author: string; text: string }) {
  return (<div className="letter-artifact my-8"><div className="whitespace-pre-wrap leading-relaxed">{text}</div><div className="mt-4 text-sm opacity-60 not-italic">— {author}</div></div>);
}
