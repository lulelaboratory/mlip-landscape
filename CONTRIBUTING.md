# Contributing to MLIP Hub

Thanks for your interest in contributing to **[MLIP Hub](https://www.mliphub.com)**! The most valuable contributions are **new model entries, corrected links, better descriptions, and new conceptual edges** — all driven by the data in `src/data/landscape.ts`.

This guide walks through the local workflow, the data schema, the coordinate system, and the review bar.

---

## Local development

1. Fork this repo and clone your fork.
2. Install dependencies:

       npm install

3. Run the dev server:

       npm run dev

4. Open `http://localhost:3000` and make your changes.

Before opening a PR, all three of these must pass:

    npm run lint
    npm run check:landscape
    npm run build

The same checks run in CI.

---

## The data schema (`src/data/landscape.ts`)

Everything on the canvas is defined in this one file. There are three shapes:

### `ModelNode` — a card on the canvas

```ts
{
  id: string;                       // unique, lowercase, no spaces (e.g. "mace", "orb_v3")
  type: "node";
  category: "Equivariant" | "Invariant" | "Transformer" | "Descriptor";
  label: string;                    // display name (e.g. "MACE", "Orb-v3")
  year: number;                     // publication year
  author: string;                   // lab / org (e.g. "Cambridge (Csányi group)")
  x: number;                        // canvas x coordinate (top-left of card)
  y: number;                        // canvas y coordinate
  desc: string;                     // 1-2 sentence technical description
  githubUrl?: string;               // required for new models
  paperUrl?: string;                // strongly preferred (arXiv > journal > preprint)
  isNew?: boolean;                  // optional: animates the card briefly
  dimmed?: boolean;                 // computed at render-time; don't set manually
}
```

### `GroupNode` — a zone (background band)

```ts
{
  id: string;
  type: "group";
  label: string;                    // zone title
  x: number;                        // top-left
  y: number;
  width: number;
  height: number;
}
```

There are currently two zones: `zone_eq` (Equivariant & Transformers) and `zone_inv` (Invariant & Descriptors). Usually you won't touch these.

### `Edge` — a conceptual relationship

```ts
{
  from: string;                     // ModelNode.id
  to: string;                       // ModelNode.id
  label?: string;                   // short label drawn along the curve
  dashed?: boolean;                 // dashed line for weaker / speculative links
}
```

---

## Adding a model — step by step

1. **Pick a category** (`Equivariant`, `Invariant`, `Transformer`, or `Descriptor`).
2. **Find an empty slot** on the canvas. See the **Coordinate system** section below.
3. **Add the node object** in the appropriate lane section of `INITIAL_NODES`.
4. **Add 1–3 conceptual edges** tying it into the existing lineage (its predecessor, a concurrent peer, or a successor).
5. **Run the checks:**

       npm run check:landscape
       npm run dev

6. Visit `http://localhost:3000`, verify the card appears, click it, confirm the sidebar links work, and toggle filters.
7. Commit and open a PR.

---

## Coordinate system

The canvas uses absolute positioning. Key constants:

- **Card size:** `CARD_WIDTH = 176`, `CARD_HEIGHT = 72`
- **Zones:**
  - `zone_eq`: `x=50, y=50, width=1660, height=400` (top band)
  - `zone_inv`: `x=50, y=480, width=1100, height=500` (bottom band)

### Current lane layout

| Lane | Purpose | y | Typical x's (column grid) |
|------|---------|---|----------------------------|
| Lane 1a | Equivariant + foundation models (top row of `zone_eq`) | 150 | 100, 380, 660, 950, 1230, 1510 |
| Lane 1b | Equivariant + foundation models (second row) | 320 | same as 1a |
| Lane 2 | Descriptors & industrial workhorses | 550 | 100, 380, 660, 950 |
| Lane 2b | Descriptor mid-row | 650 | 100, 380, 660, 950 |
| Lane 3 | Invariant GNNs | 750 | 100, 380, 660, 950 |
| Lane 3b | Speed-optimized / derived | 900 | 100, 380, 660, 950, 1230 |

Horizontal spacing is **~280 units** between column centres. Keep it consistent so the layout stays readable.

### Rules

- Cards must not overlap each other. `npm run check:landscape` will fail if they do.
- If all existing slots are full, either:
  - widen `zone_eq`/`zone_inv` (update `width` and add a new column), **or**
  - open an issue first to discuss whether a layout redesign is warranted.
- Don't re-position existing nodes without explaining why — the current placement encodes intentional historical/architectural ordering.

---

## URL & description conventions

- **`githubUrl`** is **required** for new models. Point at the canonical implementation (not a fork).
- **`paperUrl`** is **strongly preferred**, in this order: arXiv > published journal > preprint server > blog post. Avoid marketing pages.
- **Descriptions** must be:
  - 1–2 sentences, ≤ ~280 characters
  - Technical, not promotional ("achieves SOTA on X" ✅; "revolutionary new model" ❌)
  - Specific to what the architecture does, not generic MLIP language
- **`label`** should be the canonical name users will search for. Don't embed version numbers in the label unless the version is the commonly-used identifier (e.g., `"Orb-v3"` ✅, `"MACE v0.3.8"` ❌).

---

## Review bar

MLIP Hub is **open and curator-reviewed**. Any published MLIP with a public code repository is eligible. A curator (currently the Lule Laboratory team) makes the final call based on:

- **Relevance** — does this add a genuinely distinct architecture, training dataset, or use case?
- **Maintained status** — is the code repo archived, or actively maintained?
- **Distinctiveness** — does this belong as its own node, or is it a minor variant better folded into an existing entry's description?

We don't require a citation threshold, but we reserve the right to decline models that aren't yet distinct enough to justify a node on the map. If in doubt, open an **Add a model** issue first to discuss placement before spending time on a PR.

---

## Pull request checklist

When you open a PR the template will ask you to confirm:

- [ ] `npm run lint` passes
- [ ] `npm run check:landscape` passes
- [ ] `npm run build` passes
- [ ] For UI changes: screenshots or a short video (mobile + desktop where relevant)
- [ ] For new models: rationale — why this model deserves its own node, what its lineage is, why this placement

One feature or bugfix per PR when possible. Keep PR descriptions short and specific.

---

## Optional model metadata (ModelMeta)

`ModelNode` also accepts a set of **optional** fields used by the compare
view, permalinks, and the editorial-policy coverage report. New entries are
not required to fill *all* of them, but filling them makes the entry much
more useful.

| Field             | Type                                       | Example                              |
| ----------------- | ------------------------------------------ | ------------------------------------ |
| `coverage`        | `string[]`                                 | `["oxides","organic molecules"]`     |
| `useCases`        | `string[]`                                 | `["MD at scale","reaction sampling"]`|
| `properties`      | `PropertyTag[]`                            | `["energy","forces","stress"]`       |
| `frameworks`      | `FrameworkTag[]`                           | `["ASE","LAMMPS"]`                   |
| `license`         | SPDX id                                    | `"MIT"`, `"Apache-2.0"`              |
| `maintenance`     | `"active"`/`"maintained"`/`"archived"`/`"experimental"` | `"active"` |
| `lastReviewed`    | ISO date (`YYYY-MM-DD`) or `"unknown"`     | `"2026-04-19"`                       |
| `lastUpdated`     | ISO date                                   | `"2026-03-01"`                       |
| `trainingData`    | `string[]`                                 | `["MPTrj","OC20"]`                   |
| `tags`            | `string[]`                                 | `["foundation model","transformer"]` |
| `supportsCharges` | `boolean \| null`                          | `true` (charge-conditioned) / `false` / `null` (unknown) |
| `supportsSpins`   | `boolean \| null`                          | `true` (spin-conditioned) / `false` / `null` (unknown)   |
| `elementsCovered` | `string \| null`                           | `"H, C, N, O, S, F, Cl"`, `"all elements up to Z=94"`, `"—"` |

`npm run check:landscape` enum-validates `maintenance`, `frameworks`,
`properties`; validates date formats; warns on unknown SPDX licenses; warns
when `supportsCharges` / `supportsSpins` / `elementsCovered` are missing
on a model; and prints a per-field metadata coverage report.

### Required-for-new-entries fields

The three capability fields above are **required for new entries** so that
users searching by capability can rely on the result. Pick one of:

- `true` / `false` for booleans when the capability is documented in the
  model's paper or repo
- `null` if the data is genuinely unknown
- For `elementsCovered`, prefer an explicit list (`"H, C, N, O"`) or a
  shorthand (`"89 elements"`, `"all elements up to Z=94"`); use `"—"` only
  if no information is available. Never leave the field as `""`.

---

## Schema stability (data snapshots)

`npm run export:landscape` writes versioned snapshots to
`public/data/landscape-v<version>.json` (and a `-latest.json` + CSV). Once a
snapshot is published, external citers may rely on the field names. Therefore:

- **Additive changes only** (new optional fields): safe.
- **Renames or removals**: bump `SCHEMA_VERSION` in
  [`scripts/export-landscape.ts`](./scripts/export-landscape.ts) and coordinate
  with a major version bump.

---

## Citation metadata: `CITATION.cff` vs `.zenodo.json`

The repo ships both, on purpose:

- **`CITATION.cff`** — read by GitHub's "Cite this repository" widget.
- **`.zenodo.json`** — read by Zenodo. If both are present, Zenodo prioritizes
  `.zenodo.json`.

Treat `.zenodo.json` as the authoritative source for Zenodo metadata and keep
`authors` / `version` / `date-released` in sync across both files for each
tagged release. Add this to the pre-release checklist:

- [ ] `CITATION.cff`: bump `version` + `date-released`; update `authors` if
      the citation author list changed.
- [ ] `.zenodo.json`: mirror `creators` / keywords / related_identifiers.
- [ ] `package.json`: bump `version`.
- [ ] `npm run check:landscape && npm run export:landscape` — confirms
      `public/data/landscape-v<new>.json` is emitted.

---

## Code of conduct

Participation in this project is subject to our [Code of Conduct](./CODE_OF_CONDUCT.md). Contact `support@mliphub.com` to report concerns.

---

Thanks — every contribution makes the MLIP landscape a little easier to navigate for the next person.
