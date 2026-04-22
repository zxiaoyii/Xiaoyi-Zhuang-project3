import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

let wordsCache = null;

function loadWords() {
  if (wordsCache) return wordsCache;
  const path = join(__dirname, "../data/words.txt");
  const text = readFileSync(path, "utf8");
  wordsCache = text
    .split(/\r?\n/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length >= 3);
  if (wordsCache.length < 1000) {
    throw new Error("Word list should contain 1000+ words (length 3+).");
  }
  return wordsCache;
}

export function randomGameName() {
  const words = loadWords();
  const a = words[Math.floor(Math.random() * words.length)];
  const b = words[Math.floor(Math.random() * words.length)];
  const c = words[Math.floor(Math.random() * words.length)];
  return [a, b, c]
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
