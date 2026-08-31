#!/usr/bin/env node
// Склеивает src/data/batches/batch-*.json в src/data/sentences.json
// и запускает полную валидацию. node scripts/merge-batches.mjs [--final]

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const batchesDir = join(__dirname, "../src/data/batches");
const outPath = join(__dirname, "../src/data/sentences.json");
const FINAL = process.argv.includes("--final");

const files = readdirSync(batchesDir)
  .filter((f) => /^batch-\d\d\.json$/.test(f))
  .sort();

let all = [];
for (const f of files) {
  const arr = JSON.parse(readFileSync(join(batchesDir, f), "utf8"));
  all = all.concat(arr);
}
all.sort((a, b) => a.id - b.id);

const dataset = { datasetVersion: 1, sentences: all };
writeFileSync(outPath, JSON.stringify(dataset, null, 2) + "\n");
console.log(`Склеено пакетов: ${files.length}, записей: ${all.length} → ${outPath}`);

const args = [join(__dirname, "validate-dataset.mjs")];
if (FINAL) args.push("--final");
execFileSync("node", args, { stdio: "inherit" });
