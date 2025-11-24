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
  {
    id: "zone_1",
    type: "group",
    label: "Zone 1: Classics & Descriptors",
    x: 50,
    y: 600,
    width: 550,
    height: 400,
  },
  {
    id: "zone_2",
    type: "group",
    label: "Zone 2: Equivariant Frontier",
    x: 50,
    y: 50,
    width: 550,
    height: 500,
  },
  {
    id: "zone_3",
    type: "group",
    label: "Zone 3: Universal Foundation Models",
    x: 650,
    y: 50,
    width: 550,
    height: 950,
  },

  // --- EQUIVARIANT (Red) ---
  {
    id: "nequip",
    type: "node",
    category: "Equivariant",
    label: "NequIP",
    year: 2021,
    author: "Harvard (Kozinsky)",
    x: 100,
    y: 150,
    desc: "The pioneer of E(3) equivariant tensor products. Extremely accurate but computationally expensive.",
    githubUrl: "https://github.com/mir-group/nequip",
  },
  {
    id: "allegro",
    type: "node",
    category: "Equivariant",
    label: "Allegro",
    year: 2022,
    author: "Harvard (Kozinsky)",
    x: 100,
    y: 300,
    desc: "Strictly local version of NequIP. Allows for massive parallelism by removing global message passing.",
    githubUrl: "https://github.com/mir-group/allegro",
  },
  {
    id: "gemnet",
    type: "node",
    category: "Equivariant",
    label: "GemNet",
    year: 2021,
    author: "TUM (Gasteiger)",
    x: 300,
    y: 300,
    desc: "Uses spherical messages for geometric efficiency. Bridges the gap between invariant and equivariant.",
    githubUrl: "https://github.com/OpenCatalystProject/ocp",
  },
  {
    id: "painn",
    type: "node",
    category: "Equivariant",
    label: "PaiNN",
    year: 2021,
    author: "Schütt et al.",
    x: 300,
    y: 450,
    desc: "Polarizable Atom Interaction NN. Uses vector features instead of full tensor products for speed.",
    githubUrl: "https://github.com/atomistic-machine-learning/schnetpack",
  },
  {
    id: "mace",
    type: "node",
    category: "Equivariant",
    label: "MACE",
    year: 2022,
    author: "Cambridge (Batatia)",
    x: 700,
    y: 150,
    desc: "Higher order equivariance (ACE). Uses 4-body messages to reduce layer count drastically.",
    githubUrl: "https://github.com/ACEsuit/mace",
  },
  {
    id: "grace",
    type: "node",
    category: "Equivariant",
    label: "GRACE",
    year: 2024,
    author: "ICAMS",
    x: 700,
    y: 350,
    desc: "Graph Atomic Cluster Expansion. A foundation-scale implementation of the ACE formalism.",
    githubUrl: "https://github.com/ICAMS/grace",
  },

  // --- TRANSFORMER (Green) ---
  {
    id: "eqv2",
    type: "node",
    category: "Transformer",
    label: "Equiformer V2",
    year: 2023,
    author: "Meta FAIR (Liao)",
    x: 400,
    y: 150,
    desc: "Transformer + equivariance. SOTA accuracy on OC20 benchmarks.",
    githubUrl: "https://github.com/FAIR-Chem/fairchem",
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
    desc: "Wide & shallow GNS. Smoothed attention. Optimized for torch.compile and massive throughput.",
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
    y: 300,
    desc: "Specialized Orb-v3 variant for molecules, electrolytes, and proteins. Adds charge/spin state.",
    githubUrl: "https://github.com/orbital-materials/orb-models",
  },
  {
    id: "mattersim",
    type: "node",
    category: "Transformer",
    label: "MatterSim",
    year: 2024,
    author: "Microsoft",
    x: 950,
    y: 450,
    desc: "Massive-scale foundation model trained on millions of trajectories.",
    githubUrl: "https://github.com/microsoft/mattersim",
  },
  {
    id: "gnome",
    type: "node",
    category: "Transformer",
    label: "GNoME",
    year: 2023,
    author: "Google DeepMind",
    x: 950,
    y: 600,
    desc: "Discovery model used to identify millions of new crystals. Proprietary architecture.",
    githubUrl: "https://github.com/google-deepmind/materials_discovery",
  },
  {
    id: "jmp",
    type: "node",
    category: "Transformer",
    label: "JMP",
    year: 2024,
    author: "Meta FAIR",
    x: 950,
    y: 750,
    desc: "JAX-MD foundation model. Designed for large-scale differentiable physics.",
    githubUrl: "https://github.com/facebookresearch/JMP",
  },

  // --- INVARIANT (Blue) ---
  {
    id: "schnet",
    type: "node",
    category: "Invariant",
    label: "SchNet",
    year: 2017,
    author: "Schütt et al.",
    x: 100,
    y: 800,
    desc: "Continuous filter convolution. The baseline for modern GNNs.",
    githubUrl: "https://github.com/atomistic-machine-learning/schnetpack",
  },
  {
    id: "dimenet",
    type: "node",
    category: "Invariant",
    label: "DimeNet++",
    year: 2020,
    author: "Gasteiger et al.",
    x: 300,
    y: 800,
    desc: "Directional message passing. Introduced explicit angular information to GNNs.",
    githubUrl: "https://github.com/gasteigerjo/dimenet",
  },
  {
    id: "alignn",
    type: "node",
    category: "Invariant",
    label: "ALIGNN",
    year: 2021,
    author: "NIST",
    x: 500,
    y: 800,
    desc: "Atomistic line graph NN. Captures bond angles explicitly via line-graph construction.",
    githubUrl: "https://github.com/usnistgov/alignn",
  },
  {
    id: "chgnet",
    type: "node",
    category: "Invariant",
    label: "CHGNet",
    year: 2023,
    author: "Berkeley (Ceder)",
    x: 950,
    y: 900,
    desc: "Charge transfer GNN. Explicitly models oxidation states. Very strong for batteries.",
    githubUrl: "https://github.com/CederGroupHub/chgnet",
  },
  {
    id: "sevennet",
    type: "node",
    category: "Invariant",
    label: "SevenNet",
    year: 2024,
    author: "Seoul Nat. Univ",
    x: 700,
    y: 800,
    desc: "Fast invariant architecture. Stripped-down NequIP-style design for extreme speed.",
    githubUrl: "https://github.com/MDIL-SNU/SevenNet",
  },
  {
    id: "m3gnet",
    type: "node",
    category: "Invariant",
    label: "M3GNet",
    year: 2022,
    author: "MatVirtual",
    x: 700,
    y: 650,
    desc: "The baseline model for Matbench Discovery.",
    githubUrl: "https://github.com/materialsvirtuallab/m3gnet",
  },

  // --- DESCRIPTORS (Orange) ---
  {
    id: "gap",
    type: "node",
    category: "Descriptor",
    label: "GAP / SNAP",
    year: 2010,
    author: "Cambridge / Sandia",
    x: 100,
    y: 650,
    desc: "Gaussian Approximation Potential. Mathematically rigorous but slow.",
    githubUrl: "https://github.com/libAtoms/QUIP",
  },
  {
    id: "ani",
    type: "node",
    category: "Descriptor",
    label: "ANI-2x",
    year: 2019,
    author: "Isayev / Roitberg",
    x: 300,
    y: 650,
    desc: "Neural network + AEV. Standard for organic chemistry and drug discovery.",
    githubUrl: "https://github.com/aiqm/torchani",
  },
  {
    id: "deepmd",
    type: "node",
    category: "Descriptor",
    label: "DeepMD",
    year: 2018,
    author: "DeepModeling",
    x: 500,
    y: 650,
    desc: "Local frames. The industrial standard for large-scale MD.",
    githubUrl: "https://github.com/deepmodeling/deepmd-kit",
  },
  {
    id: "dpa2",
    type: "node",
    category: "Descriptor",
    label: "DPA-2",
    year: 2024,
    author: "DeepModeling",
    x: 700,
    y: 920,
    desc: "Universal DeepMD with attention and multi-task learning.",
    githubUrl: "https://github.com/deepmodeling/deepmd-kit",
  },
];

export const INITIAL_EDGES: Edge[] = [
  { from: "nequip", to: "allegro", label: "Locality" },
  { from: "nequip", to: "mace", label: "Higher Order" },
  { from: "nequip", to: "eqv2", label: "Attention" },
  { from: "schnet", to: "dimenet", label: "+Angles" },
  { from: "dimenet", to: "alignn", label: "Line Graph" },
  { from: "dimenet", to: "gemnet", label: "Spherical" },
  { from: "gap", to: "deepmd", label: "Neural Nets" },
  { from: "deepmd", to: "dpa2", label: "Universal Data" },
  { from: "painn", to: "sevennet", label: "Speed Opt" },
  { from: "mace", to: "grace", label: "Scale" },
  { from: "eqv2", to: "orb", label: "Simplify", dashed: true },
  { from: "m3gnet", to: "chgnet", label: "+Charge" },
  { from: "orb", to: "jmp", label: "Similar Scale", dashed: true },
  { from: "orb", to: "orbmol", label: "+State" },
  { from: "ani", to: "schnet", label: "Graph Concept" },
];
