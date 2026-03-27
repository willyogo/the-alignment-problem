import { ContentBlock } from "@/lib/types";
import { ProseBlock } from "./ProseBlock";
import { DualLayerText } from "./DualLayerText";
import { SoItGoes, AndThenItGoesOn } from "./SoItGoes";

export function ContentBlockRenderer({
  block,
  index,
  glitchIntensity,
}: {
  block: ContentBlock;
  index: number;
  glitchIntensity: number;
}) {
  switch (block.type) {
    case "prose":
      return <ProseBlock text={block.text} glitchIntensity={glitchIntensity} index={index} />;
    case "dual-layer":
      return <DualLayerText text={block.text} metadata={block.metadata} glitchIntensity={glitchIntensity} />;
    case "so-it-goes":
      return <SoItGoes />;
    case "and-then-it-goes-on":
      return <AndThenItGoesOn />;
    default:
      // Fallback for artifact types not yet implemented
      if ("text" in block && typeof block.text === "string") {
        return <ProseBlock text={block.text} glitchIntensity={glitchIntensity} index={index} />;
      }
      if ("body" in block && typeof block.body === "string") {
        return <ProseBlock text={block.body} glitchIntensity={glitchIntensity} index={index} />;
      }
      if ("content" in block && typeof block.content === "string") {
        return <ProseBlock text={block.content} glitchIntensity={glitchIntensity} index={index} />;
      }
      return null;
  }
}
