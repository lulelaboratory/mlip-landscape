// src/data/mlip.ts

export type Category = "Equivariant" | "Invariant" | "Transformer" | "Descriptor";
export type NodeType = "node" | "group";

export interface BaseNode {
  id: string;
  type: NodeType;
}

export interface GroupNode extends BaseNode {
  type: "group";
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ModelNode extends BaseNode {
  type: "node";
  category: Category;
  label: string;
  year: number;
  author: string;
  x: number;
  y: number;
  desc: string;
  isNew?: boolean;
  dimmed?: boolean;
  githubUrl?: string;
  paperUrl?: string;
}

export type AnyNode = GroupNode | ModelNode;

export interface Edge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

export const INITIAL_NODES: AnyNode[] = [
  // --- ZONES (Background Groups) ---
  // 2 big bands so lanes stay visually clean
  {
    id: "zone_eq",
    type: "group",
    label: "Equivariant & Transformers (Accuracy / Foundations)",
    x: 50,
    y: 50,
    width: 1380,
    height: 400,
  },
  {
    id: "zone_inv",
    type: "group",
    label: "Invariant & Descriptors (Speed / Scale)",
    x: 50,
    y: 480,
    width: 1100,
    height: 500,
  },

  // ---------------------------------------------------------------------------
  // LANE 1: EQUIVARIANT & FOUNDATION MODELS  (Top band, y ≈ 150–320)
  // ---------------------------------------------------------------------------

  {
    id: "nequip",
    type: "node",
    category: "Equivariant",
    label: "NequIP",
    year: 2021,
    author: "Harvard (Kozinsky lab)",
    x: 100,
    y: 150,
    desc:
      "E(3)-equivariant message-passing potential that set the template for data-efficient, high-accuracy force fields across molecules and materials.",
    githubUrl: "https://github.com/mir-group/nequip",
    paperUrl: "https://arxiv.org/abs/2101.03164",
  },
  {
    id: "allegro",
    type: "node",
    category: "Equivariant",
    label: "Allegro",
    year: 2023,
    author: "Harvard (Kozinsky lab)",
    x: 100,
    y: 320, // vertical drop from NequIP
    desc:
      "Strictly local equivariant architecture designed for massive parallel MD (100M+ atoms) while retaining NequIP-level accuracy.",
    githubUrl: "https://github.com/mir-group/allegro",
    paperUrl: "https://www.nature.com/articles/s41467-023-36329-y",
  },
  {
    id: "eqv2",
    type: "node",
    category: "Transformer",
    label: "Equiformer V2",
    year: 2024,
    author: "Meta FAIR / MIT",
    x: 380,
    y: 150,
    desc:
      "Improved equivariant transformer with higher-degree tensor representations; achieves state-of-the-art OC20/OC22 performance with strong data-efficiency.",
    githubUrl: "https://github.com/atomicarchitects/equiformer_v2",
    paperUrl: "https://openreview.net/forum?id=f75b873e67d",
  },
  {
    id: "mace",
    type: "node",
    category: "Equivariant",
    label: "MACE",
    year: 2022,
    author: "Cambridge / Csányi group",
    x: 660,
    y: 150,
    desc:
      "Higher-order equivariant message passing (4-body messages) that reaches or surpasses SOTA accuracy with only 1–2 layers and powers universal MACE-MP models.",
    githubUrl: "https://github.com/ACEsuit/mace",
    paperUrl: "https://arxiv.org/abs/2206.07697",
  },
  {
    id: "grace",
    type: "node",
    category: "Equivariant",
    label: "GRACE",
    year: 2024,
    author: "ICAMS",
    x: 660,
    y: 320,
    desc:
      "Graph Atomic Cluster Expansion: a foundation-scale implementation of ACE with explicit multi-body basis functions for wide-coverage materials modelling.",
    githubUrl: "https://github.com/ICAMS/grace",
  },
  {
    id: "orb",
    type: "node",
    category: "Transformer",
    label: "Orb-v3",
    year: 2025,
    author: "Orbital Materials",
    x: 950,
    y: 150,
    desc:
      "Wide & shallow graph neural simulator with smoothed attention, heavily optimized for torch.compile and extreme throughput on large periodic systems.",
    githubUrl: "https://github.com/orbital-materials/orb-models",
  },
  {
    id: "orbmol",
    type: "node",
    category: "Transformer",
    label: "OrbMol",
    year: 2025,
    author: "Orbital Materials",
    x: 950,
    y: 320,
    desc:
      "Orb-v3 variant for molecules, electrolytes and biomolecules with explicit charge/spin channels and chemistry-aware output heads.",
    githubUrl: "https://github.com/orbital-materials/orb-models",
  },
  {
    id: "esen",
    type: "node",
    category: "Equivariant",
    label: "eSEN",
    year: 2025,
    author: "Meta FAIR",
    x: 1230,
    y: 150,
    desc:
      "Equivariant Smooth Energy Network: conservative-force equivariant GNN with a smooth potential energy surface designed for stable long-horizon MD. Serves as the backbone underneath Meta's UMA foundation model.",
    githubUrl: "https://github.com/facebookresearch/fairchem",
    paperUrl: "https://arxiv.org/abs/2502.12147",
  },
  {
    id: "uma",
    type: "node",
    category: "Transformer",
    label: "UMA",
    year: 2025,
    author: "Meta FAIR",
    x: 1230,
    y: 320,
    desc:
      "Universal Model for Atoms: a Mixture of Linear Experts (MoLE) foundation model built on the eSEN backbone, trained on ~500M structures spanning OC20, ODAC23, OMat24, OMC25, and OMol25. NeurIPS 2025 spotlight.",
    githubUrl: "https://github.com/facebookresearch/fairchem",
    paperUrl: "https://arxiv.org/abs/2506.23971",
  },

  // ---------------------------------------------------------------------------
  // LANE 2: DESCRIPTORS & INDUSTRIAL WORKHORSES  (Middle band, y ≈ 550)
  // ---------------------------------------------------------------------------

  {
    id: "gap",
    type: "node",
    category: "Descriptor",
    label: "GAP / SNAP",
    year: 2010,
    author: "Cambridge / Sandia",
    x: 100,
    y: 550,
    desc:
      "Gaussian Approximation Potentials and SNAP: kernel and descriptor-based MLIPs with rigorous many-body expansions, accurate but relatively expensive.",
    githubUrl: "https://github.com/libAtoms/QUIP",
  },
  {
    id: "deepmd",
    type: "node",
    category: "Descriptor",
    label: "DeepMD",
    year: 2018,
    author: "DeepModeling",
    x: 380,
    y: 550, // horizontal from GAP
    desc:
      "Deep Potential Molecular Dynamics: local frame descriptors + deep networks giving ab-initio-level accuracy with linear scaling, widely used for large MD.",
    githubUrl: "https://github.com/deepmodeling/deepmd-kit",
    paperUrl: "https://doi.org/10.1016/j.cpc.2018.02.017",
  },
  {
    id: "dpa2",
    type: "node",
    category: "Descriptor",
    label: "DPA-2",
    year: 2024,
    author: "DeepModeling",
    x: 660,
    y: 550, // horizontal from DeepMD
    desc:
      "Second-generation Deep Potential architecture with attention and multi-task heads, targeting a universal deep potential for diverse chemistries.",
    githubUrl: "https://github.com/deepmodeling/deepmd-kit",
  },
  {
    id: "mattersim",
    type: "node",
    category: "Transformer",
    label: "MatterSim",
    year: 2024,
    author: "Microsoft",
    x: 950,
    y: 550,
    desc:
      "Large-scale foundation model trained on millions of ab-initio trajectories, designed as a reusable simulator for materials discovery workflows.",
    githubUrl: "https://github.com/microsoft/mattersim",
  },

  // ---------------------------------------------------------------------------
  // LANE 3: INVARIANT GNNS & MODERN SPEED-ORIENTED MODELS (Bottom band)
  // ---------------------------------------------------------------------------

  {
    id: "ani",
    type: "node",
    category: "Descriptor",
    label: "ANI-2x",
    year: 2019,
    author: "Isayev / Roitberg",
    x: 100,
    y: 750,
    desc:
      "Accurate NeurAl networK engINe potential for organic molecules (C,H,N,O,S,F,Cl); widely used in drug discovery for fast geometry and energy scans.",
    githubUrl: "https://github.com/aiqm/torchani",
    paperUrl: "https://arxiv.org/abs/1909.08565",
  },
  {
    id: "schnet",
    type: "node",
    category: "Invariant",
    label: "SchNet",
    year: 2017,
    author: "Schütt et al.",
    x: 380,
    y: 750,
    desc:
      "Continuous-filter convolutional network that introduced smooth, translation-invariant filters for molecules and crystals; the baseline for many later GNN MLIPs.",
    githubUrl: "https://github.com/atomistic-machine-learning/schnetpack",
    paperUrl: "https://arxiv.org/abs/1706.08566",
  },
  {
    id: "dimenet",
    type: "node",
    category: "Invariant",
    label: "DimeNet++",
    year: 2020,
    author: "Gasteiger et al.",
    x: 660,
    y: 750,
    desc:
      "Directional message passing network with spherical basis functions that explicitly encode bond angles, improving data efficiency over SchNet-style models.",
    githubUrl: "https://github.com/gasteigerjo/dimenet",
    paperUrl: "https://arxiv.org/abs/2011.14115",
  },
  {
    id: "gemnet",
    type: "node",
    category: "Equivariant",
    label: "GemNet-OC",
    year: 2021,
    author: "TUM / OC20",
    x: 950,
    y: 750,
    desc:
      "High-capacity spherical message-passing architecture used in the OC20/OC22 benchmarks; very strong for catalyst adsorption and surface chemistry.",
    githubUrl: "https://github.com/OpenCatalystProject/ocp",
  },

  // Sub-lane for derived or speed-optimized architectures

  {
    id: "painn",
    type: "node",
    category: "Equivariant",
    label: "PaiNN",
    year: 2021,
    author: "Schütt et al.",
    x: 380,
    y: 900,
    desc:
      "Polarizable Atom Interaction Neural Network: uses coupled scalar/vector features to capture forces and dipoles with E(3) equivariance at lower cost than full tensors.",
    githubUrl: "https://github.com/atomistic-machine-learning/schnetpack",
    paperUrl: "https://arxiv.org/abs/2102.03150",
  },
  {
    id: "sevennet",
    type: "node",
    category: "Invariant",
    label: "SevenNet",
    year: 2024,
    author: "Seoul Nat. Univ.",
    x: 660,
    y: 900,
    desc:
      "Speed-optimized invariant network inspired by NequIP-style features, designed for very large simulations where throughput is more critical than strict equivariance.",
    githubUrl: "https://github.com/MDIL-SNU/SevenNet",
  },

  {
    id: "alignn",
    type: "node",
    category: "Invariant",
    label: "ALIGNN",
    year: 2021,
    author: "NIST",
    x: 660,
    y: 650,
    desc:
      "Atomistic Line Graph Neural Network: augments the atomic graph with a line graph so bond angles and higher-order interactions are encoded explicitly.",
    githubUrl: "https://github.com/usnistgov/alignn",
    paperUrl: "https://arxiv.org/abs/2102.05013",
  },
  {
    id: "m3gnet",
    type: "node",
    category: "Invariant",
    label: "M3GNet",
    year: 2022,
    author: "Materials Virtual Lab",
    x: 950,
    y: 650,
    desc:
      "Materials Graph Network with 3-body interactions; trained on Materials Project relaxations to give a universal potential over most of the periodic table.",
    githubUrl: "https://github.com/materialsvirtuallab/m3gnet",
    paperUrl: "https://arxiv.org/abs/2202.02450",
  },
  {
    id: "chgnet",
    type: "node",
    category: "Invariant",
    label: "CHGNet",
    year: 2023,
    author: "Berkeley (Ceder group)",
    x: 950,
    y: 900,
    desc:
      "Charge-aware graph neural network that extends M3GNet with oxidation state and local charge features; particularly strong for battery and redox-active materials.",
    githubUrl: "https://github.com/CederGroupHub/chgnet",
    paperUrl: "https://arxiv.org/abs/2210.13995",
  },
];

export const INITIAL_EDGES: Edge[] = [
  // Lane 1 (Equivariant + Transformers)
  { from: "nequip", to: "allegro", label: "Locality" },
  { from: "nequip", to: "mace", label: "Higher Order" },
  { from: "nequip", to: "eqv2", label: "Attention" },
  { from: "mace", to: "grace", label: "Scale" },
  { from: "eqv2", to: "orb", label: "Simplify", dashed: true },
  { from: "orb", to: "orbmol", label: "+State" },
  { from: "eqv2", to: "esen", label: "Smooth PES" },
  { from: "esen", to: "uma", label: "Backbone" },
  { from: "uma", to: "mattersim", label: "Foundation", dashed: true },

  // Lane 2 (Descriptors) – keep edges purely horizontal to avoid messy crossings
  { from: "gap", to: "deepmd", label: "Neural Nets" },
  { from: "deepmd", to: "dpa2", label: "Universal Data" },

  // Lane 3 (Invariant GNNs) – also horizontal
  { from: "ani", to: "schnet", label: "Graph Concept" },
  { from: "schnet", to: "dimenet", label: "+Angles" },

  // Inter-lane links kept minimal so the wiring stays readable
  { from: "dimenet", to: "gemnet", label: "Spherical" }, // invariant → equivariant
  { from: "dimenet", to: "alignn", label: "Line Graph" }, // bottom row → mid-row
  { from: "painn", to: "sevennet", label: "Speed Opt" },

  // Foundation-scale invariant link
  { from: "m3gnet", to: "chgnet", label: "+Charge" },

  // Foundation transformer link
  { from: "orb", to: "mattersim", label: "Scale", dashed: true },
];
