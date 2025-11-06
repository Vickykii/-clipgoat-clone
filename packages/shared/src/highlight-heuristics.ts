import { chunkArray, clamp } from "./utils";
import type { HighlightSegment } from "./schemas";

type Word = {
  text: string;
  startMs: number;
  endMs: number;
};

const KEYWORDS = [
  "insane",
  "secret",
  "mistake",
  "how to",
  "story",
  "tip",
  "hack",
  "warning",
  "mistakes"
];

export const heuristicSegments = (
  words: Word[],
  durationMs: number,
  options: { windowSeconds?: number; count?: number } = {}
): HighlightSegment[] => {
  if (!words.length) {
    return [];
  }
  const windowSeconds = options.windowSeconds ?? 30;
  const windowMs = windowSeconds * 1000;
  const count = options.count ?? 10;
  const windows = chunkArray(words, Math.max(1, Math.floor((words.length * windowMs) / durationMs)));

  const scored = windows.map((chunk) => {
    const text = chunk.map((w) => w.text).join(" ").toLowerCase();
    let score = chunk.length / words.length;
    for (const keyword of KEYWORDS) {
      if (text.includes(keyword)) {
        score += 0.5;
      }
    }
    const energy = chunk.reduce((acc, word) => acc + (word.endMs - word.startMs), 0) / windowMs;
    score += clamp(energy, 0, 1);
    return { score, chunk };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, count).map(({ chunk, score }, index) => {
    const startMs = chunk[0]?.startMs ?? 0;
    const endMs = chunk[chunk.length - 1]?.endMs ?? clamp(startMs + windowMs, 0, durationMs);
    return {
      id: `heuristic-${index}`,
      projectId: "", // filled by caller
      startMs,
      endMs,
      title: chunk.slice(0, 10).map((w) => w.text).join(" ") || "Untitled",
      hook: chunk.slice(0, 15).map((w) => w.text).join(" ") || "Great moment",
      aiScore: clamp(score, 0, 1),
      aspectRatio: "9:16",
      reasons: ["Heuristic keyword/energy match"],
      captionMode: "karaoke",
      emojis: []
    } satisfies HighlightSegment;
  });
};
