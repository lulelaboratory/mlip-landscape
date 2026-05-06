# MLIP Hub: Interatomic Potential Explorer

[![CI](https://github.com/lulelaboratory/mlip-landscape/actions/workflows/ci.yml/badge.svg)](https://github.com/lulelaboratory/mlip-landscape/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.19767545.svg)](https://doi.org/10.5281/zenodo.19767545)

**MLIP Hub** is a curated, interactive map of machine-learning interatomic
potentials (MLIPs) — equivariant, invariant, descriptor, and transformer-style
foundation models — built as a static Next.js + Tailwind site so the snapshot
is fully reproducible.

**Live:** [https://www.mliphub.com](https://www.mliphub.com)
· [Cite](https://www.mliphub.com/cite)
· [Editorial policy](https://www.mliphub.com/policy)
· [Contributors](https://www.mliphub.com/contributors)
· [Contribute](https://www.mliphub.com/contribute)
· [GitHub](https://github.com/lulelaboratory/mlip-landscape)
· [Data snapshots](https://www.mliphub.com/data/landscape-latest.json)

---

## Release status

The current public release is **v2.0.0** — a major refresh that adds the new
**Timeline (Tree of Life)** layout, retunes the force-directed simulation so
it stays readable as the catalogue grows, auto-fits the layered group zones
around their cards, and bumps the on-canvas typography (edge labels and group
headings) for better legibility.

The snapshot referenced by the companion arXiv manuscript is **v0.3.0**;
v2.0.0 extends that catalogue with new entries and visual improvements.
Pin to v2.0.0 (or the matching dataset snapshot under
`public/data/landscape-v2.0.0.{json,csv}`) for exact reproducibility against
the current site.

### What's new in v2.0.0

- **Timeline (Tree of Life) layout** — left-to-right by year with month
  ticks and one lane per architecture family, switchable from the layout
  panel.
- **Force-directed redesign** — category-clustered seeding,
  size-adaptive forces, link-aware repulsion, and a stronger collision
  pass keep the experimental view legible even with many more cards.
- **Auto-fit layered zones** — the dashed group rectangles
  (*Equivariant & Transformers*, *Invariant & Descriptors*) recompute
  their bounds from the cards inside them on every render, so newly
  added models on the right edge no longer poke outside the box.
- **Larger on-canvas typography** — edge labels and zone headings have
  been bumped up so they remain readable at default zoom.
- **Updated dataset snapshot** — `public/data/landscape-v2.0.0.json`
  pins the catalogue served by the live site.

### Improvements since v2.0.0

The live site at [mliphub.com](https://www.mliphub.com) tracks `main` and
ships several post-release improvements on top of the v2.0.0 archive:

- **Multi-axis tag filters** — Equivariance (Constrained / Learnt /
  Invariant), Architecture (Descriptor / GNN), Attention, and Long-Range
  filters live alongside the category and search filters in the left
  panel. Models with unverified tag values are dimmed when an axis is
  active.
- **Clickable lineage edges** — every edge has a halo + colored stroke
  with an optional label; clicking an edge opens a connection panel that
  describes the relationship and links to both endpoints.
- **Larger filter panel + 10–150 % zoom range** — the filter panel was
  widened so chip rows wrap cleanly, and the zoom controls / wheel zoom
  span a flat 10 %–150 % effective range regardless of which auto-fit
  the layout picks.
- **Centered auto-fit per layout** — switching between Layered,
  Force-directed, and Timeline now resets to a centered auto-fit instead
  of inheriting the previous layout's pan and zoom.
- **Edges read above the cards** — long edges that visually cross an
  unrelated card are masked by that card, and edge labels gain a halo
  + background rect so the words remain readable on top of any colour.
- **Cross-referenced metadata** — the catalogue has been audited
  against [Kulichenko et al. 2024 *Chem. Rev.*](https://doi.org/10.1021/acs.chemrev.4c00153)
  and the `ModelMeta` coverage backfilled across the catalogue (license,
  maintenance, training data, capability flags).
- **Color buckets** — cards are coloured by primary architectural
  bucket (Equivariant, Invariant GNN, Descriptor, Learnt equivariance,
  Unclassified) so the colour tracks the dominant taxonomic split
  rather than the four legacy categories alone.

These improvements will roll into the next tagged release; pin to
v2.0.0 (or the matching dataset snapshot under
`public/data/landscape-v2.0.0.{json,csv}`) for the exact catalogue
archived on Zenodo.

---

## What is MLIP Hub?

MLIP Hub is a **curated landscape**, not a benchmark. It catalogues published
MLIP architectures and foundation models and organises them by their
conceptual lineage (descriptor → invariant GNN → equivariant GNN → equivariant
transformer / foundation model). For each model we record:

- canonical code repository and paper/preprint URL
- year and originating lab/author
- license, maintenance status, last-reviewed date
- training data, framework integrations, predicted properties
- capability flags (`supportsCharges`, `supportsSpins`, `elementsCovered`)
- a curated lineage edge to one or more antecedent or peer models

The dataset is **community-maintained metadata**: the curators do not endorse
particular models, run benchmarks, or claim completeness. Capability fields
where the answer is genuinely unknown carry `null` (or `"—"` for
`elementsCovered`) rather than guessed values.

## What the website shows

The app visualises the catalogue as an explorable graph with:

- **Zones** for the four model families (Equivariant, Invariant, Transformer,
  Descriptor)
- **Nodes** for specific models (NequIP, Allegro, MACE, Orb-v3, CHGNet, …),
  coloured by primary architectural bucket (Equivariant, Invariant GNN,
  Descriptor, Learnt equivariance, Unclassified) so colour tracks the
  dominant taxonomic split
- **Clickable lineage edges** capturing the conceptual / architectural
  link between models. Each edge has a halo + coloured stroke with an
  optional label; clicking opens a connection panel describing the
  relationship and linking to both endpoints. A label on/off toggle
  hides the words when the graph gets dense.
- A **layout switcher** with the curated *Layered* view as the default,
  an optional *Force-directed* view marked **Experimental** (built-in
  deterministic simulation, no extra runtime dependency), and a
  *Timeline (Tree of Life)* view that arranges cards left-to-right by
  release year (with month ticks) across one lane per architecture
  family. Each layout opens at a centered auto-fit; zoom is driven by
  the −/+ buttons and the mouse wheel / pinch gesture across a 10–150 %
  effective range. The chosen layout persists across navigation and
  reloads via the `?layout=` query parameter and `localStorage`. The
  version cited in the arXiv paper uses the layered layout.
- **Multi-axis tag filters** — Equivariance (Constrained / Learnt /
  Invariant), Architecture (Descriptor / GNN), Attention, and
  Long-Range filters in the left panel narrow the view independently of
  the category and free-text filters. Models with unverified tag values
  are dimmed when an axis is active.
- A **Cite current selection** button that copies a citation for the
  current view (filters, layout, selected model) to the clipboard
- A **detail sidebar** with links to code, papers, and a web search
  shortcut
- A **table view** (`/models`) and a **compare view** (`/compare`) with
  side-by-side capability comparison and CSV export
- **Search** across model names, authors, tags, frameworks, licenses, and
  coverage facets, with autosuggestion
- **Light / dark theme** with a high-contrast media-query fallback and a
  colour-blind-safe palette toggle

## Tech stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **Backend:** Static data served by the Next.js App Router — no external API
- **Deployment (recommended):** Vercel

Contact: [support@mliphub.com](mailto:support@mliphub.com)

---

## Getting started

### 1. Prerequisites

- Node.js (LTS recommended)
- npm or pnpm or yarn

Check versions:

    node -v
    npm -v

### 2. Install dependencies

Clone the repo:

    git clone https://github.com/lulelaboratory/mlip-landscape.git
    cd mlip-landscape

Install packages:

    npm install

### 3. Environment variables

No environment variables are required for the static site. If you add new
integrations later, copy `.env.local.example` and fill in whatever values you
need.

### 4. Run in development

    npm run dev

Then open:

    http://localhost:3000

You should see the MLIP Hub map with zones and colored nodes.
Click a node to open the detail sidebar and see links to GitHub, papers, and
web search.

---

## Project structure (key files)

    src/
      app/
        layout.tsx              # Root layout with Tailwind import
        page.tsx                # Renders the MLIPExplorer component
        cite/, policy/, ...     # Citation, editorial policy, etc.
        compare/, models/       # Compare view, table view
        globals.css             # Global styles (Tailwind 4 style)
      components/
        MLIPExplorer.tsx        # Main interactive canvas (nodes, edges, filters, sidebar)
      data/
        landscape.ts            # Node + edge definitions for MLIP models and zones
    public/data/
      landscape-v<version>.json # Versioned data snapshot (and a sibling .csv)
      landscape-latest.json     # Always tracks the latest tagged release
    scripts/
      check-landscape.ts        # Validates landscape.ts for required fields, IDs, edges
      export-landscape.ts       # Emits the public/data snapshots from landscape.ts

---

## Data snapshots

`npm run export:landscape` emits versioned snapshots into `public/data/`:

- `public/data/landscape-v<version>.json` — pinned to the current package
  version
- `public/data/landscape-v<version>.csv` — CSV of the tabular fields
- `public/data/landscape-latest.json` — always tracks the latest release

The site serves these files at `/data/landscape-v<version>.json` and
`/data/landscape-latest.json`, so users can cite the **exact dataset snapshot**
they used. The schema version is recorded inside each JSON payload.

---

## Local reproduction

To reproduce the v2.0.0 snapshot locally:

    git clone https://github.com/lulelaboratory/mlip-landscape.git
    cd mlip-landscape
    git checkout v2.0.0
    npm install
    npm run check:landscape
    npm run export:landscape
    npm run build
    npm run start

The exported dataset matches the files committed under
`public/data/landscape-v2.0.0.*` and the JSON served by the live site.
The v0.3.0 snapshot — the version cited in the companion arXiv paper —
remains available at `public/data/landscape-v0.3.0.*`.

---

## Citing MLIP Hub

MLIP Hub is a **curated scientific software + data product**. We recommend a
two-level citation:

- **Cite MLIP Hub** when you use the map, taxonomy, curation decisions, or
  metadata organization.
- **Cite the original model papers/software** when you rely on a specific
  model scientifically — follow each model card's `paperUrl` and `githubUrl`.
- **Cite the exact dataset snapshot** when you depend on a specific version
  of the curated metadata. Use the file under `public/data/landscape-v<version>.json`
  and reference its `version` and `generatedAt` fields.

The repository ships [`CITATION.cff`](./CITATION.cff) (read by GitHub's "Cite
this repository" widget) and [`.zenodo.json`](./.zenodo.json) (authoritative
for Zenodo). Starting with `v0.2.0`, each tagged release is archived on Zenodo
with its own DOI plus a concept DOI pointing at the latest version.

See [`/cite`](https://www.mliphub.com/cite) for the preferred citation text
and BibTeX, and [`CONTRIBUTORS.md`](./CONTRIBUTORS.md) for the separation
between citation authors and the broader contributor community.

---

## License

Licensed under the MIT License — see [LICENSE](./LICENSE).

---

## Contributing

We welcome contributions — especially new model entries, corrected links, and
improved descriptions. See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for:

- The node / edge data schema (`src/data/landscape.ts`)
- Step-by-step "How to add a model" walkthrough
- Coordinate and zone placement rules
- URL and description style conventions
- The curator review bar and PR checklist

Participation is governed by the
[Code of Conduct](./CODE_OF_CONDUCT.md). Report concerns to
`support@mliphub.com`.

Before opening a PR:

    npm run lint
    npm run check:landscape
    npm run build

---

## Capability metadata fields

Each model card carries three capability fields that drive the table-view
filters and compare view:

- **`supportsCharges`** (`boolean | null`) — whether the model can be
  conditioned on a total or atomic charge.
- **`supportsSpins`** (`boolean | null`) — whether the model can be
  conditioned on spin multiplicity / magnetic moments.
- **`elementsCovered`** (`string | null`) — free-form description of the
  elemental coverage. Either an explicit element list (`"H, C, N, O"`),
  a shorthand (`"all elements up to Z=94"`, `"89 elements"`), or `"—"` to
  mark explicitly unknown.

These fields are **required for new entries**; existing models where the
data is unknown carry `null` (or `"—"` for `elementsCovered`). See
[CONTRIBUTING.md](./CONTRIBUTING.md) for the full schema and the editorial
policy that governs capability fields.

---

## Editorial policy / governance

MLIP Hub is open and curator-reviewed. The [editorial policy
page](https://www.mliphub.com/policy) describes how new entries are accepted,
how lineage edges are decided, and what counts as a curator-reviewed
correction. The `lastReviewed` date on each model card records the most recent
curator pass.

---

## Roadmap

- Broaden capability metadata coverage (`supportsCharges`, `supportsSpins`,
  `elementsCovered`) on remaining pre-2024 models
- Per-model benchmark provenance pointers (without re-running benchmarks)
- Companion citation graph view derived from `paperUrl` references
- Optional persistence layer for community-suggested edges, gated by
  curator review

---
