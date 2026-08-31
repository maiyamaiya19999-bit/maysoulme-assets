#!/usr/bin/env node
// Валидация базы предложений: node scripts/validate-dataset.mjs [--final] [path]
// --final: строгие требования к полной базе (ровно 2000, все квоты покрытия).
// Без --final: структурные проверки + отчёт покрытия (для промежуточных пакетов).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const FINAL = args.includes("--final");
const pathArg = args.find((a) => !a.startsWith("--"));
const DATASET_PATH = pathArg ?? join(__dirname, "../src/data/sentences.json");

const GRAMMAR_TAGS = new Set([
  "present-simple","present-continuous","present-continuous-future","past-simple","past-continuous",
  "present-perfect","present-perfect-continuous","past-perfect","past-perfect-continuous",
  "future-will","going-to","future-continuous","future-perfect","future-perfect-continuous",
  "question","indirect-question","tag-question","short-answer","negation","imperative","modal",
  "conditional-0","conditional-1","conditional-2","conditional-3","conditional-mixed",
  "gerund","infinitive","to-preposition","bare-infinitive","preposition","phrasal-verb","collocation",
  "article","quantifier","countable-uncountable","comparative","superlative","relative-clause","passive",
  "used-to","be-used-to","would-like","there-is","word-order","stop-remember-try","look-forward-to",
  "feel-like","time-preposition","place-preposition","movement-preposition","for-since","by-until",
  "want-someone-to","reported-speech"
]);

const TOPIC_TAGS = new Set([
  "acquaintance","texting","small-talk","humor","dating","relationships","past-relationships",
  "feelings","family","work","travel","daily-life","food","friends","interests","deep-talk",
  "plans","lifestyle","communication"
]);

const LEVELS = new Set(["A1","A2","B1","B2"]);

// Диапазоны уровней по ID (допускаются соседние уровни на границах)
const LEVEL_RANGES = [
  { from: 1, to: 300, allowed: ["A1","A2"] },
  { from: 301, to: 800, allowed: ["A2","B1"] },
  { from: 801, to: 1400, allowed: ["B1"] },
  { from: 1401, to: 1800, allowed: ["B1","B2"] },
  { from: 1801, to: 2000, allowed: ["B2"] }
];

// Минимальные квоты покрытия для полной базы (--final)
const FINAL_MIN = {
  "present-simple": 350, "present-continuous": 240, "past-simple": 250, "present-perfect": 170,
  "present-perfect-continuous": 60, "past-continuous": 50, "going-to": 70, "future-will": 100,
  "past-perfect": 30, "future-continuous": 18, "future-perfect": 10, "future-perfect-continuous": 3,
  "past-perfect-continuous": 8,
  question: 620, negation: 280, "indirect-question": 60, modal: 150,
  gerund: 150, infinitive: 180, "to-preposition": 30, preposition: 300,
  "time-preposition": 90, "place-preposition": 60, "movement-preposition": 25,
  article: 200, quantifier: 70, "countable-uncountable": 35, "phrasal-verb": 130,
  "relative-clause": 55, passive: 35, comparative: 40,
  "conditional-0": 18, "conditional-1": 35, "conditional-2": 28, "conditional-3": 12, "conditional-mixed": 6,
  "used-to": 15, "be-used-to": 12, "stop-remember-try": 10, collocation: 120, "word-order": 40,
  imperative: 30, "would-like": 20
};

const FINAL_TOPIC_MIN = {
  acquaintance: 130, texting: 160, "small-talk": 90, humor: 50, dating: 150, relationships: 160,
  "past-relationships": 55, feelings: 85, family: 95, work: 150, travel: 150, "daily-life": 150,
  food: 55, friends: 55, interests: 115, "deep-talk": 130, plans: 100, lifestyle: 70, communication: 130
};

let errors = [];
let warnings = [];

let raw;
try {
  raw = JSON.parse(readFileSync(DATASET_PATH, "utf8"));
} catch (e) {
  console.error(`Не удалось прочитать ${DATASET_PATH}: ${e.message}`);
  process.exit(1);
}

if (typeof raw.datasetVersion !== "number") errors.push("datasetVersion отсутствует или не число");
if (!Array.isArray(raw.sentences)) {
  console.error("sentences — не массив");
  process.exit(1);
}
const list = raw.sentences;
const n = list.length;

// --- Структурные проверки ---
const idSet = new Set();
const russianSet = new Map();
const englishSet = new Map();

const normalize = (s) =>
  s.toLowerCase().replace(/[’']/g, "'").replace(/[—–-]/g, "-").replace(/\s+/g, " ").replace(/[.,!?;:()"«»]/g, "").trim();

for (const s of list) {
  const where = `id=${s.id ?? "?"}`;
  if (!Number.isInteger(s.id) || s.id < 1 || s.id > 2000) errors.push(`${where}: некорректный id`);
  if (idSet.has(s.id)) errors.push(`${where}: дубль ID`);
  idSet.add(s.id);

  for (const [field, minLen] of [["russian", 5], ["english", 3], ["explanation", 120]]) {
    const v = s[field];
    if (typeof v !== "string" || v.trim().length === 0) {
      errors.push(`${where}: пустое поле ${field}`);
    } else if (v.trim().length < minLen) {
      errors.push(`${where}: подозрительно короткое ${field} (${v.trim().length} символов)`);
    }
  }

  if (typeof s.russian === "string") {
    const key = normalize(s.russian);
    if (russianSet.has(key)) errors.push(`${where}: точный дубль russian с id=${russianSet.get(key)}`);
    else russianSet.set(key, s.id);
  }
  if (typeof s.english === "string") {
    const key = normalize(s.english);
    if (englishSet.has(key)) errors.push(`${where}: точный дубль english с id=${englishSet.get(key)}`);
    else englishSet.set(key, s.id);
  }

  if (!LEVELS.has(s.level)) errors.push(`${where}: некорректный level "${s.level}"`);
  if (!Array.isArray(s.grammarTags) || s.grammarTags.length === 0) errors.push(`${where}: нет grammarTags`);
  else for (const t of s.grammarTags) if (!GRAMMAR_TAGS.has(t)) errors.push(`${where}: неизвестный grammarTag "${t}"`);
  if (!Array.isArray(s.topicTags) || s.topicTags.length === 0) errors.push(`${where}: нет topicTags`);
  else for (const t of s.topicTags) if (!TOPIC_TAGS.has(t)) errors.push(`${where}: неизвестный topicTag "${t}"`);

  // level соответствует диапазону ID (только для полной базы)
  if (FINAL && Number.isInteger(s.id) && LEVELS.has(s.level)) {
    const range = LEVEL_RANGES.find((r) => s.id >= r.from && s.id <= r.to);
    if (range && !range.allowed.includes(s.level)) {
      errors.push(`${where}: level ${s.level} вне диапазона ${range.allowed.join("/")} для id ${range.from}–${range.to}`);
    }
  }

  // Русские кальки-маркеры в english
  if (typeof s.english === "string") {
    const en = " " + s.english.toLowerCase() + " ";
    for (const bad of [" very like ", " i wait you ", " have 27 years", " have 30 years", " i very "]) {
      if (en.includes(bad)) errors.push(`${where}: похоже на кальку: "${bad.trim()}"`);
    }
  }

  // Санити: вопрос с тегом question должен заканчиваться на "?"
  if (Array.isArray(s.grammarTags) && s.grammarTags.includes("question") && typeof s.english === "string") {
    if (!s.english.includes("?")) warnings.push(`${where}: тег question, но в english нет "?"`);
  }
}

// --- Счётчики покрытия ---
const grammarCount = {};
const topicCount = {};
const levelCount = {};
for (const s of list) {
  for (const t of s.grammarTags ?? []) grammarCount[t] = (grammarCount[t] ?? 0) + 1;
  for (const t of s.topicTags ?? []) topicCount[t] = (topicCount[t] ?? 0) + 1;
  levelCount[s.level] = (levelCount[s.level] ?? 0) + 1;
}

const questionCount = (grammarCount["question"] ?? 0) + (grammarCount["indirect-question"] ?? 0);
const questionShare = n > 0 ? questionCount / n : 0;

// --- Финальные требования ---
if (FINAL) {
  if (n !== 2000) errors.push(`Ровно 2000 записей требуется, сейчас ${n}`);
  for (let i = 1; i <= 2000; i++) if (!idSet.has(i)) { errors.push(`Отсутствуют ID (первый: ${i})`); break; }
  if (questionShare < 0.33) errors.push(`Вопросов ${(questionShare * 100).toFixed(1)}% — нужно ≥33% (цель ~35%)`);
  for (const [tag, min] of Object.entries(FINAL_MIN)) {
    const c = grammarCount[tag] ?? 0;
    if (c < min) errors.push(`Покрытие ${tag}: ${c} < ${min}`);
  }
  for (const [tag, min] of Object.entries(FINAL_TOPIC_MIN)) {
    const c = topicCount[tag] ?? 0;
    if (c < min) errors.push(`Тема ${tag}: ${c} < ${min}`);
  }
} else {
  if (questionShare < 0.3 && n >= 100) warnings.push(`Вопросов пока ${(questionShare * 100).toFixed(1)}% (цель ~35%)`);
}

// --- Отчёт ---
console.log(`Dataset: ${DATASET_PATH}`);
console.log(`Записей: ${n}, datasetVersion: ${raw.datasetVersion}`);
console.log(`Уровни: ${JSON.stringify(levelCount)}`);
console.log(`Вопросы (прямые+косвенные): ${questionCount} (${(questionShare * 100).toFixed(1)}%)`);
console.log(`Отрицания: ${grammarCount["negation"] ?? 0}`);
console.log("\nГрамматика:");
for (const t of [...GRAMMAR_TAGS].sort()) {
  if (grammarCount[t]) console.log(`  ${t}: ${grammarCount[t]}`);
}
console.log("\nТемы:");
for (const t of [...TOPIC_TAGS].sort()) {
  console.log(`  ${t}: ${topicCount[t] ?? 0}`);
}

if (warnings.length) {
  console.log(`\n⚠ Предупреждения (${warnings.length}):`);
  for (const w of warnings.slice(0, 30)) console.log("  " + w);
  if (warnings.length > 30) console.log(`  … и ещё ${warnings.length - 30}`);
}

if (errors.length) {
  console.error(`\n✗ Ошибки (${errors.length}):`);
  for (const e of errors.slice(0, 50)) console.error("  " + e);
  if (errors.length > 50) console.error(`  … и ещё ${errors.length - 50}`);
  process.exit(1);
}
console.log(`\n✓ Валидация пройдена${FINAL ? " (final)" : ""}`);
