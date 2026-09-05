"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ExternalLink,
  Github,
  Layers,
  Box,
  Cpu,
  Database,
  X,
  Zap,
  Filter,
  Search,
  Copy,
  Check,
  Flag,
  Link2,
  Quote,
  RotateCcw,
  HelpCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  AnyNode,
  ModelNode,
  GroupNode,
  INITIAL_NODES,
  INITIAL_EDGES,
  Edge,
  Category,
  Equivariance,
  Architecture,
  EQUIVARIANCE_VALUES,
  ARCHITECTURE_VALUES,
  effectiveVerificationStatus,
  effectiveEdgeConfidence,
  type VerificationStatus,
  type EntityType,
  type TrainingScope,
  type EdgeConfidence,
} from "@/data/landscape";
import {
  FILTERABLE_DATASET_IDS,
  datasetDisplayName,
  getDataset,
} from "@/data/datasets";
import OnboardingTour from "@/components/OnboardingTour";

// Subtle curation-status pill shown in the model detail panel (next to the
// category badge). Mirrors the table's VerificationBadge styling. Driven by
// `effectiveVerificationStatus`, so an un-curated entry reads "Needs review"
// rather than appearing authoritative.
const VERIFICATION_PILL_STYLES: Record<VerificationStatus, string> = {
  verified:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
  partially_verified:
    "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200",
  needs_review:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
  unverified:
    "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};
const VERIFICATION_PILL_LABELS: Record<VerificationStatus, string> = {
  verified: "Verified",
  partially_verified: "Partially verified",
  needs_review: "Needs review",
  unverified: "Unverified",
};
const VERIFICATION_PILL_TITLES: Record<VerificationStatus, string> = {
  verified: "All surfaced metadata was checked against a cited source.",
  partially_verified:
    "Some metadata is source-checked; other claims are still pending review.",
  needs_review:
    "This entry has not been audited yet — treat its metadata as provisional.",
  unverified:
    "Reviewed, but the metadata could not be backed by a reliable source.",
};

function DetailVerificationBadge({ status }: { status: VerificationStatus }) {
  return (
    <span
      title={VERIFICATION_PILL_TITLES[status]}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.6875em] font-semibold uppercase tracking-wide ${VERIFICATION_PILL_STYLES[status]}`}
    >
      {VERIFICATION_PILL_LABELS[status]}
    </span>
  );
}

// Display labels for the curated identity/capability axes (Phase 2). These
// rows render ONLY from curated, source-backed fields — never derived from
// layout coordinates, category, or any other heuristic.
const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  architecture: "Architecture",
  trained_model: "Trained model",
  model_family: "Model family",
  dataset: "Dataset",
  benchmark: "Benchmark",
};
const TRAINING_SCOPE_LABELS: Record<TrainingScope, string> = {
  single_system: "Single system",
  domain_specific: "Domain-specific",
  multi_domain: "Multi-domain",
  universal_foundation: "Universal (foundation)",
  unknown: "Unknown",
};
// "very_low" -> "very low", "state_of_the_art" -> "state of the art"
const prettyTier = (v: string) => v.replace(/_/g, " ");

// Yes/no capability filter axes. Each reads a tri-state-ish model field; only
// an explicit `true`/`false` matches "yes"/"no" — "unknown", `null`, and
// absent are excluded when the axis is active and are NEVER coerced to false
// (per the no-silent-claims rule). Driving the state, URL round-trip,
// matching, and panel from one list keeps adding axes a one-line change.
//
// `mode` picks the control the panel renders, and follows the data rather
// than taste. "bipolar" axes have both values populated (attention: 37 true /
// 87 false, long-range: 20 / 101), so "no" is a real query and the axis needs
// three states — yes, no, and unfiltered. "flag" axes only ever carry `true`
// (foundation variant 6, multiple heads 3, MoE 4, uncertainty 2, denoising 0);
// their "no" matches nothing at all, so they render as a single switch meaning
// "only show models flagged with this". A switch must never be read as
// asserting `false` for the models it hides — most of them are simply
// unreviewed.
const BOOL_FILTER_AXES = [
  {
    key: "usesAttention",
    mode: "bipolar" as const,
    label: "Attention",
    param: "att",
    tooltip: "The architecture is attention-based.",
    get: (n: ModelNode) => n.usesAttention,
  },
  {
    key: "longRange",
    mode: "bipolar" as const,
    label: "Long-range",
    param: "long",
    tooltip: "Explicitly handles long-range electrostatics / Ewald summation.",
    get: (n: ModelNode) => n.longRange,
  },
  {
    key: "hasFoundationVariant",
    mode: "flag" as const,
    label: "Foundation variant",
    param: "foundation",
    tooltip:
      "A foundation-style pretrained variant exists in this model's family.",
    get: (n: ModelNode) => n.hasFoundationVariant,
  },
  {
    key: "hasDenoisingPretraining",
    mode: "flag" as const,
    label: "Denoising pretraining",
    param: "denoise",
    tooltip:
      "Pretrained with a denoising objective (de-noising perturbed structures).",
    get: (n: ModelNode) => n.hasDenoisingPretraining,
  },
  {
    key: "hasMultipleHeads",
    mode: "flag" as const,
    label: "Multiple heads",
    param: "heads",
    tooltip:
      "Has multiple prediction heads (e.g. multi-task or multi-fidelity outputs).",
    get: (n: ModelNode) => n.hasMultipleHeads,
  },
  {
    key: "hasMultipleExperts",
    mode: "flag" as const,
    label: "Mixture of experts",
    param: "moe",
    tooltip: "Uses a mixture-of-experts (MoE) / multiple-expert design.",
    get: (n: ModelNode) => n.hasMultipleExperts,
  },
  {
    key: "hasUncertaintyEstimates",
    mode: "flag" as const,
    label: "Uncertainty",
    param: "uncertainty",
    tooltip: "Provides uncertainty / error estimates on its predictions.",
    get: (n: ModelNode) => n.hasUncertaintyEstimates,
  },
] as const;

type BoolAxisKey = (typeof BOOL_FILTER_AXES)[number]["key"];

const CARD_WIDTH = 176;
const CARD_HEIGHT = 72;
const CARD_PADDING = 8;
const CANVAS_PADDING = 160;
// Display zoom range — what the user can drive the % readout to. The −/+
// buttons and wheel zoom both clamp the effective (baseScale × userScale)
// scale to this range so 10% always means 10% on screen, regardless of
// which layout the auto-fit landed on.
const MIN_DISPLAY_SCALE = 0.1;
const MAX_DISPLAY_SCALE = 1.5;
// Auto-fit clamps for the per-layout baseScale. Kept loose so the auto-fit
// can land wherever the layout naturally wants — the user can then zoom
// inside the display range above.
const MIN_BASE_SCALE = 0.1;
const MAX_BASE_SCALE = 1.2;
const SIDEBAR_WIDTH = 360;
const TABLET_SIDEBAR_WIDTH = 320;
const HEADER_HEIGHT = 112;

const FONT_SCALES = [0.85, 1, 1.15, 1.3] as const;
const DEFAULT_FONT_SCALE: number = 1;
// Pointer travel (in screen px) before a press is treated as a canvas pan
// rather than a click. Keeps taps on cards/edges selecting while letting a
// drag that begins on them pan the canvas.
const PAN_CLICK_THRESHOLD = 5;
const FONT_SCALE_STORAGE_KEY = "mliphub.fontScale";

// Multipliers applied to the curated layered coordinates so cards fan out
// horizontally and vertically. Larger values give the edge router more room
// to fan out parallel detours through busy hubs (e.g. MACE, NequIP) without
// re-tuning every entry in the data file.
const LAYERED_SPACING_X = 1.2;
const LAYERED_SPACING_Y = 1.15;

// Layered grid metrics. Column gap (curated raw 280) drives both the
// compact-layout column spacing and the edge router's "adjacent column"
// threshold, so it has to stay a module-level constant. The vertical
// landmarks (top-band boundary, inter-zone gap, same-column threshold)
// used to be hard-coded too, but now move with the wrapped layout —
// see `computeCompactLayeredLayout` and the `compactLayeredLayout` memo.
const LAYERED_COLUMN_GAP = 280 * LAYERED_SPACING_X;
const LAYERED_SAME_COL_GAP = 200 * LAYERED_SPACING_Y;

// Default palette tuned for general legibility. Pairs each category with a
// Tailwind color family for the card border, background, and dark variants.
const CATEGORY_STYLES_DEFAULT: Record<Category, string> = {
  Equivariant:
    "bg-red-50 border-red-500 text-red-900 hover:shadow-red-200 dark:bg-red-950/50 dark:border-red-400 dark:text-red-100 dark:hover:shadow-red-900/40",
  Invariant:
    "bg-blue-50 border-blue-500 text-blue-900 hover:shadow-blue-200 dark:bg-blue-950/50 dark:border-blue-400 dark:text-blue-100 dark:hover:shadow-blue-900/40",
  Transformer:
    "bg-green-50 border-green-600 text-green-900 hover:shadow-green-200 dark:bg-green-950/50 dark:border-green-400 dark:text-green-100 dark:hover:shadow-green-900/40",
  Descriptor:
    "bg-orange-50 border-orange-500 text-orange-900 hover:shadow-orange-200 dark:bg-orange-950/50 dark:border-orange-400 dark:text-orange-100 dark:hover:shadow-orange-900/40",
};

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  Equivariant: Box,
  Invariant: Layers,
  Transformer: Zap,
  Descriptor: Database,
};

// Color swatch per category for the filter/legend dot. Values intentionally
// mirror the node card palette so the filter row doubles as a color legend.
const CATEGORY_SWATCH_DEFAULT: Record<Category, string> = {
  Equivariant: "bg-red-500",
  Invariant: "bg-blue-500",
  Transformer: "bg-green-600",
  Descriptor: "bg-orange-500",
};

// Color buckets derived from the multi-axis tag fields. We bin by the most
// common (equivariance, architecture, attention) combinations rather than
// painting every distinct tuple a different colour — six buckets cover
// ~90% of the catalogue and stay legible in a legend.
type ColorBucket =
  | "eq-gnn"       // constrained-equivariant (NequIP, MACE, Allegro, Equiformer)
  | "inv-gnn"      // invariant GNN (SchNet, DimeNet, M3GNet, CHGNet)
  | "descriptor"   // descriptor + regression / NN (BPNN, GAP, ANI, ACE, MTP)
  | "learnt"       // learnt / data-augmented equivariance (Orb, MatterSim)
  | "unknown";     // unverified or ambiguous tag fields

const BUCKET_LABEL: Record<ColorBucket, string> = {
  "eq-gnn": "Equivariant",
  "inv-gnn": "Invariant GNN",
  descriptor: "Descriptor",
  learnt: "Learnt equivariance",
  unknown: "Unclassified",
};

const BUCKET_STYLES_DEFAULT: Record<ColorBucket, string> = {
  "eq-gnn":
    "bg-red-50 border-red-500 text-red-900 hover:shadow-red-200 dark:bg-red-950/50 dark:border-red-400 dark:text-red-100 dark:hover:shadow-red-900/40",
  "inv-gnn":
    "bg-blue-50 border-blue-500 text-blue-900 hover:shadow-blue-200 dark:bg-blue-950/50 dark:border-blue-400 dark:text-blue-100 dark:hover:shadow-blue-900/40",
  descriptor:
    "bg-orange-50 border-orange-500 text-orange-900 hover:shadow-orange-200 dark:bg-orange-950/50 dark:border-orange-400 dark:text-orange-100 dark:hover:shadow-orange-900/40",
  learnt:
    "bg-purple-50 border-purple-500 text-purple-900 hover:shadow-purple-200 dark:bg-purple-950/50 dark:border-purple-400 dark:text-purple-100 dark:hover:shadow-purple-900/40",
  unknown:
    "bg-slate-50 border-slate-400 text-slate-700 hover:shadow-slate-200 dark:bg-slate-800/50 dark:border-slate-500 dark:text-slate-200 dark:hover:shadow-slate-900/40",
};

const BUCKET_SWATCH_DEFAULT: Record<ColorBucket, string> = {
  "eq-gnn": "bg-red-500",
  "inv-gnn": "bg-blue-500",
  descriptor: "bg-orange-500",
  learnt: "bg-purple-500",
  unknown: "bg-slate-400",
};

const BUCKET_ICONS: Record<ColorBucket, LucideIcon> = {
  "eq-gnn": Box,
  "inv-gnn": Layers,
  descriptor: Database,
  learnt: Sparkles,
  unknown: HelpCircle,
};

// Bin a model into one of the colour buckets. Order matters: descriptor and
// learnt-equivariance short-circuit before the equivariance-axis check so
// that e.g. a constrained-equivariant attention model still falls under the
// generic "Equivariant" bucket — attention is a filter axis, not a primary
// taxonomic split. Models with insufficient tag data fall through to
// "unknown".
function colorBucketOf(node: ModelNode): ColorBucket {
  if (node.equivariance === "learnt") return "learnt";
  if (node.architecture === "descriptor") return "descriptor";
  if (node.equivariance === "constrained") return "eq-gnn";
  if (node.equivariance === "invariant") return "inv-gnn";
  return "unknown";
}

const GITHUB_REPO = "https://github.com/lulelaboratory/mlip-landscape";

type FilterType = "All" | Category;

const CATEGORY_FILTERS: readonly FilterType[] = [
  "All",
  "Equivariant",
  "Invariant",
  "Transformer",
  "Descriptor",
] as const;

const isCategoryFilter = (value: string | null): value is FilterType =>
  value !== null && (CATEGORY_FILTERS as readonly string[]).includes(value);

type DeviceType = "mobile" | "tablet" | "desktop";

type LayoutMode = "layered" | "force" | "timeline";
const LAYOUT_STORAGE_KEY = "mliphub.layout";
const EDGE_LABELS_STORAGE_KEY = "mliphub.edgeLabels";
const SHOW_CONNECTIONS_STORAGE_KEY = "mliphub.showConnections";
const UNVERIFIED_EDGES_STORAGE_KEY = "mliphub.unverifiedEdges";

// Human-readable wording for each edge trust tier, used by tooltips and the
// connection detail panel so unverified links are always clearly marked.
const EDGE_CONFIDENCE_LABELS: Record<EdgeConfidence, string> = {
  verified: "verified",
  probable: "probable (not yet source-verified)",
  speculative: "speculative (weak link)",
  unknown: "unverified",
};
const FORCE_OVERRIDES_STORAGE_KEY = "mliphub.forceOverrides";

const isLayoutMode = (value: string | null): value is LayoutMode =>
  value === "layered" || value === "force" || value === "timeline";

// Timeline layout constants — drives the "Tree of Life" view that places
// cards along a horizontal year axis with vertical lanes per category.
// The timeline resolves down to months in the years that need it. Placing
// every model of a year in one column made recent years unreadable: 2026
// alone holds ~56 models, so its Equivariant lane became a ~34-card vertical
// stack several thousand pixels tall.
//
// Splitting *every* year into months is the obvious fix but a bad one: it
// stretches the canvas to ~10:1, and because the view auto-fits, the cards
// end up smaller than before. Instead a year is broken into month columns
// only once one of its lanes would otherwise need more than
// TIMELINE_YEAR_SPLIT_SUBCOLS sub-columns on its own — today that is 2026
// and nothing else, and 2027 will split itself when it fills up. Months with
// no releases are not given a column at all, so quiet stretches cost nothing.
const TIMELINE_MONTH_STEP = 190; // x step per stacked sub-column (CARD_WIDTH + gap)
const TIMELINE_MAX_STACK = 5; // cards stacked vertically before a new sub-column
const TIMELINE_YEAR_SPLIT_SUBCOLS = 2; // sub-columns a lane may fill before its year splits
// Cards render considerably taller than the nominal CARD_HEIGHT of 72: the
// category badge plus a wrapped title puts them at 98-118px in practice. The
// row step has to clear the tallest card or every stacked pair overlaps, so
// this is deliberately generous rather than derived from CARD_HEIGHT.
const TIMELINE_LANE_ROW_HEIGHT = 130; // vertical spacing between stacked cards
const TIMELINE_YEAR_GAP = 56; // blank gutter between adjacent years
const TIMELINE_TOP = 100; // top padding above the first lane
const TIMELINE_LEFT = 120; // left padding before the first year tick
const TIMELINE_AXIS_HEIGHT = 76; // reserved space at the top for the axis

const TIMELINE_MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const TIMELINE_BAND_HEADER = 34; // vertical mode: header strip above each band
const TIMELINE_VERTICAL_LEFT = 16; // vertical mode: left inset (no axis gutter needed)
const TIMELINE_VERTICAL_TOP = 24; // vertical mode: top inset (no axis band above)

// Which way time runs. Horizontal is the desktop tree-of-life (time → x, one
// lane per family). Vertical is the phone layout: time → y, newest first,
// because a 390px-wide screen cannot hold four lanes side by side.
type TimelineOrientation = "horizontal" | "vertical";

// One bucket of the timeline: either a real month (month 1-12) or the
// "month unknown" bucket (month 0) that leads each year. Horizontal mode uses
// x/width; vertical mode uses y/height.
type TimelineColumn = {
  year: number;
  month: number; // 0 = whole year, or "month unknown" inside a split year
  x: number;
  width: number;
  y: number;
  height: number;
  count: number; // models in this column (all lanes)
  split: boolean; // whether this column's year is broken out into months
};

// Publication month, derived from a modern arXiv id (YYMM.NNNNN) in paperUrl.
//
// The curated `year` field stays authoritative for horizontal placement: for
// 16 catalogue entries the arXiv preprint year differs from the curated year
// (MACE-MH-1 is `year: 2026` but arXiv 2510 = Oct 2025), usually because the
// curator recorded the release/publication year rather than the preprint. So
// the arXiv month only refines a card *within* the year the curator assigned;
// when the two years disagree the month is treated as unknown rather than
// silently moving the card into a different year.
function timelineMonth(node: ModelNode): number | null {
  const url = node.paperUrl;
  if (!url) return null;
  const m = /arxiv\.org\/(?:abs|pdf)\/(\d{2})(\d{2})\.\d{4,5}/i.exec(url);
  if (!m) return null;
  const year = 2000 + Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  if (year !== node.year) return null;
  return month;
}

// Deterministic force-directed layout. Seeded with a category-clustered
// grid so the four families fan out into distinct quadrants, then refined
// by repulsion + spring + collision passes that adapt to graph size so the
// simulation keeps producing a readable layout as new cards are added.
// Self-contained (no d3-force runtime dependency).
type Vec2 = { x: number; y: number };

// Where on a card's rectangular boundary does the line from its centre
// toward (dx, dy) exit? Returns the exit point in absolute coordinates.
// Used to anchor edges to the card border in force layout, instead of a
// circle of radius CARD_WIDTH/2 (which is too small in y and too large in
// the corners for the 176x72 rectangle).
function rectExitPoint(
  cx: number,
  cy: number,
  halfW: number,
  halfH: number,
  dx: number,
  dy: number,
): Vec2 {
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  const tx = adx < 1e-6 ? Infinity : halfW / adx;
  const ty = ady < 1e-6 ? Infinity : halfH / ady;
  const t = Math.min(tx, ty);
  return { x: cx + dx * t, y: cy + dy * t };
}

function computeForcePositions(
  modelNodes: ModelNode[],
  edges: Edge[],
): Record<string, Vec2> {
  const positions: Record<string, Vec2> = {};

  // Seed by category cluster: each category occupies a quadrant centred at
  // a fixed offset from the origin, with cards within a category packed in
  // a small grid. This gives the simulation a strong category-grouped
  // starting point so similar models stay near each other while the spring
  // / repulsion forces pull lineage edges into shape.
  const categoryOrder: Category[] = [
    "Equivariant",
    "Transformer",
    "Invariant",
    "Descriptor",
  ];
  // Category cluster centres — chosen so the four families fan out into
  // distinct regions instead of overlapping at the origin.
  const clusterCenter: Record<Category, Vec2> = {
    Equivariant: { x: -1100, y: -700 },
    Transformer: { x: 1100, y: -700 },
    Invariant: { x: -1100, y: 700 },
    Descriptor: { x: 1100, y: 700 },
  };

  const byCategory = new Map<Category, ModelNode[]>();
  for (const cat of categoryOrder) byCategory.set(cat, []);
  for (const n of modelNodes) {
    const list = byCategory.get(n.category);
    if (list) list.push(n);
  }
  // Within each category, sort by year so older models sit closer to the
  // cluster centre and newer ones expand outward — a soft chronological
  // hint that survives the simulation.
  for (const cat of categoryOrder) {
    const list = byCategory.get(cat) ?? [];
    list.sort((a, b) => a.year - b.year);
    const center = clusterCenter[cat];
    const cols = Math.ceil(Math.sqrt(Math.max(1, list.length)));
    const cellW = CARD_WIDTH * 1.7;
    const cellH = CARD_HEIGHT * 2.6;
    list.forEach((n, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      // Centre the grid on the cluster centre.
      const dx = (col - (cols - 1) / 2) * cellW;
      const dy = (row - (cols - 1) / 2) * cellH;
      positions[n.id] = { x: center.x + dx, y: center.y + dy };
    });
  }

  const N = modelNodes.length;

  // Adapt key forces to graph size so the simulation degrades gracefully
  // as more models are added. The repulsion / link / collision parameters
  // grow gently with N so big graphs keep the same visual breathing room
  // a small graph has, instead of collapsing into a tight ball.
  const sizeScale = Math.max(1, Math.sqrt(N / 30));
  const idealLink = 320 * sizeScale;
  const repulsion = 130000 * sizeScale;
  const linkStrength = 0.05;
  const centerStrength = 0.0035;
  // Slight category-level cohesion: pulls each card toward its category
  // cluster centre so families don't drift apart under repulsion.
  const categoryCohesion = 0.012;
  // Card half-extent plus padding — used by the rectangle-based collision
  // pass that prevents cards from physically overlapping.
  const PAD_X = 36;
  const PAD_Y = 30;
  const halfW = CARD_WIDTH / 2 + PAD_X;
  const halfH = CARD_HEIGHT / 2 + PAD_Y;

  // Hot-loop data layout: the simulation below is O(N² · ticks), so it runs
  // on flat typed arrays indexed by node position instead of Records keyed
  // by id — no string hashing and no per-tick object allocation. This is a
  // pure data-structure change; the maths and iteration order match the
  // previous Record-based implementation.
  const indexOf = new Map<string, number>();
  modelNodes.forEach((n, i) => indexOf.set(n.id, i));
  const px = new Float64Array(N);
  const py = new Float64Array(N);
  const vx = new Float64Array(N);
  const vy = new Float64Array(N);
  for (let i = 0; i < N; i += 1) {
    const seed = positions[modelNodes[i].id];
    px[i] = seed.x;
    py[i] = seed.y;
  }
  const fx = new Float64Array(N);
  const fy = new Float64Array(N);

  // Category cluster centre per node index (used inside the tick loop).
  const ccx = new Float64Array(N);
  const ccy = new Float64Array(N);
  for (let i = 0; i < N; i += 1) {
    const center = clusterCenter[modelNodes[i].category];
    ccx[i] = center.x;
    ccy[i] = center.y;
  }

  // Adjacency-aware repulsion: cards that aren't connected by an edge
  // push each other harder than connected pairs, so unrelated cards never
  // end up neighbours and edges stay short. Flat N×N byte matrix for O(1)
  // lookups in the pair loop.
  const linked = new Uint8Array(N * N);
  const edgeA: number[] = [];
  const edgeB: number[] = [];
  for (const e of edges) {
    const a = indexOf.get(e.from);
    const b = indexOf.get(e.to);
    if (a === undefined || b === undefined) continue;
    linked[a * N + b] = 1;
    linked[b * N + a] = 1;
    edgeA.push(a);
    edgeB.push(b);
  }

  // More iterations for larger graphs — extra ticks give the bigger graph
  // time to unfold without changing the steady-state geometry.
  const TICKS = Math.min(1200, 600 + N * 8);

  for (let tick = 0; tick < TICKS; tick += 1) {
    // Cooling factor: forces calm down over time so the layout settles
    // instead of oscillating. Damping starts ~0.92 and tightens to ~0.55.
    const progress = tick / TICKS;
    const damping = 0.92 - progress * 0.37;

    fx.fill(0);
    fy.fill(0);

    // Repulsive (Coulomb-like) between every pair, with a soft cutoff so
    // very close pairs don't get an unbounded force. Unlinked pairs get a
    // stronger repulsion so they fan out further.
    for (let i = 0; i < N; i += 1) {
      for (let j = i + 1; j < N; j += 1) {
        let dx = px[i] - px[j];
        let dy = py[i] - py[j];
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) {
          dx = (Math.random() - 0.5) * 2;
          dy = (Math.random() - 0.5) * 2;
          d2 = dx * dx + dy * dy + 0.1;
        }
        const d = Math.sqrt(d2);
        const localRepulsion = linked[i * N + j]
          ? repulsion * 0.7
          : repulsion * 1.15;
        const f = localRepulsion / Math.max(d2, 600);
        const dfx = (dx / d) * f;
        const dfy = (dy / d) * f;
        fx[i] += dfx;
        fy[i] += dfy;
        fx[j] -= dfx;
        fy[j] -= dfy;
      }
    }

    // Spring along edges.
    for (let k = 0; k < edgeA.length; k += 1) {
      const a = edgeA[k];
      const b = edgeB[k];
      const dx = px[b] - px[a];
      const dy = py[b] - py[a];
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - idealLink) * linkStrength;
      const dfx = (dx / d) * f;
      const dfy = (dy / d) * f;
      fx[a] += dfx;
      fy[a] += dfy;
      fx[b] -= dfx;
      fy[b] -= dfy;
    }

    // Pull each card toward (0, 0) and toward its category cluster centre.
    for (let i = 0; i < N; i += 1) {
      fx[i] += -px[i] * centerStrength + (ccx[i] - px[i]) * categoryCohesion;
      fy[i] += -py[i] * centerStrength + (ccy[i] - py[i]) * categoryCohesion;
    }

    // Integrate.
    for (let i = 0; i < N; i += 1) {
      vx[i] = (vx[i] + fx[i]) * damping;
      vy[i] = (vy[i] + fy[i]) * damping;
      // Clamp velocity so cards can't shoot off to infinity early on.
      const speed = Math.hypot(vx[i], vy[i]);
      const maxSpeed = 80;
      if (speed > maxSpeed) {
        vx[i] = (vx[i] / speed) * maxSpeed;
        vy[i] = (vy[i] / speed) * maxSpeed;
      }
      px[i] += vx[i];
      py[i] += vy[i];
    }

    // Rectangular collision pass — resolve any pair whose padded card
    // bounding boxes overlap by pushing them apart along the smaller-
    // overlap axis. Repeat once per tick for the first half of the run
    // and twice per tick toward the end so the final layout is overlap-
    // free even when the simulation has nearly cooled off.
    const collisionPasses = progress > 0.5 ? 2 : 1;
    for (let pass = 0; pass < collisionPasses; pass += 1) {
      for (let i = 0; i < N; i += 1) {
        for (let j = i + 1; j < N; j += 1) {
          const dx = px[j] - px[i];
          const dy = py[j] - py[i];
          const overlapX = halfW * 2 - Math.abs(dx);
          const overlapY = halfH * 2 - Math.abs(dy);
          if (overlapX <= 0 || overlapY <= 0) continue;
          if (overlapX < overlapY) {
            const push = (overlapX / 2) * (dx >= 0 ? 1 : -1);
            px[i] -= push;
            px[j] += push;
          } else {
            const push = (overlapY / 2) * (dy >= 0 ? 1 : -1);
            py[i] -= push;
            py[j] += push;
          }
        }
      }
    }
  }

  // Convert back from card-centre to top-left coordinates.
  const out: Record<string, Vec2> = {};
  for (let i = 0; i < N; i += 1) {
    out[modelNodes[i].id] = {
      x: px[i] - CARD_WIDTH / 2,
      y: py[i] - CARD_HEIGHT / 2,
    };
  }
  return out;
}

// Timeline ("Tree of Life") layout — places cards along a time axis with one
// lane per category (horizontal) or as newest-first time bands (vertical).
// The output uses top-left coordinates, matching the rest of the pipeline.
function computeTimelinePositions(
  modelNodes: ModelNode[],
  orientation: TimelineOrientation = "horizontal",
  bandColumns = 2,
): {
  positions: Record<string, Vec2>;
  minYear: number;
  maxYear: number;
  columns: TimelineColumn[];
  totalWidth: number;
  orientation: TimelineOrientation;
} {
  const positions: Record<string, Vec2> = {};
  if (modelNodes.length === 0) {
    return {
      positions,
      minYear: 0,
      maxYear: 0,
      columns: [],
      totalWidth: 0,
      orientation,
    };
  }

  const years = modelNodes.map((n) => n.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  // Lane order: top → bottom. Equivariant first (the dominant family) so
  // the lineage chain reads naturally from top-left. Descriptors at the
  // bottom mirror the layered view.
  const lanes: Category[] = ["Equivariant", "Transformer", "Invariant", "Descriptor"];
  const laneIndex: Record<Category, number> = {
    Equivariant: 0,
    Transformer: 1,
    Invariant: 2,
    Descriptor: 3,
  };

  // A year is split into months only when it is crowded enough that one lane
  // would otherwise run past TIMELINE_YEAR_SPLIT_SUBCOLS sub-columns.
  const splitYears = new Set<number>();
  {
    const laneYear = new Map<string, number>();
    for (const n of modelNodes) {
      const k = `${laneIndex[n.category]}|${n.year}`;
      laneYear.set(k, (laneYear.get(k) ?? 0) + 1);
    }
    const limit = TIMELINE_YEAR_SPLIT_SUBCOLS * TIMELINE_MAX_STACK;
    for (const [k, count] of laneYear) {
      if (count > limit) splitYears.add(Number(k.split("|")[1]));
    }
  }

  const cellKey = (lane: number, year: number, month: number) =>
    `${lane}|${year}|${month}`;
  const cells = new Map<string, ModelNode[]>();
  for (const n of modelNodes) {
    const month = splitYears.has(n.year) ? timelineMonth(n) ?? 0 : 0;
    const key = cellKey(laneIndex[n.category], n.year, month);
    (cells.get(key) ?? cells.set(key, []).get(key)!).push(n);
  }
  for (const list of cells.values()) list.sort((a, b) => a.label.localeCompare(b.label));

  const columns: TimelineColumn[] = [];

  // ---------------------------------------------------------------------
  // Vertical: phones are tall and narrow, so time runs top → bottom with the
  // newest work first (you open the page on what shipped this month, not on
  // 2007). Each time bucket is a band; inside a band the cards wrap across
  // the few columns that fit, ordered by lane so families stay together.
  // Lane identity is carried by the badge on each card rather than by a
  // spatial lane, which simply cannot fit four lanes across a 390px screen.
  // ---------------------------------------------------------------------
  if (orientation === "vertical") {
    const cols = Math.max(1, bandColumns);
    const left = TIMELINE_VERTICAL_LEFT;
    let yCursor = TIMELINE_VERTICAL_TOP;
    for (let year = maxYear; year >= minYear; year -= 1) {
      const split = splitYears.has(year);
      // Newest first: December → January, then the "month unknown" bucket,
      // which is the oldest-sorting slot of its year in the horizontal view.
      const months = split ? [...Array(12).keys()].map((m) => 12 - m).concat(0) : [0];
      let yearStarted = false;
      for (const month of months) {
        const cards = lanes.flatMap(
          (_, lane) => cells.get(cellKey(lane, year, month)) ?? [],
        );
        if (cards.length === 0) continue;
        if (!yearStarted) {
          if (columns.length > 0) yCursor += TIMELINE_YEAR_GAP;
          yearStarted = true;
        }
        const bandTop = yCursor + TIMELINE_BAND_HEADER;
        cards.forEach((n, i) => {
          positions[n.id] = {
            x: left + (i % cols) * TIMELINE_MONTH_STEP,
            y: bandTop + Math.floor(i / cols) * TIMELINE_LANE_ROW_HEIGHT,
          };
        });
        const rows = Math.ceil(cards.length / cols);
        const height = TIMELINE_BAND_HEADER + rows * TIMELINE_LANE_ROW_HEIGHT;
        columns.push({
          year,
          month,
          x: left,
          width: cols * TIMELINE_MONTH_STEP,
          y: yCursor,
          height,
          count: cards.length,
          split,
        });
        yCursor += height;
      }
    }
    return {
      positions,
      minYear,
      maxYear,
      columns,
      totalWidth: cols * TIMELINE_MONTH_STEP,
      orientation,
    };
  }

  // ---------------------------------------------------------------------
  // Horizontal: time runs left → right, one lane per architecture family.
  // ---------------------------------------------------------------------
  let xCursor = TIMELINE_LEFT;
  for (let year = minYear; year <= maxYear; year += 1) {
    const split = splitYears.has(year);
    let yearStarted = false;
    // month 0 leads the year: the whole year for an unsplit year, or the
    // "month unknown" bucket for a split one.
    for (let month = 0; month <= 12; month += 1) {
      if (!split && month > 0) break;
      let maxLane = 0;
      let count = 0;
      for (let lane = 0; lane < lanes.length; lane += 1) {
        const n = cells.get(cellKey(lane, year, month))?.length ?? 0;
        maxLane = Math.max(maxLane, n);
        count += n;
      }
      if (maxLane === 0) continue;
      // Open a gutter before each year (but not before the first column on
      // the canvas) so year boundaries read clearly and the lineage edges
      // crossing them have somewhere to breathe.
      if (!yearStarted) {
        if (columns.length > 0) xCursor += TIMELINE_YEAR_GAP;
        yearStarted = true;
      }
      const subCols = Math.ceil(maxLane / TIMELINE_MAX_STACK);
      const width = subCols * TIMELINE_MONTH_STEP;
      columns.push({ year, month, x: xCursor, width, y: 0, height: 0, count, split });
      xCursor += width;
    }
  }

  // Lane heights follow the deepest stack each lane actually uses (capped at
  // TIMELINE_MAX_STACK), so a lane that never stacks stays a single row.
  const laneRows: number[] = lanes.map(() => 1);
  for (const [key, list] of cells) {
    const lane = Number(key.split("|")[0]);
    laneRows[lane] = Math.max(
      laneRows[lane],
      Math.min(list.length, TIMELINE_MAX_STACK),
    );
  }

  const laneTop: number[] = [];
  let yCursor = TIMELINE_TOP + TIMELINE_AXIS_HEIGHT;
  for (let i = 0; i < lanes.length; i += 1) {
    laneTop.push(yCursor);
    yCursor += TIMELINE_LANE_ROW_HEIGHT * laneRows[i] + 40;
  }

  const columnX = new Map<string, number>();
  for (const c of columns) columnX.set(`${c.year}|${c.month}`, c.x);

  for (const [key, list] of cells) {
    const [laneStr, yearStr, monthStr] = key.split("|");
    const lane = Number(laneStr);
    const baseX = columnX.get(`${yearStr}|${monthStr}`);
    if (baseX === undefined) continue;
    list.forEach((n, idx) => {
      // Fill top-to-bottom, then spill right into the next sub-column.
      const subCol = Math.floor(idx / TIMELINE_MAX_STACK);
      const row = idx % TIMELINE_MAX_STACK;
      positions[n.id] = {
        x: baseX + subCol * TIMELINE_MONTH_STEP,
        y: laneTop[lane] + row * TIMELINE_LANE_ROW_HEIGHT,
      };
    });
  }

  return {
    positions,
    minYear,
    maxYear,
    columns,
    totalWidth: xCursor - TIMELINE_LEFT,
    orientation,
  };
}

// Label for one timeline bucket: the year, plus the month when that year has
// been broken out. The "month unknown" bucket names no month rather than
// implying January.
function timelineColumnLabel(c: TimelineColumn): string {
  if (!c.split) return String(c.year);
  if (c.month === 0) return `${c.year} · month unknown`;
  return `${c.year} · ${TIMELINE_MONTH_LABELS[c.month - 1]}`;
}

// Axis for the timeline layout. Horizontal draws a bold year band with month
// labels beneath it; vertical draws a sticky-looking header above each time
// band, since on a phone the axis is the running order of the page itself.
function TimelineAxis({
  columns,
  orientation,
  bottom,
}: {
  columns: TimelineColumn[];
  orientation: TimelineOrientation;
  bottom: number;
}) {
  if (columns.length === 0) return null;

  if (orientation === "vertical") {
    const last = columns[columns.length - 1];
    return (
      <div
        className="absolute pointer-events-none"
        style={{
          left: 0,
          top: 0,
          width: TIMELINE_VERTICAL_LEFT + last.width + CARD_WIDTH,
          height: last.y + last.height + 60,
          zIndex: 0,
        }}
      >
        {columns.map((c) => (
          <div
            key={`band-${c.year}-${c.month}`}
            className="absolute pointer-events-none select-none"
            style={{ left: c.x, top: c.y + 6, width: c.width }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[0.9em] font-bold text-slate-500 dark:text-slate-300 tracking-wide whitespace-nowrap">
                {timelineColumnLabel(c)}
              </span>
              <span className="h-px flex-1 bg-slate-300/70 dark:bg-slate-600/70" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const axisY = TIMELINE_TOP + 46;
  const axisBottom = Math.max(bottom + 60, axisY + 200);
  const lastCol = columns[columns.length - 1];
  const totalWidth = lastCol.x + lastCol.width - TIMELINE_LEFT;

  // Group columns into year spans so the year label can sit centred above
  // all of that year's months.
  const yearSpans = new Map<number, { start: number; end: number }>();
  for (const c of columns) {
    const span = yearSpans.get(c.year);
    if (span) span.end = c.x + c.width;
    else yearSpans.set(c.year, { start: c.x, end: c.x + c.width });
  }

  const marks: React.ReactNode[] = [];

  for (const [year, span] of yearSpans) {
    marks.push(
      <div
        key={`year-${year}`}
        className="absolute pointer-events-none select-none"
        style={{ left: span.start, top: axisY - 44, width: span.end - span.start }}
      >
        <div className="text-center text-[1.25em] font-bold text-slate-500 dark:text-slate-300 tracking-widest">
          {year}
        </div>
      </div>,
    );
    // Bracket under the year label spanning its months.
    marks.push(
      <div
        key={`ybar-${year}`}
        className="absolute pointer-events-none bg-slate-300/70 dark:bg-slate-600/70"
        style={{ left: span.start + 4, top: axisY - 14, width: Math.max(span.end - span.start - 8, 2), height: 2 }}
      />,
    );
    // Solid separator at the start of each year.
    marks.push(
      <div
        key={`ysep-${year}`}
        className="absolute pointer-events-none border-l border-slate-300 dark:border-slate-700"
        style={{ left: span.start, top: axisY - 14, height: axisBottom - axisY + 14 }}
      />,
    );
  }

  for (const c of columns) {
    const key = `${c.year}-${c.month}`;
    // An unsplit year is a single column already labelled by its year band,
    // so it gets no second label underneath.
    if (!c.split) continue;
    const label = c.month === 0 ? "—" : TIMELINE_MONTH_LABELS[c.month - 1];
    marks.push(
      <div
        key={`mon-${key}`}
        className="absolute pointer-events-none select-none"
        style={{ left: c.x, top: axisY + 6, width: Math.max(c.width, CARD_WIDTH) }}
        title={
          c.month === 0
            ? `${c.year} — publication month unknown`
            : `${c.year}-${TIMELINE_MONTH_LABELS[c.month - 1]}`
        }
      >
        <div
          className={
            c.month === 0
              ? "text-center text-[0.875em] font-medium text-slate-400/70 dark:text-slate-500/70"
              : "text-center text-[0.875em] font-semibold text-slate-500 dark:text-slate-400 tracking-wide"
          }
        >
          {label}
        </div>
      </div>,
    );
    // Dashed guide beneath a month that actually has releases.
    marks.push(
      <div
        key={`guide-${key}`}
        className="absolute pointer-events-none border-l border-dashed border-slate-200/70 dark:border-slate-800/70"
        style={{ left: c.x + CARD_WIDTH / 2, top: axisY + 24, height: axisBottom - axisY - 24 }}
      />,
    );
  }

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: 0,
        top: 0,
        width: TIMELINE_LEFT + totalWidth + CARD_WIDTH,
        height: axisBottom + 40,
        zIndex: 0,
      }}
    >
      {/* Horizontal axis line */}
      <div
        className="absolute"
        style={{
          left: TIMELINE_LEFT - 8,
          top: axisY,
          width: totalWidth + 16,
          height: 2,
          background: "rgba(100,116,139,0.45)",
        }}
      />
      {marks}
    </div>
  );
}

// Compact layered layout. The curated (x, y) coordinates in landscape.ts
// grew unwieldy as the catalogue passed ~90 models — the raw layout
// spans ~6 000 px horizontally with only six vertical rows, which forces
// the auto-fit to shrink to ~10 % on a desktop screen and the user has
// to pan a long horizontal strip just to scan one band.
//
// This routine repacks each curated band by:
//   1. Treating each unique x as a logical column so cards the curator
//      placed in the same vertical line (a small lineage / sibling
//      family) stay together.
//   2. Wrapping the columns into N-wide blocks so each band stops
//      growing horizontally and starts adding rows once it exceeds the
//      target width.
//   3. Stacking the wrapped blocks vertically with a small gap, so each
//      band reads as a multi-row rectangle instead of a single long
//      strip.
//
// The vertical sub-row offsets the curator chose (e.g. the deliberate
// extra gap between SchNet and PaiNN in the bottom band) are preserved
// inside each wrapped block, so the local rhythm survives the wrap. The
// output is in absolute render coordinates — already includes the
// LAYERED_SPACING_Y factor — so it can be consumed directly without
// extra scaling.
function computeCompactLayeredLayout(
  modelNodes: ModelNode[],
  groupNodes: GroupNode[],
  maxColumnsPerBlock: number,
): {
  positions: Record<string, Vec2>;
  groupBounds: Record<string, { x: number; y: number; width: number; height: number }>;
  topBandBoundary: number;
  zoneGapTop: number;
  zoneGapBot: number;
  rowGapY: number;
  graphWidth: number;
  graphHeight: number;
} {
  const COLUMN_W = LAYERED_COLUMN_GAP;     // matches the edge router's adjacent-column threshold
  const SIDE_PAD = 60;                      // left padding before column 0
  const TOP_PAD = 60;                       // top padding before band 0
  const BAND_GAP = 120;                     // vertical gap between bands
  const WRAPPED_BLOCK_GAP = 90;             // vertical gap between wrapped blocks within a band
  // Sub-row gap is the vertical pitch between two stacked sub-rows
  // inside one wrapped block. Has to clear CARD_HEIGHT (72) plus the
  // edge router's 48 px DETOUR so a same-row bow from the lower sub-row
  // doesn't slice through the card above. 122 leaves a small safety
  // margin without making the bottom band excessively tall.
  const SUB_ROW_GAP = 122;
  const ZONE_PAD_X = 28;
  const ZONE_PAD_Y_TOP = 36;
  const ZONE_PAD_Y_BOT = 28;

  const positions: Record<string, Vec2> = {};
  const groupBounds: Record<string, {
    x: number; y: number; width: number; height: number;
  }> = {};

  if (modelNodes.length === 0 || groupNodes.length === 0) {
    return {
      positions,
      groupBounds,
      topBandBoundary: 200 * LAYERED_SPACING_Y,
      zoneGapTop: 450 * LAYERED_SPACING_Y,
      zoneGapBot: 480 * LAYERED_SPACING_Y,
      rowGapY: 430 * LAYERED_SPACING_Y,
      graphWidth: CARD_WIDTH,
      graphHeight: CARD_HEIGHT,
    };
  }

  // Bands are sorted top-to-bottom by their curated y so the first one
  // ends up rendering at the top of the canvas.
  const sortedBands = [...groupNodes].sort((a, b) => a.y - b.y);

  // Match each model to a band: prefer the curated rectangle, fall
  // back to the closest band Y bracket so a card placed slightly
  // outside the official zone box still ends up grouped sensibly.
  const findBandIdx = (n: ModelNode): number => {
    for (let i = 0; i < sortedBands.length; i += 1) {
      const g = sortedBands[i];
      if (
        n.x + CARD_WIDTH > g.x &&
        n.x < g.x + g.width &&
        n.y + CARD_HEIGHT > g.y &&
        n.y < g.y + g.height
      ) {
        return i;
      }
    }
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < sortedBands.length; i += 1) {
      const g = sortedBands[i];
      const yMid = g.y + g.height / 2;
      const d = Math.abs(yMid - n.y);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  };

  const byBand: ModelNode[][] = sortedBands.map(() => []);
  for (const n of modelNodes) byBand[findBandIdx(n)].push(n);

  let cursorY = TOP_PAD;
  let topBandBoundary = TOP_PAD + 100;
  let zoneGapTop = TOP_PAD;
  let zoneGapBot = TOP_PAD;
  let maxRightX = SIDE_PAD;

  sortedBands.forEach((band, bandIdx) => {
    const cards = byBand[bandIdx];
    if (cards.length === 0) {
      groupBounds[band.id] = {
        x: SIDE_PAD - ZONE_PAD_X,
        y: cursorY - ZONE_PAD_Y_TOP,
        width: 0,
        height: 0,
      };
      return;
    }

    // Logical columns and sub-rows from the curator's coordinates.
    const uniqueX = Array.from(new Set(cards.map((c) => c.x))).sort((a, b) => a - b);
    const uniqueY = Array.from(new Set(cards.map((c) => c.y))).sort((a, b) => a - b);
    const colIdx = new Map<number, number>();
    uniqueX.forEach((x, i) => colIdx.set(x, i));
    const subRowIdx = new Map<number, number>();
    uniqueY.forEach((y, i) => subRowIdx.set(y, i));

    // Uniform sub-row gap inside a wrapped block. The curator's raw y
    // values used to encode different gaps (e.g. 100/100/150 px in the
    // bottom band), but at 90+ models that visual rhythm becomes a
    // height tax that flattens the auto-fit zoom. A single SUB_ROW_GAP
    // reads as a tidier grid and lets the wrap target a more square
    // overall aspect ratio.
    const subRowOffsets = uniqueY.map((_, i) => i * SUB_ROW_GAP);
    const wrappedBlockHeight = subRowOffsets[subRowOffsets.length - 1] + CARD_HEIGHT;

    const numCols = uniqueX.length;
    const colsPerBlockEffective = Math.min(numCols, maxColumnsPerBlock);

    let bandMaxY = cursorY;
    let bandMaxX = SIDE_PAD;
    for (const card of cards) {
      const ci = colIdx.get(card.x)!;
      const blockIdx = Math.floor(ci / maxColumnsPerBlock);
      const colInBlock = ci % maxColumnsPerBlock;
      const sri = subRowIdx.get(card.y)!;

      const x = SIDE_PAD + colInBlock * COLUMN_W;
      const y = cursorY + blockIdx * (wrappedBlockHeight + WRAPPED_BLOCK_GAP) + subRowOffsets[sri];
      positions[card.id] = { x, y };
      bandMaxY = Math.max(bandMaxY, y + CARD_HEIGHT);
      bandMaxX = Math.max(bandMaxX, x + CARD_WIDTH);
    }

    const bandTotalHeight = bandMaxY - cursorY;
    const bandTotalWidth = colsPerBlockEffective * COLUMN_W;

    if (bandIdx === 0) {
      // Threshold for "is this card in the topmost sub-row of any
      // wrapped block?" Used by the edge router to decide whether a
      // same-row bow can safely go above the card without clipping.
      const sub0Y = cursorY + subRowOffsets[0];
      const sub1Y = cursorY + (subRowOffsets[1] ?? subRowOffsets[0] + 100);
      topBandBoundary = (sub0Y + sub1Y) / 2;
      zoneGapTop = bandMaxY;
    }
    if (bandIdx === sortedBands.length - 1 && bandIdx > 0) {
      zoneGapBot = cursorY;
    }

    groupBounds[band.id] = {
      x: SIDE_PAD - ZONE_PAD_X,
      y: cursorY - ZONE_PAD_Y_TOP,
      width: bandTotalWidth + ZONE_PAD_X * 2,
      height: bandTotalHeight + ZONE_PAD_Y_TOP + ZONE_PAD_Y_BOT,
    };

    maxRightX = Math.max(maxRightX, bandMaxX);
    cursorY += bandTotalHeight + BAND_GAP;
  });

  const rowGapY = (zoneGapTop + zoneGapBot) / 2;
  // Final graph extents are the right edge of the rightmost card and the
  // bottom of the lowest band (cursorY was advanced by BAND_GAP after
  // every band; back that off so the height ends exactly at the last card).
  const graphWidth = maxRightX;
  const graphHeight = cursorY - BAND_GAP;

  return {
    positions,
    groupBounds,
    topBandBoundary,
    zoneGapTop,
    zoneGapBot,
    rowGapY,
    graphWidth,
    graphHeight,
  };
}

export default function MLIPExplorer() {
  const [nodes] = useState<AnyNode[]>(INITIAL_NODES);
  const [edges] = useState<Edge[]>(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState<ModelNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [filter, setFilter] = useState<FilterType>("All");
  // Multi-axis tag filters. Each axis is a Set of selected values; an axis
  // with no selections imposes no constraint. Filter logic ANDs across axes
  // and ORs within an axis. Models with `null`/absent value on an axis that
  // has selections do NOT match (treated as unknown rather than wildcard).
  const [tagFilters, setTagFilters] = useState<
    {
      equivariance: Set<Equivariance>;
      architecture: Set<Architecture>;
      trainedDatasets: Set<string>;
    } & Record<BoolAxisKey, Set<"yes" | "no">>
  >({
    equivariance: new Set(),
    architecture: new Set(),
    trainedDatasets: new Set(),
    usesAttention: new Set(),
    longRange: new Set(),
    hasFoundationVariant: new Set(),
    hasDenoisingPretraining: new Set(),
    hasMultipleHeads: new Set(),
    hasMultipleExperts: new Set(),
    hasUncertaintyEstimates: new Set(),
  });
  const [query, setQuery] = useState("");
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });
  // True once the real window has been measured after mount. Until then the
  // viewport above is only a server-side guess, so the canvas contents are
  // not rendered at all (see `canvasReady` below) — rendering them against
  // the guessed size and then re-fitting was the site's dominant source of
  // Cumulative Layout Shift.
  const [viewportReady, setViewportReady] = useState(false);
  const [baseScale, setBaseScale] = useState(0.8);
  const [userScale, setUserScale] = useState(1);
  const [userPan, setUserPan] = useState({ x: 0, y: 0 });
  const [filterOpen, setFilterOpen] = useState(true);
  const [fontScale, setFontScale] = useState<number>(DEFAULT_FONT_SCALE);
  const [citationCopied, setCitationCopied] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [layout, setLayout] = useState<LayoutMode>("timeline");
  // Phase 5 graph cleanup: connections and edge labels are OFF by default so
  // the landscape opens clean; selecting a model still reveals its own edges.
  const [edgeLabelsVisible, setEdgeLabelsVisible] = useState(false);
  // null = the visitor has never touched the toggle, so the sensible default
  // follows the layout. An explicit choice is remembered and always wins.
  const [connectionsPref, setConnectionsPref] = useState<boolean | null>(null);
  const showConnections = connectionsPref ?? layout === "timeline";
  const [showUnverifiedEdges, setShowUnverifiedEdges] = useState(false);
  const [hoveredEdgeIdx, setHoveredEdgeIdx] = useState<number | null>(null);
  const [forceOverrides, setForceOverrides] = useState<Record<string, Vec2>>({});
  const [viewCitationCopied, setViewCitationCopied] = useState(false);
  const CATEGORY_STYLES = CATEGORY_STYLES_DEFAULT;
  const CATEGORY_SWATCH = CATEGORY_SWATCH_DEFAULT;
  const BUCKET_STYLES = BUCKET_STYLES_DEFAULT;
  const BUCKET_SWATCH = BUCKET_SWATCH_DEFAULT;

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragPointerId, setDragPointerId] = useState<number | null>(null);
  // Canvas panning may start on top of a card or edge (so the user can grab
  // anywhere in the dense graph). We remember the press origin and whether the
  // pointer travelled far enough to count as a pan, so the trailing click can
  // be suppressed — otherwise every pan that ends on a card/edge would also
  // select it.
  const panPointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pannedRef = useRef(false);
  // What a canvas press landed on. We always capture the pointer for a smooth
  // pan (so it survives the cursor crossing the filter panel / header / window
  // edge), but capture retargets the trailing click off the card/edge — so a
  // press that turns out to be a tap is resolved into a selection in
  // handlePointerUp using this remembered target instead of the native click.
  const pressTargetRef = useRef<
    | { kind: "node"; id: string }
    | { kind: "edge"; from: string; to: string }
    | null
  >(null);

  // Two-finger pinch-zoom. We track every active pointer (mouse + touch)
  // in a ref so the move handler can detect when two fingers are down and
  // anchor the zoom on their midpoint — the same anchor logic the wheel
  // handler uses for trackpad pinch and cursor zoom.
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStateRef = useRef<{
    startDist: number;
    startUserScale: number;
    midGraphX: number;
    midGraphY: number;
  } | null>(null);
  const [isPinching, setIsPinching] = useState(false);

  // Per-node drag (force-directed layout only)
  const [nodeDragId, setNodeDragId] = useState<string | null>(null);
  const nodeDragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  // Tracks whether the user actually moved the node during the current
  // pointer interaction; used to suppress the synthetic click that React
  // fires after a drag so dragging doesn't accidentally open the sidebar.
  const nodeDragMovedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });

    handleResize();
    setViewportReady(true);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const deviceType: DeviceType = useMemo(() => {
    if (viewport.width < 640) return "mobile";
    if (viewport.width < 1024) return "tablet";
    return "desktop";
  }, [viewport.width]);

  useEffect(() => {
    setFilterOpen(deviceType !== "mobile");
  }, [deviceType]);

  // Load persisted font preference after mount to avoid SSR hydration mismatch.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(FONT_SCALE_STORAGE_KEY);
    const parsed = stored ? Number(stored) : NaN;
    if (FONT_SCALES.includes(parsed as (typeof FONT_SCALES)[number])) {
      setFontScale(parsed);
    }
  }, []);

  // Hydrate layout, edge-label visibility, and any saved drag overrides on
  // first mount. URL takes precedence over localStorage so a shared link
  // with ?layout=force always wins, but selections persist across reloads.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlLayout = params.get("layout");
    const stored = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (isLayoutMode(urlLayout)) {
      setLayout(urlLayout);
    } else if (isLayoutMode(stored)) {
      setLayout(stored);
    }
    const labels = window.localStorage.getItem(EDGE_LABELS_STORAGE_KEY);
    if (labels === "off") setEdgeLabelsVisible(false);
    if (labels === "on") setEdgeLabelsVisible(true);
    const connections = window.localStorage.getItem(SHOW_CONNECTIONS_STORAGE_KEY);
    if (connections === "on") setConnectionsPref(true);
    if (connections === "off") setConnectionsPref(false);
    const unverified = window.localStorage.getItem(UNVERIFIED_EDGES_STORAGE_KEY);
    if (unverified === "on") setShowUnverifiedEdges(true);
    if (unverified === "off") setShowUnverifiedEdges(false);
    try {
      const raw = window.localStorage.getItem(FORCE_OVERRIDES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, Vec2>;
        if (parsed && typeof parsed === "object") setForceOverrides(parsed);
      }
    } catch {
      // ignore corrupted persisted state
    }
  }, []);

  const updateLayout = (next: LayoutMode) => {
    setLayout(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, next);
    }
  };

  const updateEdgeLabelsVisible = (next: boolean) => {
    setEdgeLabelsVisible(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(EDGE_LABELS_STORAGE_KEY, next ? "on" : "off");
    }
  };

  const updateShowConnections = (next: boolean) => {
    setConnectionsPref(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SHOW_CONNECTIONS_STORAGE_KEY, next ? "on" : "off");
    }
  };

  const updateShowUnverifiedEdges = (next: boolean) => {
    setShowUnverifiedEdges(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(UNVERIFIED_EDGES_STORAGE_KEY, next ? "on" : "off");
    }
  };

  // Persist drag overrides whenever they change. Using an effect (rather
  // than calling localStorage from event handlers) sidesteps the stale-
  // closure problem with batched React state updates.
  const overridesHydratedRef = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!overridesHydratedRef.current) {
      overridesHydratedRef.current = true;
      return;
    }
    try {
      if (Object.keys(forceOverrides).length === 0) {
        window.localStorage.removeItem(FORCE_OVERRIDES_STORAGE_KEY);
      } else {
        window.localStorage.setItem(
          FORCE_OVERRIDES_STORAGE_KEY,
          JSON.stringify(forceOverrides),
        );
      }
    } catch {
      // localStorage may be disabled / full; the in-memory state still works.
    }
  }, [forceOverrides]);

  const resetForceLayout = () => {
    setForceOverrides({});
  };

  // Hydrate filter / search / selected-model state from URL on first mount so
  // links like /?category=Equivariant&q=mace or /?model=NequIP land in the
  // right view. Tracked with a ref so subsequent state changes can write back
  // to the URL without re-reading and clobbering user input.
  const urlInitialized = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (isCategoryFilter(cat)) setFilter(cat);
    const q = params.get("q");
    if (q) setQuery(q);
    const modelParam = params.get("model");
    if (modelParam) {
      const target = modelParam.toLowerCase();
      const match = INITIAL_NODES.find(
        (n) =>
          n.type === "node" &&
          (n.id.toLowerCase() === target ||
            n.label.toLowerCase() === target),
      );
      if (match && match.type === "node") setSelectedNode(match);
    }
    // Hydrate multi-axis tag filters: ?eq=constrained,learnt&arch=gnn&att=yes&long=no
    const eqParam = params.get("eq");
    const archParam = params.get("arch");
    const datasetParam = params.get("dataset");
    const boolParams = BOOL_FILTER_AXES.map((a) => params.get(a.param));
    if (eqParam || archParam || datasetParam || boolParams.some(Boolean)) {
      const splitToSet = <T extends string>(s: string | null, allowed: readonly T[]): Set<T> => {
        if (!s) return new Set<T>();
        const allowedSet = new Set(allowed as readonly string[]);
        return new Set(
          s.split(",").map((v) => v.trim()).filter((v) => allowedSet.has(v)) as T[],
        );
      };
      const next = {
        equivariance: splitToSet<Equivariance>(eqParam, EQUIVARIANCE_VALUES),
        architecture: splitToSet<Architecture>(archParam, ARCHITECTURE_VALUES),
        trainedDatasets: splitToSet<string>(datasetParam, FILTERABLE_DATASET_IDS),
        usesAttention: new Set<"yes" | "no">(),
        longRange: new Set<"yes" | "no">(),
        hasFoundationVariant: new Set<"yes" | "no">(),
        hasDenoisingPretraining: new Set<"yes" | "no">(),
        hasMultipleHeads: new Set<"yes" | "no">(),
        hasMultipleExperts: new Set<"yes" | "no">(),
        hasUncertaintyEstimates: new Set<"yes" | "no">(),
      };
      for (const a of BOOL_FILTER_AXES) {
        next[a.key] = splitToSet<"yes" | "no">(params.get(a.param), [
          "yes",
          "no",
        ] as const);
      }
      setTagFilters(next);
    }
    urlInitialized.current = true;
  }, []);

  // Reflect filter / query / selection back into the URL query string so the
  // current view is shareable. Uses replaceState to avoid polluting browser
  // history with every keystroke.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!urlInitialized.current) return;
    const params = new URLSearchParams(window.location.search);
    if (filter && filter !== "All") params.set("category", filter);
    else params.delete("category");
    const trimmed = query.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    if (selectedNode) params.set("model", selectedNode.id);
    else params.delete("model");
    if (layout !== "layered") params.set("layout", layout);
    else params.delete("layout");
    // Multi-axis tag filters round-trip as comma-separated lists.
    const setOrDelete = (key: string, set: Set<string>) => {
      if (set.size > 0) params.set(key, Array.from(set).sort().join(","));
      else params.delete(key);
    };
    setOrDelete("eq", tagFilters.equivariance as Set<string>);
    setOrDelete("arch", tagFilters.architecture as Set<string>);
    setOrDelete("dataset", tagFilters.trainedDatasets);
    for (const a of BOOL_FILTER_AXES) {
      setOrDelete(a.param, tagFilters[a.key] as Set<string>);
    }
    const next = params.toString();
    const url = `${window.location.pathname}${next ? `?${next}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", url);
  }, [filter, query, selectedNode, layout, tagFilters]);

  // Escape closes the detail panel.
  useEffect(() => {
    if (!selectedNode && !selectedEdge) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedNode(null);
        setSelectedEdge(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedNode, selectedEdge]);

  // Reset the "copied" indicator whenever the selected model changes.
  useEffect(() => {
    setCitationCopied(false);
    setShareLinkCopied(false);
  }, [selectedNode]);

  const updateFontScale = (next: number) => {
    setFontScale(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(next));
    }
  };

  const fontScaleIndex = FONT_SCALES.indexOf(fontScale as (typeof FONT_SCALES)[number]);
  const canShrinkFont = fontScaleIndex > 0;
  const canGrowFont = fontScaleIndex >= 0 && fontScaleIndex < FONT_SCALES.length - 1;

  // Stable force-directed positions, computed once per nodes/edges identity.
  // The O(N²·ticks) simulation used to run eagerly inside a useMemo on the
  // very first render — a multi-second main-thread block during hydration on
  // every page load, even though the default layered layout never reads it.
  // It now runs lazily the first time the user actually selects the force
  // layout, deferred behind a short timeout so the layout-button click paints
  // before the simulation starts, and the result is cached for the session.
  // User drags and the "Reset layout" button move things from there.
  const [forcePositions, setForcePositions] = useState<Record<
    string,
    Vec2
  > | null>(null);
  const forceCacheRef = useRef<{
    nodes: AnyNode[];
    edges: Edge[];
    positions: Record<string, Vec2>;
  } | null>(null);
  useEffect(() => {
    if (layout !== "force") return;
    const cached = forceCacheRef.current;
    if (cached && cached.nodes === nodes && cached.edges === edges) {
      setForcePositions(cached.positions);
      return;
    }
    const handle = window.setTimeout(() => {
      const modelItems = nodes.filter(
        (n): n is ModelNode => n.type === "node",
      );
      const positions = computeForcePositions(modelItems, edges);
      forceCacheRef.current = { nodes, edges, positions };
      setForcePositions(positions);
    }, 30);
    return () => window.clearTimeout(handle);
  }, [layout, nodes, edges]);

  // The canvas contents mount client-side only, once the real viewport is
  // known (and, in force layout, once positions exist). Server-rendering them
  // was actively harmful: the HTML assumed a 1200×800 window, so on real
  // devices every card's position changed right after hydration — a large
  // Cumulative Layout Shift on every visit — and the ~120 pre-rendered cards
  // added several hundred KB (twice: HTML + RSC payload) to the page.
  // Crawlers and assistive tech get the semantic model directory rendered by
  // src/app/page.tsx instead, so nothing is lost for SEO.
  const canvasReady =
    viewportReady && (layout !== "force" || forcePositions !== null);

  // Timeline ("Tree of Life") positions plus the year range — used by the
  // timeline-layout axis renderer to draw year ticks across the full span.
  const timelineLayout = useMemo(() => {
    const modelItems = nodes.filter(
      (n): n is ModelNode => n.type === "node",
    );
    // Phones get the vertical, newest-first timeline: four lanes side by
    // side simply do not fit a 390px screen, and a tall scroll is the native
    // shape of the device.
    const orientation: TimelineOrientation =
      deviceType === "mobile" ? "vertical" : "horizontal";
    const bandColumns = Math.max(
      2,
      Math.min(3, Math.floor(viewport.width / 200)),
    );
    return computeTimelinePositions(modelItems, orientation, bandColumns);
  }, [nodes, deviceType, viewport.width]);
  const timelinePositions = timelineLayout.positions;

  // How many models each facet option would match, over the whole catalogue
  // rather than the current selection. Labels the options, and — more
  // usefully — lets the panel drop facets nothing can match: "denoising
  // pretraining" is recorded on 0 of 128 models, so it only ever added a row
  // to a panel that is already too long.
  const facetCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    const bump = (axis: string, value: string) => {
      const byValue = (counts[axis] ??= {});
      byValue[value] = (byValue[value] ?? 0) + 1;
    };
    for (const n of nodes) {
      if (n.type !== "node") continue;
      const m = n as ModelNode;
      if (m.equivariance) bump("equivariance", m.equivariance);
      if (m.architecture) bump("architecture", m.architecture);
      for (const a of BOOL_FILTER_AXES) {
        const v = a.get(m);
        if (v === true) bump(a.key, "yes");
        else if (v === false) bump(a.key, "no");
      }
    }
    return counts;
  }, [nodes]);

  // How many columns each wrapped block in the layered layout should
  // hold before spilling onto the next row. Tuned to land the
  // auto-fitted graph close to the available canvas at a reasonable
  // zoom. Phase changes in the catalogue (top band 22 cols, bottom 13)
  // mean the height drops sharply at N=11 (top band → 2 wrapped blocks)
  // and N=7 (bottom band → 2 wrapped blocks); we honour those so wider
  // screens get a flatter, less-zoomed-out layout.
  const layeredColumnsPerBlock = useMemo(() => {
    const w = viewport.width;
    if (w >= 1500) return 11;
    if (w >= 1280) return 9;
    if (w >= 1024) return 7;
    if (w >= 768) return 6;
    if (w >= 480) return 5;
    return 4;
  }, [viewport.width]);

  // Compact layered layout — wraps each curated band into multiple
  // stacked blocks so the graph keeps a reasonable aspect ratio as the
  // catalogue grows. See the standalone helper above for the full
  // rationale; the memo just wires in the live viewport-derived wrap
  // width and the model + group node lists.
  const compactLayeredLayout = useMemo(() => {
    const modelItems = nodes.filter(
      (n): n is ModelNode => n.type === "node",
    );
    const groupItems = nodes.filter(
      (n): n is GroupNode => n.type === "group",
    );
    return computeCompactLayeredLayout(
      modelItems,
      groupItems,
      layeredColumnsPerBlock,
    );
  }, [nodes, layeredColumnsPerBlock]);

  // Resolves a model's effective (x, y) for the current layout. In force
  // mode any user-dragged overrides take precedence over the simulation
  // output; in layered mode we use the wrapped compact layout, falling
  // back to the curator's raw coordinates for any new entry the
  // compactor doesn't yet know about (defensive — shouldn't happen in
  // practice).
  const positionOf = useCallback(
    (node: ModelNode): { x: number; y: number } => {
      if (layout === "force") {
        const override = forceOverrides[node.id];
        if (override) return override;
        const fp = forcePositions?.[node.id];
        if (fp) return fp;
      }
      if (layout === "timeline") {
        const tp = timelinePositions[node.id];
        if (tp) return tp;
      }
      const compact = compactLayeredLayout.positions[node.id];
      if (compact) return compact;
      return {
        x: node.x * LAYERED_SPACING_X,
        y: node.y * LAYERED_SPACING_Y,
      };
    },
    [layout, forceOverrides, forcePositions, timelinePositions, compactLayeredLayout],
  );

  const positionedModels = useMemo(() => {
    return nodes
      .filter((n): n is ModelNode => n.type === "node")
      .map((n) => ({ ...n, ...positionOf(n) }));
  }, [nodes, positionOf]);

  // Zone boxes in the compact layered layout — the wrap routine emits
  // pre-computed bounds for each band (already padded to hug the cards
  // it placed) so we just hand those through. Zones are only shown in
  // the layered layout — force and timeline layouts hide them since the
  // cards no longer respect the lane partitioning there.
  const fittedGroups = useMemo(() => {
    if (layout !== "layered") return [];
    const groups = nodes.filter((n): n is GroupNode => n.type === "group");
    return groups
      .map((g) => {
        const bounds = compactLayeredLayout.groupBounds[g.id];
        if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
        return {
          ...g,
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        };
      })
      .filter((g): g is GroupNode => g !== null);
  }, [nodes, layout, compactLayeredLayout]);

  const bounds = useMemo(() => {
    if (positionedModels.length === 0) {
      return { minX: 0, minY: 0, maxX: CARD_WIDTH, maxY: CARD_HEIGHT };
    }

    let minX = Math.min(...positionedModels.map((n) => n.x));
    let minY = Math.min(...positionedModels.map((n) => n.y));
    let maxX = Math.max(...positionedModels.map((n) => n.x + CARD_WIDTH));
    let maxY = Math.max(...positionedModels.map((n) => n.y + CARD_HEIGHT));

    // Timeline layout draws an axis with year labels above the cards;
    // make sure the auto-fit + the SVG viewBox include that header area
    // so the year labels aren't clipped at the top of the canvas.
    if (layout === "timeline") {
      const vertical = timelineLayout.orientation === "vertical";
      minX = Math.min(minX, vertical ? 0 : 0);
      // Horizontal reserves the year/month axis band above the first lane;
      // vertical labels each band inline, so it only needs a small inset.
      minY = Math.min(minY, vertical ? 0 : TIMELINE_TOP - 20);
      maxY = maxY + 20;
    }

    return { minX, minY, maxX, maxY };
  }, [positionedModels, layout, timelineLayout.orientation]);

  const graphWidth = bounds.maxX - bounds.minX;
  const graphHeight = bounds.maxY - bounds.minY;

  const sidebarSpace = deviceType === "desktop" ? SIDEBAR_WIDTH : deviceType === "tablet" ? TABLET_SIDEBAR_WIDTH : 0;
  // The right detail sidebar is hidden until a model/edge is selected, so the
  // initial fit + centering should treat the entire viewport as canvas. The
  // auto-pan effect below shifts the view when the sidebar opens. Subtracting
  // the sidebar width up front used to leave the graph crammed into a narrow
  // left band with empty space to its right.
  const availableWidth = Math.max(viewport.width - 32, 320);
  const availableWidthWithSidebar = Math.max(viewport.width - sidebarSpace - 32, 320);
  const availableHeight = Math.max(viewport.height - HEADER_HEIGHT, 320);

  // The vertical timeline is deliberately taller than any screen — it is a
  // scrolling feed, not a diagram to take in at once. Fitting its height would
  // shrink the cards to nothing, so it fits width only and the reader scrolls.
  const fitsWidthOnly = layout === "timeline" && timelineLayout.orientation === "vertical";

  useEffect(() => {
    const widthScale = availableWidth / (graphWidth + CANVAS_PADDING * 2);
    const heightScale = availableHeight / (graphHeight + CANVAS_PADDING * 2);
    const fitScale = fitsWidthOnly ? widthScale : Math.min(widthScale, heightScale);
    const nextBase = Math.max(MIN_BASE_SCALE, Math.min(MAX_BASE_SCALE, fitScale));
    setBaseScale(nextBase);
    // Switching layouts changes graphWidth/graphHeight, which fires this
    // effect — reset both the user zoom and pan so each layout opens at
    // its centered auto-fit instead of inheriting the pan/zoom from the
    // previous layout.
    setUserScale(1);
    setUserPan({ x: 0, y: 0 });
  }, [availableHeight, availableWidth, graphHeight, graphWidth, fitsWidthOnly]);

  const basePan = useMemo(() => {
    const paddedWidth = graphWidth + CANVAS_PADDING * 2;
    const paddedHeight = graphHeight + CANVAS_PADDING * 2;
    const graphPixelWidth = paddedWidth * baseScale;
    const graphPixelHeight = paddedHeight * baseScale;

    const centerX = (availableWidth - graphPixelWidth) / 2 - bounds.minX * baseScale + CANVAS_PADDING * baseScale;
    // Vertical timeline: pin to the top so the page opens on the newest
    // models. Centring a graph taller than the viewport would drop the reader
    // somewhere in the middle of the catalogue's history.
    const centerY = fitsWidthOnly
      ? -bounds.minY * baseScale + CANVAS_PADDING * baseScale
      : (availableHeight - graphPixelHeight) / 2 - bounds.minY * baseScale + CANVAS_PADDING * baseScale;

    return { x: centerX, y: centerY };
  }, [availableHeight, availableWidth, baseScale, bounds.minX, bounds.minY, graphHeight, graphWidth, fitsWidthOnly]);

  const effectiveScale = baseScale * userScale;
  const pan = { x: basePan.x + userPan.x, y: basePan.y + userPan.y };

  // Reset the pan when the user closes the detail sidebar (selectedNode goes
  // from a model to null). Kept in its own effect so it depends only on
  // `selectedNode` — otherwise it would also fire on every scale change and
  // undo the cursor-anchored zoom logic in the wheel handler.
  useEffect(() => {
    if (!selectedNode) {
      setUserPan({ x: 0, y: 0 });
    }
  }, [selectedNode]);

  // Auto-pan the canvas so the selected node sits in the visible (non-sidebar)
  // region. Skipped on mobile because the mobile detail drawer is a separate
  // full-height overlay rather than a right-side column. Centres on the
  // sidebar-adjusted width so the card doesn't end up under the detail panel.
  useEffect(() => {
    if (!selectedNode) return;
    if (deviceType === "mobile") return;

    const pos = positionOf(selectedNode);
    const nodeCenterGraphX = pos.x + CARD_WIDTH / 2;
    const nodeCenterGraphY = pos.y + CARD_HEIGHT / 2;
    const targetScreenX = availableWidthWithSidebar / 2;
    const targetScreenY = availableHeight / 2;
    const targetUserPanX = targetScreenX - basePan.x - nodeCenterGraphX * effectiveScale;
    const targetUserPanY = targetScreenY - basePan.y - nodeCenterGraphY * effectiveScale;
    setUserPan({ x: targetUserPanX, y: targetUserPanY });
  }, [selectedNode, deviceType, availableWidthWithSidebar, availableHeight, basePan.x, basePan.y, effectiveScale, positionOf]);

  // Clamp a userScale candidate so the resulting effective scale (baseScale
  // × userScale) stays inside the allowed display range. Used by both the
  // −/+ buttons and the wheel handler so the % readout always sits inside
  // [MIN_DISPLAY_SCALE, MAX_DISPLAY_SCALE], regardless of the auto-fit base.
  const clampUserScale = (value: number) => {
    if (baseScale <= 0) return value;
    const effective = baseScale * value;
    const clamped = Math.min(MAX_DISPLAY_SCALE, Math.max(MIN_DISPLAY_SCALE, effective));
    return clamped / baseScale;
  };
  // Step the effective (displayed) scale by `delta` and write the matching
  // userScale. Lets the buttons read like "−10%, +10%" no matter what the
  // baseScale auto-fit landed on.
  const stepEffectiveScale = (delta: number) => {
    const next = clampUserScale((effectiveScale + delta) / baseScale);
    setUserScale(next);
  };

  // Canvas panning + pinch-zoom via pointer events (mouse + touch).
  // Single pointer drives the original pan behaviour unchanged; a second
  // pointer (always touch in practice — mice can't multi-touch) switches
  // into pinch-zoom mode, anchoring the scale on the midpoint between the
  // two fingers and reading freshness-critical state from `wheelStateRef`
  // to dodge stale closures during the rapid event burst.
  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as Element;
    // A press that starts on a card or an edge can still pan: with the graph
    // this dense there's barely any empty space left to grab. We always pan
    // and capture the pointer (below) so the drag tracks the cursor even once
    // it crosses the filter panel, the header, or leaves the window. Capture
    // moves the trailing click off the card/edge, so we remember what was
    // pressed and resolve a tap into a selection in handlePointerUp. Force-
    // layout card drags never reach here — the card stops propagation in its
    // own pointerdown.
    const cardEl = target.closest(".node-card");
    const edgeEl = target.closest("[data-edge='true']");
    pressTargetRef.current = cardEl
      ? { kind: "node", id: cardEl.getAttribute("data-model-id") ?? "" }
      : edgeEl
        ? {
            kind: "edge",
            from: edgeEl.getAttribute("data-edge-from") ?? "",
            to: edgeEl.getAttribute("data-edge-to") ?? "",
          }
        : null;

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size >= 2) {
      // Two fingers down. Cancel any in-progress single-pointer pan and
      // initialise pinch state from the current view so the gesture feels
      // anchored to the spot between the two fingers.
      if (dragPointerId !== null) {
        try {
          e.currentTarget.releasePointerCapture(dragPointerId);
        } catch {
          // ignore — capture may already have been released
        }
      }
      setIsDragging(false);
      setDragPointerId(null);

      const pts = Array.from(pointersRef.current.values()).slice(0, 2);
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const rect = e.currentTarget.getBoundingClientRect();
      const midScreenX = (pts[0].x + pts[1].x) / 2 - rect.left;
      const midScreenY = (pts[0].y + pts[1].y) / 2 - rect.top;
      const state = wheelStateRef.current;
      const effective = state.baseScale * state.userScale;
      const midGraphX = effective > 0 ? (midScreenX - state.panX) / effective : 0;
      const midGraphY = effective > 0 ? (midScreenY - state.panY) / effective : 0;

      pinchStateRef.current = {
        startDist: Math.max(dist, 1),
        startUserScale: state.userScale,
        midGraphX,
        midGraphY,
      };
      setIsPinching(true);
      return;
    }

    setIsDragging(true);
    setDragPointerId(e.pointerId);
    setDragStart({ x: e.clientX - userPan.x, y: e.clientY - userPan.y });
    panPointerStartRef.current = { x: e.clientX, y: e.clientY };
    pannedRef.current = false;
    // Capture on every press (empty canvas, card, or edge) so the pan keeps
    // receiving pointermove/up even when the cursor leaves the canvas — over
    // the filter panel, the header, or outside the window. Without this a drag
    // that began on a card stalled the moment the cursor crossed onto the
    // panel. Tap-to-select is restored in handlePointerUp via pressTargetRef.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore — some browsers reject capture on synthetic pointers
    }
  };

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (pointersRef.current.size >= 2 && pinchStateRef.current) {
      const pts = Array.from(pointersRef.current.values()).slice(0, 2);
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const rect = e.currentTarget.getBoundingClientRect();
      const midScreenX = (pts[0].x + pts[1].x) / 2 - rect.left;
      const midScreenY = (pts[0].y + pts[1].y) / 2 - rect.top;
      const ratio = dist / pinchStateRef.current.startDist;
      const requestedUserScale = pinchStateRef.current.startUserScale * ratio;
      const state = wheelStateRef.current;
      const requestedEffective = state.baseScale * requestedUserScale;
      const clampedEffective = Math.min(
        MAX_DISPLAY_SCALE,
        Math.max(MIN_DISPLAY_SCALE, requestedEffective),
      );
      const nextUserScale =
        state.baseScale > 0 ? clampedEffective / state.baseScale : requestedUserScale;
      const nextEffective = state.baseScale * nextUserScale;
      const newPanX = midScreenX - pinchStateRef.current.midGraphX * nextEffective;
      const newPanY = midScreenY - pinchStateRef.current.midGraphY * nextEffective;
      setUserScale(nextUserScale);
      setUserPan({ x: newPanX - state.basePanX, y: newPanY - state.basePanY });
      return;
    }

    if (!isDragging || dragPointerId !== e.pointerId) return;
    if (!pannedRef.current) {
      const movedX = e.clientX - panPointerStartRef.current.x;
      const movedY = e.clientY - panPointerStartRef.current.y;
      if (Math.hypot(movedX, movedY) > PAN_CLICK_THRESHOLD) pannedRef.current = true;
    }
    setUserPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    pointersRef.current.delete(e.pointerId);

    if (pointersRef.current.size < 2) {
      pinchStateRef.current = null;
      if (isPinching) setIsPinching(false);
    }

    if (dragPointerId !== null) {
      try {
        e.currentTarget.releasePointerCapture(dragPointerId);
      } catch {
        // ignore
      }
    }

    // Resolve a tap (a press the canvas itself started that never crossed the
    // pan threshold) into a selection. The captured pointer's trailing click
    // lands on the canvas instead of the card/edge, so we select from the
    // remembered press target here. Force-layout node drags never set
    // dragPointerId (the card stops propagation), so this can't double-fire
    // with the card's own onClick selection.
    if (dragPointerId === e.pointerId && !pannedRef.current) {
      const pressed = pressTargetRef.current;
      if (pressed?.kind === "node") {
        const node = nodes.find(
          (n): n is ModelNode => n.type === "node" && n.id === pressed.id,
        );
        if (node) handleNodeClick(node);
      } else if (pressed?.kind === "edge") {
        const edge = edges.find(
          (ed) => ed.from === pressed.from && ed.to === pressed.to,
        );
        if (edge) handleEdgeClick(edge);
      }
    }

    pressTargetRef.current = null;
    pannedRef.current = false;
    setIsDragging(false);
    setDragPointerId(null);
  };

  // Mouse-wheel and trackpad pinch zoom centred on the cursor. React attaches
  // wheel listeners as passive by default, which would silently drop our
  // preventDefault and let the browser scroll the page instead — so we wire
  // it up via addEventListener with {passive: false}. The latest layout
  // metrics are read through a ref so the effect can stay mounted once.
  const wheelStateRef = useRef({
    baseScale,
    userScale,
    panX: pan.x,
    panY: pan.y,
    basePanX: basePan.x,
    basePanY: basePan.y,
  });
  useEffect(() => {
    wheelStateRef.current = {
      baseScale,
      userScale,
      panX: pan.x,
      panY: pan.y,
      basePanX: basePan.x,
      basePanY: basePan.y,
    };
  });
  // While the user is actively driving the canvas (wheel / pinch zoom), we
  // need the transform's CSS transition to be effectively instant —
  // otherwise rapid state updates queue up against the 500ms ease-out used
  // for programmatic moves (e.g. auto-pan to a selected node) and the canvas
  // visibly judders. Mirrors `isDragging` for panning; this covers wheel.
  const [isWheelZooming, setIsWheelZooming] = useState(false);
  const wheelIdleTimerRef = useRef<number | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      // Trackpad pinch gestures arrive as wheel events with ctrlKey set;
      // we want to zoom for both that and a regular scroll wheel.
      e.preventDefault();
      const state = wheelStateRef.current;
      const effective = state.baseScale * state.userScale;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      // Exponential mapping keeps zoom feel even across deltaModes (pixel
      // vs. line vs. page) and pinch gestures, which can swing wildly.
      const sensitivity = e.ctrlKey ? 0.01 : 0.0015;
      const factor = Math.exp(-e.deltaY * sensitivity);
      const requested = state.userScale * factor;
      const requestedEffective = state.baseScale * requested;
      const clampedEffective = Math.min(
        MAX_DISPLAY_SCALE,
        Math.max(MIN_DISPLAY_SCALE, requestedEffective),
      );
      const nextUserScale = state.baseScale > 0 ? clampedEffective / state.baseScale : requested;
      if (nextUserScale === state.userScale) return;
      const nextEffective = state.baseScale * nextUserScale;
      // Anchor the zoom on the cursor so the point under the mouse stays
      // put — much more intuitive than always zooming around the centre.
      const graphX = (mouseX - state.panX) / effective;
      const graphY = (mouseY - state.panY) / effective;
      const newPanX = mouseX - graphX * nextEffective;
      const newPanY = mouseY - graphY * nextEffective;
      setUserScale(nextUserScale);
      setUserPan({
        x: newPanX - state.basePanX,
        y: newPanY - state.basePanY,
      });
      // Mark the canvas as actively interacting so the wrapper's CSS
      // transition is suppressed for the duration of the zoom gesture.
      setIsWheelZooming(true);
      if (wheelIdleTimerRef.current !== null) {
        window.clearTimeout(wheelIdleTimerRef.current);
      }
      wheelIdleTimerRef.current = window.setTimeout(() => {
        setIsWheelZooming(false);
      }, 180);
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", onWheel);
      if (wheelIdleTimerRef.current !== null) {
        window.clearTimeout(wheelIdleTimerRef.current);
      }
    };
  }, []);

  // Filter + layering. Nodes that don't match the current category filter or
  // the free-text search query are dimmed rather than removed so the overall
  // landscape shape stays legible while the user narrows in.
  const processedNodes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchesQuery = (n: ModelNode) => {
      if (!q) return true;
      const haystack = [
        n.label,
        n.author,
        String(n.year),
        n.category,
        n.license ?? "",
        n.maintenance ?? "",
        ...(n.tags ?? []),
        ...(n.frameworks ?? []),
        ...(n.properties ?? []),
        ...(n.coverage ?? []),
        ...(n.useCases ?? []),
      ]
        .join(" • ")
        .toLowerCase();
      return haystack.includes(q);
    };

    const matchesTags = (n: ModelNode) => {
      if (tagFilters.equivariance.size > 0) {
        if (!n.equivariance || !tagFilters.equivariance.has(n.equivariance))
          return false;
      }
      if (tagFilters.architecture.size > 0) {
        if (!n.architecture || !tagFilters.architecture.has(n.architecture))
          return false;
      }
      for (const a of BOOL_FILTER_AXES) {
        const set = tagFilters[a.key];
        if (set.size === 0) continue;
        const val = a.get(n);
        // Only an explicit boolean matches; "unknown" / null / undefined are
        // excluded (never treated as false) when the axis is active.
        if (val !== true && val !== false) return false;
        if (!set.has(val ? "yes" : "no")) return false;
      }
      if (tagFilters.trainedDatasets.size > 0) {
        // Uses only the normalized `trainedDatasets`; models not yet normalized
        // (absent) are excluded rather than inferred from `trainingData`.
        const ds = n.trainedDatasets;
        if (!ds || !ds.some((id) => tagFilters.trainedDatasets.has(id)))
          return false;
      }
      return true;
    };

    const items = positionedModels.map((n) => {
      const dimmed =
        (filter !== "All" && n.category !== filter) ||
        !matchesQuery(n) ||
        !matchesTags(n);
      return { ...n, dimmed };
    });

    return { groups: fittedGroups, items };
  }, [fittedGroups, positionedModels, filter, query, tagFilters]);

  // Orthogonal edge router. Returns an SVG path string that:
  // - exits the source card from the side nearest the target
  // - enters the target card from the corresponding opposite side
  // - for long runs, detours above/below rows so the line never cuts
  //   through an unrelated card
  // Also returns a label anchor placed on a clear stretch of the path.
  const DETOUR = 48; // vertical detour distance for same-row skips
  const COL_DETOUR = 60; // horizontal detour distance for same-col skips
  const CORRIDOR_SPACING = 16; // spacing between parallel detour tracks
  const LATERAL_STAGGER = 12; // spacing between parallel vertical drops at a shared card edge

  // Precompute per-edge corridor offset + lateral stagger so parallel edges
  // don't pile up on the same detour line. Edges are grouped by (detour
  // corridor) and (source/target card edge); within each group they fan out
  // symmetrically and are ordered by span so short edges sit closest to the
  // row and long edges route furthest out.
  const edgeRouting = useMemo(() => {
    type Group = { key: string; idx: number; magnitude: number };
    const corridorGroups: Record<string, Group[]> = {};
    const sourceGroups: Record<string, Group[]> = {};
    const targetGroups: Record<string, Group[]> = {};

    const topBandBoundary = compactLayeredLayout.topBandBoundary;
    const zoneGapTop = compactLayeredLayout.zoneGapTop;
    const zoneGapBot = compactLayeredLayout.zoneGapBot;

    const classify = (
      from: ModelNode,
      to: ModelNode,
    ): { corridor: string | null; source: string | null; target: string | null; magnitude: number } => {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const sameRow = Math.abs(dy) < 20;
      const sameCol = Math.abs(dx) < 20;

      if (sameRow && Math.abs(dx) > LAYERED_COLUMN_GAP + CARD_WIDTH) {
        const bowAbove = from.y > topBandBoundary;
        return {
          corridor: `row-${bowAbove ? "up" : "down"}-${from.y}`,
          source: `${from.id}:${bowAbove ? "top" : "bot"}`,
          target: `${to.id}:${bowAbove ? "top" : "bot"}`,
          magnitude: Math.abs(dx),
        };
      }
      if (sameCol && Math.abs(dy) > LAYERED_SAME_COL_GAP) {
        return {
          corridor: `col-right-${from.x}`,
          source: `${from.id}:right`,
          target: `${to.id}:right`,
          magnitude: Math.abs(dy),
        };
      }
      if (!sameRow && !sameCol) {
        const goingDown = dy > 0;
        const crossZone = (from.y < zoneGapTop && to.y > zoneGapBot) || (from.y > zoneGapBot && to.y < zoneGapTop);
        return {
          corridor: crossZone ? `diag-zone-gap` : `diag-${from.y}-${to.y}`,
          source: `${from.id}:${goingDown ? "bot" : "top"}`,
          target: `${to.id}:${goingDown ? "top" : "bot"}`,
          magnitude: Math.abs(dx),
        };
      }
      return { corridor: null, source: null, target: null, magnitude: 0 };
    };

    edges.forEach((edge, idx) => {
      const from = positionedModels.find((n) => n.id === edge.from);
      const to = positionedModels.find((n) => n.id === edge.to);
      if (!from || !to) return;
      const { corridor, source, target, magnitude } = classify(from, to);
      const record = { key: "", idx, magnitude };
      if (corridor) {
        (corridorGroups[corridor] ||= []).push({ ...record, key: corridor });
      }
      if (source) {
        (sourceGroups[source] ||= []).push({ ...record, key: source });
      }
      if (target) {
        (targetGroups[target] ||= []).push({ ...record, key: target });
      }
    });

    const corridorOffset = new Map<number, number>();
    const sourceStagger = new Map<number, number>();
    const targetStagger = new Map<number, number>();

    Object.values(corridorGroups).forEach((group) => {
      group.sort((a, b) => a.magnitude - b.magnitude);
      group.forEach((g, i) => corridorOffset.set(g.idx, i * CORRIDOR_SPACING));
    });
    Object.values(sourceGroups).forEach((group) => {
      group.sort((a, b) => a.magnitude - b.magnitude);
      const count = group.length;
      group.forEach((g, i) => sourceStagger.set(g.idx, (i - (count - 1) / 2) * LATERAL_STAGGER));
    });
    Object.values(targetGroups).forEach((group) => {
      group.sort((a, b) => a.magnitude - b.magnitude);
      const count = group.length;
      group.forEach((g, i) => targetStagger.set(g.idx, (i - (count - 1) / 2) * LATERAL_STAGGER));
    });

    return { corridorOffset, sourceStagger, targetStagger };
  }, [edges, positionedModels, compactLayeredLayout]);

  const buildEdgePath = useCallback((
    fromNode: ModelNode,
    toNode: ModelNode,
    corridorOffset: number,
    sourceStagger: number,
    targetStagger: number,
  ) => {
    const fx = fromNode.x;
    const fy = fromNode.y;
    const tx = toNode.x;
    const ty = toNode.y;
    const fcx = fx + CARD_WIDTH / 2;
    const fcy = fy + CARD_HEIGHT / 2;
    const tcx = tx + CARD_WIDTH / 2;
    const tcy = ty + CARD_HEIGHT / 2;
    const dx = tcx - fcx;
    const dy = tcy - fcy;

    const sameRow = Math.abs(dy) < 20;
    const sameCol = Math.abs(dx) < 20;
    const topBandBoundary = compactLayeredLayout.topBandBoundary;
    const zoneGapTop = compactLayeredLayout.zoneGapTop;
    const zoneGapBot = compactLayeredLayout.zoneGapBot;
    const rowGapY = compactLayeredLayout.rowGapY;

    // Case 1: same row, adjacent columns -> straight horizontal side-to-side
    if (sameRow && Math.abs(dx) <= LAYERED_COLUMN_GAP + CARD_WIDTH) {
      const sx = dx > 0 ? fx + CARD_WIDTH : fx;
      const ex = dx > 0 ? tx : tx + CARD_WIDTH;
      return {
        path: `M ${sx} ${fcy} L ${ex} ${fcy}`,
        labelX: (sx + ex) / 2,
        labelY: fcy - 8,
      };
    }

    // Case 2: same row, skipping columns -> U-bow above the row (or below for top row)
    if (sameRow) {
      const bowAbove = fy > topBandBoundary;
      const bowY = bowAbove
        ? fy - DETOUR - corridorOffset
        : fy + CARD_HEIGHT + DETOUR + corridorOffset;
      const sy = bowAbove ? fy : fy + CARD_HEIGHT;
      const ey = bowAbove ? ty : ty + CARD_HEIGHT;
      const sxMid = fcx + sourceStagger;
      const exMid = tcx + targetStagger;
      return {
        path: `M ${sxMid} ${sy} L ${sxMid} ${bowY} L ${exMid} ${bowY} L ${exMid} ${ey}`,
        labelX: (sxMid + exMid) / 2,
        labelY: bowY - 6,
      };
    }

    // Case 3: same column, adjacent rows -> straight vertical
    if (sameCol && Math.abs(dy) <= LAYERED_SAME_COL_GAP) {
      const sy = dy > 0 ? fy + CARD_HEIGHT : fy;
      const ey = dy > 0 ? ty : ty + CARD_HEIGHT;
      return {
        path: `M ${fcx} ${sy} L ${fcx} ${ey}`,
        labelX: fcx + 10,
        labelY: (sy + ey) / 2,
      };
    }

    // Case 4: same column, skipping rows -> detour right
    if (sameCol) {
      const bowX = fx + CARD_WIDTH + COL_DETOUR + corridorOffset;
      const sx = fx + CARD_WIDTH;
      const ex = tx + CARD_WIDTH;
      const sy = fcy + sourceStagger;
      const ey = tcy + targetStagger;
      return {
        path: `M ${sx} ${sy} L ${bowX} ${sy} L ${bowX} ${ey} L ${ex} ${ey}`,
        labelX: bowX + 6,
        labelY: (sy + ey) / 2,
      };
    }

    // Case 5: diagonal -> L-shape through row-gap area.
    const goingDown = dy > 0;
    const sy = goingDown ? fy + CARD_HEIGHT : fy;
    const ey = goingDown ? ty : ty + CARD_HEIGHT;
    const crossZone = (fy < zoneGapTop && ty > zoneGapBot) || (fy > zoneGapBot && ty < zoneGapTop);
    const baseBendY = crossZone ? rowGapY : (sy + ey) / 2;
    const bendY = baseBendY + corridorOffset;
    const sxMid = fcx + sourceStagger;
    const exMid = tcx + targetStagger;
    return {
      path: `M ${sxMid} ${sy} L ${sxMid} ${bendY} L ${exMid} ${bendY} L ${exMid} ${ey}`,
      labelX: (sxMid + exMid) / 2,
      labelY: bendY - 6,
    };
  }, [compactLayeredLayout]);

  // Format the human-readable tooltip for an edge: "<from> → <to> · <label>"
  // when a label exists, falling back to just the endpoints. The trust tier is
  // always appended so screen readers and hover tooltips surface whether the
  // relationship is verified, probable, or speculative — even when on-graph
  // labels are switched off, hovering an edge reveals the relation this way.
  const formatEdgeTooltip = (edge: Edge) => {
    const fromLabel = positionedModels.find((n) => n.id === edge.from)?.label ?? edge.from;
    const toLabel = positionedModels.find((n) => n.id === edge.to)?.label ?? edge.to;
    const head = `${fromLabel} → ${toLabel}`;
    const body = edge.label ? ` · ${edge.label}` : "";
    const note = ` · ${EDGE_CONFIDENCE_LABELS[effectiveEdgeConfidence(edge)]}`;
    return `${head}${body}${note}`;
  };

  // Phase 5 graph cleanup — which edges are drawn at all:
  // - the clicked (selected) edge always stays visible;
  // - selecting a model reveals only that model's own connections ("relevant
  //   edges only"), any confidence, with unverified ones visually marked;
  // - otherwise nothing is drawn unless "Show connections" is on, and that
  //   global view includes only VERIFIED edges unless the explicit
  //   "Include unverified edges" toggle is also enabled.
  const visibleEdgeIdx = useMemo(() => {
    const visible = new Set<number>();
    edges.forEach((edge, idx) => {
      const isSelectedEdge =
        selectedEdge?.from === edge.from && selectedEdge?.to === edge.to;
      if (isSelectedEdge) {
        visible.add(idx);
        return;
      }
      if (selectedNode) {
        if (edge.from === selectedNode.id || edge.to === selectedNode.id) {
          visible.add(idx);
        }
        return;
      }
      if (!showConnections) return;
      if (
        effectiveEdgeConfidence(edge) === "verified" ||
        showUnverifiedEdges
      ) {
        visible.add(idx);
      }
    });
    return visible;
  }, [edges, selectedEdge, selectedNode, showConnections, showUnverifiedEdges]);

  // Resolve an edge's SVG path and label anchor for the active layout. Shared
  // by the renderer and the label de-overlap pass below so both agree on
  // exactly where each label sits.
  const computeEdgeGeometry = useCallback(
    (
      edge: Edge,
      idx: number,
    ): { path: string; labelX: number; labelY: number } | null => {
      let fromNode = positionedModels.find((n) => n.id === edge.from);
      let toNode = positionedModels.find((n) => n.id === edge.to);
      if (!fromNode || !toNode) return null;

      // On the timeline the x axis *is* time, so an arrow drawn right-to-left
      // contradicts the axis and reads as an error. Reverse those — but only
      // where reversing asserts nothing false: dashed links are peer/sibling
      // relations with no inherent direction, and two cards in the same year
      // are ordered arbitrarily within it (the "month unknown" bucket leads
      // the year, so a dated card can sit to the right of its own ancestor).
      // A solid edge between different years is a real lineage claim; if that
      // points backwards the data and the axis genuinely disagree, so it is
      // left visibly backwards instead of being silently flipped.
      if (
        layout === "timeline" &&
        toNode.x < fromNode.x &&
        (edge.dashed || fromNode.year === toNode.year)
      ) {
        const swap = fromNode;
        fromNode = toNode;
        toNode = swap;
      }

      if (layout === "force" || layout === "timeline") {
        // Connect edges to the actual card border (rectangle exit point)
        // instead of a circle around the centre — the cards are 176x72
        // so a circular radius leaves visible gaps along the long sides
        // and overshoots near the corners. Timeline reuses the same
        // straight-line edge style: with cards anchored to year columns
        // the curated layered router would cross many lanes unhelpfully.
        const fcx = fromNode.x + CARD_WIDTH / 2;
        const fcy = fromNode.y + CARD_HEIGHT / 2;
        const tcx = toNode.x + CARD_WIDTH / 2;
        const tcy = toNode.y + CARD_HEIGHT / 2;
        const dx = tcx - fcx;
        const dy = tcy - fcy;
        const margin = 6;
        const start = rectExitPoint(
          fcx,
          fcy,
          CARD_WIDTH / 2 + margin,
          CARD_HEIGHT / 2 + margin,
          dx,
          dy,
        );
        const end = rectExitPoint(
          tcx,
          tcy,
          CARD_WIDTH / 2 + margin,
          CARD_HEIGHT / 2 + margin,
          -dx,
          -dy,
        );
        return {
          path: `M ${start.x} ${start.y} L ${end.x} ${end.y}`,
          labelX: (start.x + end.x) / 2,
          labelY: (start.y + end.y) / 2 - 6,
        };
      }

      const corridorOffset = edgeRouting.corridorOffset.get(idx) ?? 0;
      const sourceStagger = edgeRouting.sourceStagger.get(idx) ?? 0;
      const targetStagger = edgeRouting.targetStagger.get(idx) ?? 0;
      return buildEdgePath(
        fromNode,
        toNode,
        corridorOffset,
        sourceStagger,
        targetStagger,
      );
    },
    [positionedModels, layout, edgeRouting, buildEdgePath],
  );

  // Edge labels are bold text drawn over the cards; with the full catalogue of
  // lineage links they pile into an unreadable wall on the zoomed-out default
  // layout. Place them greedily in priority order — the selected edge first,
  // then solid "primary lineage" links, then dashed "speculative" ones — and
  // skip any whose box would overlap an already-placed label. Boxes live in
  // graph space, so a label that survives stays collision-free at every zoom
  // level; hidden ones remain reachable through the edge's click target and
  // tooltip.
  const edgeLabelLayout = useMemo(() => {
    const geometries = new Map<
      number,
      { path: string; labelX: number; labelY: number }
    >();
    type LabelBox = {
      idx: number;
      x: number;
      y: number;
      w: number;
      h: number;
      priority: number;
    };
    const boxes: LabelBox[] = [];

    const labelFontSize = 18 * fontScale;
    // Bias the width estimate slightly above the 0.58-em used for the halo
    // rect: bold glyphs (m, w, capitals) render wider, and undersized boxes
    // let neighbours pass the overlap test and then touch on screen.
    const approxCharW = labelFontSize * 0.62;
    const padX = 6;
    const padY = 3;

    edges.forEach((edge, idx) => {
      // Hidden edges neither render nor claim label space — otherwise an
      // invisible edge's label box could cull a visible neighbour's label.
      if (!visibleEdgeIdx.has(idx)) return;
      const geometry = computeEdgeGeometry(edge, idx);
      if (!geometry) return;
      geometries.set(idx, geometry);
      if (!edge.label) return;
      const selected =
        selectedEdge?.from === edge.from && selectedEdge?.to === edge.to;
      const hovered = hoveredEdgeIdx === idx;
      const w = edge.label.length * approxCharW + padX * 2;
      const h = labelFontSize + padY * 2;
      boxes.push({
        idx,
        x: geometry.labelX - w / 2,
        y: geometry.labelY - labelFontSize + padY,
        w,
        h,
        priority: selected || hovered ? 0 : edge.dashed ? 2 : 1,
      });
    });

    boxes.sort((a, b) => a.priority - b.priority || a.idx - b.idx);

    const GAP = 8;
    const kept: LabelBox[] = [];
    const visible = new Set<number>();
    for (const box of boxes) {
      const overlaps = kept.some(
        (k) =>
          box.x < k.x + k.w + GAP &&
          k.x < box.x + box.w + GAP &&
          box.y < k.y + k.h + GAP &&
          k.y < box.y + box.h + GAP,
      );
      if (overlaps) continue;
      kept.push(box);
      visible.add(box.idx);
    }

    return { geometries, visible };
  }, [edges, computeEdgeGeometry, fontScale, selectedEdge, visibleEdgeIdx, hoveredEdgeIdx]);

  const renderEdges = (mode: "lines" | "labels" | "hit" = "lines") =>
    edges.map((edge, idx) => {
      if (!visibleEdgeIdx.has(idx)) return null;
      const geometry = edgeLabelLayout.geometries.get(idx);
      if (!geometry) return null;
      const { path, labelX, labelY } = geometry;

      const tooltip = formatEdgeTooltip(edge);
      const confidence = effectiveEdgeConfidence(edge);
      const isSelected =
        selectedEdge?.from === edge.from && selectedEdge?.to === edge.to;
      const isHovered = hoveredEdgeIdx === idx;
      const baseStrokeWidth = isSelected
        ? (edge.dashed ? 3.5 : 4)
        : isHovered
          ? (edge.dashed ? 3 : 3.25)
          : edge.dashed ? 2 : deviceType === "mobile" ? 3 : 2.25;

      // Three render modes, each on a dedicated SVG layer so we can stack
      // them around the card layer:
      // - "hit": wide transparent hit-target. Below cards (zIndex 5) so it
      //   stays clickable in empty space but defers to cards on overlap.
      // - "lines": halo + coloured stroke + arrow marker. Below cards
      //   (zIndex 4) so an edge that visually crosses an unrelated card is
      //   masked by that card — otherwise the line looked like A↔B↔C even
      //   when only A→C was wired.
      // - "labels": text labels with a halo + background rect. Above cards
      //   (zIndex 12) so the words stay readable even when the edge happens
      //   to fold its midpoint over a card.
      if (mode === "hit") {
        return (
          <g
            key={idx}
            data-edge="true"
            data-edge-from={edge.from}
            data-edge-to={edge.to}
            className="cursor-pointer"
            aria-label={tooltip}
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              if (pannedRef.current) {
                // Trailing click from a canvas pan that started on this edge.
                pannedRef.current = false;
                return;
              }
              handleEdgeClick(edge);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleEdgeClick(edge);
              }
            }}
            onMouseEnter={() => setHoveredEdgeIdx(idx)}
            onMouseLeave={() =>
              setHoveredEdgeIdx((cur) => (cur === idx ? null : cur))
            }
            onFocus={() => setHoveredEdgeIdx(idx)}
            onBlur={() =>
              setHoveredEdgeIdx((cur) => (cur === idx ? null : cur))
            }
          >
            <title>{tooltip}</title>
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth={20}
              style={{ pointerEvents: "stroke" }}
            />
          </g>
        );
      }

      if (mode === "labels") {
        if (!edge.label) return null;
        // Even with global edge labels off, the hovered or selected edge's
        // relation label is shown so users can always discover what a line
        // means without flooding the canvas.
        if (!edgeLabelsVisible && !isSelected && !isHovered) return null;
        if (!edgeLabelLayout.visible.has(idx)) return null;
        // Approximate the rendered text width so we can draw a background
        // rect that masks whatever card the label overlaps. SVG <text> has
        // no synchronous width API, but bold sans-serif at fontSize ≈ 0.55em
        // per character is close enough for the short edge labels we have.
        const labelFontSize = 18 * fontScale;
        const approxCharW = labelFontSize * 0.58;
        const padX = 6;
        const padY = 3;
        const rectW = edge.label.length * approxCharW + padX * 2;
        const rectH = labelFontSize + padY * 2;
        const rectX = labelX - rectW / 2;
        const rectY = labelY - labelFontSize + padY;
        return (
          <g
            key={idx}
            className="transition-opacity duration-500"
            style={{ pointerEvents: "none" }}
            aria-hidden="true"
          >
            <rect
              x={rectX}
              y={rectY}
              width={rectW}
              height={rectH}
              rx={4}
              ry={4}
              fill="var(--edge-halo)"
              opacity={0.92}
            />
            <text
              x={labelX}
              y={labelY}
              style={{ fill: "var(--edge-label)" }}
              fontSize={labelFontSize}
              fontWeight={700}
              textAnchor="middle"
            >
              {edge.label}
            </text>
          </g>
        );
      }

      return (
        <g
          key={idx}
          className="transition-opacity duration-500"
          style={{ pointerEvents: "none" }}
          aria-hidden="true"
        >
          <path
            d={path}
            fill="none"
            stroke="var(--edge-halo)"
            strokeWidth={baseStrokeWidth + 4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={path}
            fill="none"
            style={{ stroke: "var(--edge-stroke)" }}
            strokeWidth={baseStrokeWidth}
            strokeDasharray={edge.dashed ? "6,4" : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={
              // Unverified edges are visibly faded (plus dashed when
              // speculative) so they are never mistaken for verified ones.
              isSelected || isHovered
                ? "opacity-100"
                : confidence === "verified"
                  ? "opacity-90"
                  : confidence === "probable"
                    ? "opacity-70"
                    : "opacity-50"
            }
            markerEnd="url(#edge-arrow)"
          />
        </g>
      );
    });


  // Build a flat suggestion list for the search box. Auto-suggestions span
  // model names, tags, licenses, frameworks, years, and coverage / domains so
  // typing "ASE" surfaces the framework facet, "MIT" surfaces the license,
  // "battery" surfaces a coverage facet, and so on.
  const [searchFocused, setSearchFocused] = useState(false);
  const modelItems = useMemo(
    () => nodes.filter((n): n is ModelNode => n.type === "node"),
    [nodes],
  );
  const facetIndex = useMemo(() => {
    const tag = new Set<string>();
    const license = new Set<string>();
    const framework = new Set<string>();
    const property = new Set<string>();
    const coverage = new Set<string>();
    const year = new Set<string>();
    for (const m of modelItems) {
      year.add(String(m.year));
      if (m.license) license.add(m.license);
      (m.tags ?? []).forEach((t) => tag.add(t));
      (m.frameworks ?? []).forEach((t) => framework.add(t));
      (m.properties ?? []).forEach((t) => property.add(t));
      (m.coverage ?? []).forEach((t) => coverage.add(t));
    }
    return { tag, license, framework, property, coverage, year };
  }, [modelItems]);

  type Suggestion =
    | { kind: "model"; label: string; sublabel: string; value: string; modelId: string }
    | { kind: "facet"; label: string; sublabel: string; value: string };

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: Suggestion[] = [];

    for (const m of modelItems) {
      if (
        m.label.toLowerCase().includes(q) ||
        m.author.toLowerCase().includes(q)
      ) {
        out.push({
          kind: "model",
          label: m.label,
          sublabel: `${m.category} · ${m.year}`,
          value: m.label,
          modelId: m.id,
        });
        if (out.length >= 6) break;
      }
    }

    const pushFacet = (
      set: Set<string>,
      type: string,
      cap: number,
    ) => {
      let added = 0;
      for (const v of set) {
        if (added >= cap) break;
        if (v.toLowerCase().includes(q)) {
          out.push({ kind: "facet", label: v, sublabel: type, value: v });
          added += 1;
        }
      }
    };
    pushFacet(facetIndex.tag, "tag", 4);
    pushFacet(facetIndex.framework, "framework", 3);
    pushFacet(facetIndex.license, "license", 3);
    pushFacet(facetIndex.coverage, "domain", 3);
    pushFacet(facetIndex.property, "property", 2);
    pushFacet(facetIndex.year, "year", 2);

    return out.slice(0, 12);
  }, [query, modelItems, facetIndex]);

  const handleNodeClick = (node: ModelNode) => {
    // Look up the original (unmodified) entry by id so the stored selection
    // doesn't carry a layout-specific x/y override; positionOf() always
    // resolves coordinates lazily from the current layout.
    const original = nodes.find(
      (n): n is ModelNode => n.type === "node" && n.id === node.id,
    );
    setSelectedEdge(null);
    setSelectedNode(original ?? node);
  };

  const handleEdgeClick = (edge: Edge) => {
    setSelectedNode(null);
    setSelectedEdge(edge);
  };

  const closeDetails = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  // Spatial arrow-key navigation between visible nodes. Picks the visible
  // (non-dimmed) node whose center is closest to the current node along the
  // requested cardinal direction, breaking ties by perpendicular distance.
  const focusAdjacentNode = (
    fromId: string,
    direction: "up" | "down" | "left" | "right",
  ) => {
    const visible = processedNodes.items.filter((n) => !n.dimmed);
    const current = visible.find((n) => n.id === fromId);
    if (!current) return;

    const currentPos = current;
    const cx = currentPos.x + CARD_WIDTH / 2;
    const cy = currentPos.y + CARD_HEIGHT / 2;

    let best: { node: ModelNode; score: number } | null = null;
    for (const candidate of visible) {
      if (candidate.id === current.id) continue;
      const ox = candidate.x + CARD_WIDTH / 2;
      const oy = candidate.y + CARD_HEIGHT / 2;
      const dx = ox - cx;
      const dy = oy - cy;

      const inDirection =
        (direction === "right" && dx > 0 && Math.abs(dx) >= Math.abs(dy)) ||
        (direction === "left" && dx < 0 && Math.abs(dx) >= Math.abs(dy)) ||
        (direction === "down" && dy > 0 && Math.abs(dy) >= Math.abs(dx)) ||
        (direction === "up" && dy < 0 && Math.abs(dy) >= Math.abs(dx));
      if (!inDirection) continue;

      const primary = direction === "left" || direction === "right" ? Math.abs(dx) : Math.abs(dy);
      const perpendicular = direction === "left" || direction === "right" ? Math.abs(dy) : Math.abs(dx);
      const score = primary + perpendicular * 1.5;
      if (!best || score < best.score) best = { node: candidate, score };
    }

    if (best) {
      const target = nodeRefs.current.get(best.node.id);
      target?.focus();
    }
  };

  const handleNodeKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    node: ModelNode,
  ) => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        focusAdjacentNode(node.id, "up");
        return;
      case "ArrowDown":
        e.preventDefault();
        focusAdjacentNode(node.id, "down");
        return;
      case "ArrowLeft":
        e.preventDefault();
        focusAdjacentNode(node.id, "left");
        return;
      case "ArrowRight":
        e.preventDefault();
        focusAdjacentNode(node.id, "right");
        return;
      default:
        return;
    }
  };

  const searchUrl = selectedNode
    ? `https://www.google.com/search?q=${encodeURIComponent(
        `${selectedNode.label} machine learning interatomic potential`,
      )}`
    : "#";

  // A short BibTeX-style snippet that cites the MLIP Hub entry for the
  // currently selected model. Intended as a starting point — users should
  // also cite the original model paper via paperUrl.
  const buildCitation = (node: ModelNode) => {
    const citeKey = `mliphub_${node.id}`;
    const howpublished = node.paperUrl
      ? `\\url{${node.paperUrl}}`
      : node.githubUrl
        ? `\\url{${node.githubUrl}}`
        : "\\url{https://www.mliphub.com}";
    return `@misc{${citeKey},
  title        = {{${node.label}}},
  author       = {${node.author}},
  year         = {${node.year}},
  howpublished = {${howpublished}},
  note         = {MLIP Hub entry: https://www.mliphub.com}
}`;
  };

  const copyCitation = async (node: ModelNode) => {
    const text = buildCitation(node);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCitationCopied(true);
        window.setTimeout(() => setCitationCopied(false), 2000);
      }
    } catch {
      // Silently ignore — the user can still copy the BibTeX from the /cite page.
    }
  };

  const buildShareUrl = (node: ModelNode) => {
    if (typeof window === "undefined") return `https://www.mliphub.com/?model=${node.id}`;
    const url = new URL(window.location.href);
    url.searchParams.set("model", node.id);
    return url.toString();
  };

  // Builds a citation snippet that captures the *current view* — selected
  // model (if any), filter, search query, and layout. Useful for sharing
  // a specific configuration of the landscape in a paper, slide, or report.
  const buildViewCitation = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : "https://www.mliphub.com";
    const parts: string[] = [];
    if (filter !== "All") parts.push(`category=${filter}`);
    const trimmed = query.trim();
    if (trimmed) parts.push(`search="${trimmed}"`);
    parts.push(`layout=${layout}`);
    if (selectedNode) parts.push(`selected=${selectedNode.label}`);
    if (tagFilters.equivariance.size)
      parts.push(`equivariance=${Array.from(tagFilters.equivariance).sort().join(",")}`);
    if (tagFilters.architecture.size)
      parts.push(`architecture=${Array.from(tagFilters.architecture).sort().join(",")}`);
    if (tagFilters.trainedDatasets.size)
      parts.push(`dataset=${Array.from(tagFilters.trainedDatasets).sort().join(",")}`);
    for (const a of BOOL_FILTER_AXES) {
      const set = tagFilters[a.key];
      if (set.size)
        parts.push(`${a.param}=${Array.from(set).sort().join(",")}`);
    }
    const note = parts.join("; ");
    return `MLIP Hub. (${now.getFullYear()}). MLIP landscape, view: ${note}. Retrieved ${dateStr}, from ${url}`;
  };

  const copyViewCitation = async () => {
    const text = buildViewCitation();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setViewCitationCopied(true);
        window.setTimeout(() => setViewCitationCopied(false), 2000);
      }
    } catch {
      // Best-effort — we don't fall back to a textarea trick here.
    }
  };

  const copyShareLink = async (node: ModelNode) => {
    const text = buildShareUrl(node);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setShareLinkCopied(true);
        window.setTimeout(() => setShareLinkCopied(false), 2000);
      }
    } catch {
      // Best-effort. Browsers without clipboard access can copy from the URL bar.
    }
  };

  const reportIssueBody = (node: ModelNode) =>
    `Model: ${node.label} (id: ${node.id})
Category: ${node.category}
Year: ${node.year}
Authors: ${node.author}

Describe the issue (broken link, outdated description, missing metadata, incorrect lineage, etc.):
`;

  const reportIssueMailto = (node: ModelNode) =>
    `mailto:support@mliphub.com?subject=${encodeURIComponent(
      `[model] ${node.label}: correction`,
    )}&body=${encodeURIComponent(reportIssueBody(node))}`;

  const reportIssueUrl = (node: ModelNode) => {
    const title = `[model] ${node.label}: `;
    const body = reportIssueBody(node);
    const params = new URLSearchParams({
      title,
      body,
      labels: "data,model-card",
    });
    return `${GITHUB_REPO}/issues/new?${params.toString()}`;
  };

  // The SVG that holds the edges sits at (0, 0) inside the transformed
  // canvas. Force-directed layout produces nodes at negative coordinates,
  // and the parent <div> happily renders them because HTML elements aren't
  // clipped — but the SVG would be, since by default svg children are
  // clipped to the svg's width/height box. We extend the box to cover the
  // negative range and set its origin to the most-negative bound so paths
  // with negative absolute coordinates still render.
  const svgOriginX = Math.min(0, bounds.minX - CANVAS_PADDING);
  const svgOriginY = Math.min(0, bounds.minY - CANVAS_PADDING);
  const svgWidth = Math.max(
    graphWidth + CANVAS_PADDING * 4,
    bounds.maxX - svgOriginX + CANVAS_PADDING,
    1400,
  );
  const svgHeight = Math.max(
    graphHeight + CANVAS_PADDING * 4,
    bounds.maxY - svgOriginY + CANVAS_PADDING,
    1100,
  );

  const renderEdgeDetailContent = () => {
    if (!selectedEdge) return null;
    const fromNode = modelItems.find((n) => n.id === selectedEdge.from);
    const toNode = modelItems.find((n) => n.id === selectedEdge.to);

    return (
      <>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <span className="inline-block uppercase tracking-widest font-bold text-[0.75em] sm:text-[0.6875em] text-slate-400 dark:text-slate-500 mb-1">
              Connection ·{" "}
              {EDGE_CONFIDENCE_LABELS[effectiveEdgeConfidence(selectedEdge)]}
            </span>
            <h2 className="text-[1.25em] md:text-[1.5em] font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {fromNode?.label ?? selectedEdge.from}
              <span className="mx-2 text-slate-400 dark:text-slate-500">→</span>
              {toNode?.label ?? selectedEdge.to}
            </h2>
          </div>
          <button
            onClick={closeDetails}
            aria-label="Close connection details"
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {selectedEdge.label && (
          <div>
            <div className="uppercase tracking-widest font-bold text-[0.6875em] text-slate-400 dark:text-slate-500 mb-1">
              Relationship
            </div>
            <div className="text-[0.95em] font-semibold text-slate-700 dark:text-slate-200">
              {selectedEdge.label}
            </div>
          </div>
        )}

        {selectedEdge.description ? (
          <div>
            <div className="uppercase tracking-widest font-bold text-[0.6875em] text-slate-400 dark:text-slate-500 mb-1">
              Explanation
            </div>
            <p className="text-[0.875em] md:text-[1em] text-slate-700 dark:text-slate-200 leading-relaxed">
              {selectedEdge.description}
            </p>
          </div>
        ) : (
          <p className="text-[0.8125em] italic text-slate-500 dark:text-slate-400 leading-relaxed">
            No long-form explanation yet — see the endpoint descriptions below
            for context. Curators: add a <code>description</code> field on this
            edge in <code>landscape.ts</code> to fill this in.
          </p>
        )}

        <div>
          <div className="uppercase tracking-widest font-bold text-[0.6875em] text-slate-400 dark:text-slate-500 mb-1">
            Verification
          </div>
          {effectiveEdgeConfidence(selectedEdge) === "verified" ? (
            <p className="text-[0.8125em] text-slate-600 dark:text-slate-300 leading-snug">
              This relationship was checked against a source
              {selectedEdge.edgeSource && (
                <>
                  {": "}
                  <a
                    href={selectedEdge.edgeSource}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {selectedEdge.edgeSource}
                  </a>
                </>
              )}
              .
            </p>
          ) : (
            <p className="text-[0.8125em] text-slate-600 dark:text-slate-300 leading-snug">
              This relationship is{" "}
              <strong>
                {EDGE_CONFIDENCE_LABELS[effectiveEdgeConfidence(selectedEdge)]}
              </strong>{" "}
              — curated but not yet checked against a source. Treat it as
              provisional.
            </p>
          )}
          {selectedEdge.edgeNotes && (
            <p className="mt-1 text-[0.75em] text-slate-500 dark:text-slate-400 leading-snug">
              {selectedEdge.edgeNotes}
            </p>
          )}
        </div>

        {fromNode && (
          <button
            type="button"
            onClick={() => handleNodeClick(fromNode)}
            className="text-left w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="uppercase tracking-widest font-bold text-[0.625em] text-slate-400 dark:text-slate-500">
                From · {fromNode.category}
              </span>
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">
              {fromNode.label}{" "}
              <span className="text-[0.75em] font-normal text-slate-500 dark:text-slate-400">
                ({fromNode.year})
              </span>
            </div>
            <p className="text-[0.8125em] text-slate-600 dark:text-slate-300 leading-snug line-clamp-3">
              {fromNode.desc}
            </p>
          </button>
        )}

        {toNode && (
          <button
            type="button"
            onClick={() => handleNodeClick(toNode)}
            className="text-left w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="uppercase tracking-widest font-bold text-[0.625em] text-slate-400 dark:text-slate-500">
                To · {toNode.category}
              </span>
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">
              {toNode.label}{" "}
              <span className="text-[0.75em] font-normal text-slate-500 dark:text-slate-400">
                ({toNode.year})
              </span>
            </div>
            <p className="text-[0.8125em] text-slate-600 dark:text-slate-300 leading-snug line-clamp-3">
              {toNode.desc}
            </p>
          </button>
        )}
      </>
    );
  };

  const renderDetailContent = (compact = false) => {
    if (!selectedNode) return null;

    const titleClass = compact
      ? "text-[1.25em] md:text-[1.5em] font-bold text-slate-900 dark:text-slate-100 leading-snug"
      : "text-[1.5em] md:text-[1.875em] font-bold text-slate-900 dark:text-slate-100 leading-tight";
    const labelText = compact ? "text-[0.75em]" : "text-[0.75em] sm:text-[0.6875em]";
    const bodyText = compact ? "text-[0.875em]" : "text-[0.875em] md:text-[1em]";
    const spacing = compact ? "space-y-2" : "space-y-3";

    return (
      <>
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${labelText} font-bold uppercase tracking-wide border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {selectedNode.category}
              </div>
              {selectedNode.entityType && (
                <span
                  title="Whether this entry is an architecture, a trained model instance, or a model family"
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.6875em] font-semibold uppercase tracking-wide bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {ENTITY_TYPE_LABELS[selectedNode.entityType]}
                </span>
              )}
              <DetailVerificationBadge
                status={effectiveVerificationStatus(selectedNode)}
              />
            </div>
            <h2 className={titleClass}>{selectedNode.label}</h2>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            aria-label="Close details panel"
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-4 mb-4 text-[0.875em] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex-1">
            <div className={`${labelText} uppercase font-bold text-slate-400 dark:text-slate-500 mb-1`}>Year</div>
            <div className="font-semibold text-slate-700 dark:text-slate-200">{selectedNode.year}</div>
          </div>
          <div className="flex-1 border-l border-slate-100 dark:border-slate-800 pl-4">
            <div className={`${labelText} uppercase font-bold text-slate-400 dark:text-slate-500 mb-1`}>
              Organization
            </div>
            <div className="font-semibold text-slate-700 dark:text-slate-200">{selectedNode.author}</div>
          </div>
        </div>

        <div className={`${bodyText} text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-100 dark:border-slate-700`}>
          {selectedNode.desc}
        </div>

        {/*
          Training scope and inference axes render ONLY from curated,
          source-backed ModelMeta fields (trainingScope, inferenceCost,
          speedTier, accuracyTier). They were previously fabricated from
          heuristics — "Data Scale" from the card's canvas x-coordinate
          (x > 600) and "Inference" from category === "Equivariant" — which
          mislabelled e.g. MACE and SevenNet-Nano. Absent fields render as
          "Not yet verified"; explicit "unknown" means reviewed but
          undetermined.
        */}
        <div className={spacing}>
          <div
            className={`flex items-center gap-3 ${bodyText} text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 p-2 rounded-lg`}
            title={selectedNode.datasetEvidence ?? selectedNode.evidenceNotes}
          >
            <Database size={14} className="text-blue-500" />
            <span>
              Training scope:{" "}
              {selectedNode.trainingScope ? (
                selectedNode.trainingScope === "unknown" ? (
                  <span className="text-slate-500 dark:text-slate-400">
                    Unknown (reviewed, undetermined)
                  </span>
                ) : (
                  <strong className="text-slate-800 dark:text-slate-100">
                    {TRAINING_SCOPE_LABELS[selectedNode.trainingScope]}
                  </strong>
                )
              ) : selectedNode.entityType === "architecture" ? (
                <span className="text-slate-500 dark:text-slate-400">
                  Defined per trained model
                </span>
              ) : (
                <span className="italic text-slate-400 dark:text-slate-500">
                  Not yet verified
                </span>
              )}
            </span>
          </div>
          <div
            className={`flex items-center gap-3 ${bodyText} text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 p-2 rounded-lg`}
            title={
              [
                selectedNode.speedEvidence,
                selectedNode.accuracyEvidence,
                selectedNode.benchmarkContext,
              ]
                .filter(Boolean)
                .join(" — ") || undefined
            }
          >
            <Cpu size={14} className="text-purple-500 dark:text-purple-400" />
            <span>
              Inference:{" "}
              {(() => {
                const parts: string[] = [];
                if (selectedNode.inferenceCost)
                  parts.push(`cost: ${prettyTier(selectedNode.inferenceCost)}`);
                if (selectedNode.speedTier)
                  parts.push(`speed: ${prettyTier(selectedNode.speedTier)}`);
                if (selectedNode.accuracyTier)
                  parts.push(
                    `accuracy: ${prettyTier(selectedNode.accuracyTier)}`,
                  );
                return parts.length > 0 ? (
                  <strong className="text-slate-800 dark:text-slate-100">
                    {parts.join(" · ")}
                  </strong>
                ) : (
                  <span className="italic text-slate-400 dark:text-slate-500">
                    Not yet verified
                  </span>
                );
              })()}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <a
            href={selectedNode.githubUrl ?? searchUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-semibold transition shadow-lg shadow-slate-200 dark:shadow-slate-950/60 active:scale-95"
          >
            <Github size={18} /> View Code / GitHub
          </a>

          <a
            href={
              selectedNode.paperUrl ??
              `https://scholar.google.com/scholar?q=${encodeURIComponent(selectedNode.label)}`
            }
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-[0.75em] font-semibold hover:underline"
          >
            Read Technical Paper <ExternalLink size={10} />
          </a>

          <a
            href={searchUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[0.6875em] font-medium hover:underline"
          >
            Search on the web
          </a>

          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => copyCitation(selectedNode)}
              aria-label={`Copy BibTeX citation for ${selectedNode.label}`}
              className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[0.75em] font-semibold transition"
            >
              {citationCopied ? (
                <>
                  <Check size={12} /> Copied
                </>
              ) : (
                <>
                  <Copy size={12} /> Cite this model
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => copyShareLink(selectedNode)}
              aria-label={`Copy shareable link to ${selectedNode.label}`}
              className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[0.75em] font-semibold transition"
            >
              {shareLinkCopied ? (
                <>
                  <Check size={12} /> Link copied
                </>
              ) : (
                <>
                  <Link2 size={12} /> Share link
                </>
              )}
            </button>
            <div
              role="group"
              aria-label={`Report an issue with ${selectedNode.label}`}
              className="col-span-2 grid grid-cols-2 gap-2"
            >
              <a
                href={reportIssueUrl(selectedNode)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open a GitHub issue for ${selectedNode.label}. Requires a GitHub account.`}
                className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[0.75em] font-semibold transition"
              >
                <Flag size={12} /> Report on GitHub
              </a>
              <a
                href={reportIssueMailto(selectedNode)}
                aria-label={`Email a correction about ${selectedNode.label} to the MLIP Hub maintainers`}
                className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[0.75em] font-semibold transition"
              >
                <Flag size={12} /> Email a correction
              </a>
              <p className="col-span-2 text-[0.6875em] text-slate-500 dark:text-slate-400 leading-snug">
                GitHub asks you to log in. No GitHub account? Use the email
                option instead.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div
      className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden"
    >
      <div className="flex-1 relative flex overflow-hidden">
        <p id="mliphub-node-help" className="sr-only">
          Use Tab to enter the model graph, arrow keys to move between models, Enter or Space to open details, and Escape to close them.
        </p>
        {/* MAIN CANVAS */}
        <div
          className="flex-1 relative bg-slate-100 dark:bg-slate-900 cursor-grab active:cursor-grabbing touch-none"
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          role="application"
          aria-label="MLIP landscape graph. Models are arranged by category and year."
        >
          {/* Background dots */}
          <div
            className="absolute inset-0 opacity-5 dark:opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#64748b 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              transform: `translate(${pan.x % 20}px, ${pan.y % 20}px)`,
            }}
          />

          {/* Lightweight placeholder shown before the client-side canvas
              mounts (and while the force simulation is computing). It is
              absolutely positioned, so its replacement by the canvas causes
              no layout shift. */}
          {!canvasReady && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              aria-hidden="true"
            >
              <span className="rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 px-4 py-1.5 text-sm text-slate-500 dark:text-slate-400 shadow-sm">
                {viewportReady && layout === "force"
                  ? "Computing force layout…"
                  : "Preparing the map…"}
              </span>
            </div>
          )}
          {canvasReady && (
          <div
            className={`absolute origin-top-left ease-out ${
              isDragging || isWheelZooming || isPinching
                ? "transition-none"
                : "transition-transform duration-500"
            }`}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${effectiveScale})`,
              // Drives the A−/A/A+ control. Children inside the canvas use
              // em-based text utilities so they scale relative to this
              // wrapper without affecting the filter panel or detail
              // sidebar — those keep the browser default font size.
              fontSize: `${fontScale}rem`,
            }}
          >
            {/* Group zones — only meaningful in the layered layout. */}
            {layout === "layered" &&
              processedNodes.groups.map((node) => (
                <div
                  key={node.id}
                  className="absolute border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-200/30 dark:bg-slate-800/40 backdrop-blur-sm pointer-events-none"
                  style={{
                    left: node.x,
                    top: node.y,
                    width: node.width,
                    height: node.height,
                    zIndex: 0,
                  }}
                >
                  <div className="absolute -top-5 left-4 bg-slate-100 dark:bg-slate-900 px-3 py-0.5 rounded-md text-[1.125em] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider shadow-sm border border-slate-200 dark:border-slate-700">
                    {node.label}
                  </div>
                </div>
              ))}

            {/* Timeline axis — drawn beneath the cards in timeline layout
                so users can read which year each column corresponds to. */}
            {layout === "timeline" && (
              <TimelineAxis
                columns={timelineLayout.columns}
                orientation={timelineLayout.orientation}
                bottom={bounds.maxY}
              />
            )}

            {/* Edges — line layer (below cards). Halo + coloured stroke +
                arrow markers; pointer events are disabled here so this layer
                never blocks clicks on the cards above it. Drawing the line
                below cards means an edge that visually crosses an unrelated
                card is masked by that card, so the eye doesn't read the
                stray segment as a connection. */}
            <svg
              className="absolute"
              style={{
                zIndex: 4,
                left: svgOriginX,
                top: svgOriginY,
                width: svgWidth,
                height: svgHeight,
                overflow: "visible",
                pointerEvents: "none",
              }}
              viewBox={`${svgOriginX} ${svgOriginY} ${svgWidth} ${svgHeight}`}
            >
              <defs>
                <marker
                  id="edge-arrow"
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L6,3 z" style={{ fill: "var(--edge-stroke)" }} />
                </marker>
              </defs>
              {renderEdges("lines")}
            </svg>

            {/* Edges — hit-target layer (below cards). Wide invisible
                strokes that capture clicks on / near the line, but defer
                to cards wherever they overlap so card clicks aren't
                blocked. */}
            <svg
              className="absolute"
              style={{
                zIndex: 5,
                left: svgOriginX,
                top: svgOriginY,
                width: svgWidth,
                height: svgHeight,
                overflow: "visible",
              }}
              viewBox={`${svgOriginX} ${svgOriginY} ${svgWidth} ${svgHeight}`}
            >
              {renderEdges("hit")}
            </svg>

            {/* Edges — label layer (above cards). Each label gets a
                background rect so the words stay readable when the edge's
                midpoint lands on top of a card. */}
            <svg
              className="absolute"
              style={{
                zIndex: 12,
                left: svgOriginX,
                top: svgOriginY,
                width: svgWidth,
                height: svgHeight,
                overflow: "visible",
                pointerEvents: "none",
              }}
              viewBox={`${svgOriginX} ${svgOriginY} ${svgWidth} ${svgHeight}`}
            >
              {renderEdges("labels")}
            </svg>

            {/* Nodes */}
            {processedNodes.items.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const styleClass =
                BUCKET_STYLES[colorBucketOf(node)] || "bg-white border-slate-200";
              const Icon = BUCKET_ICONS[colorBucketOf(node)] || Box;

              const isDraggable = layout === "force";
              return (
                <button
                  key={node.id}
                  type="button"
                  ref={(el) => {
                    if (el) nodeRefs.current.set(node.id, el);
                    else nodeRefs.current.delete(node.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (nodeDragMovedRef.current || pannedRef.current) {
                      // Suppress the click that fires after a node drag or a
                      // canvas pan that happened to start on this card.
                      nodeDragMovedRef.current = false;
                      pannedRef.current = false;
                      return;
                    }
                    handleNodeClick(node);
                  }}
                  onPointerDown={(e) => {
                    if (!isDraggable) return;
                    e.stopPropagation();
                    nodeDragMovedRef.current = false;
                    setNodeDragId(node.id);
                    nodeDragOffsetRef.current = {
                      x: e.clientX / effectiveScale - node.x,
                      y: e.clientY / effectiveScale - node.y,
                    };
                    try {
                      e.currentTarget.setPointerCapture(e.pointerId);
                    } catch {
                      // ignore — capture failures fall back to onPointerMove
                    }
                  }}
                  onPointerMove={(e) => {
                    if (!isDraggable) return;
                    if (nodeDragId !== node.id) return;
                    const newX = e.clientX / effectiveScale - nodeDragOffsetRef.current.x;
                    const newY = e.clientY / effectiveScale - nodeDragOffsetRef.current.y;
                    nodeDragMovedRef.current = true;
                    setForceOverrides((prev) => ({
                      ...prev,
                      [node.id]: { x: newX, y: newY },
                    }));
                  }}
                  onPointerUp={(e) => {
                    if (!isDraggable) return;
                    if (nodeDragId !== node.id) return;
                    try {
                      e.currentTarget.releasePointerCapture(e.pointerId);
                    } catch {
                      // ignore
                    }
                    setNodeDragId(null);
                  }}
                  onKeyDown={(e) => handleNodeKeyDown(e, node)}
                  tabIndex={node.dimmed ? -1 : 0}
                  className={`node-card absolute w-[176px] p-3 rounded-xl border-2 text-left transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-blue-500
                    ${styleClass} ${
                    isSelected
                      ? "ring-4 ring-blue-200 dark:ring-blue-700 scale-105 z-20"
                      : "hover:scale-105 z-10 shadow-md dark:shadow-slate-950/40"
                  }
                    ${node.dimmed ? "opacity-20 grayscale" : "opacity-100"}
                    ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""}
                  `}
                  style={{ left: node.x, top: node.y }}
                  aria-pressed={isSelected}
                  aria-describedby="mliphub-node-help"
                  aria-label={`${node.label}, ${node.category} model from ${node.year} by ${node.author}. Press Enter to view details, arrow keys to move between models.${isDraggable ? " In force-directed layout you can also drag this card." : ""}`}
                  itemScope
                  itemType="https://schema.org/SoftwareSourceCode"
                  data-model-id={node.id}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={16} className="opacity-70" aria-hidden="true" />
                    <span
                      className="text-[0.75em] sm:text-[0.6875em] md:text-[0.625em] lg:text-[0.75em] font-bold uppercase tracking-wide opacity-70"
                      itemProp="applicationCategory"
                    >
                      {BUCKET_LABEL[colorBucketOf(node)]}
                    </span>
                  </div>
                  {/* Static "new entry" tag: replaces the previous bouncing
                      animation, which made the cards hard to read and to
                      capture in screenshots. */}
                  {node.isNew && (
                    <span
                      aria-label="recently added"
                      className="absolute top-1.5 right-1.5 px-1.5 py-0 rounded text-[0.55em] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 dark:bg-amber-300 dark:text-amber-900"
                    >
                      New
                    </span>
                  )}
                  <div
                    className="font-bold text-[1em] sm:text-[0.875em] lg:text-[1em] leading-tight mb-1"
                    itemProp="name"
                  >
                    {node.label}
                  </div>
                  <time
                    className="text-[0.6875em] sm:text-[0.75em] md:text-[0.625em] opacity-70 font-mono"
                    itemProp="datePublished"
                    dateTime={String(node.year)}
                  >
                    {node.year}
                  </time>
                  <meta itemProp="description" content={node.desc} />
                  <meta itemProp="author" content={node.author} />
                  {node.githubUrl && (
                    <meta itemProp="codeRepository" content={node.githubUrl} />
                  )}
                  {(node.paperUrl || node.githubUrl) && (
                    <meta
                      itemProp="url"
                      content={node.paperUrl ?? node.githubUrl ?? ""}
                    />
                  )}
                  {node.license && (
                    <meta itemProp="license" content={node.license} />
                  )}
                  {node.tags && node.tags.length > 0 && (
                    <meta itemProp="keywords" content={node.tags.join(", ")} />
                  )}
                </button>
              );
            })}
          </div>
          )}
        </div>

        {/* FILTER + ZOOM CONTROL */}
        <div
          className={`z-20 ${
            deviceType === "mobile"
              ? "absolute left-0 right-0 top-2 flex justify-center"
              : "absolute top-4 left-4"
          }`}
        >
          <div
            className={`${
              deviceType === "mobile"
                ? "w-[92vw]"
                : "w-64 sm:w-72 lg:w-80"
            }`}
          >
            {deviceType === "mobile" && (
              <button
                onClick={() => setFilterOpen((open) => !open)}
                className="w-full mb-2 flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-[0.875em] font-semibold text-slate-700 dark:text-slate-200 shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Filter size={14} /> Filters
                </span>
                <span className="text-[0.75em] text-slate-500 dark:text-slate-400">{filterOpen ? "Hide" : "Show"}</span>
              </button>
            )}

            {(filterOpen || deviceType !== "mobile") && (
              <div
                // Cap the panel height to the visible canvas (header is
                // ~112 px and we want a small breathing margin top + bottom)
                // and scroll its contents when sections like Layout, Color
                // palette, and the zoom + font controls would otherwise run
                // off the bottom of short laptop viewports. The dvh fallback
                // keeps the panel inside the visible region on mobile when
                // the URL bar shows / hides.
                className="bg-white/90 dark:bg-slate-900/85 backdrop-blur p-3 rounded-xl shadow-xl dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-800 max-h-[calc(100vh-8rem)] supports-[height:100dvh]:max-h-[calc(100dvh-8rem)] overflow-y-auto overscroll-contain"
              >
                <label className="block mb-3">
                  <span className="sr-only">Search models</span>
                  <span className="relative block">
                    <Search
                      size={12}
                      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() =>
                        window.setTimeout(() => setSearchFocused(false), 120)
                      }
                      placeholder="Search by model, organisation, tag, or year…"
                      aria-label="Search models by name, author, year, tag, license, framework, or domain"
                      autoComplete="off"
                      className="w-full pl-7 pr-7 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[0.8125em] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label="Clear search"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                      >
                        <X size={12} />
                      </button>
                    )}
                    {searchFocused && suggestions.length > 0 && (
                      <ul
                        id="mliphub-search-suggestions"
                        role="listbox"
                        aria-label="Search suggestions"
                        className="absolute left-0 right-0 top-full mt-1 z-30 max-h-72 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl dark:shadow-slate-950/60 text-[0.8125em]"
                      >
                        {suggestions.map((s, idx) => (
                          <li
                            key={`${s.kind}-${s.label}-${idx}`}
                            role="option"
                            aria-selected={false}
                          >
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                if (s.kind === "model") {
                                  const target = modelItems.find(
                                    (m) => m.id === s.modelId,
                                  );
                                  if (target) setSelectedNode(target);
                                  setQuery(s.value);
                                } else {
                                  setQuery(s.value);
                                }
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-baseline justify-between gap-3"
                            >
                              <span className="text-slate-800 dark:text-slate-100 font-medium truncate">
                                {s.label}
                              </span>
                              <span className="text-[0.75em] uppercase tracking-wide text-slate-400 dark:text-slate-500 shrink-0">
                                {s.sublabel}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </span>
                </label>
                <div className="border-t border-slate-100 dark:border-slate-800 mt-3 pt-3">
                  <div
                    className="text-[0.6875em] md:text-[0.625em] font-bold mb-2 text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                    id="mliphub-layout-label"
                  >
                    Layout
                  </div>
                  <div
                    role="radiogroup"
                    aria-labelledby="mliphub-layout-label"
                    className="grid grid-cols-1 gap-1"
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={layout === "layered"}
                      onClick={() => updateLayout("layered")}
                      title="Curated, hand-tuned arrangement (default — the version cited in the paper)."
                      className={`px-2 py-1.5 rounded-lg text-[0.75em] md:text-[0.6875em] font-semibold border transition ${
                        layout === "layered"
                          ? "bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      Layered
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={layout === "force"}
                      onClick={() => updateLayout("force")}
                      title="Experimental: deterministic force-directed simulation. The curated layered view remains the default."
                      className={`relative px-2 py-1.5 rounded-lg text-[0.75em] md:text-[0.6875em] font-semibold border transition ${
                        layout === "force"
                          ? "bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      Force-directed
                      <span
                        aria-label="experimental"
                        className="ml-1 inline-block align-middle px-1 py-0 rounded text-[0.55em] font-bold uppercase tracking-wide bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                      >
                        Exp
                      </span>
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={layout === "timeline"}
                      onClick={() => updateLayout("timeline")}
                      title="Tree of Life view: cards arranged left-to-right by release year with month ticks."
                      className={`relative px-2 py-1.5 rounded-lg text-[0.75em] md:text-[0.6875em] font-semibold border transition ${
                        layout === "timeline"
                          ? "bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      Timeline (Tree of Life)
                      <span
                        aria-label="new"
                        className="ml-1 inline-block align-middle px-1 py-0 rounded text-[0.55em] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                      >
                        New
                      </span>
                    </button>
                  </div>
                  {layout === "force" && (
                    <>
                      <p className="mt-2 text-[0.6875em] leading-snug text-slate-500 dark:text-slate-400">
                        Experimental view. The curated layered layout remains
                        the default and is the version cited in the paper.
                      </p>
                      <button
                        type="button"
                        onClick={resetForceLayout}
                        aria-label="Reset force-directed layout to its computed positions"
                        className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[0.75em] md:text-[0.6875em] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <RotateCcw size={12} aria-hidden="true" /> Reset layout
                      </button>
                    </>
                  )}
                  {layout === "timeline" && (
                    <p className="mt-2 text-[0.6875em] leading-snug text-slate-500 dark:text-slate-400">
                      {timelineLayout.orientation === "vertical" ? (
                        <>
                          Tree-of-life view: newest first, scrolling back in
                          time. A crowded year breaks out into months —
                          2026&nbsp;·&nbsp;Aug, 2026&nbsp;·&nbsp;Jul … — while
                          quieter years stay one band. Each card&apos;s badge
                          gives its architecture family. Cards whose
                          publication month isn&apos;t known sit in that
                          year&apos;s{" "}
                          <span className="font-semibold">month unknown</span>{" "}
                          band.
                        </>
                      ) : (
                        <>
                          Tree-of-life view: cards run left-to-right in time
                          (older → newer), one lane per architecture family. A
                          crowded year breaks out into month columns —
                          2026-Jan, 2026-Feb … — while quieter years stay a
                          single column. Within a busy month, cards whose
                          publication month isn&apos;t known sit in the{" "}
                          <span className="font-semibold">—</span> column
                          leading that year.
                        </>
                      )}
                    </p>
                  )}
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 mt-3 pt-3">
                  <div className="text-[0.6875em] md:text-[0.625em] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    View
                  </div>
                  {[
                    {
                      key: "connections",
                      label: "Show connections",
                      on: showConnections,
                      set: updateShowConnections,
                      hint: "Draw the lineage links between models.",
                    },
                    // The edge sub-options only mean anything once links are
                    // drawn, so they stay folded away until then.
                    ...(showConnections
                      ? [
                          {
                            key: "unverified",
                            label: "Include unverified edges",
                            on: showUnverifiedEdges,
                            set: updateShowUnverifiedEdges,
                            hint: "Also draw probable / speculative links (faded and dashed).",
                          },
                          {
                            key: "edgeLabels",
                            label: "Show edge labels",
                            on: edgeLabelsVisible,
                            set: updateEdgeLabelsVisible,
                            hint: "Label each link with the relationship it encodes.",
                          },
                        ]
                      : []),
                  ].map((row) => (
                    <button
                      key={row.key}
                      type="button"
                      role="switch"
                      aria-checked={row.on}
                      aria-label={row.label}
                      title={row.hint}
                      onClick={() => row.set(!row.on)}
                      className="flex w-full items-center justify-between gap-2 py-1.5 text-left"
                    >
                      <span className="text-[0.6875em] font-medium text-slate-600 dark:text-slate-300 truncate">
                        {row.label}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full transition ${
                          row.on
                            ? "bg-blue-200 dark:bg-blue-900"
                            : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-[14px] w-[14px] rounded-full shadow-sm transition-transform ${
                            row.on
                              ? "translate-x-[16px] bg-blue-600 dark:bg-blue-400"
                              : "translate-x-[2px] bg-white dark:bg-slate-400"
                          }`}
                        />
                      </span>
                    </button>
                  ))}
                  <p className="text-[0.625em] mt-1 text-slate-400 dark:text-slate-500 leading-snug">
                    Connections default to on in the timeline, where the lineage
                    is the whole point, and off in the other layouts. Only
                    source-verified links are drawn unless you include the
                    unverified ones. Selecting a model always reveals its own.
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 mt-3 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[0.6875em] md:text-[0.625em] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Filter tags
                    </div>
                    {(tagFilters.equivariance.size +
                      tagFilters.architecture.size +
                      tagFilters.trainedDatasets.size +
                      BOOL_FILTER_AXES.reduce(
                        (acc, a) => acc + tagFilters[a.key].size,
                        0,
                      )) > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setTagFilters({
                            equivariance: new Set(),
                            architecture: new Set(),
                            trainedDatasets: new Set(),
                            usesAttention: new Set(),
                            longRange: new Set(),
                            hasFoundationVariant: new Set(),
                            hasDenoisingPretraining: new Set(),
                            hasMultipleHeads: new Set(),
                            hasMultipleExperts: new Set(),
                            hasUncertaintyEstimates: new Set(),
                          })
                        }
                        className="text-[0.6875em] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {(
                    [
                      {
                        axis: "equivariance" as const,
                        label: "Equivariance",
                        values: EQUIVARIANCE_VALUES as readonly string[],
                        kind: "chips" as "chips" | "switch",
                        tooltip:
                          "Symmetry handling baked into the architecture (constrained / learnt / invariant).",
                      },
                      {
                        axis: "architecture" as const,
                        label: "Architecture",
                        values: ARCHITECTURE_VALUES as readonly string[],
                        kind: "chips" as "chips" | "switch",
                        tooltip:
                          "Model family: hand-crafted descriptor vs graph neural network.",
                      },
                      ...BOOL_FILTER_AXES.map((a) => ({
                        axis: a.key,
                        label: a.label,
                        // A "flag" axis only ever carries `true`, so it offers
                        // one switch rather than a yes/no pair whose "no" would
                        // match nothing.
                        values: (a.mode === "flag"
                          ? ["yes"]
                          : ["yes", "no"]) as readonly string[],
                        kind: (a.mode === "flag" ? "switch" : "chips") as
                          | "chips"
                          | "switch",
                        tooltip: a.tooltip,
                      })),
                    ]
                  )
                    // Drop facets nothing in the catalogue can match.
                    .filter(({ axis, values }) =>
                      values.some((v) => (facetCounts[axis]?.[v] ?? 0) > 0),
                    )
                    .map(({ axis, label, values, tooltip, kind }) => {
                      const set = tagFilters[axis] as Set<string>;
                      const toggle = (value: string) =>
                        setTagFilters((prev) => {
                          const next = new Set(prev[axis] as Set<string>);
                          if (next.has(value)) next.delete(value);
                          else next.add(value);
                          return { ...prev, [axis]: next } as typeof prev;
                        });
                      const on = set.has("yes");
                      // A 32x18 track is far too small to hit on a phone, so
                      // the whole row is the control: the label and the track
                      // sit inside one full-width button.
                      if (kind === "switch") {
                        return (
                          <button
                            key={axis}
                            type="button"
                            role="switch"
                            aria-checked={on}
                            aria-label={`Only show models with ${label.toLowerCase()} (${
                              facetCounts[axis]?.yes ?? 0
                            })`}
                            title={tooltip}
                            onClick={() => toggle("yes")}
                            className="flex w-full items-center justify-between gap-2 py-1.5 text-left"
                          >
                            <span className="inline-flex items-center gap-1 text-[0.6875em] font-medium text-slate-600 dark:text-slate-300">
                              {label}
                              <HelpCircle
                                size={10}
                                aria-hidden="true"
                                className="opacity-40 shrink-0"
                              />
                            </span>
                            <span
                              aria-hidden="true"
                              className={`relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full transition ${
                                on
                                  ? "bg-blue-200 dark:bg-blue-900"
                                  : "bg-slate-200 dark:bg-slate-700"
                              }`}
                            >
                              <span
                                className={`inline-block h-[14px] w-[14px] rounded-full shadow-sm transition-transform ${
                                  on
                                    ? "translate-x-[16px] bg-blue-600 dark:bg-blue-400"
                                    : "translate-x-[2px] bg-white dark:bg-slate-400"
                                }`}
                              />
                            </span>
                          </button>
                        );
                      }
                      return (
                        <div
                          key={axis}
                          className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 py-[3px]"
                        >
                          <span
                            className="inline-flex items-center gap-1 text-[0.6875em] font-medium text-slate-600 dark:text-slate-300 cursor-help shrink-0"
                            title={tooltip}
                          >
                            <span>{label}</span>
                            <HelpCircle
                              size={10}
                              aria-hidden="true"
                              className="opacity-40 shrink-0"
                            />
                          </span>
                          <span className="flex gap-1 shrink-0">
                            {values.map((value) => {
                              const active = set.has(value);
                              const count = facetCounts[axis]?.[value] ?? 0;
                              return (
                                <button
                                  key={value}
                                  type="button"
                                  aria-pressed={active}
                                  onClick={() => toggle(value)}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[0.625em] font-semibold border transition capitalize ${
                                    active
                                      ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                  }`}
                                >
                                  {/* "gnn" is an acronym — render upper-case
                                      (`capitalize` would give "Gnn"). */}
                                  {value === "gnn" ? "GNN" : value}
                                  <span
                                    className={active ? "opacity-70" : "opacity-45"}
                                  >
                                    {count}
                                  </span>
                                </button>
                              );
                            })}
                          </span>
                        </div>
                      );
                    })}
                  <p className="text-[0.625em] mt-1 text-slate-400 dark:text-slate-500 leading-snug">
                    Hover a tag name for its meaning. &ldquo;Yes&rdquo;/&ldquo;no&rdquo;
                    match only verified values; models whose value is unknown or
                    unreviewed are dimmed (never assumed &ldquo;no&rdquo;) while an
                    axis is active.
                  </p>

                  {FILTERABLE_DATASET_IDS.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div
                        className="inline-flex items-center gap-1 text-[0.625em] font-semibold text-slate-500 dark:text-slate-400 mb-1 cursor-help"
                        title="Filter to models whose normalized training datasets include the selected dataset."
                      >
                        Trained on dataset
                        <HelpCircle
                          size={10}
                          aria-hidden="true"
                          className="opacity-50"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {FILTERABLE_DATASET_IDS.map((id) => {
                          const active = tagFilters.trainedDatasets.has(id);
                          return (
                            <button
                              key={id}
                              type="button"
                              aria-pressed={active}
                              title={getDataset(id)?.notes}
                              onClick={() =>
                                setTagFilters((prev) => {
                                  const next = new Set(prev.trainedDatasets);
                                  if (next.has(id)) next.delete(id);
                                  else next.add(id);
                                  return { ...prev, trainedDatasets: next };
                                })
                              }
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[0.6875em] font-semibold border transition ${
                                active
                                  ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300 dark:bg-blue-500 dark:border-blue-500 dark:ring-blue-700"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                              }`}
                            >
                              {active && (
                                <Check size={10} aria-hidden="true" className="-ml-0.5" />
                              )}
                              {datasetDisplayName(id)}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[0.625em] mt-1 text-slate-400 dark:text-slate-500 leading-snug">
                        Only datasets with complete model coverage are shown;
                        more appear as model&ndash;dataset links are verified.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 mt-3 pt-3">
                  <div className="text-[0.6875em] md:text-[0.625em] font-bold mb-2 text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Colour key
                  </div>
                  <ul className="flex flex-col gap-1">
                    {(
                      [
                        "eq-gnn",
                        "inv-gnn",
                        "descriptor",
                        "learnt",
                        "unknown",
                      ] as const
                    ).map((bucket) => (
                      <li
                        key={bucket}
                        className="flex items-center gap-2 text-[0.75em] md:text-[0.6875em] text-slate-600 dark:text-slate-300"
                      >
                        <span
                          aria-hidden="true"
                          className={`w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600 ${BUCKET_SWATCH[bucket]}`}
                        />
                        {BUCKET_LABEL[bucket]}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 mt-3 pt-3">
                  <button
                    type="button"
                    onClick={copyViewCitation}
                    aria-label="Copy a citation for the current Explore view (filters, layout, and selection) to the clipboard"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[0.75em] md:text-[0.6875em] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    {viewCitationCopied ? (
                      <>
                        <Check size={12} aria-hidden="true" /> Citation copied
                      </>
                    ) : (
                      <>
                        <Quote size={12} aria-hidden="true" /> Cite current selection
                      </>
                    )}
                  </button>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 mt-3 pt-3">
                  <div className="text-[0.6875em] md:text-[0.625em] font-bold mb-2 text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Zoom &amp; text size
                  </div>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => stepEffectiveScale(-0.1)}
                      disabled={effectiveScale <= MIN_DISPLAY_SCALE + 1e-6}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded text-slate-600 dark:text-slate-300 text-[0.875em] md:text-[0.75em] border border-slate-200 dark:border-slate-700 w-full"
                      aria-label={`Zoom out (current ${Math.round(effectiveScale * 100)}%, range ${Math.round(MIN_DISPLAY_SCALE * 100)}–${Math.round(MAX_DISPLAY_SCALE * 100)}%)`}
                      title="Zoom out"
                    >
                      -
                    </button>
                    <button
                      onClick={() => setUserScale(1)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 text-[0.875em] md:text-[0.75em] border border-slate-200 dark:border-slate-700 w-full"
                      aria-label={`Reset zoom to fit (${Math.round(baseScale * 100)}%)`}
                      title={`Reset to auto-fit (${Math.round(baseScale * 100)}%)`}
                    >
                      {Math.round(effectiveScale * 100)}%
                    </button>
                    <button
                      onClick={() => stepEffectiveScale(0.1)}
                      disabled={effectiveScale >= MAX_DISPLAY_SCALE - 1e-6}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded text-slate-600 dark:text-slate-300 text-[0.875em] md:text-[0.75em] border border-slate-200 dark:border-slate-700 w-full"
                      aria-label={`Zoom in (current ${Math.round(effectiveScale * 100)}%, range ${Math.round(MIN_DISPLAY_SCALE * 100)}–${Math.round(MAX_DISPLAY_SCALE * 100)}%)`}
                      title="Zoom in"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => {
                        const next = FONT_SCALES[Math.max(0, fontScaleIndex - 1)];
                        updateFontScale(next);
                      }}
                      disabled={!canShrinkFont}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded text-slate-600 dark:text-slate-300 text-[0.75em] border border-slate-200 dark:border-slate-700 w-full"
                      aria-label="Decrease graph text size"
                      title="Shrink text inside the graph (cards, edge labels, zone labels). Use your browser zoom for the rest of the page."
                    >
                      A−
                    </button>
                    <button
                      onClick={() => updateFontScale(DEFAULT_FONT_SCALE)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 text-[0.875em] border border-slate-200 dark:border-slate-700 w-full"
                      aria-label="Reset graph text size"
                      title={`Graph text size ${Math.round(fontScale * 100)}%`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => {
                        const next = FONT_SCALES[Math.min(FONT_SCALES.length - 1, fontScaleIndex + 1)];
                        updateFontScale(next);
                      }}
                      disabled={!canGrowFont}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded text-slate-600 dark:text-slate-300 text-[1em] border border-slate-200 dark:border-slate-700 w-full"
                      aria-label="Increase graph text size"
                      title="Grow text inside the graph (cards, edge labels, zone labels). Use your browser zoom for the rest of the page."
                    >
                      A+
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DETAILS SIDEBAR */}
        <div
          className={`hidden md:flex absolute right-0 top-0 h-full md:w-80 lg:w-96 bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm shadow-2xl dark:shadow-slate-950/70 border-l border-slate-200 dark:border-slate-800 z-30 transition-transform duration-300 ease-in-out flex-col ${selectedNode || selectedEdge ? "translate-x-0" : "translate-x-full"}`}
        >
          {(selectedNode || selectedEdge) && (
            <div
              className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto"
            >
              {selectedEdge ? renderEdgeDetailContent() : renderDetailContent()}
            </div>
          )}
        </div>

        <div
          className={`md:hidden fixed inset-0 z-30 transform transition-transform duration-300 ease-in-out ${
            selectedNode || selectedEdge ? "translate-y-0" : "translate-y-full pointer-events-none"
          }`}
        >
          <div
            className="absolute inset-0 bg-white dark:bg-slate-900 shadow-2xl dark:shadow-slate-950/70 overflow-y-auto overscroll-contain"
            // Pad the bottom of the scroll area to the safe-area inset so
            // long detail content (links, citation buttons) doesn't collide
            // with the home indicator on iPhone X+. Insets are 0 on
            // desktop, so this is a no-op on PCs.
            style={{
              paddingBottom: "env(safe-area-inset-bottom, 0)",
            }}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur"
              style={{
                paddingTop: "max(0.75rem, env(safe-area-inset-top, 0))",
              }}
            >
              <div className="text-[0.9375rem] font-semibold text-slate-700 dark:text-slate-200">
                {selectedEdge ? "Connection" : "Details"}
              </div>
              <button
                onClick={closeDetails}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>
            {(selectedNode || selectedEdge) && (
              <div className="p-4 space-y-4">
                {selectedEdge ? renderEdgeDetailContent() : renderDetailContent()}
              </div>
            )}
          </div>
        </div>
      </div>
      <OnboardingTour />
    </div>
  );
}
