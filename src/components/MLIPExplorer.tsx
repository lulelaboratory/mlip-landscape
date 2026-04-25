"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "@/data/landscape";
import OnboardingTour from "@/components/OnboardingTour";
const CARD_WIDTH = 176;
const CARD_HEIGHT = 72;
const CARD_PADDING = 8;
const CANVAS_PADDING = 160;
const MIN_SCALE = 0.5;
const MAX_SCALE = 1.5;
const MIN_BASE_SCALE = 0.4;
const MAX_BASE_SCALE = 1.2;
const SIDEBAR_WIDTH = 360;
const TABLET_SIDEBAR_WIDTH = 320;
const HEADER_HEIGHT = 112;

const FONT_SCALES = [0.85, 1, 1.15, 1.3] as const;
const DEFAULT_FONT_SCALE: number = 1;
const FONT_SCALE_STORAGE_KEY = "mliphub.fontScale";

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

// High-contrast / color-blind safe palette derived from the Okabe-Ito set.
// Maps roughly to: Equivariant→vermilion, Invariant→sky, Transformer→teal,
// Descriptor→amber. These hues remain distinguishable under deuteranopia
// and protanopia simulations, and the icons (kept in CATEGORY_ICONS) provide
// a non-color channel for readers who can't distinguish hues at all.
const CATEGORY_STYLES_CB: Record<Category, string> = {
  Equivariant:
    "bg-rose-50 border-rose-700 text-rose-900 hover:shadow-rose-200 dark:bg-rose-950/60 dark:border-rose-300 dark:text-rose-50 dark:hover:shadow-rose-900/40",
  Invariant:
    "bg-sky-50 border-sky-700 text-sky-900 hover:shadow-sky-200 dark:bg-sky-950/60 dark:border-sky-300 dark:text-sky-50 dark:hover:shadow-sky-900/40",
  Transformer:
    "bg-teal-50 border-teal-700 text-teal-900 hover:shadow-teal-200 dark:bg-teal-950/60 dark:border-teal-300 dark:text-teal-50 dark:hover:shadow-teal-900/40",
  Descriptor:
    "bg-amber-50 border-amber-700 text-amber-900 hover:shadow-amber-200 dark:bg-amber-950/60 dark:border-amber-300 dark:text-amber-50 dark:hover:shadow-amber-900/40",
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

const CATEGORY_SWATCH_CB: Record<Category, string> = {
  Equivariant: "bg-rose-700",
  Invariant: "bg-sky-700",
  Transformer: "bg-teal-700",
  Descriptor: "bg-amber-700",
};

type PaletteMode = "default" | "colorblind";
const PALETTE_STORAGE_KEY = "mliphub.palette";

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

export default function MLIPExplorer() {
  const [nodes] = useState<AnyNode[]>(INITIAL_NODES);
  const [edges] = useState<Edge[]>(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState<ModelNode | null>(null);
  const [filter, setFilter] = useState<FilterType>("All");
  const [query, setQuery] = useState("");
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });
  const [baseScale, setBaseScale] = useState(0.8);
  const [userScale, setUserScale] = useState(1);
  const [userPan, setUserPan] = useState({ x: 0, y: 0 });
  const [filterOpen, setFilterOpen] = useState(true);
  const [fontScale, setFontScale] = useState<number>(DEFAULT_FONT_SCALE);
  const [citationCopied, setCitationCopied] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [palette, setPalette] = useState<PaletteMode>("default");
  const CATEGORY_STYLES =
    palette === "colorblind" ? CATEGORY_STYLES_CB : CATEGORY_STYLES_DEFAULT;
  const CATEGORY_SWATCH =
    palette === "colorblind" ? CATEGORY_SWATCH_CB : CATEGORY_SWATCH_DEFAULT;

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragPointerId, setDragPointerId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });

    handleResize();
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(PALETTE_STORAGE_KEY);
    if (stored === "colorblind" || stored === "default") setPalette(stored);
  }, []);

  const updatePalette = (next: PaletteMode) => {
    setPalette(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PALETTE_STORAGE_KEY, next);
    }
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
    const next = params.toString();
    const url = `${window.location.pathname}${next ? `?${next}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", url);
  }, [filter, query, selectedNode]);

  // Escape closes the detail panel.
  useEffect(() => {
    if (!selectedNode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedNode(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedNode]);

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

  const fontScaleStyle = { fontSize: `${fontScale}rem` };
  const fontScaleIndex = FONT_SCALES.indexOf(fontScale as (typeof FONT_SCALES)[number]);
  const canShrinkFont = fontScaleIndex > 0;
  const canGrowFont = fontScaleIndex >= 0 && fontScaleIndex < FONT_SCALES.length - 1;

  const bounds = useMemo(() => {
    const items = nodes.filter((n) => n.type === "node") as ModelNode[];
    if (items.length === 0) {
      return { minX: 0, minY: 0, maxX: CARD_WIDTH, maxY: CARD_HEIGHT };
    }

    const minX = Math.min(...items.map((n) => n.x));
    const minY = Math.min(...items.map((n) => n.y));
    const maxX = Math.max(...items.map((n) => n.x + CARD_WIDTH));
    const maxY = Math.max(...items.map((n) => n.y + CARD_HEIGHT));

    return { minX, minY, maxX, maxY };
  }, [nodes]);

  const graphWidth = bounds.maxX - bounds.minX;
  const graphHeight = bounds.maxY - bounds.minY;

  const sidebarSpace = deviceType === "desktop" ? SIDEBAR_WIDTH : deviceType === "tablet" ? TABLET_SIDEBAR_WIDTH : 0;
  const availableWidth = Math.max(viewport.width - sidebarSpace - 32, 320);
  const availableHeight = Math.max(viewport.height - HEADER_HEIGHT, 320);

  useEffect(() => {
    const preferred = deviceType === "mobile" ? 0.95 : deviceType === "tablet" ? 0.8 : 0.65;
    const widthScale = availableWidth / (graphWidth + CANVAS_PADDING * 2);
    const heightScale = availableHeight / (graphHeight + CANVAS_PADDING * 2);
    const fitScale = Math.min(widthScale, heightScale);
    const scaledFit = Math.min(preferred, fitScale) * 1.08;
    const nextBase = Math.max(MIN_BASE_SCALE, Math.min(MAX_BASE_SCALE, scaledFit));
    setBaseScale(nextBase);
    setUserScale(1);
  }, [availableHeight, availableWidth, deviceType, graphHeight, graphWidth]);

  const basePan = useMemo(() => {
    const paddedWidth = graphWidth + CANVAS_PADDING * 2;
    const paddedHeight = graphHeight + CANVAS_PADDING * 2;
    const graphPixelWidth = paddedWidth * baseScale;
    const graphPixelHeight = paddedHeight * baseScale;

    const centerX = (availableWidth - graphPixelWidth) / 2 - bounds.minX * baseScale + CANVAS_PADDING * baseScale;
    const centerY = (availableHeight - graphPixelHeight) / 2 - bounds.minY * baseScale + CANVAS_PADDING * baseScale;

    return { x: centerX, y: centerY };
  }, [availableHeight, availableWidth, baseScale, bounds.minX, bounds.minY, graphHeight, graphWidth]);

  const effectiveScale = baseScale * userScale;
  const pan = { x: basePan.x + userPan.x, y: basePan.y + userPan.y };

  // Auto-pan the canvas so the selected node sits in the visible (non-sidebar)
  // region. Skipped on mobile because the mobile detail drawer is a separate
  // full-height overlay rather than a right-side column.
  useEffect(() => {
    if (!selectedNode) {
      setUserPan({ x: 0, y: 0 });
      return;
    }
    if (deviceType === "mobile") return;

    const nodeCenterGraphX = selectedNode.x + CARD_WIDTH / 2;
    const nodeCenterGraphY = selectedNode.y + CARD_HEIGHT / 2;
    const targetScreenX = availableWidth / 2;
    const targetScreenY = availableHeight / 2;
    const targetUserPanX = targetScreenX - basePan.x - nodeCenterGraphX * effectiveScale;
    const targetUserPanY = targetScreenY - basePan.y - nodeCenterGraphY * effectiveScale;
    setUserPan({ x: targetUserPanX, y: targetUserPanY });
  }, [selectedNode, deviceType, availableWidth, availableHeight, basePan.x, basePan.y, effectiveScale]);

  const clampScale = (value: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

  // Canvas panning via pointer events (mouse + touch)
  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if ((e.target as HTMLElement).closest(".node-card")) return;
    setIsDragging(true);
    setDragPointerId(e.pointerId);
    setDragStart({ x: e.clientX - userPan.x, y: e.clientY - userPan.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!isDragging || dragPointerId !== e.pointerId) return;
    setUserPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (dragPointerId !== null) {
      try {
        e.currentTarget.releasePointerCapture(dragPointerId);
      } catch {
        // ignore
      }
    }
    setIsDragging(false);
    setDragPointerId(null);
  };

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

    const visibleNodes = nodes.map((n) => {
      if (n.type !== "node") return n;
      const dimmed =
        (filter !== "All" && n.category !== filter) || !matchesQuery(n);
      return { ...n, dimmed };
    });

    const groups = visibleNodes.filter((n) => n.type === "group") as GroupNode[];
    const items = visibleNodes.filter((n) => n.type === "node") as ModelNode[];

    return { groups, items };
  }, [nodes, filter, query]);

  // Orthogonal edge router. Returns an SVG path string that:
  // - exits the source card from the side nearest the target
  // - enters the target card from the corresponding opposite side
  // - for long runs, detours above/below rows so the line never cuts
  //   through an unrelated card
  // Also returns a label anchor placed on a clear stretch of the path.
  const COLUMN_GAP = 280; // approx horizontal spacing between node columns
  const ROW_GAP_Y = 430; // y coordinate of the gap between zone_eq and zone_inv
  const DETOUR = 48; // vertical detour distance for same-row skips
  const COL_DETOUR = 60; // horizontal detour distance for same-col skips
  const CORRIDOR_SPACING = 14; // spacing between parallel detour tracks
  const LATERAL_STAGGER = 10; // spacing between parallel vertical drops at a shared card edge

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

    const classify = (
      from: ModelNode,
      to: ModelNode,
    ): { corridor: string | null; source: string | null; target: string | null; magnitude: number } => {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const sameRow = Math.abs(dy) < 20;
      const sameCol = Math.abs(dx) < 20;

      if (sameRow && Math.abs(dx) > COLUMN_GAP + CARD_WIDTH) {
        const bowAbove = from.y > 200;
        return {
          corridor: `row-${bowAbove ? "up" : "down"}-${from.y}`,
          source: `${from.id}:${bowAbove ? "top" : "bot"}`,
          target: `${to.id}:${bowAbove ? "top" : "bot"}`,
          magnitude: Math.abs(dx),
        };
      }
      if (sameCol && Math.abs(dy) > 200) {
        return {
          corridor: `col-right-${from.x}`,
          source: `${from.id}:right`,
          target: `${to.id}:right`,
          magnitude: Math.abs(dy),
        };
      }
      if (!sameRow && !sameCol) {
        const goingDown = dy > 0;
        const crossZone = (from.y < 450 && to.y > 480) || (from.y > 480 && to.y < 450);
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
      const from = nodes.find((n) => n.id === edge.from && n.type === "node") as ModelNode | undefined;
      const to = nodes.find((n) => n.id === edge.to && n.type === "node") as ModelNode | undefined;
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
  }, [edges, nodes]);

  const buildEdgePath = (
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

    // Case 1: same row, adjacent columns -> straight horizontal side-to-side
    if (sameRow && Math.abs(dx) <= COLUMN_GAP + CARD_WIDTH) {
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
      const bowAbove = fy > 200;
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
    if (sameCol && Math.abs(dy) <= 200) {
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
    const crossZone = (fy < 450 && ty > 480) || (fy > 480 && ty < 450);
    const baseBendY = crossZone ? ROW_GAP_Y : (sy + ey) / 2;
    const bendY = baseBendY + corridorOffset;
    const sxMid = fcx + sourceStagger;
    const exMid = tcx + targetStagger;
    return {
      path: `M ${sxMid} ${sy} L ${sxMid} ${bendY} L ${exMid} ${bendY} L ${exMid} ${ey}`,
      labelX: (sxMid + exMid) / 2,
      labelY: bendY - 6,
    };
  };

  const renderEdges = () =>
    edges.map((edge, idx) => {
      const fromNode = nodes.find((n) => n.id === edge.from) as ModelNode | undefined;
      const toNode = nodes.find((n) => n.id === edge.to) as ModelNode | undefined;
      if (!fromNode || !toNode) return null;

      const corridorOffset = edgeRouting.corridorOffset.get(idx) ?? 0;
      const sourceStagger = edgeRouting.sourceStagger.get(idx) ?? 0;
      const targetStagger = edgeRouting.targetStagger.get(idx) ?? 0;
      const { path, labelX, labelY } = buildEdgePath(
        fromNode,
        toNode,
        corridorOffset,
        sourceStagger,
        targetStagger,
      );

      return (
        <g key={idx} className="transition-opacity duration-500">
          <path
            d={path}
            fill="none"
            style={{ stroke: "var(--edge-stroke)" }}
            strokeWidth={edge.dashed ? 2 : deviceType === "mobile" ? 3 : 2.25}
            strokeDasharray={edge.dashed ? "6,4" : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
            markerEnd="url(#edge-arrow)"
          />
          {edge.label && (
            <text
              x={labelX}
              y={labelY}
              style={{ fill: "var(--edge-label)", stroke: "var(--edge-halo)" }}
              fontSize={11}
              fontWeight={600}
              textAnchor="middle"
              paintOrder="stroke"
              strokeWidth={3}
              strokeLinejoin="round"
            >
              {edge.label}
            </text>
          )}
        </g>
      );
    });

  const filters: readonly FilterType[] = CATEGORY_FILTERS;

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
    setSelectedNode(node);
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

    const cx = current.x + CARD_WIDTH / 2;
    const cy = current.y + CARD_HEIGHT / 2;

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

  const svgWidth = Math.max(graphWidth + CANVAS_PADDING * 4, 1400);
  const svgHeight = Math.max(graphHeight + CANVAS_PADDING * 4, 1100);

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
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${labelText} font-bold uppercase tracking-wide mb-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {selectedNode.category}
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

        <div className={spacing}>
          <div className={`flex items-center gap-3 ${bodyText} text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 p-2 rounded-lg`}>
            <Database size={14} className="text-blue-500" />
            <span>
              Data Scale: <strong className="text-slate-800 dark:text-slate-100">{selectedNode.x > 600 ? "Universal (Foundational)" : "Specialized"}</strong>
            </span>
          </div>
          <div className={`flex items-center gap-3 ${bodyText} text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 p-2 rounded-lg`}>
            <Cpu size={14} className="text-purple-500 dark:text-purple-400" />
            <span>
              Inference: <strong className="text-slate-800 dark:text-slate-100">{selectedNode.category === "Equivariant" ? "High cost / high accuracy" : "Optimized for speed"}</strong>
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
      style={fontScaleStyle}
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

          <div
            className={`absolute origin-top-left ease-out ${
              isDragging ? "transition-transform duration-75" : "transition-transform duration-500"
            }`}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${effectiveScale})`,
            }}
          >
            {/* Group zones */}
            {processedNodes.groups.map((node) => (
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
                <div className="absolute -top-4 left-4 bg-slate-100 dark:bg-slate-900 px-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {node.label}
                </div>
              </div>
            ))}

            {/* Edges */}
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              style={{ zIndex: 5, width: svgWidth, height: svgHeight }}
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
              {renderEdges()}
            </svg>

            {/* Nodes */}
            {processedNodes.items.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const styleClass =
                CATEGORY_STYLES[node.category] || "bg-white border-slate-200";
              const Icon = CATEGORY_ICONS[node.category] || Box;

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
                    handleNodeClick(node);
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
                    ${node.isNew ? "animate-bounce" : ""}
                  `}
                  style={{ left: node.x, top: node.y }}
                  aria-pressed={isSelected}
                  aria-describedby="mliphub-node-help"
                  aria-label={`${node.label}, ${node.category} model from ${node.year} by ${node.author}. Press Enter to view details, arrow keys to move between models.`}
                  itemScope
                  itemType="https://schema.org/SoftwareSourceCode"
                  data-model-id={node.id}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={16} className="opacity-70" aria-hidden="true" />
                    <span
                      className="text-xs sm:text-[11px] md:text-[10px] lg:text-xs font-bold uppercase tracking-wide opacity-70"
                      itemProp="applicationCategory"
                    >
                      {node.category}
                    </span>
                  </div>
                  <div
                    className="font-bold text-base sm:text-sm lg:text-base leading-tight mb-1"
                    itemProp="name"
                  >
                    {node.label}
                  </div>
                  <time
                    className="text-[11px] sm:text-xs md:text-[10px] opacity-70 font-mono"
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
                : "w-48 sm:w-56"
            }`}
          >
            {deviceType === "mobile" && (
              <button
                onClick={() => setFilterOpen((open) => !open)}
                className="w-full mb-2 flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-[0.875em] font-semibold text-slate-700 dark:text-slate-200 shadow-sm"
                style={fontScaleStyle}
              >
                <span className="flex items-center gap-2">
                  <Filter size={14} /> Filter Architecture
                </span>
                <span className="text-[0.75em] text-slate-500 dark:text-slate-400">{filterOpen ? "Hide" : "Show"}</span>
              </button>
            )}

            {(filterOpen || deviceType !== "mobile") && (
              <div
                className="bg-white/90 dark:bg-slate-900/85 backdrop-blur p-3 rounded-xl shadow-xl dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-800"
                style={fontScaleStyle}
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
                      placeholder="Search name, tag, license, year…"
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
                <div className="text-[0.75em] sm:text-[0.6875em] md:text-[0.625em] font-bold mb-3 text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Filter size={12} /> Filter Architecture
                </div>
                <div className="flex flex-col gap-1" role="group" aria-label="Filter by architecture category">
                  {filters.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      aria-pressed={filter === cat}
                      className={`text-left px-3 py-2 rounded-lg text-[0.875em] sm:text-[0.75em] md:text-[0.6875em] font-semibold transition flex items-center gap-2
                        ${
                          filter === cat
                            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                            : "hover:bg-slate-50 text-slate-500 dark:text-slate-400 dark:hover:bg-slate-800/60"
                        }
                      `}
                    >
                      <span
                        aria-hidden="true"
                        className={`w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600 ${
                          cat === "All"
                            ? "bg-slate-300 dark:bg-slate-600"
                            : CATEGORY_SWATCH[cat]
                        }`}
                      ></span>
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 mt-3 pt-3">
                  <div
                    className="text-[0.6875em] md:text-[0.625em] font-bold mb-2 text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                    id="mliphub-palette-label"
                  >
                    Color palette
                  </div>
                  <div
                    role="radiogroup"
                    aria-labelledby="mliphub-palette-label"
                    className="grid grid-cols-2 gap-1"
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={palette === "default"}
                      onClick={() => updatePalette("default")}
                      className={`px-2 py-1.5 rounded-lg text-[0.75em] md:text-[0.6875em] font-semibold border transition ${
                        palette === "default"
                          ? "bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      Default
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={palette === "colorblind"}
                      onClick={() => updatePalette("colorblind")}
                      className={`px-2 py-1.5 rounded-lg text-[0.75em] md:text-[0.6875em] font-semibold border transition ${
                        palette === "colorblind"
                          ? "bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      Color-blind
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 mt-3 pt-3 flex gap-2">
                  <button
                    onClick={() => setUserScale((s) => clampScale(s - 0.1))}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 text-[0.875em] md:text-[0.75em] border border-slate-200 dark:border-slate-700 w-full"
                    aria-label="Zoom out"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setUserScale(1)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 text-[0.875em] md:text-[0.75em] border border-slate-200 dark:border-slate-700 w-full"
                    aria-label="Reset zoom"
                  >
                    {Math.round(userScale * baseScale * 100)}%
                  </button>
                  <button
                    onClick={() => setUserScale((s) => clampScale(s + 0.1))}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 text-[0.875em] md:text-[0.75em] border border-slate-200 dark:border-slate-700 w-full"
                    aria-label="Zoom in"
                  >
                    +
                  </button>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 mt-3 pt-3 flex gap-2 items-center">
                  <button
                    onClick={() => {
                      const next = FONT_SCALES[Math.max(0, fontScaleIndex - 1)];
                      updateFontScale(next);
                    }}
                    disabled={!canShrinkFont}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded text-slate-600 dark:text-slate-300 text-[0.75em] border border-slate-200 dark:border-slate-700 w-full"
                    aria-label="Decrease UI font size"
                  >
                    A−
                  </button>
                  <button
                    onClick={() => updateFontScale(DEFAULT_FONT_SCALE)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 text-[0.875em] border border-slate-200 dark:border-slate-700 w-full"
                    aria-label="Reset UI font size"
                    title={`UI text size ${Math.round(fontScale * 100)}%`}
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
                    aria-label="Increase UI font size"
                  >
                    A+
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DETAILS SIDEBAR */}
        <div
          className={`hidden md:flex absolute right-0 top-0 h-full md:w-80 lg:w-96 bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm shadow-2xl dark:shadow-slate-950/70 border-l border-slate-200 dark:border-slate-800 z-30 transition-transform duration-300 ease-in-out flex-col ${selectedNode ? "translate-x-0" : "translate-x-full"}`}
        >
          {selectedNode && (
            <div
              className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto"
              style={fontScaleStyle}
            >
              {renderDetailContent()}
            </div>
          )}
        </div>

        <div
          className={`md:hidden fixed inset-0 z-30 transform transition-transform duration-300 ease-in-out ${
            selectedNode ? "translate-y-0" : "translate-y-full pointer-events-none"
          }`}
        >
          <div className="absolute inset-0 bg-white dark:bg-slate-900 shadow-2xl dark:shadow-slate-950/70 overflow-y-auto" style={fontScaleStyle}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-[0.875em] font-semibold text-slate-700 dark:text-slate-200">Details</div>
              <button
                onClick={() => setSelectedNode(null)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700"
                aria-label="Close details"
              >
                <X size={18} />
              </button>
            </div>
            {selectedNode && <div className="p-4 space-y-4">{renderDetailContent()}</div>}
          </div>
        </div>
      </div>
      <OnboardingTour />
    </div>
  );
}
