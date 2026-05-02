// src/data/mlip.ts

export type Category = "Equivariant" | "Invariant" | "Transformer" | "Descriptor";
export type NodeType = "node" | "group";

export type MaintenanceStatus =
  | "active"
  | "maintained"
  | "archived"
  | "experimental";

export type FrameworkTag =
  | "ASE"
  | "LAMMPS"
  | "OpenKIM"
  | "JAX-MD"
  | "PyTorch";

export type PropertyTag =
  | "energy"
  | "forces"
  | "stress"
  | "dipole"
  | "magnetic_moment"
  | "polarizability";

export interface ModelMeta {
  coverage?: string[];
  useCases?: string[];
  properties?: PropertyTag[];
  frameworks?: FrameworkTag[];
  license?: string;
  maintenance?: MaintenanceStatus;
  lastReviewed?: string | "unknown";
  lastUpdated?: string;
  trainingData?: string[];
  tags?: string[];
  // Whether the model can be conditioned on a total/atomic charge. `null`
  // (or an absent value) means the curators have not yet verified this.
  supportsCharges?: boolean | null;
  // Whether the model can be conditioned on spin multiplicity / magnetic
  // moments. `null` (or absent) means unknown.
  supportsSpins?: boolean | null;
  // Free-form description of the elemental coverage. Examples:
  //   "H, C, N, O"           — explicit element list
  //   "all elements up to Z=94" — bulk-coverage shorthand
  //   "—"                    — explicitly recorded as unknown / not applicable
  // For new entries one of: an explicit list, a coverage shorthand, or "—".
  elementsCovered?: string | null;
}

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

export interface ModelNode extends BaseNode, ModelMeta {
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

export const MAINTENANCE_STATUSES: readonly MaintenanceStatus[] = [
  "active",
  "maintained",
  "archived",
  "experimental",
] as const;

export const FRAMEWORK_TAGS: readonly FrameworkTag[] = [
  "ASE",
  "LAMMPS",
  "OpenKIM",
  "JAX-MD",
  "PyTorch",
] as const;

export const PROPERTY_TAGS: readonly PropertyTag[] = [
  "energy",
  "forces",
  "stress",
  "dipole",
  "magnetic_moment",
  "polarizability",
] as const;

export const MODEL_META_FIELDS: readonly (keyof ModelMeta)[] = [
  "coverage",
  "useCases",
  "properties",
  "frameworks",
  "license",
  "maintenance",
  "lastReviewed",
  "lastUpdated",
  "trainingData",
  "tags",
  "supportsCharges",
  "supportsSpins",
  "elementsCovered",
] as const;

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
    width: 3070,
    height: 400,
  },
  {
    id: "zone_inv",
    type: "group",
    label: "Invariant & Descriptors (Speed / Scale)",
    x: 50,
    y: 480,
    width: 1620,
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
    coverage: ["organic molecules", "small-molecule reactions", "materials"],
    useCases: ["data-efficient fitting", "ab-initio MD surrogate"],
    properties: ["energy", "forces", "stress"],
    frameworks: ["ASE", "LAMMPS"],
    license: "MIT",
    maintenance: "maintained",
    lastReviewed: "2026-04-19",
    trainingData: ["custom DFT"],
    tags: ["equivariant", "message-passing", "E(3)"],
    supportsCharges: false,
    supportsSpins: false,
    elementsCovered: "dataset-dependent (general molecules and materials)",
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
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
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
    paperUrl: "https://arxiv.org/abs/2306.12059",
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
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
    coverage: ["general materials", "organic molecules", "oxides"],
    useCases: ["universal MLIP", "MD at scale", "high-throughput screening"],
    properties: ["energy", "forces", "stress"],
    frameworks: ["ASE", "LAMMPS"],
    license: "MIT",
    maintenance: "active",
    lastReviewed: "2026-04-19",
    trainingData: ["MPTrj", "Alexandria"],
    tags: ["equivariant", "higher-order", "foundation model"],
    supportsCharges: false,
    supportsSpins: false,
    elementsCovered: "all elements covered by MPTrj / Alexandria (~89 elements)",
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
    githubUrl: "https://github.com/ICAMS/grace-tensorpotential",
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
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
    coverage: ["general materials", "periodic crystals"],
    useCases: ["large-cell MD", "high-throughput screening"],
    properties: ["energy", "forces", "stress"],
    frameworks: ["ASE"],
    license: "Apache-2.0",
    maintenance: "active",
    lastReviewed: "2026-04-19",
    trainingData: ["MPTrj", "Alexandria"],
    tags: ["transformer", "throughput", "torch.compile"],
    supportsCharges: false,
    supportsSpins: false,
    elementsCovered: "all elements covered by MPTrj / Alexandria (~89 elements)",
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
      "Orb-v3 variant for molecules, electrolytes, metal complexes, and biomolecules, trained on the ~100M-structure OMol25 dataset with explicit total-charge and spin-multiplicity conditioning.",
    githubUrl: "https://huggingface.co/Orbital-Materials/OrbMol",
    paperUrl: "https://www.orbitalindustries.com/posts/orbmol-extending-orb-to-molecular-systems",
    supportsCharges: true,
    supportsSpins: true,
    elementsCovered: "elements present in OMol25 (organic + electrolyte + metal-complex chemistry)",
  },
  {
    id: "tfn",
    type: "node",
    category: "Equivariant",
    label: "Tensor Field Networks",
    year: 2018,
    author: "Thomas et al.",
    x: 380,
    y: 320,
    desc:
      "First E(3)-equivariant convolutional architecture for point clouds, introducing spherical-harmonic tensor products that underlie nearly all modern equivariant MLIPs (NequIP, MACE, Equiformer).",
    githubUrl: "https://github.com/tensorfieldnetworks/tensorfieldnetworks",
    paperUrl: "https://arxiv.org/abs/1802.08219",
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
  },
  {
    id: "se3t",
    type: "node",
    category: "Transformer",
    label: "SE(3)-Transformer",
    year: 2020,
    author: "Fuchs et al.",
    x: 1510,
    y: 150,
    desc:
      "Self-attention generalized to SE(3)-equivariant inputs via tensor field attention; an early blueprint for equivariant transformer architectures like Equiformer.",
    githubUrl: "https://github.com/FabianFuchsML/se3-transformer-public",
    paperUrl: "https://arxiv.org/abs/2006.10503",
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
  },
  {
    id: "jmp",
    type: "node",
    category: "Transformer",
    label: "JMP",
    year: 2024,
    author: "Shoghi et al. (CMU / Meta)",
    x: 1510,
    y: 320,
    desc:
      "Joint Multi-task Pretraining: trains one backbone simultaneously on OC20, OC22, ANI-1x and Transition-1x, demonstrating that multi-dataset pretraining yields strong transferable potentials — a precursor to UMA-style universal models.",
    githubUrl: "https://github.com/facebookresearch/JMP",
    paperUrl: "https://arxiv.org/abs/2310.16802",
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
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
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
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
    githubUrl: "https://huggingface.co/facebook/UMA",
    paperUrl: "https://arxiv.org/abs/2506.23971",
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
  },
  {
    id: "nequix",
    type: "node",
    category: "Equivariant",
    label: "Nequix",
    year: 2025,
    author: "Koker & Smidt (MIT Atomic Architects)",
    x: 1790,
    y: 150,
    desc:
      "Compact E(3)-equivariant foundation potential that pairs a simplified NequIP design with equivariant RMS layer normalization and the Muon optimizer, reaching near-SOTA accuracy on a <125 GPU-hour training budget.",
    githubUrl: "https://github.com/atomicarchitects/nequix",
    paperUrl: "https://arxiv.org/abs/2508.16067",
    isNew: true,
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
  },
  {
    id: "petmad",
    type: "node",
    category: "Transformer",
    label: "PET-MAD",
    year: 2025,
    author: "EPFL (Ceriotti lab)",
    x: 1790,
    y: 320,
    desc:
      "Lightweight universal transformer-GNN potential (Point-Edge Transformer) trained on the Massive Atomistic Diversity (MAD) dataset of ~96k structures across 85 elements; competitive with larger uMLIPs for solids, surfaces, and molecules.",
    githubUrl: "https://github.com/lab-cosmo/pet-mad",
    paperUrl: "https://arxiv.org/abs/2503.14118",
    isNew: true,
    supportsCharges: false,
    supportsSpins: false,
    elementsCovered: "85 elements",
  },
  {
    id: "eqv3",
    type: "node",
    category: "Transformer",
    label: "Equiformer V3",
    year: 2026,
    author: "Liao et al. (MIT Atomic Architects)",
    x: 2060,
    y: 320,
    desc:
      "Third-generation SE(3)-equivariant graph attention transformer with improved efficiency, expressivity, and generality; achieves the strongest results within the Equiformer family on OC20 S2EF-2M, MPtrj, OMat24, sAlex, and Matbench-Discovery.",
    githubUrl: "https://github.com/atomicarchitects/equiformer_v3",
    paperUrl: "https://arxiv.org/abs/2604.09130",
    isNew: true,
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "all elements covered by MPtrj / OMat24 (~89 elements)",
  },
  {
    id: "mace_polar1",
    type: "node",
    category: "Equivariant",
    label: "MACE-POLAR-1",
    year: 2026,
    author: "ACEsuit (Kovacs, Batatia, Csanyi et al.)",
    x: 2060,
    y: 150,
    desc:
      "Polarisable electrostatic foundation model that augments MACE with a non-self-consistent polarisable field formalism, learning atomic charge and spin densities (Gaussian-type multipoles) directly from energies/forces; global charge/spin constraints are enforced via learnable Fukui equilibration functions. Trained on OMol25 (~100M structures at ωB97M-V), released in M (12 A) and L (18 A) receptive-field variants for molecular chemistry and non-covalent interactions.",
    githubUrl: "https://github.com/ACEsuit/mace-foundations",
    paperUrl: "https://arxiv.org/abs/2602.19411",
    isNew: true,
    supportsCharges: true,
    supportsSpins: true,
    elementsCovered: "elements present in OMol25 (molecular chemistry / non-covalent interactions)",
  },
  {
    id: "mace_osaka26",
    type: "node",
    category: "Equivariant",
    label: "MACE-Osaka26",
    year: 2026,
    author: "Kuroda, Ishihara, Shiota, Mizukami (Osaka Univ. / QIQB)",
    x: 2340,
    y: 150,
    desc:
      "Multi-domain universal MACE-architecture potential extending the MACE-Osaka series to 97 elements — the broadest elemental coverage to date — by integrating MACE-Osaka24's inorganic + organic data with the newly constructed HE26 heavy-element dataset of minor actinides assembled from experimental and computational literature. Targets nuclear and actinide chemistry while retaining strong performance on the inorganic MPtrj and organic OFF23 test sets.",
    githubUrl: "https://github.com/qiqb-osaka/mace-osaka26",
    paperUrl: "https://arxiv.org/abs/2603.03223",
    isNew: true,
    properties: ["energy", "forces", "stress"],
    frameworks: ["ASE", "LAMMPS"],
    trainingData: ["MACE-Osaka24", "HE26", "MPtrj", "OFF23"],
    tags: ["MACE", "foundation model", "actinides", "nuclear", "97 elements"],
    supportsCharges: false,
    supportsSpins: false,
    elementsCovered: "97 elements (incl. minor actinides)",
  },
  {
    id: "mlanet",
    type: "node",
    category: "Equivariant",
    label: "MLANet",
    year: 2026,
    author: "Hu, Cheng, Bi, Zhao, Sun (Shanghai University)",
    x: 2340,
    y: 320,
    desc:
      "Efficient equivariant graph neural network MLIP that introduces a geometry-aware dual-path dynamic attention mechanism inside its message-passing layers and a physics-informed multi-perspective pooling strategy for global system representations. Demonstrates competitive accuracy with mainstream equivariant models at markedly lower computational cost across organic molecules (QM7, MD17), Li-containing crystals, two-dimensional materials (bilayer graphene, black phosphorus), surface catalytic reactions (formate decomposition), and charged systems, while remaining stable for long-time MD simulations.",
    paperUrl: "https://arxiv.org/abs/2603.22810",
    isNew: true,
    properties: ["energy", "forces"],
    tags: ["equivariant", "dynamic attention", "efficient"],
    supportsCharges: true,
    supportsSpins: false,
    elementsCovered: "—",
  },
  {
    id: "equiewald",
    type: "node",
    category: "Equivariant",
    label: "EquiEwald",
    year: 2026,
    author: "Zhang et al. (Shanghai AI Lab / CUHK)",
    x: 2620,
    y: 150,
    desc:
      "Unified neural interatomic potential that embeds an Ewald-inspired reciprocal-space formulation inside an irreducible SO(3)-equivariant framework. Performs equivariant message passing in reciprocal space via learned equivariant k-space filters and an equivariant inverse transform, capturing anisotropic tensorial long-range correlations without sacrificing physical consistency; consistently improves energy and force accuracy, data efficiency, and long-range extrapolation across periodic systems, supramolecular assemblies, conjugated molecules, charged dimers, and biomolecular dynamics.",
    paperUrl: "https://arxiv.org/abs/2603.18389",
    isNew: true,
    properties: ["energy", "forces"],
    tags: ["SO(3)-equivariant", "long-range", "reciprocal space", "Ewald"],
    supportsCharges: false,
    supportsSpins: false,
    elementsCovered: "—",
  },
  {
    id: "allscaip",
    type: "node",
    category: "Transformer",
    label: "AllScAIP",
    year: 2026,
    author: "Qu, Wood, Krishnapriyan, Ulissi (FAIR / Meta, UC Berkeley, LBNL)",
    x: 2620,
    y: 320,
    desc:
      "Scalable, energy-conserving, attention-based MLIP that pairs local neighborhood self-attention with a global all-to-all node attention layer in which every atom attends to every other atom. The data-driven all-to-all component captures long-range interactions without explicit electrostatic priors and remains the most durable ingredient as data and model size scale to O(100M) training samples. Sits atop the OMol25 leaderboard at release while remaining competitive on OMat24 (materials) and OC20 (catalysts); cuts long-range distance-scaling error by ~90% versus the next-best foundation model, with stable long-timescale MD recovering experimental densities and heats of vaporisation.",
    githubUrl: "https://github.com/facebookresearch/fairchem",
    paperUrl: "https://arxiv.org/abs/2603.06567",
    isNew: true,
    properties: ["energy", "forces"],
    frameworks: ["ASE", "PyTorch"],
    trainingData: ["OMol25", "OMat24", "OC20"],
    tags: ["transformer", "all-to-all attention", "long-range", "foundation model"],
    supportsCharges: true,
    supportsSpins: true,
    elementsCovered: "all elements covered by OMol25 / OMat24 (~89 elements)",
  },
  {
    id: "mace_mag",
    type: "node",
    category: "Equivariant",
    label: "MACE-Magnetic",
    year: 2026,
    author: "Ho, van der Oord, Darby, Csányi, Ortner et al. (Cambridge / UBC / ACEsuit)",
    x: 2900,
    y: 150,
    desc:
      "Equivariant many-body message-passing interatomic potential extending the MACE framework to magnetic materials by embedding atomic magnetic moments as explicit degrees of freedom alongside positions. Learns physically consistent and transferable representations of magnetic behaviour beyond collinear approximations and can incorporate spin-orbit coupling, achieving near density-functional-theory accuracy with strong data efficiency by fine-tuning from a pre-trained foundation model. Targets structural transformations, finite-temperature magnetic phenomena, and high-throughput screening of strongly spin-orbit coupled materials.",
    paperUrl: "https://arxiv.org/abs/2604.08143",
    isNew: true,
    properties: ["energy", "forces"],
    tags: ["equivariant", "MACE", "magnetic moments", "spin-orbit coupling"],
    supportsCharges: false,
    supportsSpins: true,
    elementsCovered: "—",
  },
  {
    id: "allegro_moe",
    type: "node",
    category: "Equivariant",
    label: "Allegro-MoE",
    year: 2026,
    author: "Nascimento, Descoteaux, Zichi, Tan, Witt, Molinari, Mantha, Kitchaev, Kornbluth, Gadelrab, Tuffile, Kozinsky (Harvard / Bosch)",
    x: 2900,
    y: 320,
    desc:
      "Multifidelity Mixture-of-Experts framework built on the strictly local E(3)-equivariant Allegro architecture. Spatially partitions the simulation domain into chemically complex regions (e.g. reactive interfaces) and simple regions (e.g. bulk lattices) and assigns Allegro experts of different capacity to each, enabling expensive high-fidelity inference only where required while a cheaper expert handles the rest of the cell. Demonstrated to retain near-foundation-model accuracy at substantially reduced cost for large-scale MD of heterogeneous systems.",
    paperUrl: "https://arxiv.org/abs/2604.26143",
    isNew: true,
    properties: ["energy", "forces"],
    tags: ["equivariant", "Allegro", "mixture-of-experts", "multifidelity", "spatial partitioning"],
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
  },

  // ---------------------------------------------------------------------------
  // LANE 2: DESCRIPTORS & INDUSTRIAL WORKHORSES  (Middle band, y ≈ 550)
  // ---------------------------------------------------------------------------

  {
    id: "bpnn",
    type: "node",
    category: "Descriptor",
    label: "BPNN",
    year: 2007,
    author: "Behler & Parrinello",
    x: 100,
    y: 650,
    desc:
      "The Behler–Parrinello high-dimensional neural network potential — the 2007 paper that introduced symmetry functions and the atomic-decomposition framework underlying essentially every modern MLIP.",
    githubUrl: "https://github.com/CompPhysVienna/n2p2",
    paperUrl: "https://doi.org/10.1103/PhysRevLett.98.146401",
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
  },
  {
    id: "ace",
    type: "node",
    category: "Descriptor",
    label: "ACE",
    year: 2019,
    author: "Drautz (ICAMS)",
    x: 380,
    y: 650,
    desc:
      "Atomic Cluster Expansion: a complete, systematically improvable many-body basis for the local atomic environment; the mathematical backbone of PACE/GRACE and a strong influence on MACE.",
    githubUrl: "https://github.com/ICAMS/lammps-user-pace",
    paperUrl: "https://arxiv.org/abs/1810.06640",
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
  },
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
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
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
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
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
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
  },
  {
    id: "dpa3",
    type: "node",
    category: "Descriptor",
    label: "DPA-3",
    year: 2025,
    author: "DeepModeling",
    x: 1510,
    y: 550,
    desc:
      "Message-passing graph neural network built on a Line Graph Series (LiGS) that updates bond, angle, and dihedral representations while preserving energy conservation and physical symmetries; designed for Large Atomistic Models with clean scaling in model size, data, and compute. The DPA-3.1-3M variant trained on OpenLAM-v1 tops zero-shot generalization across 12 downstream tasks.",
    githubUrl: "https://github.com/deepmodeling/deepmd-kit",
    paperUrl: "https://arxiv.org/abs/2506.01686",
    isNew: true,
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
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
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
  },
  {
    id: "nep89",
    type: "node",
    category: "Descriptor",
    label: "NEP89",
    year: 2025,
    author: "Chalmers (Fan group) / Liang et al.",
    x: 1230,
    y: 550,
    desc:
      "Universal neuroevolution-potential foundation model spanning 89 elements across inorganic and organic materials, trained via separable natural evolution strategies and distributed in GPUMD for empirical-potential-like speed.",
    githubUrl: "https://github.com/brucefan1983/GPUMD",
    paperUrl: "https://arxiv.org/abs/2504.21286",
    isNew: true,
    supportsCharges: false,
    supportsSpins: false,
    elementsCovered: "89 elements",
  },
  {
    id: "liten",
    type: "node",
    category: "Equivariant",
    label: "LiTEN-FF",
    year: 2026,
    author: "Zhejiang Univ. (Hou lab) / Su et al.",
    x: 1230,
    y: 650,
    desc:
      "Equivariant network with Linearly Tensorized Quadrangle Attention (TQA) that captures 3- and 4-body interactions in linear time; pre-trained on nablaDFT and fine-tuned on SPICE as a quantum-accurate biomolecular force-field foundation model.",
    githubUrl: "https://github.com/lingcon01/LiTEN",
    paperUrl: "https://arxiv.org/abs/2507.00884",
    isNew: true,
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
  },
  {
    id: "matris",
    type: "node",
    category: "Invariant",
    label: "MatRIS",
    year: 2026,
    author: "Zhou et al. (CAS / UCAS)",
    x: 1510,
    y: 650,
    desc:
      "Invariant foundation MLIP using a separable O(N) attention mechanism for three-body interactions; 10M-parameter models trained on OMat24 / MPTrj / sAlex match equivariant SOTA on Matbench-Discovery (F1 0.847) at >13x lower training cost than eSEN-30M-MP.",
    githubUrl: "https://github.com/HPC-AI-Team/MatRIS",
    paperUrl: "https://arxiv.org/abs/2603.02002",
    isNew: true,
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "all elements covered by OMat24 / MPTrj (~89 elements)",
  },
  {
    id: "matris_moe",
    type: "node",
    category: "Invariant",
    label: "MatRIS-MoE",
    year: 2026,
    author: "Zhou et al. (CAS / ICT, HPC-AI-Team)",
    x: 1790,
    y: 650,
    desc:
      "Billion-parameter Mixture-of-Experts extension of MatRIS that inserts sparse expert modules around the self-attention layer — a message-update MoE for message construction and a feature-update MoE for post-attention refinement — with element-type routing that keeps the activated expert set time-independent and the potential energy surface continuous. Released in M (2.47B) and L (11.50B) variants and trained on heterogeneous domains (molecules, materials, catalysis, MOFs, and direct air capture) via the new Janus hybrid-parallel framework, attaining 1.0–1.2 EFLOPS at >90% parallel efficiency and compressing billion-parameter uMLIP training from weeks to hours on Exascale supercomputers.",
    githubUrl: "https://github.com/HPC-AI-Team/MatRIS",
    paperUrl: "https://arxiv.org/abs/2604.15821",
    isNew: true,
    properties: ["energy", "forces", "stress"],
    frameworks: ["PyTorch"],
    trainingData: ["OMat24", "MPTrj", "sAlex", "OMol25", "OC20", "ODAC23"],
    tags: ["invariant", "mixture-of-experts", "billion-parameter", "multi-task", "foundation model"],
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "all elements covered by OMat24 / MPTrj / OMol25 (~89 elements)",
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
    supportsCharges: false,
    supportsSpins: false,
    elementsCovered: "H, C, N, O, S, F, Cl",
  },
  {
    id: "aimnet2",
    type: "node",
    category: "Descriptor",
    label: "AIMNet2",
    year: 2025,
    author: "Anstine, Zubatyuk & Isayev (CMU)",
    x: 1510,
    y: 750,
    desc:
      "Second-generation Atoms-in-Molecules Network potential covering 14 elements (H, B, C, N, O, F, Si, P, S, Cl, As, Se, Br, I) in neutral and charged states; combines ML-parameterised short-range terms with physics-based long-range electrostatics, trained on ~20M hybrid-DFT (wB97M-D3) calculations for routine use as a DFT replacement in organic and elemental-organic chemistry.",
    githubUrl: "https://github.com/isayevlab/aimnetcentral",
    paperUrl: "https://doi.org/10.1039/D4SC08572H",
    isNew: true,
    supportsCharges: true,
    supportsSpins: false,
    elementsCovered: "H, B, C, N, O, F, Si, P, S, Cl, As, Se, Br, I",
  },
  {
    id: "aceff",
    type: "node",
    category: "Equivariant",
    label: "AceFF",
    year: 2026,
    author: "Farr, Doerr, Mirarchi, Sabanés Zariquiey & De Fabritiis (Acellera Labs / UPF Barcelona)",
    x: 2060,
    y: 750,
    desc:
      "Drug-discovery-oriented MLIP built on the TensorNet2 architecture — a refined vector–scalar equivariant TensorNet that adds scalar partial-charge features, performs neutral charge equilibration, and includes a long-range Coulomb energy term. Pretrained on a large dataset of drug-like compounds covering H, B, C, N, O, F, Si, P, S, Cl, Br, I in neutral and charged states; balances DFT-level accuracy on torsion scans, MD trajectories, and batched minimisations with high-throughput inference suitable for FEP and lead-optimisation workflows.",
    githubUrl: "https://huggingface.co/Acellera/AceFF-2.0",
    paperUrl: "https://arxiv.org/abs/2601.00581",
    isNew: true,
    license: "Apache-2.0",
    maintenance: "active",
    properties: ["energy", "forces"],
    frameworks: ["ASE", "PyTorch"],
    tags: ["TensorNet2", "drug discovery", "charge-aware"],
    supportsCharges: true,
    supportsSpins: false,
    elementsCovered: "H, B, C, N, O, F, Si, P, S, Cl, Br, I",
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
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
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
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
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
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
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
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
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
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
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
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
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
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
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
    coverage: ["battery materials", "oxides", "redox-active systems"],
    useCases: ["battery cathode screening", "charge-aware MD"],
    properties: ["energy", "forces", "stress", "magnetic_moment"],
    frameworks: ["ASE"],
    license: "BSD-3-Clause",
    maintenance: "maintained",
    lastReviewed: "2026-04-19",
    trainingData: ["MPTrj"],
    tags: ["invariant", "charge-aware", "foundation model"],
    supportsCharges: true,
    supportsSpins: true,
    elementsCovered: "all elements covered by MPTrj (~89 elements)",
  },

  // ---------------------------------------------------------------------------
  // 2026 ADDITIONS — distilled, multi-fidelity, and r2SCAN foundation models
  // ---------------------------------------------------------------------------

  {
    id: "sevennet_nano",
    type: "node",
    category: "Invariant",
    label: "SevenNet-Nano",
    year: 2026,
    author: "Seoul Nat. Univ. (MDIL-SNU)",
    x: 1230,
    y: 750,
    desc:
      "Lightweight universal MLIP distilled from the SevenNet-Omni teacher, delivering over an order-of-magnitude speedup while retaining broad transferability for scalable atomistic simulations on thousands of atoms.",
    githubUrl: "https://github.com/MDIL-SNU/SevenNet",
    paperUrl: "https://arxiv.org/abs/2604.10887",
    isNew: true,
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
  },
  {
    id: "sevennet_omni",
    type: "node",
    category: "Invariant",
    label: "SevenNet-Omni",
    year: 2026,
    author: "Seoul Nat. Univ. (MDIL-SNU)",
    x: 1230,
    y: 900,
    desc:
      "Multi-fidelity universal foundation MLIP built on the SevenNet-MF backbone and trained on 15 open datasets (~250M structures across molecules, crystals, and surfaces); serves as the teacher model for SevenNet-Nano.",
    githubUrl: "https://github.com/MDIL-SNU/SevenNet",
    paperUrl: "https://www.nature.com/articles/s41467-026-70195-8",
    isNew: true,
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
  },
  {
    id: "pfp_v8",
    type: "node",
    category: "Transformer",
    label: "PFP v8",
    year: 2026,
    author: "Preferred Networks / Matlantis",
    x: 100,
    y: 900,
    desc:
      "Eighth release of the Preferred Potential: the first universal MLIP trained on a large r2SCAN meta-GGA dataset (70 elements) atop a 96-element PBE backbone, halving melting-point error vs. PBE-trained models. Distributed commercially via the Matlantis SaaS platform.",
    paperUrl: "https://arxiv.org/abs/2603.11063",
    isNew: true,
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "all elements up to Z=96 (PBE backbone) / 70 elements (r2SCAN)",
  },
  {
    id: "orion",
    type: "node",
    category: "Descriptor",
    label: "ORION",
    year: 2026,
    author: "Chen et al. (NEP framework)",
    x: 1510,
    y: 900,
    desc:
      "Universal organic force field for C, H, O, N, S, P built within the Neuroevolution Potential (NEP) framework. Trained on a chemically rich dataset assembled through a unified top-down/bottom-up sampling strategy, providing a balanced description of bond breaking/formation, aromatic growth, hydrogen bonding, van der Waals interactions, and π-stacking; reaches near-DFT force accuracy while running ~200x faster than ReaxFF on identical hardware, enabling hundreds-of-nanoseconds reactive MD.",
    githubUrl: "https://github.com/brucefan1983/GPUMD",
    paperUrl: "https://arxiv.org/abs/2604.05769",
    isNew: true,
    supportsCharges: false,
    supportsSpins: false,
    elementsCovered: "C, H, O, N, S, P",
  },
  {
    id: "omni_p2x",
    type: "node",
    category: "Descriptor",
    label: "OMNI-P2x",
    year: 2026,
    author: "Martyka, Tong, Jankowska, Dral (Xiamen University)",
    x: 1790,
    y: 750,
    desc:
      "First universal neural network potential for molecular ground and excited electronic states. An ensemble of MS-ANI-style invariant potentials trained on PubChemQC TD-DFT (B3LYP/6-31+G*) excited-state data combined with CCSD(T)/CBS ground-state energies from ANI-1ccx, with a separate head predicting oscillator strengths of interstate transitions. Approaches TD-DFT accuracy for UV/vis spectra and photodynamics at a fraction of the cost while outperforming semiempirical methods.",
    githubUrl: "https://github.com/dralgroup/omni-p2x",
    paperUrl: "https://www.nature.com/articles/s41467-026-71380-5",
    isNew: true,
    license: "MIT",
    maintenance: "active",
    properties: ["energy", "forces"],
    frameworks: ["ASE"],
    trainingData: ["PubChemQC", "ANI-1ccx"],
    tags: ["excited states", "photodynamics", "ensemble"],
    supportsCharges: false,
    supportsSpins: false,
    elementsCovered: "H, C, N, O, F, S, Cl",
  },
  {
    id: "grace_off",
    type: "node",
    category: "Equivariant",
    label: "GRACE-OFF",
    year: 2026,
    author: "Picha, Karwounopoulos, Erhard, Boresch, Heid (TU Wien / U. Vienna)",
    x: 1790,
    y: 900,
    desc:
      "GRACE-architecture machine-learned interatomic potential specialised for organic liquids. Two-layer GRACE models in small/medium/large sizes are trained on the SPICE v2.0 dataset and integrated with ASE for MD; outperform MACE-OFF on single-molecule benchmarks and reproduce experimental water radial distribution functions and densities across a wide temperature range with substantially higher MD throughput than comparable MACE models.",
    githubUrl: "https://github.com/heid-lab/grace-off",
    paperUrl: "https://chemrxiv.org/doi/full/10.26434/chemrxiv.15001529/v1",
    isNew: true,
    license: "MIT",
    maintenance: "active",
    properties: ["energy", "forces"],
    frameworks: ["ASE"],
    trainingData: ["SPICE v2.0"],
    tags: ["organic liquids", "GRACE", "condensed phase"],
    supportsCharges: false,
    supportsSpins: false,
    elementsCovered: "SPICE v2.0 organic chemistry coverage (H, C, N, O, F, P, S, Cl, Br, I, plus common ions)",
  },
  {
    id: "omnimol",
    type: "node",
    category: "Transformer",
    label: "OmniMol",
    year: 2026,
    author: "Elsharkawy, Mikuni, Bhimji, Nachman (LBNL / NERSC)",
    x: 2060,
    y: 900,
    desc:
      "Transformer-based small-molecule MLIP that adapts the Omnilearned Point-Edge-Transformer (PET) foundation model — pre-trained on ~1 billion LHC particle jets — to molecular dynamics via cross-domain transfer learning. Uses an interaction-matrix attention bias to inject pairwise atomic physics into transformer attention; on the OMol25 dataset OmniMol-M outperforms a 1B-parameter baseline transformer with ~20× fewer parameters, demonstrating the first cross-discipline transfer for scientific point-cloud foundation models.",
    paperUrl: "https://arxiv.org/abs/2601.10791",
    isNew: true,
    properties: ["energy", "forces"],
    trainingData: ["OMol25"],
    tags: ["transformer", "cross-domain transfer", "PET"],
    supportsCharges: null,
    supportsSpins: null,
    elementsCovered: "—",
  },
];

export const INITIAL_EDGES: Edge[] = [
  // Lane 1 (Equivariant + Transformers)
  { from: "tfn", to: "nequip", label: "E(3)" },
  { from: "tfn", to: "se3t", label: "+Attention" },
  { from: "nequip", to: "allegro", label: "Locality" },
  { from: "nequip", to: "mace", label: "Higher Order" },
  { from: "nequip", to: "eqv2", label: "Attention" },
  { from: "se3t", to: "eqv2", label: "Refined", dashed: true },
  { from: "mace", to: "grace", label: "Scale" },
  { from: "eqv2", to: "orb", label: "Simplify", dashed: true },
  { from: "orb", to: "orbmol", label: "+OMol25" },
  { from: "eqv2", to: "esen", label: "Smooth PES" },
  { from: "esen", to: "uma", label: "Backbone" },
  { from: "jmp", to: "uma", label: "Multi-task", dashed: true },
  { from: "uma", to: "mattersim", label: "Foundation", dashed: true },

  // Lane 2 (Descriptors) – keep edges purely horizontal to avoid messy crossings
  { from: "bpnn", to: "gap", label: "Kernels" },
  { from: "bpnn", to: "ani", label: "Neural Nets", dashed: true },
  { from: "ace", to: "grace", label: "Graph", dashed: true },
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

  // New 2025–2026 foundation models
  { from: "nequip", to: "nequix", label: "Budget" },
  { from: "orb", to: "petmad", label: "Lightweight", dashed: true },
  { from: "bpnn", to: "nep89", label: "Evolution NN" },
  { from: "eqv2", to: "liten", label: "TQA" },
  { from: "mace", to: "liten", label: "4-body", dashed: true },

  // 2026 additions
  { from: "sevennet", to: "sevennet_omni", label: "Multi-fidelity" },
  { from: "sevennet_omni", to: "sevennet_nano", label: "Distillation" },
  { from: "mattersim", to: "pfp_v8", label: "r2SCAN", dashed: true },

  // 2025–2026 new foundation/follow-on models
  { from: "mace", to: "mace_polar1", label: "+Polarisable" },
  { from: "orbmol", to: "mace_polar1", label: "OMol25", dashed: true },
  { from: "dpa2", to: "dpa3", label: "LiGS" },
  { from: "ani", to: "aimnet2", label: "AIM + Charges" },
  { from: "nep89", to: "orion", label: "Organic CHONSP" },
  { from: "ani", to: "orion", label: "Reactive Organics", dashed: true },

  // March–April 2026 additions
  { from: "eqv2", to: "eqv3", label: "Scaling" },
  { from: "m3gnet", to: "matris", label: "3-body Attn" },
  { from: "mattersim", to: "matris", label: "OMat24", dashed: true },

  // April 2026 additions
  { from: "aimnet2", to: "omni_p2x", label: "Excited States" },
  { from: "ani", to: "omni_p2x", label: "MS-ANI", dashed: true },
  { from: "grace", to: "grace_off", label: "Organic Liquids" },
  { from: "petmad", to: "omnimol", label: "PET", dashed: true },
  { from: "uma", to: "omnimol", label: "OMol25", dashed: true },

  // April 2026 — AceFF (TensorNet2 drug-discovery MLIP)
  { from: "painn", to: "aceff", label: "TensorNet2" },
  { from: "aimnet2", to: "aceff", label: "Charge-aware FF", dashed: true },

  // April 2026 — MACE-Osaka26 (97-element universal potential incl. actinides)
  { from: "mace", to: "mace_osaka26", label: "+Actinides" },
  { from: "mace_polar1", to: "mace_osaka26", label: "MACE family", dashed: true },

  // April 2026 — MLANet (efficient equivariant GNN with dynamic attention)
  { from: "eqv2", to: "mlanet", label: "Dynamic Attn" },
  { from: "mace", to: "mlanet", label: "Efficient", dashed: true },

  // April 2026 — EquiEwald (SO(3)-equivariant reciprocal-space long-range potential)
  { from: "nequip", to: "equiewald", label: "+Reciprocal Ewald" },
  { from: "mace_polar1", to: "equiewald", label: "Long-range", dashed: true },

  // March 2026 — AllScAIP (scalable all-to-all attention MLIP, FAIR/UCB/LBNL)
  { from: "eqv2", to: "allscaip", label: "All-to-All Attn" },
  { from: "uma", to: "allscaip", label: "OMol25", dashed: true },

  // April 2026 — MACE-Magnetic (MACE extension with explicit magnetic moments + SOC)
  { from: "mace", to: "mace_mag", label: "+Magnetic Moments" },
  { from: "mace_polar1", to: "mace_mag", label: "MACE family", dashed: true },

  // April 2026 — Allegro-MoE (multifidelity Mixture-of-Experts on Allegro)
  { from: "allegro", to: "allegro_moe", label: "Mixture-of-Experts" },
  { from: "matris_moe", to: "allegro_moe", label: "MoE", dashed: true },

  // April 2026 — MatRIS-MoE (billion-parameter Mixture-of-Experts uMLIP)
  { from: "matris", to: "matris_moe", label: "MoE Scale" },
  { from: "dpa2", to: "matris_moe", label: "Multi-task", dashed: true },
];
