import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  INITIAL_NODES,
  INITIAL_EDGES,
  type AnyNode,
  type ModelNode,
  type GroupNode,
  type Edge,
} from "../src/data/landscape";
import pkg from "../package.json";

const SCHEMA_VERSION = "1";
const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "data");
mkdirSync(outDir, { recursive: true });

const version = (pkg as { version: string }).version;
const generatedAt = new Date().toISOString();

const models: ModelNode[] = (INITIAL_NODES as AnyNode[]).filter(
  (n): n is ModelNode => n.type === "node",
);
const groups: GroupNode[] = (INITIAL_NODES as AnyNode[]).filter(
  (n): n is GroupNode => n.type === "group",
);
const edges: Edge[] = INITIAL_EDGES as Edge[];

const payload = {
  schemaVersion: SCHEMA_VERSION,
  generatedAt,
  version,
  models,
  groups,
  edges,
};

const jsonPath = join(outDir, `landscape-v${version}.json`);
const latestPath = join(outDir, "landscape-latest.json");
const csvPath = join(outDir, `landscape-v${version}.csv`);

const json = JSON.stringify(payload, null, 2);
writeFileSync(jsonPath, json);
writeFileSync(latestPath, json);

const CSV_COLUMNS: Array<keyof ModelNode> = [
  "id",
  "label",
  "category",
  "year",
  "author",
  "desc",
  "githubUrl",
  "paperUrl",
  "license",
  "maintenance",
  "lastReviewed",
  "lastUpdated",
];

const escapeCsv = (v: unknown): string => {
  if (v === undefined || v === null) return "";
  const s = Array.isArray(v) ? v.join("; ") : String(v);
  const needsQuote = /[",\n]/.test(s);
  return needsQuote ? `"${s.replace(/"/g, '""')}"` : s;
};

const csvLines = [
  CSV_COLUMNS.join(","),
  ...models.map((m) =>
    CSV_COLUMNS.map((col) => escapeCsv(m[col])).join(","),
  ),
];
writeFileSync(csvPath, csvLines.join("\n") + "\n");

console.log(
  `export:landscape wrote v${version} (${models.length} models, ${groups.length} zones, ${edges.length} edges)`,
);
console.log(`  ${jsonPath}`);
console.log(`  ${latestPath}`);
console.log(`  ${csvPath}`);
