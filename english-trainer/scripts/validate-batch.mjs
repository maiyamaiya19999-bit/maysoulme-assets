#!/usr/bin/env node
// Проверка одного пакета: node scripts/validate-batch.mjs NN
// Структура (через validate-dataset.mjs), диапазон ID, уровни и квоты брифа.

import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const nn = String(process.argv[2] ?? "").padStart(2, "0");
// --enriched: у каждой записи обязательны alternatives (≥1) и vocab (≥2)
const ENRICHED = process.argv.includes("--enriched");
if (!/^\d\d$/.test(nn)) {
  console.error("Использование: node scripts/validate-batch.mjs NN");
  process.exit(1);
}

const briefs = JSON.parse(readFileSync(join(__dirname, "batch-briefs.json"), "utf8"));
const brief = briefs.find((b) => b.batch === Number(nn));
if (!brief) {
  console.error(`Нет брифа для пакета ${nn}`);
  process.exit(1);
}

const batchPath = join(__dirname, `../src/data/batches/batch-${nn}.json`);
let arr;
try {
  arr = JSON.parse(readFileSync(batchPath, "utf8"));
} catch (e) {
  console.error(`Не удалось прочитать ${batchPath}: ${e.message}`);
  process.exit(1);
}
if (!Array.isArray(arr)) {
  console.error("Пакет должен быть JSON-массивом");
  process.exit(1);
}

const errors = [];

// Количество и диапазон ID
if (arr.length !== 50) errors.push(`Записей ${arr.length}, нужно ровно 50`);
const expected = new Set();
for (let i = brief.idFrom; i <= brief.idTo; i++) expected.add(i);
for (const s of arr) {
  if (!expected.has(s.id)) errors.push(`id=${s.id} вне диапазона ${brief.idFrom}–${brief.idTo}`);
  expected.delete(s.id);
  if (s.level && !brief.levels.includes(s.level)) {
    errors.push(`id=${s.id}: level ${s.level}, разрешены ${brief.levels.join("/")}`);
  }
}
if (expected.size > 0 && arr.length === 50) errors.push(`Пропущены ID: ${[...expected].slice(0, 5).join(", ")}…`);

// Квоты
const gCount = {};
const tCount = {};
for (const s of arr) {
  for (const t of s.grammarTags ?? []) gCount[t] = (gCount[t] ?? 0) + 1;
  for (const t of s.topicTags ?? []) tCount[t] = (tCount[t] ?? 0) + 1;
}
for (const [tag, min] of Object.entries(brief.grammarQuotas)) {
  if ((gCount[tag] ?? 0) < min) errors.push(`Квота grammar ${tag}: ${gCount[tag] ?? 0} < ${min}`);
}
for (const [tag, min] of Object.entries(brief.topicQuotas)) {
  if ((tCount[tag] ?? 0) < min) errors.push(`Квота topic ${tag}: ${tCount[tag] ?? 0} < ${min}`);
}

if (ENRICHED) {
  for (const s of arr) {
    if (!Array.isArray(s.alternatives) || s.alternatives.length < 1) errors.push(`id=${s.id}: нет alternatives (нужно 1–3)`);
    if (!Array.isArray(s.vocab) || s.vocab.length < 2) errors.push(`id=${s.id}: vocab меньше 2 слов`);
  }
}

// Дубли с другими пакетами (агенты не видят чужие пакеты, проверяем здесь)
import { readdirSync, existsSync } from "node:fs";
const normalize = (s) =>
  s.toLowerCase().replace(/[’']/g, "'").replace(/[ё]/g, "е").replace(/[—–-]/g, "-").replace(/\s+/g, " ").replace(/[.,!?;:()"«»]/g, "").trim();
const own = new Set(arr.map((s) => s.id));
const batchesDir = join(__dirname, "../src/data/batches");
const others = [];
if (existsSync(batchesDir)) {
  for (const f of readdirSync(batchesDir).filter((x) => /^batch-\d\d\.json$/.test(x))) {
    if (f === `batch-${nn}.json`) continue;
    others.push(...JSON.parse(readFileSync(join(batchesDir, f), "utf8")));
  }
}
const ruMap = new Map();
const enMap = new Map();
for (const s of others) {
  if (!own.has(s.id)) {
    ruMap.set(normalize(s.russian ?? ""), s.id);
    enMap.set(normalize(s.english ?? ""), s.id);
  }
}
for (const s of arr) {
  const ru = ruMap.get(normalize(s.russian ?? ""));
  if (ru !== undefined) errors.push(`id=${s.id}: russian дублирует №${ru} из другого пакета`);
  const en = enMap.get(normalize(s.english ?? ""));
  if (en !== undefined) errors.push(`id=${s.id}: english дублирует №${en} из другого пакета`);
}

// Структурная проверка через основной валидатор
const tmp = join(mkdtempSync(join(tmpdir(), "et-batch-")), "ds.json");
writeFileSync(tmp, JSON.stringify({ datasetVersion: 1, sentences: arr }));
try {
  execFileSync("node", [join(__dirname, "validate-dataset.mjs"), tmp], { stdio: ["ignore", "ignore", "pipe"] });
} catch (e) {
  errors.push("Структурные ошибки:");
  errors.push(String(e.stderr ?? e.message));
}

if (errors.length) {
  console.error(`✗ batch ${nn}:`);
  for (const err of errors) console.error("  " + err);
  process.exit(1);
}
console.log(`✓ batch ${nn} ok (50 записей, квоты выполнены)`);
