"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Info,
  ExternalLink,
  Github,
  RefreshCw,
  Layers,
  Box,
  Cpu,
  Database,
  X,
  Zap,
  Filter,
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
import { AdBanner } from "./AdBanner";

const CATEGORY_STYLES: Record<Category, string> = {
  Equivariant: "bg-red-50 border-red-400 text-red-900 hover:shadow-red-200",
  Invariant: "bg-blue-50 border-blue-400 text-blue-900 hover:shadow-blue-200",
  Transformer: "bg-green-50 border-green-400 text-green-900 hover:shadow-green-200",
  Descriptor: "bg-orange-50 border-orange-400 text-orange-900 hover:shadow-orange-200",
};

const CATEGORY_ICONS: Record<Category, React.ComponentType<{ size?: number }>> = {
  Equivariant: Box,
  Invariant: Layers,
  Transformer: Zap,
  Descriptor: Database,
};

type FilterType = "All" | Category;

export default function MLIPExplorer() {
  const [nodes, setNodes] = useState<AnyNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<Edge[]>(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState<ModelNode | null>(null);
  const [filter, setFilter] = useState<FilterType>("All");
  const [isUpdating, setIsUpdating] = useState(false);
  const [scale, setScale] = useState(1);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Canvas panning
  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if ((e.target as HTMLElement).closest(".node-card")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Simulated "new model" update (purely front-end)
  const handleSimulateUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => {
      const id = `new_model_${Date.now()}`;
      const newNode: ModelNode = {
        id,
        type: "node",
        category: "Transformer",
        label: "New SOTA 2026",
        year: 2026,
        author: "Open Science Collab",
        x: 950,
        y: 880,
        desc: "A simulated new foundation model automatically detected from a new arXiv paper or GitHub repo.",
        isNew: true,
      };

      const newEdge: Edge = {
        from: "orb",
        to: id,
        label: "Next Gen",
        dashed: true,
      };

      setNodes((prev) => [...prev, newNode]);
      setEdges((prev) => [...prev, newEdge]);
      setSelectedNode(newNode);
      setIsUpdating(false);
    }, 1000);
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

  const renderEdges = () =>
    edges.map((edge, idx) => {
      const fromNode = nodes.find((n) => n.id === edge.from) as ModelNode | undefined;
      const toNode = nodes.find((n) => n.id === edge.to) as ModelNode | undefined;
      if (!fromNode || !toNode) return null;

      const startX = fromNode.x + 80;
      const startY = fromNode.y + 30;
      const endX = toNode.x + 80;
      const endY = toNode.y + 30;

      const path = `M ${startX} ${startY} C ${startX} ${startY + 50}, ${endX} ${endY - 50}, ${endX} ${endY}`;

      return (
        <g key={idx} className="transition-opacity duration-500">
          <path
            d={path}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray={edge.dashed ? "5,5" : undefined}
            className="opacity-60"
          />
          {edge.label && (
            <text
              x={(startX + endX) / 2}
              y={(startY + endY) / 2}
              fill="#64748b"
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

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-sm z-20 flex flex-col gap-3 relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-200">
              <Layers size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">
                MLIP Landscape
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Interatomic Potential Explorer
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSimulateUpdate}
              disabled={isUpdating}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-lg shadow-slate-200 flex items-center gap-2 active:scale-95 disabled:opacity-70"
            >
              <RefreshCw size={16} className={isUpdating ? "animate-spin" : ""} />
              <span>{isUpdating ? "Updating..." : "Simulate Live Update"}</span>
            </button>
          </div>
        </div>

        {/* Ad banner under header */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-4xl">
            <AdBanner slotId="1234567890" />
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
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
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
              className="absolute top-0 left-0 w-[2000px] h-[2000px] pointer-events-none"
              style={{ zIndex: 1 }}
            >
              {renderEdges()}
            </svg>

            {/* Nodes */}
            {processedNodes.items.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const styleClass =
                CATEGORY_STYLES[node.category] || "bg-white border-slate-200";
              const Icon = CATEGORY_ICONS[node.category] || Box;

              return (
                <div
                  key={node.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node);
                  }}
                  className={`node-card absolute w-40 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${styleClass} ${
                    isSelected
                      ? "ring-4 ring-blue-200 scale-105 z-20"
                      : "hover:scale-105 z-10 shadow-md"
                  }
                    ${node.dimmed ? "opacity-20 grayscale" : "opacity-100"}
                    ${node.isNew ? "animate-bounce" : ""}
                  `}
                  style={{ left: node.x, top: node.y }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={12} className="opacity-70" />
                    <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">
                      {node.category}
                    </span>
                  </div>
                  <div className="font-bold text-sm leading-tight mb-1">
                    {node.label}
                  </div>
                  <div className="text-[10px] opacity-60 font-mono">{node.year}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FILTER + ZOOM CONTROL */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-3 rounded-xl shadow-xl border border-slate-200 w-48 z-20">
          <div className="text-[10px] font-bold mb-3 text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Filter size={12} /> Filter Architecture
          </div>
          <div className="flex flex-col gap-1">
            {filters.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 
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
              onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 text-xs border w-full"
            >
              -
            </button>
            <button
              onClick={() => setScale(1)}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 text-xs border w-full"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={() => setScale((s) => Math.min(2, s + 0.1))}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 text-xs border w-full"
            >
              +
            </button>
          </div>
        </div>

        {/* DETAILS SIDEBAR */}
        <div
          className={`
            absolute right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-slate-200 z-30 
            transition-transform duration-300 ease-in-out flex flex-col
            ${selectedNode ? "translate-x-0" : "translate-x-full"}
          `}
        >
          {selectedNode && (
            <>
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide mb-3 border bg-white shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {selectedNode.category}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                    {selectedNode.label}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-slate-600 transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="flex gap-4 mb-6 text-sm text-slate-500 border-b border-slate-100 pb-6">
                  <div className="flex-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Year
                    </div>
                    <div className="font-semibold text-slate-700">
                      {selectedNode.year}
                    </div>
                  </div>
                  <div className="flex-1 border-l border-slate-100 pl-4">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Organization
                    </div>
                    <div className="font-semibold text-slate-700">
                      {selectedNode.author}
                    </div>
                  </div>
                </div>

                <div className="prose prose-sm prose-slate max-w-none">
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Info size={14} className="text-blue-500" /> Model Description
                  </h3>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {selectedNode.desc}
                  </p>

                  <h3 className="text-sm font-bold text-slate-900 mt-6 mb-3">
                    Capabilities
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs text-slate-600 border p-2 rounded-lg">
                      <Database size={14} className="text-blue-500" />
                      <span>
                        Data Scale:{" "}
                        <strong>
                          {selectedNode.x > 600
                            ? "Universal (Foundational)"
                            : "Specialized"}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600 border p-2 rounded-lg">
                      <Cpu size={14} className="text-purple-500" />
                      <span>
                        Inference:{" "}
                        <strong>
                          {selectedNode.category === "Equivariant"
                            ? "High cost / high accuracy"
                            : "Optimized for speed"}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 mt-auto space-y-3">
                <a
                  href={
                    selectedNode.githubUrl ??
                    `https://github.com/search?q=${encodeURIComponent(
                      selectedNode.label + " interatomic potential",
                    )}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-slate-200 active:scale-95"
                >
                  <Github size={18} /> View Code / GitHub
                </a>

                <a
                  href={
                    selectedNode.paperUrl ??
                    `https://scholar.google.com/scholar?q=${encodeURIComponent(
                      selectedNode.label,
                    )}`
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
          )}
        </div>
      </div>
    </div>
  );
}
