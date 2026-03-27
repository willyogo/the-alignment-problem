export type TerminalLine = {
  speaker: "owen" | "rigo" | "system";
  text: string;
  typing?: boolean;
};

export type SlackMessage = {
  user: string;
  avatar?: string;
  timestamp: string;
  text: string;
};

export type ChangelogSection = {
  heading: string;
  items: string[];
};

export type ContentBlock =
  | { type: "prose"; text: string }
  | { type: "dual-layer"; text: string; metadata: string }
  | { type: "so-it-goes" }
  | { type: "and-then-it-goes-on" }
  | { type: "terminal"; speaker: "owen" | "rigo"; lines: TerminalLine[] }
  | { type: "email"; from: string; subject?: string; body: string; timestamp?: string }
  | { type: "slack"; messages: SlackMessage[] }
  | { type: "changelog"; version: string; sections: ChangelogSection[] }
  | { type: "spec-document"; content: string }
  | { type: "news-chyron"; network: string; text: string }
  | { type: "social-post"; text: string; caption: string }
  | { type: "letter"; author: string; text: string }
  | { type: "system-query"; command: string; response?: string }
  | { type: "work-order"; recipient: string; content: string }
  | { type: "spreadsheet"; columns: string[]; rows: string[][] }
  | { type: "legal-footnote"; text: string };

export type ChapterPhase =
  | "simulation-warm"
  | "desert-cool"
  | "desaturating"
  | "terminal-stark"
  | "crisis"
  | "earned-warmth";

export type ChapterTheme = {
  phase: ChapterPhase;
  bg: string;
  text: string;
  accent: string;
  accentSecondary: string;
  border: string;
  glow: string;
};

export type Chapter = {
  number: number;
  title: string;
  slug: string;
  artPath: string;
  blocks: ContentBlock[];
  theme: ChapterTheme;
  glitchIntensity: number;
  shepherdsAwake: number | null;
  accuracyDisplay: string;
  ambientDescription: string;
};

export type ReadingState = {
  readingProgress: Record<string, number>;
  chaptersCompleted: string[];
  memorialUnlocked: boolean;
  doorRevealed: boolean;
  audioPreferences: {
    narrationVolume: number;
    ambientVolume: number;
    narrationMuted: boolean;
    ambientMuted: boolean;
  };
};
