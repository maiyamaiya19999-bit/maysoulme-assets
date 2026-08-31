#!/usr/bin/env node
// Поиск подозрительно похожих предложений между пакетами (для ревью уникальности).
// node scripts/check-similarity.mjs [порог=0.82]

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const threshold = Number(process.argv[2] ?? 0.82);

const batchesDir = join(__dirname, "../src/data/batches");
let all = [];
if (existsSync(batchesDir)) {
  for (const f of readdirSync(batchesDir).filter((x) => /^batch-\d\d\.json$/.test(x)).sort()) {
    all = all.concat(JSON.parse(readFileSync(join(batchesDir, f), "utf8")));
  }
} else {
  all = JSON.parse(readFileSync(join(__dirname, "../src/data/sentences.json"), "utf8")).sentences;
}

const norm = (s) =>
  s.toLowerCase().replace(/[ё]/g, "е").replace(/[^a-zа-я0-9 ]/gi, " ").replace(/\s+/g, " ").trim();

function trigrams(s) {
  const t = new Set();
  const str = norm(s);
  for (let i = 0; i < str.length - 2; i++) t.add(str.slice(i, i + 3));
  return t;
}

function jaccard(a, b) {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

const items = all.map((s) => ({ id: s.id, ru: s.russian, tri: trigrams(s.russian) }));
let found = 0;
for (let i = 0; i < items.length; i++) {
  for (let j = i + 1; j < items.length; j++) {
    const sim = jaccard(items[i].tri, items[j].tri);
    if (sim >= threshold) {
      found++;
      console.log(`~${sim.toFixed(2)}  №${items[i].id} «${items[i].ru}»  ↔  №${items[j].id} «${items[j].ru}»`);
    }
  }
}
console.log(found === 0 ? `✓ Похожих пар (≥${threshold}) не найдено среди ${items.length}` : `\nНайдено пар: ${found}`);
