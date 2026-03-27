export function SpecDocument({ content }: { content: string }) {
  return (
    <div className="my-8 bg-[#0c0c0c] border border-[#333] rounded p-6 max-h-64 overflow-y-auto">
      <div className="text-[10px] tracking-[2px] text-[#555] uppercase mb-4 font-sans">CLASSIFIED — INTERNAL USE ONLY</div>
      <div className="font-sans text-sm text-[#999] leading-relaxed whitespace-pre-wrap">{content}</div>
    </div>
  );
}
