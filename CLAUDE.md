# CLAUDE.md

Guidance for Claude Code (and other agents) working in this repository.

## What this project is

**MLIP Hub** (mliphub.com) is a curated, interactive map of machine-learning
interatomic potentials (MLIPs), built as a **static Next.js + Tailwind** site so the
published snapshot is fully reproducible.

- **Single source of truth:** `src/data/landscape.ts` — TypeScript object literals
  `INITIAL_NODES` (model cards `ModelNode` + background `GroupNode` zones) and
  `INITIAL_EDGES` (lineage `Edge`s). The `ModelNode` / `Edge` / `ModelMeta` types live
  in the same file. **The catalogue is TypeScript, not JSON/YAML/Markdown.**
- **Dataset registry:** `src/data/datasets.ts` — normalized datasets keyed by
  `datasetId`; a model links to them via `trainedDatasets`.
- **Generated snapshots:** `public/data/landscape-v<version>.json`,
  `landscape-latest.json`, and `*.csv` are **emitted by `scripts/export-landscape.ts`**
  from the source above. Never hand-edit them.
- **Key commands:** `npm run lint`, `npm run check:landscape` (data validator),
  `npm run export:landscape` (regenerate snapshots), `npm run build`
  (`prebuild` runs check + export).

Full schema, the canvas **coordinate/lane system**, and the complete `ModelMeta` field
tables are documented in [`CONTRIBUTING.md`](./CONTRIBUTING.md) — consult it rather
than guessing field shapes.

## Updating the catalogue with new MLIPs

Use this checklist when asked to discover newly published MLIPs and add them.

1. **Discover** (last ~30–60 days). Search arXiv (`physics.chem-ph`,
   `cond-mat.mtrl-sci`, `cs.LG`), npj Comp. Mat., Nature Comp. Sci., JCTC,
   J. Chem. Phys., OpenKIM, plus Hugging Face model cards and GitHub releases.
   Keywords: "machine learning interatomic potential", "neural network potential",
   "graph / equivariant neural network potential", "foundation model interatomic
   potential". Record each candidate's arXiv ID / DOI / GitHub URL.

2. **Diff** against the catalogue. Read `INITIAL_NODES` in `src/data/landscape.ts` and
   `src/data/datasets.ts`; `public/data/landscape-latest.json` is a flat list you can
   scan. Drop anything already present, matching by `id` **and** `label` (and
   `architectureFamily`), including minor variants better folded into an existing
   entry's `desc`. If nothing is novel, stop and output
   **"No new MLIPs found. System is up to date."**

3. **Add** each new model to `src/data/landscape.ts` (a `ModelNode` object literal):
   - Required: `id` (unique, lowercase), `type:"node"`, `category`
     (`Equivariant|Invariant|Transformer|Descriptor`), `label`, `year`, `author`,
     `x`, `y`, `desc` (1–2 sentences, ≤280 chars, technical). `githubUrl` is required;
     `paperUrl` strongly preferred (arXiv > journal > preprint).
   - Place it on a free slot per the **Coordinate system** in `CONTRIBUTING.md`
     (lane `y` values; column `x`'s ~280 apart). Cards must not overlap —
     `check:landscape` fails if they do.
   - Required-for-new capability fields: `supportsCharges`, `supportsSpins`
     (`boolean | null`), `elementsCovered` (non-empty string; `"—"` if unknown).
   - Verification/identity metadata: `verificationStatus`
     (`"partially_verified"` or `"unverified"` — **never** `"verified"` without human
     sign-off), `verifiedSources` (URLs/DOIs actually checked; required when
     partially/verified), `lastVerifiedDate`, `verifiedBy:"llm_assisted"`,
     `evidenceNotes`. Set `entityType` (distinguish an architecture from a trained
     model/family). Any non-`"unknown"` speed/accuracy/foundation claim **requires**
     its matching `*Evidence` field.
   - If trained on a known dataset, link via `trainedDatasets` using `datasetId`s from
     `src/data/datasets.ts` (add a registry entry first if missing); keep this separate
     from the free-form `trainingData` text.
   - Add 1–3 `Edge` objects to `INITIAL_EDGES` tying it into the lineage. If you set
     `edgeConfidence:"verified"`, include `edgeSource`.

4. **Validate & regenerate**, in order — all must pass:
   `npm run lint` → `npm run check:landscape` → `npm run export:landscape` →
   `npm run build`. The export rewrites `public/data/`; **commit those changes** or CI's
   "Verify exported snapshots are committed" step fails. Do **not** bump the
   `package.json` version per model.

5. **Commit on a branch and open a PR** — do not push to `main`:
   - `git add src/data/landscape.ts src/data/datasets.ts public/data`
   - `git commit -m "feat(data): auto-update MLIP database with <Model Names>"`
     (keep this exact prefix — it matches existing history)
   - `git push -u origin <branch>`, then open a PR into `main` for curator review.

## Guardrails

- **Verify or skip.** Only add a model whose arXiv ID, DOI, or public GitHub repo you
  confirmed; store those URLs in `verifiedSources`. No hallucinated models or links.
- **Prefer `"unknown"` / absent over a guess.** The catalogue must never present
  uncertain metadata as ground truth; `"unknown"` (reviewed, undetermined) and absent
  (not yet reviewed) are distinct and neither counts as `false`.
- **Never push straight to `main`.** Auto-added entries are `llm_assisted` and need
  human sign-off; land them through a PR.
- **Snapshots are generated.** Edit `src/data/landscape.ts`, then run
  `export:landscape` and commit `public/data/` — don't hand-edit the JSON/CSV.
- On push rejection: `git pull --rebase origin <branch>`, then retry. On an
  unrecoverable error: stop, `git restore` uncommitted changes, and report what failed.
