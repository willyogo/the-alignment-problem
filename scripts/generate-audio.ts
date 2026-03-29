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

  // Concatenate MP3 chunks
  const fullAudio = Buffer.concat(audioBuffers);
  const tempPath = outPath + ".tmp";
  fs.writeFileSync(tempPath, fullAudio);

  // Re-mux with ffmpeg to fix duration metadata (concatenated MP3s have wrong headers)
  try {
    const { execSync } = require("child_process");
    execSync(`ffmpeg -y -i "${tempPath}" -c copy -write_xing 1 "${outPath}" 2>/dev/null`);
    fs.unlinkSync(tempPath);
    const finalSize = fs.statSync(outPath).size;
    console.log(`  Saved narration: ${outPath} (${(finalSize / 1024 / 1024).toFixed(1)} MB)`);
  } catch {
    // ffmpeg not available — fall back to raw concatenation
    fs.renameSync(tempPath, outPath);
    console.log(`  Saved narration: ${outPath} (${(fullAudio.length / 1024 / 1024).toFixed(1)} MB) [warning: no ffmpeg, duration metadata may be incorrect]`);
  }
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
  const maxAttempts = 180; // 15 minutes max
  while (attempts < maxAttempts) {
    await sleep(5000);
    attempts++;

    const statusResponse = await fetch("https://api.venice.ai/api/v1/audio/retrieve", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VENICE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ queue_id, model: "elevenlabs-music" }),
    });

    const contentType = statusResponse.headers.get("content-type") || "";
    if (statusResponse.ok && (contentType.includes("audio") || contentType.includes("octet-stream"))) {
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
        body: JSON.stringify({ queue_id, model: "elevenlabs-music" }),
      });
      return;
    }

    // Not ready yet — log status and continue polling
    if (statusResponse.ok) {
      const data = await statusResponse.json();
      console.log(`  Ambient ch ${chapterNumber}: ${data.status || "processing"}... (attempt ${attempts})`);
    } else {
      // 404 or other error = still processing
      if (attempts % 12 === 0) {
        console.log(`  Ambient ch ${chapterNumber}: waiting... (attempt ${attempts})`);
      }
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
