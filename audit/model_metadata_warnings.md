# Model Metadata Warnings

Per-model metadata caveats found during curation: fields that look suspicious,
over-claimed, or unverified and need a human (ideally the model's developers)
to confirm or correct.

- **Severity:** `high` (likely wrong / over-claim) · `medium` (uncertain) ·
  `low` (cosmetic / coverage gap).
- A future script that cross-checks the data (e.g. flags entries with no
  `verifiedSources`, or `verificationStatus` absent) should write its rows
  between the `AUTOGEN` markers.

_Last updated: 2026-06-06 (manual)._

## Standing notes

- **All entries are implicitly `needs_review` until audited.** As of Phase 1,
  zero models set `verificationStatus`, so every entry resolves to
  `needs_review` via `effectiveVerificationStatus`. This is intentional: the UI
  must not present un-curated metadata as authoritative. Promote an entry to
  `verified` / `partially_verified` only after checking its sources and
  populating `verifiedSources` + `lastVerifiedDate`.

<!-- AUTOGEN:START metadata-warnings -->
| model id | field | current value | concern | severity | suggested action |
| --- | --- | --- | --- | --- | --- |
| mace | tags / useCases | "foundation model", "universal MLIP" | MACE is the base architecture; foundation/universal labels belong on `mace_mp0` / MACE-foundations, not the base entry. | high | Phase 2: move foundation/universal labels to the foundation variant; set `entityType: architecture` on base MACE. |
<!-- AUTOGEN:END metadata-warnings -->
