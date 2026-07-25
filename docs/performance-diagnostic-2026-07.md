# Performance diagnostic — July 2026

Investigation of the poor Vercel Speed Insights scores (Real Experience Score 40,
LCP 8.07 s, CLS 0.58, FCP 2.68 s, TTFB 1.01 s at p75 on desktop; `/` route worst
at 41). All numbers below were measured from a production build of this repo
(`next build`, Next 14.2.9) on 2026-07-25.

## TL;DR

The slowdown is **not** caused by traffic volume (~118 visitors/week is
negligible for a static site on a CDN) and a Vercel Pro upgrade would not
change any of these metrics. Every problem found is in the application itself,
and all of them are fixable in the repo:

| # | Finding | Metric it hurts | Severity |
|---|---------|-----------------|----------|
| 1 | Force-layout simulation runs eagerly during hydration (~2 s on a fast desktop CPU, likely 5–15 s on mid-range phones) even though the default "layered" view never uses it | LCP, INP, RES | **Critical** |
| 2 | SSR assumes a 1200×800 viewport; after hydration every card's `left`/`top` is recomputed for the real window size | CLS (0.58) | **Critical** |
| 3 | Homepage HTML is 969 KB (160 KB gzipped): model catalogue serialized 3–4× into every page | FCP, LCP, TTFB on slow links | High |
| 4 | Full 430 KB catalogue module ships in the client JS bundle for `/` and `/models` (~93 KB gz chunk) | FCP, LCP | Medium |
| 5 | Audience is Asia-heavy (TW/CN/JP/HK) where Vercel edge latency is inherently high; China routing is throttled | TTFB (1.01 s) | Not fixable in code |

## Details

### 1. `computeForcePositions` blocks the main thread during hydration

`src/components/MLIPExplorer.tsx` computes all three layouts on first render:

```ts
const forcePositions = useMemo(() => {
  ...
  return computeForcePositions(modelItems, edges);
}, [nodes, edges]);
```

`useMemo` executes eagerly during the first client render, regardless of
`layout === "layered"` (the default). The simulation is all-pairs repulsion —
121 models → 7,260 pairs × up to 1,200 ticks ≈ **8.7 M inner-loop iterations**,
each allocating a string key (`` `${a}|${b}` ``) for a `Set` lookup. A
standalone benchmark of the same loop shape measured **~2,070 ms on a
server-class CPU**; mid-range mobile devices are typically 3–6× slower. This
single computation plausibly accounts for most of the 8 s LCP: the page paints
(FCP 2.68 s), then hydration freezes the main thread for seconds before the
canvas settles.

**Fixes (pick one or combine):**
- Only compute force positions when `layout === "force"` is actually selected
  (lazy state + `useEffect`, show a brief "computing layout…" state).
- Precompute the force positions at build time in `scripts/export-landscape.ts`
  and ship them as data — the simulation is deterministic apart from the
  `Math.random()` jitter fallback, which can be seeded.
- Move the simulation into a Web Worker so it never blocks interaction.
- Cheap micro-fix while deciding: replace the per-pair string-key `Set` with a
  numeric adjacency matrix and hoist the `forces` allocation out of the tick
  loop (still leaves an O(N²·ticks) burn, so prefer the options above).

`computeTimelinePositions` and `computeCompactLayeredLayout` also run on every
mount but are linear and cheap — no action needed.

### 2. CLS 0.58: SSR viewport guess vs. real viewport

`MLIPExplorer.tsx` initialises `viewport` as `{ width: 1200, height: 800 }`
(line ~985) and only reads `window.innerWidth` in a mount effect. The static
HTML is therefore laid out for a 1200 px window. After hydration:

- `layeredColumnsPerBlock` (breakpoints 11/9/7/6/5/4) changes on almost every
  real device → `computeCompactLayeredLayout` re-wraps → every card's
  `style={{ left: node.x, top: node.y }}` (line ~3289) changes. `left`/`top`
  moves **count toward CLS** (unlike pure `transform` changes on the container).
- Layout mode is re-read from `localStorage` after mount, so returning
  visitors who chose force/timeline get a second full re-layout.
- `setFilterOpen(deviceType !== "mobile")` toggles the filter panel post-mount.

**Fixes:**
- Render the canvas as a client-only shell: keep the SSR output to a
  fixed-size container (the `sr-only` directory already provides the
  crawler/a11y content) and mount the interactive canvas inside it after the
  real viewport is known — moves inside an already-sized box produce no CLS.
- Alternatively, position cards with `transform: translate(x, y)` instead of
  `left`/`top` (transforms are excluded from CLS scoring), and reserve the
  canvas area with a fixed-height wrapper.
- Read `localStorage` layout preference in a pre-hydration inline script (as
  already done for the theme) so the first client render uses the right mode.

### 3. The catalogue is serialized 3–4× into every page's HTML

Production HTML sizes (`.next/server/app/`):

| Page | HTML size |
|------|-----------|
| `/` | **969 KB** (160 KB gz) |
| `/models` | 771 KB |
| `/compare` | 514 KB |
| `/learn` | 438 KB |
| `/_not-found` (404!) | 229 KB |

Homepage breakdown: 94 KB JSON-LD + 157 KB `sr-only` model directory + 354 KB
RSC flight payload (which duplicates both of the former) + 363 KB visible DOM
(the SSR'd canvas duplicates the catalogue a fourth time). The 94 KB JSON-LD
`ItemList` lives in `src/app/layout.tsx`, so **every** page — including the 404
— carries the full model list twice (HTML + flight payload).

**Fixes:**
- Move the `ItemList` structured data out of the layout into `/` only (or drop
  it entirely — the `Dataset` entry already points crawlers at
  `/data/landscape-latest.json`, and `/models` serves the same content as
  crawlable HTML).
- Slim the `sr-only` mirror (name/category/year/links are enough for SEO — the
  full descriptions already exist on `/models`), or drop it in favour of
  `/models` as the canonical crawlable list.
- These shrink the RSC flight payload proportionally for free.

### 4. Full catalogue module in the client bundle

`landscape.ts` (430 KB source) is imported by the `"use client"`
`MLIPExplorer` and `ModelsTable`, so the whole catalogue — including
curator-only fields like `evidenceNotes`, `verifiedSources`,
`*Evidence` strings — ships in the shared JS chunk
(369 KB raw / 93 KB gz). First Load JS: `/` = 205 KB gz, `/models` = 191 KB gz.

**Fix:** split the catalogue into "card data" (what the canvas and table
render) and "detail data" (loaded on demand when a model is selected, e.g.
dynamic import or fetch from the already-published
`/data/landscape-latest.json`). Roughly halves the route JS.

### 5. Geography, not load (and not the plan tier)

TTFB p75 of 1.01 s on a fully static, CDN-served site is dominated by where
visitors are: the top poor-score countries are Taiwan, China, Japan, Hong
Kong. Mainland-China traffic to Vercel is routinely slow or partially blocked,
and that is unaffected by plan tier. Traffic volume (118 visitors/week) is
orders of magnitude below anything that would degrade a static site.
Shrinking the HTML (finding 3) is the only in-repo lever that helps here.

## Suggested order of work

1. Gate/precompute the force simulation (finding 1) — biggest LCP/RES win,
   small diff.
2. Fix the hydration re-layout (finding 2) — takes CLS from 0.58 toward ~0.
3. De-duplicate the catalogue in HTML (finding 3) — cuts `/` HTML by ~½–⅔.
4. Split card vs. detail data (finding 4) — nice-to-have after 1–3.

Findings 1 + 2 alone should move RES from ~40 into the 80–95 band for most
visitors; no infrastructure change is required.

## Implemented (2026-07-25, this branch)

Findings 1–3 are fixed on this branch; measured against a fresh production
build with a headless-Chromium smoke test:

- **Force simulation** now runs lazily (only when the user selects the force
  layout), deferred behind a timeout, cached per session — and its hot loop
  was rewritten on flat typed arrays (no string-keyed Set, no per-tick
  allocations). Loop-shape benchmark: **2,071 ms → 72 ms (~29×)**. In the
  browser the force layout is ready ~300 ms after the click. Page load no
  longer runs it at all.
- **Canvas is client-mounted** after the real viewport is measured, replacing
  a fixed-position "Preparing the map…" placeholder; cards never render at
  the guessed 1200×800 geometry and then jump. Measured CLS on load:
  **0.016 (mobile 390 px), 0.0001 (desktop 1440 px)** — field p75 was 0.58.
- **Catalogue de-duplication**: per-model `ItemList` JSON-LD removed from the
  root layout (microdata on the home directory and `/models` remain), and the
  home page's `sr-only` directory slimmed to name/category/year/author/
  description/links. HTML sizes (raw): `/` **969 → 326 KB**, `/models`
  771 → 561 KB, `/compare` 514 → 311 KB, `/learn` 438 → 237 KB, 404
  229 → 32 KB.
- Verified in-browser: layered/force/timeline switching, detail panel,
  `?model=` deep links, and persisted-layout reloads all behave as before.

Finding 4 (card vs. detail data split) remains open as a follow-up.
