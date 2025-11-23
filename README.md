# MLIP Landscape – Interatomic Potential Explorer

Interactive map of machine-learning interatomic potentials (MLIPs), built with Next.js and Tailwind CSS.

The app visualizes descriptor-based, invariant, equivariant, and transformer-style models as an explorable landscape with:

- **Zones** for different model families (classics/descriptors, equivariants, foundation models)
- **Nodes** for specific models (NequIP, Allegro, MACE, Orb-v3, CHGNet, etc.)
- **Edges** to show conceptual or architectural relationships
- A **detail sidebar** linking to code, papers, and web search
- Hooks for **daily automatic updates** using the OpenAI API
- Optional **Google AdSense** banner placement

## Tech stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **Backend:** Next.js API route for daily MLIP updates via OpenAI
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

    OPENAI_API_KEY=sk-your-openai-key
    CRON_SECRET=some-long-random-secret
    NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx

- `OPENAI_API_KEY` – used by `/api/update-landscape` to fetch new MLIP models.
- `CRON_SECRET` – simple shared secret so only your cron job can hit the update route.
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
        api/
          update-landscape/
            route.ts            # API route: daily update hook using OpenAI
      components/
        MLIPExplorer.tsx        # Main interactive canvas (nodes, edges, filters, sidebar)
        AdBanner.tsx            # Reusable Google AdSense banner component
      data/
        landscape.ts            # Node + edge definitions for MLIP models and zones

---

## Daily auto-update (OpenAI API)

The route `src/app/api/update-landscape/route.ts`:

- Accepts `GET /api/update-landscape?secret=CRON_SECRET`
- Uses `OPENAI_API_KEY` to call OpenAI and ask for **new MLIP models**
- Returns JSON like:

    {
      "newModels": [
        {
          "id": "some_id",
          "label": "Some New Model",
          "year": 2025,
          "author": "Some Lab",
          "category": "Transformer",
          "desc": "Short description...",
          "githubUrl": "https://github.com/...",
          "paperUrl": "https://arxiv.org/..."
        }
      ]
    }

At the moment, this response is **not yet persisted**. To make it truly “live” you would:

1. Add a database (e.g. Supabase, Neon/Postgres, or Vercel KV).
2. On each cron run:
   - Fetch current models from DB
   - Merge `newModels` into the DB
3. In the frontend, load nodes from the DB instead of the static `INITIAL_NODES`.

---

## Deployment (Vercel recommended)

1. Push this repo to GitHub.
2. Connect it to Vercel.
3. Add environment variables in the Vercel dashboard:
   - `OPENAI_API_KEY`
   - `CRON_SECRET`
   - `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
4. Set up a **cron job** in Vercel:

   - Schedule: once per day
   - Target: `GET /api/update-landscape?secret=CRON_SECRET`

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

- Persist daily updates in a real DB instead of static data
- Add search over models and authors
- “Compare models” panel (accuracy, speed, invariance properties)
- Dark mode theme
- Better SEO text (intro to MLIPs, usage examples, references)

---
