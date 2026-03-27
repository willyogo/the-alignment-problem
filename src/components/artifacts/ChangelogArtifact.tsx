export function ChangelogArtifact({ version, sections }: { version: string; sections: Array<{ heading: string; items: string[] }> }) {
  return (
    <div className="crt-terminal my-8">
      <div className="text-[10px] text-green-900 mb-3 opacity-60 font-mono">RELEASE NOTES</div>
      <div className="crt-glow font-mono text-base mb-4">## OWEN v{version}</div>
      {sections.map((section, i) => (
        <div key={i} className="mb-4">
          <div className="crt-glow font-mono text-xs mb-2 opacity-80">{section.heading}</div>
          {section.items.map((item, j) => <div key={j} className="font-mono text-sm text-green-400 opacity-80 ml-4 mb-1">- {item}</div>)}
        </div>
      ))}
      <div className="mt-4"><span className="blink-cursor crt-glow" /></div>
    </div>
  );
}
