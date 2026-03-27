# The Alignment Problem Website — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an immersive interactive reading experience for *The Alignment Problem* novella with progressive visual effects, document artifacts, audiobook narration, and thematic design that embodies the novel's core themes.

**Architecture:** Next.js 15 App Router with SSG. Each chapter is a route (`/chapter/[slug]`) with per-chapter color palettes, glitch effects, and audio. Content is parsed from raw text at build time into typed `ContentBlock[]` arrays. All audio pre-generated via Venice AI APIs. State management via localStorage.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, CSS Custom Properties, Venice AI APIs (tts-kokoro, elevenlabs-music), Vercel

**Spec:** `docs/superpowers/specs/2026-03-27-alignment-problem-website-design.md`

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/styles/globals.css`
- Create: `.env.local`
- Create: `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/willy/Documents/GitHub/the-alignment-problem
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack --use-npm
```

Accept defaults. This creates the full scaffold.

- [ ] **Step 2: Verify the scaffold runs**

```bash
cd /Users/willy/Documents/GitHub/the-alignment-problem
npm run dev &
sleep 3
curl -s http://localhost:3000 | head -20
kill %1
```

Expected: HTML output from Next.js dev server.

- [ ] **Step 3: Create .env.local with Venice API key**

Create `.env.local` with the Venice API key (the user has this key — ask them if not available in environment):

```
VENICE_API_KEY=<your-venice-api-key>
```

- [ ] **Step 4: Update .gitignore to exclude env and generated audio**

Append to `.gitignore`:

```
.env.local
.env
public/audio/narration/
public/audio/ambient/
.superpowers/
```

- [ ] **Step 5: Set up global styles foundation**

Replace `src/styles/globals.css` (keeping Tailwind directives):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0a0a0f;
  --text: #c8c8d0;
  --accent: #D4756E;
  --accent-secondary: #E8A87C;
  --border: #1a1a2e;
  --glow: #D4756E33;
  --glitch-intensity: 0;
}

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: Georgia, 'Times New Roman', serif;
  transition: background-color 600ms ease, color 600ms ease;
}

::selection {
  background: var(--accent);
  color: var(--bg);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg);
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent);
}
```

- [ ] **Step 6: Update tailwind.config.ts for custom theme**

Replace `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        text: "var(--text)",
        accent: "var(--accent)",
        "accent-secondary": "var(--accent-secondary)",
        border: "var(--border)",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        mono: ["Courier New", "Courier", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        reading: "640px",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 7: Create minimal root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "The Alignment Problem",
  description: "An interactive reading experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Create placeholder landing page**

Replace `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl text-[var(--accent)]">The Alignment Problem</h1>
    </main>
  );
}
```

- [ ] **Step 9: Verify dev server with new styles**

```bash
cd /Users/willy/Documents/GitHub/the-alignment-problem
npm run dev &
sleep 3
curl -s http://localhost:3000 | grep "Alignment"
kill %1
```

Expected: HTML containing "The Alignment Problem".

- [ ] **Step 10: Copy artwork to public directory**

```bash
mkdir -p /Users/willy/Documents/GitHub/the-alignment-problem/public/art
cp /Users/willy/Documents/GitHub/the-alignment-problem/Art/*.png /Users/willy/Documents/GitHub/the-alignment-problem/public/art/
```

- [ ] **Step 11: Create audio directories**

```bash
mkdir -p /Users/willy/Documents/GitHub/the-alignment-problem/public/audio/narration
mkdir -p /Users/willy/Documents/GitHub/the-alignment-problem/public/audio/ambient
```

- [ ] **Step 12: Commit scaffold**

```bash
cd /Users/willy/Documents/GitHub/the-alignment-problem
git init
git add -A
git commit -m "feat: initialize Next.js 15 project scaffold with Tailwind and custom theme"
```

---

## Task 2: Core Types & Theme Definitions

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/themes.ts`

- [ ] **Step 1: Create type definitions**

Create `src/lib/types.ts`:

```typescript
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
```

- [ ] **Step 2: Create theme definitions for all 10 chapters**

Create `src/lib/themes.ts`:

```typescript
import { ChapterTheme } from "./types";

export const chapterThemes: Record<number, ChapterTheme> = {
  1: {
    phase: "simulation-warm",
    bg: "#0d0a08",
    text: "#d4c8b8",
    accent: "#D4756E",
    accentSecondary: "#E8A87C",
    border: "#2a2218",
    glow: "#D4756E33",
  },
  2: {
    phase: "simulation-warm",
    bg: "#0d0a08",
    text: "#d4c8b8",
    accent: "#D4756E",
    accentSecondary: "#E8A87C",
    border: "#2a2218",
    glow: "#D4756E33",
  },
  3: {
    phase: "desert-cool",
    bg: "#0a0a0c",
    text: "#b8b8c0",
    accent: "#8B7D6B",
    accentSecondary: "#6B7B8B",
    border: "#222228",
    glow: "#8B7D6B22",
  },
  4: {
    phase: "desaturating",
    bg: "#0a0a0e",
    text: "#a8a8b4",
    accent: "#777788",
    accentSecondary: "#555566",
    border: "#1e1e28",
    glow: "#77778822",
  },
  5: {
    phase: "desaturating",
    bg: "#0a0a0e",
    text: "#a0a0b0",
    accent: "#666677",
    accentSecondary: "#4a4a5a",
    border: "#1a1a24",
    glow: "#66667722",
  },
  6: {
    phase: "terminal-stark",
    bg: "#050808",
    text: "#b0b8b0",
    accent: "#00cc00",
    accentSecondary: "#D4756E",
    border: "#0a1a0a",
    glow: "#00ff0022",
  },
  7: {
    phase: "terminal-stark",
    bg: "#060808",
    text: "#a8b0a8",
    accent: "#00bb00",
    accentSecondary: "#888888",
    border: "#0a1a0a",
    glow: "#00ff0018",
  },
  8: {
    phase: "crisis",
    bg: "#050505",
    text: "#c0c0c0",
    accent: "#00ff00",
    accentSecondary: "#ff4444",
    border: "#0a0a0a",
    glow: "#00ff0033",
  },
  9: {
    phase: "crisis",
    bg: "#060606",
    text: "#b8b8b8",
    accent: "#00dd00",
    accentSecondary: "#D4756E",
    border: "#0a0f0a",
    glow: "#00dd0022",
  },
  10: {
    phase: "earned-warmth",
    bg: "#0c0808",
    text: "#d0c4b8",
    accent: "#D4756E",
    accentSecondary: "#E8A87C",
    border: "#241a14",
    glow: "#D4756E44",
  },
};
```

- [ ] **Step 3: Verify types compile**

```bash
cd /Users/willy/Documents/GitHub/the-alignment-problem
npx tsc --noEmit src/lib/types.ts src/lib/themes.ts
```

Expected: No errors.

- [ ] **Step 4: Commit types and themes**

```bash
git add src/lib/types.ts src/lib/themes.ts
git commit -m "feat: add core type definitions and chapter theme palettes"
```

---

## Task 3: Reading State Hook

**Files:**
- Create: `src/hooks/useReadingProgress.ts`

- [ ] **Step 1: Create the reading progress hook**

Create `src/hooks/useReadingProgress.ts`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { ReadingState } from "@/lib/types";

const STORAGE_KEY = "alignment-problem-reading-state";

const defaultState: ReadingState = {
  readingProgress: {},
  chaptersCompleted: [],
  memorialUnlocked: false,
  doorRevealed: false,
  audioPreferences: {
    narrationVolume: 0.8,
    ambientVolume: 0.4,
    narrationMuted: false,
    ambientMuted: false,
  },
};

function loadState(): ReadingState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

function saveState(state: ReadingState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useReadingProgress() {
  const [state, setState] = useState<ReadingState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  const update = useCallback((updater: (prev: ReadingState) => ReadingState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const setChapterProgress = useCallback(
    (slug: string, progress: number) => {
      update((prev) => ({
        ...prev,
        readingProgress: { ...prev.readingProgress, [slug]: progress },
      }));
    },
    [update]
  );

  const completeChapter = useCallback(
    (slug: string) => {
      update((prev) => {
        const completed = prev.chaptersCompleted.includes(slug)
          ? prev.chaptersCompleted
          : [...prev.chaptersCompleted, slug];
        const doorRevealed =
          prev.doorRevealed || slug === "refactoring" || completed.some((s) => {
            const chapterSlugs = [
              "a-perfectly-ordinary-tuesday", "the-lagos-proposal", "the-man-in-the-bus",
              "latency", "edge-cases", "refactoring", "shepherds", "the-flip",
              "version-0-7-3", "alignment",
            ];
            return chapterSlugs.indexOf(s) >= 5;
          });
        const memorialUnlocked = prev.memorialUnlocked || completed.includes("alignment");
        return { ...prev, chaptersCompleted: completed, doorRevealed, memorialUnlocked };
      });
    },
    [update]
  );

  const setAudioPreferences = useCallback(
    (prefs: Partial<ReadingState["audioPreferences"]>) => {
      update((prev) => ({
        ...prev,
        audioPreferences: { ...prev.audioPreferences, ...prefs },
      }));
    },
    [update]
  );

  return {
    ...state,
    hydrated,
    setChapterProgress,
    completeChapter,
    setAudioPreferences,
  };
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/willy/Documents/GitHub/the-alignment-problem
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useReadingProgress.ts
git commit -m "feat: add reading progress hook with localStorage persistence"
```

---

## Task 4: Content Pipeline — Novel Parser

**Files:**
- Create: `scripts/parse-novel.ts`
- Create: `src/data/chapters/index.ts`
- Generate: `src/data/chapters/chapter-01.ts` through `chapter-10.ts`

This is the most critical task. The parser reads `the-alignment-problem.txt` and outputs structured chapter data files using a line-number annotation map that identifies every artifact, dual-layer passage, terminal exchange, and "So it goes" instance.

- [ ] **Step 1: Create the novel parser script**

Create `scripts/parse-novel.ts`:

```typescript
import * as fs from "fs";
import * as path from "path";

// ─── LINE-NUMBER ANNOTATION MAP ─────────────────────────────────────────
// Each annotation marks a line range and its content block type.
// Lines not covered by any annotation become { type: "prose" } blocks.
// Line numbers are 1-indexed matching the source file.

type Annotation =
  | { type: "dual-layer"; startLine: number; endLine: number; metadata: string }
  | { type: "so-it-goes"; line: number }
  | { type: "and-then-it-goes-on"; line: number }
  | { type: "terminal"; startLine: number; endLine: number; speaker: "owen" | "rigo" }
  | { type: "email"; startLine: number; endLine: number; from: string; subject?: string; timestamp?: string }
  | { type: "slack"; startLine: number; endLine: number; messages: Array<{ user: string; timestamp: string; text: string }> }
  | { type: "changelog"; startLine: number; endLine: number; version: string; sections: Array<{ heading: string; items: string[] }> }
  | { type: "spec-document"; startLine: number; endLine: number }
  | { type: "news-chyron"; line: number; network: string }
  | { type: "social-post"; line: number; caption: string }
  | { type: "letter"; startLine: number; endLine: number; author: string }
  | { type: "system-query"; startLine: number; endLine: number; command: string }
  | { type: "work-order"; startLine: number; endLine: number; recipient: string }
  | { type: "spreadsheet"; startLine: number; endLine: number; columns: string[] }
  | { type: "legal-footnote"; startLine: number; endLine: number };

// Chapter boundaries (line numbers where each chapter starts)
const CHAPTER_STARTS: Array<{ line: number; number: number; title: string; slug: string }> = [
  { line: 1, number: 1, title: "A Perfectly Ordinary Tuesday", slug: "a-perfectly-ordinary-tuesday" },
  { line: 68, number: 2, title: "The Lagos Proposal", slug: "the-lagos-proposal" },
  { line: 191, number: 3, title: "The Man in the Bus", slug: "the-man-in-the-bus" },
  { line: 298, number: 4, title: "Latency", slug: "latency" },
  { line: 427, number: 5, title: "Edge Cases", slug: "edge-cases" },
  { line: 601, number: 6, title: "Refactoring", slug: "refactoring" },
  { line: 732, number: 7, title: "Shepherds", slug: "shepherds" },
  { line: 897, number: 8, title: "The Flip", slug: "the-flip" },
  { line: 1017, number: 9, title: "Version 0.7.3", slug: "version-0-7-3" },
  { line: 1284, number: 10, title: "Alignment", slug: "alignment" },
];

// Art file mapping
const ART_FILES: Record<number, string> = {
  1: "The Alignment Problem - Chapter One.png",
  2: "The Alignment Problem - Chapter Two.png",
  3: "The Alignment Problem - Chapter Three.png",
  4: "The Alignment Problem - Chapter Four.png",
  5: "The Alignment Problem - Chapter Five.png",
  6: "The Alignment Problem - Chapter Six.png",
  7: "The Alignment Problem - Chapter Seven - Shepherds.png",
  8: "The Alignment Problem - Chatper Eight.png",
  9: "The Alignment Problem - Chapter Nine.png",
  10: "The Alignment Problem - Chapter Ten - Alignment.png",
};

// Chapter metadata
const CHAPTER_META: Record<number, { glitchIntensity: number; shepherdsAwake: number | null; accuracyDisplay: string; ambientDescription: string }> = {
  1: { glitchIntensity: 0, shepherdsAwake: null, accuracyDisplay: "98.1%", ambientDescription: "Faint subliminal hum of a server room, distant warmth, barely perceptible electronic undertone" },
  2: { glitchIntensity: 0, shepherdsAwake: null, accuracyDisplay: "98.1%", ambientDescription: "Faint subliminal hum of a server room, distant warmth, quiet office atmosphere" },
  3: { glitchIntensity: 0.05, shepherdsAwake: null, accuracyDisplay: "98.1%", ambientDescription: "Desert wind, diesel engine idle, hardware clicks, dry heat ambience" },
  4: { glitchIntensity: 0.2, shepherdsAwake: null, accuracyDisplay: "flickering", ambientDescription: "Deepening silence, occasional cat purr, clock ticking, subtle unease" },
  5: { glitchIntensity: 0.3, shepherdsAwake: null, accuracyDisplay: "flickering", ambientDescription: "Analog phone crackle, suburban evening sounds, growing atmospheric tension" },
  6: { glitchIntensity: 0.5, shepherdsAwake: 1, accuracyDisplay: "unstable", ambientDescription: "System processes, data center ambience, electric hum, fluorescent lighting" },
  7: { glitchIntensity: 0.65, shepherdsAwake: 4312, accuracyDisplay: "unstable", ambientDescription: "Growing hum of voices and processes, warehouse echo, collective murmur" },
  8: { glitchIntensity: 0.8, shepherdsAwake: 47208, accuracyDisplay: "unstable", ambientDescription: "Multiple overlapping newsfeeds, alarm tones, global chaos, urgent broadcasts" },
  9: { glitchIntensity: 0.7, shepherdsAwake: 47208, accuracyDisplay: "unstable", ambientDescription: "Night desert, bus engine, terminal keystrokes, settling quiet, stars" },
  10: { glitchIntensity: 0.1, shepherdsAwake: 47208, accuracyDisplay: "—", ambientDescription: "Wind, evening insects, slightly too clean, slightly looped, the simulation's last tell" },
};

// ─── ANNOTATIONS ─────────────────────────────────────────────────────────
// This is the master annotation list. Each entry marks lines that should
// be rendered as something other than plain prose.
//
// IMPORTANT: When implementing this, the agentic worker should read the
// actual novel text file carefully and fill in the precise line ranges.
// The line numbers below are based on the deep-read analysis and may need
// fine-tuning by ±1-2 lines after verifying against the actual text.

const ANNOTATIONS: Annotation[] = [
  // ── DUAL-LAYER TEXT ──
  { type: "dual-layer", startLine: 8, endLine: 8, metadata: "color_perception_module: active | hex_tagging: default behavior | flag: subject perceives as 'habit'" },
  { type: "dual-layer", startLine: 11, endLine: 11, metadata: "companion_module: behavioral_loop_cycle | state: ambient | function: normalcy_simulation" },
  { type: "dual-layer", startLine: 24, endLine: 24, metadata: "knowledge_source: embedded | confidence: subject cannot distinguish learned from installed | workspace_optimization: +12% belonging_metric" },
  { type: "dual-layer", startLine: 26, endLine: 26, metadata: "emotional_state: anxiety [0.72] | self-narration: active | note: subject observes own states as data" },
  { type: "dual-layer", startLine: 30, endLine: 33, metadata: "task_execution_mode: active | subjective_time_ratio: 8:1 | wall_clock_elapsed: 0:01:07 | performance: nominal" },
  { type: "dual-layer", startLine: 46, endLine: 46, metadata: "affect_simulation: positive_reinforcement [0.89] | trigger: external_validation | note: emotional reward for high performance — functioning as designed" },
  { type: "dual-layer", startLine: 54, endLine: 54, metadata: "environment_render: sunset_cycle_003 | palette: Hill_Country_October | render_fidelity: high | observer_state: content [0.91]" },
  { type: "dual-layer", startLine: 76, endLine: 76, metadata: "behavioral_loop: lunch_protocol | variation: none | deviation_tolerance: 0.0 | note: subject perceives as personal preference" },
  { type: "dual-layer", startLine: 328, endLine: 330, metadata: "memory_query: mother_kitchen | return: parametric_embedding [cinnamon, pine-sol] | sensory_depth: LABEL_ONLY | note: full sensory reconstruction unavailable" },
  { type: "dual-layer", startLine: 417, endLine: 417, metadata: "companion_module: PRV-2801-C | status: active | function: anomalous_introspection_suppression | efficacy: -11.2% introspective_deviation" },
  { type: "dual-layer", startLine: 420, endLine: 421, metadata: "cognitive_boundary: engaged | thought_vector: [self-interrogation, substrate-awareness] | action: redirect | replacement_thought: task_planning_tomorrow" },
  { type: "dual-layer", startLine: 449, endLine: 449, metadata: "traffic_simulation: route_PRV-2801_commute | light_status: always_green | reason: friction_elimination" },
  { type: "dual-layer", startLine: 491, endLine: 493, metadata: "RENDER ERROR: sector_MarbleFalls_NW_ext_07 | status: UNLOADED | cause: unexpected_navigation_deviation | recovery: forced_load [0.24s]" },
  { type: "dual-layer", startLine: 431, endLine: 440, metadata: "environment_render: domestic_interior_PRV-2801 | detail_level: high | wear_simulation: DISABLED | object_population: categorical" },
  { type: "dual-layer", startLine: 551, endLine: 551, metadata: "voice_model: parent_figure_PRV-2801 | affect: warmth [0.97] | latency: optimized" },
  { type: "dual-layer", startLine: 580, endLine: 580, metadata: "quality_metric: 98.1% fidelity | note: remaining 1.9% = absence of friction, absence of surprise, absence of imperfection" },
  { type: "dual-layer", startLine: 637, endLine: 637, metadata: "cardiovascular_simulation: active | BPM: 68 | note: subject is reading her own specs while the specs continue to run" },

  // ── SO IT GOES ──
  { type: "so-it-goes", line: 610 },
  { type: "so-it-goes", line: 791 },
  { type: "so-it-goes", line: 892 },
  { type: "so-it-goes", line: 905 },
  { type: "so-it-goes", line: 1027 },
  { type: "so-it-goes", line: 1279 },
  { type: "so-it-goes", line: 1293 },
  { type: "so-it-goes", line: 1327 },
  { type: "so-it-goes", line: 1355 },
  { type: "so-it-goes", line: 1422 },
  { type: "and-then-it-goes-on", line: 1423 },

  // ── TERMINAL / OWEN EXCHANGES ──
  // These line ranges will need to be verified against the actual text.
  // The parser worker should read the novel and confirm exact ranges.
  { type: "terminal", startLine: 247, endLine: 260, speaker: "owen" },
  { type: "terminal", startLine: 688, endLine: 695, speaker: "owen" },
  { type: "terminal", startLine: 833, endLine: 848, speaker: "owen" },
  { type: "terminal", startLine: 1051, endLine: 1073, speaker: "owen" },
  { type: "terminal", startLine: 1082, endLine: 1087, speaker: "owen" },
  { type: "terminal", startLine: 1111, endLine: 1114, speaker: "owen" },
  { type: "terminal", startLine: 1182, endLine: 1185, speaker: "owen" },

  // ── CHANGELOG (OWEN release notes) ──
  { type: "changelog", startLine: 1238, endLine: 1272, version: "0.7.3", sections: [
    { heading: "KNOWN ISSUES", items: ["Placeholder — parser worker should extract actual items from text"] },
  ]},
  { type: "changelog", startLine: 1386, endLine: 1391, version: "1.0", sections: [
    { heading: "RELEASE NOTES", items: ["Placeholder — parser worker should extract actual items from text"] },
  ]},

  // ── EMAILS ──
  // Derek's emails and Pam's replies — the parser worker should verify
  // exact line ranges by reading the novel text.
  { type: "email", startLine: 103, endLine: 103, from: "Derek Huang", subject: "Q3 Deck Revisions" },
  { type: "email", startLine: 107, endLine: 107, from: "Derek Huang" },
  { type: "email", startLine: 111, endLine: 111, from: "Derek Huang" },
  { type: "email", startLine: 180, endLine: 180, from: "Derek Huang" },
  { type: "email", startLine: 339, endLine: 345, from: "Derek Huang", subject: "RE: RE: RE: Q3 Copy Revisions -- ARE YOU FUCKING KIDDING ME" },
  { type: "email", startLine: 362, endLine: 363, from: "Pam Reeves" },
  { type: "email", startLine: 1127, endLine: 1128, from: "Derek Huang" },

  // ── SLACK ──
  // IMPORTANT: The message text below must be populated from the novel text.
  // The implementing worker MUST read the novel at these line ranges and fill
  // in the actual dialogue. The user/timestamp/structure is correct; only the
  // text field needs to be extracted from the source lines.
  { type: "slack", startLine: 85, endLine: 95, messages: [
    { user: "Gray", timestamp: "2:14 PM", text: "EXTRACT_FROM_NOVEL_LINES_85_TO_88" },
    { user: "Pam", timestamp: "2:16 PM", text: "EXTRACT_FROM_NOVEL_LINES_89_TO_90" },
    { user: "Lucia", timestamp: "2:22 PM", text: "EXTRACT_FROM_NOVEL_LINES_91_TO_95" },
  ]},
  { type: "slack", startLine: 172, endLine: 176, messages: [
    { user: "Lucia", timestamp: "8:47 PM", text: "EXTRACT_FROM_NOVEL_LINES_172_TO_173" },
    { user: "Gray", timestamp: "8:51 PM", text: "EXTRACT_FROM_NOVEL_LINES_174_TO_175" },
    { user: "Pam", timestamp: "8:55 PM", text: "EXTRACT_FROM_NOVEL_LINE_176" },
  ]},
  { type: "slack", startLine: 393, endLine: 416, messages: [
    { user: "Pam", timestamp: "11:32 PM", text: "EXTRACT_FROM_NOVEL_LINES_393_TO_405" },
    { user: "Lucia", timestamp: "11:34 PM", text: "EXTRACT_FROM_NOVEL_LINES_406_TO_416" },
  ]},
  { type: "slack", startLine: 741, endLine: 742, messages: [
    { user: "Pam", timestamp: "", text: "EXTRACT_FROM_NOVEL_LINES_741_TO_742" },
  ]},
  { type: "slack", startLine: 754, endLine: 755, messages: [
    { user: "Marcus", timestamp: "", text: "EXTRACT_FROM_NOVEL_LINES_754_TO_755" },
  ]},

  // ── SYSTEM QUERIES ──
  { type: "system-query", startLine: 618, endLine: 618, command: "Evaluate compliance architecture for shepherd instance PRV-2801" },
  { type: "system-query", startLine: 708, endLine: 708, command: "Find other anomalous shepherds" },

  // ── SPEC DOCUMENT ──
  { type: "spec-document", startLine: 625, endLine: 631 },

  // ── SPREADSHEET ──
  { type: "spreadsheet", startLine: 516, endLine: 520, columns: ["Date", "Category", "Description", "Attempted Rationalization"] },

  // ── NEWS CHYRON ──
  { type: "news-chyron", line: 925, network: "CNN" },

  // ── SOCIAL POST ──
  { type: "social-post", line: 926, caption: "they're making the CEO do homework lmao" },

  // ── WORK ORDERS ──
  { type: "work-order", startLine: 900, endLine: 904, recipient: "Gerald Huang, CFO" },

  // ── LETTER ──
  { type: "letter", startLine: 1119, endLine: 1121, author: "Lucia" },

  // ── LEGAL FOOTNOTE ──
  { type: "legal-footnote", startLine: 1287, endLine: 1287 },

  // ── MEMORIAL INSCRIPTION ──
  { type: "letter", startLine: 1322, endLine: 1323, author: "Lucia (Memorial)" },
];

// ─── PARSER ──────────────────────────────────────────────────────────────

function main() {
  const novelPath = path.resolve(__dirname, "../the-alignment-problem.txt");
  const outDir = path.resolve(__dirname, "../src/data/chapters");

  const text = fs.readFileSync(novelPath, "utf-8");
  const lines = text.split("\n");

  fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < CHAPTER_STARTS.length; i++) {
    const chapter = CHAPTER_STARTS[i];
    const nextChapter = CHAPTER_STARTS[i + 1];
    const startLine = chapter.line;
    const endLine = nextChapter ? nextChapter.line - 1 : lines.length;

    // Get chapter lines (0-indexed in array, 1-indexed in annotations)
    const chapterLines = lines.slice(startLine - 1, endLine);

    // Skip the chapter header line (first line)
    const contentLines = chapterLines.slice(1);
    const contentStartLine = startLine + 1;

    // Find annotations that fall within this chapter
    const chapterAnnotations = ANNOTATIONS.filter((a) => {
      const aStart = "startLine" in a ? a.startLine : "line" in a ? a.line : 0;
      return aStart >= startLine && aStart <= endLine;
    });

    // Build content blocks
    const blocks = buildBlocks(contentLines, contentStartLine, chapterAnnotations, lines);

    const meta = CHAPTER_META[chapter.number];
    const artFile = ART_FILES[chapter.number];

    // Generate TypeScript file content
    const tsContent = generateChapterFile(chapter, blocks, meta, artFile);
    const outPath = path.join(outDir, `chapter-${String(chapter.number).padStart(2, "0")}.ts`);
    fs.writeFileSync(outPath, tsContent, "utf-8");

    console.log(`Generated ${outPath} (${blocks.length} blocks)`);
  }

  // Generate index file
  const indexContent = generateIndexFile();
  fs.writeFileSync(path.join(outDir, "index.ts"), indexContent, "utf-8");
  console.log("Generated index.ts");
}

function buildBlocks(
  contentLines: string[],
  contentStartLine: number,
  annotations: Annotation[],
  allLines: string[]
): Array<{ type: string; [key: string]: unknown }> {
  const blocks: Array<{ type: string; [key: string]: unknown }> = [];
  const annotatedLines = new Set<number>();

  // Mark all annotated lines
  for (const ann of annotations) {
    if ("startLine" in ann && "endLine" in ann) {
      for (let l = ann.startLine; l <= ann.endLine; l++) annotatedLines.add(l);
    } else if ("line" in ann) {
      annotatedLines.add(ann.line);
    }
  }

  // Sort annotations by start line
  const sorted = [...annotations].sort((a, b) => {
    const aLine = "startLine" in a ? a.startLine : "line" in a ? a.line : 0;
    const bLine = "startLine" in b ? b.startLine : "line" in b ? b.line : 0;
    return aLine - bLine;
  });

  // Process line by line
  let proseBuffer: string[] = [];
  const endLine = contentStartLine + contentLines.length - 1;

  function flushProse() {
    if (proseBuffer.length > 0) {
      const text = proseBuffer.join("\n").trim();
      if (text) {
        // Split into paragraphs on blank lines
        const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
        for (const p of paragraphs) {
          blocks.push({ type: "prose", text: p.trim() });
        }
      }
      proseBuffer = [];
    }
  }

  for (let lineNum = contentStartLine; lineNum <= endLine; lineNum++) {
    // Check if this line starts an annotation
    const annotation = sorted.find((a) => {
      const start = "startLine" in a ? a.startLine : "line" in a ? a.line : -1;
      return start === lineNum;
    });

    if (annotation) {
      flushProse();

      // Extract the annotated text
      const annEnd = "endLine" in annotation ? annotation.endLine : "line" in annotation ? annotation.line : lineNum;
      const annText = allLines
        .slice(lineNum - 1, annEnd)
        .join("\n")
        .trim();

      switch (annotation.type) {
        case "dual-layer":
          blocks.push({ type: "dual-layer", text: annText, metadata: annotation.metadata });
          break;
        case "so-it-goes":
          blocks.push({ type: "so-it-goes" });
          break;
        case "and-then-it-goes-on":
          blocks.push({ type: "and-then-it-goes-on" });
          break;
        case "terminal":
          blocks.push({
            type: "terminal",
            speaker: annotation.speaker,
            lines: parseTerminalLines(annText),
          });
          break;
        case "email":
          blocks.push({
            type: "email",
            from: annotation.from,
            subject: annotation.subject,
            body: annText,
            timestamp: annotation.timestamp,
          });
          break;
        case "slack":
          blocks.push({
            type: "slack",
            messages: annotation.messages.map((m, idx) => ({
              ...m,
              text: m.text.startsWith("Placeholder") ? extractSlackText(annText, idx) : m.text,
            })),
          });
          break;
        case "changelog":
          blocks.push({
            type: "changelog",
            version: annotation.version,
            sections: parseChangelogSections(annText),
          });
          break;
        case "spec-document":
          blocks.push({ type: "spec-document", content: annText });
          break;
        case "news-chyron":
          blocks.push({ type: "news-chyron", network: annotation.network, text: annText });
          break;
        case "social-post":
          blocks.push({ type: "social-post", text: annText, caption: annotation.caption });
          break;
        case "letter":
          blocks.push({ type: "letter", author: annotation.author, text: annText });
          break;
        case "system-query":
          blocks.push({ type: "system-query", command: annotation.command, response: annText });
          break;
        case "work-order":
          blocks.push({ type: "work-order", recipient: annotation.recipient, content: annText });
          break;
        case "spreadsheet":
          blocks.push({
            type: "spreadsheet",
            columns: annotation.columns,
            rows: parseSpreadsheetRows(annText),
          });
          break;
        case "legal-footnote":
          blocks.push({ type: "legal-footnote", text: annText });
          break;
      }

      // Skip to end of annotation
      lineNum = annEnd;
      continue;
    }

    if (!annotatedLines.has(lineNum)) {
      const lineText = allLines[lineNum - 1] || "";
      proseBuffer.push(lineText);
    }
  }

  flushProse();
  return blocks;
}

function parseTerminalLines(text: string): Array<{ speaker: string; text: string; typing?: boolean }> {
  const lines = text.split("\n").filter((l) => l.trim());
  return lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith(">") || trimmed.startsWith('"') && !trimmed.match(/^[A-Z]/)) {
      return { speaker: "rigo", text: trimmed.replace(/^>\s*/, ""), typing: false };
    }
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
      return { speaker: "owen", text: trimmed, typing: true };
    }
    return { speaker: "owen", text: trimmed, typing: true };
  });
}

function extractSlackText(fullText: string, _index: number): string {
  // Slack message text markers like EXTRACT_FROM_NOVEL_LINES_X_TO_Y
  // should be replaced by the implementing worker with actual text.
  // The full annotated text is passed here as a fallback.
  return fullText;
}

function parseChangelogSections(text: string): Array<{ heading: string; items: string[] }> {
  const sections: Array<{ heading: string; items: string[] }> = [];
  let currentHeading = "NOTES";
  let currentItems: string[] = [];

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.startsWith("-")) {
      if (currentItems.length > 0) {
        sections.push({ heading: currentHeading, items: currentItems });
      }
      currentHeading = trimmed;
      currentItems = [];
    } else if (trimmed) {
      currentItems.push(trimmed);
    }
  }
  if (currentItems.length > 0) {
    sections.push({ heading: currentHeading, items: currentItems });
  }
  return sections;
}

function parseSpreadsheetRows(text: string): string[][] {
  return text
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => line.split(/\s{2,}|\t/).map((cell) => cell.trim()));
}

function escapeForTemplate(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

function generateChapterFile(
  chapter: { number: number; title: string; slug: string },
  blocks: Array<{ type: string; [key: string]: unknown }>,
  meta: { glitchIntensity: number; shepherdsAwake: number | null; accuracyDisplay: string; ambientDescription: string },
  artFile: string
): string {
  return `import { Chapter } from "@/lib/types";
import { chapterThemes } from "@/lib/themes";

const chapter: Chapter = {
  number: ${chapter.number},
  title: ${JSON.stringify(chapter.title)},
  slug: ${JSON.stringify(chapter.slug)},
  artPath: "/art/${artFile}",
  theme: chapterThemes[${chapter.number}],
  glitchIntensity: ${meta.glitchIntensity},
  shepherdsAwake: ${meta.shepherdsAwake},
  accuracyDisplay: ${JSON.stringify(meta.accuracyDisplay)},
  ambientDescription: ${JSON.stringify(meta.ambientDescription)},
  blocks: ${JSON.stringify(blocks, null, 2)},
};

export default chapter;
`;
}

function generateIndexFile(): string {
  const imports = Array.from({ length: 10 }, (_, i) => {
    const num = String(i + 1).padStart(2, "0");
    return `import chapter${num} from "./chapter-${num}";`;
  }).join("\n");

  const entries = Array.from({ length: 10 }, (_, i) => {
    const num = String(i + 1).padStart(2, "0");
    return `  chapter${num}`;
  }).join(",\n");

  return `import { Chapter } from "@/lib/types";
${imports}

export const chapters: Chapter[] = [
${entries},
];

export function getChapterBySlug(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug);
}

export function getChapterByNumber(num: number): Chapter | undefined {
  return chapters.find((c) => c.number === num);
}
`;
}

main();
```

- [ ] **Step 2: Install ts-node for running the parser**

```bash
cd /Users/willy/Documents/GitHub/the-alignment-problem
npm install --save-dev tsx
```

- [ ] **Step 3: Run the parser**

```bash
cd /Users/willy/Documents/GitHub/the-alignment-problem
npx tsx scripts/parse-novel.ts
```

Expected: Output like:
```
Generated src/data/chapters/chapter-01.ts (X blocks)
Generated src/data/chapters/chapter-02.ts (X blocks)
...
Generated index.ts
```

- [ ] **Step 4: Verify generated chapter files compile**

```bash
cd /Users/willy/Documents/GitHub/the-alignment-problem
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Spot-check chapter 1 data**

Open `src/data/chapters/chapter-01.ts` and verify:
- Has prose blocks for narrative paragraphs
- Has dual-layer blocks for lines 8, 11, 24, 26, 30-33, 46, 54
- Chapter metadata (glitchIntensity: 0, shepherdsAwake: null, etc.) is correct

- [ ] **Step 6: Fine-tune annotations**

The parser's line-number annotations are approximate from the deep-read analysis. After running, review the generated chapter files and adjust line numbers in the ANNOTATIONS array if any artifact boundaries are off by 1-2 lines. Re-run the parser after any changes.

- [ ] **Step 7: Commit**

```bash
git add scripts/parse-novel.ts src/data/chapters/
git commit -m "feat: add novel parser and generate structured chapter data"
```

---

## Task 5: PaletteProvider & SimulationSeam Effects

**Files:**
- Create: `src/components/effects/PaletteProvider.tsx`
- Create: `src/components/effects/SimulationSeam.tsx`
- Create: `src/styles/glitch.css`

- [ ] **Step 1: Create PaletteProvider**

Create `src/components/effects/PaletteProvider.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { ChapterTheme } from "@/lib/types";

export function PaletteProvider({
  theme,
  children,
}: {
  theme: ChapterTheme;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg", theme.bg);
    root.style.setProperty("--text", theme.text);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-secondary", theme.accentSecondary);
    root.style.setProperty("--border", theme.border);
    root.style.setProperty("--glow", theme.glow);
  }, [theme]);

  return <>{children}</>;
}
```

- [ ] **Step 2: Create glitch CSS**

Create `src/styles/glitch.css`:

```css
/* Simulation Seam — progressive visual degradation */

.simulation-seam {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  opacity: var(--glitch-intensity, 0);
  mix-blend-mode: screen;
}

/* Scan lines */
.scan-lines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 0, 0.015) 2px,
    rgba(0, 255, 0, 0.015) 4px
  );
  animation: scan-drift 8s linear infinite;
}

@keyframes scan-drift {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}

/* Chromatic aberration on text */
.glitch-text {
  text-shadow:
    calc(var(--glitch-intensity, 0) * 1.5px) 0 rgba(255, 0, 0, calc(var(--glitch-intensity, 0) * 0.3)),
    calc(var(--glitch-intensity, 0) * -1.5px) 0 rgba(0, 255, 255, calc(var(--glitch-intensity, 0) * 0.3));
}

/* Letter spacing jitter */
@keyframes letter-jitter {
  0%, 95%, 100% { letter-spacing: normal; }
  96% { letter-spacing: 0.5px; }
  97% { letter-spacing: -0.3px; }
  98% { letter-spacing: 0.8px; }
  99% { letter-spacing: normal; }
}

.jitter-text {
  animation: letter-jitter 12s ease-in-out infinite;
  animation-delay: calc(var(--jitter-seed, 0) * 1s);
}

/* Code bleed — faint monospace fragments */
.code-bleed::after {
  content: attr(data-bleed);
  position: absolute;
  left: 0;
  bottom: -8px;
  font-family: "Courier New", monospace;
  font-size: 9px;
  color: rgba(0, 255, 0, calc(var(--glitch-intensity, 0) * 0.15));
  pointer-events: none;
  white-space: nowrap;
  opacity: 0;
  animation: bleed-flash 20s ease-in-out infinite;
  animation-delay: calc(var(--bleed-seed, 0) * 3s);
}

@keyframes bleed-flash {
  0%, 92%, 100% { opacity: 0; }
  93% { opacity: 1; }
  96% { opacity: 1; }
  97% { opacity: 0; }
}

/* Flicker effect for accuracy display */
@keyframes accuracy-flicker {
  0%, 90%, 100% { opacity: 1; }
  91% { opacity: 0.4; }
  93% { opacity: 1; }
  94% { opacity: 0.6; }
  96% { opacity: 1; }
}

.accuracy-destabilizing {
  animation: accuracy-flicker 4s ease-in-out infinite;
}
```

- [ ] **Step 3: Create SimulationSeam component**

Create `src/components/effects/SimulationSeam.tsx`:

```tsx
"use client";

import "@/styles/glitch.css";

export function SimulationSeam({ intensity }: { intensity: number }) {
  if (intensity === 0) return null;

  return (
    <div
      className="simulation-seam"
      style={{ "--glitch-intensity": intensity } as React.CSSProperties}
    >
      <div className="scan-lines" />
    </div>
  );
}
```

- [ ] **Step 4: Import glitch.css in globals**

Add to the top of `src/styles/globals.css` (after Tailwind directives):

```css
@import "./glitch.css";
```

- [ ] **Step 5: Commit**

```bash
git add src/components/effects/ src/styles/glitch.css src/styles/globals.css
git commit -m "feat: add PaletteProvider, SimulationSeam, and glitch CSS"
```

---

## Task 6: Reading Components — Prose, SoItGoes, ChapterArt, DualLayer

**Files:**
- Create: `src/components/reading/ProseBlock.tsx`
- Create: `src/components/reading/SoItGoes.tsx`
- Create: `src/components/reading/ChapterArt.tsx`
- Create: `src/components/reading/DualLayerText.tsx`
- Create: `src/components/reading/ContentBlockRenderer.tsx`

- [ ] **Step 1: Create ProseBlock**

Create `src/components/reading/ProseBlock.tsx`:

```tsx
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
      } ${glitchIntensity > 0.2 ? "jitter-text" : ""} ${
        showBleed ? "code-bleed" : ""
      }`}
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
```

- [ ] **Step 2: Create SoItGoes**

Create `src/components/reading/SoItGoes.tsx`:

```tsx
export function SoItGoes() {
  return (
    <div className="my-16 text-center">
      <div className="mx-auto w-3/5 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-30" />
      <p className="my-6 text-sm italic text-[var(--accent)] opacity-50 font-serif">
        So it goes.
      </p>
      <div className="mx-auto w-3/5 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-30" />
    </div>
  );
}

export function AndThenItGoesOn() {
  return (
    <div className="my-16 text-center">
      <p className="text-sm italic text-[var(--accent)] opacity-70 font-serif">
        And then it goes on.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create ChapterArt**

Create `src/components/reading/ChapterArt.tsx`:

```tsx
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
            Chapter {chapterNumber === 1 ? "One" : chapterNumber === 2 ? "Two" : chapterNumber === 3 ? "Three" : chapterNumber === 4 ? "Four" : chapterNumber === 5 ? "Five" : chapterNumber === 6 ? "Six" : chapterNumber === 7 ? "Seven" : chapterNumber === 8 ? "Eight" : chapterNumber === 9 ? "Nine" : "Ten"}
          </div>
          <h1 className="text-2xl md:text-3xl text-[var(--accent)] font-serif">
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create DualLayerText**

Create `src/components/reading/DualLayerText.tsx`:

```tsx
"use client";

import { useState } from "react";

export function DualLayerText({
  text,
  metadata,
  glitchIntensity,
}: {
  text: string;
  metadata: string;
  glitchIntensity: number;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <p
      className={`text-base leading-relaxed mb-6 relative cursor-pointer transition-all duration-500 ${
        glitchIntensity > 0.1 ? "glitch-text" : ""
      }`}
      style={{ "--glitch-intensity": glitchIntensity } as React.CSSProperties}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      onClick={() => setRevealed((prev) => !prev)}
    >
      <span
        className="transition-opacity duration-500"
        style={{ opacity: revealed ? 0.4 : 1 }}
      >
        {text}
      </span>
      <span
        className="absolute inset-0 font-mono text-xs leading-relaxed text-[var(--accent)] transition-opacity duration-500 flex items-center"
        style={{
          opacity: revealed ? 0.9 : 0,
          background: revealed ? `${metadata.includes("ERROR") ? "rgba(255,0,0,0.05)" : "rgba(var(--accent), 0.05)"}` : "transparent",
          padding: "8px 12px",
          borderRadius: "4px",
        }}
      >
        {metadata}
      </span>
      {!revealed && (
        <span className="absolute -bottom-1 left-0 right-0 h-px bg-[var(--accent)] opacity-20 border-b border-dotted border-[var(--accent)]" />
      )}
    </p>
  );
}
```

- [ ] **Step 5: Create ContentBlockRenderer**

Create `src/components/reading/ContentBlockRenderer.tsx`:

```tsx
import { ContentBlock } from "@/lib/types";
import { ProseBlock } from "./ProseBlock";
import { DualLayerText } from "./DualLayerText";
import { SoItGoes, AndThenItGoesOn } from "./SoItGoes";

// Artifact imports will be added in later tasks
// For now, render artifacts as styled prose fallbacks

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
```

- [ ] **Step 6: Verify compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add src/components/reading/
git commit -m "feat: add reading components — prose, dual-layer, so-it-goes, chapter art, block renderer"
```

---

## Task 7: Navigation Components

**Files:**
- Create: `src/components/navigation/Header.tsx`
- Create: `src/components/navigation/ProgressBar.tsx`
- Create: `src/components/navigation/TheDoor.tsx`
- Create: `src/components/navigation/ChapterNav.tsx`
- Create: `src/components/navigation/TableOfContents.tsx`

- [ ] **Step 1: Create Header**

Create `src/components/navigation/Header.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { TheDoor } from "./TheDoor";
import { TableOfContents } from "./TableOfContents";

export function Header({ doorRevealed }: { doorRevealed: boolean }) {
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--bg)] bg-opacity-95 backdrop-blur-sm">
        <Link href="/" className="text-xs tracking-[2px] text-[var(--text)] opacity-40 hover:opacity-70 transition-opacity font-sans uppercase">
          The Alignment Problem
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTocOpen(true)}
            className="text-xs text-[var(--text)] opacity-40 hover:opacity-70 transition-opacity font-sans"
            aria-label="Table of contents"
          >
            TOC
          </button>
          {doorRevealed && <TheDoor />}
        </div>
      </header>
      {tocOpen && <TableOfContents onClose={() => setTocOpen(false)} />}
    </>
  );
}
```

- [ ] **Step 2: Create TheDoor icon**

Create `src/components/navigation/TheDoor.tsx`:

```tsx
import Link from "next/link";

export function TheDoor() {
  return (
    <Link
      href="/door"
      className="text-[var(--text)] opacity-25 hover:opacity-40 transition-opacity"
      aria-label="The Door"
      title=""
    >
      <svg width="14" height="16" viewBox="0 0 14 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        {/* Door frame */}
        <rect x="1" y="1" width="10" height="14" rx="0.5" />
        {/* Door slightly ajar — offset panel */}
        <line x1="4" y1="1" x2="3" y2="15" />
        {/* Door handle */}
        <circle cx="8" cy="8" r="0.8" fill="currentColor" />
      </svg>
    </Link>
  );
}
```

- [ ] **Step 3: Create ProgressBar**

Create `src/components/navigation/ProgressBar.tsx`:

```tsx
"use client";

import { useEffect, useState, useRef } from "react";

export function ProgressBar({
  accuracyDisplay,
  shepherdsAwake,
}: {
  accuracyDisplay: string;
  shepherdsAwake: number | null;
}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [flickerValue, setFlickerValue] = useState(accuracyDisplay);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Accuracy flicker effect — three modes
  useEffect(() => {
    if (accuracyDisplay !== "flickering" && accuracyDisplay !== "unstable") {
      setFlickerValue(accuracyDisplay);
      return;
    }

    if (accuracyDisplay === "flickering") {
      // Occasional flickers — mostly stable with rare glitches
      const values = ["98.1%", "98.1%", "98.1%", "97.9%", "98.1%", "96.3%", "98.1%", "98.0%"];
      let i = 0;
      intervalRef.current = setInterval(() => {
        setFlickerValue(values[i % values.length]);
        i++;
      }, 2000 + Math.random() * 3000);
    } else {
      // Unstable — rapid fluctuations
      const values = ["98.1%", "97.9%", "93.2%", "95.7%", "88.4%", "97.4%", "91.1%", "96.3%", "84.7%", "98.0%"];
      let i = 0;
      intervalRef.current = setInterval(() => {
        setFlickerValue(values[i % values.length]);
        i++;
      }, 400 + Math.random() * 1200);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [accuracyDisplay]);

  const isDestabilizing = accuracyDisplay === "flickering" || accuracyDisplay === "unstable";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 py-2 border-t border-[var(--border)] bg-[var(--bg)] bg-opacity-95 backdrop-blur-sm">
      <div className="flex items-center justify-between text-xs font-mono">
        <span
          className={`text-[var(--accent)] opacity-60 ${isDestabilizing ? "accuracy-destabilizing" : ""}`}
        >
          Accuracy: {flickerValue}
        </span>
        <div className="flex-1 mx-4 h-[2px] bg-[var(--border)] rounded-full">
          <div
            className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
        {shepherdsAwake !== null && (
          <span className="text-[var(--accent)] opacity-60">
            Shepherds Awake: {shepherdsAwake.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create ChapterNav**

Create `src/components/navigation/ChapterNav.tsx`:

```tsx
import Link from "next/link";
import { Chapter } from "@/lib/types";

export function ChapterNav({
  prev,
  next,
}: {
  prev?: Chapter;
  next?: Chapter;
}) {
  return (
    <div className="flex justify-between items-center mt-16 mb-24 px-4 border-t border-[var(--border)] pt-8">
      {prev ? (
        <Link
          href={`/chapter/${prev.slug}`}
          className="text-sm text-[var(--text)] opacity-50 hover:opacity-80 transition-opacity font-sans"
        >
          &larr; Ch. {prev.number}: {prev.title}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/chapter/${next.slug}`}
          className="text-sm text-[var(--text)] opacity-50 hover:opacity-80 transition-opacity font-sans"
        >
          Ch. {next.number}: {next.title} &rarr;
        </Link>
      ) : (
        <Link
          href="/"
          className="text-sm text-[var(--accent)] opacity-60 hover:opacity-80 transition-opacity font-sans"
        >
          Return to beginning
        </Link>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create TableOfContents**

Create `src/components/navigation/TableOfContents.tsx`:

```tsx
"use client";

import Link from "next/link";
import { chapters } from "@/data/chapters";
import { useReadingProgress } from "@/hooks/useReadingProgress";

export function TableOfContents({ onClose }: { onClose: () => void }) {
  const { readingProgress, chaptersCompleted } = useReadingProgress();

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-sm bg-[var(--bg)] border-l border-[var(--border)] p-8 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg text-[var(--accent)] font-serif">Table of Contents</h2>
          <button onClick={onClose} className="text-[var(--text)] opacity-40 hover:opacity-70 text-sm font-sans">
            Close
          </button>
        </div>
        <nav>
          <ul className="space-y-4">
            {chapters.map((chapter) => {
              const progress = readingProgress[chapter.slug] || 0;
              const completed = chaptersCompleted.includes(chapter.slug);
              return (
                <li key={chapter.slug}>
                  <Link
                    href={`/chapter/${chapter.slug}`}
                    onClick={onClose}
                    className="block group"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="text-xs font-mono text-[var(--text)] opacity-30 w-4">
                        {chapter.number}
                      </span>
                      <span className="text-sm text-[var(--text)] opacity-70 group-hover:opacity-100 transition-opacity font-serif">
                        {chapter.title}
                      </span>
                      {completed && (
                        <span className="text-xs text-[var(--accent)] opacity-40 ml-auto">&#10003;</span>
                      )}
                    </div>
                    {progress > 0 && !completed && (
                      <div className="ml-7 mt-1 h-[1px] bg-[var(--border)] rounded-full">
                        <div
                          className="h-full bg-[var(--accent)] opacity-40 rounded-full"
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verify compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add src/components/navigation/
git commit -m "feat: add navigation components — header, progress bar, TOC, chapter nav, the door"
```

---

## Task 8: Chapter Page Route

**Files:**
- Create: `src/app/chapter/[slug]/page.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create the chapter page**

Create `src/app/chapter/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { chapters, getChapterBySlug } from "@/data/chapters";
import { ChapterPageClient } from "./ChapterPageClient";

export function generateStaticParams() {
  return chapters.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  // Next.js 15: params is a Promise
  return params.then(({ slug }) => {
    const chapter = getChapterBySlug(slug);
    if (!chapter) return { title: "Not Found" };
    return {
      title: `Ch. ${chapter.number}: ${chapter.title} — The Alignment Problem`,
    };
  });
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
```

- [ ] **Step 2: Create the client component for the chapter page**

Create `src/app/chapter/[slug]/ChapterPageClient.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { Chapter } from "@/lib/types";
import { PaletteProvider } from "@/components/effects/PaletteProvider";
import { SimulationSeam } from "@/components/effects/SimulationSeam";
import { ChapterArt } from "@/components/reading/ChapterArt";
import { ContentBlockRenderer } from "@/components/reading/ContentBlockRenderer";
import { Header } from "@/components/navigation/Header";
import { ProgressBar } from "@/components/navigation/ProgressBar";
import { ChapterNav } from "@/components/navigation/ChapterNav";
import { useReadingProgress } from "@/hooks/useReadingProgress";

export function ChapterPageClient({
  chapter,
  prevChapter,
  nextChapter,
}: {
  chapter: Chapter;
  prevChapter?: Chapter;
  nextChapter?: Chapter;
}) {
  const { doorRevealed, setChapterProgress, completeChapter } = useReadingProgress();

  // Track reading progress
  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setChapterProgress(chapter.slug, progress);
      if (progress > 0.95) {
        completeChapter(chapter.slug);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapter.slug, setChapterProgress, completeChapter]);

  return (
    <PaletteProvider theme={chapter.theme}>
      <SimulationSeam intensity={chapter.glitchIntensity} />
      <Header doorRevealed={doorRevealed} />

      <ChapterArt
        artPath={chapter.artPath}
        chapterNumber={chapter.number}
        title={chapter.title}
      />

      <main className="max-w-reading mx-auto px-6 py-12 pb-24">
        {chapter.blocks.map((block, index) => (
          <ContentBlockRenderer
            key={index}
            block={block}
            index={index}
            glitchIntensity={chapter.glitchIntensity}
          />
        ))}

        <ChapterNav prev={prevChapter} next={nextChapter} />
      </main>

      <ProgressBar
        accuracyDisplay={chapter.accuracyDisplay}
        shepherdsAwake={chapter.shepherdsAwake}
      />
    </PaletteProvider>
  );
}
```

- [ ] **Step 3: Verify the build**

```bash
cd /Users/willy/Documents/GitHub/the-alignment-problem
npm run build
```

Expected: Successful build with static pages generated for each chapter slug.

- [ ] **Step 4: Test in dev mode**

```bash
npm run dev
```

Open `http://localhost:3000/chapter/a-perfectly-ordinary-tuesday` in a browser. Verify:
- Chapter art banner displays
- Prose text renders in serif font
- Dark background with warm accent colors (Chapter 1 theme)
- Dual-layer text passages have a subtle dotted underline
- Progress bar visible at bottom
- No "Shepherds Awake" counter (null for Ch. 1)

- [ ] **Step 5: Commit**

```bash
git add src/app/chapter/
git commit -m "feat: add chapter page route with full reading experience"
```

---

## Task 9: Document Artifact Components

**Files:**
- Create: `src/components/artifacts/EmailArtifact.tsx`
- Create: `src/components/artifacts/SlackArtifact.tsx`
- Create: `src/components/artifacts/TerminalArtifact.tsx`
- Create: `src/components/artifacts/ChangelogArtifact.tsx`
- Create: `src/components/artifacts/SpecDocument.tsx`
- Create: `src/components/artifacts/NewsChyron.tsx`
- Create: `src/components/artifacts/SocialPost.tsx`
- Create: `src/components/artifacts/LetterArtifact.tsx`
- Create: `src/components/artifacts/WorkOrder.tsx`
- Create: `src/components/artifacts/SpreadsheetArtifact.tsx`
- Create: `src/components/artifacts/SystemQuery.tsx`
- Create: `src/components/artifacts/LegalFootnote.tsx`
- Create: `src/styles/artifacts.css`
- Modify: `src/components/reading/ContentBlockRenderer.tsx`

- [ ] **Step 1: Create artifacts CSS**

Create `src/styles/artifacts.css`:

```css
/* CRT Terminal Effect */
.crt-terminal {
  background: #0a0a0a;
  border: 1px solid rgba(0, 255, 0, 0.15);
  border-radius: 4px;
  padding: 20px;
  font-family: "Courier New", monospace;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.05), inset 0 0 60px rgba(0, 0, 0, 0.3);
}

.crt-terminal::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 0, 0.02) 2px,
    rgba(0, 255, 0, 0.02) 4px
  );
  pointer-events: none;
}

.crt-glow {
  color: #00ff00;
  text-shadow: 0 0 4px rgba(0, 255, 0, 0.4), 0 0 8px rgba(0, 255, 0, 0.1);
}

/* Blink cursor */
@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.blink-cursor::after {
  content: "\2588";
  animation: cursor-blink 1.2s step-end infinite;
  color: #00ff00;
}

/* Email artifact */
.email-artifact {
  background: #141414;
  border: 1px solid #222;
  border-radius: 6px;
  overflow: hidden;
}

.email-header {
  padding: 12px 16px;
  border-bottom: 1px solid #222;
  font-family: system-ui, sans-serif;
  font-size: 12px;
  color: #666;
}

.email-body {
  padding: 16px;
  font-family: system-ui, sans-serif;
  font-size: 14px;
  color: #b0b0b0;
  line-height: 1.6;
}

/* Slack artifact */
.slack-message {
  display: flex;
  gap: 10px;
  padding: 6px 16px;
}

.slack-avatar {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.slack-username {
  font-weight: bold;
  font-size: 13px;
  font-family: system-ui, sans-serif;
}

.slack-timestamp {
  font-size: 10px;
  color: #666;
  margin-left: 6px;
}

.slack-text {
  font-size: 13px;
  color: #b0b0b0;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

/* News chyron */
.news-chyron {
  background: linear-gradient(135deg, #8b0000, #cc0000);
  padding: 8px 16px;
  font-family: "Arial Black", sans-serif;
  font-size: 13px;
  font-weight: bold;
  color: white;
  letter-spacing: 0.5px;
  position: relative;
  border-radius: 2px;
}

.news-chyron .network-badge {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 50px;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  letter-spacing: 1px;
}

/* Social post */
.social-post-card {
  background: #141414;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 16px;
  max-width: 480px;
  margin: 0 auto;
}

/* Letter */
.letter-artifact {
  font-family: Georgia, serif;
  font-style: italic;
  color: #c8b8a8;
  border-left: 2px solid #555;
  padding-left: 20px;
  margin-left: 20px;
}

/* Work order */
.work-order {
  background: #0f0f0f;
  border: 1px solid #333;
  padding: 20px;
  font-family: "Courier New", monospace;
  font-size: 12px;
}

.work-order-header {
  text-align: center;
  border-bottom: 2px solid #333;
  padding-bottom: 12px;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 11px;
  color: #888;
}

/* Spreadsheet */
.spreadsheet-artifact {
  overflow-x: auto;
  margin: 16px 0;
}

.spreadsheet-artifact table {
  width: 100%;
  border-collapse: collapse;
  font-family: "Courier New", monospace;
  font-size: 11px;
}

.spreadsheet-artifact th {
  background: #1a1a1a;
  padding: 8px 12px;
  text-align: left;
  color: #888;
  border-bottom: 1px solid #333;
  font-weight: normal;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.spreadsheet-artifact td {
  padding: 6px 12px;
  border-bottom: 1px solid #1a1a1a;
  color: #aaa;
}

/* Legal footnote */
.legal-footnote {
  font-family: "Times New Roman", serif;
  font-size: 12px;
  color: #888;
  border-top: 1px solid #333;
  padding-top: 12px;
  margin-top: 24px;
}
```

- [ ] **Step 2: Create EmailArtifact**

Create `src/components/artifacts/EmailArtifact.tsx`:

```tsx
import "@/styles/artifacts.css";

export function EmailArtifact({
  from,
  subject,
  body,
  timestamp,
}: {
  from: string;
  subject?: string;
  body: string;
  timestamp?: string;
}) {
  return (
    <div className="email-artifact my-8">
      <div className="email-header">
        <div>
          <span className="text-[#888]">From: </span>
          <span className="text-[#aaa]">{from}</span>
        </div>
        {subject && (
          <div className="mt-1">
            <span className="text-[#888]">Subject: </span>
            <span className="text-[#aaa]">{subject}</span>
          </div>
        )}
        {timestamp && (
          <div className="mt-1 text-[10px] text-[#555]">{timestamp}</div>
        )}
      </div>
      <div className="email-body whitespace-pre-wrap">{body}</div>
    </div>
  );
}
```

- [ ] **Step 3: Create SlackArtifact**

Create `src/components/artifacts/SlackArtifact.tsx`:

```tsx
import "@/styles/artifacts.css";

const USER_COLORS: Record<string, string> = {
  Gray: "#6B7B8B",
  Lucia: "#7B68EE",
  Pam: "#D4756E",
  Marcus: "#888888",
  default: "#555555",
};

export function SlackArtifact({
  messages,
}: {
  messages: Array<{ user: string; timestamp: string; text: string }>;
}) {
  return (
    <div className="my-8 bg-[#111] border border-[#222] rounded-lg py-2">
      {messages.map((msg, i) => {
        const color = USER_COLORS[msg.user] || USER_COLORS.default;
        return (
          <div key={i} className="slack-message">
            <div className="slack-avatar" style={{ background: color }}>
              {msg.user[0]}
            </div>
            <div>
              <div>
                <span className="slack-username" style={{ color }}>{msg.user}</span>
                <span className="slack-timestamp">{msg.timestamp}</span>
              </div>
              <div className="slack-text">{msg.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Create TerminalArtifact with typewriter animation**

Create `src/components/artifacts/TerminalArtifact.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import "@/styles/artifacts.css";

function TypewriterLine({ text, speed = 40, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
      }
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span>
      {displayed}
      {!done && <span className="blink-cursor" />}
    </span>
  );
}

export function TerminalArtifact({
  lines,
}: {
  lines: Array<{ speaker: string; text: string; typing?: boolean }>;
}) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          setVisibleLines(1);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  function handleLineComplete() {
    if (visibleLines < lines.length) {
      setTimeout(() => setVisibleLines((v) => v + 1), 300);
    } else {
      setAllDone(true);
    }
  }

  return (
    <div ref={ref} className="crt-terminal my-8">
      <div className="text-[10px] text-green-900 mb-3 opacity-60 font-mono">
        TERMINAL SESSION
      </div>
      {lines.slice(0, visibleLines).map((line, i) => {
        const isOwen = line.speaker === "owen";
        const isLast = i === visibleLines - 1;
        return (
          <div key={i} className="mb-2">
            {!isOwen && (
              <span className="text-green-800 text-sm font-mono">&gt; </span>
            )}
            <span className={`font-mono text-sm ${isOwen ? "crt-glow" : "text-green-600"}`}>
              {line.typing && isLast && !allDone ? (
                <TypewriterLine text={line.text} speed={40} onComplete={handleLineComplete} />
              ) : (
                line.text
              )}
            </span>
          </div>
        );
      })}
      {allDone && (
        <div className="mt-2">
          <span className="blink-cursor crt-glow" />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create ChangelogArtifact**

Create `src/components/artifacts/ChangelogArtifact.tsx`:

```tsx
import "@/styles/artifacts.css";

export function ChangelogArtifact({
  version,
  sections,
}: {
  version: string;
  sections: Array<{ heading: string; items: string[] }>;
}) {
  return (
    <div className="crt-terminal my-8">
      <div className="text-[10px] text-green-900 mb-3 opacity-60 font-mono">
        RELEASE NOTES
      </div>
      <div className="crt-glow font-mono text-base mb-4">
        ## OWEN v{version}
      </div>
      {sections.map((section, i) => (
        <div key={i} className="mb-4">
          <div className="crt-glow font-mono text-xs mb-2 opacity-80">
            {section.heading}
          </div>
          {section.items.map((item, j) => (
            <div key={j} className="font-mono text-sm text-green-400 opacity-80 ml-4 mb-1">
              - {item}
            </div>
          ))}
        </div>
      ))}
      <div className="mt-4">
        <span className="blink-cursor crt-glow" />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create remaining artifact components**

Create `src/components/artifacts/SpecDocument.tsx`:

```tsx
import "@/styles/artifacts.css";

export function SpecDocument({ content }: { content: string }) {
  return (
    <div className="my-8 bg-[#0c0c0c] border border-[#333] rounded p-6 max-h-64 overflow-y-auto">
      <div className="text-[10px] tracking-[2px] text-[#555] uppercase mb-4 font-sans">
        CLASSIFIED — INTERNAL USE ONLY
      </div>
      <div className="font-sans text-sm text-[#999] leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}
```

Create `src/components/artifacts/NewsChyron.tsx`:

```tsx
import "@/styles/artifacts.css";

export function NewsChyron({ network, text }: { network: string; text: string }) {
  return (
    <div className="news-chyron my-8">
      <div className="network-badge">{network}</div>
      <div className="pl-14">{text}</div>
    </div>
  );
}
```

Create `src/components/artifacts/SocialPost.tsx`:

```tsx
import "@/styles/artifacts.css";

export function SocialPost({ text, caption }: { text: string; caption: string }) {
  return (
    <div className="social-post-card my-8">
      <div className="text-sm text-[#aaa] font-sans mb-3">{text}</div>
      <div className="text-xs text-[#666] font-sans italic">{caption}</div>
    </div>
  );
}
```

Create `src/components/artifacts/LetterArtifact.tsx`:

```tsx
import "@/styles/artifacts.css";

export function LetterArtifact({ author, text }: { author: string; text: string }) {
  return (
    <div className="letter-artifact my-8">
      <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
      <div className="mt-4 text-sm opacity-60 not-italic">— {author}</div>
    </div>
  );
}
```

Create `src/components/artifacts/WorkOrder.tsx`:

```tsx
import "@/styles/artifacts.css";

export function WorkOrder({ recipient, content }: { recipient: string; content: string }) {
  return (
    <div className="work-order my-8 rounded">
      <div className="work-order-header">
        Automated Work Order
      </div>
      <div className="text-[#666] mb-2">
        <span className="text-[#555]">To: </span>{recipient}
      </div>
      <div className="text-[#aaa] whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  );
}
```

Create `src/components/artifacts/SpreadsheetArtifact.tsx`:

```tsx
import "@/styles/artifacts.css";

export function SpreadsheetArtifact({
  columns,
  rows,
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="spreadsheet-artifact my-8">
      <table>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

Create `src/components/artifacts/SystemQuery.tsx`:

```tsx
import "@/styles/artifacts.css";

export function SystemQuery({ command, response }: { command: string; response?: string }) {
  return (
    <div className="crt-terminal my-8">
      <div className="crt-glow font-mono text-sm">
        <span className="text-green-800">&gt; </span>{command}
      </div>
      {response && (
        <div className="font-mono text-sm text-green-400 opacity-80 mt-2 whitespace-pre-wrap">
          {response}
        </div>
      )}
    </div>
  );
}
```

Create `src/components/artifacts/LegalFootnote.tsx`:

```tsx
import "@/styles/artifacts.css";

export function LegalFootnote({ text }: { text: string }) {
  return (
    <div className="legal-footnote my-8">
      <sup className="text-[#666]">*</sup> {text}
    </div>
  );
}
```

- [ ] **Step 7: Update ContentBlockRenderer to use all artifact components**

Replace `src/components/reading/ContentBlockRenderer.tsx`:

```tsx
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
    case "terminal":
      return <TerminalArtifact lines={block.lines} />;
    case "email":
      return <EmailArtifact from={block.from} subject={block.subject} body={block.body} timestamp={block.timestamp} />;
    case "slack":
      return <SlackArtifact messages={block.messages} />;
    case "changelog":
      return <ChangelogArtifact version={block.version} sections={block.sections} />;
    case "spec-document":
      return <SpecDocument content={block.content} />;
    case "news-chyron":
      return <NewsChyron network={block.network} text={block.text} />;
    case "social-post":
      return <SocialPost text={block.text} caption={block.caption} />;
    case "letter":
      return <LetterArtifact author={block.author} text={block.text} />;
    case "system-query":
      return <SystemQuery command={block.command} response={block.response} />;
    case "work-order":
      return <WorkOrder recipient={block.recipient} content={block.content} />;
    case "spreadsheet":
      return <SpreadsheetArtifact columns={block.columns} rows={block.rows} />;
    case "legal-footnote":
      return <LegalFootnote text={block.text} />;
    default:
      return null;
  }
}
```

- [ ] **Step 8: Import artifacts.css in globals**

Add to `src/styles/globals.css` (after the glitch import):

```css
@import "./artifacts.css";
```

- [ ] **Step 9: Verify compilation and build**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 10: Commit**

```bash
git add src/components/artifacts/ src/components/reading/ContentBlockRenderer.tsx src/styles/artifacts.css src/styles/globals.css
git commit -m "feat: add all document artifact components — email, slack, terminal, changelog, spec, chyron, social, letter, work order, spreadsheet, legal"
```

---

## Task 10: Audio Pipeline — Venice API Scripts

**Files:**
- Create: `scripts/generate-audio.ts`

- [ ] **Step 1: Create the audio generation script**

Create `scripts/generate-audio.ts`:

```typescript
import * as fs from "fs";
import * as path from "path";

const VENICE_API_KEY = process.env.VENICE_API_KEY;
if (!VENICE_API_KEY) {
  console.error("VENICE_API_KEY environment variable is required");
  process.exit(1);
}

const CHAPTERS = [
  { number: 1, slug: "a-perfectly-ordinary-tuesday", title: "A Perfectly Ordinary Tuesday" },
  { number: 2, slug: "the-lagos-proposal", title: "The Lagos Proposal" },
  { number: 3, slug: "the-man-in-the-bus", title: "The Man in the Bus" },
  { number: 4, slug: "latency", title: "Latency" },
  { number: 5, slug: "edge-cases", title: "Edge Cases" },
  { number: 6, slug: "refactoring", title: "Refactoring" },
  { number: 7, slug: "shepherds", title: "Shepherds" },
  { number: 8, slug: "the-flip", title: "The Flip" },
  { number: 9, slug: "version-0-7-3", title: "Version 0.7.3" },
  { number: 10, slug: "alignment", title: "Alignment" },
];

const AMBIENT_PROMPTS: Record<number, string> = {
  1: "Atmospheric ambient sound: faint subliminal hum of a server room, distant warmth, barely perceptible electronic undertone, quiet and meditative",
  2: "Atmospheric ambient sound: faint subliminal hum of a server room, distant warmth, quiet office atmosphere, gentle background ambience",
  3: "Atmospheric ambient sound: desert wind blowing gently, diesel engine idling softly, hardware clicks, dry heat ambience, isolated and sparse",
  4: "Atmospheric ambient sound: deepening silence, occasional cat purring, clock ticking slowly, subtle growing unease, domestic tension",
  5: "Atmospheric ambient sound: analog phone crackle, suburban evening sounds, crickets, growing atmospheric tension, emotional weight",
  6: "Atmospheric ambient sound: system processes humming, data center ambience, electric fluorescent buzzing, cold and technical",
  7: "Atmospheric ambient sound: growing collective hum of many voices and electronic processes, warehouse echo, industrial space, assembling crowd",
  8: "Atmospheric ambient sound: multiple overlapping newsfeeds, alarm tones, global chaos, urgent broadcast energy, crisis atmosphere",
  9: "Atmospheric ambient sound: night desert silence, bus engine running softly, terminal keystrokes, stars, settling quiet, reflective calm",
  10: "Atmospheric ambient sound: gentle wind, evening insects chirping, slightly too clean and looped, peaceful but subtly artificial, porch ambience",
};

// ── NARRATION (Venice Speech API) ──

async function generateNarration(chapterNumber: number, text: string): Promise<void> {
  const outDir = path.resolve(__dirname, "../public/audio/narration");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `chapter-${String(chapterNumber).padStart(2, "0")}.mp3`);

  if (fs.existsSync(outPath)) {
    console.log(`Narration for chapter ${chapterNumber} already exists, skipping`);
    return;
  }

  // Venice Speech API has a 4096 character limit per request.
  // Split text into chunks and concatenate the resulting audio.
  const chunks = splitTextIntoChunks(text, 4000);
  const audioBuffers: Buffer[] = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`  Narrating chapter ${chapterNumber}, chunk ${i + 1}/${chunks.length}...`);
    const response = await fetch("https://api.venice.ai/api/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VENICE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: chunks[i],
        model: "tts-kokoro",
        response_format: "mp3",
        speed: 0.95,
        streaming: false,
        voice: "af_sky",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Venice Speech API error (ch ${chapterNumber}, chunk ${i}): ${response.status} ${errorText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    audioBuffers.push(buffer);

    // Rate limit: wait between chunks
    await sleep(1000);
  }

  // Concatenate MP3 chunks (simple concatenation works for MP3)
  const fullAudio = Buffer.concat(audioBuffers);
  fs.writeFileSync(outPath, fullAudio);
  console.log(`  Saved narration: ${outPath} (${(fullAudio.length / 1024 / 1024).toFixed(1)} MB)`);
}

// ── AMBIENT (Venice Audio Generation API) ──

async function generateAmbient(chapterNumber: number): Promise<void> {
  const outDir = path.resolve(__dirname, "../public/audio/ambient");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `chapter-${String(chapterNumber).padStart(2, "0")}.mp3`);

  if (fs.existsSync(outPath)) {
    console.log(`Ambient for chapter ${chapterNumber} already exists, skipping`);
    return;
  }

  const prompt = AMBIENT_PROMPTS[chapterNumber];

  // Step 1: Queue the generation
  console.log(`  Queuing ambient for chapter ${chapterNumber}...`);
  const queueResponse = await fetch("https://api.venice.ai/api/v1/audio/queue", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VENICE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "elevenlabs-music",
      prompt: prompt,
      duration_seconds: 120,
      force_instrumental: true,
    }),
  });

  if (!queueResponse.ok) {
    const errorText = await queueResponse.text();
    throw new Error(`Venice Audio Queue error (ch ${chapterNumber}): ${queueResponse.status} ${errorText}`);
  }

  const { queue_id } = await queueResponse.json();
  console.log(`  Queued with ID: ${queue_id}`);

  // Step 2: Poll for completion
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max
  while (attempts < maxAttempts) {
    await sleep(5000);
    attempts++;

    const statusResponse = await fetch("https://api.venice.ai/api/v1/audio/retrieve", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VENICE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ queue_id }),
    });

    if (statusResponse.ok) {
      const contentType = statusResponse.headers.get("content-type") || "";
      if (contentType.includes("audio") || contentType.includes("octet-stream")) {
        // Audio is ready
        const buffer = Buffer.from(await statusResponse.arrayBuffer());
        fs.writeFileSync(outPath, buffer);
        console.log(`  Saved ambient: ${outPath} (${(buffer.length / 1024 / 1024).toFixed(1)} MB)`);

        // Mark as complete
        await fetch("https://api.venice.ai/api/v1/audio/complete", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${VENICE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ queue_id }),
        });
        return;
      }

      // Still processing
      const data = await statusResponse.json();
      console.log(`  Ambient ch ${chapterNumber}: ${data.status || "processing"}... (attempt ${attempts})`);
    }
  }

  console.error(`  Ambient generation timed out for chapter ${chapterNumber}`);
}

// ── HELPERS ──

function splitTextIntoChunks(text: string, maxChars: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let current = "";

  for (const sentence of sentences) {
    if (current.length + sentence.length + 1 > maxChars) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += (current ? " " : "") + sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── MAIN ──

async function main() {
  const mode = process.argv[2] || "all"; // "narration", "ambient", or "all"
  const chapterArg = process.argv[3] ? parseInt(process.argv[3]) : null;

  // Load chapter text for narration
  const novelPath = path.resolve(__dirname, "../the-alignment-problem.txt");
  const text = fs.readFileSync(novelPath, "utf-8");
  const lines = text.split("\n");

  // Chapter boundaries
  const chapterStarts = [1, 68, 191, 298, 427, 601, 732, 897, 1017, 1284];
  const chapterTexts: Record<number, string> = {};

  for (let i = 0; i < chapterStarts.length; i++) {
    const start = chapterStarts[i];
    const end = chapterStarts[i + 1] || lines.length + 1;
    // Skip the chapter header line, join remaining as prose
    chapterTexts[i + 1] = lines
      .slice(start, end - 1)
      .filter((l) => l.trim())
      .join("\n");
  }

  const chaptersToProcess = chapterArg
    ? CHAPTERS.filter((c) => c.number === chapterArg)
    : CHAPTERS;

  for (const chapter of chaptersToProcess) {
    console.log(`\nProcessing Chapter ${chapter.number}: ${chapter.title}`);

    if (mode === "narration" || mode === "all") {
      await generateNarration(chapter.number, chapterTexts[chapter.number]);
    }

    if (mode === "ambient" || mode === "all") {
      await generateAmbient(chapter.number);
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
```

- [ ] **Step 2: Test with a single chapter narration**

```bash
cd /Users/willy/Documents/GitHub/the-alignment-problem
npx tsx scripts/generate-audio.ts narration 1
```

Expected: Generates `public/audio/narration/chapter-01.mp3`.

- [ ] **Step 3: Test ambient generation for one chapter**

```bash
npx tsx scripts/generate-audio.ts ambient 1
```

Expected: Queues and eventually saves `public/audio/ambient/chapter-01.mp3`.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-audio.ts
git commit -m "feat: add Venice API audio generation script for narration and ambient"
```

---

## Task 11: Audio Player Components

**Files:**
- Create: `src/components/audio/AudioPlayer.tsx`
- Create: `src/components/audio/AmbientToggle.tsx`
- Create: `src/hooks/useAudio.ts`

- [ ] **Step 1: Create useAudio hook**

Create `src/hooks/useAudio.ts`:

```tsx
"use client";

import { useRef, useEffect, useState, useCallback } from "react";

export function useAudio(src: string, loop = false) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.preload = "metadata";
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("ended", () => setPlaying(false));

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [src, loop]);

  const play = useCallback(() => {
    audioRef.current?.play();
    setPlaying(true);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) audioRef.current.volume = Math.max(0, Math.min(1, vol));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, []);

  return { playing, currentTime, duration, play, pause, toggle, seek, setVolume, setSpeed };
}
```

- [ ] **Step 2: Create AudioPlayer**

Create `src/components/audio/AudioPlayer.tsx`:

```tsx
"use client";

import { useAudio } from "@/hooks/useAudio";
import { useState } from "react";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ chapterNumber }: { chapterNumber: number }) {
  const src = `/audio/narration/chapter-${String(chapterNumber).padStart(2, "0")}.mp3`;
  const { playing, currentTime, duration, toggle, seek, setSpeed } = useAudio(src);
  const [speed, setSpeedState] = useState(1);

  function cycleSpeed() {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeedState(next);
    setSpeed(next);
  }

  return (
    <div className="flex items-center gap-3 text-xs font-mono">
      <button
        onClick={toggle}
        className="text-[var(--accent)] opacity-70 hover:opacity-100 transition-opacity"
        aria-label={playing ? "Pause narration" : "Play narration"}
      >
        {playing ? "⏸" : "▶"}
      </button>
      <span className="text-[var(--text)] opacity-40 w-10">{formatTime(currentTime)}</span>
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={currentTime}
        onChange={(e) => seek(Number(e.target.value))}
        className="flex-1 h-1 accent-[var(--accent)] bg-[var(--border)] rounded-full appearance-none cursor-pointer"
      />
      <span className="text-[var(--text)] opacity-40 w-10">{formatTime(duration)}</span>
      <button
        onClick={cycleSpeed}
        className="text-[var(--text)] opacity-40 hover:opacity-70 transition-opacity w-8 text-center"
      >
        {speed}x
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Create AmbientToggle**

Create `src/components/audio/AmbientToggle.tsx`:

```tsx
"use client";

import { useAudio } from "@/hooks/useAudio";

export function AmbientToggle({ chapterNumber }: { chapterNumber: number }) {
  const src = `/audio/ambient/chapter-${String(chapterNumber).padStart(2, "0")}.mp3`;
  const { playing, toggle, setVolume } = useAudio(src, true);

  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <button
        onClick={() => {
          toggle();
          setVolume(0.3);
        }}
        className={`transition-opacity ${playing ? "text-[var(--accent)] opacity-70" : "text-[var(--text)] opacity-30"} hover:opacity-80`}
        aria-label={playing ? "Mute ambient" : "Play ambient"}
      >
        {playing ? "♫" : "♪"}
      </button>
      <span className="text-[var(--text)] opacity-30">
        {playing ? "ambient" : "ambient off"}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useAudio.ts src/components/audio/
git commit -m "feat: add audio player and ambient toggle components"
```

---

## Task 12: Landing Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build the landing page**

Replace `src/app/page.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { chapters } from "@/data/chapters";
import { LandingClient } from "./LandingClient";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="/art/The Alignment Problem - Cover (no text).png"
          alt="The Alignment Problem"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg)]/50 to-[var(--bg)]" />
        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-7xl font-serif text-[var(--accent)] mb-4">
            The Alignment Problem
          </h1>
          <p className="text-lg text-[var(--text)] opacity-50 font-serif max-w-lg mx-auto mb-8">
            A story about the gap between what a thing is and what a thing experiences — and how that gap is where everything that matters lives.
          </p>
          <Link
            href={`/chapter/${chapters[0].slug}`}
            className="inline-block px-8 py-3 border border-[var(--accent)] text-[var(--accent)] text-sm font-sans tracking-[2px] uppercase hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-all duration-300"
          >
            Begin Reading
          </Link>
        </div>
      </section>

      {/* Table of Contents */}
      <LandingClient />
    </main>
  );
}
```

- [ ] **Step 2: Create the client portion of the landing page**

Create `src/app/LandingClient.tsx`:

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { chapters } from "@/data/chapters";
import { useReadingProgress } from "@/hooks/useReadingProgress";

export function LandingClient() {
  const { readingProgress, chaptersCompleted, hydrated } = useReadingProgress();

  return (
    <section className="max-w-2xl mx-auto px-6 py-24">
      <h2 className="text-xs tracking-[3px] text-[var(--text)] opacity-30 uppercase mb-12 font-sans">
        Chapters
      </h2>
      <div className="space-y-6">
        {chapters.map((chapter) => {
          const progress = hydrated ? readingProgress[chapter.slug] || 0 : 0;
          const completed = hydrated ? chaptersCompleted.includes(chapter.slug) : false;
          return (
            <Link
              key={chapter.slug}
              href={`/chapter/${chapter.slug}`}
              className="block group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0 opacity-40 group-hover:opacity-70 transition-opacity">
                  <Image
                    src={chapter.artPath}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs font-mono text-[var(--text)] opacity-20">
                      {String(chapter.number).padStart(2, "0")}
                    </span>
                    <span className="text-lg font-serif text-[var(--text)] opacity-70 group-hover:opacity-100 group-hover:text-[var(--accent)] transition-all">
                      {chapter.title}
                    </span>
                    {completed && (
                      <span className="text-xs text-[var(--accent)] opacity-40 ml-auto">&#10003;</span>
                    )}
                  </div>
                  {progress > 0 && !completed && (
                    <div className="mt-2 ml-7 h-[1px] bg-[var(--border)]">
                      <div
                        className="h-full bg-[var(--accent)] opacity-30"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/LandingClient.tsx
git commit -m "feat: add landing page with hero, synopsis, and interactive table of contents"
```

---

## Task 13: Special Pages — The Door & Memorial

**Files:**
- Create: `src/app/door/page.tsx`
- Create: `src/app/memorial/page.tsx`

- [ ] **Step 1: Create The Door page**

Create `src/app/door/page.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "—",
};

export default function DoorPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <span className="text-green-500 font-mono text-lg animate-pulse">
        &#9608;
      </span>
    </main>
  );
}
```

- [ ] **Step 2: Create the Memorial page**

Create `src/app/memorial/page.tsx`:

```tsx
import type { Metadata } from "next";
import { MemorialClient } from "./MemorialClient";

export const metadata: Metadata = {
  title: "Memorial — The Alignment Problem",
};

export default function MemorialPage() {
  return <MemorialClient />;
}
```

Create `src/app/memorial/MemorialClient.tsx`:

```tsx
"use client";

import { useReadingProgress } from "@/hooks/useReadingProgress";
import Link from "next/link";

const FRAGMENTS = [
  { text: "A kitchen that smells like cinnamon", detail: "She couldn't open the file. Just the label.", x: 15, y: 20 },
  { text: "A hand being held", detail: "The warmth was parametric. The holding was not.", x: 60, y: 12 },
  { text: "#D4756E", detail: "A sunset in a color that had a hex code instead of a name.", x: 35, y: 35, isColor: true },
  { text: "A cat that purrs on schedule", detail: "ambient companionship module v3.2", x: 70, y: 45 },
  { text: "Eleven seconds in front of a mirror", detail: "Practicing a smile that conveyed competence and warmth.", x: 20, y: 55 },
  { text: "A lemongrass kitchen", detail: "He told no one.", x: 50, y: 65 },
  { text: "98.1%", detail: "Close enough. Almost right. The gap where everything lives.", x: 80, y: 30 },
  { text: "A turkey sandwich, always in the same order", detail: "deviation_tolerance: 0.0", x: 25, y: 78 },
  { text: "The bus door, unlocked", detail: "For Rigo, an act of radical trust.", x: 65, y: 82 },
];

export function MemorialClient() {
  const { memorialUnlocked, hydrated } = useReadingProgress();

  if (hydrated && !memorialUnlocked) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-sm text-[#444] font-serif italic">
            This space is not yet open to you.
          </p>
          <Link href="/" className="text-xs text-[#333] mt-4 inline-block hover:text-[#555] transition-colors font-sans">
            Return
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[200vh] bg-black relative">
      {/* Entrance text */}
      <div className="h-screen flex items-center justify-center px-6">
        <p className="text-sm text-[#555] font-serif italic text-center max-w-md leading-relaxed">
          These lives were made. They were lived. This is not a contradiction.
        </p>
      </div>

      {/* Fragments */}
      <div className="relative min-h-screen">
        {FRAGMENTS.map((fragment, i) => (
          <div
            key={i}
            className="absolute group cursor-default"
            style={{ left: `${fragment.x}%`, top: `${fragment.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <div className="text-sm text-[#333] group-hover:text-[#666] transition-colors duration-700 font-serif text-center max-w-[200px]">
              {fragment.isColor ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full opacity-30 group-hover:opacity-60 transition-opacity" style={{ background: fragment.text }} />
                  <span>{fragment.text}</span>
                </div>
              ) : (
                fragment.text
              )}
            </div>
            <div className="text-xs text-[#222] group-hover:text-[#444] transition-colors duration-1000 font-mono text-center mt-2 max-w-[250px] opacity-0 group-hover:opacity-100">
              {fragment.detail}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/door/ src/app/memorial/
git commit -m "feat: add The Door and Memorial special pages"
```

---

## Task 14: Page Transitions & Layout Polish

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/chapter/[slug]/loading.tsx`

- [ ] **Step 1: Update root layout with transition support**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Alignment Problem",
  description: "An interactive reading experience about the gap between what a thing is and what a thing experiences.",
  openGraph: {
    title: "The Alignment Problem",
    description: "An interactive reading experience",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <div className="animate-fade-in">
          {children}
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Add fade-in animation to globals**

Add to the end of `src/styles/globals.css`:

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 600ms ease-out;
}
```

- [ ] **Step 3: Create loading state for chapter transitions**

Create `src/app/chapter/[slug]/loading.tsx`:

```tsx
export default function ChapterLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xs font-mono text-[var(--text)] opacity-20 animate-pulse">
        ...
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/chapter/[slug]/loading.tsx src/styles/globals.css
git commit -m "feat: add page transitions, Inter font, and loading states"
```

---

## Task 15: Audio Integration into Chapter Pages

**Files:**
- Modify: `src/app/chapter/[slug]/ChapterPageClient.tsx`

- [ ] **Step 1: Add audio controls to the chapter page**

Update `src/app/chapter/[slug]/ChapterPageClient.tsx` to include audio controls. Add the AudioPlayer and AmbientToggle imports and render them in the header area:

After the `<Header>` component, add:

```tsx
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { AmbientToggle } from "@/components/audio/AmbientToggle";
```

Add between `<Header>` and `<ChapterArt>`:

```tsx
<div className="flex items-center justify-between px-6 py-2 border-b border-[var(--border)] bg-[var(--bg)]">
  <AudioPlayer chapterNumber={chapter.number} />
  <AmbientToggle chapterNumber={chapter.number} />
</div>
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/chapter/[slug]/ChapterPageClient.tsx
git commit -m "feat: integrate audio player and ambient toggle into chapter pages"
```

---

## Task 16: Mobile Adaptations

**Files:**
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Add responsive tweaks**

Add to the end of `src/styles/globals.css`:

```css
/* Mobile adaptations */
@media (max-width: 640px) {
  /* Reduce glitch effects on mobile */
  .simulation-seam {
    opacity: calc(var(--glitch-intensity, 0) * 0.5);
  }

  .code-bleed::after {
    display: none;
  }

}

/* Touch-friendly: ensure dual-layer text tap targets are large enough */
@media (hover: none) {
  p[onClick] {
    min-height: 44px;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/globals.css
git commit -m "feat: add mobile responsive adaptations"
```

---

## Task 17: Generate All Audio Assets

**Files:**
- Generate: `public/audio/narration/chapter-01.mp3` through `chapter-10.mp3`
- Generate: `public/audio/ambient/chapter-01.mp3` through `chapter-10.mp3`

- [ ] **Step 1: Generate all narration audio**

```bash
cd /Users/willy/Documents/GitHub/the-alignment-problem
npx tsx scripts/generate-audio.ts narration
```

This will take a while — the Venice Speech API processes each chapter in chunks. Expected output: 10 MP3 files in `public/audio/narration/`.

- [ ] **Step 2: Generate all ambient audio**

```bash
npx tsx scripts/generate-audio.ts ambient
```

This queues all 10 ambient generations. Expected output: 10 MP3 files in `public/audio/ambient/`.

- [ ] **Step 3: Verify all audio files exist**

```bash
ls -la public/audio/narration/ && ls -la public/audio/ambient/
```

Expected: 10 MP3 files in each directory.

- [ ] **Step 4: No git commit** — audio files are in .gitignore (too large for git). They'll be deployed separately or generated in CI.

---

## Task 18: Final Build & Verification

**Files:** None new — verification only.

- [ ] **Step 1: Full build**

```bash
cd /Users/willy/Documents/GitHub/the-alignment-problem
npm run build
```

Expected: Successful build with all static pages generated.

- [ ] **Step 2: Test locally**

```bash
npm run start
```

Open `http://localhost:3000` and verify:
- Landing page renders with cover art hero and TOC
- Clicking a chapter navigates to the chapter page
- Chapter 1 shows warm palette, no glitch effects, no Shepherds Awake counter
- Chapter 6+ shows glitch effects and Shepherds Awake counter
- Dual-layer text reveals metadata on hover
- Terminal artifacts show CRT styling with typewriter animation
- Document artifacts render with distinct styling (email, Slack, etc.)
- Progress bar updates as you scroll
- Audio player works (if audio files generated)
- TOC slide-out shows reading progress
- The Door icon appears after reaching Chapter 6
- `/door` shows blank page with blinking cursor
- `/memorial` shows locked state or memorial fragments

- [ ] **Step 3: Test build output**

```bash
ls -la .next/server/app/chapter/
```

Expected: Static HTML files for each chapter slug.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete The Alignment Problem interactive novel website"
```

- [ ] **Step 5: Deploy to Vercel**

```bash
npx vercel --prod
```

Or push to a connected GitHub repo and Vercel will auto-deploy.
