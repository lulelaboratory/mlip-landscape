// src/data/datasets.ts
//
// Normalized dataset registry (Phase 4). Datasets appear in model metadata
// under many spellings ("MPTrj" / "MPtrj" / "MPTraj"; "OMat24" / "OMAT-24";
// "OMol" / "OMol25"). This registry gives each a stable `datasetId` plus the
// `aliases` seen in the wild, so models can be connected to datasets by id and
// users can filter reliably.
//
// Trust rules (same as the model catalogue): do not invent metadata. Only the
// flagship datasets verified during the Phase 4 audit carry `paperUrl` /
// `license`; everything else is `needs_review` with no fabricated links. Add
// URLs only after checking a real source.

import type { VerificationStatus } from "./landscape";

export interface DatasetEntry {
  // Stable identifier: lowercase, no spaces. NEVER change once published
  // (model `trainedDatasets` reference it).
  datasetId: string;
  name: string; // canonical display name
  aliases: string[]; // spelling variants seen in model metadata / the literature
  domain: string[]; // e.g. ["molecules"], ["materials", "catalysts"]
  sourceUrl?: string; // dataset landing / download page
  paperUrl?: string; // primary citation
  license?: string; // SPDX id where known
  notes?: string;
  verificationStatus?: VerificationStatus; // absent => treat as needs_review
}

export const DATASETS: DatasetEntry[] = [
  // --- Source-verified flagships (Phase 4 audit, 2026-06-11) ---------------
  {
    datasetId: "omol25",
    name: "OMol25 (Open Molecules 2025)",
    aliases: [
      "OMol25",
      "OMol-25",
      "OMol",
      "Open Molecules 2025",
      "SPICE2 (subset of OMol25)",
    ],
    domain: ["molecules", "biomolecules", "electrolytes", "metal complexes"],
    paperUrl: "https://arxiv.org/abs/2505.08762",
    notes:
      ">100M ωB97M-V/def2-TZVPD DFT single points spanning ~83 elements; small molecules, biomolecules, metal complexes and electrolytes with variable charge/spin and explicit solvation (Meta FAIR).",
    verificationStatus: "partially_verified",
  },
  {
    datasetId: "omat24",
    name: "OMat24 (Open Materials 2024)",
    aliases: ["OMat24", "OMAT-24", "OMat-24", "Open Materials 2024"],
    domain: ["materials"],
    paperUrl: "https://arxiv.org/abs/2410.12771",
    license: "CC-BY-4.0",
    notes:
      ">100M DFT single points on non-equilibrium inorganic bulk materials (Meta FAIR).",
    verificationStatus: "partially_verified",
  },
  {
    datasetId: "oc20",
    name: "OC20 (Open Catalyst 2020)",
    aliases: ["OC20", "Open Catalyst 2020"],
    domain: ["catalysts", "surfaces"],
    paperUrl: "https://arxiv.org/abs/2010.09990",
    notes:
      "~1.28M DFT relaxations of catalyst surfaces + adsorbates (Open Catalyst Project).",
    verificationStatus: "partially_verified",
  },

  // --- Referenced by the catalogue, not yet source-verified ----------------
  // No paperUrl/license is guessed; each stays needs_review until checked
  // against a real source (tracked in audit/references_audit_report.md).
  {
    datasetId: "oc22",
    name: "OC22 (Open Catalyst 2022)",
    aliases: ["OC22", "Open Catalyst 2022"],
    domain: ["catalysts", "surfaces", "oxides"],
    notes: "Oxide-focused extension of the Open Catalyst series.",
    verificationStatus: "needs_review",
  },
  {
    datasetId: "odac23",
    name: "ODAC23 (Open DAC 2023)",
    aliases: ["ODAC23", "Open DAC 2023", "OpenDAC23"],
    domain: ["MOFs", "direct air capture"],
    notes: "MOF + CO2/H2O configurations for direct-air-capture screening.",
    verificationStatus: "needs_review",
  },
  {
    datasetId: "omc25",
    name: "OMC25 (Open Molecular Crystals 2025)",
    aliases: ["OMC25", "Open Molecular Crystals 2025"],
    domain: ["molecular crystals"],
    verificationStatus: "needs_review",
  },
  {
    datasetId: "opoly26",
    name: "OPoly26 (Open Polymers 2026)",
    aliases: ["OPoly26", "Open Polymers 2026"],
    domain: ["polymers", "molecules"],
    notes:
      "~6.57M DFT single points on capped substructures of diverse polymer chains (per secondary summaries of the Orbital Materials release; primary-source check pending — no URL is recorded until verified).",
    verificationStatus: "needs_review",
  },
  {
    datasetId: "mptrj",
    name: "MPtrj (Materials Project trajectories)",
    aliases: [
      "MPtrj",
      "MPTrj",
      "MPTraj",
      "MP-trj",
      "Materials Project trajectory",
      "Materials Project trajectories",
    ],
    domain: ["materials"],
    notes:
      "Relaxation trajectories from the Materials Project; popularised as a training set by CHGNet. Distinct from the static Materials Project database.",
    verificationStatus: "needs_review",
  },
  {
    datasetId: "materials_project",
    name: "Materials Project",
    aliases: ["Materials Project", "MP"],
    domain: ["materials"],
    notes:
      "Computed inorganic-materials database (distinct from the MPtrj relaxation trajectories).",
    verificationStatus: "needs_review",
  },
  {
    datasetId: "alexandria",
    name: "Alexandria",
    aliases: ["Alexandria"],
    domain: ["materials"],
    verificationStatus: "needs_review",
  },
  {
    datasetId: "salex",
    name: "sAlex (subsampled Alexandria)",
    aliases: ["sAlex", "s-Alex", "subsampled Alexandria"],
    domain: ["materials"],
    notes: "Subsampled subset of the Alexandria materials database.",
    verificationStatus: "needs_review",
  },
  {
    datasetId: "spice",
    name: "SPICE",
    aliases: ["SPICE", "SPICE2", "SPICE 2"],
    domain: ["molecules", "biomolecules"],
    notes:
      "Small-molecule + protein-fragment DFT dataset for biomolecular force fields.",
    verificationStatus: "needs_review",
  },
  {
    datasetId: "qm9",
    name: "QM9",
    aliases: ["QM9"],
    domain: ["molecules"],
    notes: "~134k small organic molecules (<=9 heavy atoms) at DFT.",
    verificationStatus: "needs_review",
  },
  {
    datasetId: "qm7x",
    name: "QM7-X",
    aliases: ["QM7-X", "QM7X", "QM7"],
    domain: ["molecules"],
    verificationStatus: "needs_review",
  },
  {
    datasetId: "md17",
    name: "MD17",
    aliases: ["MD17", "rMD17", "revised MD17"],
    domain: ["molecules"],
    notes:
      "MD trajectories of small molecules; rMD17 is the revised, tighter-DFT revision.",
    verificationStatus: "needs_review",
  },
  {
    datasetId: "md22",
    name: "MD22",
    aliases: ["MD22"],
    domain: ["molecules"],
    verificationStatus: "needs_review",
  },
  {
    datasetId: "ani1x",
    name: "ANI-1x",
    aliases: ["ANI-1x", "ANI1x", "ANI-1X"],
    domain: ["molecules"],
    verificationStatus: "needs_review",
  },
  {
    datasetId: "ani1ccx",
    name: "ANI-1ccx",
    aliases: ["ANI-1ccx", "ANI1ccx"],
    domain: ["molecules"],
    notes: "Coupled-cluster-corrected ANI dataset.",
    verificationStatus: "needs_review",
  },
  {
    datasetId: "transition1x",
    name: "Transition-1x",
    aliases: ["Transition-1x", "Transition1x"],
    domain: ["molecules", "reactions"],
    notes: "Reaction transition-state configurations.",
    verificationStatus: "needs_review",
  },
  {
    datasetId: "rgd1",
    name: "RGD1",
    aliases: ["RGD1"],
    domain: ["molecules", "reactions"],
    verificationStatus: "needs_review",
  },
  {
    datasetId: "matpes",
    name: "MATPES",
    aliases: ["MATPES", "MATPES-r2SCAN", "MATPES-PBE"],
    domain: ["materials"],
    verificationStatus: "needs_review",
  },
  {
    datasetId: "qcml",
    name: "QCML",
    aliases: ["QCML"],
    domain: ["molecules"],
    verificationStatus: "needs_review",
  },
  {
    datasetId: "mad",
    name: "MAD (Massive Atomistic Diversity)",
    aliases: ["MAD", "Massive Atomistic Diversity"],
    domain: ["molecules", "materials", "surfaces"],
    verificationStatus: "needs_review",
  },
  {
    datasetId: "nabladft",
    name: "nablaDFT",
    aliases: ["nablaDFT", "nabla-DFT"],
    domain: ["molecules"],
    verificationStatus: "needs_review",
  },
  {
    datasetId: "opengem26",
    name: "OpenGEM26 (Open Generated Ensemble of Molecules 2026)",
    aliases: ["OpenGEM26", "OpenGEM", "Open Generated Ensemble of Molecules"],
    domain: ["molecules"],
    sourceUrl: "https://github.com/atomly-materials-research-lab/GPTFF",
    paperUrl: "https://arxiv.org/abs/2607.21369",
    notes:
      "200k unique organic molecules and 4.4M conformations over H, C, N, O, S, Cl with up to ten heavy atoms; full DFT optimization trajectories plus non-equilibrium structures at wB97X-D/def2-SVP and def2-TZVPD with dispersion corrections. Introduced with GPTFF-mol.",
    verificationStatus: "partially_verified",
  },
];

export const DATASET_BY_ID: ReadonlyMap<string, DatasetEntry> = new Map(
  DATASETS.map((d) => [d.datasetId, d]),
);

export function getDataset(id: string): DatasetEntry | undefined {
  return DATASET_BY_ID.get(id);
}

export function datasetDisplayName(id: string): string {
  return DATASET_BY_ID.get(id)?.name ?? id;
}

// Normalize a raw label (e.g. a free-form `trainingData` string) to a stable
// datasetId by matching the canonical name or any alias, case-insensitively.
// Returns undefined when nothing matches — callers must NOT guess an id.
const normalize = (s: string) => s.trim().toLowerCase();
const ALIAS_TO_ID = new Map<string, string>();
for (const d of DATASETS) {
  ALIAS_TO_ID.set(normalize(d.name), d.datasetId);
  ALIAS_TO_ID.set(normalize(d.datasetId), d.datasetId);
  for (const a of d.aliases) ALIAS_TO_ID.set(normalize(a), d.datasetId);
}
export function resolveDatasetId(label: string): string | undefined {
  return ALIAS_TO_ID.get(normalize(label));
}

// Datasets exposed in the "Trained on dataset" filter. An id is added here
// ONLY once every model trained on it has had its `trainedDatasets`
// normalized — otherwise the filter would under-report and mislead. OMol25 is
// fully normalized as of Phase 4; others remain TODO (see
// audit/model_metadata_warnings.md and CONTRIBUTING.md).
export const FILTERABLE_DATASET_IDS: readonly string[] = ["omol25"];
