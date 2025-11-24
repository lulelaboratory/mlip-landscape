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
  // Adjusted to fit the "Lane" layout
  {
    id: "zone_eq",
    type: "group",
    label: "Equivariant & Transformers (Accuracy)",
    x: 50,
    y: 50,
    width: 1100,
    height: 400,
  },
  {
    id: "zone_inv",
    type: "group",
    label: "Invariant & Descriptors (Speed)",
    x: 50,
    y: 480,
    width: 1100,
    height: 500,
  },

  // --- LANE 1: EQUIVARIANT & FOUNDATION (Top Row, y=150-350) ---
  {
    id: "nequip",
    type: "node",
    category: "Equivariant",
    label: "NequIP",
    year: 2021,
    author: "Harvard",
    x: 100,
    y: 150,
    desc: "E(3) equivariant tensor products.",
    githubUrl: "https://github.com/mir-group/nequip",
  },
  {
    id: "allegro",
    type: "node",
    category: "Equivariant",
    label: "Allegro",
    year: 2022,
    author: "Harvard",
    x: 100,
    y: 320, // Vertical drop from NequIP
    desc: "Strictly local NequIP.",
    githubUrl: "https://github.com/mir-group/allegro",
  },
  {
    id: "eqv2",
    type: "node",
    category: "Transformer",
    label: "Equiformer V2",
    year: 2023,
    author: "Meta FAIR",
    x: 380,
    y: 150, // Horizontal from NequIP
    desc: "Transformer + equivariance.",
    githubUrl: "https://github.com/FAIR-Chem/fairchem",
  },
  {
    id: "mace",
    type: "node",
    category: "Equivariant",
    label: "MACE",
    year: 2022,
    author: "Cambridge",
    x: 660,
    y: 150, // Horizontal from EqV2/NequIP
    desc: "Higher order equivariance (ACE).",
    githubUrl: "https://github.com/ACEsuit/mace",
  },
  {
    id: "grace",
    type: "node",
    category: "Equivariant",
    label: "GRACE",
    year: 2024,
    author: "ICAMS",
    x: 660,
    y: 320, // Vertical drop from MACE
    desc: "Foundation-scale ACE.",
    githubUrl: "https://github.com/ICAMS/grace",
  },
  {
    id: "orb",
    type: "node",
    category: "Transformer",
    label: "Orb-v3",
    year: 2025,
    author: "Orbital",
    x: 950,
    y: 150,
    desc: "Massive throughput GNS.",
    githubUrl: "https://github.com/orbital-materials/orb-models",
  },
  {
    id: "orbmol",
    type: "node",
    category: "Transformer",
    label: "OrbMol",
    year: 2025,
    author: "Orbital",
    x: 950,
    y: 320,
    desc: "Orb-v3 for molecules.",
    githubUrl: "https://github.com/orbital-materials/orb-models",
  },

  // --- LANE 2: DESCRIPTORS (Middle Row, y=550) ---
  // SOLVES GAP -> DEEPMD OVERLAP
  {
    id: "gap",
    type: "node",
    category: "Descriptor",
    label: "GAP / SNAP",
    year: 2010,
    author: "Cambridge",
    x: 100,
    y: 550,
    desc: "Gaussian Approximation Potential.",
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
    y: 550, // DIRECT HORIZONTAL LINE from GAP (100, 550) -> (380, 550)
    desc: "Local frames + Neural Net.",
    githubUrl: "https://github.com/deepmodeling/deepmd-kit",
  },
  {
    id: "dpa2",
    type: "node",
    category: "Descriptor",
    label: "DPA-2",
    year: 2024,
    author: "DeepModeling",
    x: 660,
    y: 550, // DIRECT HORIZONTAL LINE from DeepMD
    desc: "Universal Large Atomic Model.",
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
    desc: "Foundation model.",
    githubUrl: "https://github.com/microsoft/mattersim",
  },

  // --- LANE 3: INVARIANT GNNs (Bottom Row, y=750-900) ---
  {
    id: "ani",
    type: "node",
    category: "Descriptor",
    label: "ANI-2x",
    year: 2019,
    author: "Isayev",
    x: 100,
    y: 750,
    desc: "Neural network + AEV.",
    githubUrl: "https://github.com/aiqm/torchani",
  },
  {
    id: "schnet",
    type: "node",
    category: "Invariant",
    label: "SchNet",
    year: 2017,
    author: "Schütt",
    x: 380,
    y: 750, // DIRECT HORIZONTAL LINE from ANI (100, 750) -> (380, 750)
    desc: "Continuous filters.",
    githubUrl: "https://github.com/atomistic-machine-learning/schnetpack",
  },
  {
    id: "dimenet",
    type: "node",
    category: "Invariant",
    label: "DimeNet++",
    year: 2020,
    author: "Gasteiger",
    x: 660,
    y: 750, // DIRECT HORIZONTAL LINE from SchNet
    desc: "Directional messages.",
    githubUrl: "https://github.com/gasteigerjo/dimenet",
  },
  {
    id: "gemnet",
    type: "node",
    category: "Equivariant",
    label: "GemNet",
    year: 2021,
    author: "TUM",
    x: 950,
    y: 750, // Horizontal from DimeNet
    desc: "Spherical messages.",
    githubUrl: "https://github.com/OpenCatalystProject/ocp",
  },
  // Sub-row for derived invariants
  {
    id: "painn",
    type: "node",
    category: "Equivariant",
    label: "PaiNN",
    year: 2021,
    author: "Schütt",
    x: 380,
    y: 900, // Below SchNet
    desc: "Polarizable Atom Interaction.",
    githubUrl: "https://github.com/atomistic-machine-learning/schnetpack",
  },
  {
    id: "sevennet",
    type: "node",
    category: "Invariant",
    label: "SevenNet",
    year: 2024,
    author: "SNU",
    x: 660,
    y: 900, // Horizontal from PaiNN
    desc: "Fast invariant architecture.",
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
    y: 650, // Floating slightly above Dimnet to connect nicely
    desc: "Line graph NN.",
    githubUrl: "https://github.com/usnistgov/alignn",
  },
  {
    id: "m3gnet",
    type: "node",
    category: "Invariant",
    label: "M3GNet",
    year: 2022,
    author: "MatVirtual",
    x: 950,
    y: 650,
    desc: "Matbench baseline.",
    githubUrl: "https://github.com/materialsvirtuallab/m3gnet",
  },
  {
    id: "chgnet",
    type: "node",
    category: "Invariant",
    label: "CHGNet",
    year: 2023,
    author: "Berkeley",
    x: 950,
    y: 900,
    desc: "Charge transfer GNN.",
    githubUrl: "https://github.com/CederGroupHub/chgnet",
  },
];

export const INITIAL_EDGES: Edge[] = [
  // Lane 1 (Top)
  { from: "nequip", to: "allegro", label: "Locality" },
  { from: "nequip", to: "mace", label: "Higher Order" },
  { from: "nequip", to: "eqv2", label: "Attention" },
  { from: "mace", to: "grace", label: "Scale" },
  { from: "eqv2", to: "orb", label: "Simplify", dashed: true },
  { from: "orb", to: "orbmol", label: "+State" },

  // Lane 2 (Middle - Descriptors) - PURE HORIZONTAL
  { from: "gap", to: "deepmd", label: "Neural Nets" },
  { from: "deepmd", to: "dpa2", label: "Universal Data" },

  // Lane 3 (Bottom - Invariants) - PURE HORIZONTAL
  { from: "ani", to: "schnet", label: "Graph Concept" },
  { from: "schnet", to: "dimenet", label: "+Angles" },

  // Inter-lane Verticals
  { from: "dimenet", to: "gemnet", label: "Spherical" }, // 660 -> 950 (Horizontal step)
  { from: "dimenet", to: "alignn", label: "Line Graph" }, // 660, 750 -> 660, 650 (Vertical Up)
  { from: "painn", to: "sevennet", label: "Speed Opt" }, // 380, 900 -> 660, 900 (Horizontal)

  // Complex Crossings (Cleaned)
  { from: "m3gnet", to: "chgnet", label: "+Charge" },

  // Misc
  { from: "orb", to: "mattersim", label: "Scale", dashed: true },
];
