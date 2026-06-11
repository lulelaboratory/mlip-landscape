# Unsupported Claims Report

Tracks claims that appeared on the site (UI or data) without a supporting
source, and their resolution. A claim belongs here if it was presented as fact
but derived from a heuristic, an unverified assumption, or an over-generalized
label.

- **Status:** `open` (still present / needs action) · `resolved` (fixed) ·
  `deferred` (acknowledged, scheduled for a later phase).
- Rows below the `AUTOGEN` marker may be appended manually or by a future
  audit script. The three seed entries were identified during the Phase 1
  trust audit.

_Last updated: 2026-06-11 (manual)._

<!-- AUTOGEN:START unsupported-claims -->
| id | location | claim | why unsupported | status | resolution |
| --- | --- | --- | --- | --- | --- |
| UC-001 | `src/components/MLIPExplorer.tsx` detail panel | "Data Scale: Universal (Foundational)" shown for many models | Derived purely from the card's canvas x-coordinate (`x > 600`), not from any data field. Mislabels e.g. MACE (x=660). | resolved | Phase 1: replaced with a "Not yet verified" placeholder. Phase 2 (2026-06-11): row now renders only the curated `trainingScope` field. |
| UC-002 | `src/components/MLIPExplorer.tsx` detail panel | "Inference: High cost / high accuracy" shown for equivariant models | Derived purely from `category === "Equivariant"`, not from any benchmark. Mislabels distilled/lightweight models such as SevenNet-Nano. | resolved | Phase 1: replaced with a "Not yet verified" placeholder. Phase 2 (2026-06-11): row now renders only curated `inferenceCost` / `speedTier` / `accuracyTier` fields (validator requires evidence for non-`unknown` tiers). |
| UC-003 | `src/data/landscape.ts` `mace` node | Base MACE tagged "foundation model" with use case "universal MLIP" | MACE is an architecture; the universal/foundation family is the separate `mace_mp0` / MACE-foundations entries. The base entry over-claims. | resolved | Phase 2 (2026-06-11): verified against arXiv:2206.07697 (architecture paper; rMD17/3BPA/AcAc) and arXiv:2401.00096 (MACE-MP-0 foundation paper). Removed foundation/universal labels and MPTrj/Alexandria trainingData from the base entry; set `entityType: architecture`, `hasFoundationVariant: true` with evidence; `mace_mp0` now carries `isFoundationModel: true`. |
| UC-004 | `src/data/landscape.ts` `sevennet_nano` node | Tagged "foundation model" / use case "lightweight foundation MLIP" | The paper (arXiv:2604.10887) presents it as a lightweight *universal* MLIP distilled **from** the SevenNet-Omni foundation model; it does not label itself a foundation model. | resolved | Phase 2 (2026-06-11): retagged to "universal MLIP"; `isFoundationModel: "unknown"` with evidence note; cost/speed/accuracy now separated (`low` / `fast` / `unknown`) with sources. |
| UC-005 | `src/data/landscape.ts` `cgcnn` node | Tagged "foundation" | CGCNN (2018, arXiv:1710.10324) is a per-property crystal-graph prediction network predating pretrained universal potentials; the tag meant "foundational ancestor" (per its own description), which a foundation-model filter would misread. | resolved | Phase 2 (2026-06-11): tag replaced with "precursor"; `isFoundationModel: false` with evidence. |
<!-- AUTOGEN:END unsupported-claims -->
