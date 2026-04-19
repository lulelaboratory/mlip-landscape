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

const CATEGORY_STYLES: Record<Category, string> = {
  Equivariant:
    "bg-red-50 border-red-400 text-red-900 hover:shadow-red-200 dark:bg-red-950/50 dark:border-red-500 dark:text-red-100 dark:hover:shadow-red-900/40",
  Invariant:
    "bg-blue-50 border-blue-400 text-blue-900 hover:shadow-blue-200 dark:bg-blue-950/50 dark:border-blue-500 dark:text-blue-100 dark:hover:shadow-blue-900/40",
  Transformer:
    "bg-green-50 border-green-400 text-green-900 hover:shadow-green-200 dark:bg-green-950/50 dark:border-green-500 dark:text-green-100 dark:hover:shadow-green-900/40",
  Descriptor:
    "bg-orange-50 border-orange-400 text-orange-900 hover:shadow-orange-200 dark:bg-orange-950/50 dark:border-orange-500 dark:text-orange-100 dark:hover:shadow-orange-900/40",
};

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  Equivariant: Box,
  Invariant: Layers,
  Transformer: Zap,
  Descriptor: Database,
};

type FilterType = "All" | Category;

type DeviceType = "mobile" | "tablet" | "desktop";

export default function MLIPExplorer() {
  const [nodes] = useState<AnyNode[]>(INITIAL_NODES);
  const [edges] = useState<Edge[]>(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState<ModelNode | null>(null);
  const [filter, setFilter] = useState<FilterType>("All");
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });
  const [baseScale, setBaseScale] = useState(0.8);
  const [userScale, setUserScale] = useState(1);
  const [userPan, setUserPan] = useState({ x: 0, y: 0 });
  const [filterOpen, setFilterOpen] = useState(true);
  const [fontScale, setFontScale] = useState<number>(DEFAULT_FONT_SCALE);

  const canvasRef = useRef<HTMLDivElement | null>(null);
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

  // Filter + layering
  const processedNodes = useMemo(() => {
    const visibleNodes =
      filter === "All"
        ? nodes
        : nodes.map((n) =>
            n.type === "node" && n.category !== filter
              ? { ...n, dimmed: true }
              : { ...n, dimmed: false },
          );

    const groups = visibleNodes.filter((n) => n.type === "group") as GroupNode[];
    const items = visibleNodes.filter((n) => n.type === "node") as ModelNode[];

    return { groups, items };
  }, [nodes, filter]);

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

  const filters: FilterType[] = ["All", "Equivariant", "Invariant", "Transformer", "Descriptor"];

  const handleNodeClick = (node: ModelNode) => {
    setSelectedNode(node);
  };

  const searchUrl = selectedNode
    ? `https://www.google.com/search?q=${encodeURIComponent(
        `${selectedNode.label} machine learning interatomic potential`,
      )}`
    : "#";

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
        {/* MAIN CANVAS */}
        <div
          className="flex-1 relative bg-slate-100 dark:bg-slate-900 cursor-grab active:cursor-grabbing touch-none"
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node);
                  }}
                  className={`node-card absolute w-[176px] p-3 rounded-xl border-2 text-left transition-all duration-200
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
                  aria-label={`${node.label} (${node.category}, ${node.year})`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={16} className="opacity-70" />
                    <span className="text-xs sm:text-[11px] md:text-[10px] lg:text-xs font-bold uppercase tracking-wide opacity-70">
                      {node.category}
                    </span>
                  </div>
                  <div className="font-bold text-base sm:text-sm lg:text-base leading-tight mb-1">
                    {node.label}
                  </div>
                  <div className="text-[11px] sm:text-xs md:text-[10px] opacity-70 font-mono">{node.year}</div>
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
                <div className="text-[0.75em] sm:text-[0.6875em] md:text-[0.625em] font-bold mb-3 text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Filter size={12} /> Filter Architecture
                </div>
                <div className="flex flex-col gap-1">
                  {filters.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={`text-left px-3 py-2 rounded-lg text-[0.875em] sm:text-[0.75em] md:text-[0.6875em] font-semibold transition flex items-center gap-2
                        ${
                          filter === cat
                            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                            : "hover:bg-slate-50 text-slate-500 dark:text-slate-400 dark:hover:bg-slate-800/60"
                        }
                      `}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          filter === cat ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"
                        }`}
                      ></span>
                      {cat}
                    </button>
                  ))}
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
    </div>
  );
}
