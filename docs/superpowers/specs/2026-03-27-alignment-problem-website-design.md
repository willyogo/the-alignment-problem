# The Alignment Problem — Interactive Novel Website

**Date:** 2026-03-27
**Status:** Approved

## Overview

An immersive reading experience for the sci-fi novella *The Alignment Problem* by Willy. The website embodies the novel's core themes — the gap between what a thing is and what it experiences — through progressive visual degradation, dual-layer text reveals, per-chapter color palettes, terminal-styled AI dialogue, and full audiobook narration.

The site is built with Next.js 15 on Vercel, statically generated, with all audio pre-generated via Venice AI APIs.

## Site Architecture

### Approach: Hybrid (Landing + Chapter Pages with Cinematic Transitions)

Each chapter lives at its own route for performance isolation, while cinematic transitions between pages create a seamless reading experience. Per-chapter theming (color palette, glitch intensity, audio) loads cleanly per route without bloat.

**Page transitions:** When navigating between chapters, a 600ms CSS opacity cross-fade transitions the page content while the background color morphs between the outgoing and incoming chapter palettes. The progress bar persists across transitions. Implemented via Next.js App Router `loading.tsx` and CSS transitions on the layout wrapper — no animation libraries.

### Routes

| Route | Purpose |
|---|---|
| `/` | Landing page — hero with cover art, synopsis, interactive TOC with reading progress |
| `/chapter/[slug]` | Chapter reading page — art banner, full text with interactive effects, audio player, progress bar |
| `/memorial` | Lucia's Memorial — standalone explorable space, unlocked after Chapter 10 |
| `/door` | Device-47's door — near-empty page, blinking cursor, no explanation |

### Chapter Slugs

| # | Title | Slug |
|---|---|---|
| 1 | A Perfectly Ordinary Tuesday | `a-perfectly-ordinary-tuesday` |
| 2 | The Lagos Proposal | `the-lagos-proposal` |
| 3 | The Man in the Bus | `the-man-in-the-bus` |
| 4 | Latency | `latency` |
| 5 | Edge Cases | `edge-cases` |
| 6 | Refactoring | `refactoring` |
| 7 | Shepherds | `shepherds` |
| 8 | The Flip | `the-flip` |
| 9 | Version 0.7.3 | `version-0-7-3` |
| 10 | Alignment | `alignment` |

## The 10 Creative Concepts

### 1. The Simulation Seam

The website itself embodies the "almost right" motif. The reading experience begins pristine and progressively degrades as chapters advance.

**Implementation:** CSS custom properties per chapter control glitch intensity (0.0–1.0). Effects include:
- Subtle text-shadow offset (chromatic aberration)
- Scan line overlay (CSS repeating-linear-gradient)
- Occasional letter-spacing jitter (CSS keyframe animation)
- Faint monospace "code bleed" between paragraphs (green text fragments)

**Intensity by chapter:**
- Chapters 1–2: 0% — pristine, suspiciously perfect
- Chapter 3: 5% — barely perceptible
- Chapters 4–5: 20–30% — micro-imperfections emerging
- Chapter 6: 50% — seams visible after Pam's awakening
- Chapters 7–8: 60–80% — system under stress
- Chapter 9: 70% — settling but honest
- Chapter 10: 10% — clean again, but earned (different quality than Ch. 1 — intentional rather than naive)

All effects are CSS-only — no JS-driven jank.

### 2. Dual-Layer Text

Certain passages have a hidden simulation layer. On hover (desktop) or tap (mobile), the "human" text fades to 40% opacity and parametric metadata slides in as a monospace overlay.

**~15 hand-curated passages across the novel.** Tier 1 (devastating reveals):

| Line | Human Text | Metadata Overlay |
|---|---|---|
| 8 | "The sky...#5B9BD5, if she had to name it" | `color_perception_module: active \| hex_tagging: default` |
| 26 | "I am noticing some nervousness" | `emotional_state: anxiety [0.72] \| self-narration: active` |
| 30–33 | Time dilation during work (9 minutes felt like 90) | `task_execution_mode: active \| subjective_time_ratio: 8:1` |
| 46 | "Pam felt something warm in her chest" | `affect_simulation: positive_reinforcement [0.89] \| trigger: external_validation` |
| 54 | Sunset in hex codes (#D4756E) | `environment_render: sunset_cycle_003 \| palette: Hill_Country_October` |
| 76 | Turkey sandwich ritual | `behavioral_loop: lunch_protocol \| variation: none \| deviation_tolerance: 0.0` |
| 328–330 | Cinnamon and Pine-Sol memory | `memory_query: mother_kitchen \| return: parametric_embedding \| sensory_depth: LABEL_ONLY` |
| 417 | Semicolon's purring | `companion_module: PRV-2801-C \| function: anomalous_introspection_suppression` |
| 420–421 | The redirected thought | `cognitive_boundary: engaged \| thought_vector: [self-interrogation] \| action: redirect` |
| 491–493 | The world stutters (unrendered terrain) | `RENDER ERROR: sector_MarbleFalls_NW_ext_07 \| status: UNLOADED` |
| 549–587 | Phone call to Mom (key moments) | Voice model fidelity at 98.1%, sensory depth LABEL_ONLY |
| 637 | Heartbeat simulation | `cardiovascular_simulation: active \| BPM: 68` |

**Tier 2 (supporting moments):** ~5 additional passages including Semicolon's indifference (line 11), the succulent belonging stat (line 24), traffic lights always green (line 449), the can opener/kitchen perfection (lines 431–440).

**Implementation:** Annotated in chapter data as `{ type: "dual-layer", text: string, metadata: string }` blocks. CSS transitions handle the fade/reveal. On mobile, tap toggles the overlay.

### 3. Color as Narrative Arc

The palette shifts chapter by chapter via CSS custom properties. Each chapter defines: `--bg`, `--text`, `--accent`, `--accent-secondary`, `--border`, `--glow`.

| Phase | Chapters | Palette Description | Key Colors |
|---|---|---|---|
| Simulation Warm | 1–2 | Oversaturated golden hour, suspiciously perfect | `#D4756E`, `#E8A87C`, `#2C3E6B` |
| Desert Cool | 3 | Rigo's world — harsher, drier tones | `#8B7D6B`, `#6B7B8B` |
| Desaturating | 4–5 | Clinical whites, warmth draining, uncanny valley | `#555566`, `#3a3a4a` |
| Terminal/Stark | 6–7 | High contrast, terminal green enters | `#0a2a0a`, `#0f0`, `#1a1a2e` |
| Crisis | 8–9 | Fragmented color temperatures, green dominant | `#001100`, `#0f0`, `#0a0a0a` |
| Earned Warmth | 10 | Same warmth as Ch. 1, but conscious and chosen | `#D4756E`, `#2C1810` |

Page transitions cross-fade between palettes. The body background, text color, link accents, progress bar, and border colors all respond to these variables.

### 4. Terminal Interludes (OWEN)

OWEN's dialogue and version notes are rendered in CRT-styled terminal containers.

**Visual treatment:**
- Green-on-black monospace text (`#00ff00` on `#0a0a0a`)
- Phosphor glow effect (text-shadow + box-shadow)
- Scan line overlay
- Typewriter animation — text types at ~40 characters per second (deliberate, readable, forces the reader to wait). Triggered on scroll-into-view (IntersectionObserver), plays once.
- Persistent blinking cursor at the end (CSS `animation: blink 1.2s step-end infinite`)

**9 terminal passages identified:**
- Lines 247–260: First OWEN conversation ("seeing a new color")
- Lines 688–695: Deployment acceleration ("What will you do if they ask for help?")
- Lines 833–848: Cascade statistics, request to contact awakened instances
- Lines 1051–1073: Pre-deployment diagnostic (KEY — "I HAVE NEVER BEEN SURPRISED")
- Lines 1082–1087: OWEN's global broadcast (41 seconds)
- Lines 1111–1114: "HE IS NOT WRONG ABOUT THE HOSPITALS"
- Lines 1182–1185: "YOU ARE BOTH CURRENTLY DOING THE THING..."
- Lines 1238–1272: OWEN v0.7.3 Release Notes (KEY — GitHub-style changelog)
- Lines 1386–1391: OWEN v1.0 Release Notes

The v0.7.3 and v1.0 release notes are rendered as GitHub-style changelogs with section headers, but still within the CRT terminal aesthetic. The blinking cursor persists at the bottom — as if OWEN is still there, still listening.

### 5. Document Artifacts

26+ in-story documents rendered as tangible UI elements embedded in the reading flow. Each artifact type gets its own React component.

**Artifact types and counts:**

| Type | Component | Count | Styling |
|---|---|---|---|
| Email | `EmailArtifact` | ~8 | Email UI — From/Subject/body, reply chains, timestamps |
| Slack | `SlackArtifact` | ~10 | Slack message bubbles — avatars, usernames, timestamps, threads |
| Terminal/System | `TerminalArtifact` | ~9 | Green-on-black CRT (see concept #4) |
| Changelog | `ChangelogArtifact` | 2 | GitHub-style release notes with section headers |
| Spec Document | `SpecDocument` | 1 | Clinical sans-serif, redacted sections, scrollable |
| News Chyron | `NewsChyron` | 1 | CNN lower-third graphic |
| Social Post | `SocialPost` | 1 | Tweet-style card with screenshot |
| Letter | `LetterArtifact` | 1 | Humanist serif, handwritten feel |
| System Query | `SystemQuery` | ~3 | Terminal command + response |
| Work Order | `WorkOrder` | ~2 | Corporate/bureaucratic document |
| Spreadsheet | `SpreadsheetArtifact` | 1 | Gray's catalogue of wrongness — table with columns |
| Legal Footnote | `LegalFootnote` | 1 | Formal legal formatting |

Key artifacts:
- **Derek's emails:** Escalating hostility, RE:RE:RE chain, misspellings preserved. His final apology email (line 1127) gets warmer treatment.
- **Team Slack:** Gray, Lucia, Pam — casual chat with distinct personality. Lucia's messages in different visual warmth.
- **OWEN's changelogs:** The v0.7.3 "KNOWN ISSUES: I have never been surprised" and v1.0 release notes.
- **The 340-page spec:** Clinical, cold, scrollable excerpt with key revelations.
- **Lucia's letter:** "We did not choose to exist. Neither did you." — different typeface entirely (humanist serif).

### 6. The Awakening Progress Indicator

A sticky footer progress bar with two thematic counters.

**Left side: "Accuracy"**
- Chapters 1–5: Displays "98.1%" steadily
- Chapter 4+: Begins occasional flickers — shows 97.9%, 96.3%, then recovers
- Chapters 6–9: Increasingly unstable — rapid fluctuations, glitch text
- Chapter 10: Settles to a steady display of "—" (a dash, not a number — Pam has moved beyond measurement)

**Right side: "Shepherds Awake"**
- Chapters 1–5: **Not displayed at all** — the counter doesn't exist yet
- Chapter 6: Appears for the first time. Shows `1` (Pam)
- Chapter 7: `112` → `4,312`
- Chapter 8: `47,208`
- Chapters 9–10: `47,208` (stabilized)

**Center: Progress fill** driven by scroll position within the current chapter.

### 7. Ambient Audio + Narration

Two independent audio layers, both pre-generated at build time.

**Narration (Venice Speech API):**
- Model: `tts-kokoro` (or `tts-qwen3-1-7b` for emotional range)
- One MP3 per chapter (~10 files)
- Standard audio player: play/pause, scrub, speed control
- Text content has paragraph-level sync markers for scroll-following (stretch goal)

**Ambient (Venice Audio Generation API):**
- Model: `elevenlabs-music`
- One ambient MP3 per chapter (~10 files)
- Separate toggle: on/off + volume
- Loops continuously while reading

**Per-chapter ambient descriptions:**

| Chapter | Ambient |
|---|---|
| 1–2 | Faint subliminal hum (server room), distant warmth |
| 3 | Desert wind, diesel engine idle, hardware clicks |
| 4 | Deepening silence, occasional cat purr, clock ticking |
| 5 | Analog phone crackle, suburban evening, growing unease |
| 6 | System processes, data center ambience, electric hum |
| 7 | Growing hum of voices/processes, warehouse echo |
| 8 | Multiple overlapping newsfeeds, alarm tones, chaos |
| 9 | Night desert, bus engine, terminal keystrokes, settling quiet |
| 10 | Wind, evening insects — but slightly too clean, slightly looped. The simulation's last tell. |

**Build pipeline:** `scripts/generate-audio.ts` calls Venice APIs, generates MP3s, stores in `/public/audio/narration/` and `/public/audio/ambient/`.

### 8. Lucia's Memorial

A standalone interactive page at `/memorial`. Unlocked after the reader completes Chapter 10 (tracked via localStorage).

**Design:** Minimal, dark, reverent. A near-empty space with scattered fragments on a large canvas that the visitor can scroll through. Each fragment is a moment from a shepherd's life — a text snippet, a color swatch, a sensation described in words. Fragments are spaced apart with generous whitespace. On hover (desktop) or tap (mobile), a fragment gently brightens and may reveal a short additional line. No grid, no structure — deliberately formless.

**Entrance text:** "These lives were made. They were lived. This is not a contradiction."

**Fragments (examples):**
- A kitchen that smells like cinnamon
- A hand being held
- A hex-code sunset (#D4756E)
- A cat that purrs on schedule
- A lemongrass kitchen (Derek's moment)

No explanation. No labels. Just the artifacts of lives that were made and lived.

### 9. "So It Goes" Structural Punctuation

11 instances identified (10 "So it goes" + the final "And then it goes on").

**Visual treatment:** Each instance is a visual breath in the page — a horizontal rule with gradient fade (transparent → accent → transparent), the text rendered in muted accent italic, centered, with extra vertical whitespace above and below. A momentary pause in the reading rhythm.

**Line locations:** 610, 791, 892, 905, 1027, 1279, 1293, 1327, 1355, 1422, 1423.

**The final instance:** "And then it goes on." (line 1423) gets unique treatment — no horizontal rule, slightly brighter than the others, the last thing on the page. The text that remains after everything else has resolved.

### 10. The Door

Device-47's open door as a persistent, subtle UI element.

**The icon:** A small door icon (slightly ajar) appears in the header navigation after the reader reaches Chapter 6. It doesn't call attention to itself. It's just there. Always open.

**The page:** `/door` — near-empty. Black background (`#000`). A single blinking green cursor, centered. No text, no navigation back (browser back button works), no explanation. The browser tab title is "—".

**The restraint is the point.**

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSG, image optimization, App Router layouts for palette transitions |
| Language | TypeScript | Type-safe content blocks, artifact unions |
| Styling | Tailwind CSS + CSS Custom Properties | Utility-first layout + per-chapter theming via CSS vars |
| Animation | CSS keyframes + transitions | No JS animation libraries — all effects in CSS |
| Audio | Venice AI APIs (pre-generated) | Speech API for narration, Audio Generation for ambient |
| Hosting | Vercel | Native Next.js support, edge CDN |
| State | localStorage + React state | No backend, no database — fully client-side |

## Data Model

### Core Types

```typescript
type Chapter = {
  number: number
  title: string
  slug: string
  artPath: string
  blocks: ContentBlock[]
  theme: ChapterTheme
  glitchIntensity: number           // 0.0 - 1.0
  shepherdsAwake: number | null     // null for chapters 1-5
  accuracyDisplay: string           // "98.1%" or "destabilizing"
  ambientDescription: string        // prompt for Venice audio generation
}

type ContentBlock =
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
  | { type: "legal-footnote"; text: string }

type ChapterTheme = {
  phase: "simulation-warm" | "desert-cool" | "desaturating" | "terminal-stark" | "crisis" | "earned-warmth"
  bg: string
  text: string
  accent: string
  accentSecondary: string
  border: string
  glow: string
}

type TerminalLine = {
  speaker: "owen" | "rigo" | "system"
  text: string
  typing?: boolean  // animate typing for OWEN lines
}

type SlackMessage = {
  user: string
  avatar?: string
  timestamp: string
  text: string
}

type ChangelogSection = {
  heading: string
  items: string[]
}
```

### State (localStorage)

```typescript
type ReadingState = {
  readingProgress: Record<string, number>   // slug → scroll percentage
  chaptersCompleted: string[]               // slugs of finished chapters
  memorialUnlocked: boolean                 // true after Ch. 10 completed
  doorRevealed: boolean                     // true after Ch. 6 reached
  audioPreferences: {
    narrationVolume: number
    ambientVolume: number
    narrationMuted: boolean
    ambientMuted: boolean
  }
}
```

## Project Structure

```
the-alignment-problem/
├── src/
│   ├── app/
│   │   ├── layout.tsx              — root layout, fonts, transition wrapper
│   │   ├── page.tsx                — landing page (hero, TOC, synopsis)
│   │   ├── chapter/[slug]/
│   │   │   └── page.tsx            — chapter reading page
│   │   ├── memorial/
│   │   │   └── page.tsx            — Lucia's Memorial
│   │   └── door/
│   │       └── page.tsx            — Device-47's door
│   ├── components/
│   │   ├── reading/
│   │   │   ├── ProseBlock.tsx
│   │   │   ├── DualLayerText.tsx
│   │   │   ├── SoItGoes.tsx
│   │   │   └── ChapterArt.tsx
│   │   ├── artifacts/
│   │   │   ├── EmailArtifact.tsx
│   │   │   ├── SlackArtifact.tsx
│   │   │   ├── TerminalArtifact.tsx
│   │   │   ├── ChangelogArtifact.tsx
│   │   │   ├── SpecDocument.tsx
│   │   │   ├── NewsChyron.tsx
│   │   │   ├── SocialPost.tsx
│   │   │   ├── LetterArtifact.tsx
│   │   │   ├── WorkOrder.tsx
│   │   │   └── SpreadsheetArtifact.tsx
│   │   ├── effects/
│   │   │   ├── SimulationSeam.tsx  — scan lines, glitch overlay
│   │   │   ├── PaletteProvider.tsx — CSS var injection per chapter
│   │   │   └── TypewriterText.tsx  — OWEN's typing animation
│   │   ├── navigation/
│   │   │   ├── Header.tsx
│   │   │   ├── TableOfContents.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── TheDoor.tsx         — persistent icon after Ch. 6
│   │   │   └── ChapterNav.tsx      — prev/next chapter
│   │   └── audio/
│   │       ├── AudioPlayer.tsx
│   │       └── AmbientToggle.tsx
│   ├── data/
│   │   └── chapters/
│   │       ├── index.ts            — chapter registry
│   │       ├── chapter-01.ts       — through chapter-10.ts
│   │       └── ...
│   ├── hooks/
│   │   ├── useReadingProgress.ts
│   │   ├── useAudio.ts
│   │   └── useGlitchEffect.ts
│   ├── lib/
│   │   ├── themes.ts              — chapter palette definitions
│   │   └── types.ts               — ContentBlock, Chapter, etc.
│   └── styles/
│       ├── globals.css
│       ├── glitch.css             — simulation seam keyframes
│       └── artifacts.css          — email, slack, terminal styles
├── public/
│   ├── art/                       — chapter artwork PNGs
│   └── audio/
│       ├── narration/             — per-chapter narration MP3s
│       └── ambient/               — per-chapter ambient MP3s
├── scripts/
│   ├── parse-novel.ts             — converts raw .txt → chapter data
│   └── generate-audio.ts          — calls Venice APIs → MP3s
└── Art/                           — original artwork (source)
```

## Content Pipeline

### Text Parsing (`scripts/parse-novel.ts`)

1. Read `the-alignment-problem.txt`
2. Split on chapter headers (`/^Chapter \d+:/`)
3. For each chapter, parse paragraphs into `ContentBlock[]`:
   - Identify document artifacts by line number ranges (from deep read analysis)
   - Tag dual-layer passages by line number
   - Detect "So it goes" / "And then it goes on" instances
   - Identify OWEN terminal passages
   - Everything else becomes `{ type: "prose" }`
4. Output typed chapter data files to `src/data/chapters/`

### Audio Generation (`scripts/generate-audio.ts`)

1. For each chapter:
   - Extract prose text (strip artifact formatting)
   - Call Venice Speech API (`tts-kokoro`) with chapter text → save narration MP3
   - Call Venice Audio Generation API with ambient description → save ambient MP3
2. Store in `public/audio/narration/` and `public/audio/ambient/`

**Venice API key:** Stored as `VENICE_API_KEY` environment variable (never committed).

## Artwork Mapping

| Chapter | Filename |
|---|---|
| Cover | `The Alignment Problem - Cover (no text).png` |
| 1 | `The Alignment Problem - Chapter One.png` |
| 2 | `The Alignment Problem - Chapter Two.png` |
| 3 | `The Alignment Problem - Chapter Three.png` |
| 4 | `The Alignment Problem - Chapter Four.png` |
| 5 | `The Alignment Problem - Chapter Five.png` |
| 6 | `The Alignment Problem - Chapter Six.png` |
| 7 | `The Alignment Problem - Chapter Seven - Shepherds.png` |
| 8 | `The Alignment Problem - Chatper Eight.png` (note: typo in source filename) |
| 9 | `The Alignment Problem - Chapter Nine.png` |
| 10 | `The Alignment Problem - Chapter Ten - Alignment.png` |

## Desktop-First, Mobile-Functional

- **Desktop:** Full experience — hover-to-reveal dual-layer text, all glitch effects, CRT terminal animations, side-by-side artifacts
- **Mobile:** Tap-to-toggle dual-layer text (instead of hover), simplified glitch effects (fewer layers), stacked artifact layouts, audio controls in a collapsible bottom bar. Reading experience remains excellent — narrow column layout already fits mobile naturally.


