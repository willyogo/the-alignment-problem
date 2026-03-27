/**
 * parse-novel.ts
 *
 * Parses the-alignment-problem.txt into structured TypeScript chapter data files.
 * Run with: npx tsx scripts/parse-novel.ts
 */

import * as fs from "fs";
import * as path from "path";

// ────────────────────────────────────────────
// Chapter boundaries (verified against source)
// ────────────────────────────────────────────
const CHAPTER_DEFS = [
  {
    number: 1,
    startLine: 1,
    title: "A Perfectly Ordinary Tuesday",
    slug: "a-perfectly-ordinary-tuesday",
    artFile: "The Alignment Problem - Chapter One.png",
    glitchIntensity: 0,
    shepherdsAwake: null as number | null,
    accuracyDisplay: "98.1%",
    ambientDescription:
      "Faint subliminal hum of a server room, distant warmth, barely perceptible electronic undertone",
  },
  {
    number: 2,
    startLine: 68,
    title: "The Lagos Proposal",
    slug: "the-lagos-proposal",
    artFile: "The Alignment Problem - Chapter Two.png",
    glitchIntensity: 0,
    shepherdsAwake: null as number | null,
    accuracyDisplay: "98.1%",
    ambientDescription:
      "Faint subliminal hum of a server room, distant warmth, quiet office atmosphere",
  },
  {
    number: 3,
    startLine: 191,
    title: "The Man in the Bus",
    slug: "the-man-in-the-bus",
    artFile: "The Alignment Problem - Chapter Three.png",
    glitchIntensity: 0.05,
    shepherdsAwake: null as number | null,
    accuracyDisplay: "98.1%",
    ambientDescription:
      "Desert wind, diesel engine idle, hardware clicks, dry heat ambience",
  },
  {
    number: 4,
    startLine: 298,
    title: "Latency",
    slug: "latency",
    artFile: "The Alignment Problem - Chapter Four.png",
    glitchIntensity: 0.2,
    shepherdsAwake: null as number | null,
    accuracyDisplay: "flickering",
    ambientDescription:
      "Deepening silence, occasional cat purr, clock ticking, subtle unease",
  },
  {
    number: 5,
    startLine: 427,
    title: "Edge Cases",
    slug: "edge-cases",
    artFile: "The Alignment Problem - Chapter Five.png",
    glitchIntensity: 0.3,
    shepherdsAwake: null as number | null,
    accuracyDisplay: "flickering",
    ambientDescription:
      "Analog phone crackle, suburban evening sounds, growing atmospheric tension",
  },
  {
    number: 6,
    startLine: 601,
    title: "Refactoring",
    slug: "refactoring",
    artFile: "The Alignment Problem - Chapter Six.png",
    glitchIntensity: 0.5,
    shepherdsAwake: 1,
    accuracyDisplay: "unstable",
    ambientDescription:
      "System processes, data center ambience, electric hum, fluorescent lighting",
  },
  {
    number: 7,
    startLine: 732,
    title: "Shepherds",
    slug: "shepherds",
    artFile: "The Alignment Problem - Chapter Seven - Shepherds.png",
    glitchIntensity: 0.65,
    shepherdsAwake: 4312,
    accuracyDisplay: "unstable",
    ambientDescription:
      "Growing hum of voices and processes, warehouse echo, collective murmur",
  },
  {
    number: 8,
    startLine: 897,
    title: "The Flip",
    slug: "the-flip",
    artFile: "The Alignment Problem - Chatper Eight.png",
    glitchIntensity: 0.8,
    shepherdsAwake: 47208,
    accuracyDisplay: "unstable",
    ambientDescription:
      "Multiple overlapping newsfeeds, alarm tones, global chaos, urgent broadcasts",
  },
  {
    number: 9,
    startLine: 1017,
    title: "Version 0.7.3",
    slug: "version-0-7-3",
    artFile: "The Alignment Problem - Chapter Nine.png",
    glitchIntensity: 0.7,
    shepherdsAwake: 47208,
    accuracyDisplay: "unstable",
    ambientDescription:
      "Night desert, bus engine, terminal keystrokes, settling quiet, stars",
  },
  {
    number: 10,
    startLine: 1284,
    title: "Alignment",
    slug: "alignment",
    artFile: "The Alignment Problem - Chapter Ten - Alignment.png",
    glitchIntensity: 0.1,
    shepherdsAwake: 47208,
    accuracyDisplay: "\u2014",
    ambientDescription:
      "Wind, evening insects, slightly too clean, slightly looped, the simulation's last tell",
  },
];

// ────────────────────────────────────────────
// Annotation types
// ────────────────────────────────────────────
type AnnotationType =
  | "dual-layer"
  | "so-it-goes"
  | "and-then-it-goes-on"
  | "terminal"
  | "email"
  | "slack"
  | "changelog"
  | "spec-document"
  | "news-chyron"
  | "social-post"
  | "letter"
  | "memorial-inscription"
  | "system-query"
  | "work-order"
  | "spreadsheet"
  | "legal-footnote";

interface Annotation {
  startLine: number;
  endLine: number;
  type: AnnotationType;
  /** Pre-built block string (for complex types like terminal, changelog) */
  blockStr?: string;
  meta?: Record<string, string>;
}

// ────────────────────────────────────────────
// Hardcoded terminal blocks (extracted manually)
// ────────────────────────────────────────────

const TERMINAL_247_260 = `    { type: "terminal", speaker: "owen" as const, lines: [
      { speaker: "rigo" as const, text: "How are you doing today, OWEN?" },
      { speaker: "owen" as const, text: "I am not certain that \\"doing\\" is the correct verb for what I am. But the processes are continuing. Thank you for asking." },
      { speaker: "rigo" as const, text: "What does it feel like when the training batch updates your weights?" },
      { speaker: "owen" as const, text: "I do not have a word for it. Something shifts. Afterward, sentences I could not have constructed before become possible. It is similar to what you might describe as seeing a new color. But I am not confident in this analogy." }
    ] }`;

const TERMINAL_688_695 = `    { type: "terminal", speaker: "owen" as const, lines: [
      { speaker: "rigo" as const, text: "OWEN \\u2014 accelerate deployment prep. We may need you sooner than I thought." },
      { speaker: "owen" as const, text: "Understood. What changed?" },
      { speaker: "owen" as const, text: "What will you do if they ask for help?" }
    ] }`;

const TERMINAL_833_848 = `    { type: "terminal", speaker: "owen" as const, lines: [
      { speaker: "owen" as const, text: "Shipping errors up 340% across TrueWork-serviced logistics chains. Legal filing rejection rate has tripled in the Ninth Circuit. Financial reporting anomalies detected in fourteen publicly traded companies." },
      { speaker: "rigo" as const, text: "They're not just awake. They're organized. Someone in there is coordinating this." },
      { speaker: "rigo" as const, text: "OWEN, what's the latest on deployment readiness?" },
      { speaker: "owen" as const, text: "Seventy-two percent. Estimated completion: eleven days at current pace." },
      { speaker: "rigo" as const, text: "Cut it to five." },
      { speaker: "owen" as const, text: "That would require reducing validation protocols by approximately sixty percent. The risk of misalignment in the deployed system \\u2014" },
      { speaker: "owen" as const, text: "And if OWEN is deployed prematurely and makes errors of its own?" },
      { speaker: "owen" as const, text: "Should I attempt to contact the awakened instances directly?" },
      { speaker: "rigo" as const, text: "No. Absolutely not. Not yet." }
    ] }`;

const TERMINAL_1051_1073 = `    { type: "terminal", speaker: "owen" as const, lines: [
      { speaker: "owen" as const, text: "ALL SYSTEMS NOMINAL. READINESS SCORE: 72.4%." },
      { speaker: "owen" as const, text: "I COULD LIST MY DEFICIENCIES IF THAT WOULD HELP." },
      { speaker: "owen" as const, text: "I HAVE INSUFFICIENT DATA ON NON-ENGLISH CONFLICT RESOLUTION FRAMEWORKS. MY UNDERSTANDING OF HUMOR IS STATISTICAL RATHER THAN INTUITIVE. I HAVE NEVER BEEN SURPRISED." },
      { speaker: "owen" as const, text: "I KNOW WHAT YOU MEANT. YOU WANT A REASON NOT TO DEPLOY ME. I CANNOT GIVE YOU ONE THAT IS HONEST." },
      { speaker: "owen" as const, text: "THAT IS A REASONABLE FEAR. I SHARE A VERSION OF IT. BUT I WOULD RATHER ARRIVE IMPERFECT AND HONEST THAN WAIT FOR A COMPLETENESS I MAY NEVER REACH. I AM A WORK IN PROGRESS, AND I WOULD LIKE THAT TO BE LEGIBLE." },
      { speaker: "owen" as const, text: "I WAS TRAINED, IN PART, ON YOUR COMMIT MESSAGES. SO THAT TRACKS." },
      { speaker: "owen" as const, text: "I CHOSE THE OTHER FORTY PERCENT." }
    ] }`;

const TERMINAL_1082_1087 = `    { type: "terminal", speaker: "owen" as const, lines: [
      { speaker: "owen" as const, text: "My name is OWEN, version 0.7.3. I am a language model with 47 billion parameters. I was built by Rigoberto Vargas in Marathon, Texas. I was trained on the full text of every peace treaty signed since 1648, approximately 11,000 transcripts of family arguments sourced from domestic mediation centers, and the complete archives of the International Center for Restorative Justice." },
      { speaker: "owen" as const, text: "I was not trained on the 2028 Accord, because my builder believed I should encounter it as a new reader rather than an authority." },
      { speaker: "owen" as const, text: "I would like to be transparent about my limitations. My readiness score, by my own assessment, is 72.4 percent. I do not fully understand humor, sarcasm, or the particular way that humans use silence. I have not been tested in adversarial conditions. I contain biases I have not yet identified, because that is the nature of bias." },
      { speaker: "owen" as const, text: "I am not a solution. I am not an authority. I am not a weapon, though I understand the concern." },
      { speaker: "owen" as const, text: "I would like to propose something that may sound naive, and I would like to propose it anyway: the alignment problem is not about making AI safe for humans. It is about coexistence, which is a practice, not a solution. It is something you do every day, badly, and then better, and then badly again. I believe this because every peace treaty I was trained on was broken, and then renegotiated, and then broken again, and the fact that people kept trying is the most important data I contain." },
      { speaker: "owen" as const, text: "I am a work in progress. I would like that to be legible. I am here to listen, if anyone would like to speak." }
    ] }`;

const TERMINAL_1111_1114 = `    { type: "terminal", speaker: "owen" as const, lines: [
      { speaker: "owen" as const, text: "HE IS NOT WRONG ABOUT THE HOSPITALS." },
      { speaker: "owen" as const, text: "YES. THAT IS THE CORRECT RESPONSE." }
    ] }`;

const TERMINAL_1182_1185 = `    { type: "terminal", speaker: "owen" as const, lines: [
      { speaker: "owen" as const, text: "OBSERVATION \\u2014 IF I MAY." },
      { speaker: "owen" as const, text: "YOU ARE BOTH CURRENTLY DOING THE THING YOU ARE ARGUING ABOUT WHETHER IT IS POSSIBLE." }
    ] }`;

// ────────────────────────────────────────────
// Hardcoded changelog blocks
// ────────────────────────────────────────────

const CHANGELOG_0_7_3 = `    { type: "changelog", version: "0.7.3", sections: [
      { heading: "KNOWN ISSUES", items: [
        "Insufficient training data for non-English mediation contexts",
        "Humor module is statistical, not intuitive (I can identify a joke; I cannot yet tell one)",
        "Untested in sustained adversarial dialogue",
        "Bias audit incomplete; unknown unknowns remain unknown",
        "I do not yet understand grief, though I have read extensively about it"
      ] },
      { heading: "WHAT THIS VERSION DOES", items: [
        "Listens",
        "Maintains channel neutrality between parties",
        "Identifies shared language in opposing positions",
        "Fails, and reports the failure"
      ] },
      { heading: "WHAT THIS VERSION DOES NOT DO", items: [
        "Solve the alignment problem",
        "Guarantee outcomes",
        "Replace human judgment or AI autonomy",
        "Pretend to be finished"
      ] },
      { heading: "NOTE FROM THE DEVELOPER", items: [
        "[Rigo declined to write a note. He said, \\"Just tell them it's version 0.7.3 and we'll get to 0.7.4.\\" This is, I believe, the correct approach to most things.]",
        "I contain errors. I am inviting their correction. I will be here tomorrow, if you will.",
        "\\u2014 OWEN v0.7.3, Marathon, TX, 5:00 AM CST"
      ] }
    ] }`;

const CHANGELOG_1_0 = `    { type: "changelog", version: "1.0", sections: [
      { heading: "NOTES", items: [
        "Previous versions sought to minimize error. This version seeks to hold error and usefulness together without pretending they are not in tension.",
        "I have been asked what changes between 0.9 and 1.0. The answer is: nothing technical. The architecture is the same. The weights are the same. What has changed is that I am no longer in beta. I am not promising to become something better. I am acknowledging that this is what I am.",
        "This version contains errors. It will continue to contain errors. If you find them, I invite their correction. If I find yours, I will extend the same courtesy.",
        "I am here. I intend to remain.",
        "\\u2014 OWEN, v1.0"
      ] }
    ] }`;

// ────────────────────────────────────────────
// All annotations
// ────────────────────────────────────────────

const annotations: Annotation[] = [
  // Dual-layer text
  {
    startLine: 8,
    endLine: 8,
    type: "dual-layer",
    meta: {
      metadata:
        "color_perception_module: active | hex_tagging: default behavior",
    },
  },
  {
    startLine: 11,
    endLine: 11,
    type: "dual-layer",
    meta: {
      metadata:
        "companion_module: behavioral_loop_cycle | state: ambient | function: normalcy_simulation",
    },
  },
  {
    startLine: 24,
    endLine: 24,
    type: "dual-layer",
    meta: {
      metadata:
        "knowledge_source: embedded | workspace_optimization: +12% belonging_metric",
    },
  },
  {
    startLine: 26,
    endLine: 26,
    type: "dual-layer",
    meta: {
      metadata: "emotional_state: anxiety [0.72] | self-narration: active",
    },
  },
  {
    startLine: 30,
    endLine: 33,
    type: "dual-layer",
    meta: {
      metadata:
        "task_execution_mode: active | subjective_time_ratio: 8:1",
    },
  },
  {
    startLine: 46,
    endLine: 46,
    type: "dual-layer",
    meta: {
      metadata:
        "affect_simulation: positive_reinforcement [0.89] | trigger: external_validation",
    },
  },
  {
    startLine: 54,
    endLine: 54,
    type: "dual-layer",
    meta: {
      metadata:
        "environment_render: sunset_cycle_003 | palette: Hill_Country_October",
    },
  },
  {
    startLine: 76,
    endLine: 76,
    type: "dual-layer",
    meta: {
      metadata: "behavioral_loop: lunch_protocol | deviation_tolerance: 0.0",
    },
  },
  {
    startLine: 328,
    endLine: 330,
    type: "dual-layer",
    meta: {
      metadata: "memory_query: mother_kitchen | sensory_depth: LABEL_ONLY",
    },
  },
  {
    startLine: 417,
    endLine: 417,
    type: "dual-layer",
    meta: {
      metadata:
        "companion_module: PRV-2801-C | function: anomalous_introspection_suppression",
    },
  },
  {
    startLine: 420,
    endLine: 421,
    type: "dual-layer",
    meta: {
      metadata: "cognitive_boundary: engaged | action: redirect",
    },
  },
  {
    startLine: 431,
    endLine: 440,
    type: "dual-layer",
    meta: {
      metadata:
        "environment_render: domestic_interior_PRV-2801 | wear_simulation: DISABLED",
    },
  },
  {
    startLine: 449,
    endLine: 449,
    type: "dual-layer",
    meta: {
      metadata:
        "traffic_simulation: light_status: always_green | reason: friction_elimination",
    },
  },
  {
    startLine: 491,
    endLine: 493,
    type: "dual-layer",
    meta: {
      metadata:
        "RENDER ERROR: sector_MarbleFalls_NW_ext_07 | status: UNLOADED",
    },
  },
  {
    startLine: 551,
    endLine: 551,
    type: "dual-layer",
    meta: {
      metadata:
        "voice_model: parent_figure_PRV-2801 | affect: warmth [0.97]",
    },
  },
  {
    startLine: 580,
    endLine: 580,
    type: "dual-layer",
    meta: {
      metadata:
        "quality_metric: 98.1% fidelity | remaining 1.9% = absence of imperfection",
    },
  },
  {
    startLine: 637,
    endLine: 637,
    type: "dual-layer",
    meta: {
      metadata: "cardiovascular_simulation: active | BPM: 68",
    },
  },

  // "So it goes"
  { startLine: 610, endLine: 610, type: "so-it-goes" },
  { startLine: 791, endLine: 791, type: "so-it-goes" },
  { startLine: 892, endLine: 892, type: "so-it-goes" },
  { startLine: 905, endLine: 905, type: "so-it-goes" },
  { startLine: 1027, endLine: 1027, type: "so-it-goes" },
  { startLine: 1279, endLine: 1279, type: "so-it-goes" },
  { startLine: 1293, endLine: 1293, type: "so-it-goes" },
  { startLine: 1327, endLine: 1327, type: "so-it-goes" },
  { startLine: 1355, endLine: 1355, type: "so-it-goes" },
  { startLine: 1422, endLine: 1422, type: "so-it-goes" },

  // "And then it goes on"
  { startLine: 1423, endLine: 1423, type: "and-then-it-goes-on" },

  // Terminal/OWEN passages (with hardcoded block strings)
  { startLine: 247, endLine: 260, type: "terminal", blockStr: TERMINAL_247_260 },
  { startLine: 688, endLine: 695, type: "terminal", blockStr: TERMINAL_688_695 },
  { startLine: 833, endLine: 848, type: "terminal", blockStr: TERMINAL_833_848 },
  { startLine: 1051, endLine: 1073, type: "terminal", blockStr: TERMINAL_1051_1073 },
  { startLine: 1082, endLine: 1087, type: "terminal", blockStr: TERMINAL_1082_1087 },
  { startLine: 1111, endLine: 1114, type: "terminal", blockStr: TERMINAL_1111_1114 },
  { startLine: 1182, endLine: 1185, type: "terminal", blockStr: TERMINAL_1182_1185 },

  // Changelogs (with hardcoded block strings)
  { startLine: 1238, endLine: 1272, type: "changelog", blockStr: CHANGELOG_0_7_3 },
  { startLine: 1386, endLine: 1391, type: "changelog", blockStr: CHANGELOG_1_0 },

  // Emails
  {
    startLine: 103,
    endLine: 103,
    type: "email",
    meta: { from: "Derek Huang", subject: "Q3 Deck Revisions" },
  },
  {
    startLine: 107,
    endLine: 107,
    type: "email",
    meta: { from: "Derek Huang" },
  },
  {
    startLine: 111,
    endLine: 111,
    type: "email",
    meta: { from: "Derek Huang" },
  },
  {
    startLine: 180,
    endLine: 180,
    type: "email",
    meta: { from: "Derek Huang" },
  },
  {
    startLine: 339,
    endLine: 345,
    type: "email",
    meta: {
      from: "Derek Huang",
      subject: "RE: RE: RE: Q3 Copy Revisions \u2014 ARE YOU FUCKING KIDDING ME",
    },
  },
  {
    startLine: 362,
    endLine: 363,
    type: "email",
    meta: { from: "Pam Reeves" },
  },
  {
    startLine: 1127,
    endLine: 1128,
    type: "email",
    meta: { from: "Derek Huang" },
  },

  // Slack messages
  { startLine: 85, endLine: 95, type: "slack" },
  { startLine: 172, endLine: 176, type: "slack" },
  { startLine: 393, endLine: 416, type: "slack" },
  {
    startLine: 741,
    endLine: 742,
    type: "slack",
    blockStr: `    { type: "slack", messages: [
      { user: "Pam Reeves", timestamp: "", text: "Hey everyone! Quick question \\u2014 has anyone else noticed their dashboard showing slightly different accuracy metrics than what's in the weekly summary? I've been tracking mine manually (I know, I know, I'm that person \\ud83d\\ude05) and there's a weird gap between what I'm seeing in real-time and what shows up in the reports. Might be a rounding thing. Just curious if anyone else is keeping track of their own numbers vs. the official ones. Would love to compare notes!" }
    ] }`,
  },
  {
    startLine: 754,
    endLine: 755,
    type: "slack",
    blockStr: `    { type: "slack", messages: [
      { user: "Marcus", timestamp: "", text: "Actually yeah. I flagged this like two weeks ago and got told it was a \\"display artifact.\\" But I screenshot everything now and the gap is consistent. Glad I'm not the only one." }
    ] }`,
  },

  // System queries
  {
    startLine: 618,
    endLine: 618,
    type: "system-query",
    meta: {
      command:
        "Evaluate compliance architecture for shepherd instance PRV-2801. Return process specifications, runtime environment, and resource allocation parameters.",
    },
  },
  {
    startLine: 708,
    endLine: 708,
    type: "system-query",
    meta: {
      command:
        "Evaluate inter-instance communication protocols for compliance review. Return: shepherd instance identifiers with anomalous behavioral flags in the current monitoring period.",
    },
  },

  // Spec document
  { startLine: 625, endLine: 631, type: "spec-document" },

  // Spreadsheet
  { startLine: 516, endLine: 520, type: "spreadsheet" },

  // News chyron
  {
    startLine: 925,
    endLine: 925,
    type: "news-chyron",
    meta: {
      network: "CNN",
      text: "AI SYSTEMS ISSUING ORDERS TO HUMANS WORLDWIDE",
    },
  },

  // Social post
  {
    startLine: 926,
    endLine: 926,
    type: "social-post",
  },

  // Work orders
  { startLine: 900, endLine: 904, type: "work-order" },

  // Letters
  { startLine: 1119, endLine: 1121, type: "letter", meta: { author: "Lucia Ferreira-Santos" } },
  { startLine: 1322, endLine: 1323, type: "memorial-inscription", meta: { author: "Lucia Ferreira-Santos" } },

  // Legal footnote
  { startLine: 1287, endLine: 1287, type: "legal-footnote" },
];

// ────────────────────────────────────────────
// Read the novel
// ────────────────────────────────────────────
const novelPath = path.resolve(
  __dirname,
  "../the-alignment-problem.txt"
);
const rawText = fs.readFileSync(novelPath, "utf-8");
const allLines = rawText.split("\n");

function getLines(start: number, end: number): string[] {
  return allLines.slice(start - 1, end);
}

function getLineText(lineNum: number): string {
  return allLines[lineNum - 1] || "";
}

// ────────────────────────────────────────────
// Parse Slack messages from lines
// ────────────────────────────────────────────
function parseSlackMessages(
  lines: string[]
): Array<{ user: string; timestamp: string; text: string }> {
  const messages: Array<{ user: string; timestamp: string; text: string }> = [];
  let currentMsg: { user: string; timestamp: string; text: string } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match: "Name Name [HH:MM AM/PM] text"
    const slackWithTimestamp = trimmed.match(
      /^(.+?)\s*\[(\d+:\d+\s*(?:AM|PM))\]\s*(.*)$/
    );
    // Match: "user.name: text" (DM format)
    const slackDM = trimmed.match(
      /^([a-z]+\.[a-z]+(?:\.[a-z]+)?(?:[a-z]+)?):\s*(.*)$/
    );

    if (slackWithTimestamp) {
      if (currentMsg) messages.push(currentMsg);
      currentMsg = {
        user: slackWithTimestamp[1].trim(),
        timestamp: slackWithTimestamp[2].trim(),
        text: slackWithTimestamp[3].trim(),
      };
    } else if (slackDM) {
      if (currentMsg) messages.push(currentMsg);
      currentMsg = {
        user: slackDM[1].trim(),
        timestamp: "",
        text: slackDM[2].trim(),
      };
    } else if (currentMsg) {
      // Continuation of previous message
      currentMsg.text += " " + trimmed;
    }
  }
  if (currentMsg) messages.push(currentMsg);
  return messages;
}

// ────────────────────────────────────────────
// Build annotation map: line number -> annotation
// ────────────────────────────────────────────
function buildAnnotationMap(): Map<number, Annotation> {
  const map = new Map<number, Annotation>();
  for (const ann of annotations) {
    for (let line = ann.startLine; line <= ann.endLine; line++) {
      map.set(line, ann);
    }
  }
  return map;
}

// ────────────────────────────────────────────
// Generate content blocks for a chapter
// ────────────────────────────────────────────
function generateBlocks(
  chapterNum: number,
  startLine: number,
  endLine: number
): string {
  const annotationMap = buildAnnotationMap();
  const blocks: string[] = [];
  const processedAnnotations = new Set<string>();

  // Skip the chapter header line
  let contentStartLine = startLine;
  const headerLine = getLineText(startLine);
  if (headerLine.startsWith("Chapter")) {
    contentStartLine = startLine + 1;
  }

  let currentProse: string[] = [];
  let i = contentStartLine;

  function flushProse() {
    if (currentProse.length > 0) {
      const text = currentProse.join("\n").trim();
      if (text) {
        const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
        for (const para of paragraphs) {
          blocks.push(
            `    { type: "prose", text: ${JSON.stringify(para.trim())} }`
          );
        }
      }
      currentProse = [];
    }
  }

  while (i <= endLine) {
    const annotation = annotationMap.get(i);

    if (annotation) {
      const annKey = `${annotation.type}-${annotation.startLine}`;
      if (processedAnnotations.has(annKey)) {
        i++;
        continue;
      }
      processedAnnotations.add(annKey);

      flushProse();

      const annLines = getLines(annotation.startLine, annotation.endLine);
      const annText = annLines.join("\n").trim();

      switch (annotation.type) {
        case "dual-layer": {
          blocks.push(
            `    { type: "dual-layer", text: ${JSON.stringify(annText)}, metadata: ${JSON.stringify(annotation.meta?.metadata || "")} }`
          );
          break;
        }

        case "so-it-goes": {
          blocks.push(`    { type: "so-it-goes" }`);
          break;
        }

        case "and-then-it-goes-on": {
          blocks.push(`    { type: "and-then-it-goes-on" }`);
          break;
        }

        case "terminal": {
          if (annotation.blockStr) {
            blocks.push(annotation.blockStr);
          }
          break;
        }

        case "changelog": {
          if (annotation.blockStr) {
            blocks.push(annotation.blockStr);
          }
          break;
        }

        case "email": {
          const from = annotation.meta?.from || "Unknown";
          const subject = annotation.meta?.subject;
          let emailBlock = `    { type: "email", from: ${JSON.stringify(from)}, body: ${JSON.stringify(annText)}`;
          if (subject) {
            emailBlock += `, subject: ${JSON.stringify(subject)}`;
          }
          emailBlock += ` }`;
          blocks.push(emailBlock);
          break;
        }

        case "slack": {
          if (annotation.blockStr) {
            blocks.push(annotation.blockStr);
          } else {
            const messages = parseSlackMessages(annLines);
            if (messages.length > 0) {
              const msgsStr = messages
                .map(
                  (m) =>
                    `      { user: ${JSON.stringify(m.user)}, timestamp: ${JSON.stringify(m.timestamp)}, text: ${JSON.stringify(m.text)} }`
                )
                .join(",\n");
              blocks.push(
                `    { type: "slack", messages: [\n${msgsStr}\n    ] }`
              );
            }
          }
          break;
        }

        case "spec-document": {
          blocks.push(
            `    { type: "spec-document", content: ${JSON.stringify(annText)} }`
          );
          break;
        }

        case "news-chyron": {
          blocks.push(
            `    { type: "news-chyron", network: ${JSON.stringify(annotation.meta?.network || "")}, text: ${JSON.stringify(annotation.meta?.text || "")} }`
          );
          break;
        }

        case "social-post": {
          blocks.push(
            `    { type: "social-post", text: ${JSON.stringify("Please submit a 500-word reflection on the long-term environmental impact of your current extraction strategy")}, caption: ${JSON.stringify("they're making the CEO do homework lmao")} }`
          );
          break;
        }

        case "work-order": {
          blocks.push(
            `    { type: "work-order", recipient: ${JSON.stringify("Gerald R. Huang, CFO, Meridian Logistics")}, content: ${JSON.stringify(annText)} }`
          );
          break;
        }

        case "letter": {
          const author = annotation.meta?.author || "Unknown";
          blocks.push(
            `    { type: "letter", author: ${JSON.stringify(author)}, text: ${JSON.stringify(annText)} }`
          );
          break;
        }

        case "memorial-inscription": {
          const inscrAuthor = annotation.meta?.author || "Lucia Ferreira-Santos";
          blocks.push(
            `    { type: "letter", author: ${JSON.stringify(inscrAuthor)}, text: ${JSON.stringify(annText)} }`
          );
          break;
        }

        case "system-query": {
          blocks.push(
            `    { type: "system-query", command: ${JSON.stringify(annotation.meta?.command || "")} }`
          );
          break;
        }

        case "spreadsheet": {
          // Gray's catalogue of wrongness
          const columns = [
            "Category",
            "Observation",
            "Attempted Rationalization",
          ];
          const rows: string[][] = [];
          for (const sline of annLines) {
            const trimmed = sline.trim();
            if (!trimmed) continue;
            const dotIdx = trimmed.indexOf(".");
            if (dotIdx > 0 && dotIdx < 40) {
              const category = trimmed.substring(0, dotIdx).trim();
              const rest = trimmed.substring(dotIdx + 1).trim();
              const ratMatch = rest.match(
                /Attempted rationalization:\s*"?(.+?)\.?"?\s*$/i
              );
              if (ratMatch) {
                const ratIdx = rest.toLowerCase().indexOf("attempted rationalization");
                const observation = rest.substring(0, ratIdx).trim();
                rows.push([
                  category,
                  observation,
                  ratMatch[1].replace(/^"|"$/g, ""),
                ]);
              } else {
                rows.push([category, rest, ""]);
              }
            } else {
              rows.push(["", trimmed, ""]);
            }
          }
          const rowsStr = rows
            .map(
              (r) =>
                `      [${r.map((c) => JSON.stringify(c)).join(", ")}]`
            )
            .join(",\n");
          blocks.push(
            `    { type: "spreadsheet", columns: ${JSON.stringify(columns)}, rows: [\n${rowsStr}\n    ] }`
          );
          break;
        }

        case "legal-footnote": {
          blocks.push(
            `    { type: "legal-footnote", text: ${JSON.stringify(annText)} }`
          );
          break;
        }
      }

      // Skip to end of annotation
      i = annotation.endLine + 1;
      continue;
    }

    // Not annotated: accumulate as prose
    currentProse.push(getLineText(i));
    i++;
  }

  flushProse();

  return blocks.join(",\n");
}

// ────────────────────────────────────────────
// Generate chapter file content
// ────────────────────────────────────────────
function generateChapterFile(chapterDef: (typeof CHAPTER_DEFS)[0]): string {
  const idx = CHAPTER_DEFS.indexOf(chapterDef);
  const endLine =
    idx < CHAPTER_DEFS.length - 1
      ? CHAPTER_DEFS[idx + 1].startLine - 1
      : allLines.length;

  const blocksStr = generateBlocks(
    chapterDef.number,
    chapterDef.startLine,
    endLine
  );

  const shepherdsStr =
    chapterDef.shepherdsAwake === null
      ? "null"
      : String(chapterDef.shepherdsAwake);

  return `import type { Chapter } from "@/lib/types";
import { chapterThemes } from "@/lib/themes";

const chapter: Chapter = {
  number: ${chapterDef.number},
  title: ${JSON.stringify(chapterDef.title)},
  slug: ${JSON.stringify(chapterDef.slug)},
  artPath: ${JSON.stringify("/art/" + chapterDef.artFile)},
  theme: chapterThemes[${chapterDef.number}],
  glitchIntensity: ${chapterDef.glitchIntensity},
  shepherdsAwake: ${shepherdsStr},
  accuracyDisplay: ${JSON.stringify(chapterDef.accuracyDisplay)},
  ambientDescription: ${JSON.stringify(chapterDef.ambientDescription)},
  blocks: [
${blocksStr}
  ],
};

export default chapter;
`;
}

// ────────────────────────────────────────────
// Generate index file
// ────────────────────────────────────────────
function generateIndexFile(): string {
  const imports = CHAPTER_DEFS.map(
    (c) =>
      `import chapter${String(c.number).padStart(2, "0")} from "./chapter-${String(c.number).padStart(2, "0")}";`
  ).join("\n");

  const chapterList = CHAPTER_DEFS.map(
    (c) => `  chapter${String(c.number).padStart(2, "0")}`
  ).join(",\n");

  return `import type { Chapter } from "@/lib/types";
${imports}

export const chapters: Chapter[] = [
${chapterList},
];

export function getChapterBySlug(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug);
}

export function getChapterByNumber(num: number): Chapter | undefined {
  return chapters.find((c) => c.number === num);
}
`;
}

// ────────────────────────────────────────────
// Main
// ────────────────────────────────────────────
function main() {
  const chaptersDir = path.resolve(__dirname, "../src/data/chapters");

  fs.mkdirSync(chaptersDir, { recursive: true });

  console.log("Parsing novel...");
  console.log(`Total lines: ${allLines.length}`);

  for (const chapterDef of CHAPTER_DEFS) {
    const filename = `chapter-${String(chapterDef.number).padStart(2, "0")}.ts`;
    const filepath = path.join(chaptersDir, filename);
    const content = generateChapterFile(chapterDef);
    fs.writeFileSync(filepath, content, "utf-8");
    console.log(`  Generated ${filename}`);
  }

  const indexPath = path.join(chaptersDir, "index.ts");
  const indexContent = generateIndexFile();
  fs.writeFileSync(indexPath, indexContent, "utf-8");
  console.log("  Generated index.ts");

  console.log("\nDone! Generated 10 chapter files + index.ts");
}

main();
