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

const CATEGORY_STYLES: Record<Category, string> = {
  Equivariant: "bg-red-50 border-red-400 text-red-900 hover:shadow-red-200",
  Invariant: "bg-blue-50 border-blue-400 text-blue-900 hover:shadow-blue-200",
  Transformer: "bg-green-50 border-green-400 text-green-900 hover:shadow-green-200",
  Descriptor: "bg-orange-50 border-orange-400 text-orange-900 hover:shadow-orange-200",
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

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  useEffect(() => {
    const deviceBase =
      deviceType === "mobile" ? 0.9 : deviceType === "tablet" ? 0.75 : 0.6;
    const widthScale = viewport.width / (graphWidth + CANVAS_PADDING * 2);
    const heightScale = viewport.height / (graphHeight + CANVAS_PADDING * 2);
    const fitScale = Math.min(widthScale, heightScale, 1);
    const nextBase = Math.min(deviceBase, fitScale);
    setBaseScale(nextBase);
    setUserScale(1);
  }, [deviceType, graphHeight, graphWidth, viewport.height, viewport.width]);

  const basePan = useMemo(() => {
    const scaledWidth = graphWidth * baseScale;
    const scaledHeight = graphHeight * baseScale;
    const padX = CANVAS_PADDING * baseScale;
    const padY = CANVAS_PADDING * baseScale;

    const centerX = (viewport.width - scaledWidth) / 2 - bounds.minX * baseScale + padX;
    const centerY = (viewport.height - scaledHeight) / 2 - bounds.minY * baseScale + padY;

    return { x: centerX, y: centerY };
  }, [baseScale, bounds.minX, bounds.minY, graphHeight, graphWidth, viewport.height, viewport.width]);

  useEffect(() => {
    setUserPan({ x: 0, y: 0 });
  }, [basePan.x, basePan.y]);

  const effectiveScale = baseScale * userScale;
  const pan = { x: basePan.x + userPan.x, y: basePan.y + userPan.y };

  const clampScale = (value: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

  // Canvas panning
  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if ((e.target as HTMLElement).closest(".node-card")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - userPan.x, y: e.clientY - userPan.y });
  };

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!isDragging) return;
    setUserPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

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

  const getEdgePoints = (fromNode: ModelNode, toNode: ModelNode) => {
    const fromCenterX = fromNode.x + CARD_WIDTH / 2;
    const fromCenterY = fromNode.y + CARD_HEIGHT / 2;
    const toCenterX = toNode.x + CARD_WIDTH / 2;
    const toCenterY = toNode.y + CARD_HEIGHT / 2;

    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;

    if (Math.abs(dx) > Math.abs(dy)) {
      const direction = Math.sign(dx) || 1;
      return {
        startX: fromCenterX + direction * (CARD_WIDTH / 2 - CARD_PADDING),
        startY: fromCenterY,
        endX: toCenterX - direction * (CARD_WIDTH / 2 - CARD_PADDING),
        endY: toCenterY,
      };
    }

    const direction = Math.sign(dy) || 1;
    return {
      startX: fromCenterX,
      startY: fromCenterY + direction * (CARD_HEIGHT / 2 - CARD_PADDING),
      endX: toCenterX,
      endY: toCenterY - direction * (CARD_HEIGHT / 2 - CARD_PADDING),
    };
  };

  const renderEdges = () =>
    edges.map((edge, idx) => {
      const fromNode = nodes.find((n) => n.id === edge.from) as ModelNode | undefined;
      const toNode = nodes.find((n) => n.id === edge.to) as ModelNode | undefined;
      if (!fromNode || !toNode) return null;

      const { startX, startY, endX, endY } = getEdgePoints(fromNode, toNode);
      const midX = (startX + endX) / 2;
      const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

      return (
        <g key={idx} className="transition-opacity duration-500">
          <path
            d={path}
            fill="none"
            stroke="#475569"
            strokeWidth={edge.dashed ? 1.8 : deviceType === "mobile" ? 2.6 : 2.2}
            strokeDasharray={edge.dashed ? "5,5" : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
            markerEnd="url(#edge-arrow)"
          />
          {edge.label && (
            <text
              x={(startX + endX) / 2}
              y={(startY + endY) / 2}
              fill="#475569"
              fontSize={10}
              textAnchor="middle"
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
      ? "text-xl md:text-2xl font-bold text-slate-900 leading-snug"
      : "text-2xl md:text-3xl font-bold text-slate-900 leading-tight";
    const labelText = compact ? "text-xs" : "text-xs sm:text-[11px]";
    const bodyText = compact ? "text-sm" : "text-sm md:text-base";
    const spacing = compact ? "space-y-2" : "space-y-3";

    return (
      <>
        <div className="flex justify-between items-start gap-4">
          <div>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${labelText} font-bold uppercase tracking-wide mb-3 border bg-white shadow-sm`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {selectedNode.category}
            </div>
            <h2 className={titleClass}>{selectedNode.label}</h2>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-slate-400 hover:text-slate-600 transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-4 mb-4 text-sm text-slate-500 border-b border-slate-100 pb-4">
          <div className="flex-1">
            <div className={`${labelText} uppercase font-bold text-slate-400 mb-1`}>Year</div>
            <div className="font-semibold text-slate-700">{selectedNode.year}</div>
          </div>
          <div className="flex-1 border-l border-slate-100 pl-4">
            <div className={`${labelText} uppercase font-bold text-slate-400 mb-1`}>
              Organization
            </div>
            <div className="font-semibold text-slate-700">{selectedNode.author}</div>
          </div>
        </div>

        <div className={`${bodyText} text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100`}>
          {selectedNode.desc}
        </div>

        <div className={spacing}>
          <div className={`flex items-center gap-3 ${bodyText} text-slate-600 border p-2 rounded-lg`}>
            <Database size={14} className="text-blue-500" />
            <span>
              Data Scale: <strong>{selectedNode.x > 600 ? "Universal (Foundational)" : "Specialized"}</strong>
            </span>
          </div>
          <div className={`flex items-center gap-3 ${bodyText} text-slate-600 border p-2 rounded-lg`}>
            <Cpu size={14} className="text-purple-500" />
            <span>
              Inference: <strong>{selectedNode.category === "Equivariant" ? "High cost / high accuracy" : "Optimized for speed"}</strong>
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <a
            href={selectedNode.githubUrl ?? searchUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-slate-200 active:scale-95"
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
            className="flex items-center justify-center gap-2 w-full text-blue-600 hover:text-blue-700 text-xs font-semibold hover:underline"
          >
            Read Technical Paper <ExternalLink size={10} />
          </a>

          <a
            href={searchUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full text-slate-500 hover:text-slate-700 text-[11px] font-medium hover:underline"
          >
            Search on the web
          </a>
        </div>
      </>
    );
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 shadow-sm z-20 flex flex-col gap-3 relative">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-200">
              <Layers size={20} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                MLIP Hub
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Interatomic Potential Explorer
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative flex overflow-hidden">
        {/* MAIN CANVAS */}
        <div
          className="flex-1 relative bg-slate-100 cursor-grab active:cursor-grabbing"
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Background dots */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#64748b 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              transform: `translate(${pan.x % 20}px, ${pan.y % 20}px)`,
            }}
          />

          <div
            className="absolute origin-top-left transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${effectiveScale})`,
            }}
          >
            {/* Group zones */}
            {processedNodes.groups.map((node) => (
              <div
                key={node.id}
                className="absolute border-2 border-dashed border-slate-300 rounded-xl bg-slate-200/30 backdrop-blur-sm pointer-events-none"
                style={{
                  left: node.x,
                  top: node.y,
                  width: node.width,
                  height: node.height,
                  zIndex: 0,
                }}
              >
                <div className="absolute -top-4 left-4 bg-slate-100 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {node.label}
                </div>
              </div>
            ))}

            {/* Edges */}
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              style={{ zIndex: 1, width: svgWidth, height: svgHeight }}
            >
              <defs>
                <marker
                  id="edge-arrow"
                  markerWidth="12"
                  markerHeight="12"
                  refX="9"
                  refY="6"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,12 L12,6 z" fill="#475569" />
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
                      ? "ring-4 ring-blue-200 scale-105 z-20"
                      : "hover:scale-105 z-10 shadow-md"
                  }
                    ${node.dimmed ? "opacity-20 grayscale" : "opacity-100"}
                    ${node.isNew ? "animate-bounce" : ""}
                  `}
                  style={{ left: node.x, top: node.y }}
                  aria-pressed={isSelected}
                  aria-label={`${node.label} (${node.category}, ${node.year})`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} className="opacity-70" />
                    <span className="text-xs md:text-[10px] font-bold uppercase tracking-wide opacity-70">
                      {node.category}
                    </span>
                  </div>
                  <div className="font-bold text-sm md:text-[13px] leading-tight mb-1">
                    {node.label}
                  </div>
                  <div className="text-[11px] md:text-[10px] opacity-70 font-mono">{node.year}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* FILTER + ZOOM CONTROL */}
        <div
          className={`bg-white/90 backdrop-blur p-3 rounded-xl shadow-xl border border-slate-200 z-20 ${
            deviceType === "mobile"
              ? "relative mx-auto mt-4 w-[90vw]"
              : "absolute top-4 left-4 w-44 sm:w-52"
          }`}
        >
          <div className="text-xs md:text-[10px] font-bold mb-3 text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Filter size={12} /> Filter Architecture
          </div>
          <div className="flex flex-col gap-1">
            {filters.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-left px-3 py-2 rounded-lg text-sm md:text-xs font-semibold transition flex items-center gap-2
                  ${
                    filter === cat
                      ? "bg-slate-100 text-slate-900"
                      : "hover:bg-slate-50 text-slate-500"
                  }
                `}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    filter === cat ? "bg-blue-500" : "bg-slate-300"
                  }`}
                ></span>
                {cat}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100 mt-3 pt-3 flex gap-2">
            <button
              onClick={() => setUserScale((s) => clampScale(s - 0.1))}
              className="p-2 hover:bg-slate-100 rounded text-slate-600 text-sm md:text-xs border w-full"
            >
              -
            </button>
            <button
              onClick={() => setUserScale(1)}
              className="p-2 hover:bg-slate-100 rounded text-slate-600 text-sm md:text-xs border w-full"
            >
              {Math.round(userScale * baseScale * 100)}%
            </button>
            <button
              onClick={() => setUserScale((s) => clampScale(s + 0.1))}
              className="p-2 hover:bg-slate-100 rounded text-slate-600 text-sm md:text-xs border w-full"
            >
              +
            </button>
          </div>
        </div>

        {/* DETAILS SIDEBAR */}
        <div
          className={`hidden md:flex absolute right-0 top-0 h-full md:w-80 lg:w-96 bg-white shadow-2xl border-l border-slate-200 z-30 transition-transform duration-300 ease-in-out flex-col ${selectedNode ? "translate-x-0" : "translate-x-full"}`}
        >
          {selectedNode && (
            <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto">
              {renderDetailContent()}
            </div>
          )}
        </div>

        <div
          className={`md:hidden fixed inset-0 z-30 transform transition-transform duration-300 ease-in-out ${
            selectedNode ? "translate-y-0" : "translate-y-full pointer-events-none"
          }`}
        >
          <div className="absolute inset-0 bg-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
              <div className="text-sm font-semibold text-slate-700">Details</div>
              <button
                onClick={() => setSelectedNode(null)}
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
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
