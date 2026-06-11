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

<!-- AUTOGEN:START metadata-warnings -->
| model id | field | current value | concern | severity | suggested action |
| --- | --- | --- | --- | --- | --- |
| esen | tags / entityType | "foundation model" tag; entityType unset | eSEN is described as the backbone under UMA (architecture-flavoured) but also lists OMat24/MPTrj trainingData — released trained checkpoints exist, so the entry mixes architecture and trained model. | medium | Decide whether to split into architecture + checkpoint entries or classify as model_family; verify against arXiv:2502.12147 before labelling. |
| grace | tags / entityType | "foundation model" tag; entityType unset | Entry describes a "foundation-scale implementation of ACE" — ambiguous whether it stands for the architecture or the pretrained GRACE universal models. | medium | Verify against the GRACE paper/repo; classify entityType and move labels accordingly. |
| sevennet | entityType | unset | Base SevenNet entry covers the architecture *and* the released SevenNet-0 pretrained potential family. | medium | Decide architecture vs model_family split; verify against arXiv:2402.03789. |
| sevennet_nano, sevennet_omni | tags vs equivariance | tag "invariant" but `equivariance: "constrained"` and category "Equivariant" | Internally inconsistent — SevenNet is NequIP-derived (equivariant); the "invariant" tag looks like a copy-paste error but has not been source-checked. | medium | Verify the architectures' symmetry handling in arXiv:2604.10887 / 2510.11241 and fix either the tag or the equivariance field. |
| ~40 foundation-tagged entries | tags | "foundation model" / "universal" | Labels plausible but unverified (see standing note on the 2026-06-11 sweep). | low | Source-check during the systematic reference audit; record outcomes in `references_audit_report.md`. |
| mace | tags / useCases | ~~"foundation model", "universal MLIP"~~ | **Resolved 2026-06-11** — labels moved off the base architecture entry (see UC-003). | — | Done: `entityType: architecture`, `hasFoundationVariant: true`, evidence + sources recorded on the entry. |
<!-- AUTOGEN:END metadata-warnings -->
