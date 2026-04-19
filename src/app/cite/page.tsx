import type { Metadata } from "next";
import Link from "next/link";
import pkg from "../../../package.json";

export const metadata: Metadata = {
  title: "How to cite",
  description:
    "How to cite MLIP Hub and the underlying models. Includes preferred citation, BibTeX, and DOI information.",
  alternates: { canonical: "/cite" },
};

const version = (pkg as { version: string }).version;

const AUTHORS = "Le Lu and MLIP Hub contributors";
const YEAR = new Date().getFullYear();
const TITLE = "MLIP Hub: Interatomic Potential Explorer";
const URL = "https://www.mliphub.com";

const bibtex = `@software{mliphub_${YEAR},
  author  = {Lu, Le and {MLIP Hub contributors}},
  title   = {{${TITLE}}},
  version = {${version}},
  year    = {${YEAR}},
  url     = {${URL}},
  note    = {DOI pending — will be minted on first public release via Zenodo}
}`;

const plainCitation = `${AUTHORS}. (${YEAR}). ${TITLE} (Version ${version}) [Software]. ${URL}`;

export default function CitePage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12 text-slate-800 dark:text-slate-200 overflow-y-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">How to cite MLIP Hub</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Current version: <strong>{version}</strong>
      </p>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Two-level citation</h2>
        <p>
          MLIP Hub is a curated reference. We recommend a two-level citation:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <strong>Cite MLIP Hub</strong> when you use our map, taxonomy,
            curation decisions, or metadata organization.
          </li>
          <li>
            <strong>Cite the original model papers/software</strong> when you
            rely on a specific model scientifically — follow the{" "}
            <code>paperUrl</code> and <code>githubUrl</code> on each model
            card.
          </li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Preferred citation</h2>
        <pre className="whitespace-pre-wrap break-words bg-slate-100 dark:bg-slate-900 rounded-lg p-4 text-sm font-mono border border-slate-200 dark:border-slate-800">
{plainCitation}
        </pre>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">BibTeX</h2>
        <pre className="whitespace-pre overflow-x-auto bg-slate-100 dark:bg-slate-900 rounded-lg p-4 text-xs sm:text-sm font-mono border border-slate-200 dark:border-slate-800">
{bibtex}
        </pre>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">DOI</h2>
        <p className="text-sm">
          A DOI will be minted via{" "}
          <a
            href="https://zenodo.org"
            className="underline text-blue-600 dark:text-blue-400"
            target="_blank"
            rel="noreferrer"
          >
            Zenodo
          </a>{" "}
          on the next public release. Each release gets its own DOI, plus a
          concept DOI that always points to the latest version. Until then,
          cite by version and URL.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Machine-readable metadata</h2>
        <p className="text-sm">
          The repository ships a{" "}
          <a
            href="https://github.com/lulelaboratory/mlip-landscape/blob/main/CITATION.cff"
            className="underline text-blue-600 dark:text-blue-400"
            target="_blank"
            rel="noreferrer"
          >
            <code>CITATION.cff</code>
          </a>{" "}
          (read by GitHub&rsquo;s &ldquo;Cite this repository&rdquo; widget)
          and a{" "}
          <a
            href="https://github.com/lulelaboratory/mlip-landscape/blob/main/.zenodo.json"
            className="underline text-blue-600 dark:text-blue-400"
            target="_blank"
            rel="noreferrer"
          >
            <code>.zenodo.json</code>
          </a>{" "}
          (authoritative for Zenodo).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Versioned data snapshots</h2>
        <p className="text-sm">
          Download the exact dataset you cited:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <a
              href="/data/landscape-latest.json"
              className="underline text-blue-600 dark:text-blue-400"
            >
              landscape-latest.json
            </a>{" "}
            — always the current release.
          </li>
          <li>
            <a
              href={`/data/landscape-v${version}.json`}
              className="underline text-blue-600 dark:text-blue-400"
            >
              landscape-v{version}.json
            </a>{" "}
            — pinned to this version.
          </li>
        </ul>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          See{" "}
          <Link
            href="/contributors"
            className="underline text-blue-600 dark:text-blue-400"
          >
            Contributors
          </Link>{" "}
          for the list of citation authors and broader contributors.
        </p>
      </section>
    </article>
  );
}
