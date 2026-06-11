# Model Metadata Warnings

Per-model metadata caveats found during curation: fields that look suspicious,
over-claimed, or unverified and need a human (ideally the model's developers)
to confirm or correct.

- **Severity:** `high` (likely wrong / over-claim) · `medium` (uncertain) ·
  `low` (cosmetic / coverage gap).
- A future script that cross-checks the data (e.g. flags entries with no
  `verifiedSources`, or `verificationStatus` absent) should write its rows
  between the `AUTOGEN` markers.

_Last updated: 2026-06-11 (manual)._

## Standing notes

- **All entries are implicitly `needs_review` until audited.** Entries resolve
  to `needs_review` via `effectiveVerificationStatus` unless a curator sets a
  status. This is intentional: the UI must not present un-curated metadata as
  authoritative. Promote an entry to `verified` / `partially_verified` only
  after checking its sources and populating `verifiedSources` +
  `lastVerifiedDate`.
- **2026-06-11 foundation-label sweep:** 45 of 116 entries carry a
  "foundation"/"universal" tag or use case. Five were audited and corrected or
  confirmed (`mace`, `mace_mp0`, `sevennet_nano`, `sevennet_omni`, `cgcnn` —
  see `unsupported_claims.md` UC-003..UC-005). The remaining ~40 are mostly
  plausibly genuine trained foundation models (e.g. UMA, MatterSim, DPA-2/3,
  CHGNet, M3GNet, PFP, Orb-v2) but are **not yet source-checked**; they stay
  `needs_review` until the systematic reference audit
  (`references_audit_report.md`) covers them. Do not treat the tag as a
  verified claim in the meantime.
- **2026-06-11 Phase 3 capability seeding:** the new capability filters were
  seeded only from definitional, in-repo-description-backed cases (each with a
  per-model `evidenceNotes`): `hasMultipleExperts` (UMA, Allegro-MoE, eSEN-MoE,
  MatRIS-MoE), `hasMultipleHeads` (MACE-MH-1, HydraGNN-GFM),
  `hasUncertaintyEstimates` (FLARE, PET-UAFD). `hasDenoisingPretraining` is
  **intentionally left empty** — no model's in-repo description documents a
  denoising objective, and it was not guessed. ACNN was deliberately NOT marked
  `hasMultipleHeads` (its "multi-head attention" is transformer attention, not
  multiple output heads). These are per-claim checks only; the entries
  otherwise remain `needs_review`. **TODO:** source-check denoising pretraining
  (e.g. Orb / DPA families) and broaden capability coverage.
- **2026-06-11 Phase 4 dataset registry:** added `src/data/datasets.ts`
  (normalized ids + aliases). Flagship datasets OMol25 (arXiv:2505.08762),
  OMat24 (arXiv:2410.12771, CC-BY-4.0) and OC20 (arXiv:2010.09990) are
  source-checked (`partially_verified`); the remaining ~20 registry entries are
  `needs_review` with **no guessed URLs** — verify their `paperUrl` / `license`
  during the reference audit. `trainedDatasets` was normalized for the 11
  OMol25-trained models so the "Trained on OMol25" filter is complete; only
  `omol25` is in `FILTERABLE_DATASET_IDS`. **TODO:** normalize `trainedDatasets`
  for the rest of the catalogue, then expose more datasets in the filter; add
  the fine-tuning / evaluation / benchmark relationship types.
- **2026-06-11 Phase 5 edge confidence:** all 181 graph edges now carry an
  effective trust tier. Mapping decision: edges without explicit
  `edgeConfidence` inherit the historical curation — solid edges =
  `probable` (curator-asserted lineage, not source-checked), dashed =
  `speculative`. Four edges were source-verified (see
  `references_audit_report.md`): MACE→MACE-MP-0, SevenNet-Omni→SevenNet-Nano,
  eSEN→UMA, SevenNet→SevenNet-Omni. One candidate was deliberately NOT
  verified: TFN→NequIP (the search confirmed NequIP's E(3)-equivariant
  convolutions but not the explicit TFN citation — stays `probable`).
  The default graph shows no edges; "Show connections" draws verified only;
  probable/speculative require the explicit "Include unverified edges" toggle
  and render faded/dashed. **TODO:** source-check the remaining 98 probable +
  79 speculative edges during the systematic reference audit.
- **2026-06-11 Phase 6 — OrbMol-v2 added** (`partially_verified`,
  `llm_assisted`) from official sources only: the Hugging Face model card
  (`Orbital-Materials/orbmol-v2`) and the orb-models repo/release notes,
  corroborated across two independent search passes (direct page fetch is
  blocked by this environment's network policy — full card review pending).
  The LinkedIn post Tim shared was treated as a pointer, not a source, and a
  search-summary claim attributing arXiv:2505.08762 (the OMol25 paper) to
  OrbMol-v2 was caught and rejected. Lineage edge OrbMol→OrbMol-v2 verified.
  `accuracyTier` left "unknown" (GSCDB138 numbers are developer-reported);
  `isFoundationModel` left "unknown"; OPoly26 added to the registry as
  `needs_review` (no primary source yet) and intentionally NOT exposed in the
  dataset filter until verified.

<!-- AUTOGEN:START metadata-warnings -->
| model id | field | current value | concern | severity | suggested action |
| --- | --- | --- | --- | --- | --- |
| esen | tags / entityType | "foundation model" tag; entityType unset | eSEN is described as the backbone under UMA (architecture-flavoured) but also lists OMat24/MPTrj trainingData — released trained checkpoints exist, so the entry mixes architecture and trained model. | medium | Decide whether to split into architecture + checkpoint entries or classify as model_family; verify against arXiv:2502.12147 before labelling. |
| grace | tags / entityType | "foundation model" tag; entityType unset | Entry describes a "foundation-scale implementation of ACE" — ambiguous whether it stands for the architecture or the pretrained GRACE universal models. | medium | Verify against the GRACE paper/repo; classify entityType and move labels accordingly. |
| sevennet | entityType | unset | Base SevenNet entry covers the architecture *and* the released SevenNet-0 pretrained potential family. | medium | Decide architecture vs model_family split; verify against arXiv:2402.03789. |
| sevennet_nano, sevennet_omni | tags vs equivariance | tag "invariant" but `equivariance: "constrained"` and category "Equivariant" | Internally inconsistent — SevenNet is NequIP-derived (equivariant); the "invariant" tag looks like a copy-paste error but has not been source-checked. | medium | Verify the architectures' symmetry handling in arXiv:2604.10887 / 2510.11241 and fix either the tag or the equivariance field. |
| ~40 foundation-tagged entries | tags | "foundation model" / "universal" | Labels plausible but unverified (see standing note on the 2026-06-11 sweep). | low | Source-check during the systematic reference audit; record outcomes in `references_audit_report.md`. |
| orbmol | paperUrl | https://www.orbitalmaterials.com/posts/... | 2026-06-11 search results show the OrbMol announcement now hosted at orbitalindustries.com — the recorded orbitalmaterials.com URL may redirect or be dead. | low | Run the link checker; update the URL if the domain moved. |
| orbmol_v2 | properties / frameworks | energy, forces / ASE | Inherited from the OrbMol entry pending confirmation against the model card (noted in the entry's evidenceNotes). | low | Confirm property/framework support during full model-card review. |
| mace | tags / useCases | ~~"foundation model", "universal MLIP"~~ | **Resolved 2026-06-11** — labels moved off the base architecture entry (see UC-003). | — | Done: `entityType: architecture`, `hasFoundationVariant: true`, evidence + sources recorded on the entry. |
<!-- AUTOGEN:END metadata-warnings -->
