# MLIP Landscape – Interatomic Potential Explorer

Interactive map of machine-learning interatomic potentials (MLIPs), built with Next.js and Tailwind CSS.

The site ships as a static, curated dataset from `src/data/landscape.ts` so it can be hosted anywhere without a backend.

The app visualizes descriptor-based, invariant, equivariant, and transformer-style models as an explorable landscape with:

- **Zones** for different model families (classics/descriptors, equivariants, foundation models)
- **Nodes** for specific models (NequIP, Allegro, MACE, Orb-v3, CHGNet, etc.)
- **Edges** to show conceptual or architectural relationships
- A **detail sidebar** linking to code, papers, and web search
- Optional **Google AdSense** banner placement

## Tech stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **Backend:** Static data served by Next.js App Router
- **Auth/Secrets:** Environment variables (`.env.local`)
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

Create a file named `.env.local` in the project root:

    NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx

- `NEXT_PUBLIC_ADSENSE_CLIENT_ID` – your AdSense publisher ID (optional in development).

You can also use the provided `.env.local.example` as a template (see below).

### 4. Run in development

    npm run dev

Then open:

    http://localhost:3000

You should see the MLIP landscape with zones and colored nodes.
Click a node to open the detail sidebar and see links to GitHub, papers, and web search.

---

## Project structure (key files)

    src/
      app/
        layout.tsx              # Root layout with Tailwind import + AdSense script
        page.tsx                # Renders the MLIPExplorer component
        globals.css             # Global styles (Tailwind 4 style)
      components/
        MLIPExplorer.tsx        # Main interactive canvas (nodes, edges, filters, sidebar)
        AdBanner.tsx            # Reusable Google AdSense banner component
      data/
        landscape.ts            # Node + edge definitions for MLIP models and zones

---

## Deployment (Vercel recommended)

1. Push this repo to GitHub.
2. Connect it to Vercel.
3. Add environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_ADSENSE_CLIENT_ID` (optional)

Your production URL will look like:

    https://mlip-landscape-yourname.vercel.app

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
