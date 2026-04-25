# MLIP Hub: Interatomic Potential Explorer

[![CI](https://github.com/lulelaboratory/mlip-landscape/actions/workflows/ci.yml/badge.svg)](https://github.com/lulelaboratory/mlip-landscape/actions/workflows/ci.yml)
<!-- DOI badge: replace <ZENODO_RECORD_ID> after the first Zenodo release mints a concept DOI.
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.<ZENODO_RECORD_ID>.svg)](https://doi.org/10.5281/zenodo.<ZENODO_RECORD_ID>)
-->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![DOI](https://zenodo.org/badge/1101966189.svg)](https://doi.org/10.5281/zenodo.19767545)


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

The current public release is **v0.3.0**, the snapshot referenced by the
companion arXiv manuscript. The version described in the arXiv paper
corresponds to MLIP Hub **v0.3.0**; subsequent releases extend it but should be
considered moving targets. Pin to v0.3.0 (or the matching dataset snapshot
under `public/data/landscape-v0.3.0.{json,csv}`) for exact reproducibility.

A DOI for the v0.3.0 archive will be minted via Zenodo on first public release;
the citation page and `CITATION.cff` will be updated once the DOI is
available.

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
- **Nodes** for specific models (NequIP, Allegro, MACE, Orb-v3, CHGNet, …)
- **Edges** capturing the conceptual / architectural lineage between them,
  with hover tooltips describing the relationship and a label on/off toggle
- A **layout switcher** with the curated *Layered* view as the default and
  an optional *Force-directed* view marked **Experimental** (built-in
  deterministic simulation, no extra runtime dependency); the chosen layout
  persists across navigation and reloads via the `?layout=` query parameter
  and `localStorage`. The version cited in the arXiv paper uses the
  layered layout.
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

To reproduce the v0.3.0 snapshot locally:

    git clone https://github.com/lulelaboratory/mlip-landscape.git
    cd mlip-landscape
    git checkout v0.3.0
    npm install
    npm run check:landscape
    npm run export:landscape
    npm run build
    npm run start

The exported dataset matches the files committed under
`public/data/landscape-v0.3.0.*` and the JSON served by the live site.

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
