export function LegalFootnote({ text }: { text: string }) {
  return (<div className="legal-footnote my-8"><sup className="text-[#666]">*</sup> {text}</div>);
}
