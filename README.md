# MLIP Hub – Interatomic Potential Explorer

[![CI](https://github.com/lulelaboratory/mlip-landscape/actions/workflows/ci.yml/badge.svg)](https://github.com/lulelaboratory/mlip-landscape/actions/workflows/ci.yml)
<!-- DOI badge: replace <ZENODO_RECORD_ID> after the first Zenodo release mints a concept DOI.
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.<ZENODO_RECORD_ID>.svg)](https://doi.org/10.5281/zenodo.<ZENODO_RECORD_ID>)
-->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Interactive map of machine-learning interatomic potentials (MLIPs), built with Next.js and Tailwind CSS.

**Live:** [https://www.mliphub.com](https://www.mliphub.com)
· [Cite](https://www.mliphub.com/cite)
· [Editorial policy](https://www.mliphub.com/policy)
· [Contributors](https://www.mliphub.com/contributors)
· [Contribute](https://www.mliphub.com/contribute)

The site ships as a static, curated dataset from `src/data/landscape.ts` so it can be hosted anywhere without a backend.

The app visualizes descriptor-based, invariant, equivariant, and transformer-style models as an explorable landscape with:

- **Zones** for different model families (classics/descriptors, equivariants, foundation models)
- **Nodes** for specific models (NequIP, Allegro, MACE, Orb-v3, CHGNet, etc.)
- **Edges** to show conceptual or architectural relationships, with hover tooltips and an on/off toggle for the labels
- A **layout switcher** with a curated *Layered* view and a draggable
  *Force-directed* view (a built-in d3-style force simulation, no extra
  dependency); the chosen layout is preserved across navigation and reloads
- A **"Cite current selection"** button that copies a citation for the
  current view (filters, layout, selected model) to the clipboard
- A **detail sidebar** linking to code, papers, and web search
- Per-model metadata for charge / spin support and elemental coverage,
  surfaced in the table and compare views, with a CSV download for the
  side-by-side comparison
  
## Tech stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **Backend:** Static data served by Next.js App Router (no external API dependencies)
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

No environment variables are required for the static site. If you add new integrations later, copy `.env.local.example` and fill in whatever values you need.

### 4. Run in development

    npm run dev

Then open:

    http://localhost:3000

You should see the MLIP Hub map with zones and colored nodes.
Click a node to open the detail sidebar and see links to GitHub, papers, and web search.

---

## Project structure (key files)

    src/
      app/
        layout.tsx              # Root layout with Tailwind import
        page.tsx                # Renders the MLIPExplorer component
        globals.css             # Global styles (Tailwind 4 style)
      components/
        MLIPExplorer.tsx        # Main interactive canvas (nodes, edges, filters, sidebar)
      data/
        landscape.ts            # Node + edge definitions for MLIP models and zones

---

## Deployment (Vercel recommended)

1. Push this repo to GitHub.
2. Connect it to Vercel.
Your production URL will look like:

    https://mlip-hub-yourname.vercel.app

Later, you can add a custom domain if you want.

---

## Running tests / checks

For now, a basic CI can simply run:

    npm run lint
    npm run build

See `.github/workflows/ci.yml` below for a ready-to-use GitHub Actions workflow.

---

## Citing MLIP Hub

MLIP Hub is a **curated scientific software + data product**. We recommend a
two-level citation:

- **Cite MLIP Hub** when you use our map, taxonomy, curation decisions, or
  metadata organization.
- **Also cite the original model papers/software** when you rely on a specific
  model scientifically — follow each model card's `paperUrl` and `githubUrl`.

The repository ships [`CITATION.cff`](./CITATION.cff) (read by GitHub's "Cite
this repository" widget) and [`.zenodo.json`](./.zenodo.json) (authoritative
for Zenodo). Starting with `v0.2.0`, each tagged release is archived on Zenodo
with its own DOI plus a concept DOI pointing at the latest version.

Versioned data snapshots are published under `public/data/` and served at
`/data/landscape-v<version>.json`, `/data/landscape-latest.json`, and a sibling
CSV — so users can cite the exact dataset they used.

See [`/cite`](https://www.mliphub.com/cite) for the preferred citation text
and BibTeX, and [`CONTRIBUTORS.md`](./CONTRIBUTORS.md) for the separation
between citation authors and the broader contributor community.

---

## License

See [LICENSE](./LICENSE) for details (MIT recommended if you want this to be open source).

---

## Contributing

We welcome contributions — especially new model entries, corrected links, and improved descriptions. See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for:

- The node / edge data schema (`src/data/landscape.ts`)
- Step-by-step "How to add a model" walkthrough
- Coordinate and zone placement rules
- URL and description style conventions
- The curator review bar and PR checklist

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

## Roadmap / ideas

- Optional persistence layer if you want live updates instead of the static dataset
- Add search over models and authors
- “Compare models” panel (accuracy, speed, invariance properties)
- Dark mode theme
- Better SEO text (intro to MLIPs, usage examples, references)

---
