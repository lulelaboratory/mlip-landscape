import {
  INITIAL_NODES,
  INITIAL_EDGES,
  type AnyNode,
  type ModelNode,
  type GroupNode,
  type Edge,
} from "../src/data/landscape";

const CARD_WIDTH = 176;
const CARD_HEIGHT = 72;
const VALID_CATEGORIES = new Set([
  "Equivariant",
  "Invariant",
  "Transformer",
  "Descriptor",
]);
const MIN_YEAR = 1990;
const MAX_YEAR = new Date().getFullYear() + 1;

type Issue = { kind: string; detail: string };
const issues: Issue[] = [];

const push = (kind: string, detail: string) => issues.push({ kind, detail });

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

// --- Report ---
const modelCount = modelNodes.length;
const groupCount = groupNodes.length;
const edgeCount = (INITIAL_EDGES as Edge[]).length;

if (issues.length === 0) {
  console.log(
    `landscape check: OK (${modelCount} models, ${groupCount} zones, ${edgeCount} edges)`,
  );
  process.exit(0);
}

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
