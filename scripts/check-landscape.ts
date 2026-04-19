import {
  INITIAL_NODES,
  INITIAL_EDGES,
  MAINTENANCE_STATUSES,
  FRAMEWORK_TAGS,
  PROPERTY_TAGS,
  MODEL_META_FIELDS,
  type AnyNode,
  type ModelNode,
  type GroupNode,
  type Edge,
  type ModelMeta,
} from "../src/data/landscape";

const CARD_WIDTH = 176;
const CARD_HEIGHT = 72;
const VALID_CATEGORIES = new Set([
  "Equivariant",
  "Invariant",
  "Transformer",
  "Descriptor",
]);
const VALID_MAINTENANCE = new Set<string>(MAINTENANCE_STATUSES);
const VALID_FRAMEWORKS = new Set<string>(FRAMEWORK_TAGS);
const VALID_PROPERTIES = new Set<string>(PROPERTY_TAGS);
const SPDX_ALLOWLIST = new Set([
  "MIT",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "GPL-3.0",
  "GPL-3.0-only",
  "GPL-3.0-or-later",
  "LGPL-3.0",
  "MPL-2.0",
  "CC-BY-4.0",
  "CC-BY-SA-4.0",
  "Unlicense",
  "proprietary",
]);
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MIN_YEAR = 1990;
const MAX_YEAR = new Date().getFullYear() + 1;

type Issue = { kind: string; detail: string };
const issues: Issue[] = [];
const warnings: Issue[] = [];

const push = (kind: string, detail: string) => issues.push({ kind, detail });
const warn = (kind: string, detail: string) => warnings.push({ kind, detail });

// --- 1. Required fields ---
const modelNodes: ModelNode[] = [];
const groupNodes: GroupNode[] = [];

type LooseNode = Partial<ModelNode> & Partial<GroupNode> & { id?: string; type?: string };

for (const rawNode of INITIAL_NODES as AnyNode[]) {
  const node = rawNode as LooseNode;
  if (!node.id || typeof node.id !== "string") {
    push("missing-id", `Node has no id: ${JSON.stringify(rawNode)}`);
    continue;
  }
  if (node.type === "node") {
    const n = rawNode as ModelNode;
    const required: Array<keyof ModelNode> = [
      "id",
      "type",
      "category",
      "label",
      "year",
      "author",
      "x",
      "y",
      "desc",
    ];
    for (const key of required) {
      const v = n[key];
      if (v === undefined || v === null || v === "") {
        push("missing-field", `Model ${n.id} missing required field: ${String(key)}`);
      }
    }
    modelNodes.push(n);
  } else if (node.type === "group") {
    const g = rawNode as GroupNode;
    const required: Array<keyof GroupNode> = [
      "id",
      "type",
      "label",
      "x",
      "y",
      "width",
      "height",
    ];
    for (const key of required) {
      const v = g[key];
      if (v === undefined || v === null || v === "") {
        push("missing-field", `Group ${g.id} missing required field: ${String(key)}`);
      }
    }
    groupNodes.push(g);
  } else {
    push("unknown-type", `Node ${node.id} has unknown type: ${String(node.type)}`);
  }
}

// --- 2. Unique IDs ---
const idCounts = new Map<string, number>();
for (const node of INITIAL_NODES as AnyNode[]) {
  idCounts.set(node.id, (idCounts.get(node.id) ?? 0) + 1);
}
for (const [id, count] of idCounts) {
  if (count > 1) push("duplicate-id", `ID "${id}" used ${count} times`);
}

// --- 3. Category enum ---
for (const n of modelNodes) {
  if (!VALID_CATEGORIES.has(n.category)) {
    push(
      "invalid-category",
      `Model ${n.id} has category "${n.category}" (valid: ${[...VALID_CATEGORIES].join(", ")})`,
    );
  }
}

// --- 4. Edge endpoint resolution ---
const modelIds = new Set(modelNodes.map((n) => n.id));
for (const edge of INITIAL_EDGES as Edge[]) {
  if (!edge.from) push("edge-missing-from", `Edge missing 'from': ${JSON.stringify(edge)}`);
  if (!edge.to) push("edge-missing-to", `Edge missing 'to': ${JSON.stringify(edge)}`);
  if (edge.from && !modelIds.has(edge.from)) {
    push("edge-dangling", `Edge ${edge.from} -> ${edge.to}: 'from' does not resolve to a ModelNode`);
  }
  if (edge.to && !modelIds.has(edge.to)) {
    push("edge-dangling", `Edge ${edge.from} -> ${edge.to}: 'to' does not resolve to a ModelNode`);
  }
}

// --- 5. Card non-overlap ---
const rectsOverlap = (
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) => {
  return !(
    a.x + a.w <= b.x ||
    b.x + b.w <= a.x ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  );
};

for (let i = 0; i < modelNodes.length; i++) {
  for (let j = i + 1; j < modelNodes.length; j++) {
    const a = modelNodes[i];
    const b = modelNodes[j];
    if (
      rectsOverlap(
        { x: a.x, y: a.y, w: CARD_WIDTH, h: CARD_HEIGHT },
        { x: b.x, y: b.y, w: CARD_WIDTH, h: CARD_HEIGHT },
      )
    ) {
      push(
        "overlap",
        `Cards overlap: ${a.id} (${a.x},${a.y}) vs ${b.id} (${b.x},${b.y})`,
      );
    }
  }
}

// --- 6. URL syntax ---
const validHttpsUrl = (value: string) => {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};

for (const n of modelNodes) {
  if (n.githubUrl && !validHttpsUrl(n.githubUrl)) {
    push("bad-url", `Model ${n.id} githubUrl is not a valid URL: ${n.githubUrl}`);
  }
  if (n.paperUrl && !validHttpsUrl(n.paperUrl)) {
    push("bad-url", `Model ${n.id} paperUrl is not a valid URL: ${n.paperUrl}`);
  }
}

// --- 7. Year sanity ---
for (const n of modelNodes) {
  if (typeof n.year !== "number" || n.year < MIN_YEAR || n.year > MAX_YEAR) {
    push(
      "bad-year",
      `Model ${n.id} has year ${n.year} (expected ${MIN_YEAR}-${MAX_YEAR})`,
    );
  }
}

// --- 8. Optional ModelMeta enums, dates, license ---
for (const n of modelNodes) {
  if (n.maintenance !== undefined && !VALID_MAINTENANCE.has(n.maintenance)) {
    push(
      "invalid-maintenance",
      `Model ${n.id} has maintenance "${n.maintenance}" (valid: ${[...VALID_MAINTENANCE].join(", ")})`,
    );
  }
  if (n.frameworks) {
    for (const f of n.frameworks) {
      if (!VALID_FRAMEWORKS.has(f)) {
        push(
          "invalid-framework",
          `Model ${n.id} has framework "${f}" (valid: ${[...VALID_FRAMEWORKS].join(", ")})`,
        );
      }
    }
  }
  if (n.properties) {
    for (const p of n.properties) {
      if (!VALID_PROPERTIES.has(p)) {
        push(
          "invalid-property",
          `Model ${n.id} has property "${p}" (valid: ${[...VALID_PROPERTIES].join(", ")})`,
        );
      }
    }
  }
  if (n.lastReviewed !== undefined) {
    if (n.lastReviewed !== "unknown" && !ISO_DATE_RE.test(n.lastReviewed)) {
      push(
        "bad-date",
        `Model ${n.id} lastReviewed "${n.lastReviewed}" is not YYYY-MM-DD (or "unknown")`,
      );
    }
  }
  if (n.lastUpdated !== undefined && !ISO_DATE_RE.test(n.lastUpdated)) {
    push(
      "bad-date",
      `Model ${n.id} lastUpdated "${n.lastUpdated}" is not YYYY-MM-DD`,
    );
  }
  if (n.license !== undefined && !SPDX_ALLOWLIST.has(n.license)) {
    warn(
      "unknown-license",
      `Model ${n.id} license "${n.license}" is not in the SPDX allowlist (still accepted)`,
    );
  }
}

// --- 9. Metadata coverage report (non-blocking) ---
const coverage: Record<string, number> = {};
for (const field of MODEL_META_FIELDS) coverage[field] = 0;
for (const n of modelNodes) {
  for (const field of MODEL_META_FIELDS) {
    const v = (n as ModelMeta)[field];
    const present = Array.isArray(v) ? v.length > 0 : v !== undefined && v !== "";
    if (present) coverage[field] += 1;
  }
}

// --- Report ---
const modelCount = modelNodes.length;
const groupCount = groupNodes.length;
const edgeCount = (INITIAL_EDGES as Edge[]).length;

const coverageLines = MODEL_META_FIELDS.map((field) => {
  const n = coverage[field];
  const pct = modelCount === 0 ? 0 : Math.round((n / modelCount) * 100);
  return `    ${field.padEnd(14)} ${String(n).padStart(3)}/${modelCount}  ${String(pct).padStart(3)}%`;
}).join("\n");

const printSummary = () => {
  console.log(
    `landscape check: ${modelCount} models, ${groupCount} zones, ${edgeCount} edges`,
  );
  console.log(`\n  metadata coverage (optional ModelMeta fields):`);
  console.log(coverageLines);
  if (warnings.length > 0) {
    console.log(`\n  warnings (${warnings.length}):`);
    for (const w of warnings) console.log(`    - [${w.kind}] ${w.detail}`);
  }
};

if (issues.length === 0) {
  printSummary();
  console.log(`\nlandscape check: OK`);
  process.exit(0);
}
printSummary();

const grouped = new Map<string, string[]>();
for (const { kind, detail } of issues) {
  const arr = grouped.get(kind) ?? [];
  arr.push(detail);
  grouped.set(kind, arr);
}

console.error(
  `landscape check: FAILED — ${issues.length} issue(s) across ${grouped.size} categor${grouped.size === 1 ? "y" : "ies"}`,
);
for (const [kind, details] of grouped) {
  console.error(`\n  [${kind}] (${details.length})`);
  for (const d of details) console.error(`    - ${d}`);
}
process.exit(1);
