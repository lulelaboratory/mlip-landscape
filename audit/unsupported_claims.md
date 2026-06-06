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

_Last updated: 2026-06-06 (manual)._

<!-- AUTOGEN:START unsupported-claims -->
| id | location | claim | why unsupported | status | resolution |
| --- | --- | --- | --- | --- | --- |
| UC-001 | `src/components/MLIPExplorer.tsx` detail panel | "Data Scale: Universal (Foundational)" shown for many models | Derived purely from the card's canvas x-coordinate (`x > 600`), not from any data field. Mislabels e.g. MACE (x=660). | resolved | Phase 1: replaced with a "Not yet verified" placeholder. Phase 2 will add a curated `trainingScope` field. |
| UC-002 | `src/components/MLIPExplorer.tsx` detail panel | "Inference: High cost / high accuracy" shown for equivariant models | Derived purely from `category === "Equivariant"`, not from any benchmark. Mislabels distilled/lightweight models such as SevenNet-Nano. | resolved | Phase 1: replaced with a "Not yet verified" placeholder. Phase 2 will add curated `inferenceCost` / `accuracyTier` / `speedTier` fields. |
| UC-003 | `src/data/landscape.ts` `mace` node | Base MACE tagged "foundation model" with use case "universal MLIP" | MACE is an architecture; the universal/foundation family is the separate `mace_mp0` / MACE-foundations entries. The base entry over-claims. | deferred | Phase 2: split architecture vs. trained model and move foundation/universal labels onto the foundation variants only. Recorded here, data left unchanged in Phase 1. |
<!-- AUTOGEN:END unsupported-claims -->
