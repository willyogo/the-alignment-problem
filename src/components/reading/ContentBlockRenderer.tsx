import { ContentBlock } from "@/lib/types";
import { ProseBlock } from "./ProseBlock";
import { DualLayerText } from "./DualLayerText";
import { SoItGoes, AndThenItGoesOn } from "./SoItGoes";
import { EmailArtifact } from "../artifacts/EmailArtifact";
import { SlackArtifact } from "../artifacts/SlackArtifact";
import { TerminalArtifact } from "../artifacts/TerminalArtifact";
import { ChangelogArtifact } from "../artifacts/ChangelogArtifact";
import { SpecDocument } from "../artifacts/SpecDocument";
import { NewsChyron } from "../artifacts/NewsChyron";
import { SocialPost } from "../artifacts/SocialPost";
import { LetterArtifact } from "../artifacts/LetterArtifact";
import { WorkOrder } from "../artifacts/WorkOrder";
import { SpreadsheetArtifact } from "../artifacts/SpreadsheetArtifact";
import { SystemQuery } from "../artifacts/SystemQuery";
import { LegalFootnote } from "../artifacts/LegalFootnote";

export function ContentBlockRenderer({
  block, index, glitchIntensity,
}: {
  block: ContentBlock; index: number; glitchIntensity: number;
}) {
  switch (block.type) {
    case "prose": return <ProseBlock text={block.text} glitchIntensity={glitchIntensity} index={index} />;
    case "dual-layer": return <DualLayerText text={block.text} metadata={block.metadata} glitchIntensity={glitchIntensity} />;
    case "so-it-goes": return <SoItGoes />;
    case "and-then-it-goes-on": return <AndThenItGoesOn />;
    case "terminal": return <TerminalArtifact lines={block.lines} />;
    case "email": return <EmailArtifact from={block.from} subject={block.subject} body={block.body} timestamp={block.timestamp} />;
    case "slack": return <SlackArtifact messages={block.messages} />;
    case "changelog": return <ChangelogArtifact version={block.version} sections={block.sections} />;
    case "spec-document": return <SpecDocument content={block.content} />;
    case "news-chyron": return <NewsChyron network={block.network} text={block.text} />;
    case "social-post": return <SocialPost text={block.text} caption={block.caption} />;
    case "letter": return <LetterArtifact author={block.author} text={block.text} />;
    case "system-query": return <SystemQuery command={block.command} response={block.response} />;
    case "work-order": return <WorkOrder recipient={block.recipient} content={block.content} />;
    case "spreadsheet": return <SpreadsheetArtifact columns={block.columns} rows={block.rows} />;
    case "legal-footnote": return <LegalFootnote text={block.text} />;
    default: return null;
  }
}
