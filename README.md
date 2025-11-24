# MLIP Hub – Interatomic Potential Explorer

Interactive map of machine-learning interatomic potentials (MLIPs), built with Next.js and Tailwind CSS.

The site ships as a static, curated dataset from `src/data/landscape.ts` so it can be hosted anywhere without a backend.

The app visualizes descriptor-based, invariant, equivariant, and transformer-style models as an explorable landscape with:

- **Zones** for different model families (classics/descriptors, equivariants, foundation models)
- **Nodes** for specific models (NequIP, Allegro, MACE, Orb-v3, CHGNet, etc.)
- **Edges** to show conceptual or architectural relationships
- A **detail sidebar** linking to code, papers, and web search
  
## Tech stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **Backend:** Static data served by Next.js App Router (no external API dependencies)
- **Deployment (recommended):** Vercel

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

## License

See [LICENSE](./LICENSE) for details (MIT recommended if you want this to be open source).

---

## Roadmap / ideas

- Optional persistence layer if you want live updates instead of the static dataset
- Add search over models and authors
- “Compare models” panel (accuracy, speed, invariance properties)
- Dark mode theme
- Better SEO text (intro to MLIPs, usage examples, references)

---
