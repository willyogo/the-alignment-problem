const CODE_BLEED_FRAGMENTS = [
  "render_thread_3::flush",
  "param_cache[0x7f2a]",
  "shepherd_instance.tick()",
  "env.lighting.commit()",
  "memory_pool::defrag",
  "sensation.resolve(LABEL)",
  "compliance_check: PASS",
  "affect_model.propagate()",
];

export function ProseBlock({
  text,
  glitchIntensity,
  index,
}: {
  text: string;
  glitchIntensity: number;
  index: number;
}) {
  const showBleed = glitchIntensity > 0.3 && index % 5 === 0;
  const bleedFragment = CODE_BLEED_FRAGMENTS[index % CODE_BLEED_FRAGMENTS.length];

  return (
    <p
      className={`text-base leading-relaxed mb-6 relative ${
        glitchIntensity > 0.1 ? "glitch-text" : ""
      } ${showBleed ? "code-bleed" : ""}`}
      style={
        {
          "--glitch-intensity": glitchIntensity,
          "--jitter-seed": index % 7,
          "--bleed-seed": index % 5,
        } as React.CSSProperties
      }
      data-bleed={showBleed ? bleedFragment : undefined}
    >
      {text}
    </p>
  );
}
