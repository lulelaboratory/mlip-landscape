import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  Box,
  Database,
  Layers,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Learn MLIPs",
  description:
    "A practical guide to MLIP architectures, their physical constraints, and how to read the MLIP Hub map. Covers descriptor-based, invariant, equivariant, transformer-style, and foundation MLIPs.",
  alternates: { canonical: "/learn" },
};

// ---------------------------------------------------------------------------
// Diagram primitives. We build simple flex-based "flowcharts" using styled
// boxes and arrow icons. They stack vertically on mobile (flex-col) and
// flow left-to-right on wider screens (sm:flex-row). Colors are pulled from
// the same Tailwind families used by the explore canvas legend so the
// diagrams double as a visual key for the map.
// ---------------------------------------------------------------------------

type Tone =
  | "slate"
  | "red"      // Equivariant
  | "blue"     // Invariant
  | "green"    // Transformer
  | "orange"   // Descriptor
  | "purple"   // Foundation / learnt
  | "indigo";  // Generic / mixed

const TONE_BOX: Record<Tone, string> = {
  slate:
    "bg-slate-50 border-slate-300 text-slate-800 dark:bg-slate-900/60 dark:border-slate-700 dark:text-slate-200",
  red:
    "bg-red-50 border-red-400 text-red-900 dark:bg-red-950/40 dark:border-red-500/70 dark:text-red-100",
  blue:
    "bg-blue-50 border-blue-400 text-blue-900 dark:bg-blue-950/40 dark:border-blue-500/70 dark:text-blue-100",
  green:
    "bg-green-50 border-green-500 text-green-900 dark:bg-green-950/40 dark:border-green-500/70 dark:text-green-100",
  orange:
    "bg-orange-50 border-orange-400 text-orange-900 dark:bg-orange-950/40 dark:border-orange-500/70 dark:text-orange-100",
  purple:
    "bg-purple-50 border-purple-400 text-purple-900 dark:bg-purple-950/40 dark:border-purple-500/70 dark:text-purple-100",
  indigo:
    "bg-indigo-50 border-indigo-400 text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-500/70 dark:text-indigo-100",
};

function DBox({
  tone = "slate",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex-1 min-w-[8.5rem] rounded-lg border px-3 py-2 text-center text-xs sm:text-sm leading-snug ${TONE_BOX[tone]}`}
    >
      {children}
    </div>
  );
}

// Arrow that rotates between the boxes so the diagram reads correctly on
// both mobile (vertical) and desktop (horizontal) without extra layout JS.
function DArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 shrink-0 px-1 py-1">
      <ArrowDown size={16} className="sm:hidden" aria-hidden="true" />
      <ArrowRight size={16} className="hidden sm:block" aria-hidden="true" />
      {label ? (
        <span className="text-[10px] sm:text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mt-0.5 max-w-[7rem] text-center leading-tight">
          {label}
        </span>
      ) : null}
    </div>
  );
}

function Diagram({
  title,
  alt,
  children,
}: {
  title?: string;
  alt: string;
  children: ReactNode;
}) {
  return (
    <figure
      role="img"
      aria-label={alt}
      className="my-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5"
    >
      {title ? (
        <figcaption className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3 font-medium">
          {title}
        </figcaption>
      ) : null}
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-2 sm:gap-1">
        {children}
      </div>
      <p className="sr-only">{alt}</p>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// Architecture family content (also matches the React data sketch in the
// content package — kept inline here so the page stays self-contained).
// ---------------------------------------------------------------------------

type FamilyTone = Exclude<Tone, "slate" | "indigo">;

type FamilyCard = {
  id: string;
  title: string;
  tone: FamilyTone;
  icon: LucideIcon;
  shortDefinition: string;
  howItWorks: string[];
  examples: string[];
  strengths: string[];
  limitations: string[];
  diagram: ReactNode;
};

const FAMILIES: FamilyCard[] = [
  {
    id: "descriptor",
    title: "Descriptor-based potentials",
    tone: "orange",
    icon: Database,
    shortDefinition:
      "Convert each atom's neighborhood into a fixed numerical descriptor, then use a regression model or neural network to predict atomic energy contributions.",
    howItWorks: [
      "Build local atomic environments.",
      "Encode each environment with symmetry-preserving descriptors.",
      "Feed descriptors into a regressor or neural network.",
      "Sum atomic contributions into total energy.",
    ],
    examples: [
      "Behler–Parrinello NNs",
      "ANI",
      "GAP / SOAP",
      "SNAP",
      "MTP",
      "ACE",
      "NEP",
    ],
    strengths: [
      "Often fast at inference.",
      "Robust and practical for production molecular dynamics.",
      "Descriptor design can encode useful physical structure.",
    ],
    limitations: [
      "Descriptor choices strongly affect performance.",
      "High body-order descriptors can become expensive.",
      "Transferability depends on training data and descriptor expressivity.",
    ],
    diagram: (
      <Diagram alt="Descriptor route: an atom and its neighbors are encoded into a hand-designed or analytic descriptor, fed into a regressor or neural network to give an atomic energy, and summed over atoms into a total energy.">
        <DBox tone="orange">Atom i + neighbors</DBox>
        <DArrow />
        <DBox tone="orange">
          Hand-designed or analytic descriptor
          <div className="mt-1 text-[10px] sm:text-[11px] opacity-80">
            symmetry functions, SOAP, ACE, NEP…
          </div>
        </DBox>
        <DArrow />
        <DBox tone="orange">Regressor or neural network</DBox>
        <DArrow />
        <DBox tone="orange">
          Atomic energy <span className="font-mono">e_i</span>
        </DBox>
        <DArrow />
        <DBox tone="orange">
          Total energy{" "}
          <span className="font-mono">E = Σ e_i</span>
        </DBox>
      </Diagram>
    ),
  },
  {
    id: "invariant-gnn",
    title: "Invariant graph neural networks",
    tone: "blue",
    icon: Layers,
    shortDefinition:
      "Represent atoms as graph nodes and pass scalar messages through neighbor edges, keeping internal features invariant under rotation.",
    howItWorks: [
      "Atoms become graph nodes.",
      "Distances and angular features become edge features.",
      "Each atom updates its representation by aggregating neighbor messages.",
      "A readout predicts energy and other scalar quantities.",
    ],
    examples: ["SchNet", "DimeNet", "GemNet-style models"],
    strengths: [
      "Natural fit for atomistic systems.",
      "Learns representations rather than relying only on fixed descriptors.",
      "Often easier to scale than highly structured tensor models.",
    ],
    limitations: [
      "Purely invariant features may be less efficient for vector or tensor properties.",
      "Geometry quality depends on careful angular and directional feature design.",
    ],
    diagram: (
      <Diagram alt="Invariant message passing: atoms as nodes connected by edges from a neighbor list pass scalar messages based on distances and angles, updating atomic embeddings used for an energy readout.">
        <DBox tone="blue">Atoms as nodes</DBox>
        <DArrow />
        <DBox tone="blue">Edges from neighbor list</DBox>
        <DArrow />
        <DBox tone="blue">
          Scalar messages
          <div className="mt-1 text-[10px] sm:text-[11px] opacity-80">
            distances / angles
          </div>
        </DBox>
        <DArrow />
        <DBox tone="blue">Updated atomic embeddings</DBox>
        <DArrow />
        <DBox tone="blue">Energy readout</DBox>
      </Diagram>
    ),
  },
  {
    id: "equivariant-gnn",
    title: "Equivariant graph neural networks",
    tone: "red",
    icon: Box,
    shortDefinition:
      "Carry features that transform predictably under rotations, so geometry, directions, and tensor quantities can be represented natively.",
    howItWorks: [
      "Construct an atomistic graph.",
      "Use directional geometric features such as spherical harmonics or tensor products.",
      "Pass messages that preserve E(3), SE(3), or related equivariance.",
      "Predict invariant energies and equivariant vector or tensor outputs.",
    ],
    examples: [
      "Tensor Field Networks",
      "NequIP",
      "Allegro",
      "MACE",
      "eSEN",
      "Equiformer-style models",
    ],
    strengths: [
      "Strong physical inductive bias.",
      "Often highly data-efficient.",
      "Especially useful for forces, local geometry, and tensorial properties.",
    ],
    limitations: [
      "Can be computationally heavier.",
      "Implementation complexity is higher.",
      "Very large-scale MD may need local or optimized variants.",
    ],
    diagram: (
      <Diagram alt="Equivariant message passing: atom features combine scalars and geometric tensors, edges carry directional features, equivariant message passing through tensor products yields updated scalar and vector features used to read out an invariant energy and equivariant vector or tensor outputs.">
        <DBox tone="red">
          Atom features
          <div className="mt-1 text-[10px] sm:text-[11px] opacity-80">
            scalars + geometric tensors
          </div>
        </DBox>
        <DArrow />
        <DBox tone="red">
          Directional edge features
          <div className="mt-1 text-[10px] sm:text-[11px] opacity-80">
            distances + orientations
          </div>
        </DBox>
        <DArrow />
        <DBox tone="red">
          Equivariant message passing
          <div className="mt-1 text-[10px] sm:text-[11px] opacity-80">
            tensor products / spherical harmonics
          </div>
        </DBox>
        <DArrow />
        <DBox tone="red">
          Updated scalar + vector / tensor features
        </DBox>
        <DArrow />
        <DBox tone="red">
          Invariant energy + equivariant vector / tensor outputs
        </DBox>
      </Diagram>
    ),
  },
  {
    id: "attention-transformer",
    title: "Attention and transformer-style MLIPs",
    tone: "green",
    icon: Zap,
    shortDefinition:
      "Use attention mechanisms to let atoms or local environments weigh the importance of other atoms, edges, or learned features.",
    howItWorks: [
      "Build atom, edge, or environment tokens.",
      "Compute attention scores over local or sparse neighborhoods.",
      "Mix features according to learned relevance.",
      "Combine attention with invariant or equivariant geometric features.",
    ],
    examples: [
      "SE(3)-Transformer",
      "Equiformer",
      "PET",
      "Orb-style graph models",
      "UMA-style foundation models",
    ],
    strengths: [
      "Flexible information routing.",
      "Works well with large pretraining datasets.",
      "Can be combined with equivariance or relaxed symmetry assumptions.",
    ],
    limitations: [
      "Attention can be expensive without locality or sparsity.",
      "The transformer label alone does not specify physical constraints.",
      "Some models intentionally relax strict equivariance for speed.",
    ],
    diagram: (
      <Diagram alt="Attention route: atom and edge tokens are combined with attention scores that decide which neighbors matter, mixed with weighted features into updated representations, and read out as energy, forces, and stress.">
        <DBox tone="green">Atom / edge tokens</DBox>
        <DArrow />
        <DBox tone="green">
          Attention scores
          <div className="mt-1 text-[10px] sm:text-[11px] opacity-80">
            which neighbors matter?
          </div>
        </DBox>
        <DArrow />
        <DBox tone="green">Weighted feature mixing</DBox>
        <DArrow />
        <DBox tone="green">Updated representations</DBox>
        <DArrow />
        <DBox tone="green">Energy, forces, stress</DBox>
      </Diagram>
    ),
  },
  {
    id: "foundation-mlip",
    title: "Foundation MLIPs",
    tone: "purple",
    icon: Sparkles,
    shortDefinition:
      "Broadly pretrained atomistic models designed for direct use, transfer learning, or fine-tuning across many materials or molecular domains.",
    howItWorks: [
      "Pretrain on many structures, chemistries, and configurations.",
      "Learn a general atomistic representation.",
      "Apply zero-shot, use as a starting point, or fine-tune.",
      "Validate carefully for the target chemistry, phase, and conditions.",
    ],
    examples: [
      "MACE-MP-style models",
      "CHGNet",
      "MatterSim",
      "Orb",
      "SevenNet",
      "UMA",
    ],
    strengths: [
      "Broad initial coverage.",
      "Useful starting point for screening and exploratory simulations.",
      "Can reduce the amount of task-specific training data needed.",
    ],
    limitations: [
      "“Universal” does not mean universally accurate.",
      "Coverage depends on training data.",
      "Target-domain validation remains necessary.",
    ],
    diagram: (
      <Diagram alt="Foundation model workflow: large atomistic datasets are used for pretraining, producing a foundation MLIP that can be applied zero-shot, fine-tuned, or used for embedding reuse, with a validation step on the target domain in each case.">
        <DBox tone="purple">Large atomistic datasets</DBox>
        <DArrow />
        <DBox tone="purple">Pretraining</DBox>
        <DArrow />
        <DBox tone="purple">Foundation MLIP</DBox>
        <DArrow />
        <DBox tone="slate">
          Zero-shot · fine-tuning · embedding reuse
        </DBox>
        <DArrow />
        <DBox tone="purple">Validate on target domain</DBox>
      </Diagram>
    ),
  },
];

// ---------------------------------------------------------------------------
// Section-1 prediction-loop diagram
// ---------------------------------------------------------------------------

function PredictionLoopDiagram() {
  return (
    <figure
      role="img"
      aria-label="Flow diagram showing atomic structures (Z, positions, cell) being converted into local environments within a cutoff, passed through an MLIP architecture (descriptor, GNN, equivariant GNN, attention, or foundation model), and used to predict energy, forces (negative gradient of energy with respect to positions), stress or virial (cell or strain derivative), and optional outputs such as charge, spin, dipole, or polarizability."
      className="my-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5"
    >
      <figcaption className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3 font-medium">
        Diagram · MLIP prediction loop
      </figcaption>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-2 sm:gap-1">
          <DBox tone="slate">
            Atomic structure
            <div className="mt-1 text-[10px] sm:text-[11px] opacity-80 font-mono">
              Z, positions, cell
            </div>
          </DBox>
          <DArrow />
          <DBox tone="slate">
            Local environments
            <div className="mt-1 text-[10px] sm:text-[11px] opacity-80">
              neighbors within cutoff
            </div>
          </DBox>
          <DArrow />
          <DBox tone="indigo">
            Architecture
            <div className="mt-1 text-[10px] sm:text-[11px] opacity-80">
              descriptor · GNN · equivariant GNN · attention · foundation
            </div>
          </DBox>
        </div>
        <div className="flex justify-center text-slate-400 dark:text-slate-500 py-1">
          <ArrowDown size={16} aria-hidden="true" />
        </div>
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <DBox tone="indigo">
            Predicted energy <span className="font-mono">E</span>
          </DBox>
          <DBox tone="indigo">
            Forces{" "}
            <span className="font-mono">F = −dE/dR</span>
          </DBox>
          <DBox tone="indigo">
            Stress / virial
            <div className="mt-1 text-[10px] sm:text-[11px] opacity-80">
              cell or strain derivative
            </div>
          </DBox>
          <DBox tone="slate">
            Optional outputs
            <div className="mt-1 text-[10px] sm:text-[11px] opacity-80">
              charge, spin, dipole, polarizability
            </div>
          </DBox>
        </div>
      </div>
      <p className="sr-only">
        A flow diagram showing atomic structures converted into local
        environments, passed through an MLIP architecture, and used to predict
        energy, forces, stress, and optional properties.
      </p>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// Section-2 invariance vs equivariance diagram
// ---------------------------------------------------------------------------

function InvariantEquivariantDiagram() {
  return (
    <figure
      role="img"
      aria-label="Diagram comparing two MLIP runs: the original structure and a rotated copy of the same structure go into the same MLIP. The MLIP returns the same scalar energy E in both cases (invariance), but the predicted force vector rotates with the structure as R times F (equivariance)."
      className="my-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5"
    >
      <figcaption className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3 font-medium">
        Diagram · Invariant vs equivariant
      </figcaption>
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
            Original structure
          </div>
          <div className="flex flex-col gap-2">
            <DBox tone="slate">Structure</DBox>
            <div className="flex justify-center text-slate-400 dark:text-slate-500">
              <ArrowDown size={14} aria-hidden="true" />
            </div>
            <DBox tone="indigo">MLIP</DBox>
            <div className="flex justify-center text-slate-400 dark:text-slate-500">
              <ArrowDown size={14} aria-hidden="true" />
            </div>
            <div className="grid gap-2 grid-cols-2">
              <DBox tone="slate">
                Energy <span className="font-mono">E</span>
              </DBox>
              <DBox tone="red">
                Forces <span className="font-mono">F</span>
              </DBox>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
            Rotated structure
          </div>
          <div className="flex flex-col gap-2">
            <DBox tone="slate">Rotated structure</DBox>
            <div className="flex justify-center text-slate-400 dark:text-slate-500">
              <ArrowDown size={14} aria-hidden="true" />
            </div>
            <DBox tone="indigo">Same MLIP</DBox>
            <div className="flex justify-center text-slate-400 dark:text-slate-500">
              <ArrowDown size={14} aria-hidden="true" />
            </div>
            <div className="grid gap-2 grid-cols-2">
              <DBox tone="slate">
                Same energy <span className="font-mono">E</span>
              </DBox>
              <DBox tone="red">
                Rotated forces <span className="font-mono">R · F</span>
              </DBox>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 italic">
        Energy is invariant under rotation; vector quantities such as forces
        rotate consistently with the structure (equivariant).
      </p>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// Section-4 main taxonomy chart. This is the page's anchor visual; we use a
// hand-rolled grid (no Mermaid) so it matches the explore canvas palette.
// ---------------------------------------------------------------------------

type TaxonomyBranch = {
  id: string;
  title: string;
  tone: FamilyTone;
  icon: LucideIcon;
  leaves: { title: string; examples: string }[];
};

const TAXONOMY_BRANCHES: TaxonomyBranch[] = [
  {
    id: "tx-descriptor",
    title: "Descriptor-based potentials",
    tone: "orange",
    icon: Database,
    leaves: [
      { title: "Symmetry-function NNs", examples: "BPNN, ANI" },
      { title: "Kernel + descriptor", examples: "GAP / SOAP" },
      { title: "Body-order expansions", examples: "SNAP, MTP, ACE, NEP" },
    ],
  },
  {
    id: "tx-gnn",
    title: "Graph neural network potentials",
    tone: "blue",
    icon: Layers,
    leaves: [
      { title: "Invariant GNNs", examples: "SchNet, DimeNet, GemNet" },
      {
        title: "Equivariant GNNs",
        examples: "TFN, NequIP, Allegro, MACE, eSEN",
      },
    ],
  },
  {
    id: "tx-attention",
    title: "Attention / transformer-style potentials",
    tone: "green",
    icon: Zap,
    leaves: [
      {
        title: "Equivariant attention",
        examples: "SE(3)-Transformer, Equiformer",
      },
      {
        title: "Graph transformers / relaxed equivariance",
        examples: "PET, Orb-style models",
      },
    ],
  },
  {
    id: "tx-foundation",
    title: "Foundation MLIPs",
    tone: "purple",
    icon: Sparkles,
    leaves: [
      {
        title: "Materials foundation MLIPs",
        examples: "MACE-MP, CHGNet, MatterSim, SevenNet, Orb, UMA",
      },
      {
        title: "Molecular / chemistry foundation MLIPs",
        examples: "OrbMol, MACE-POLAR-style models",
      },
    ],
  },
];

const TONE_CHIP: Record<FamilyTone, string> = {
  red: "bg-red-500/90 text-white",
  blue: "bg-blue-500/90 text-white",
  green: "bg-green-600/90 text-white",
  orange: "bg-orange-500/90 text-white",
  purple: "bg-purple-500/90 text-white",
};

function TaxonomyChart() {
  return (
    <figure
      role="img"
      aria-label="MLIP architecture taxonomy: machine-learning interatomic potentials split into four overlapping families — descriptor-based potentials (with symmetry-function NNs, kernel + descriptor, and body-order expansions), graph neural network potentials (invariant and equivariant GNNs), attention or transformer-style potentials (equivariant attention and graph transformers with relaxed equivariance), and foundation MLIPs (materials and molecular foundation models)."
      className="my-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6"
    >
      <header className="mb-4 sm:mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Not a ranking
          </span>
          <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
            Practical taxonomy
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
          MLIP architecture families: from descriptors to foundation models
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          A practical taxonomy for reading MLIP Hub. Families overlap, and some
          models combine ideas from multiple branches.
        </p>
      </header>

      <div className="flex flex-col items-center">
        <div className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-200">
          Machine-learning interatomic potentials
        </div>
        <div className="text-slate-400 dark:text-slate-500 py-2">
          <ArrowDown size={16} aria-hidden="true" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TAXONOMY_BRANCHES.map((branch) => {
          const Icon = branch.icon;
          return (
            <div
              key={branch.id}
              className={`rounded-xl border p-3 ${TONE_BOX[branch.tone]}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${TONE_CHIP[branch.tone]}`}
                  aria-hidden="true"
                >
                  <Icon size={14} />
                </span>
                <h4 className="text-sm font-semibold leading-tight">
                  {branch.title}
                </h4>
              </div>
              <ul className="space-y-2">
                {branch.leaves.map((leaf) => (
                  <li
                    key={leaf.title}
                    className="rounded-md bg-white/70 dark:bg-slate-950/40 border border-current/10 px-2 py-1.5"
                  >
                    <div className="text-xs font-medium">{leaf.title}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">
                      {leaf.examples}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 italic">
        This taxonomy is a guide, not a strict ontology. Many modern MLIPs
        combine multiple ideas: descriptors with graph structure, equivariance
        with attention, or foundation-model pretraining with specialized
        fine-tuning.
      </p>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// Family card component
// ---------------------------------------------------------------------------

function FamilyCard({ family }: { family: FamilyCard }) {
  const Icon = family.icon;
  return (
    <section
      id={family.id}
      className="scroll-mt-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 overflow-hidden"
    >
      <header
        className={`flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-800 ${TONE_BOX[family.tone]}`}
      >
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${TONE_CHIP[family.tone]}`}
          aria-hidden="true"
        >
          <Icon size={16} />
        </span>
        <h3 className="text-base sm:text-lg font-semibold leading-tight">
          {family.title}
        </h3>
      </header>
      <div className="px-4 sm:px-5 py-4 space-y-4">
        <p className="text-sm text-slate-700 dark:text-slate-200">
          <span className="font-semibold">Core idea. </span>
          {family.shortDefinition}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
              How it works
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 marker:text-slate-400">
              {family.howItWorks.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
              Representative examples
            </h4>
            <ul className="flex flex-wrap gap-1.5">
              {family.examples.map((ex) => (
                <li
                  key={ex}
                  className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 text-xs text-slate-700 dark:text-slate-300"
                >
                  {ex}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 mb-1.5">
              Strengths
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 marker:text-emerald-400">
              {family.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300 mb-1.5">
              Limitations
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 marker:text-amber-400">
              {family.limitations.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
        {family.diagram}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------------

const GLOSSARY: { term: string; def: string }[] = [
  {
    term: "MLIP",
    def: "A machine-learning interatomic potential: a learned approximation to atomistic energies, forces, and related quantities.",
  },
  {
    term: "Potential energy surface",
    def: "The function mapping atomic positions and species to energy.",
  },
  {
    term: "Forces",
    def: "The negative gradient of energy with respect to atomic positions.",
  },
  {
    term: "Stress / virial",
    def: "A quantity related to how energy changes with cell deformation, important for periodic materials.",
  },
  {
    term: "Descriptor",
    def: "A numerical representation of an atom's local environment.",
  },
  {
    term: "Invariant",
    def: "A quantity that does not change under a transformation, such as energy under rotation.",
  },
  {
    term: "Equivariant",
    def: "A quantity that transforms in a predictable way under a transformation, such as forces rotating when the structure rotates.",
  },
  {
    term: "Message passing",
    def: "A graph neural network operation where atoms update their features by receiving information from neighboring atoms.",
  },
  {
    term: "Cutoff radius",
    def: "The distance within which atoms are considered neighbors.",
  },
  {
    term: "Foundation MLIP",
    def: "A broadly pretrained atomistic model intended to cover many chemistries or materials and often used directly or fine-tuned.",
  },
  {
    term: "Long-range interactions",
    def: "Interactions such as electrostatics or polarization that may extend beyond a short local cutoff.",
  },
  {
    term: "Charge-aware model",
    def: "A model that can condition predictions on total or atomic charge.",
  },
  {
    term: "Spin-aware model",
    def: "A model that can condition predictions on spin multiplicity, magnetic moments, or related variables.",
  },
];

// ---------------------------------------------------------------------------
// Further reading
// ---------------------------------------------------------------------------

const FURTHER_READING: { title: string; entries: string[] }[] = [
  {
    title: "General MLIP reviews",
    entries: [
      "Unke et al., “Machine Learning Force Fields,” Chemical Reviews, 2021.",
      "Behler, “Perspective: Machine learning potentials for atomistic simulations,” Journal of Chemical Physics, 2016.",
      "Deringer, Caro, and Csányi, “Machine learning interatomic potentials as emerging tools for materials science,” Advanced Materials, 2019.",
    ],
  },
  {
    title: "Descriptor and kernel models",
    entries: [
      "Behler and Parrinello, high-dimensional neural network potentials.",
      "Bartók, Payne, Kondor, and Csányi, Gaussian Approximation Potentials.",
      "SOAP descriptor papers by Bartók and coauthors.",
      "Thompson et al., SNAP.",
      "Shapeev, Moment Tensor Potentials.",
      "Drautz, Atomic Cluster Expansion.",
      "ANI papers by Smith, Isayev, and Roitberg.",
      "NEP papers by Fan and coauthors.",
    ],
  },
  {
    title: "Graph neural network MLIPs",
    entries: [
      "SchNet by Schütt and coauthors.",
      "DimeNet by Klicpera and coauthors.",
      "GemNet / GemNet-OC by Gasteiger and coauthors.",
    ],
  },
  {
    title: "Equivariant MLIPs",
    entries: [
      "Tensor Field Networks by Thomas and coauthors.",
      "NequIP by Batzner and coauthors.",
      "Allegro by Musaelian and coauthors.",
      "MACE by Batatia and coauthors.",
      "eSEN / related smooth equivariant models.",
    ],
  },
  {
    title: "Attention and transformer-style MLIPs",
    entries: [
      "SE(3)-Transformer by Fuchs and coauthors.",
      "Equiformer and EquiformerV2 by Liao, Smidt, and coauthors.",
      "PET / PET-MAD by Pozdnyakov, Ceriotti, and coauthors.",
      "Orb / UMA / related foundation-model papers.",
    ],
  },
];

// ---------------------------------------------------------------------------
// Choose-what-to-compare checklists
// ---------------------------------------------------------------------------

const COMPARE_GROUPS: { title: string; items: string[] }[] = [
  {
    title: "If you care about molecular dynamics",
    items: [
      "Force support.",
      "Energy conservation assumptions (derivative vs direct forces).",
      "Speed and memory.",
      "MD engine integration.",
      "Stability over long trajectories.",
      "Validation at your target temperature and phase.",
    ],
  },
  {
    title: "If you care about periodic materials",
    items: [
      "Stress prediction.",
      "Periodic boundary support.",
      "Element coverage.",
      "Training data relevance.",
      "Support for ASE, LAMMPS, OpenKIM, or related workflows.",
    ],
  },
  {
    title: "If you care about charged, spin, or polar systems",
    items: [
      "Whether the model supports total charge.",
      "Whether it supports spin or magnetic moments.",
      "Whether it includes long-range electrostatics or polarization.",
      "Whether those capabilities were trained and validated for your chemistry.",
    ],
  },
  {
    title: "If you care about fine-tuning",
    items: [
      "License.",
      "Availability of pretrained weights.",
      "Training code.",
      "Target-domain data requirements.",
      "Examples for transfer learning or fine-tuning.",
    ],
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LearnPage() {
  return (
    <article className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 sm:py-12 text-slate-800 dark:text-slate-200 overflow-y-auto">
      {/* Hero */}
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
          Learn MLIPs
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
          What are machine-learning interatomic potentials?
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
          A practical guide to MLIP architectures, their physical constraints,
          and how to read the MLIP Hub map.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Explore the map
          </Link>
          <Link
            href="/compare"
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Compare models
          </Link>
        </div>
      </header>

      {/* Top callout */}
      <aside
        role="note"
        aria-label="Curated landscape, not a benchmark"
        className="mb-8 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 px-4 sm:px-5 py-4 text-sm"
      >
        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
          MLIP Hub is a curated landscape, not a benchmark.
        </p>
        <p className="text-slate-700 dark:text-slate-200">
          This guide explains how machine-learning interatomic potentials are
          commonly organized by architecture and physical assumptions. It does
          not rank models by accuracy or recommend one universal best model.
          For model-specific claims, cite the original paper and check the
          model card.
        </p>
      </aside>

      {/* On this page */}
      <nav
        aria-label="On this page"
        className="mb-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-3 text-sm"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
          On this page
        </p>
        <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 list-disc list-inside marker:text-slate-300 dark:marker:text-slate-600">
          <li>
            <a
              href="#what-is-an-mlip"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              What is an MLIP?
            </a>
          </li>
          <li>
            <a
              href="#good-architecture"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              What makes a good MLIP architecture?
            </a>
          </li>
          <li>
            <a
              href="#families"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Main architecture families
            </a>
          </li>
          <li>
            <a
              href="#taxonomy"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Architecture taxonomy chart
            </a>
          </li>
          <li>
            <a
              href="#read-map"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              How to read the MLIP Hub map
            </a>
          </li>
          <li>
            <a
              href="#compare"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Choosing what to compare
            </a>
          </li>
          <li>
            <a
              href="#glossary"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Glossary
            </a>
          </li>
          <li>
            <a
              href="#further-reading"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Further reading
            </a>
          </li>
        </ul>
      </nav>

      {/* Section 1 */}
      <section id="what-is-an-mlip" className="scroll-mt-24 mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
          1. What is an MLIP?
        </h2>
        <p className="leading-relaxed">
          Machine-learning interatomic potentials, or <strong>MLIPs</strong>,
          use machine learning to approximate the energy and forces of
          atomistic systems. They are designed to make molecular dynamics,
          structure relaxation, materials screening, and related simulations
          much faster than repeatedly solving the electronic-structure problem
          from scratch.
        </p>
        <p className="leading-relaxed mt-3">
          An atomistic simulation needs a rule for computing how atoms
          interact. In first-principles simulations, that rule comes from
          electronic-structure calculations such as density functional theory.
          In an MLIP, the rule is learned from reference data.
        </p>
        <p className="leading-relaxed mt-3">A typical MLIP takes an atomic structure as input:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-sm sm:text-base">
          <li>atomic numbers,</li>
          <li>positions,</li>
          <li>periodic cell information when relevant,</li>
          <li>and sometimes total charge, spin, or other conditioning variables.</li>
        </ul>
        <p className="leading-relaxed mt-3">
          It then predicts one or more physical quantities, most commonly:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-sm sm:text-base">
          <li>total energy,</li>
          <li>atomic forces,</li>
          <li>stress or virial,</li>
          <li>sometimes charge, dipole, magnetic moment, or polarizability.</li>
        </ul>
        <p className="leading-relaxed mt-3">
          Many MLIPs predict a scalar energy and compute forces as derivatives
          of that energy. Other models may predict forces directly. This
          distinction matters because derivative-based forces are
          energy-conservative by construction, while direct-force models may
          trade strict conservatism for speed or flexibility.
        </p>
        <PredictionLoopDiagram />
      </section>

      {/* Section 2 */}
      <section id="good-architecture" className="scroll-mt-24 mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
          2. What makes a good MLIP architecture?
        </h2>
        <p className="leading-relaxed">
          MLIP architectures are shaped by physical symmetries and
          computational trade-offs.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-6 mb-2">
          Symmetry
        </h3>
        <p className="leading-relaxed">
          A physically sensible MLIP should respect basic symmetries:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-sm sm:text-base">
          <li>
            <strong>Translation invariance:</strong> shifting the whole
            structure should not change the energy.
          </li>
          <li>
            <strong>Permutation symmetry:</strong> swapping identical atoms
            should not change the energy.
          </li>
          <li>
            <strong>Rotation invariance for scalar outputs:</strong> rotating
            the structure should not change the total energy.
          </li>
          <li>
            <strong>Rotation equivariance for vector outputs:</strong> if the
            structure rotates, predicted vector quantities such as forces
            should rotate in the same way.
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-6 mb-2">
          Locality and long-range effects
        </h3>
        <p className="leading-relaxed">
          Most MLIPs use local neighborhoods: each atom interacts with atoms
          inside a cutoff radius. This is efficient and often accurate for
          short-range bonding. Long-range electrostatics, polarization, charge
          transfer, and magnetic effects may require special treatment.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-6 mb-2">
          Accuracy, speed, and data efficiency
        </h3>
        <p className="leading-relaxed">
          Architectures differ in how much physics they build in. More
          structured models can be data-efficient and accurate, but may be
          more expensive. Simpler or less constrained models can be faster,
          especially for large simulations, but may require more data or
          careful validation.
        </p>

        <InvariantEquivariantDiagram />
      </section>

      {/* Section 3 */}
      <section id="families" className="scroll-mt-24 mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
          3. Main MLIP architecture families
        </h2>
        <p className="leading-relaxed mb-6">
          Use these as a reading guide for the map. Many real models combine
          ideas from multiple families.
        </p>
        <div className="space-y-6">
          {FAMILIES.map((family) => (
            <FamilyCard key={family.id} family={family} />
          ))}
        </div>
      </section>

      {/* Section 4 */}
      <section id="taxonomy" className="scroll-mt-24 mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
          4. Architecture taxonomy chart
        </h2>
        <p className="leading-relaxed">
          The chart below is the page&rsquo;s anchor visual. It is a practical
          reading guide for MLIP Hub, not a strict ontology or ranking.
        </p>
        <TaxonomyChart />
      </section>

      {/* Section 5 */}
      <section id="read-map" className="scroll-mt-24 mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
          5. How to read the MLIP Hub map
        </h2>
        <p className="leading-relaxed">
          MLIP Hub shows model families as <strong>zones</strong>, models as{" "}
          <strong>nodes</strong>, and curated relationships as{" "}
          <strong>edges</strong>.
        </p>

        <div className="grid gap-4 sm:grid-cols-3 mt-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Nodes
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Each node is a specific model or architecture entry. A node card
              may include name, year, category, originating lab or authors,
              code link, paper link, training data, predicted properties,
              framework support, license, maintenance status, charge/spin
              support, and element coverage.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Edges
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              An edge indicates a curated conceptual relationship. It may mean
              that one model influenced another, extended a prior design,
              adapted an architecture, or belongs to a related lineage.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Zones
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Zones group models into broad architecture families such as
              descriptor, invariant, equivariant, transformer, or
              foundation-style MLIPs. Some models naturally sit between
              categories.
            </p>
          </div>
        </div>

        <blockquote className="mt-6 border-l-4 border-blue-400 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 rounded-r-lg">
          An edge is not necessarily code inheritance, citation count, or
          benchmark superiority. It is a curator-reviewed lineage or
          conceptual relationship.
        </blockquote>

        <Diagram
          title="Diagram · How to read a node and edge"
          alt="Two model nodes connected by an edge labelled 'influenced or extended by'. The newer model points to its model card metadata, including paper, code, properties, frameworks, and training data."
        >
          <DBox tone="slate">
            Model A
            <div className="mt-1 text-[10px] sm:text-[11px] opacity-80">
              earlier architecture
            </div>
          </DBox>
          <DArrow label="influenced / extended by" />
          <DBox tone="slate">
            Model B
            <div className="mt-1 text-[10px] sm:text-[11px] opacity-80">
              newer architecture
            </div>
          </DBox>
          <DArrow />
          <DBox tone="indigo">
            Model card metadata
            <div className="mt-1 text-[10px] sm:text-[11px] opacity-80">
              paper, code, properties, frameworks, training data
            </div>
          </DBox>
        </Diagram>

        <p className="text-sm mt-2">
          See the live map at{" "}
          <Link
            href="/"
            className="underline text-blue-600 dark:text-blue-400"
          >
            Explore
          </Link>
          , the full sortable list at{" "}
          <Link
            href="/models"
            className="underline text-blue-600 dark:text-blue-400"
          >
            Table
          </Link>
          , or compare any two side by side at{" "}
          <Link
            href="/compare"
            className="underline text-blue-600 dark:text-blue-400"
          >
            Compare
          </Link>
          .
        </p>
      </section>

      {/* Section 6 */}
      <section id="compare" className="scroll-mt-24 mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
          6. Choosing what to compare
        </h2>
        <p className="leading-relaxed">
          This section is a checklist, not a recommendation. We do not name a
          best model. Use it to figure out which metadata to read on each
          model card.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 mt-6">
          {COMPARE_GROUPS.map((group) => (
            <div
              key={group.title}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4"
            >
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {group.title}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 marker:text-slate-400">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Section 7 — Glossary */}
      <section id="glossary" className="scroll-mt-24 mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
          7. Glossary
        </h2>
        <dl className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden">
          {GLOSSARY.map((g) => (
            <div
              key={g.term}
              className="grid grid-cols-1 sm:grid-cols-[12rem_1fr] px-4 py-3"
            >
              <dt className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {g.term}
              </dt>
              <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1 sm:mt-0">
                {g.def}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Section 8 — Further reading */}
      <section id="further-reading" className="scroll-mt-24 mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
          8. Further reading
        </h2>
        <p className="leading-relaxed text-sm text-slate-600 dark:text-slate-400">
          A curated reading list. Follow each model card&rsquo;s{" "}
          <code>paperUrl</code> for canonical citations.
        </p>
        <div className="space-y-5 mt-4">
          {FURTHER_READING.map((g) => (
            <div key={g.title}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                {g.title}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 marker:text-slate-400">
                {g.entries.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
        <p>
          Want to suggest a correction or expand this guide? See{" "}
          <Link
            href="/contribute"
            className="underline text-blue-600 dark:text-blue-400"
          >
            Contribute
          </Link>{" "}
          or read the{" "}
          <Link
            href="/policy"
            className="underline text-blue-600 dark:text-blue-400"
          >
            editorial policy
          </Link>
          .
        </p>
      </footer>
    </article>
  );
}
